<?php

namespace VBCompetitions\CompetitionsAPI;

use stdClass;
use Slim\Psr7\Response;

final class ErrorMessage {
    public string $text;
    public ?string $code;
    public ?string $id;
    public function __construct(string $text, ?string $code, ?string $id)
    {
        $this->code = $code;
        $this->id = $id;
        $this->text = $text;
    }

    public function jsonSerialize() : mixed
    {
        $error = new stdClass();
        $error->text = $this->text;
        if (!is_null($this->code)) {
            $error->code = $this->code;
        }
        if (!is_null($this->id)) {
            $error->id = $this->id;
        }

        return $error;
    }

    public static function respondWithError(int $http_code, string $text, ?string $code, ?string $id)
    {
        $res = new Response();
        $res->getBody()->write(json_encode(new ErrorMessage($text, $code, $id)));
        return $res->withStatus($http_code)->withHeader('content-type', 'application/json');
    }

    public const BAD_DATA_CODE = '400';
    public const BAD_DATA_TEXT = 'BAD_DATA';

    public const BAD_REQUEST_CODE = '400';
    public const BAD_REQUEST_TEXT = 'BAD_REQUEST';

    public const INTERNAL_ERROR_CODE = '500';
    public const INTERNAL_ERROR_TEXT = 'INTERNAL_ERROR';

    public const UNAUTHORIZED_CODE = '401';
    public const UNAUTHORIZED_TEXT = 'UNAUTHORIZED';

    public const FORBIDDEN_CODE = '403';
    public const FORBIDDEN_TEXT = 'FORBIDDEN';

    public const RESOURCE_DOES_NOT_EXIST_CODE = '404';
    public const RESOURCE_DOES_NOT_EXIST_TEXT = 'RESOURCE_DOES_NOT_EXIST';

    public const RESOURCE_EXISTS_CODE = '409';
    public const RESOURCE_EXISTS_TEXT = 'RESOURCE_EXISTS';
}
