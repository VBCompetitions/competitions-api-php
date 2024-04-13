<?php

namespace VBCompetitions\CompetitionsAPI\API;

use PhpParser\ErrorHandler\Throwing;
use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\Competitions\Competition;
// use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\Utils;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;

// Errorcodes 003FN
final class Matches
{
    public static function createMatch(AppConfig $config, string $competition_id, string $stage_id, string $group_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function updateMatchByID(AppConfig $config, string $competition_id, string $stage_id, string $group_id, string $match_id, Request $req, Response $res) : Response
    {
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_TEXT, '00310');
        }

        if (!Roles::roleCheck($roles, Roles::match()::results())) {
            return ErrorMessage::respondWithError(ErrorMessage::FORBIDDEN_CODE, 'Insufficient roles', ErrorMessage::FORBIDDEN_TEXT, '00311');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_TEXT, '00312');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Competition does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00313');
        }

        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to load the competition', ErrorMessage::INTERNAL_ERROR_TEXT, '00314');
        }

        try {
            $stage = $competition->getStageByID($stage_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Stage does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00315');
        }

        try {
            $group = $stage->getGroupByID($group_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Group does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00316');
        }

        try {
            $match = $group->getMatchByID($match_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'Match does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00317');
        }

        try {
            $match_data = json_decode($req->getBody());
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid match data, must be JSON', ErrorMessage::BAD_REQUEST_TEXT, '00318');
        }

        if (!property_exists($match_data, 'homeTeam') ||
            !property_exists($match_data, 'awayTeam') ||
            !is_array($match_data->homeTeam->scores) ||
            !is_array($match_data->awayTeam->scores))
        {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid match data, must contain scores', ErrorMessage::BAD_REQUEST_TEXT, '00319');
        }

        try {
            $match->setScores($match_data->homeTeam->scores, $match_data->awayTeam->scores, ($match_data->complete !== null && $match_data->complete));
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_REQUEST_CODE, 'Invalid match data, scores are invalid: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_TEXT, '00340');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError(ErrorMessage::INTERNAL_ERROR_CODE, 'Failed to update the match', ErrorMessage::INTERNAL_ERROR_TEXT, '00341');
        }

        return $res;
    }

    public static function deleteMatchByID(AppConfig $config, string $competition_id, string $stage_id, string $group_id, string $match_id, Response $res) : Response
    {
        return $res;
    }
}
