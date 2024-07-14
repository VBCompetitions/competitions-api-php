<?php

namespace VBCompetitions\CompetitionsAPI\API;

use Exception;
use Ramsey\Uuid\Uuid;
use Throwable;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\Competitions\ContactRole;
use VBCompetitions\CompetitionsAPI\{
    AppConfig,
    ErrorMessage,
    Roles,
    Utils
};
use VBCompetitions\Competitions\CompetitionTeam;
use VBCompetitions\Competitions\Contact;

// Errorcodes 001FN
final class Contacts
{
    public static function getContacts(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contacts in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::contact()::get(), $competition_id, '0010');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00100');
        }

        $context->getLogger()->info('Contacts in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($team->getContacts()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createContact(AppConfig $config, string $competition_id, string $team_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a contact in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::contact()::create(), $competition_id, '0011');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00110');
        }

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_CONTACT_CREATE, '0011');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (property_exists($contact_data, 'id')) {
            $contact_id = $contact_data->id;
            $context->getLogger()->info('Contact ID specified as '.$contact_id);
        } else {
            $contact_id = Uuid::uuid4()->toString();
            $context->getLogger()->info('Contact ID not specified, so setting to '.$contact_id);
        }

        try {
            $roles = [];
            foreach ($contact_data->roles as $role) {
                array_push($roles, match ($role) {
                    'secretary' => ContactRole::SECRETARY,
                    'treasurer' => ContactRole::TREASURER,
                    'manager' => ContactRole::MANAGER,
                    'captain' => ContactRole::CAPTAIN,
                    'coach' => ContactRole::COACH,
                    'assistantCoach' => ContactRole::ASSISTANT_COACH,
                    'medic' => ContactRole::MEDIC,
                    default => throw new Exception('Invalid role: '.$role)
                });
            }
            $contact = new Contact($team, $contact_id, $roles);
            if (property_exists($contact_data, 'name')) {
                $contact->setName($contact_data->name);
            }
            if (property_exists($contact_data, 'emails')) {
                foreach ($contact_data->emails as $email) {
                    $contact->addEmail($email);
                }
            }
            if (property_exists($contact_data, 'phones')) {
                foreach ($contact_data->phones as $phone) {
                    $contact->addPhone($phone);
                }
            }
            $team->addContact($contact);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00111');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00112');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] created in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');
        $res->getBody()->write(json_encode('{"id":"'.$contact_id.'"}'));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getContact(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contact with ID ['.$contact_id.'] inteam with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::team()::get(), $competition_id, '0012');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00100');
        }

        try {
            $contact = $team->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00120');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($contact));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateContact(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the contact with ID ['.$contact_id.'] in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::contact()::update(), $competition_id, '0013');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00130');
        }

        try {
            $contact = $team->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00131');
        }

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, AppConfig::VALIDATE_CONTACT_UPDATE, '0013');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($contact_data, 'name')) {
                $old_name = $contact->getName();
                $contact->setName($contact_data->name);
                $context->getLogger()->info('Updating name of contact with ID ['.$team_id.'] from ['.$old_name.'] to ['.$contact_data->name.'] in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($contact_data, 'roles')) {
                $roles = [];
                foreach ($contact_data->roles as $role) {
                    array_push($roles, match ($role) {
                        'secretary' => ContactRole::SECRETARY,
                        'treasurer' => ContactRole::TREASURER,
                        'manager' => ContactRole::MANAGER,
                        'captain' => ContactRole::CAPTAIN,
                        'coach' => ContactRole::COACH,
                        'assistantCoach' => ContactRole::ASSISTANT_COACH,
                        'medic' => ContactRole::MEDIC,
                        default => throw new Exception('Invalid role: '.$role)
                    });
                }
                $contact->setRoles($roles);
            }
            if (property_exists($contact_data, 'emails')) {
                $contact->setEmails($contact_data->emails);
            }
            if (property_exists($contact_data, 'phones')) {
                $contact->setPhones($contact_data->phones);
            }
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00132');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00133');
        }

        $context->getLogger()->info('Updated contact with ID ['.$contact_id.'] and name ['.$contact->getName().'] in team with ID ['.$team_id.'] competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteContact(AppConfig $config, string $competition_id, string $team_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the contact with ID ['.$contact_id.'] in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::contact()::delete(), $competition_id, '0014');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $team = $competition->getTeam($team_id);
        if ($team->getID() === CompetitionTeam::UNKNOWN_TEAM_ID) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such team' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00140');
        }

        if (!$team->hasContact($contact_id)) {
            $context->getLogger()->info('Contact with ID ['.$contact_id.'] does not exist in team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $team->deleteContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00141');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00142');
        }

        $context->getLogger()->info('Deleted contact with ID ['.$contact_id.'] from team with ID ['.$team_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
