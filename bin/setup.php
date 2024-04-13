<?php

namespace VBCompetitions\CompetitionsAPI;

use stdClass;
use Ramsey\Uuid\Uuid;
use VBCompetitions\CompetitionsAPI\Roles;

$root = dirname(__DIR__);

if (!is_file(join(DIRECTORY_SEPARATOR, array($root, 'vendor')).DIRECTORY_SEPARATOR.'autoload.php')) {
    $root = dirname(__DIR__, 4);
}

require_once(join(DIRECTORY_SEPARATOR, array($root, 'vendor')).DIRECTORY_SEPARATOR.'autoload.php');

if ($argc != 2) {
  echo 'Usage: php setup [data-directory]'.PHP_EOL;
  exit(1);
}

echo PHP_EOL.'Creating/checking directories as necessary'.PHP_EOL;
$data_dir = realpath($argv[1]);

if ($data_dir === false) {
  echo 'Bad data directory given';
  exit(1);
}

$password_ok = false;

echo PHP_EOL.'We will now set up the "admin" account.  This will need a password that is at least 8 characters long'.PHP_EOL.PHP_EOL;
echo 'Enter a password for the "admin" account:'.PHP_EOL;

while (!$password_ok) {
  echo '> ';

  $password = trim(fgets(STDIN));

  if (preg_match('/^[a-zA-Z0-9!"#£$%&\'()*+,-.\/\\\:;<=>?@[\]^_`{|}~]{8,}$/', $password)) {
    $password_ok = true;
  } else {
    echo PHP_EOL.'Bad password, please try something else:'.PHP_EOL;
  }
}

$user_id = Uuid::uuid4()->toString();

$users_data = new stdClass();
$users_data->lookup = new stdClass();
$users_data->users = new stdClass();
$users_data->pending = new stdClass();

$admin_user = new stdClass();
$admin_user->username = 'admin';
$admin_user->{'hash-v1'} = password_hash($password, PASSWORD_BCRYPT);
$admin_user->state = 'active';
$admin_user->roles = [ Roles::ADMIN ];
$admin_user->lastLogin = '';

$users_data->lookup->admin = $user_id;
$users_data->users->$user_id = $admin_user;

$data = json_encode($users_data, JSON_PRETTY_PRINT);
$users_file = $data_dir.DIRECTORY_SEPARATOR.'users'.DIRECTORY_SEPARATOR.'users.json';
echo PHP_EOL.'Creating users file '.$users_file;
$h = fopen($users_file, 'w');
fwrite($h, $data);
fclose($h);
