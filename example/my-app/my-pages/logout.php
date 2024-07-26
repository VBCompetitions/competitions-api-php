<?php

require_once join(DIRECTORY_SEPARATOR, [__DIR__, '..', '..', '..', 'vendor', 'autoload.php']);

use VBCompetitions\CompetitionsAPI\App;

$config = [
  'url_base_path' => '/competitions-api-php/example/my-app/my-pages/profile.php',
  'url_logout_path' => '/competitions-api-php/example/my-app/my-pages',
  'vbc_dir' => join(DIRECTORY_SEPARATOR, [__DIR__, '..', '..', 'data']),
];

$app = new App($config);

$app->logout();
