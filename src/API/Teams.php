<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

// Errorcodes 006FN
final class Teams
{
    public static function getTeams(AppConfig $config, string $competition_id, Response $res) : Response
    {
        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
            $res->getBody()->write(json_encode($competition->getTeams()));
            return $res->withHeader('content-type', 'application/json');
        } catch (\Throwable $th) {
            //throw $th;
            //ErrorMessage
            // no such file => 404
            // file is invalid => 500
        }
    }

    public static function addTeam(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function getTeamByID(AppConfig $config, string $competition_id, string $team_id, Response $res) : Response
    {
        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
            $team = $competition->getTeamByID($team_id);
            if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
                return ErrorMessage::respondWithError(ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, 'No such team', ErrorMessage::RESOURCE_DOES_NOT_EXIST_TEXT, '00200');
            } else {
                $res->getBody()->write(json_encode($team));
                return $res->withHeader('content-type', 'application/json');
            }
        } catch (\Throwable $th) {
            //throw $th;
            //ErrorMessage
            // no such file => 404
            // file is invalid => 500
        }
    }

    public static function addTeamByID(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function updateTeamByID(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function deleteTeamByID(AppConfig $config, string $competition_id, string $team_id, Response $res) : Response
    {
        return $res;
    }
}
