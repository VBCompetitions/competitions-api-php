<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;
use VBCompetitions\CompetitionsAPI\Utils;

// Errorcodes 000FN
final class Competitions
{
    public static function getCompetitions(AppConfig $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get competitions list');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00001');
        }

        $query_params = Utils::processQueryParams($req);

        $competition_list = Competition::competitionList($config->getCompetitionsDir(), $query_params->meta);

        $competitions = [];
        foreach ($competition_list as $competition) {
            if ($competition->is_valid) {
                $competition_details = new stdClass();
                $competition_details->id = substr($competition->file, 0, -5);
                $competition_details->name = $competition->name;
                $competition_details->complete = $competition->is_complete;
                if (property_exists($competition, 'metadata')) {
                    $competition_details->metadata = $competition->metadata;
                }
                array_push($competitions, $competition_details);
            }
        }

        $context->getLogger()->info('Competitions list returning '.count($competitions).' competitions');
        $res->getBody()->write(json_encode($competitions));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createCompetition(AppConfig $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create competition');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00010');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::create())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00011');
        }

        $competition_data = json_decode($req->getBody());

        if (property_exists($competition_data, 'version') && version_compare($competition_data->version, '1.0.0', 'ne')) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_DATA_HTTP, 'Document version '.$competition_data->version.' not supported', ErrorMessage::BAD_DATA_CODE, '00012');
        }

        if (property_exists($competition_data, 'id')) {
            $competition_id = $competition_data->id;
            $context->getLogger()->info('Competition ID specified as '.$competition_id);
        } else {
            $competition_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Competition ID not specified, so setting to '.$competition_id);
        }

        unset($competition_data->id);

        try {
            Competition::validateJSON($competition_data);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_DATA_HTTP, 'Bad competition data: '.$th->getMessage(), ErrorMessage::BAD_DATA_CODE, '00013');
        }

        try {
            $competition = Competition::loadFromCompetitionJSON($req->getBody());
            $context->getLogger()->info('Competition created with name ['.$competition->getName().'] and ID ['.$competition_id.']');
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to create the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00014');
        }

        $res->getBody()->write($competition_id);
        return $res;
    }

    public static function getCompetition(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competition()::get(), $competition_id, '0070');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $context->getLogger()->info('Competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($competition));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateCompetition(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competition()::update(), $competition_id, '0070');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $competition_update = json_decode($req->getBody());
        try {
            if (property_exists($competition_update, 'name')) {
                $original_name = $competition->getName();
                $competition->setName($competition_update->name);
                $context->getLogger()->info('Competition with ID ['.$competition_id.'] name changed from ['.$original_name.'] to ['.$competition->getName().']');
            }
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition name: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00045');
        }

        try {
            if (property_exists($competition_update, 'notes')) {
                $original_notes = $competition->getNotes();
                $competition->setNotes($competition_update->notes);
                $context->getLogger()->info('Competition with ID ['.$competition_id.'] notes changed from ['.$original_notes.'] to ['.$competition->getNotes().']');
            }
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition notes: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00046');
        }

        try {
            if (property_exists($competition_update, 'metadata')) {
                // TODO
                // $original_notes = $competition->getNotes();
                // $competition->setNotes($competition_update->notes);
                // $context->getLogger()->info('Competition with ID ['.$competition_id.'] notes changed from ['.$original_notes.'] to ['.$competition->getNotes().']');
            }
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition metadata: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00047');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to update the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00048');
        }

        $res->getBody()->write(json_encode($competition));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function deleteCompetition(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00050');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::delete())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00051');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_CODE, '00052');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            $context->getLogger()->info('Competition with ID ['.$competition_id.'] not found anyway');
            return $res->withStatus(200);
        }

        if (unlink($competition_file)) {
            $context->getLogger()->info('Competition with ID ['.$competition_id.'] deleted');
            return $res->withStatus(200);
        }

        return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'There was a problem deleting the competition.  Maybe try again?', ErrorMessage::INTERNAL_ERROR_CODE, '00053');
    }
}
