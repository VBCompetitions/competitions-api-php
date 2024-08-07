<?php

namespace VBCompetitions\CompetitionsAPI;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\App;
use Slim\Factory\AppFactory;
use Slim\Middleware\ContentLengthMiddleware;

use VBCompetitions\CompetitionsAPI\API\API;
use VBCompetitions\CompetitionsAPI\UI\UI;
use VBCompetitions\CompetitionsAPI\Middleware\AddContextMiddleware;
use VBCompetitions\CompetitionsAPI\Middleware\AuthByKeyOrSessionMiddleware;
use VBCompetitions\CompetitionsAPI\Middleware\LocalDevCORSMiddleware;

class CompetitionsAPI {
    private Config $config;
    private Context $context;

    private App $app;

    private API $api;

    private UI $ui;


    /**
     * @param array $config Config options
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

        $this->config = new Config($config);
        $this->context = new Context($this->config);

        $this->app = AppFactory::create();
        $this->app->setBasePath($config['url_base_path']);
        $this->app->addBodyParsingMiddleware();
        $this->app->addRoutingMiddleware();
        // TODO - prod should set error handler to be quiet to the client
        $this->app->addErrorMiddleware($developer_mode, $developer_mode, $developer_mode);
        $this->app->add(new ContentLengthMiddleware());
        $this->app->add(new AddContextMiddleware($this->context));

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

        $this->app->get('/', function (Request $_, Response $res) {
            $res = $res->withHeader('location', $this->config->getBasePath().'/ui')->withStatus(302);
            return $res;
        });

        $this->app->run();
    }

    function getApp() : App
    {
        return $this->app;
    }

    function getConfig() : Config
    {
        return $this->config;
    }
}
