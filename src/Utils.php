<?php

namespace VBCompetitions\CompetitionsAPI;

final class Utils
{
    public static function checkPathTraversal(string $dir, string $requested_file) : bool
    {
        $patterns = array('~/{2,}~', '~/(\./)+~', '~([^/\.]+/(?R)*\.{2,}/)~', '~\.\./~');
        $replacements = array('/', '/', '', '');
        $filename = preg_replace($patterns, $replacements, $requested_file);
        return !str_starts_with($filename, $dir);
    }
}
