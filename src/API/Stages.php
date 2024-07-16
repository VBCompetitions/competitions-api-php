<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Ramsey\Uuid\Uuid;
use Throwable;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\{
    Competition,
    IfUnknown,
    Stage
};
use VBCompetitions\CompetitionsAPI\{
    AppConfig,
    ErrorMessage,
    Roles,
    Utils
};

// Errorcodes 005FN
final class Stages
{
    public static function appendStage(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to append a stage to competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::stage()::append(), $competition_id, '0050');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_STAGE_APPEND, '0050');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($stage_data, 'id')) {
            $stage_id = $stage_data->id;
            $context->getLogger()->info('Stage ID specified as '.$stage_id);
        } else {
            $stage_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Stage ID not specified, so setting to '.$stage_id);
        }

        try {
            $stage = new Stage($competition, $stage_id);
            $stage->loadFromData($stage_data);
            $competition->addStage($stage);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00500');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00501');
        }

        $context->getLogger()->info('Stage with ID ['.$stage_id.'] created');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $stage_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateStage(AppConfig $config, string $competition_id, string $stage_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::stage()::update(), $competition_id, '0051');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage = $competition->getStage($stage_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the stage', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00510');
        }

        try {
            $stage_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_STAGE_UPDATE, '0051');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $stage->setName(property_exists($stage_data, 'name') ? $stage_data->name : null);
            $stage->setNotes(property_exists($stage_data, 'notes') ? $stage_data->notes : null);
            $stage->setDescription(property_exists($stage_data, 'description') ? $stage_data->description : null);
            if (property_exists($stage_data, 'ifUnknown')) {
                $if_unknown = new IfUnknown($stage, $stage_data->ifUnknown->description);
                $if_unknown->loadFromData($stage_data->ifUnknown);
                $stage->setIfUnknown($if_unknown);
            } else {
                $stage->setIfUnknown(null);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00511');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00512');
        }

        $context->getLogger()->info('Updated stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteStage(AppConfig $config, string $competition_id, string $stage_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the stage with ID ['.$stage_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::stage()::delete(), $competition_id, '0052');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasStage($stage_id)) {
            $context->getLogger()->info('Stage with ID ['.$stage_id.'] does not exist in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $competition->deleteStage($stage_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00520');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00521');
        }

        $context->getLogger()->info('Deleted stage with ID ['.$stage_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
