<?php

namespace VBCompetitions\CompetitionsAPI;

use stdClass;

final class CompetitionRoles
{
    public static function create() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY];
    }

    public static function delete() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY];
    }

    public static function get() : array
    {
        return Roles::_ALL;
    }

    public static function update() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY];
    }
}

final class MatchRoles
{
    public static function delete() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY];
    }

    public static function edit() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY];
    }

    public static function results() : array
    {
        return [Roles::ADMIN, Roles::FIXTURES_SECRETARY, Roles::RESULTS_ENTRY];
    }
}

final class UserRoles
{
    public static function create() : array
    {
        return [Roles::ADMIN];
    }

    public static function get() : array
    {
        return [Roles::ADMIN];
    }

    public static function reset() : array
    {
        return [Roles::ADMIN];
    }

    public static function update() : array
    {
        return [Roles::ADMIN];
    }

    public static function delete() : array
    {
        return [Roles::ADMIN];
    }
}

final class Roles
{
    public const ADMIN = 'ADMIN';
    public const FIXTURES_SECRETARY = 'FIXTURES_SECRETARY';
    public const RESULTS_ENTRY = 'RESULTS_ENTRY';
    public const VIEWER = 'VIEWER';

    public const _ALL = [
        Roles::ADMIN,
        Roles::FIXTURES_SECRETARY,
        Roles::RESULTS_ENTRY,
        Roles::VIEWER
    ];

    public static function roleCheck(mixed $roles, array $required_roles) : bool
    {
        if (!is_array($roles)) {
            return false;
        }

        foreach ($roles as $role) {
            if (in_array($role, $required_roles)) {
                return true;
            }
        }
        return false;
    }

    public static function competition() : CompetitionRoles
    {
        return new CompetitionRoles();
    }

    public static function match() : MatchRoles
    {
        return new MatchRoles();
    }

    public static function user() : UserRoles
    {
        return new UserRoles();
    }
}
