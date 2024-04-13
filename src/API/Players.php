<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\AppConfig;

// Errorcodes 004FN
final class Players
{
    public static function getPlayers(AppConfig $config, string $competition_id, string $team_id, Response $res) : Response
    {
        return $res;
    }

    public static function addPlayer(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function getPlayerByID(AppConfig $config, string $competition_id, string $team_id, string $player_id, Response $res) : Response
    {
        return $res;
    }

    public static function addPlayerByID(AppConfig $config, string $competition_id, string $team_id, string $player_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function updatePlayerByID(AppConfig $config, string $competition_id, string $team_id, string $player_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function deletePlayerByID(AppConfig $config, string $competition_id, string $team_id, string $player_id, Response $res) : Response
    {
        return $res;
    }
}
