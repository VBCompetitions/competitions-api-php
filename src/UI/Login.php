<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use Slim\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface as Request;
// use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use VBCompetitions\CompetitionsAPI\AppConfig;
use DateTime;

final class Login
{
    public static function verifyPassword(AppConfig $config, Request $req, Response $res)
    {
        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);
        if ($users_data === null) {
            // TODO use standard ErrorMessage stuff?
            $res->getBody()->write('Internal Server Error');
            $res = $res->withHeader('location', $config->getBasePath().'/login')->withStatus(512);
            return $res;
        }

        $body_params = (array)$req->getParsedBody();

        if (!property_exists($users_data->lookup, $body_params['login-username'])) {
            // username not in the lookup list - no such user
            sleep(2);
            $res = $res->withHeader('location', $config->getBasePath().'/login')->withStatus(302);
            return $res;
        }

        $user_id = $users_data->lookup->{$body_params['login-username']};

        if (!property_exists($users_data->users, $user_id)) {
            // user ID not in the users list - users file is inconsistent
            $res->getBody()->write('Internal Server Error');
            $res = $res->withHeader('location', $config->getBasePath().'/login')->withStatus(512);
            return $res;
        }

        $user = $users_data->users->{$user_id};

        if ($user->state !== 'active') {
            // user is not set as "active"
            sleep(2);
            $res = $res->withHeader('location', $config->getBasePath().'/login')->withStatus(302);
            return $res;
        }

        $password = $body_params['login-password'];
        if (!password_verify($password, $user->{'hash-v1'})) {
            // password is invalid
            sleep(2);
            $res = $res->withHeader('location', $config->getBasePath().'/ui/login')->withStatus(302);
            return $res;
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
        session_name('VBCSESSION');
        session_set_cookie_params(57600, null, null, false, true);
        session_start();
        // Expensive, but there's only one account with infrequent login, and leaking sessions due to crashing clients is less desirable
        // Only do this after we've verified, so someone can't DOS us with bad passwords triggering lots of GC
        session_gc();
        $_SESSION['valid'] = true;
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $user->username;

        $return_to = '/ui/c';
        // TODO - need to make sure this is secure.  It should really be a cookie that we set or something
        // See https://www.virtuesecurity.com/kb/url-redirection-attack-and-defense/
        $query_params = (array)$req->getQueryParams();
        if (array_key_exists('returnTo', $query_params)) {
            $return_to = $query_params['returnTo'];
        }

        $res = $res->withHeader('location', $config->getBasePath().$return_to)->withStatus(302);
        return $res;
    }

    public static function logout(AppConfig $config, Response $res)
    {
        session_save_path($config->getSessionDir());
        session_name('VBCSESSION');
        session_start();
        session_unset();
        session_destroy();
        setcookie (session_name(), "", time() - 3600, '/');
        // TODO make the return URL after logout configurable
        $res = $res->withHeader('location', $config->getBasePath().'/ui')->withStatus(302);
        return $res;
    }
}
