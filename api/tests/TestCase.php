<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Sanctum modo SPA só ativa o stack stateful (sessão/CSRF) quando a
        // requisição traz Origin/Referer de um domínio stateful. Em testes não
        // há header por padrão; enviamos um domínio da lista stateful.
        $this->withHeader('Origin', 'http://localhost');
    }
}
