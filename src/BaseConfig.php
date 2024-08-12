<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;
use Opis\JsonSchema\ValidationResult;
use Opis\JsonSchema\Validator;

class BaseConfig
{
    public const SESSION_COOKIE = 'VBCSESSION';


    protected string $base_path;
    protected string $data_dir;

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

    public function getSettingsDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'settings');
    }
}
