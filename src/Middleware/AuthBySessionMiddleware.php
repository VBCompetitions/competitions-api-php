<?php

namespace VBCompetitions\CompetitionsAPI\Middleware;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;
use VBCompetitions\CompetitionsAPI\Config;
use VBCompetitions\CompetitionsAPI\ErrorMessage;

class AuthBySessionMiddleware implements MiddlewareInterface
{
    private Config $config;
    private bool $redirect_to_login;

    public function __construct(Config $config, bool $redirect_to_login = false) {
        $this->config = $config;
        $this->redirect_to_login = $redirect_to_login;
    }

    public function process(ServerRequestInterface $req, RequestHandlerInterface $handler) : ResponseInterface
    {
        $context = $req->getAttribute('context');
        // session tokens are in a cookie with the name defined by Config::SESSION_COOKIE
        $cookies = $req->getCookieParams();
        if (array_key_exists(Config::SESSION_COOKIE, $cookies)) {
            session_save_path($this->config->getSessionDir());
            session_name(Config::SESSION_COOKIE);
            session_start();
            if (!isset($_SESSION['valid']) || $_SESSION['valid'] != true) {
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
            }

            $users_file = $this->config->getUsersDir().DIRECTORY_SEPARATOR.'users.json';
            $h = fopen($users_file, 'r');
            $json = fread($h, filesize($users_file));
            fclose($h);
            $users_data = json_decode($json);
            if ($users_data === null) {
                return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Authentication Error', ErrorMessage::INTERNAL_ERROR_CODE, null);
            }

            // Check if user exists and is active
            if (!property_exists($users_data->users, $_SESSION['user_id']) || $users_data->users->{$_SESSION['user_id']}->state !== 'active') {
                // The user has been deleted!
                session_unset();
                session_destroy();
                setcookie(session_name(), "", time() - 3600, '/');
                return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
            }

            if (property_exists($users_data->users, 'app')) {
                $context->setAppName($users_data->users->app);
            } else {
                $context->setAppName('VBC');
            }
            $context->setUserID($_SESSION['user_id']);
            $context->setUserName($users_data->users->{$_SESSION['user_id']}->username);
            $req = $req->withAttribute('roles', $users_data->users->{$_SESSION['user_id']}->roles);
            return $handler->handle($req);
        }

        // No valid key + no session = access denied

        if ($this->redirect_to_login) {
            // UI webpage call, redirect to login
            $response = new Response();
            $return_to = '/ui/c';
            $request_path = $req->getUri()->getPath();
            if (str_starts_with($request_path, $this->config->getBasePath())) {
                $return_to = substr($request_path, strlen($this->config->getBasePath()));
            }
            $response = $response->withHeader('location', $this->config->getBasePath().'/ui/login?returnTo='.$return_to)->withStatus(302);
            return $response;
        }

        // UI Data call, return 401
        return ErrorMessage::respondWithError($context, ErrorMessage::UNAUTHORIZED_HTTP, 'Authentication Error', ErrorMessage::UNAUTHORIZED_CODE, null);
    }
}
