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
use VBCompetitions\Competitions\Club;

// Errorcodes 007FN
final class Clubs
{
    public static function getClubs(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->debug('Request to get the clubs in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::club()::get(), $competition_id, '0070');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $context->getLogger()->debug('Clubs in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($competition->getClubs()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createClub(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a club in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::club()::create(), $competition_id, '0071');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $club_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_CLUB_CREATE, '0071');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($club_data, 'id')) {
            $club_id = $club_data->id;
            $context->getLogger()->info('Club ID specified as '.$club_id);
        } else {
            $club_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Club ID not specified, so setting to '.$club_id);
        }

        try {
            $club = new Club($competition, $club_id, $club_data->name);
            if (property_exists($club_data, 'notes')) {
                $club->setNotes($club_data->notes);
            }
            $competition->addClub($club);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00710');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->error('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00711');
        }

        $context->getLogger()->info('Club with name ['.$club_data->name.'] and ID ['.$club_id.'] created');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $club_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getClub(Config $config, string $competition_id, string $club_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->debug('Request to get the club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::club()::get(), $competition_id, '0072');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $club = $competition->getClub($club_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the club', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00720');
        }

        $context->getLogger()->debug('Club with ID ['.$club_id.'] and name ['.$club->getName().'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($club));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateClub(Config $config, string $competition_id, string $club_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::club()::update(), $competition_id, '0073');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $club = $competition->getClub($club_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the club', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00730');
        }

        try {
            $club_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_CLUB_UPDATE, '0073');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($club_data, 'name')) {
                $old_name = $club->getName();
                $club->setName($club_data->name);
                $context->getLogger()->info('Updating name of club with ID ['.$club_id.'] from ['.$old_name.'] to ['.$club_data->name.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($club_data, 'notes')) {
                $club->setNotes($club_data->notes);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00731');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00732');
        }

        $context->getLogger()->info('Updated club with ID ['.$club_id.'] and name ['.$club->getName().'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteClub(Config $config, string $competition_id, string $club_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::club()::delete(), $competition_id, '0074');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            $context->getLogger()->info('Club with ID ['.$club_id.'] does not exist in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $competition->deleteClub($club_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00740');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00741');
        }

        $context->getLogger()->info('Deleted club with ID ['.$club_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
