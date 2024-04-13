<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class LocalDevCORSMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler) : ResponseInterface
    {
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
        } else {
            $response = $handler->handle($request);
        }

        if (is_array($request->getHeader('origin')) && count($request->getHeader('origin')) > 0) {
            $response = $response->withHeader('access-control-allow-origin', $request->getHeader('origin'));
        }
        return $response->withHeader('access-control-allow-headers', 'content-type')
            ->withHeader('access-control-allow-methods', 'GET, PATCH, PUT, POST, DELETE')
            ->withHeader('access-control-allow-credentials', 'true');
    }
}
