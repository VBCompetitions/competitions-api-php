<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;

final class AppConfig
{
    public const SESSION_COOKIE = 'VBCSESSION';

    private string $base_path;
    private string $data_dir;
    private bool $get_post_mode;

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
}
