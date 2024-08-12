<?php

namespace VBCompetitions\CompetitionsAPI;

final class App
{
    private AppConfig $config;

    private Context $context;

    private Logger $logger;

    private array $roles;

    function __construct(array $config)
    {
        $this->config = new AppConfig($config);
        $this->context = new Context($this->config);
        $this->logger = new Logger($this->config, $this->context);
    }

    public function initialiseSession() : bool
    {
        session_save_path(realpath($this->config->getSessionDir()));
        session_name(Config::SESSION_COOKIE);
        session_start();
        if (!isset($_SESSION['valid']) || $_SESSION['valid'] != true) {
            return false;
        }

        $users_file = realpath($this->config->getUsersDir().DIRECTORY_SEPARATOR.'users.json');
        if ($users_file === false) {
            // users file is not there
            return false;
        }

        $users_json = file_get_contents($users_file);
        if ($users_json === false) {
            // users file failed to read
            return false;
        }

        $users_data = json_decode($users_json);
        if ($users_data === null) {
            // users file is not valid JSON
            return false;
        }

        if (!property_exists($users_data->users, $_SESSION['user_id'])) {
            // The user has been deleted!
            return false;
        }

        if ($users_data->users->{$_SESSION['user_id']}->state !== 'active') {
            // user is suspended
            return false;
        }

        if (property_exists($users_data->users->{$_SESSION['user_id']}, 'app')) {
            $this->context->setAppName($users_data->users->{$_SESSION['user_id']}->app);
        } else {
            $this->context->setAppName('VBC');
        }

        $this->context->setUserID($_SESSION['user_id']);
        $this->context->setUserName($_SESSION['username']);
        $this->roles = $users_data->users->{$_SESSION['user_id']}->roles;

        return true;
    }

    public function destroySession() : void
    {
        session_unset();
        session_destroy();
        setcookie(session_name(), "", time() - 3600, '/');
    }

    public function logout() : void
    {
        session_save_path($this->config->getSessionDir());
        session_name(Config::SESSION_COOKIE);
        session_start();
        session_unset();
        session_destroy();
        setcookie (session_name(), "", time() - 3600, '/');
        header('Location: '.$this->config->getLogoutPath());
    }

    public function getUserID() : string
    {
        return $this->context->getUserID();
    }

    public function getUsername() : string
    {
        return $this->context->getUsername();
    }

    public function getUserRoles() : array
    {
        return $this->roles;
    }

    public function getLogger() : Logger
    {
        return $this->logger;
    }
}
