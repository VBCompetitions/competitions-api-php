<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\Competition;
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\CompetitionsAPI\AppConfig;

// Errorcodes 001FN
final class Contacts
{
    public static function getContacts(AppConfig $config, string $competition_id, string $team_id, Response $res) : Response
    {
        return $res;
    }

    public static function addContact(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function getContactByID(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Response $res) : Response
    {
        return $res;
    }

    public static function addContactByID(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function updateContactByID(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Request $req, Response $res) : Response
    {
        return $res;
    }

    public static function deleteContactByID(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Response $res) : Response
    {
        return $res;
    }
}
