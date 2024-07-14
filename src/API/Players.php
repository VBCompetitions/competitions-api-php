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
    public static function getPlayers(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function createPlayer(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function getPlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function updatePlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function deletePlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function transferPlayer(AppConfig $config, string $competition_id, string $player_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function getPlayersForTeam(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }
}
