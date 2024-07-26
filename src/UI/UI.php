<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use Slim\Routing\RouteCollectorProxy;
use VBCompetitions\CompetitionsAPI\Config;
use VBCompetitions\CompetitionsAPI\Middleware\AuthBySessionMiddleware;

class UI {
    private Config $config;

    // private App $app;

    /**
     * @param Config $config The configuration container
     */
    function __construct(Config $config)
    {
        $this->config = $config;
    }

    public function attachUIRoutes () : callable
    {
        return function (RouteCollectorProxy $group) {
            $auth_middleware = new AuthBySessionMiddleware($this->config, true);

            $group->get('/public[/{params:.*}]', function (Request $_, Response $res, array $args) {
                return Page::public($this->config, $res, explode('/', $args['params']));
            });

            $group->get('/static[/{params:.*}]', function (Request $_, Response $res, array $args) {
                return Page::static($this->config, $res, explode('/', $args['params']));
            });

            $group->get('/api-url.js', function (Request $_, Response $res) {
                return Page::apiRoute($this->config, $res);
            });

            $group->get('', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            });

            // let react router handle the URL
            $group->get('/c', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/c/{competition_id}', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/users', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/account', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/settings', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/settings/*', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            })
            ->add($auth_middleware);

            $group->get('/account/{link_id}', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            });

            $group->post('/account/{link_id}', function (Request $req, Response $res, $args) {
                return Account::activateAccount($this->config, $args['link_id'], $req, $res);
            });

            $group->get('/login', function (Request $_, Response $res) {
                return Page::root($this->config, $res);
            });

            $group->post('/login', function (Request $req, Response $res) {
                return Login::verifyPassword($this->config, $req, $res);
            });

            $group->get('/logout', function (Request $req, Response $res) {
                return Login::logout($this->config, $res);
            });
        };
    }

    public function attachUIDataRoutes () : callable
    {
        $get_post_mode = $this->config->getGetPostMode();

        return function (RouteCollectorProxy $group) use ($get_post_mode) {
            /*********************************************
              Routes for an individual user's own account
             ********************************************/
            $group->get('/a', function (Request $req, Response $res) {
                return Account::getAccount($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));


            $group->post('/a', function (Request $req, Response $res) {
                return Account::updateAccount($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            /**********************************************
              Routes for an individual user's own api keys
             *********************************************/
            $group->get('/k', function (Request $req, Response $res) {
                return Keys::getKeys($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            $group->post('/k', function (Request $req, Response $res) {
                return Keys::createKey($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            if ($get_post_mode) {
                $group->post('/k/{key_id}/patch', function (Request $req, Response $res, $args) {
                    return Keys::updateKey($this->config, $args['key_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->patch('/k/{key_id}', function (Request $req, Response $res, $args) {
                    return Keys::updateKey($this->config, $args['key_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            if ($get_post_mode) {
                $group->post('/k/{key_id}/delete', function (Request $req, Response $res, $args) {
                    return Keys::deleteKey($this->config, $args['key_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->delete('/k/{key_id}', function (Request $req, Response $res, $args) {
                    return Keys::deleteKey($this->config, $args['key_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            /****************************************
             Routes for an admin to manage the users
            ****************************************/
            $group->get('/u', function (Request $req, Response $res) {
                return Users::getUsers($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            $group->post('/u', function (Request $req, Response $res) {
                return Users::createUser($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            if ($get_post_mode) {
                $group->post('/u/{user_id}/patch', function (Request $req, Response $res, $args) {
                    return Users::updateUser($this->config, $args['user_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->patch('/u/{user_id}', function (Request $req, Response $res, $args) {
                    return Users::updateUser($this->config, $args['user_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            if ($get_post_mode) {
                $group->post('/u/{user_id}/delete', function (Request $req, Response $res, $args) {
                    return Users::deleteUser($this->config, $args['user_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->delete('/u/{user_id}', function (Request $req, Response $res, $args) {
                    return Users::deleteUser($this->config, $args['user_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            $group->get('/u/{user_id}/reset', function (Request $req, Response $res, $args) {
                return Users::resetUser($this->config, $args['user_id'], $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            /**********************************
              Routes for system admin commands
             **********************************/
            $group->get('/s/logs', function (Request $req, Response $res) {
                return Settings::getLogs($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            /************************************************
              Routes for application definitions and settings
             ************************************************/
            $group->get('/s/apps',  function (Request $req, Response $res) {
                return Settings::getApps($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            $group->post('/s/apps',  function (Request $req, Response $res) {
                return Settings::createApp($this->config, $req, $res);
            })->add(new AuthBySessionMiddleware($this->config));

            if ($get_post_mode) {
                $group->post('/s/apps/{app_id}/patch', function (Request $req, Response $res, $args) {
                    return Settings::updateApp($this->config, $args['app_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->patch('/s/apps/{app_id}', function (Request $req, Response $res, $args) {
                    return Settings::updateApp($this->config, $args['app_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            if ($get_post_mode) {
                $group->post('/s/apps/{app_id}/delete', function (Request $req, Response $res, $args) {
                    return Settings::deleteApp($this->config, $args['app_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            } else {
                $group->delete('/s/apps/{app_id}', function (Request $req, Response $res, $args) {
                    return Settings::deleteApp($this->config, $args['app_id'], $req, $res);
                })->add(new AuthBySessionMiddleware($this->config));
            }

            /*!!!!!!!!!!!!!!!!!!!!!!!!
              !! UNPROTECTED ROUTES !!
              !!!!!!!!!!!!!!!!!!!!!!!!*/

            /********************
              Account activation
             *******************/
            $group->get('/a/{link_id}', function (Request $req, Response $res, $args) {
                return Account::getUsernameFromLinkID($this->config, $args['link_id'], $req, $res);
            });
        };
    }
}
