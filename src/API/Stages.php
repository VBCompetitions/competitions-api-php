<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\AppConfig;

// Errorcodes 005FN
final class Stages
{
    public static function createStage(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {}

    public static function updateStageByID(AppConfig $config, string $competition_id, string $stage_id, Request $req, Response $res) : Response
    {}

    public static function deleteStageByID(AppConfig $config, string $competition_id, string $stage_id, Response $res) : Response
    {}
}
