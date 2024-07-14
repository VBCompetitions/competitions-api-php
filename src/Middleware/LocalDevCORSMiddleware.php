<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class LocalDevCORSMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $req, RequestHandlerInterface $handler) : ResponseInterface
    {
        if ($req->getMethod() === 'OPTIONS') {
            $response = new Response();
        } else {
            $response = $handler->handle($req);
        }

        if (is_array($req->getHeader('origin')) && count($req->getHeader('origin')) > 0) {
            $response = $response->withHeader('access-control-allow-origin', $req->getHeader('origin'));
        }
        return $response->withHeader('access-control-allow-headers', 'content-type, authorization')
            ->withHeader('access-control-allow-methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS')
            ->withHeader('access-control-allow-credentials', 'true');
    }
}
