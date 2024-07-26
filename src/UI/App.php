<?php

namespace VBCompetitions\CompetitionsAPI\UI;

use Exception;
use JsonSerializable;
use stdClass;

// Errorcodes 014FN
final class App implements JsonSerializable
{
    private string $id;
    private string $name;
    private string $root_path;
    private array $roles;

    public function __construct(object $app)
    {
        if (!property_exists($app, 'id')) {
            throw new Exception('App definition is missing an id field');
        }
        $this->id = $app->id;
        if (!property_exists($app, 'name')) {
            throw new Exception('App definition is missing a name field');
        }
        $this->name = $app->name;
        if (!property_exists($app, 'rootPath')) {
            throw new Exception('App definition is missing a rootPath field');
        }
        $this->root_path = $app->rootPath;
        if (!property_exists($app, 'roles')) {
            throw new Exception('App definition is missing a roles field');
        }
        $this->roles = $app->roles;
    }

    public function jsonSerialize() : mixed
    {
        $app = new stdClass();

        $app->id = $this->id;
        $app->name = $this->name;
        $app->rootPath = $this->root_path;
        $app->roles = $this->roles;

        return $app;
    }

    public function getID() : string
    {
        return $this->id;
    }

    public function getName() : string
    {
        return $this->name;
    }

    public function getRootPath() : string
    {
        return $this->root_path;
    }

    public function getRoles() : array
    {
        return $this->roles;
    }
}
