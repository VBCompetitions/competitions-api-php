<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;
use Opis\JsonSchema\ValidationResult;
use Opis\JsonSchema\Validator;

final class AppConfig
{
    public const SESSION_COOKIE = 'VBCSESSION';

    public const VALIDATE_CLUB_CREATE = 'clubCreate';
    public const VALIDATE_CLUB_UPDATE = 'clubUpdate';
    public const VALIDATE_TEAM_CREATE = 'teamCreate';
    public const VALIDATE_TEAM_UPDATE = 'teamUpdate';
    public const VALIDATE_CONTACT_CREATE = 'contactCreate';
    public const VALIDATE_CONTACT_UPDATE = 'contactUpdate';
    public const VALIDATE_PLAYER_CREATE = 'playerCreate';
    public const VALIDATE_PLAYER_UPDATE = 'playerUpdate';
    public const VALIDATE_PLAYER_TRANSFER = 'playerTransfer';
    public const VALIDATE_STAGE_APPEND = 'stageAppend';
    public const VALIDATE_STAGE_UPDATE = 'stageUpdate';

    private string $base_path;
    private string $data_dir;
    private bool $get_post_mode;

    private Validator $validator;

    public function __construct(array $config)
    {
        if (!key_exists('url_base_path', $config)) {
            throw new Exception('url_base_path is not set');
        }

        if (!key_exists('vbc_dir', $config)) {
            throw new Exception('vbc_dir is not set');
        }

        $this->base_path = $config['url_base_path'];
        $this->data_dir = $config['vbc_dir'];
        $this->get_post_mode = $config['get_post_mode'];

        $this->validator = new Validator();
        $this->validator->setMaxErrors(5);
    }

    public function getGetPostMode() : bool
    {
        return $this->get_post_mode;
    }

    public function getBasePath() : string
    {
        return $this->base_path;
    }

    public function getCompetitionsDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'competitions');
    }

    public function getUsersDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'users');
    }

    public function getSessionDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'sessions');
    }

    public function getLogDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'logs');
    }

    public function validateData(string $schema_id, object $data) : ValidationResult
    {
        $this->validator->resolver()->registerFile(
            'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/'.$schema_id,
            realpath(__DIR__.DIRECTORY_SEPARATOR.'API'.DIRECTORY_SEPARATOR.'schema'.DIRECTORY_SEPARATOR.$schema_id.'.json')
        );

        return $this->validator->validate($data, 'https://github.com/monkeysppp/VBCompetitions-API/1.0.0/'.$schema_id);
    }
}
