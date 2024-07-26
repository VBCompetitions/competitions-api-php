<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use stdClass;
use Throwable;
use VBCompetitions\CompetitionsAPI\Config;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;
use VBCompetitions\CompetitionsAPI\UI\App;

// Errorcodes 013FN
final class Settings
{
    public static function getLogs(Config $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::log()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01300');
        }

        // $context->getLogger()->info('System logs requested');
        $log_file = $config->getLogDir().DIRECTORY_SEPARATOR.'logs.jsonl';
        $h = fopen($log_file, 'r');
        $log_text = fread($h, filesize($log_file));
        fclose($h);

        $res->getBody()->write($log_text);
        return $res->withHeader('Content-Type', 'text/plain');
    }

    public static function createApp(Config $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        $context->getLogger()->info('Request to create an App');

        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::app()::create())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01310');
        }

        $body_params = (array)$req->getParsedBody();
        $name = $body_params['name'];
        $root_path = $body_params['rootPath'];
        $roles = $body_params['roles'];

        // check app name is valid must contain only ASCII printable characters excluding " : { } ? =
        if (!preg_match('/^((?![":{}?= ])[\x20-\x7F])+$/', $name)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid name: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_CODE, '01311');
        }

        // check root path is valid, must have a leading '/'
        if (strlen($root_path) < 1 || !str_starts_with($root_path, '/')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid username: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_CODE, '01312');
        }

        $apps = [];
        $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
        if ($apps_file === false) {
            $context->getLogger()->info('No Apps defined yet, so creating the apps file');
            $apps_file = $config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json';
        } else {
            $apps_json = file_get_contents($apps_file);
            if ($apps_json === false) {
                $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01313');
            }

            $apps = json_decode($apps_json);
            if (!is_array($apps)) {
                $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01314');
            }
        }

        // check for matching name
        $name_exists = false;
        foreach ($apps as $app) {
            if ($app->name === $name) {
                $name_exists = true;
            }
        }
        if ($name_exists) {
            $context->getLogger()->error('App with name "'.$name.'" already exists');
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_EXISTS_HTTP, 'App with name "'.$name.'" already exists', ErrorMessage::RESOURCE_EXISTS_CODE, '01314');
        }

        $new_app = new stdClass();
        $new_app->id = Uuid::uuid4()->toString();
        $new_app->name = $name;
        $new_app->rootPath = $root_path;
        $new_app->roles = $roles;

        array_push($apps, $new_app);

        $h = fopen($apps_file, 'w');
        fwrite($h, json_encode($apps, JSON_PRETTY_PRINT));
        fclose($h);

        $res->getBody()->write(json_encode($new_app));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getApps(Config $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        $context->getLogger()->info('Request to get the list of Apps');

        if ($roles === null) {
            $context->getLogger()->error('Failed to get roles from the request');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::app()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01320');
        }

        $apps = [];
        $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
        if ($apps_file === false) {
            $context->getLogger()->info('Request to get the list of Apps but none have been defined and there are no apps defined');
            $res->getBody()->write(json_encode($apps));
            return $res->withHeader('Content-Type', 'application/json');
        }

        $apps_json = file_get_contents($apps_file);
        if ($apps_json === false) {
            $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01321');
        }

        $apps_data = json_decode($apps_json);
        if (!is_array($apps_data)) {
            $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01322');
        }

        try {
            foreach ($apps_data as $app_data) {
                array_push($apps, new App($app_data));
            }
        } catch (Throwable $err) {
            $context->getLogger()->error('Failed to parse the apps configuration: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01323');
        }

        $res->getBody()->write(json_encode($apps));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateApp(Config $config, string $app_id, Request $req, Response $res) : Response
    {
        return $res->withStatus(200);
    }

    public static function deleteApp(Config $config, string $app_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        $context->getLogger()->info('Request to delete the App with ID '.$app_id);

        if ($roles === null) {
            $context->getLogger()->error('Failed to get roles from the request');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::app()::delete())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01340');
        }

        $apps_file = realpath($config->getSettingsDir().DIRECTORY_SEPARATOR.'apps.json');
        if ($apps_file === false) {
            $context->getLogger()->info('Request to delete an App but there is no apps.json file');
            return $res->withStatus(200);
        }

        $apps_json = file_get_contents($apps_file);
        if ($apps_json === false) {
            $context->getLogger()->error('Failed to get the list of apps.  A config file exists, but it failed to load');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01341');
        }

        $apps_data = json_decode($apps_json);
        if (!is_array($apps_data)) {
            $context->getLogger()->error('Failed to get the list of apps.  The file loaded but doesn\'t contain a JSON array');
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '01342');
        }

        $apps_data = array_values(array_filter($apps_data, fn($el): bool => $el->id !== $app_id));

        $h = fopen($apps_file, 'w');
        fwrite($h, json_encode($apps_data, JSON_PRETTY_PRINT));
        fclose($h);

        return $res->withStatus(200);
    }
}
