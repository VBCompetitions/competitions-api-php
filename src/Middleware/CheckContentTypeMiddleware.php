<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

class CheckContentTypeMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler) : ResponseInterface
    {
        $content_type = $request->getHeader('content-type');

        if (count($content_type) > 1) {
            return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Multiple content type headers found; there must be only one', ErrorMessage::BAD_DATA_TEXT, null);
        }

        $method = $request->getMethod();

        if ($method === 'POST' || $method === 'PUT'){
            if ($content_type[0] !== 'application/json') {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Bad content type, the content-type header should be "application/json"', ErrorMessage::BAD_DATA_TEXT, null);
            }

            $json_body = $request->getParsedBody();

            if ($json_body === null) {
                return ErrorMessage::respondWithError(ErrorMessage::BAD_DATA_CODE, 'Bad content, the body must be valid JSON', ErrorMessage::BAD_DATA_TEXT, null);
            }
            // if ()
        }

        return $handler->handle($request);
    }
}
