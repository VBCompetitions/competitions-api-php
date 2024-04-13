<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use stdClass;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

// Errorcodes 011FN
final class Account
{
    public static function getAccount(AppConfig $config, Request $_, Response $res) : Response
    {
        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users') || !property_exists($users_data, 'pending')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01110');
        }

        $user_id = $_SESSION['user_id'];

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01111');
        }

        $user_info = $users_data->users->$user_id;
        unset($user_info->{'hash-v1'});

        $res->getBody()->write(json_encode($user_info));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getUsernameFromLinkID(AppConfig $config, string $link_id, Request $req, Response $res) : Response
    {
        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users') || !property_exists($users_data, 'pending')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01120');
        }

        if (!property_exists($users_data->pending, $link_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No matching link ID', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01121');
        }

        $user = new stdClass();
        $user->username = $users_data->pending->$link_id;

        $res->getBody()->write(json_encode($user));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateAccount(AppConfig $config, Request $req, Response $res) : Response
    {
        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users') || !property_exists($users_data, 'pending')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01130');
        }

        $user_id = $_SESSION['user_id'];

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01131');
        }

        $body_params = (array)$req->getParsedBody();

        // username change
        if (array_key_exists('newUsername', $body_params)) {
            $current_username = $users_data->users->$user_id->username;
            $new_username = $body_params['newUsername'];

            if (strlen($new_username) <= 0 || strlen($new_username) > 50 || !preg_match('/^((?![":{}?= ])[\x20-\x7F])+$/', $new_username)) {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid username', ErrorMessage::BAD_REQUEST_TEXT, '01132');
            }

            if ($users_data->users->$user_id->username === 'admin') {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Cannot change name of "admin" user', ErrorMessage::BAD_REQUEST_TEXT, '01133');
            }

            if (property_exists($users_data->lookup, $new_username)) {
                return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_EXISTS_CODE, 'Username already taken', ErrorMessage::RESOURCE_EXISTS_TEXT, '01134');
            }

            $users_data->users->$user_id->username = $new_username;
            $users_data->lookup->$new_username = $users_data->lookup->$current_username;
            unset($users_data->lookup->$current_username);
        }

        // password change
        if (array_key_exists('newPassword', $body_params)) {
            $new_password = $body_params['newPassword'];

            // The regex imposes the length limits of min 8, max 50
            if (!preg_match('/^[a-zA-Z0-9!"#£$%&\'()*+,.:;<=>?@[^_`{|}~\/\-\\]]{8,50}$/', $new_password)) {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid password', ErrorMessage::BAD_REQUEST_TEXT, '0135');
            }

            $users_data->users->$user_id->{'hash-v1'} = password_hash($new_password, PASSWORD_BCRYPT);
        }

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        return $res->withStatus(200);
    }

    public static function activateAccount(AppConfig $config, string $link_id, Request $req, Response $res) : Response
    {
        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users') || !property_exists($users_data, 'pending')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01140');
        }

        if (!property_exists($users_data->pending, $link_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No matching link ID', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01141');
        }

        $body_params = (array)$req->getParsedBody();
        $password = $body_params['password'];

        if (!preg_match('/^[a-zA-Z0-9!"#£$%&\'()*+,.:;<=>?@[^_`{|}~\/\-\\]]{8,50}$/', $password)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Bad password', ErrorMessage::BAD_REQUEST_TEXT, '01142');
        }

        $username = $users_data->pending->$link_id;
        $user_id = $users_data->lookup->$username;
        unset($users_data->pending->$link_id);
        $users_data->users->$user_id->state = 'active';
        $users_data->users->$user_id->{'hash-v1'} = password_hash($password, PASSWORD_BCRYPT);
        $users_data->users->$user_id->lastLogin = (new DateTime())->format('c');
        unset($users_data->users->$user_id->linkID);

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        // TODO - set their session as logged in with this user
        $res = $res->withHeader('location', $config->getBasePath().'/ui')->withStatus(302);
        return $res;
    }
}
