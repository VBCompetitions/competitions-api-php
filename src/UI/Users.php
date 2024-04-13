<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use stdClass;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;
use VBCompetitions\CompetitionsAPI\States;

// Errorcodes 010FN
final class Users
{
    public static function getUsers(AppConfig $config, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::get())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01002');
        }

        $user_list = [];

        foreach (get_object_vars($users_data->lookup) as $username => $user_id) {
            if (!property_exists($users_data->users, $user_id)) {
                return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01003');
            }
            $user = new stdClass();
            $user->username = $username;
            $user->id = $user_id;
            $user->lastLogin = $users_data->users->$user_id->lastLogin;
            $user->created = $users_data->users->$user_id->created;
            $user->roles = $users_data->users->$user_id->roles;
            $user->state = $users_data->users->$user_id->state;
            if ($user->state === States::PENDING) {
                $user->linkID = $users_data->users->$user_id->linkID;
            }

            array_push($user_list, $user);
        }

        $res->getBody()->write(json_encode($user_list));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createUser(AppConfig $config, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::create())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '01001');
        }

        $body_params = (array)$req->getParsedBody();
        $username = $body_params['username'];

        // check username is valid must contain only ASCII printable characters excluding " : { } ? =
        if (!preg_match('/^((?![":{}?= ])[\x20-\x7F])+$/', $username)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid username: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_TEXT, '01003');
        }

        // Check requested roles are valid
        foreach($body_params['roles'] as $requested_roles) {
            if (!in_array($requested_roles, Roles::_ALL)) {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Role does not exist', ErrorMessage::BAD_REQUEST_TEXT, '01011');
            }
        }

        // List the requested roles
        $roles = [];
        foreach(Roles::_ALL as $available_role) {
            if (in_array($available_role, $body_params['roles'])) {
                array_push($roles, $available_role);
            }
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01012');
        }

        // Check if user already exists
        if (property_exists($users_data->lookup, $username)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_EXISTS_CODE, 'User already exists', ErrorMessage::RESOURCE_EXISTS_TEXT, '01013');
        }

        $user_id = Uuid::uuid4()->toString();
        $link_id = Uuid::uuid4()->toString();

        $new_user = new stdClass();
        $new_user->username = $username;
        $new_user->state = 'pending';
        $new_user->roles = $roles;
        $new_user->lastLogin = '';
        $new_user->linkID = $link_id;
        $new_user->created = (new DateTime())->format('c');

        $users_data->lookup->$username = $user_id;
        $users_data->users->$user_id = $new_user;
        $users_data->pending->$link_id = $username;

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        $new_user->id = $user_id;
        $res->getBody()->write(json_encode($new_user));
        return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public static function updateUser(AppConfig $config, string $user_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::update())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01021');
        }

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01022');
        }

        // Cannot modify the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid call', ErrorMessage::BAD_REQUEST_TEXT, '01023');
        }

        $body_params = (array)$req->getParsedBody();

        // Check requested roles are valid
        foreach($body_params['roles'] as $requested_roles) {
            if (!in_array($requested_roles, Roles::_ALL)) {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Role does not exist', ErrorMessage::BAD_REQUEST_TEXT, '01024');
            }
        }

        // Check requested state is valid
        if (!in_array($body_params['state'], States::_LIST_ALL)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'State does not exist', ErrorMessage::BAD_REQUEST_TEXT, '01025');
        }

        // List the requested roles
        $roles = [];
        foreach(Roles::_ALL as $available_role) {
            if (in_array($available_role, $body_params['roles'])) {
                array_push($roles, $available_role);
            }
        }
        // Make sure Roles::VIEWER is included
        if (!in_array(Roles::VIEWER, $roles)) {
            array_push($roles, Roles::VIEWER);
        }

        // A pending user cannot change state from a user update request
        // They can only "un-pending" themselves by setting a password
        if ($users_data->users->$user_id->state !== States::PENDING) {
            $users_data->users->$user_id->state = $body_params['state'];
        }
        $users_data->users->$user_id->roles = $roles;

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        $res->getBody()->write(json_encode($users_data->users->$user_id));
        return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public static function resetUser(AppConfig $config, string $user_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::reset())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01031');
        }

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01032');
        }

        // Cannot modify the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid call', ErrorMessage::BAD_REQUEST_TEXT, '01033');
        }

        // A pending user cannot be reset
        if ($users_data->users->$user_id->state === States::PENDING) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid call', ErrorMessage::BAD_REQUEST_TEXT, '01034');
        }

        $link_id = Uuid::uuid4()->toString();

        $users_data->users->$user_id->state = 'pending';
        unset($users_data->users->$user_id->{'hash-v1'});
        $users_data->users->$user_id->linkID = $link_id;
        $users_data->pending->$link_id = $users_data->users->$user_id->username;

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        $res->getBody()->write(json_encode($users_data->users->$user_id));
        return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public static function deleteUser(AppConfig $config, string $user_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::delete())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01041');
        }

        // Check if user already delete
        if (!property_exists($users_data->users, $user_id)) {
            return $res->withStatus(200);
        }

        // Cannot delete the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid call', ErrorMessage::BAD_REQUEST_TEXT, '010042');
        }

        $username = $users_data->users->$user_id->username;
        if (property_exists($users_data->users->$user_id, 'linkID')) {
            $link_id = $users_data->users->$user_id->linkID;
            unset($users_data->pending->$link_id);
        }
        unset($users_data->lookup->$username);
        unset($users_data->users->$user_id);

        $users_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($users_file, $users_file_backup);
        $h = fopen($users_file, 'w');
        fwrite($h, json_encode($users_data, JSON_PRETTY_PRINT));
        fclose($h);

        return $res->withStatus(200);
    }
}
