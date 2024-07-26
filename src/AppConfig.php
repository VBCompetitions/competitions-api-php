<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;

final class AppConfig
{
    private string $base_path;
    private string $logout_path;
    private string $data_dir;

    public function __construct(array $config)
    {
        if (!key_exists('url_base_path', $config)) {
            throw new Exception('url_base_path is not set');
        }

        if (!key_exists('url_logout_path', $config)) {
            throw new Exception('url_logout_path is not set');
        }

        if (!key_exists('vbc_dir', $config)) {
            throw new Exception('vbc_dir is not set');
        }

        $this->base_path = $config['url_base_path'];
        $this->logout_path = $config['url_logout_path'];
        $this->data_dir = $config['vbc_dir'];
    }

    public function getBasePath() : string
    {
        return $this->base_path;
    }
    public function getLogoutPath() : string
    {
        return $this->logout_path;
    }

    public function getUsersDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'users');
    }

    public function getSessionDir() : string
    {
        return realpath($this->data_dir.DIRECTORY_SEPARATOR.'sessions');
    }
}
