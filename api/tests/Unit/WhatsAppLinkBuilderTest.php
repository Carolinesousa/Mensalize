<?php

use App\Services\MessageTemplateRenderer;
use App\Services\WhatsAppLinkBuilder;

it('normaliza telefones com e sem DDI', function () {
    $b = new WhatsAppLinkBuilder;
    expect($b->normalizePhone('31 99999-8888'))->toBe('5531999998888');
    expect($b->normalizePhone('5531999998888'))->toBe('5531999998888');
});

it('codifica a mensagem na URL', function () {
    $url = (new WhatsAppLinkBuilder)->build('5531999998888', 'Oi Ana! Mensalidade: R$ 162,00 \u{1F44D}');
    expect($url)->toStartWith('https://wa.me/5531999998888?text=')
        ->and($url)->toContain('R%24%20162%2C00');
});

it('usa o template padrão quando vazio e preenche placeholders', function () {
    $msg = (new MessageTemplateRenderer)->render(null, [
        'aluno' => 'Ana', 'competencia' => '09/2026', 'aulas' => 9, 'valor' => 'R$ 162,00',
        'vencimento' => '10/10/2026', 'professora' => 'Carol',
    ]);
    expect($msg)->toContain('Ana')->and($msg)->toContain('162,00');
});
