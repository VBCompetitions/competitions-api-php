<?php

namespace VBCompetitions\CompetitionsAPI;

include $_composer_autoload_path ?? __DIR__ . '/../vendor/autoload.php';

use stdClass;
use Ramsey\Uuid\Uuid;
use VBCompetitions\CompetitionsAPI\Roles;

if ($argc != 2) {
  echo 'Usage: php vbc-api-setup.php [data-directory]'.PHP_EOL.PHP_EOL;
  echo 'Creates a set of folders within the given data-directory for storing the'.PHP_EOL;
  echo 'competitions, the users and the sessions.  This should be an empty'.PHP_EOL;
  echo 'directory with a name like "data".  You may then want to create the base'.PHP_EOL;
  echo 'index file for the API in a folder next to the data-directory'.PHP_EOL;
  exit(1);
}

$data_dir = realpath($argv[1]);

if ($data_dir === false) {
  echo 'Bad data directory given, are you sure it exist?';
  exit(1);
}

echo PHP_EOL.'Creating directory structure and base files under '.$data_dir.PHP_EOL;

$password_ok = false;

echo PHP_EOL.'VBCompatitions API needs an "admin" account.  This will need a password that is at least 8 characters long'.PHP_EOL.PHP_EOL;
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

echo PHP_EOL.'Creating directories...'.PHP_EOL;

mkdir($data_dir);
mkdir($data_dir.DIRECTORY_SEPARATOR.'competitions');
mkdir($data_dir.DIRECTORY_SEPARATOR.'sessions');
mkdir($data_dir.DIRECTORY_SEPARATOR.'users');
mkdir($data_dir.DIRECTORY_SEPARATOR.'competitions');

$h = fopen($data_dir.DIRECTORY_SEPARATOR.'competitions'.DIRECTORY_SEPARATOR.'.htaccess', 'w');
fwrite($h, 'Require all denied');
fclose($h);

$h = fopen($data_dir.DIRECTORY_SEPARATOR.'sessions'.DIRECTORY_SEPARATOR.'.htaccess', 'w');
fwrite($h, 'Require all denied');
fclose($h);

$h = fopen($data_dir.DIRECTORY_SEPARATOR.'users'.DIRECTORY_SEPARATOR.'.htaccess', 'w');
fwrite($h, 'Require all denied');
fclose($h);

echo PHP_EOL.'Directories created.  Note that these directories contain a ".htaccess" file'.PHP_EOL;
echo 'that denys accessing the directory over HTTP.  These are Apache configuration'.PHP_EOL;
echo 'files.  If you are using a different HTTP engine then you will need to manually'.PHP_EOL;
echo 'create the equivalent files'.PHP_EOL.PHP_EOL;

echo PHP_EOL.'Creating "users" file...';

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
$h = fopen($users_file, 'w');
fwrite($h, $data);
fclose($h);
echo PHP_EOL.'Users file '.$users_file.' created'.PHP_EOL;

$api_keys_data = new stdClass();
$api_keys_data->lookup = new stdClass();
$api_keys_data->lookup->v1 = new stdClass();
$api_keys_data->keys = new stdClass();

echo PHP_EOL.'Creating "API Keys" file...';

$data = json_encode($api_keys_data, JSON_PRETTY_PRINT);
$apis_file = $data_dir.DIRECTORY_SEPARATOR.'users'.DIRECTORY_SEPARATOR.'apikeys.json';
$h = fopen($apis_file, 'w');
fwrite($h, $data);
fclose($h);

echo PHP_EOL.'API Keys file '.$apis_file.' created'.PHP_EOL;
