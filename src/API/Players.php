<?php

namespace VBCompetitions\CompetitionsAPI\API;

use Ramsey\Uuid\Uuid;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use Throwable;
use VBCompetitions\Competitions\Player;
use VBCompetitions\Competitions\PlayerTeam;
use VBCompetitions\CompetitionsAPI\{
    AppConfig,
    ErrorMessage,
    Roles,
    Utils
};
use VBCompetitions\Competitions\CompetitionTeam;

// Errorcodes 004FN
final class Players
{
    public static function getPlayers(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the players in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::player()::get(), $competition_id, '0040');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $context->getLogger()->info('Players in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($competition->getPlayers()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createPlayer(AppConfig $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a player in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::player()::create(), $competition_id, '0041');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $player_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_PLAYER_CREATE, '0041');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($player_data, 'id')) {
            $player_id = $player_data->id;
            $context->getLogger()->info('Player ID specified as '.$player_id);
        } else {
            $player_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Player ID not specified, so setting to '.$player_id);
        }

        try {
            $player = new Player($competition, $player_id, $player_data->name);
            if (property_exists($player_data, 'number')) {
                $player->setNumber($player_data->number);
            }
            if (property_exists($player_data, 'teams')) {
                foreach ($player_data->teams as $team) {
                    $player_team = new PlayerTeam($player, $team->id);
                    if (property_exists($team, 'from')) {
                        $player_team->setFrom($team->from);
                    }
                    if (property_exists($team, 'until')) {
                        $player_team->setUntil($team->until);
                    }
                    if (property_exists($team, 'notes')) {
                        $player_team->setNotes($team->notes);
                    }
                    $player->appendTeamEntry($player_team);
                }
            }
            if (property_exists($player_data, 'notes')) {
                $player->setNotes($player_data->notes);
            }
            $competition->addPlayer($player);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00410');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00411');
        }

        $context->getLogger()->info('Player with name ['.$player_data->name.'] and ID ['.$player_id.'] created');
        $res->getBody()->write(json_encode('{"id":"'.$player_id.'"}'));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getPlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the player with ID ['.$player_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::get(), $competition_id, '0042');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $player = $competition->getPlayer($player_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the player', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00420');
        }

        $context->getLogger()->info('Player with ID ['.$player_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($player));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updatePlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the player with ID ['.$player_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::contact()::update(), $competition_id, '0043');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $player = $competition->getPlayer($player_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the player', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00430');
        }

        try {
            $player_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_PLAYER_UPDATE, '0043');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($player_data, 'name')) {
                $old_name = $player->getName();
                $player->setName($player_data->name);
                $context->getLogger()->info('Updating name of player with ID ['.$player_id.'] from ['.$old_name.'] to ['.$player_data->name.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($player_data, 'number')) {
                $player->setNumber($player_data->number);
            }
            if (property_exists($player_data, 'teams')) {
                $player->spliceTeamEntries(0, count($player->getTeamEntries()));
                foreach ($player_data->teams as $team) {
                    $player_team = new PlayerTeam($player, $team->id);
                    if (property_exists($team, 'from')) {
                        $player_team->setFrom($team->from);
                    }
                    if (property_exists($team, 'until')) {
                        $player_team->setUntil($team->until);
                    }
                    if (property_exists($team, 'notes')) {
                        $player_team->setNotes($team->notes);
                    }
                    $player->appendTeamEntry($player_team);
                }
            }
            if (property_exists($player_data, 'notes')) {
                $player->setNotes($player_data->notes);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00431');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00432');
        }

        $context->getLogger()->info('Updated player with ID ['.$player_id.'] and name ['.$player->getName().'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deletePlayer(AppConfig $config, string $competition_id, string $player_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the player with ID ['.$player_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::player()::delete(), $competition_id, '0044');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasPlayer($player_id)) {
            $context->getLogger()->info('Player with ID ['.$player_id.'] does not exist in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $competition->deletePlayer($player_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00441');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00442');
        }

        $context->getLogger()->info('Deleted player with ID ['.$player_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function transferPlayer(AppConfig $config, string $competition_id, string $player_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to transfer the player with ID ['.$player_id.'] to team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::player()::transfer(), $competition_id, '0045');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $player = $competition->getPlayer($player_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the player', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00450');
        }

        try {
            $transfer_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_PLAYER_TRANSFER, '0045');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            // Technically we can transfer to a non-existent team ID - imagine someone transferring to a different competition, and you still want to mark that they're no longer part of this competition
            $team_entry = new PlayerTeam($player, $team_id);
            if (property_exists($transfer_data, 'date')) {
                $existing_team_entries = $player->getTeamEntries();
                if (count($existing_team_entries) > 0) {
                    $existing_team_entries[count($existing_team_entries) - 1]->setUntil($transfer_data->date);
                }
                $team_entry->setFrom($transfer_data->date);
            }
            if (property_exists($transfer_data, 'notes')) {
                $team_entry->setNotes($transfer_data->notes);
            }
            $player->appendTeamEntry($team_entry);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00451');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00452');
        }

        $context->getLogger()->info('Transferred player with ID ['.$player_id.'] and name ['.$player->getName().'] to team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function getPlayersForTeam(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the players in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::player()::get(), $competition_id, '0046');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00100');
        }

        $context->getLogger()->info('Players team with ID ['.$team_id.'] in in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($team->getPlayers()));
        return $res->withHeader('Content-Type', 'application/json');
    }
}
