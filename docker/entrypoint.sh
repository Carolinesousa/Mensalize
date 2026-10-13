#!/bin/sh
set -e

# Aplica as migrações antes de subir o php-fpm. É idempotente: se não houver
# nada pendente, o Artisan apenas confirma. O depends_on do Compose não espera
# o MySQL ficar pronto, então tentamos novamente algumas vezes.
attempts=0
until php artisan migrate --force; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 10 ]; then
        echo "Não foi possível migrar o banco após $attempts tentativas." >&2
        exit 1
    fi
    echo "Banco indisponível, tentando novamente em 3s... ($attempts/10)"
    sleep 3
done

exec "$@"
