<?php

namespace VBCompetitions\CompetitionsAPI;

use Exception;

final class AppConfig extends BaseConfig
{
    private string $logout_path;

    public function __construct(array $config)
    {
        parent::__construct($config);

        if (!key_exists('url_logout_path', $config)) {
            throw new Exception('url_logout_path is not set');
        }

        $this->logout_path = $config['url_logout_path'];
    }

    public function getLogoutPath() : string
    {
        return $this->logout_path;
    }
}
