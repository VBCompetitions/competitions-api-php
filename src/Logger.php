<?php

namespace VBCompetitions\CompetitionsAPI;

use stdClass;
use DateTime;
use Ramsey\Uuid\Uuid;

final class Logger
{
    private string $log_file;

    private Context $context;

    private string $context_id;

    // TODO add a log level - this would be a "system" setting

    public function __construct(Config $config, Context $context)
    {
        $this->log_file = $config->getLogDir().DIRECTORY_SEPARATOR.'logs.jsonl';
        $this->context = $context;
        $this->context_id = Uuid::uuid4()->toString();
    }

    private function log(string $level, string $msg) : void
    {
        $h = fopen($this->log_file, 'a');
        // We create an object to take advantage of json_encode encoding/escaping any strings
        $log_line = new stdClass();
        $log_line->timestamp = (new DateTime())->format('c');
        $log_line->level = $level;
        $log_line->context_id = $this->context_id;
        $log_line->user_id = $this->context->getUserID();
        $log_line->username = $this->context->getUsername();
        $log_line->message = $msg;
        fwrite($h, json_encode($log_line).PHP_EOL);
        fclose($h);
    }

    public function error(string $msg) : void
    {
        $this->log('ERROR', $msg);
    }

    public function info(string $msg) : void
    {
        $this->log('INFO', $msg);
    }

    public function debug(string $msg) : void
    {
        $this->log('DEBUG', $msg);
    }
}
