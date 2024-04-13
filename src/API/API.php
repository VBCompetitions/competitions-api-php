<?php

namespace VBCompetitions\CompetitionsAPI\API;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

use VBCompetitions\CompetitionsAPI\API\Competitions;
use VBCompetitions\CompetitionsAPI\API\Contacts;
use VBCompetitions\CompetitionsAPI\API\Groups;
use VBCompetitions\CompetitionsAPI\API\Matches;
use VBCompetitions\CompetitionsAPI\API\Players;
use VBCompetitions\CompetitionsAPI\API\Stages;
use VBCompetitions\CompetitionsAPI\API\Teams;

use Slim\Routing\RouteCollectorProxy;
use VBCompetitions\CompetitionsAPI\AppConfig;

final class API
{
    private AppConfig $config;

    /**
     * @param AppConfig $config The configuration container
     */
    function __construct(AppConfig $config)
    {
        $this->config = $config;
    }

    public function attachRoutes()
    {
        $get_post_mode = $this->config->getGetPostMode();

        return function (RouteCollectorProxy $group) use ($get_post_mode) {
            /************ Competitions ************/
            $group->get('/c', function (Request $req, Response $res) {
                return Competitions::getCompetitions($this->config, $req, $res);
            });

            $group->post('/c', function (Request $req, Response $res) {
                return Competitions::createCompetition($this->config, $req, $res);
            });

            $group->get('/c/{competition_id}', function (Request $req, Response $res, $args) {
                return Competitions::getCompetitionByID($this->config, $args['competition_id'], $req, $res);
            });

            $group->post('/c/{competition_id}', function (Request $req, Response $res, $args) {
                return Competitions::createCompetitionByID($this->config, $args['competition_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/put', function (Request $req, Response $res, $args) {
                    return Competitions::updateCompetitionByID($this->config, $args['competition_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}', function (Request $req, Response $res, $args) {
                    return Competitions::updateCompetitionByID($this->config, $args['competition_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->delete('/c/{competition_id}/delete', function (Request $req, Response $res, $args) {
                    return Competitions::deleteCompetitionByID($this->config, $args['competition_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}', function (Request $req, Response $res, $args) {
                    return Competitions::deleteCompetitionByID($this->config, $args['competition_id'], $req, $res);
                });
            }

            /************ Stages ************/
            $group->post('/c/{competition_id}/s', function (Request $req, Response $res, $args) {
                return Stages::createStage($this->config, $args['competition_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/put', function (Request $req, Response $res, $args) {
                    return Stages::updateStageByID($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}', function (Request $req, Response $res, $args) {
                return Stages::updateStageByID($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/delete', function (Request $_, Response $res, $args) {
                    return Stages::deleteStageByID($this->config, $args['competition_id'], $args['stage_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}', function (Request $_, Response $res, $args) {
                return Stages::deleteStageByID($this->config, $args['competition_id'], $args['stage_id'], $res);
                });
            }

            /************ Groups ************/
            $group->post('/c/{competition_id}/s/{stage_id}/g', function (Request $req, Response $res, $args) {
                return Groups::createGroup($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/put', function (Request $req, Response $res, $args) {
                    return Groups::updateGroupByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}/g/{group_id}', function (Request $req, Response $res, $args) {
                return Groups::updateGroupByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/delete', function (Request $_, Response $res, $args) {
                    return Groups::deleteGroupByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}/g/{group_id}', function (Request $_, Response $res, $args) {
                return Groups::deleteGroupByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $res);
                });
            }

            /************ Matches ************/
            $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m', function (Request $req, Response $res, $args) {
                return Matches::createMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}/put', function (Request $req, Response $res, $args) {
                    return Matches::updateMatchByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}', function (Request $req, Response $res, $args) {
                return Matches::updateMatchByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}/delete', function (Request $_, Response $res, $args) {
                    return Matches::deleteMatchByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}', function (Request $_, Response $res, $args) {
                return Matches::deleteMatchByID($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $res);
                });
            }

            /************ Teams ************/
            $group->get('/c/{competition_id}/t', function (Request $_, Response $res, $args) {
                return Teams::getTeams($this->config, $args['competition_id'], $res);
            });

            $group->post('/c/{competition_id}/t', function (Request $req, Response $res, $args) {
                return Teams::addTeam($this->config, $args['competition_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/t/{team_id}', function (Request $_, Response $res, $args) {
                return Teams::getTeamByID($this->config, $args['competition_id'], $args['team_id'], $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                return Teams::addTeamByID($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/put', function (Request $req, Response $res, $args) {
                    return Teams::updateTeamByID($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                return Teams::updateTeamByID($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/delete', function (Request $_, Response $res, $args) {
                    return Teams::deleteTeamByID($this->config, $args['competition_id'], $args['team_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/t/{team_id}', function (Request $_, Response $res, $args) {
                return Teams::deleteTeamByID($this->config, $args['competition_id'], $args['team_id'], $res);
                });
            }

            /************ Contacts ************/
            $group->get('/c/{competition_id}/t/{team_id}/c', function (Request $_, Response $res, $args) {
                return Contacts::getContacts($this->config, $args['competition_id'], $args['team_id'], $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}/c', function (Request $req, Response $res, $args) {
                return Contacts::addContact($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $_, Response $res, $args) {
                return Contacts::getContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $req, Response $res, $args) {
                return Contacts::addContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/c/{contact_id}/put', function (Request $req, Response $res, $args) {
                    return Contacts::updateContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $req, Response $res, $args) {
                return Contacts::updateContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/c/{contact_id}/delete', function (Request $_, Response $res, $args) {
                    return Contacts::deleteContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $_, Response $res, $args) {
                return Contacts::deleteContactByID($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $res);
                });
            }

            /************ Players ************/
            $group->get('/c/{competition_id}/t/{team_id}/p', function (Request $_, Response $res, $args) {
                return Players::getPlayers($this->config, $args['competition_id'], $args['team_id'], $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}/p', function (Request $req, Response $res, $args) {
                return Players::addPlayer($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/t/{team_id}/p/{player_id}', function (Request $_, Response $res, $args) {
                return Players::getPlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}/p/{player_id}', function (Request $req, Response $res, $args) {
                return Players::addPlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/p/{player_id}/put', function (Request $req, Response $res, $args) {
                    return Players::updatePlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/t/{team_id}/p/{player_id}', function (Request $req, Response $res, $args) {
                return Players::updatePlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/p/{player_id}/delete', function (Request $_, Response $res, $args) {
                    return Players::deletePlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $res);
                });
            } else {
                $group->delete('/c/{competition_id}/t/{team_id}/p/{player_id}', function (Request $_, Response $res, $args) {
                return Players::deletePlayerByID($this->config, $args['competition_id'], $args['team_id'], $args['player_id'], $res);
                });
            }
        };
    }

}
