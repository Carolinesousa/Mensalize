<?php

namespace App\Support;

class Placeholders
{
    public const ALL = ['aluno', 'competencia', 'aulas', 'valor', 'vencimento', 'professora'];

    public static function all(): array
    {
        return self::ALL;
    }

    public static function validate(string $template): bool
    {
        preg_match_all('/\{([^}]+)\}/', $template, $m);

        foreach ($m[1] as $name) {
            if (! in_array($name, self::ALL, true)) {
                return false;
            }
        }

        return true;
    }
}
