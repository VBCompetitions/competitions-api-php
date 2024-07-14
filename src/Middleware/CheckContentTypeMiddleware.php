<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

class CheckContentTypeMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $req, RequestHandlerInterface $handler) : ResponseInterface
    {
        $context = $req->getAttribute('context');
        $content_type = $req->getHeader('content-type');

        if (count($content_type) > 1) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_DATA_HTTP, 'Multiple content type headers found; there must be only one', ErrorMessage::BAD_DATA_CODE, null);
        }

        $method = $req->getMethod();

        if ($method === 'POST' || $method === 'PUT'){
            if ($content_type[0] !== 'application/json') {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_DATA_HTTP, 'Bad content type, the content-type header should be "application/json"', ErrorMessage::BAD_DATA_CODE, null);
            }

            $json_body = $req->getParsedBody();

            if ($json_body === null) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_DATA_HTTP, 'Bad content, the body must be valid JSON', ErrorMessage::BAD_DATA_CODE, null);
            }
            // if ()
        }

        return $handler->handle($req);
    }
}
