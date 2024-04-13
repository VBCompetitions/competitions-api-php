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
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::get())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00001');
        }

        $competition_list = Competition::competitionList($config->getCompetitionsDir());

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
        $res->getBody()->write(json_encode($competitions));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createCompetition(AppConfig $config, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00010');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::create())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00011');
        }

        $competition_data = json_decode($req->getBody());

        if (property_exists($competition_data, 'version') && version_compare($competition_data->version, '1.0.0', 'ne')) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Document version '.$competition_data->version.' not supported', ErrorMessage::BAD_DATA_TEXT, '00012');
        }

        try {
            Competition::validateJSON($competition_data);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Bad competition data: '.$th->getMessage(), ErrorMessage::BAD_DATA_TEXT, '00013');
        }

        try {
            $competition = Competition::loadFromCompetitionJSON($req->getBody());
            $competition_id = Uuid::uuid4()->toString();
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to create the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00014');
        }

        $res->getBody()->write($competition_id);
        return $res;
    }

    public static function getCompetitionByID(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00020');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::get())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00021');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';

        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_TEXT, '00022');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Competition does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00023');
        }

        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
            $res->getBody()->write(json_encode($competition));
            return $res->withHeader('Content-Type', 'application/json');
        } catch (Throwable $_) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to load the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00024');
        }
    }

    public static function createCompetitionByID(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00030');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::create())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00031');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_TEXT, '00032');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file !== false) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_EXISTS_CODE, 'Competition with matching ID already exists', ErrorMessage::RESOURCE_EXISTS_TEXT, '00033');
        }

        try {
            $competition_data = json_decode($req->getBody());
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition data, must be JSON', ErrorMessage::BAD_REQUEST_TEXT, '00034');
        }

        if (property_exists($competition_data, 'version') && version_compare($competition_data->version, '1.0.0', 'ne')) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Document version '.$competition_data->version.' not supported', ErrorMessage::BAD_DATA_TEXT, '00035');
        }

        try {
            Competition::validateJSON($competition_data);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Bad competition data: '.$th->getMessage(), ErrorMessage::BAD_DATA_TEXT, '00036');
        }

        try {
            $competition = Competition::loadFromCompetitionJSON($req->getBody());
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to create the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00037');
        }

        $res->getBody()->write($competition_id);
        return $res;
    }

    public static function updateCompetitionByID(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00040');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::update())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00041');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_TEXT, '00042');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Competition does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00043');
        }

        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to load the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00044');
        }

        $competition_update = json_decode($req->getBody());
        try {
            if (property_exists($competition_update, 'name')) {
                $competition->setName($competition_update->name);
            }
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition name: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_TEXT, '00045');
        }

        try {
            if (property_exists($competition_update, 'notes')) {
                $competition->setNotes($competition_update->notes);
            }
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition notes: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_TEXT, '00046');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to update the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00047');
        }

        // TODO handle when setting set config but not setting matchType to "sets" etc...

        $res->getBody()->write(json_encode($competition));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function deleteCompetitionByID(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00050');
        }

        if (!Roles::roleCheck($roles, Roles::competition()::delete())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00051');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_TEXT, '00052');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            return $res->withStatus(200);
        }

        if (unlink($competition_file)) {
            return $res->withStatus(200);
        }

        return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'There was a problem deleting the competition.  Maybe try again?', ErrorMessage::INTERNAL_ERROR_TEXT, '00053');
    }
}
