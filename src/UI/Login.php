<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\CompetitionsAPI\{
    Config,
    UI\App
};

final class Login
{
    public static function verifyPassword(Config $config, Request $req, Response $res)
    {
        $context = $req->getAttribute('context');

        $retry_url = $config->getBasePath().'/ui/login';
        $query_params = (array)$req->getQueryParams();
        if (array_key_exists('returnTo', $query_params)) {
            $retry_url = $retry_url.'?returnTo='.$query_params['returnTo'];
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);
        if ($users_data === null) {
            // TODO use standard ErrorMessage stuff?
            $res->getBody()->write('Internal Server Error');
            $res = $res->withHeader('location', $retry_url)->withStatus(512);
            return $res;
        }

        $body_params = (array)$req->getParsedBody();

        if (!property_exists($users_data->lookup, $body_params['login-username'])) {
            // username not in the lookup list - no such user
            sleep(2);
            $res = $res->withHeader('location', $retry_url)->withStatus(302);
            return $res;
        }

        $user_id = $users_data->lookup->{$body_params['login-username']};

        if (!property_exists($users_data->users, $user_id)) {
            // user ID not in the users list - users file is inconsistent
            $res->getBody()->write('Internal Server Error');
            $res = $res->withHeader('location', $retry_url)->withStatus(512);
            return $res;
        }

        $user = $users_data->users->{$user_id};

        if ($user->state !== 'active') {
            // user is not set as "active"
            sleep(2);
            $res = $res->withHeader('location', $retry_url)->withStatus(302);
            return $res;
        }

        $password = $body_params['login-password'];
        if (!password_verify($password, $user->{'hash-v1'})) {
            // password is invalid
            sleep(2);
            $res = $res->withHeader('location', $retry_url)->withStatus(302);
            return $res;
        }

        // Default the return path pack to VBC
        $return_to = $config->getBasePath().'/ui/c';
        $app_found = false;

        // Check if the user is associated with an app
        if (property_exists($users_data->users->$user_id, 'app')) {
            $apps = [];
            $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
            if ($apps_file === false) {
                $context->getLogger()->info('Request to get the list of Apps but none have been defined and there are no apps defined');
                $res->getBody()->write('Internal Server Error');
                $res = $res->withHeader('location', $retry_url)->withStatus(512);
                return $res;
            }

            $apps_json = file_get_contents($apps_file);
            if ($apps_json === false) {
                $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
                $res->getBody()->write('Internal Server Error');
                $res = $res->withHeader('location', $retry_url)->withStatus(512);
                return $res;
            }

            $apps_data = json_decode($apps_json);
            if (!is_array($apps_data)) {
                $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
                $res->getBody()->write('Internal Server Error');
                $res = $res->withHeader('location', $retry_url)->withStatus(512);
                return $res;
            }

            try {
                foreach ($apps_data as $app_data) {
                    array_push($apps, new App($app_data));
                }
            } catch (Throwable $err) {
                $context->getLogger()->error('Failed to parse the apps configuration: '.$err->getMessage());
                $res->getBody()->write('Internal Server Error');
                $res = $res->withHeader('location', $retry_url)->withStatus(512);
                return $res;
            }

            foreach ($apps as $app) {
                if ($app->getName() === $users_data->users->$user_id->app) {
                    $app_found = true;
                    $return_to = $app->getRootPath();
                    break;
                }
            }
            if (!$app_found) {
                $context->getLogger()->error('Failed to find the specified App with ID "'.$users_data->users->$user_id->app.'"');
                $res->getBody()->write('Internal Server Error');
                $res = $res->withHeader('location', $retry_url)->withStatus(512);
                return $res;
            }
        }

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $users_data->users->{$user_id}->lastLogin = (new DateTime())->format('c');
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        // Create the session
        session_save_path($config->getSessionDir());
        // Session lasts 16 hours
        session_name(Config::SESSION_COOKIE);
        session_set_cookie_params(57600, null, null, false, true);
        session_start();
        // Expensive, but there's only one account with infrequent login, and leaking sessions due to crashing clients is less desirable
        // Only do this after we've verified, so someone can't DOS us with bad passwords triggering lots of GC
        session_gc();
        $_SESSION['valid'] = true;
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $user->username;

        // TODO - need to make sure this is secure.  It should really be a cookie that we set or something
        // See https://www.virtuesecurity.com/kb/url-redirection-attack-and-defense/
        $query_params = (array)$req->getQueryParams();
        if (array_key_exists('returnTo', $query_params)) {
            if ($app_found) {
                if (str_starts_with($query_params['returnTo'], $return_to)) {
                    $return_to = $query_params['returnTo'];
                }
            } else {
                $return_to = $config->getBasePath().$query_params['returnTo'];
            }
        }

        $res = $res->withHeader('location', $return_to)->withStatus(302);
        return $res;
    }

    public static function logout(Config $config, Response $res)
    {
        $return_path = $config->getBasePath().'/ui';
        session_save_path($config->getSessionDir());
        session_name(Config::SESSION_COOKIE);
        session_start();
        session_unset();
        session_destroy();
        setcookie (session_name(), "", time() - 3600, '/');
        // TODO make the return URL after logout configurable
        $res = $res->withHeader('location', $return_path)->withStatus(302);
        return $res;
    }
}
