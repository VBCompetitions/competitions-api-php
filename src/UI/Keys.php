<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use stdClass;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

// Errorcodes 012FN
final class Keys
{
    public static function getKeys(AppConfig $config, Response $res) : Response
    {
        $keys_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
        $h = fopen($keys_file, 'r');
        $json = fread($h, filesize($keys_file));
        fclose($h);
        $keys_data = json_decode($json);

        if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01200');
        }

        $user_id = $_SESSION['user_id'];
        $key_list = [];

        foreach ($keys_data->keys as $key_id => $key) {
            if ($user_id === $key->user) {
                $key->keyID = $key_id;
                array_push($key_list, $key);
            }
        }

        $res->getBody()->write(json_encode($key_list));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createKey(AppConfig $config, Request $req, Response $res) : Response
    {
        $keys_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
        $h = fopen($keys_file, 'r');
        $json = fread($h, filesize($keys_file));
        fclose($h);
        $keys_data = json_decode($json);

        if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01210');
        }

        $body_params = (array)$req->getParsedBody();
        $description = $body_params['description'];

        if (strlen($description) > 1000) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Description must ne no longer than 1000 characters', ErrorMessage::BAD_REQUEST_TEXT, '01211');
        }

        // check description is valid must contain only ASCII printable characters excluding " : { } ? =
        if (!preg_match('/^[a-zA-Z0-9!"#£$%&\'()*+,-.\/\\\:;<=>?@[\]^_`{|}~ ]*$/', $description)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid description: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_TEXT, '01212');
        }

        $user_id = $_SESSION['user_id'];
        $api_key = str_replace('-', '', Uuid::uuid4()->toString());
        $api_key_prefix = substr(Uuid::uuid4()->toString(), 0, 8);
        $api_key_hash = password_hash($api_key, PASSWORD_BCRYPT);
        $key_id = Uuid::uuid4()->toString();

        $new_key = new stdClass();
        $new_key->user = $user_id;
        $new_key->description = $description;
        $new_key->created = (new DateTime())->format('c');
        $new_key->lastUsed = 'never';

        $keys_data->lookup->v1->$api_key_prefix = new stdClass();
        $keys_data->lookup->v1->$api_key_prefix->{'hash'} = $api_key_hash;
        $keys_data->lookup->v1->$api_key_prefix->id = $key_id;
        $keys_data->keys->$key_id = $new_key;

        $keys_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($keys_file, $keys_file_backup);
        $h = fopen($keys_file, 'w');
        fwrite($h, json_encode($keys_data, JSON_PRETTY_PRINT));
        fclose($h);

        $keys_data->keys->$key_id->key_id = $key_id;
        $keys_data->keys->$key_id->key = $api_key_prefix.$api_key;
        $res->getBody()->write(json_encode($keys_data->keys->$key_id));
        return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public static function updateKey(AppConfig $config, string $key_id, Request $req, Response $res) : Response
    {
        $keys_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
        $h = fopen($keys_file, 'r');
        $json = fread($h, filesize($keys_file));
        fclose($h);
        $keys_data = json_decode($json);

        if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01220');
        }

        // Check if key exists
        if (!property_exists($keys_data->keys, $key_id)) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such key', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '01221');
        }

        $body_params = (array)$req->getParsedBody();
        $description = $body_params['description'];

        if (strlen($description) > 1000) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Description must ne no longer than 1000 characters', ErrorMessage::BAD_REQUEST_TEXT, '01222');
        }

        // check description is valid must contain only ASCII printable characters excluding " : { } ? =
        if (!preg_match('/^[a-zA-Z0-9!"#£$%&\'()*+,-.\/\\\:;<=>?@[\]^_`{|}~ ]*$/', $description)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid description: must contain only ASCII printable characters excluding " : { } ? =', ErrorMessage::BAD_REQUEST_TEXT, '01223');
        }

        $keys_data->keys->$key_id->description = $body_params['description'];

        $keys_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($keys_file, $keys_file_backup);
        $h = fopen($keys_file, 'w');
        fwrite($h, json_encode($keys_data, JSON_PRETTY_PRINT));
        fclose($h);

        $keys_data->keys->$key_id->key_id = $key_id;
        $res->getBody()->write(json_encode($keys_data->keys->$key_id));
        return $res->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public static function deleteKey(AppConfig $config, string $key_id, Response $res) : Response
    {
        $keys_file = $config->getUsersDir().DIRECTORY_SEPARATOR.'apikeys.json';
        $h = fopen($keys_file, 'r');
        $json = fread($h, filesize($keys_file));
        fclose($h);
        $keys_data = json_decode($json);

        if ($keys_data == null || !property_exists($keys_data, 'lookup') || !property_exists($keys_data, 'keys')) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '01230');
        }

        // Check if key already delete
        if (!property_exists($keys_data->keys, $key_id)) {
            return $res->withStatus(200);
        }

        unset($keys_data->keys->$key_id);
        foreach($keys_data->lookup->v1 as $prefix => $key) {
            if ($key_id === $key->id) {
                unset($keys_data->lookup->v1->$prefix);
                break;
            }
        }

        $keys_file_backup = $config->getUsersDir().DIRECTORY_SEPARATOR.'users_backup.json';
        copy($keys_file, $keys_file_backup);
        $h = fopen($keys_file, 'w');
        fwrite($h, json_encode($keys_data, JSON_PRETTY_PRINT));
        fclose($h);

        return $res->withStatus(200);
    }
}
