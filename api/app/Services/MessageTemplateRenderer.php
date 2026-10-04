<?php
namespace App\Services;

class MessageTemplateRenderer {
    public const DEFAULT = 'Oi {aluno}! Segue a mensalidade de {competencia}: {aulas} aulas, total {valor}, com vencimento em {vencimento}. Qualquer dúvida me avisa. — {professora}';

    public function render(?string $template, array $data): string {
        $template = ($template === null || trim($template) === '') ? self::DEFAULT : $template;
        foreach ($data as $key => $value) {
            $template = str_replace('{'.$key.'}', (string) $value, $template);
        }
        return $template;
    }
}
