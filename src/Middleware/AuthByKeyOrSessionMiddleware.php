<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use DateTime;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use VBCompetitions\CompetitionsAPI\Config;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

class AuthByKeyOrSessionMiddleware implements MiddlewareInterface
{
    private Config $config;

    public function __construct(Config $config) {
        $this->config = $config;
    }

    public function process(ServerRequestInterface $req, RequestHandlerInterface $handler) : ResponseInterface
    {
        $context = $req->getAttribute('context');

        // Read in users file
        $users_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);
        if ($users_data === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Authentication Error', ErrorMessage::INTERNAL_ERROR_CODE, null);
        }

        // TODO - first 8? chars are a lookup that points to
        //        a hash of the rest of the key and the key ID
        //  verifying has to pass like a password check
        // API Keys are in the header:
        //   Authorization: Bearer APIKeyV1 XXXXX
        if ($req->hasHeader('authorization') || $req->hasHeader('Authorization')) {
            // read in keys file
            $keys_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
            $h = fopen($keys_file, 'r');
            $json = fread($h, filesize($keys_file));
            fclose($h);
            $keys_data = json_decode($json);

            if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
                // Invalid api keys file
                sleep(2);
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, null);
            }

            $auth_headers = [];
            if ($req->hasHeader('authorization')) {
                foreach($req->getHeader('authorization') as $auth_header) {
                    array_push($auth_headers, $auth_header);
                }
            }
            if ($req->hasHeader('Authorization')) {
                foreach($req->getHeader('Authorization') as $auth_header) {
                    array_push($auth_headers, $auth_header);
                }
            }

            foreach ($auth_headers as $auth_header) {
                $auth_parts = explode(' ', $auth_header, 3);

                if (count($auth_parts) !== 3) {
                    // Invalid Authorization header
                    sleep(2);
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                if ($auth_parts[0] !== 'Bearer') {
                    // Invalid Authorization type
                    sleep(2);
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                if ($auth_parts[1] !== 'APIKeyV1') {
                    // Invalid Key type
                    sleep(2);
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                $api_key_prefix = substr($auth_parts[2], 0, 8);
                $api_key_value = substr($auth_parts[2], 8);
                if (!property_exists($keys_data->lookup->v1, $api_key_prefix)) {
                    // No such Key
                    sleep(2);
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                if (!password_verify($api_key_value, $keys_data->lookup->v1->$api_key_prefix->hash)) {
                    // Key invalid
                    sleep(2);
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                $key_id = $keys_data->lookup->v1->$api_key_prefix->id;
                $key_entry = $keys_data->keys->$key_id;
                $key_entry->lastUsed = (new DateTime())->format('c');
                $user_id = $key_entry->user;
                if (property_exists($users_data->users, 'app')) {
                    $context->setAppName($users_data->users->app);
                } else {
                    $context->setAppName('VBC');
                }
                $context->setUserID($user_id);
                $context->setUserName($users_data->users->$user_id->username);

                $keys_file_backup = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
                copy($keys_file, $keys_file_backup);
                $h = fopen($keys_file, 'w');
                fwrite($h, json_encode($keys_data, JSON_PRETTY_PRINT));
                fclose($h);

                $users_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
                $h = fopen($users_file, 'r');
                $json = fread($h, filesize($users_file));
                fclose($h);
                $users_data = json_decode($json);

                if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
                    return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, null);
                }

                // Check if user exists and is active
                if (!property_exists($users_data->users, $user_id) || $users_data->users->$user_id->state !== 'active') {
                    return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
                }

                $req = $req->withAttribute('roles', $users_data->users->$user_id->roles);
                return $handler->handle($req);
            }
        }

        // session tokens are in a cookie with the name defined by Config::SESSION_COOKIE
        $cookies = $req->getCookieParams();
        if (array_key_exists(Config::SESSION_COOKIE, $cookies)) {
            session_save_path($this->config->getSessionDir());
            session_name(Config::SESSION_COOKIE);
            session_start();
            if (!isset($_SESSION['valid']) || $_SESSION['valid'] != true) {
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
            }

            if ($users_data === null) {
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Authentication Error', ErrorMessage::INTERNAL_ERROR_CODE, null);
            }

            // Check if user exists and is active
            if (!property_exists($users_data->users, $_SESSION['user_id']) || $users_data->users->{$_SESSION['user_id']}->state !== 'active') {
                // The user has been deleted!
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
            }

            if (property_exists($users_data->users, 'app')) {
                $context->setAppName($users_data->users->app);
            } else {
                $context->setAppName('VBC');
            }
            $context->setUserID($_SESSION['user_id']);
            $context->setUserName($_SESSION['username']);
            $req = $req->withAttribute('roles', $users_data->users->{$_SESSION['user_id']}->roles);
            return $handler->handle($req);
        }

        // No valid key + no session = 401
        return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
    }
}
