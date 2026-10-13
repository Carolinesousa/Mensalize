<?php

it('limita tentativas de login por IP', function () {
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'errada'])
            ->assertStatus(422);
    }

    $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'errada'])
        ->assertStatus(429);
});
