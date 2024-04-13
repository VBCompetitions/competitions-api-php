<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\AppConfig;

// Errorcodes 002FN
final class Groups
{
    public static function createGroup(AppConfig $config, string $competition_id, string $stage_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function updateGroupByID(AppConfig $config, string $competition_id, string $stage_id, string $group_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function deleteGroupByID(AppConfig $config, string $competition_id, string $stage_id, string $group_id, Response $res) : Response
    {
        return $res;
    }
}
