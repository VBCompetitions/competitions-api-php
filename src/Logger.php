<?php

namespace VBCompetitions\CompetitionsAPI;

use Monolog\Formatter\JsonFormatter;
use Ramsey\Uuid\Uuid;

use Monolog\Level;
use Monolog\Handler\RotatingFileHandler;

final class Logger
{
    private \Monolog\Logger $logger;

    private Context $context;

    private string $context_id;

    public function __construct(BaseConfig $config, Context $context)
    {
        $max_files = 60;
        $log_level = Level::Info;
        $this->logger = new \Monolog\Logger('logger');
        $this->logger->pushHandler((new RotatingFileHandler(
            $config->getLogDir().DIRECTORY_SEPARATOR.'logs.jsonl',
            $max_files,
            $log_level
        ))->setFilenameFormat(
            'logs-{date}',
            RotatingFileHandler::FILE_PER_DAY
        )->setFormatter(new JsonFormatter()));
        $this->context = $context;
        $this->context_id = substr(Uuid::uuid4()->toString(), 0, 8);
    }

    private function getContext(?string $resource) : array
    {
        $context = [
            'app' => $this->context->getAppName(),
            'id' => $this->context_id,
            'user_id' => $this->context->getUserID(),
            'username' => $this->context->getUsername()
        ];
        if (!is_null($resource)) {
            $context['resource'] = $resource;
        }
        return $context;
    }

    public function error(string $msg, string $resource = null) : void
    {
        $this->logger->error($msg, $this->getContext($resource));
    }

    public function info(string $msg, string $resource = null) : void
    {
        $this->logger->info($msg, $this->getContext($resource));
    }

    public function debug(string $msg, string $resource = null) : void
    {
        $this->logger->debug($msg, $this->getContext($resource));
    }
}
