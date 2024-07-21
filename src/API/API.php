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
            /*********************
             * COMPETITIONS
             ********************/
            $group->get('/c', function (Request $req, Response $res) {
                return Competitions::getCompetitions($this->config, $req, $res);
            });

            $group->post('/c', function (Request $req, Response $res) {
                return Competitions::createCompetition($this->config, $req, $res);
            });

            $group->get('/c/{competition_id}', function (Request $req, Response $res, $args) {
                return Competitions::getCompetition($this->config, $args['competition_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/put', function (Request $req, Response $res, $args) {
                    return Competitions::updateCompetition($this->config, $args['competition_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}', function (Request $req, Response $res, $args) {
                    return Competitions::updateCompetition($this->config, $args['competition_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/delete', function (Request $req, Response $res, $args) {
                    return Competitions::deleteCompetition($this->config, $args['competition_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}', function (Request $req, Response $res, $args) {
                    return Competitions::deleteCompetition($this->config, $args['competition_id'], $req, $res);
                });
            }

            /*********************
             * CLUBS
             ********************/
            $group->get('/c/{competition_id}/c', function (Request $req, Response $res, $args) {
                return Clubs::getClubs($this->config, $args['competition_id'], $req, $res);
            });

            $group->post('/c/{competition_id}/c', function (Request $req, Response $res, $args) {
                return Clubs::createClub($this->config, $args['competition_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/c/{club_id}', function (Request $req, Response $res, $args) {
                return Clubs::getClub($this->config, $args['competition_id'], $args['club_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/c/{club_id}/put', function (Request $req, Response $res, $args) {
                    return Clubs::updateClub($this->config, $args['competition_id'], $args['club_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/c/{club_id}', function (Request $req, Response $res, $args) {
                    return Clubs::updateClub($this->config, $args['competition_id'], $args['club_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/c/{club_id}/delete', function (Request $req, Response $res, $args) {
                    return Clubs::deleteClub($this->config, $args['competition_id'], $args['club_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/c/{club_id}', function (Request $req, Response $res, $args) {
                    return Clubs::deleteClub($this->config, $args['competition_id'], $args['club_id'], $req, $res);
                });
            }

            /*********************
             * TEAMS
             ********************/
            $group->get('/c/{competition_id}/t', function (Request $req, Response $res, $args) {
                return Teams::getTeams($this->config, $args['competition_id'], $req, $res);
            });

            $group->post('/c/{competition_id}/t', function (Request $req, Response $res, $args) {
                return Teams::createTeam($this->config, $args['competition_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                return Teams::getTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/put', function (Request $req, Response $res, $args) {
                    return Teams::updateTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                    return Teams::updateTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/delete', function (Request $req, Response $res, $args) {
                    return Teams::deleteTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                    return Teams::deleteTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
                });
            }

            /*********************
             * CONTACTS
             ********************/
            $group->get('/c/{competition_id}/t/{team_id}/c', function (Request $req, Response $res, $args) {
                return Contacts::getContacts($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            $group->post('/c/{competition_id}/t/{team_id}/c', function (Request $req, Response $res, $args) {
                return Contacts::createContact($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $req, Response $res, $args) {
                return Contacts::getContact($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/c/{contact_id}/put', function (Request $req, Response $res, $args) {
                    return Contacts::updateContact($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $req, Response $res, $args) {
                    return Contacts::updateContact($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/t/{team_id}/c/{contact_id}/delete', function (Request $req, Response $res, $args) {
                    return Contacts::deleteContact($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/t/{team_id}/c/{contact_id}', function (Request $req, Response $res, $args) {
                    return Contacts::deleteContact($this->config, $args['competition_id'], $args['team_id'], $args['contact_id'], $req, $res);
                });
            }

            /*********************
             * PLAYERS
             ********************/
            $group->get('/c/{competition_id}/p', function (Request $req, Response $res, $args) {
                return Players::getPlayers($this->config, $args['competition_id'], $req, $res);
            });

            $group->post('/c/{competition_id}/p', function (Request $req, Response $res, $args) {
                return Players::createPlayer($this->config, $args['competition_id'], $req, $res);
            });

            $group->get('/c/{competition_id}/p/{player_id}', function (Request $req, Response $res, $args) {
                return Players::getPlayer($this->config, $args['competition_id'], $args['player_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/p/{player_id}/put', function (Request $req, Response $res, $args) {
                    return Players::updatePlayer($this->config, $args['competition_id'], $args['player_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/p/{player_id}', function (Request $req, Response $res, $args) {
                    return Players::updatePlayer($this->config, $args['competition_id'], $args['player_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/p/{player_id}/delete', function (Request $req, Response $res, $args) {
                    return Players::deletePlayer($this->config, $args['competition_id'], $args['player_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/p/{player_id}', function (Request $req, Response $res, $args) {
                    return Players::deletePlayer($this->config, $args['competition_id'], $args['player_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/p/{player_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                    return Players::transferPlayer($this->config, $args['competition_id'], $args['player_id'], $args['team_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/p/{player_id}/t/{team_id}', function (Request $req, Response $res, $args) {
                    return Players::transferPlayer($this->config, $args['competition_id'], $args['player_id'], $args['team_id'], $req, $res);
                });
            }

            $group->get('/c/{competition_id}/t/{team_id}/p', function (Request $req, Response $res, $args) {
                return Players::getPlayersForTeam($this->config, $args['competition_id'], $args['team_id'], $req, $res);
            });

            /*********************
             * STAGES
             ********************/
            $group->post('/c/{competition_id}/s', function (Request $req, Response $res, $args) {
                return Stages::appendStage($this->config, $args['competition_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/put', function (Request $req, Response $res, $args) {
                    return Stages::updateStage($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}', function (Request $req, Response $res, $args) {
                    return Stages::updateStage($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/delete', function (Request $req, Response $res, $args) {
                    return Stages::deleteStage($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}', function (Request $req, Response $res, $args) {
                    return Stages::deleteStage($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
                });
            }

            /*********************
             * GROUPS
             ********************/
            $group->post('/c/{competition_id}/s/{stage_id}/g', function (Request $req, Response $res, $args) {
                return Groups::createGroup($this->config, $args['competition_id'], $args['stage_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/put', function (Request $req, Response $res, $args) {
                    return Groups::updateGroup($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}/g/{group_id}', function (Request $req, Response $res, $args) {
                    return Groups::updateGroup($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/delete', function (Request $req, Response $res, $args) {
                    return Groups::deleteGroup($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}/g/{group_id}', function (Request $req, Response $res, $args) {
                    return Groups::deleteGroup($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
                });
            }

            /*********************
             * MATCHES
             ********************/
            $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m', function (Request $req, Response $res, $args) {
                return Matches::createMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $req, $res);
            });

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}/put', function (Request $req, Response $res, $args) {
                    return Matches::updateMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            } else {
                $group->put('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}', function (Request $req, Response $res, $args) {
                    return Matches::updateMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}/patch', function (Request $req, Response $res, $args) {
                    return Matches::updateMatchResult($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            } else {
                $group->patch('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}', function (Request $req, Response $res, $args) {
                    return Matches::updateMatchResult($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            }

            if ($get_post_mode) {
                $group->post('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}/delete', function (Request $req, Response $res, $args) {
                    return Matches::deleteMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            } else {
                $group->delete('/c/{competition_id}/s/{stage_id}/g/{group_id}/m/{match_id}', function (Request $req, Response $res, $args) {
                    return Matches::deleteMatch($this->config, $args['competition_id'], $args['stage_id'], $args['group_id'], $args['match_id'], $req, $res);
                });
            }
        };
    }

}
