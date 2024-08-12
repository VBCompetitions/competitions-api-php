<?php

require_once join(DIRECTORY_SEPARATOR, [__DIR__, '..', '..', '..', 'vendor', 'autoload.php']);

use VBCompetitions\CompetitionsAPI\App;

$config = [
  'url_base_path' => '/competitions-api-php/example/my-app/my-pages/profile.php',
  'url_logout_path' => '/competitions-api-php/example/my-app/my-pages',
  'vbc_dir' => join(DIRECTORY_SEPARATOR, [__DIR__, '..', '..', 'data']),
];

$app = new App($config);

if (!$app->initialiseSession()) {
    $app->destroySession();
    header('Location: /competitions-api-php/example/vbc/ui/login?returnTo=/competitions-api-php/example/my-app/my-pages/profile.php');
    exit;
}

$username = $app->getUsername();
$roles = $app->getUserRoles();
$app->getLogger()->info('User "'.$username.'" loaded their profile');
?>

<html>
  <body>
    <p>Hello <?php echo $username ?></p>
    <p>User roles:</p>
    <p>ROLE_A: <?php echo in_array('ROLE_A', $roles) ? 'YES' : 'NO' ?></p>
    <p>ROLE_B: <?php echo in_array('ROLE_B', $roles) ? 'YES' : 'NO' ?></p>
    <p><a href="./logout.php">Log out</a></p>
  </body>
</html>
