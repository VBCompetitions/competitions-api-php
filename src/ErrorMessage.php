<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;
use stdClass;
use Slim\Psr7\Response;

final class ErrorMessage extends Exception {
    // The HTTP response status code associated with the error
    public int $http_code;

    // Descriptive summary of the error
    public string $text;
    // A code for the type of error
    public string $error_code;
    // A unique identifier for the error
    public ?string $id;

    public function __construct(int $http_code, string $text, string $error_code, ?string $id)
    {
        $this->http_code = $http_code;
        $this->error_code = $error_code;
        $this->id = $id;
        $this->text = $text;
    }

    public function jsonSerialize() : mixed
    {
        $error = new stdClass();
        $error->text = $this->text;
        $error->code = $this->error_code;
        if (!is_null($this->id)) {
            $error->id = $this->id;
        }

        return $error;
    }

    public static function respondWithError(Context $context, int $http_code, string $text, string $code, ?string $id)
    {
        $context->getLogger()->error('responding with error '.$text);
        $res = new Response();
        $res->getBody()->write(json_encode(new ErrorMessage($http_code, $text, $code, $id)));
        return $res->withStatus($http_code)->withHeader('content-type', 'application/json');
    }

    public function respond(Context $context)
    {
        $context->getLogger()->error('responding with error '.$this->text);
        $res = new Response();
        $res->getBody()->write(json_encode($this));
        return $res->withStatus($this->http_code)->withHeader('content-type', 'application/json');
    }

    public const BAD_DATA_HTTP = '400';
    public const BAD_DATA_CODE = 'BAD_DATA';

    public const BAD_REQUEST_HTTP = '400';
    public const BAD_REQUEST_CODE = 'BAD_REQUEST';

    public const INTERNAL_ERROR_HTTP = '500';
    public const INTERNAL_ERROR_CODE = 'INTERNAL_ERROR';

    public const UNAUTHORIZED_HTTP = '401';
    public const UNAUTHORIZED_CODE = 'UNAUTHORIZED';

    public const FORBIDDEN_HTTP = '403';
    public const FORBIDDEN_CODE = 'FORBIDDEN';

    public const RESOURCE_DOES_NOT_EXIST_HTTP = '404';
    public const RESOURCE_DOES_NOT_EXIST_CODE = 'RESOURCE_DOES_NOT_EXIST';

    public const RESOURCE_EXISTS_HTTP = '409';
    public const RESOURCE_EXISTS_CODE = 'RESOURCE_EXISTS';
}
