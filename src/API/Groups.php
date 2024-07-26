<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\Competitions\{
    Competition,
    Crossover,
    GroupType,
    IfUnknown,
    Knockout,
    KnockoutConfig,
    League,
    LeagueConfig,
    MatchType,
    SetConfig
};
use VBCompetitions\CompetitionsAPI\{
    Config,
    ErrorMessage,
    Roles,
    Utils
};

// Errorcodes 002FN
final class Groups
{
    public static function appendGroup(Config $config, string $competition_id, string $stage_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to append a group to stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::group()::append(), $competition_id, '0020');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage = $competition->getStage($stage_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, $err->getMessage(), ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00200');
        }

        try {
            $group_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_GROUP_APPEND, '0020');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($group_data, 'id')) {
            $group_id = $group_data->id;
            $context->getLogger()->info('Group ID specified as '.$group_id);
        } else {
            $group_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Group ID not specified, so setting to '.$group_id);
        }

        try {
            $match_type = match ($group_data->matchType) {
                'continuous' => MatchType::CONTINUOUS,
                'sets' => MatchType::SETS,
            };
            switch ($group_data->type) {
                case 'league':
                    $group = new League($stage, $group_id, $match_type, $group_data->drawsAllowed);
                    break;

                case 'crossover':
                    $group = new Crossover($stage, $group_id, $match_type);
                    break;

                case 'knockout':
                    $group = new Knockout($stage, $group_id, $match_type);
                    break;
            }
            $group->loadFromData($group_data);
            $stage->addGroup($group);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00201');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00202');
        }

        $context->getLogger()->info('Group with ID ['.$group_id.'] created');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $group_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateGroup(Config $config, string $competition_id, string $stage_id, string $group_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the group with ID ['.$group_id.'] in stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::stage()::update(), $competition_id, '0021');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage = $competition->getStage($stage_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the stage', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00210');
        }

        try {
            $group = $stage->getGroup($group_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the group', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00211');
        }

        try {
            $group_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_GROUP_UPDATE, '0021');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $group->setName(property_exists($group_data, 'name') ? $group_data->name : null);
            $group->setNotes(property_exists($group_data, 'notes') ? $group_data->notes : null);
            $group->setDescription(property_exists($group_data, 'description') ? $group_data->description : null);
            $group->setDrawsAllowed(property_exists($group_data, 'drawsAllowed') ? $group_data->drawsAllowed : null);
            if ($group->getType() === GroupType::KNOCKOUT && property_exists($group_data, 'knockout')) {
                $knockout_config = new KnockoutConfig($group);
                $knockout_config->loadFromData($group_data->knockout);
                $group->setKnockoutConfig($knockout_config);
            }
            if ($group->getType() === GroupType::LEAGUE && property_exists($group_data, 'league')) {
                $league_config = new LeagueConfig($group);
                $league_config->loadFromData($group_data->league);
                $group->setLeagueConfig($league_config);
            }
            if ($group->getMatchType() === MatchType::SETS && property_exists($group_data, 'sets')) {
                $sets = new SetConfig($group);
                $sets->loadFromData($group_data->sets);
                $group->setSetConfig($sets);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00212');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00213');
        }

        $context->getLogger()->info('Updated group with ID ['.$group_id.'] in stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteGroup(Config $config, string $competition_id, string $stage_id, string $group_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the group with ID ['.$group_id.'] in stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::stage()::delete(), $competition_id, '0022');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage = $competition->getStage($stage_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, $err->getMessage(), ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00220');
        }

        if (!$stage->hasGroup($group_id)) {
            $context->getLogger()->info('Group with ID ['.$group_id.'] does not exist in stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $stage->deleteGroup($group_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00221');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00222');
        }

        $context->getLogger()->info('Deleted stage with ID ['.$stage_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
