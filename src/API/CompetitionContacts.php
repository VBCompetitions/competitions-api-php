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
    CompetitionContact,
    CompetitionContactRole
};

// Errorcodes 001FN
final class CompetitionContacts
{
    public static function getContacts(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contacts in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competitionContact()::get(), $competition_id, '0090');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        $context->getLogger()->info('Contacts in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($competition->getContacts()));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function createContact(Config $config, string $competition_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to create a contact in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competitionContact()::create(), $competition_id, '0091');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_COMPETITION_CONTACT_CREATE, '0091');
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
                    'director' => CompetitionContactRole::DIRECTOR,
                    'fixtures' => CompetitionContactRole::FIXTURES,
                    'logistics' => CompetitionContactRole::LOGISTICS,
                    'communications' => CompetitionContactRole::COMMUNICATIONS,
                    'officials' => CompetitionContactRole::OFFICIALS,
                    'results' => CompetitionContactRole::RESULTS,
                    'marketing' => CompetitionContactRole::MARKETING,
                    'safety' => CompetitionContactRole::SAFETY,
                    'volunteer' => CompetitionContactRole::VOLUNTEER,
                    'welfare' => CompetitionContactRole::WELFARE,
                    'hospitality' => CompetitionContactRole::HOSPITALITY,
                    'ceremonies' => CompetitionContactRole::CEREMONIES,
                    'secretary' => CompetitionContactRole::SECRETARY,
                    'treasurer' => CompetitionContactRole::TREASURER,
                    'medic' => CompetitionContactRole::MEDIC,
                    default => throw new Exception('Invalid role: '.$role)
                });
            }
            $contact = new CompetitionContact($competition, $contact_id, $roles);
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
            $competition->addContact($contact);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00911');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00912');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] created in competition with ID ['.$competition_id.']');
        // encode bad id chards for JSON
        $res_body = new stdClass();
        $res_body->id = $contact_id;
        $res->getBody()->write(json_encode($res_body));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function getContact(Config $config, string $competition_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to get the contact with ID ['.$contact_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competitionContact()::get(), $competition_id, '0092');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $contact = $competition->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00921');
        }

        $context->getLogger()->info('Contact with ID ['.$contact_id.'] in competition with ID ['.$competition_id.'] returned');
        $res->getBody()->write(json_encode($contact));
        return $res->withHeader('Content-Type', 'application/json');
    }

    public static function updateContact(Config $config, string $competition_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to update the contact with ID ['.$contact_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competitionContact()::update(), $competition_id, '0093');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            $contact = $competition->getContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::RESOURCE_DOES_NOT_EXIST_HTTP, 'Failed to find the contact', ErrorMessage::RESOURCE_DOES_NOT_EXIST_CODE, '00931');
        }

        try {
            $contact_data = Utils::getAndValidateData($config, $req, $context, Config::VALIDATE_COMPETITION_CONTACT_UPDATE, '0093');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        try {
            if (property_exists($contact_data, 'name')) {
                $old_name = $contact->getName();
                $contact->setName($contact_data->name);
                $context->getLogger()->info('Updating name of contact with ID ['.$contact_id.'] from ['.$old_name.'] to ['.$contact_data->name.'] in competition with ID ['.$competition_id.']');
            }
            if (property_exists($contact_data, 'notes')) {
                $contact->setNotes($contact_data->notes);
            }
            if (property_exists($contact_data, 'roles')) {
                $roles = [];
                foreach ($contact_data->roles as $role) {
                    array_push($roles, match ($role) {
                        'director' => CompetitionContactRole::DIRECTOR,
                        'fixtures' => CompetitionContactRole::FIXTURES,
                        'logistics' => CompetitionContactRole::LOGISTICS,
                        'communications' => CompetitionContactRole::COMMUNICATIONS,
                        'officials' => CompetitionContactRole::OFFICIALS,
                        'results' => CompetitionContactRole::RESULTS,
                        'marketing' => CompetitionContactRole::MARKETING,
                        'safety' => CompetitionContactRole::SAFETY,
                        'volunteer' => CompetitionContactRole::VOLUNTEER,
                        'welfare' => CompetitionContactRole::WELFARE,
                        'hospitality' => CompetitionContactRole::HOSPITALITY,
                        'ceremonies' => CompetitionContactRole::CEREMONIES,
                        'secretary' => CompetitionContactRole::SECRETARY,
                        'treasurer' => CompetitionContactRole::TREASURER,
                        'medic' => CompetitionContactRole::MEDIC,
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
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00932');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00933');
        }

        $context->getLogger()->info('Updated contact with ID ['.$contact_id.'] and name ['.$contact->getName().'] in competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }

    public static function deleteContact(Config $config, string $competition_id, string $contact_id, Request $req, Response $res) : Response
    {
        $context = $req->getAttribute('context');
        $context->getLogger()->info('Request to delete the contact with ID ['.$contact_id.'] in competition with ID ['.$competition_id.']');

        try {
            $competition = Utils::loadCompetition($config, $req, $context, Roles::competitionContact()::delete(), $competition_id, '0094');
        } catch (ErrorMessage $err) {
            return $err->respond($context);
        }

        if (!$competition->hasContact($contact_id)) {
            $context->getLogger()->info('Contact with ID ['.$contact_id.'] does not exist in competition with ID ['.$competition_id.']');
            return $res->withStatus(200);
        }

        try {
            $competition->deleteContact($contact_id);
        } catch (Throwable $err) {
            return ErrorMessage::respondWithError($context, ErrorMessage::BAD_REQUEST_HTTP, $err->getMessage(), ErrorMessage::BAD_REQUEST_CODE, '00941');
        }

        try {
            $competition->saveToFile($config->getCompetitionsDir(), $competition_id.'.json');
        } catch (Throwable $err) {
            $context->getLogger()->info('Failed to save the competition: '.$err->getMessage());
            return ErrorMessage::respondWithError($context, ErrorMessage::INTERNAL_ERROR_HTTP, 'Failed to save the competition', ErrorMessage::INTERNAL_ERROR_CODE, '00942');
        }

        $context->getLogger()->info('Deleted contact with ID ['.$contact_id.'] from competition with ID ['.$competition_id.']');
        return $res->withStatus(200);
    }
}
