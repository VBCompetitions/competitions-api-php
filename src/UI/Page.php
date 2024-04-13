<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use Exception;
use Psr\Http\Message\ResponseInterface as Response;
use Throwable;
use VBCompetitions\CompetitionsAPI\Utils;
use VBCompetitions\CompetitionsAPI\AppConfig;

final class Page
{
    public static function root(AppConfig $config, Response $res)
    {
        $body = '<!DOCTYPE html><html><head><title>VBCompetitions API</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script defer="defer" src="'.$config->getBasePath().'/ui/api-url.js"></script>
        <script defer="defer" src="'.$config->getBasePath().'/ui/static/js/main.cdf043ff.js"></script>
        <link href="'.$config->getBasePath().'/ui/static/css/main.1099adbd.css" rel="stylesheet">
        </head><body><div id="root"></div></body></html>';
        $res->getBody()->write($body);
        return $res;
    }

    public static function public(AppConfig $config, Response $res, array $file)
    {
        $requested_file = __DIR__.DIRECTORY_SEPARATOR.'public'.DIRECTORY_SEPARATOR.join(DIRECTORY_SEPARATOR, $file);

        if (Utils::checkPathTraversal(__DIR__.DIRECTORY_SEPARATOR.'public', $requested_file)) {
            $res->getBody()->write('Bad request');
            return $res->withStatus(400)->withHeader('content-type', 'html/text');
        }

        $real_file = realpath($requested_file);

        if ($real_file === false) {
            return $res->withStatus(404);
        }

        $pathinfo = pathinfo($real_file);

        try {
            $content_type = Page::getContentType($pathinfo['extension']);
        } catch (Throwable $_) {
            $res->getBody()->write('Bad file type');
            return $res->withStatus(400)->withHeader('content-type', 'html/text');
        }

        $res->getBody()->write(file_get_contents($real_file));
        return $res->withHeader('content-type', $content_type);
    }

    public static function static(AppConfig $config, Response $res, array $file)
    {
        $requested_file = __DIR__.DIRECTORY_SEPARATOR.'app'.DIRECTORY_SEPARATOR.'static'.DIRECTORY_SEPARATOR.join(DIRECTORY_SEPARATOR, $file);

        if (Utils::checkPathTraversal(__DIR__.DIRECTORY_SEPARATOR.'app', $requested_file)) {
            $res->getBody()->write('Bad request');
            return $res->withStatus(400)->withHeader('content-type', 'html/text');
        }

        $real_file = realpath($requested_file);

        if ($real_file === false) {
            return $res->withStatus(404);
        }

        $pathinfo = pathinfo($real_file);

        try {
            $content_type = Page::getContentType($pathinfo['extension']);
        } catch (Throwable $_) {
            $res->getBody()->write('Bad file type');
            return $res->withStatus(400)->withHeader('content-type', 'html/text');
        }

        $res->getBody()->write(file_get_contents($real_file));
        return $res->withHeader('content-type', $content_type);
    }

    public static function apiRoute(AppConfig $config, Response $res)
    {
        $vbc_base_path = 'window.VBC_BASE_PATH=\''.$config->getBasePath().'\'';
        $vbc_api_url = 'window.VBC_API_URL=\''.$_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['SERVER_NAME'].$config->getBasePath().'/api/v1\'';
        $vbc_ui_url = 'window.VBC_UI_URL=\''.$_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['SERVER_NAME'].$config->getBasePath().'/ui\'';
        $vbc_uidata_url = 'window.VBC_UIDATA_URL=\''.$_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['SERVER_NAME'].$config->getBasePath().'/uidata\'';
        $vbc_get_post_mode = 'window.VBC_GET_POST_MODE='.($config->getGetPostMode() ? 'true' : 'false');
        $res->getBody()->write($vbc_base_path.PHP_EOL.$vbc_api_url.PHP_EOL.$vbc_ui_url.PHP_EOL.$vbc_uidata_url.PHP_EOL.$vbc_get_post_mode);
        return $res->withHeader('content-type', 'text/javascript');
    }

    public static function githubMark(Response $res)
    {
        $res->getBody()->write(file_get_contents(realpath(__DIR__.'/public/github-mark-white.png')));
        return $res->withHeader('Content-type', 'image/png');
    }

    private static function getContentType(string $extension) : string
    {
        return match ($extension) {
            'css' => 'text/css',
            'html' => 'text/html',
            'ico' => 'image/vnd.microsoft.icon',
            'js' => 'text/javascript',
            'json' => 'application/json',
            'map' => 'text/plain',
            'png' => 'image/png',
            'svg' => 'image/svg+xml',
            'txt' => 'text/plain',
            'woff' => 'application/font-woff',
            'woff2' => 'application/font-woff2',
            default => throw new Exception()
        };
    }
}
