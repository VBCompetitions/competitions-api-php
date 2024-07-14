<?php

require_once(__DIR__.'/../../vendor/autoload.php');

use VBCompetitions\CompetitionsAPI\CompetitionsAPI;

$config = [
    'url_base_path' => '/competitions-api-php/example/vbc',
    'vbc_dir' => join(DIRECTORY_SEPARATOR, array(__DIR__, '..', 'data')),
    'developer_mode' => true,
    'get_post_mode' => false
];

$api = new CompetitionsAPI($config);
