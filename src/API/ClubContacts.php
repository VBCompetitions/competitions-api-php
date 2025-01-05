<?php

namespace VBCompetitions\CompetitionsAPI\API;

use stdClass;
use Exception;
use Ramsey\Uuid\Uuid;
use Throwable;
use Slim\Psr7\Request;
use Slim\Psr7\Response;
use VBCompetitions\CompetitionsAPI\{
    Config,
    ErrorMessage,
    Roles,
    Utils
};
use VBCompetitions\Competitions\{
    ClubContact,
    ClubContactRole
};

// Errorcodes 001FN
final class ClubContacts
{
    public static function getContacts(Config $config, string $competition_id, string $club_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contacts in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::clubContact()::get(), $competition_id, '0080');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such club' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00800');
        }
        $club = $competition->getClub($club_id);

        $context->getLogger()->info('Contacts in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($club->getContacts()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createContact(Config $config, string $competition_id, string $club_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a contact in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::clubContact()::create(), $competition_id, '0081');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such club' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00810');
        }
        $club = $competition->getClub($club_id);

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_CLUB_CONTACT_CREATE, '0081');
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
                    'chair' => ClubContactRole::CHAIR,
                    'vice' => ClubContactRole::VICE,
                    'treasurer' => ClubContactRole::TREASURER,
                    'secretary' => ClubContactRole::SECRETARY,
                    'welfare' => ClubContactRole::WELFARE,
                    'communications' => ClubContactRole::COMMUNICATIONS,
                    'marketing' => ClubContactRole::MARKETING,
                    'volunteer' => ClubContactRole::VOLUNTEER,
                    'logistics' => ClubContactRole::LOGISTICS,
                    'coaching' => ClubContactRole::COACHING,
                    default => throw new Exception('Invalid role: '.$role)
                });
            }
            $contact = new ClubContact($club, $contact_id, $roles);
            if (property_exists($contact_data, 'name')) {
                $contact->setName($contact_data->name);
            }
            if (property_exists($contact_data, 'notes')) {
                $contact->setNotes($contact_data->notes);
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
            $club->addContact($contact);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00811');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00812');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] created in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $contact_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getContact(Config $config, string $competition_id, string $club_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contact with ID ['.$contact_id.'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::clubContact()::get(), $competition_id, '0082');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such club' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00820');
        }
        $club = $competition->getClub($club_id);

        try {
            $contact = $club->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00821');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($contact));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateContact(Config $config, string $competition_id, string $club_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the contact with ID ['.$contact_id.'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::clubContact()::update(), $competition_id, '0083');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such club' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00830');
        }
        $club = $competition->getClub($club_id);

        try {
            $contact = $club->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00831');
        }

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_CLUB_CONTACT_UPDATE, '0083');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($contact_data, 'name')) {
                $old_name = $contact->getName();
                $contact->setName($contact_data->name);
                $context->getLogger()->info('Updating name of contact with ID ['.$contact_id.'] from ['.$old_name.'] to ['.$contact_data->name.'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($contact_data, 'notes')) {
                $contact->setNotes($contact_data->notes);
            }
            if (property_exists($contact_data, 'roles')) {
                $roles = [];
                foreach ($contact_data->roles as $role) {
                    array_push($roles, match ($role) {
                        'chair' => ClubContactRole::CHAIR,
                        'vice' => ClubContactRole::VICE,
                        'treasurer' => ClubContactRole::TREASURER,
                        'secretary' => ClubContactRole::SECRETARY,
                        'welfare' => ClubContactRole::WELFARE,
                        'communications' => ClubContactRole::COMMUNICATIONS,
                        'marketing' => ClubContactRole::MARKETING,
                        'volunteer' => ClubContactRole::VOLUNTEER,
                        'logistics' => ClubContactRole::LOGISTICS,
                        'coaching' => ClubContactRole::COACHING,
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
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00832');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00833');
        }

        $context->getLogger()->info('Updated contact with ID ['.$contact_id.'] and name ['.$contact->getName().'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteContact(Config $config, string $competition_id, string $club_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the contact with ID ['.$contact_id.'] in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::clubContact()::delete(), $competition_id, '0084');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasClub($club_id)) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'No such club' , ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00840');
        }
        $club = $competition->getClub($club_id);

        if (!$club->hasContact($contact_id)) {
            $context->getLogger()->info('Contact with ID ['.$contact_id.'] does not exist in club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $club->deleteContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00841');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00842');
        }

        $context->getLogger()->info('Deleted contact with ID ['.$contact_id.'] from club with ID ['.$club_id.'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
