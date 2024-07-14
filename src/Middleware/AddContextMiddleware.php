<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;
use VBCompetitions\CompetitionsAPI\Context;

class AddContextMiddleware implements MiddlewareInterface
{
    private Context $context;

    public function __construct(Context $context) {
        $this->context = $context;
    }

    public function process(ServerRequestInterface $req, RequestHandlerInterface $handler) : ResponseInterface
    {
        $req = $req->withAttribute('context', $this->context);
        return $handler->handle($req);
    }
}
