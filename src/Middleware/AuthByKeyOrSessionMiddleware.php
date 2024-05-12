<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use DateTime;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

class AuthByKeyOrSessionMiddleware implements MiddlewareInterface
{
    private AppConfig $config;

    public function __construct(AppConfig $config) {
        $this->config = $config;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler) : ResponseInterface
    {
        // TODO - first 8? chars are a lookup that points to
        //        a hash of the rest of the key and the key ID
        //  verifying has to pass like a password check
        // API Keys are in the header:
        //   Authorization: APIKeyV1 XXXXX
        if ($request->hasHeader('Authorization')) {
            // read in keys file
            $keys_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
            $h = fopen($keys_file, 'r');
            $json = fread($h, filesize($keys_file));
            fclose($h);
            $keys_data = json_decode($json);

            if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
                // Invalid api keys file
                sleep(2);
                return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, null);
            }

            foreach ($request->getHeader('authorization') as $auth_header) {
                $auth_parts = explode(' ', $auth_header, 2);

                if (count($auth_parts) !== 2) {
                    // Invalid Authorization header
                    sleep(2);
                    return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
                }

                if ($auth_parts[0] !== 'APIKeyV1') {
                    // Invalid Key type
                    sleep(2);
                    return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
                }

                $api_key_prefix = substr($auth_parts[1], 0, 8);
                $api_key_value = substr($auth_parts[1], 8);
                if (!property_exists($keys_data->lookup->v1, $api_key_prefix)) {
                    // No such Key
                    sleep(2);
                    return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
                }

                if (!password_verify($api_key_value, $keys_data->lookup->v1->$api_key_prefix->hash)) {
                    // Key invalid
                    sleep(2);
                    return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
                }

                $key_id = $keys_data->lookup->v1->$api_key_prefix->id;
                $key_entry = $keys_data->keys->$key_id;
                $key_entry->lastUsed = (new DateTime())->format('c');
                $user_id = $key_entry->user;

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
                    return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, null);
                }

                // Check if user already exists
                if (!property_exists($users_data->users, $user_id) || $users_data->users->$user_id->state !== 'active') {
                    return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
                }

                $request = $request->withAttribute('roles', $users_data->users->$user_id->roles);
                return $handler->handle($request);
            }
        }

        // session tokens are in a cookie with the name defined by AppConfig::SESSION_COOKIE
        $cookies = $request->getCookieParams();
        if (array_key_exists(AppConfig::SESSION_COOKIE, $cookies)) {
            session_save_path($this->config->getSessionDir());
            session_name(AppConfig::SESSION_COOKIE);
            session_start();
            if (!isset($_SESSION['valid']) || $_SESSION['valid'] != true) {
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
            }

            $users_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
            $h = fopen($users_file, 'r');
            $json = fread($h, filesize($users_file));
            fclose($h);
            $users_data = json_decode($json);
            if ($users_data === null) {
                return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Authentication Error', ErrorMessage::INTERNAL_ERROR_TEXT, null);
            }

            if (!property_exists($users_data->users, $_SESSION['user_id'])) {
                // The user has been deleted!
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
            }

            $request = $request->withAttribute('roles', $users_data->users->{$_SESSION['user_id']}->roles);
            return $handler->handle($request);
        }

        // No valid key + no session = 401
        return ErrorMessage::respondWithError(ErrorMessage::UNAUTHORIZED_CODE, 'Authentication Error', ErrorMessage::UNAUTHORIZED_TEXT, null);
    }
}
