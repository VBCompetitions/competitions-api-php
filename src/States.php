<?php

namespace VBCompetitions\CompetitionsAPI;

final class States
{
    public const ACTIVE = 'active';
    public const SUSPENDED = 'suspended';
    public const PENDING = 'pending';

    public const _LIST_ALL = [
        States::ACTIVE,
        States::SUSPENDED,
        States::PENDING
    ];

    public const _LIST_USER_EXISTS = [
        States::ACTIVE,
        States::SUSPENDED
    ];
}
