<?php

namespace VBCompetitions\CompetitionsAPI;

use Ramsey\Uuid\Uuid;

final class Context
{
    private Logger $logger;
    private string $user_id = 'unknown';
    private  string $username = 'unknown';

    public function __construct(Config $config)
    {
        $this->logger = new Logger($config, $this);
    }

    public function getLogger() : Logger
    {
        return $this->logger;
    }

    public function setUserID(string $user_id)
    {
        $this->user_id = $user_id;
    }

    public function getUserID() : string
    {
        return $this->user_id;
    }

    public function setUserName(string $username)
    {
        $this->username = $username;
    }

    public function getUsername() : string
    {
        return $this->username;
    }
}
