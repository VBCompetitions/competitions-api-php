<?php

namespace VBCompetitions\CompetitionsAPI;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\App;
use Slim\Factory\AppFactory;
use Slim\Middleware\ContentLengthMiddleware;

use VBCompetitions\CompetitionsAPI\API\API;
use VBCompetitions\CompetitionsAPI\UI\UI;
use VBCompetitions\CompetitionsAPI\Middleware\AuthByKeyOrSessionMiddleware;
use VBCompetitions\CompetitionsAPI\Middleware\LocalDevCORSMiddleware;

class CompetitionsAPI {
    private AppConfig $config;

    private App $app;

    private API $api;

    private UI $ui;


    /**
     * @param string $logo_path (optional) Path to an SVG file containing an SVG expecte to be 300px wide and 90 px high
     */
    function __construct(array $config)
    {
        $developer_mode = false;
        if (key_exists('developer_mode', $config)) {
            $developer_mode = $config['developer_mode'];
        }

        if (!key_exists('get_post_mode', $config)) {
            $config['get_post_mode'] = false;
        }

        $this->config = new AppConfig($config);

        $this->app = AppFactory::create();
        $this->app->setBasePath($config['url_base_path']);
        $this->app->addBodyParsingMiddleware();
        $this->app->addRoutingMiddleware();
        // TODO - prod should set error handler to be quiet to the client
        $this->app->addErrorMiddleware($developer_mode, $developer_mode, $developer_mode);
        $contentLengthMiddleware = new ContentLengthMiddleware();
        $this->app->add($contentLengthMiddleware);

        if ($developer_mode) {
            $this->app->add(new LocalDevCORSMiddleware());
        }

        $this->api = new API($this->config);
        $this->ui = new UI($this->config);

        // Calls to the Competition API are mounted on /api/v1
        $this->app->group('/api/v1', $this->api->attachRoutes())
            ->add(new AuthByKeyOrSessionMiddleware($this->config));

        // Calls to the UI webpages are mounted on /ui
        $this->app->group('/ui', $this->ui->attachUIRoutes());

        // Calls to the UI backend are mounted on /uidata
        $this->app->group('/uidata', $this->ui->attachUIDataRoutes());

        $this->app->run();
    }

    function getApp() : App
    {
        return $this->app;
    }

    function getConfig() : AppConfig
    {
        return $this->config;
    }
}
