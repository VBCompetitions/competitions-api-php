<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use DateTime;
use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use stdClass;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;

// Errorcodes 013FN
final class System
{
    public static function getLogs(AppConfig $config, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00000');
        }

        if (!Roles::roleCheck($roles, Roles::system()::logs())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '01301');
        }

        // $context->getLogger()->info('System logs requested');
        $log_file = $config->getLogDir().DIRECTORY_SEPARATOR.'logs.jsonl';
        $h = fopen($log_file, 'r');
        $log_text = fread($h, filesize($log_file));
        fclose($h);

        $res->getBody()->write($log_text);
        return $res->withHeader('Content-Type', 'text/plain');
    }
}
