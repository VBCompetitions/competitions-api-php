<?php

namespace VBCompetitions\CompetitionsAPI\API;

use PhpParser\ErrorHandler\Throwing;
use stdClass;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\Competitions\Competition;
// use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\Competitions\Player;
use VBCompetitions\CompetitionsAPI\Utils;
use VBCompetitions\CompetitionsAPI\AppConfig;
use VBCompetitions\CompetitionsAPI\ErrorMessage;
use VBCompetitions\CompetitionsAPI\Roles;

// Errorcodes 003FN
final class Matches
{
    public static function createMatch(AppConfig $config, string $competition_id, string $stage_id, string $group_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function updateMatch(AppConfig $config, string $competition_id, string $stage_id, string $group_id, string $match_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }

    public static function updateMatchResult(AppConfig $config, string $competition_id, string $stage_id, string $group_id, string $match_id, Request $req, Response $res) : Response
    {
        // TODO server end schema validation
        $context = $req->getAttribute('context');
        $roles = $req->getAttribute('roles');
        if ($roles === null) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Internal Server Error', ErrorMessage::INTERNAL_ERROR_CODE, '00310');
        }

        if (!Roles::roleCheck($roles, Roles::match()::results())) {
            return ErrorMessage::respondWithError($context, ErrorMessage::FORBIDDEN_HTTP, 'Insufficient roles', ErrorMessage::FORBIDDEN_CODE, '00311');
        }

        $requested_file = $config->getCompetitionsDir().DIRECTORY_SEPARATOR.$competition_id.'.json';
        if (Utils::checkPathTraversal($config->getCompetitionsDir(), $requested_file)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid competition ID', ErrorMessage::BAD_REQUEST_CODE, '00312');
        }

        $competition_file = realpath($requested_file);
        if ($competition_file === false) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Competition does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00313');
        }

        try {
            $competition = Competition::loadFromFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to load the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00314');
        }

        try {
            $stage = $competition->getStage($stage_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Stage does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00315');
        }

        try {
            $group = $stage->getGroup($group_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Group does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00316');
        }

        try {
            $match = $group->getMatch($match_id);
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Match does not exist', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00317');
        }

        try {
            $match_data = json_decode($req->getBody());
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, must be JSON', ErrorMessage::BAD_REQUEST_CODE, '00318');
        }

        if (!property_exists($match_data, 'homeTeam') ||
            !property_exists($match_data, 'awayTeam') ||
            !is_array($match_data->homeTeam->scores) ||
            !is_array($match_data->awayTeam->scores))
        {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, must contain scores', ErrorMessage::BAD_REQUEST_CODE, '00319');
        }

        try {
            $match->setScores($match_data->homeTeam->scores, $match_data->awayTeam->scores, ($match_data->complete !== null && $match_data->complete));
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, scores are invalid: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00340');
        }

        if (property_exists($match_data->homeTeam, 'mvp')) {
            try {
                if (strlen($match_data->homeTeam->mvp) > 0) {
                    if (preg_match('/^{(.*)}$/', $match_data->homeTeam->mvp, $player_matches)) {
                        $match->getHomeTeam()->setMVP($competition->getPlayer($player_matches[1]));
                    } else {
                        $match->getHomeTeam()->setMVP(new Player($competition, Player::UNREGISTERED_PLAYER_ID, $match_data->homeTeam->mvp));
                    }
                } else {
                    $match->getHomeTeam()->setMVP(null);
                }
            } catch (Throwable $th) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, invalid home team MVP: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00341');
            }
        }

        if (property_exists($match_data->awayTeam, 'mvp')) {
            try {
                if (strlen($match_data->awayTeam->mvp) > 0) {
                    if (preg_match('/^{(.*)}$/', $match_data->awayTeam->mvp, $player_matches)) {
                        $match->getAwayTeam()->setMVP($competition->getPlayer($player_matches[1]));
                    } else {
                        $match->getAwayTeam()->setMVP(new Player($competition, Player::UNREGISTERED_PLAYER_ID, $match_data->awayTeam->mvp));
                    }
                } else {
                    $match->getAwayTeam()->setMVP(null);
                }
            } catch (Throwable $th) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, invalid away team MVP: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00342');
            }
        }

        if (property_exists($match_data, 'mvp')) {
            try {
                if (strlen($match_data->mvp) > 0) {
                    if (preg_match('/^{(.*)}$/', $match_data->mvp, $player_matches)) {
                        $match->setMVP($competition->getPlayer($match_data->mvp));
                    } else {
                        $match->setMVP(new Player($competition, Player::UNREGISTERED_PLAYER_ID, $match_data->mvp));
                    }
                } else {
                    $match->setMVP(null);
                }
            } catch (Throwable $th) {
                return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, 'Invalid match data, invalid match MVP: '.$th->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00343');
            }
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $th) {
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to update the match', ErrorMessage::INTERNAL_ERROR_CODE, '00344');
        }

        return $res;
    }

    public static function deleteMatch(AppConfig $config, string $competition_id, string $stage_id, string $group_id, string $match_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        return $res;
    }
}
