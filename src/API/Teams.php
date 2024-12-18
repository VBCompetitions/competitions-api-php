<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Ramsey\Uuid\Uuid;
use Throwable;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\CompetitionsAPI\{
    Config,
    ErrorMessage,
    Roles,
    Utils
};
use VBCompetitions\Competitions\CompetitionTeam;

// Errorcodes 006FN
final class Teams
{
    public static function getTeams(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the teams in competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00600');
        }

        if (!Roles::roleCheck($roles, Roles::team()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00601');
        }

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::get(), $competition_id, '0060');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $context->getLogger()->info('Teams in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($competition->getTeams()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createTeam(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a team in competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00610');
        }

        if (!Roles::roleCheck($roles, Roles::team()::create())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00611');
        }

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::create(), $competition_id, '0061');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $team_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_TEAM_CREATE, '0061');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($team_data, 'id')) {
            $team_id = $team_data->id;
            $context->getLogger()->info('Team ID specified as '.$team_id);
        } else {
            $team_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Team ID not specified, so setting to '.$team_id);
        }

        try {
            $team = new CompetitionTeam($competition, $team_id, $team_data->name);
            if (property_exists($team_data, 'notes')) {
                $team->setNotes($team_data->notes);
            }
            if (property_exists($team_data, 'club')) {
                $team->setClubID($team_data->club);
            }
            $competition->addTeam($team);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00614');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00615');
        }

        $context->getLogger()->info('Team with name ['.$team_data->name.'] and ID ['.$team_id.'] created');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $team_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getTeam(Config $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00620');
        }

        if (!Roles::roleCheck($roles, Roles::team()::get())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00621');
        }

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::get(), $competition_id, '0062');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00620');
        }

        $context->getLogger()->info('Team with ID ['.$team_id.'] and name ['.$team->getName().'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($team));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateTeam(Config $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00630');
        }

        if (!Roles::roleCheck($roles, Roles::team()::update())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00631');
        }

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::update(), $competition_id, '0063');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $team = $competition->getTeam($team_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the team', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00632');
        }

        try {
            $team_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_TEAM_UPDATE, '0063');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($team_data, 'name')) {
                $old_name = $team->getName();
                $team->setName($team_data->name);
                $context->getLogger()->info('Updating name of team with ID ['.$team_id.'] from ['.$old_name.'] to ['.$team_data->name.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($team_data, 'club')) {
                $team->setClubID($team_data->club);
            }
            if (property_exists($team_data, 'notes')) {
                $team->setNotes($team_data->notes);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00633');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00634');
        }

        $context->getLogger()->info('Updated team with ID ['.$team_id.'] and name ['.$team->getName().'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteTeam(Config $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00640');
        }

        if (!Roles::roleCheck($roles, Roles::team()::delete())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00641');
        }

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::delete(), $competition_id, '0064');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasTeam($team_id)) {
            $context->getLogger()->info('Team with ID ['.$team_id.'] does not exist in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $competition->deleteTeam($team_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00642');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00643');
        }

        $context->getLogger()->info('Deleted team with ID ['.$team_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
