<?php

namespace VBCompetitions\CompetitionsAPI;

use Opis\JsonSchema\Errors\ErrorFormatter;
use stdClass;
use Slim\Psr7\Request;
use Throwable;
use VBCompetitions\Competitions\Competition;

final class Utils
{
    public static function checkPathTraversal(string $dir, string $requested_file) : bool
    {
        $patterns = array('~/{2,}~', '~/(\./)+~', '~([^/\.]+/(?R)*\.{2,}/)~', '~\.\./~');
        $replacements = array('/', '/', '', '');
        $filename = preg_replace($patterns, $replacements, $requested_file);
        return !str_starts_with($filename, $dir);
    }

    public static function processQueryParams(Request $req) : object
    {
        $query_string = $req->getUri()->getQuery();
        $query_parts = new stdClass();
        $query_parts->meta = new stdClass();

        $query_params = explode('&', $query_string);

        foreach ($query_params as $param) {
            if (strlen($param) === 0) {
                continue;
            }
            list($key, $val) = explode('=', $param);

            switch ($key) {
                case 'meta':
                    $kv_pair = urldecode($val);
                    list($m_key, $m_val) = explode('=', $kv_pair, 2);
                    $query_parts->meta->$m_key = $m_val;
                    break;
                case 'notmeta':
                    $kv_pair = urldecode($val);
                    list($m_key, $m_val) = explode('=', $kv_pair, 2);
                    $query_parts->meta->{'!'.$m_key} = $m_val;
                    break;

                default:
                    if (!property_exists($query_parts, $key)) {
                        $query_parts->$key = [];
                    }
                    array_push($query_parts->$key, urldecode($val));
                    break;
            }
        }

        return $query_parts;
    }

    public static function loadCompetition(Config $config, Request $req, Context $context, array $roles, string $competition_id, string $action_id) : ?Competition
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            $context->getLogger()->error('Failed to get roles from the request');
            throw new ErrorMessage(ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, $action_id.'U0');
        }

        if (!Roles::roleCheck($roles, Roles::club()::get())) {
            $context->getLogger()->error('Role check failed, insufficient roles');
            throw new ErrorMessage(ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, $action_id.'U1');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';

        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            $context->getLogger()->error('Path traversal check failed on loading competition file');
            throw new ErrorMessage(ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_CODE, $action_id.'U2');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            $context->getLogger()->error('Failed to load competition as the competition does not exist');
            throw new ErrorMessage(ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Competition does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, $action_id.'U3');
        }

        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            $context->getLogger()->error('Failed to load the competition due to: '.$th->getMessage());
            throw new ErrorMessage(ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to load the competition', ErrorMessage::INTERNAL_ERROR_CODE, $action_id.'U4');
        }

        $context->getLogger()->info('Competition with ID ['.$competition_id.'] loaded');
        return $competition;
    }

    public static function getAndValidateData(Config $config, Request $req, Context $context, string $schema_id, $action_id) : object
    {
        $size = $req->getBody()->getSize();
        if ($size !== null && $size < 10000000) {
            throw new ErrorMessage(ErrorMessage::BAD_REQUEST_HTTP, 'Input body too large' , ErrorMessage::BAD_REQUEST_CODE, $action_id.'U5');
        }

        $body_json = json_decode($req->getBody());
        $validation_result = $config->validateData($schema_id, $body_json);

        if (!$validation_result->isValid()) {
            $errors = '';
            foreach ((new ErrorFormatter())->formatOutput($validation_result->error(), "basic")['errors'] as $error) {
                $errors .= sprintf("[%s] [%s] %s".PHP_EOL, $error['keywordLocation'], $error['instanceLocation'], $error['error']);
            }
            $context->getLogger()->error('Invalid input data: '.$errors);
            throw new ErrorMessage(ErrorMessage::BAD_REQUEST_HTTP, 'Invalid input data: '.$errors , ErrorMessage::BAD_REQUEST_CODE, $action_id.'U6');
        }

        return $body_json;
    }
}
