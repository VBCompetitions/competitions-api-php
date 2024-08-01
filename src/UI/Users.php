<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\{
    Request,
    Response
};
use stdClass;
use Throwable;
use VBCompetitions\CompetitionsAPI\{
    Config,
    ErrorMessage,
    Roles,
    States,
    UI\App
};

// Errorcodes 010FN
final class Users
{
    public static function getUsers(Config $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01002');
        }

        $user_list = [];

        foreach (get_object_vars($users_data->lookup) as $username => $user_id) {
            if (!property_exists($users_data->users, $user_id)) {
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01003');
            }
            $user = new stdClass();
            $user->username = $username;
            $user->id = $user_id;
            $user->lastLogin = $users_data->users->$user_id->lastLogin;
            $user->created = $users_data->users->$user_id->created;
            $user->roles = $users_data->users->$user_id->roles;
            if (property_exists($users_data->users->$user_id, 'app')) {
                $user->app = $users_data->users->$user_id->app;
            }
            $user->state = $users_data->users->$user_id->state;
            if ($user->state === States::PENDING) {
                $user->linkID = $users_data->users->$user_id->linkID;
            }

            array_push($user_list, $user);
        }

        $res->getBody()->write(json_encode($user_list));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createUser(Config $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::create())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01010');
        }

        $body_params = (array)$req->getParsedBody();
        $username = $body_params['username'];

        // check username is valid must contain only ASCII printable characters excluding " : { } ? =
        if (!preg_match('/^((?![":{}?= ])[\x20-\x7F])+$/', $username)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid username: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_CODE, '01011');
        }

        // Default the valid roles to the VBC roles
        $available_roles = Roles::_ALL;

        // Check if the user is associated with an App
        if (array_key_exists('app', $body_params) && $body_params['app'] !== 'VBC') {
            $app_name = $body_params['app'];
            $apps = [];
            $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
            if ($apps_file === false) {
                $context->getLogger()->info('Request to get the list of Apps but none have been defined and there are no apps defined');
                return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Request to get the list of Apps but none have been defined and there are no apps defined', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '01012');
            }

            $apps_json = file_get_contents($apps_file);
            if ($apps_json === false) {
                $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01013');
            }

            $apps_data = json_decode($apps_json);
            if (!is_array($apps_data)) {
                $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01014');
            }

            try {
                foreach ($apps_data as $app_data) {
                    array_push($apps, new App($app_data));
                }
            } catch (Throwable $err) {
                $context->getLogger()->error('Failed to parse the apps configuration: '.$err->getMessage());
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01015');
            }

            // get app roles
            $app_found = false;
            foreach ($apps as $app) {
                if ($app->getName() === $app_name) {
                    $app_found = true;
                    $available_roles = $app->getRoles();
                }
            }
            if (!$app_found) {
                $context->getLogger()->error('Failed to find the specified App with ID "'.$app_name.'"');
                return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the specified App', ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, '01016');
            }
        }

        // Check requested roles are valid
        foreach($body_params['roles'] as $requested_roles) {
            if (!in_array($requested_roles, $available_roles)) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Role does not exist', ErrorMessage::BAD_REQUEST_CODE, '01016');
            }
        }

        $roles = [];
        foreach($available_roles as $available_role) {
            if (in_array($available_role, $body_params['roles'])) {
                array_push($roles, $available_role);
            }
        }

        // For VBC, make sure Roles::VIEWER is included
        if (array_key_exists('app', $body_params) && $body_params['app'] !== 'VBC') {
            if (!in_array(Roles::VIEWER, $roles)) {
                array_push($roles, Roles::VIEWER);
            }
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01017');
        }

        // Check if user already exists
        if (property_exists($users_data->lookup, $username)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_EXISTS_HTTP, 'User already exists', ErrorMessage::RESOURCE_EXISTS_CODE, '01018');
        }

        $user_id = Uuid::uuid4()->toString();
        $link_id = Uuid::uuid4()->toString();

        $new_user = new stdClass();
        $new_user->username = $username;
        $new_user->state = 'pending';
        if (array_key_exists('app', $body_params) && $body_params['app'] !== 'VBC') {
            $new_user->app = $body_params['app'];
        }
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

    public static function updateUser(Config $config, string $user_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::update())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01021');
        }

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '01022');
        }

        // Cannot modify the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid call', ErrorMessage::BAD_REQUEST_CODE, '01023');
        }

        $body_params = (array)$req->getParsedBody();

        // Default the valid roles to the VBC roles
        $available_roles = Roles::_ALL;

        // Check if the user is associated with an App
        if (array_key_exists('app', $body_params) && $body_params['app'] !== 'VBC') {
            $app_name = $body_params['app'];
            $apps = [];
            $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
            if ($apps_file === false) {
                $context->getLogger()->info('Request to get the list of Apps but none have been defined and there are no apps defined');
                return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Request to get the list of Apps but none have been defined and there are no apps defined', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '01024');
            }

            $apps_json = file_get_contents($apps_file);
            if ($apps_json === false) {
                $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01025');
            }

            $apps_data = json_decode($apps_json);
            if (!is_array($apps_data)) {
                $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01026');
            }

            try {
                foreach ($apps_data as $app_data) {
                    array_push($apps, new App($app_data));
                }
            } catch (Throwable $err) {
                $context->getLogger()->error('Failed to parse the apps configuration: '.$err->getMessage());
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01027');
            }

            // get app roles
            $app_found = false;
            foreach ($apps as $app) {
                if ($app->getName() === $app_name) {
                    $app_found = true;
                    $available_roles = $app->getRoles();
                }
            }
            if (!$app_found) {
                $context->getLogger()->error('Failed to find the specified App with ID "'.$app_name.'"');
                return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the specified App', ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, '01028');
            }
        }

        // Check requested roles are valid
        foreach($body_params['roles'] as $requested_roles) {
            if (!in_array($requested_roles, $available_roles)) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Role does not exist', ErrorMessage::BAD_REQUEST_CODE, '01029');
            }
        }

        // Check requested state is valid
        if (!in_array($body_params['state'], States::_LIST_ALL)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'State does not exist', ErrorMessage::BAD_REQUEST_CODE, '01070');
        }

        $roles = [];
        foreach($available_roles as $available_role) {
            if (in_array($available_role, $body_params['roles'])) {
                array_push($roles, $available_role);
            }
        }

        // For VBC, make sure Roles::VIEWER is included
        if (!array_key_exists('app', $body_params) || $body_params['app'] === 'VBC') {
            if (!in_array(Roles::VIEWER, $roles)) {
                array_push($roles, Roles::VIEWER);
            }
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

    public static function resetUser(Config $config, string $user_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::reset())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01031');
        }

        // Check if user exists
        if (!property_exists($users_data->users, $user_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such user', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '01032');
        }

        // Cannot modify the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid call', ErrorMessage::BAD_REQUEST_CODE, '01033');
        }

        // A pending user cannot be reset
        if ($users_data->users->$user_id->state === States::PENDING) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid call', ErrorMessage::BAD_REQUEST_CODE, '01034');
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

    public static function deleteUser(Config $config, string $user_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::user()::delete())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01001');
        }

        $users_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
        $h = fopen($users_file, 'r');
        $json = fread($h, filesize($users_file));
        fclose($h);
        $users_data = json_decode($json);

        if ($users_data == null || !property_exists($users_data, 'lookup') || !property_exists($users_data, 'users')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01041');
        }

        // Check if user already delete
        if (!property_exists($users_data->users, $user_id)) {
            return $res->withStatus(200);
        }

        // Cannot delete the admin user
        if ($users_data->users->$user_id->username === 'admin') {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid call', ErrorMessage::BAD_REQUEST_CODE, '010042');
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
