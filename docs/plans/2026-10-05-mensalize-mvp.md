# Plano de Implementação — Mensalize MVP

> **For agentic workers:** Use a skill `dev-executar-plano` para implementar este plano task a task. Passos em checkbox (`- [ ]`) para rastreio.

**Goal:** Construir o MVP do Mensalize — SPA React sobre API Laravel que calcula a mensalidade de aulas particulares, permite ajustes e gera a cobrança para o WhatsApp.

**Architecture:** Monorepo com `api/` (Laravel, API REST + Services) e `web/` (SPA React/TS), autenticados por Sanctum modo SPA (cookie/sessão, mesmo domínio). Cálculo isolado em Services, com snapshot na mensalidade. Deploy em VPS único via Docker Compose (Nginx + PHP-FPM + MySQL).

**Tech Stack:** PHP 8.3 + Laravel 12, MySQL 8, Sanctum, Pest 3 · React 18 + TypeScript 5 + Vite 6 + React Router 7 + TanStack Query 5 + Tailwind 4 + Vitest/RTL · Playwright · Docker Compose + Nginx.

**Spec:** [TDD — Mensalize](../tdd/2026-10-05-mensalize-tdd.md) · [PRD](../prd/2026-09-29-mensalize-prd.md)

## Global Constraints

- **Idioma:** artefatos (branch, commit, docs, UI) em **pt-BR**; identificadores de código em inglês.
- **Moeda:** BRL, sempre **2 casas**, arredondamento half-up (`round($x, 2)`); serializar como string `"153.00"`.
- **Competência:** `reference_month` no formato `YYYY-MM`.
- **Fuso:** `America/Sao_Paulo`.
- **Multi-tenant:** **toda** consulta é escopada ao professor autenticado; recurso de outro professor responde **404**.
- **Cálculo:** `base = nº de aulas no mês × hora-aula × (1 − desconto%)`; `total = base + Σ ajustes` (extras/ajustes sem desconto).
- **Sem assincronismo:** nenhuma fila/worker; WhatsApp é apenas deep link `wa.me`.
- **Sem placeholders:** nenhum `TODO`/`TBD` no código entregue.
- **Commits:** atômicos no padrão `{verbo}: {descrição}`.
- **Branch de trabalho:** implementar em branch (ex.: `feat/mensalize-mvp`), nunca direto na `main`.

## Review Focus

Cinco classes de entrada/falha que o TDD implica mas cujos testes ficam presos às tasks que possuem o código:

1. **Nº de aulas em meses de 4/5 semanas com múltiplos dias** → deve somar exatamente as ocorrências (Task 8).
2. **`due_day` inexistente no mês** (ex.: 31 em fevereiro) → vencimento clampado ao último dia, sem erro (Task 8).
3. **Telefone com/sem DDI e com máscara** → link `wa.me` válido (só dígitos, DDI `55`) (Task 12).
4. **Isolamento entre professoras** (id de outro professor) → 404, sem vazar dados (Tasks 5, 6, 9, 11).
5. **Ajuste com valor negativo e mensagem com acentos/emoji/caracteres especiais** → total correto e URL do WhatsApp corretamente codificada (Tasks 11, 12).

---

## Mapa de arquivos

```
api/                                  # Laravel (API)
  app/Models/{Teacher,Promotion,Student,StudentWeekday,Invoice,InvoiceAdjustment}.php
  app/Http/Controllers/Api/{Auth,Profile,Promotion,Student,Invoice,InvoiceAdjustment,WhatsappLink}Controller.php
  app/Http/Requests/{RegisterRequest,UpdateProfileRequest,StorePromotionRequest,StoreStudentRequest,UpdateStudentRequest,StoreAdjustmentRequest,UpdateInvoiceRequest}.php
  app/Http/Resources/{Teacher,Promotion,Student,Invoice,Adjustment}Resource.php
  app/Services/{LessonCounter,MensalidadeCalculator,InvoiceService,WhatsAppLinkBuilder,MessageTemplateRenderer}.php
  app/Support/Placeholders.php
  database/migrations/*_create_{teachers,promotions,students,student_weekdays,invoices,invoice_adjustments}_table.php
  database/factories/*Factory.php
  routes/api.php
  tests/Unit/*, tests/Feature/*
web/                                  # React SPA
  src/main.tsx, src/App.tsx, src/router.tsx
  src/lib/{api.ts,queryClient.ts,format.ts,useAuth.ts}
  src/features/{auth,profile,promotions,students,invoices}/...
  src/components/...
  src/**/*.test.tsx, e2e/*.spec.ts
docker/nginx/default.conf
docker-compose.yml
api/Dockerfile, web/Dockerfile
.github/workflows/ci.yml
```

---

## Task 1: Scaffold do monorepo (API + SPA) e ferramentas de teste

**Files:**
- Create: `api/` (Laravel), `web/` (Vite), `.gitignore`
- Test: `api/tests/Unit/SmokeTest.php`, `web/src/lib/format.test.ts`

**Interfaces:**
- Produces: apps `api/` (PHP) e `web/` (Node) executáveis; Pest e Vitest configurados.

- [ ] **Step 1: Criar a API Laravel e o banco**

```bash
composer create-project laravel/laravel api
cd api && php artisan key:generate
```

Editar `api/.env`:
```
APP_URL=http://localhost:8080
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mensalize
DB_USERNAME=root
DB_PASSWORD=secret
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173
FRONTEND_URL=http://localhost:5173
```

- [ ] **Step 2: Instalar Pest e Sanctum na API**

```bash
cd api
composer require laravel/sanctum --no-interaction
composer require pestphp/pest pestphp/pest-plugin-laravel --dev --no-interaction
php artisan pest:install --no-interaction
php artisan install:api --no-interaction   # publica config/sanctum e rotas api
```

- [ ] **Step 3: Escrever o teste de fumaça (deve falhar)**

`api/tests/Unit/SmokeTest.php`:
```php
<?php
it('roda a suíte de testes', function () {
    expect(true)->toBeTrue();
});
```

- [ ] **Step 4: Rodar o teste**

Run: `cd api && php artisan test --filter=Smoke`
Expected: PASS

- [ ] **Step 5: Criar a SPA**

```bash
npm create vite@latest web -- --template react-ts
cd web
npm install
npm install react-router-dom @tanstack/react-query
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom jsdom
```

`web/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { '/api': 'http://localhost:8080', '/sanctum': 'http://localhost:8080' } },
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts', globals: true },
})
```

`web/src/index.css`: `@import "tailwindcss";`

- [ ] **Step 6: Escrever o teste de fumaça do frontend**

`web/src/lib/format.ts`:
```ts
export function formatBRL(value: string | number): string {
  const n = typeof value === 'string' ? Number(value) : value
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
```

`web/src/lib/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { formatBRL } from './format'

describe('formatBRL', () => {
  it('formata número em reais', () => {
    expect(formatBRL('153.00')).toBe('R$ 153,00')
  })
})
```

`web/src/test-setup.ts`: `import '@testing-library/jest-dom'`

- [ ] **Step 7: Rodar o teste do frontend**

Run: `cd web && npx vitest run src/lib/format.test.ts`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add api web .gitignore
git commit -m "chore: scaffold inicial do monorepo (api Laravel e web Vite)"
```

---

## Task 2: Migrações, Models e Factories do domínio

**Files:**
- Create: `api/database/migrations/*_create_teachers_table.php` (+ promotions, students, student_weekdays, invoices, invoice_adjustments)
- Create: `api/app/Models/{Teacher,Promotion,Student,StudentWeekday,Invoice,InvoiceAdjustment}.php`
- Create: `api/database/factories/*Factory.php`
- Modify: `api/config/auth.php` (provider → `App\Models\Teacher`)
- Test: `api/tests/Feature/DomainModelTest.php`

**Interfaces:**
- Produces: `Teacher::students()`, `Teacher::promotions()`, `Teacher::invoices()`; `Student::weekdays()`, `Student::promotion()`, `Student::invoices()`; `Invoice::adjustments()`, `Invoice::student()`; accessor `Invoice::total_amount`.

- [ ] **Step 1: Escrever o teste do domínio (deve falhar)**

`api/tests/Feature/DomainModelTest.php`:
```php
<?php
use App\Models\{Teacher, Promotion, Student, StudentWeekday, Invoice, InvoiceAdjustment};

it('relaciona professor, aluno, dias, promoção e mensalidade', function () {
    $teacher = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $promo = Promotion::factory()->for($teacher)->create(['discount_percent' => '10.00']);
    $student = Student::factory()->for($teacher)->create(['promotion_id' => $promo->id, 'due_day' => 10]);

    StudentWeekday::factory()->for($student)->create(['weekday' => 1]);
    StudentWeekday::factory()->for($student)->create(['weekday' => 3]);

    $invoice = Invoice::factory()->for($teacher)->for($student)->create([
        'reference_month' => '2026-09', 'base_lesson_count' => 9, 'base_amount' => '162.00',
        'due_date' => '2026-10-10', 'status' => 'pending',
    ]);
    InvoiceAdjustment::factory()->for($invoice)->create(['description' => 'Aula extra', 'amount' => '20.00']);
    InvoiceAdjustment::factory()->for($invoice)->create(['description' => 'Falta', 'amount' => '-20.00']);

    expect($student->weekdays()->count())->toBe(2);
    expect($student->promotion->id)->toBe($promo->id);
    expect($invoice->fresh()->total_amount)->toBe('162.00'); // 162 + 20 - 20
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd api && php artisan test --filter=DomainModel`
Expected: FAIL (tabelas/models inexistentes)

- [ ] **Step 3: Criar as migrações**

`api/database/migrations/0001_01_01_000000_create_teachers_table.php`:
```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->text('message_template')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('teachers'); }
};
```

`..._create_promotions_table.php`:
```php
Schema::create('promotions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->decimal('discount_percent', 5, 2);
    $table->timestamps();
});
```

`..._create_students_table.php`:
```php
Schema::create('students', function (Blueprint $table) {
    $table->id();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->foreignId('promotion_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');
    $table->string('phone');
    $table->unsignedTinyInteger('due_day');
    $table->timestamps();
});
```

`..._create_student_weekdays_table.php`:
```php
Schema::create('student_weekdays', function (Blueprint $table) {
    $table->id();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->unsignedTinyInteger('weekday'); // 1=seg ... 7=dom
    $table->timestamps();
    $table->unique(['student_id', 'weekday']);
});
```

`..._create_invoices_table.php`:
```php
Schema::create('invoices', function (Blueprint $table) {
    $table->id();
    $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
    $table->foreignId('student_id')->constrained()->cascadeOnDelete();
    $table->char('reference_month', 7); // YYYY-MM
    $table->unsignedInteger('base_lesson_count');
    $table->decimal('base_amount', 10, 2);
    $table->date('due_date');
    $table->enum('status', ['pending', 'paid'])->default('pending');
    $table->timestamp('paid_at')->nullable();
    $table->timestamps();
    $table->unique(['student_id', 'reference_month']);
    $table->index(['teacher_id', 'reference_month']);
});
```

`..._create_invoice_adjustments_table.php`:
```php
Schema::create('invoice_adjustments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
    $table->string('description');
    $table->decimal('amount', 10, 2); // pode ser negativo
    $table->timestamps();
});
```

> Remover a migração padrão `create_users_table` do Laravel (substituída por `teachers`).

- [ ] **Step 4: Criar os Models**

`api/app/Models/Teacher.php`:
```php
<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Teacher extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'hourly_rate', 'message_template'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = ['email_verified_at' => 'datetime', 'password' => 'hashed', 'hourly_rate' => 'decimal:2'];

    public function promotions() { return $this->hasMany(Promotion::class); }
    public function students() { return $this->hasMany(Student::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
}
```

`api/app/Models/Student.php`:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Student extends Model {
    use HasFactory;
    protected $fillable = ['teacher_id', 'promotion_id', 'name', 'phone', 'due_day'];

    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function promotion() { return $this->belongsTo(Promotion::class); }
    public function weekdays() { return $this->hasMany(StudentWeekday::class); }
    public function invoices() { return $this->hasMany(Invoice::class); }
}
```

`api/app/Models/Promotion.php`:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Promotion extends Model {
    use HasFactory;
    protected $fillable = ['teacher_id', 'name', 'discount_percent'];
    protected $casts = ['discount_percent' => 'decimal:2'];

    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function students() { return $this->hasMany(Student::class); }
}
```

`api/app/Models/StudentWeekday.php`:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StudentWeekday extends Model {
    use HasFactory;
    protected $fillable = ['student_id', 'weekday'];
    public function student() { return $this->belongsTo(Student::class); }
}
```

`api/app/Models/Invoice.php`:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model {
    use HasFactory;
    protected $fillable = ['teacher_id', 'student_id', 'reference_month', 'base_lesson_count',
        'base_amount', 'due_date', 'status', 'paid_at'];
    protected $casts = ['due_date' => 'date', 'paid_at' => 'datetime', 'base_amount' => 'decimal:2'];

    public function teacher() { return $this->belongsTo(Teacher::class); }
    public function student() { return $this->belongsTo(Student::class); }
    public function adjustments() { return $this->hasMany(InvoiceAdjustment::class); }

    public function getTotalAmountAttribute(): string {
        $sum = (float) $this->base_amount + (float) $this->adjustments->sum('amount');
        return number_format(round($sum, 2), 2, '.', '');
    }
}
```

`api/app/Models/InvoiceAdjustment.php`:
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InvoiceAdjustment extends Model {
    use HasFactory;
    protected $fillable = ['invoice_id', 'description', 'amount'];
    protected $casts = ['amount' => 'decimal:2'];
    public function invoice() { return $this->belongsTo(Invoice::class); }
}
```

- [ ] **Step 5: Ajustar o provider de auth**

`api/config/auth.php` → `providers.users.model` = `App\Models\Teacher::class`.

- [ ] **Step 6: Criar as factories**

`api/database/factories/TeacherFactory.php`:
```php
<?php
namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class TeacherFactory extends Factory {
    protected $model = Teacher::class;
    public function definition(): array {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'hourly_rate' => '20.00',
            'message_template' => null,
        ];
    }
}
```

`api/database/factories/PromotionFactory.php`:
```php
class PromotionFactory extends Factory {
    protected $model = Promotion::class;
    public function definition(): array {
        return ['teacher_id' => Teacher::factory(), 'name' => 'Indicação', 'discount_percent' => '10.00'];
    }
}
```
`StudentFactory`: `['teacher_id' => Teacher::factory(), 'name' => fake()->firstName(), 'phone' => '5531999998888', 'due_day' => 10, 'promotion_id' => null]`.
`StudentWeekdayFactory`: `['student_id' => Student::factory(), 'weekday' => 1]`.
`InvoiceFactory`: `['teacher_id' => Teacher::factory(), 'student_id' => Student::factory(), 'reference_month' => '2026-09', 'base_lesson_count' => 4, 'base_amount' => '80.00', 'due_date' => '2026-10-10', 'status' => 'pending']`.
`InvoiceAdjustmentFactory`: `['invoice_id' => Invoice::factory(), 'description' => 'Ajuste', 'amount' => '0.00']`.

- [ ] **Step 7: Migrar e rodar os testes**

Run: `cd api && php artisan migrate:fresh && php artisan test --filter=DomainModel`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add api
git commit -m "feat: modela domínio (professores, alunos, promoções, mensalidades)"
```

---

## Task 3: Autenticação da API (Sanctum SPA) + perfil

**Files:**
- Create: `api/app/Http/Controllers/Api/AuthController.php`, `ProfileController.php`
- Create: `api/app/Http/Requests/{RegisterRequest,UpdateProfileRequest}.php`
- Create: `api/app/Http/Resources/TeacherResource.php`
- Create: `api/database/factories/...` (já existe)
- Modify: `api/routes/api.php`, `api/bootstrap/app.php` (statefulApi), `api/app/Support/Placeholders.php`
- Test: `api/tests/Feature/AuthTest.php`, `ProfileTest.php`

**Interfaces:**
- Consumes: `Teacher` (Task 2).
- Produces: rotas `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`, `GET/PUT /api/profile`.

- [ ] **Step 1: Escrever os testes (devem falhar)**

`api/tests/Feature/AuthTest.php`:
```php
<?php
use App\Models\Teacher;

it('registra uma professora', function () {
    $this->postJson('/api/register', [
        'name' => 'Carol', 'email' => 'carol@example.com',
        'password' => 'secret123', 'password_confirmation' => 'secret123', 'hourly_rate' => '25.00',
    ])->assertCreated()->assertJsonPath('email', 'carol@example.com');

    expect(Teacher::where('email', 'carol@example.com')->exists())->toBeTrue();
});

it('faz login e retorna o professor autenticado', function () {
    $teacher = Teacher::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);
    $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'secret123'])->assertNoContent();
    $this->getJson('/api/me')->assertOk()->assertJsonPath('email', 'a@b.com');
});

it('rejeita login inválido', function () {
    Teacher::factory()->create(['email' => 'a@b.com', 'password' => 'secret123']);
    $this->postJson('/api/login', ['email' => 'a@b.com', 'password' => 'errada'])
        ->assertStatus(422);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd api && php artisan test --filter=AuthTest`
Expected: FAIL (rotas inexistentes)

- [ ] **Step 3: Registrar o middleware stateful do Sanctum**

`api/bootstrap/app.php`, no método `withMiddleware`, no grupo `api`:
```php
$middleware->statefulApi();
```

- [ ] **Step 4: Implementar o controller e as rotas**

`api/app/Http/Controllers/Api/AuthController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\TeacherResource;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller {
    public function register(RegisterRequest $request): JsonResponse {
        $teacher = Teacher::create($request->validated());
        Auth::login($teacher);
        $request->session()->regenerate();
        return (new TeacherResource($teacher))->response()->setStatusCode(201);
    }

    public function login(Request $request): JsonResponse {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required']]);
        if (! Auth::attempt($data)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 422);
        }
        $request->session()->regenerate();
        return response()->json(null, 204);
    }

    public function logout(Request $request): JsonResponse {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(null, 204);
    }

    public function me(Request $request): TeacherResource {
        return new TeacherResource($request->user());
    }
}
```

`api/app/Http/Requests/RegisterRequest.php`:
```php
<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:teachers,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
        ];
    }
}
```

`api/app/Http/Resources/TeacherResource.php`:
```php
<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'hourly_rate' => (string) $this->hourly_rate,
            'message_template' => $this->message_template,
        ];
    }
}
```

`api/routes/api.php`:
```php
use App\Http\Controllers\Api\{AuthController, ProfileController};
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
});
```

- [ ] **Step 5: Implementar o perfil**

`api/app/Http/Controllers/Api/ProfileController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\TeacherResource;
use App\Support\Placeholders;
use Illuminate\Http\Request;

class ProfileController extends Controller {
    public function show(Request $request): TeacherResource {
        return new TeacherResource($request->user());
    }
    public function update(UpdateProfileRequest $request): TeacherResource {
        $request->user()->update($request->validated());
        return new TeacherResource($request->user());
    }
}
```

`api/app/Http/Requests/UpdateProfileRequest.php`:
```php
<?php
namespace App\Http\Requests;

use App\Support\Placeholders;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest {
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'message_template' => ['nullable', 'string', 'max:1000', function ($attr, $value, $fail) {
                if ($value === null || $value === '') return;
                if (! Placeholders::validate($value)) {
                    $fail('O modelo contém placeholders desconhecidos. Permitidos: '.implode(', ', Placeholders::all()).'.');
                }
            }],
        ];
    }
}
```

`api/app/Support/Placeholders.php`:
```php
<?php
namespace App\Support;

class Placeholders {
    public const ALL = ['aluno', 'competencia', 'aulas', 'valor', 'vencimento', 'professora'];

    public static function all(): array { return self::ALL; }

    public static function validate(string $template): bool {
        preg_match_all('/\{([^}]+)\}/', $template, $m);
        foreach ($m[1] as $name) {
            if (! in_array($name, self::ALL, true)) return false;
        }
        return true;
    }
}
```

- [ ] **Step 6: Rodar os testes**

Run: `cd api && php artisan test --filter='AuthTest|ProfileTest'`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add api
git commit -m "feat: autenticação Sanctum SPA e perfil da professora"
```

---

## Task 4: Frontend — cliente de API, autenticação e rotas protegidas

**Files:**
- Create: `web/src/lib/{api.ts,queryClient.ts,useAuth.ts,format.ts}`
- Create: `web/src/features/auth/{LoginPage.tsx,RegisterPage.tsx}`
- Create: `web/src/router.tsx`; Modify: `web/src/{main.tsx,App.tsx}`
- Test: `web/src/lib/api.test.ts`

**Interfaces:**
- Consumes: API da Task 3.
- Produces: `apiFetch<T>(path, options)`, `useAuth()` (`{teacher, isLoading, login, register, logout}`).

- [ ] **Step 1: Escrever o teste do cliente de API (deve falhar)**

`web/src/lib/api.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch } from './api'

describe('apiFetch', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('envia credenciais e parseia JSON', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
    const data = await apiFetch<{ id: number }>('/me')
    expect(data.id).toBe(1)
    expect(spy).toHaveBeenCalledWith('/api/me', expect.objectContaining({ credentials: 'include' }))
  })

  it('lança erro em 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 401 }))
    await expect(apiFetch('/me')).rejects.toThrowError(/401/)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd web && npx vitest run src/lib/api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implementar o cliente de API**

`web/src/lib/api.ts`:
```ts
export class ApiError extends Error {
  constructor(public status: number, message: string) { super(`${status} ${message}`) }
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : ''
}

let csrfReady = false
export async function ensureCsrf(): Promise<void> {
  if (csrfReady) return
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
  csrfReady = true
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  if (method !== 'GET') await ensureCsrf()

  const headers = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  })
  if (method !== 'GET') headers.set('X-XSRF-TOKEN', getCookie('XSRF-TOKEN'))

  const res = await fetch(`/api${path}`, { credentials: 'include', ...options, headers })
  if (res.status === 401) {
    window.dispatchEvent(new Event('unauthorized'))
    throw new ApiError(401, 'unauthenticated')
  }
  if (!res.ok) throw new ApiError(res.status, await res.text())
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
```

`web/src/lib/queryClient.ts`:
```ts
import { QueryClient } from '@tanstack/react-query'
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
})
```

- [ ] **Step 4: Implementar autenticação e rotas**

`web/src/lib/useAuth.ts`:
```ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './api'

export type Teacher = { id: number; name: string; email: string; hourly_rate: string; message_template: string | null }

export function useAuth() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<Teacher>('/me').catch(() => null),
  })
  const login = async (email: string, password: string) => {
    await apiFetch('/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  const register = async (payload: Record<string, unknown>) => {
    await apiFetch('/register', { method: 'POST', body: JSON.stringify(payload) })
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  const logout = async () => {
    await apiFetch('/logout', { method: 'POST' })
    alert('Sessão encerrada')
    await qc.invalidateQueries({ queryKey: ['me'] })
  }
  return { teacher: data ?? null, isLoading, login, register, logout }
}
```

`web/src/features/auth/LoginPage.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/useAuth'

export function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  return (
    <form className="mx-auto mt-24 max-w-sm space-y-4" onSubmit={async (e) => {
      e.preventDefault()
      try { await login(email, password); nav('/') } catch { setError('Credenciais inválidas.') }
    }}>
      <h1 className="text-2xl font-bold">Entrar no Mensalize</h1>
      <input className="w-full rounded border p-2" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-2" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full rounded bg-indigo-600 p-2 text-white" type="submit">Entrar</button>
      <p>Não tem conta? <Link className="text-indigo-600" to="/registrar">Cadastre-se</Link></p>
    </form>
  )
}
```

`web/src/features/auth/RegisterPage.tsx`:
```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../lib/useAuth'

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', hourly_rate: '' })
  const [error, setError] = useState('')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })
  return (
    <form className="mx-auto mt-24 max-w-sm space-y-4" onSubmit={async (e) => {
      e.preventDefault()
      try { await register(form); nav('/') } catch { setError('Não foi possível cadastrar. Verifique os dados.') }
    }}>
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <input aria-label="Nome" className="w-full rounded border p-2" placeholder="Nome" value={form.name} onChange={set('name')} />
      <input aria-label="E-mail" className="w-full rounded border p-2" placeholder="E-mail" value={form.email} onChange={set('email')} />
      <input aria-label="Senha" className="w-full rounded border p-2" type="password" placeholder="Senha" value={form.password} onChange={set('password')} />
      <input aria-label="Confirmar senha" className="w-full rounded border p-2" type="password" placeholder="Confirmar senha" value={form.password_confirmation} onChange={set('password_confirmation')} />
      <input aria-label="Hora-aula" className="w-full rounded border p-2" placeholder="Valor da hora-aula (ex.: 20.00)" value={form.hourly_rate} onChange={set('hourly_rate')} />
      {error && <p className="text-red-600">{error}</p>}
      <button className="w-full rounded bg-indigo-600 p-2 text-white" type="submit">Cadastrar</button>
      <p>Já tem conta? <Link className="text-indigo-600" to="/login">Entrar</Link></p>
    </form>
  )
}
```

`web/src/router.tsx`:
```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { useAuth } from './lib/useAuth'

// Placeholder: substituído pela MonthView na Task 10.
function Home() { return <p className="p-8">Bem-vinda ao Mensalize.</p> }

function Protected({ children }: { children: ReactNode }) {
  const { teacher, isLoading } = useAuth()
  if (isLoading) return <p className="p-8">Carregando…</p>
  return teacher ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/registrar', element: <RegisterPage /> },
  { path: '/', element: <Protected><Home /></Protected> },
])
```

`web/src/main.tsx` (envolver com `QueryClientProvider` e `RouterProvider`).

- [ ] **Step 5: Rodar o teste**

Run: `cd web && npx vitest run src/lib/api.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web
git commit -m "feat: cliente de API, autenticação e rotas protegidas no frontend"
```

---

## Task 5: API de promoções (CRUD + isolamento)

**Files:**
- Create: `api/app/Http/Controllers/Api/PromotionController.php`, `api/app/Http/Requests/StorePromotionRequest.php`, `api/app/Http/Resources/PromotionResource.php`
- Modify: `api/routes/api.php`
- Test: `api/tests/Feature/PromotionTest.php`

**Interfaces:**
- Produces: `GET/POST /api/promotions`, `PUT/DELETE /api/promotions/{id}`; `PromotionResource` → `{id, name, discount_percent}`.

- [ ] **Step 1: Escrever o teste (deve falhar)**

`api/tests/Feature/PromotionTest.php`:
```php
<?php
use App\Models\{Teacher, Promotion};

it('cria e lista promoções do professor', function () {
    $teacher = Teacher::factory()->create();
    $this->actingAs($teacher)->postJson('/api/promotions', ['name' => 'Irmãos', 'discount_percent' => '15'])
        ->assertCreated()->assertJsonPath('name', 'Irmãos');
    $this->actingAs($teacher)->getJson('/api/promotions')->assertOk()->assertJsonCount(1);
});

it('não acessa promoção de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $promo = Promotion::factory()->for($owner)->create();
    $this->actingAs($other)->getJson("/api/promotions/{$promo->id}")->assertNotFound();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter=PromotionTest` → FAIL

- [ ] **Step 3: Implementar**

`api/app/Http/Controllers/Api/PromotionController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromotionRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller {
    public function index(Request $request) {
        return PromotionResource::collection($request->user()->promotions()->orderBy('name')->get());
    }
    public function store(StorePromotionRequest $request) {
        $promotion = $request->user()->promotions()->create($request->validated());
        return (new PromotionResource($promotion))->response()->setStatusCode(201);
    }
    public function update(StorePromotionRequest $request, int $promotion) {
        $model = $request->user()->promotions()->findOrFail($promotion);
        $model->update($request->validated());
        return new PromotionResource($model);
    }
    public function destroy(Request $request, int $promotion) {
        $request->user()->promotions()->findOrFail($promotion)->delete();
        return response()->json(null, 204);
    }
}
```
`StorePromotionRequest`: `name` required string max:255; `discount_percent` required numeric between 0 and 100.
`PromotionResource`: `['id','name','discount_percent' => (string)]`.
`routes/api.php` (dentro do grupo `auth:sanctum`): `Route::apiResource('promotions', PromotionController::class);`

> A rota de update/delete recebe o id e usa `findOrFail` na relação do professor → 404 para outro dono.

- [ ] **Step 4: Rodar** — `cd api && php artisan test --filter=PromotionTest` → PASS

- [ ] **Step 5: Commit**
```bash
git add api && git commit -m "feat: CRUD de promoções com isolamento por professora"
```

---

## Task 6: API de alunos (CRUD + dias da semana + isolamento)

**Files:**
- Create: `api/app/Http/Controllers/Api/StudentController.php`, `api/app/Http/Requests/{StoreStudentRequest,UpdateStudentRequest}.php`, `api/app/Http/Resources/StudentResource.php`
- Modify: `api/routes/api.php`
- Test: `api/tests/Feature/StudentTest.php`

**Interfaces:**
- Consumes: `Student`, `StudentWeekday`, `Promotion`.
- Produces: `GET/POST /api/students`, `GET/PUT/DELETE /api/students/{id}`; `StudentResource` → `{id, name, phone, due_day, weekdays:[int], promotion:{...}|null}`.

- [ ] **Step 1: Escrever o teste (deve falhar)**

`api/tests/Feature/StudentTest.php`:
```php
<?php
use App\Models\Teacher;

it('cria aluno com múltiplos dias e promoção', function () {
    $teacher = Teacher::factory()->create();
    $promo = $teacher->promotions()->create(['name' => 'Irmãos', 'discount_percent' => '15']);
    $this->actingAs($teacher)->postJson('/api/students', [
        'name' => 'Ana', 'phone' => '31 99999-8888', 'due_day' => 10,
        'promotion_id' => $promo->id, 'weekdays' => [1, 3],
    ])->assertCreated()->assertJsonPath('weekdays', [1, 3]);
});

it('atualiza os dias do aluno substituindo os antigos', function () {
    $teacher = Teacher::factory()->create();
    $student = $teacher->students()->create(['name' => 'Bia', 'phone' => '31999998888', 'due_day' => 5]);
    $student->weekdays()->createMany([['weekday' => 1], ['weekday' => 3]]);
    $this->actingAs($teacher)->putJson("/api/students/{$student->id}", ['weekdays' => [2]])
        ->assertOk()->assertJsonPath('weekdays', [2]);
});

it('não acessa aluno de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $student = $owner->students()->create(['name' => 'X', 'phone' => '31999998888', 'due_day' => 5]);
    $this->actingAs($other)->getJson("/api/students/{$student->id}")->assertNotFound();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter=StudentTest` → FAIL

- [ ] **Step 3: Implementar requests**

`StoreStudentRequest`:
```php
public function rules(): array {
    return [
        'name' => ['required', 'string', 'max:255'],
        'phone' => ['required', 'string', 'max:20'],
        'due_day' => ['required', 'integer', 'between:1,31'],
        'promotion_id' => ['nullable', 'integer', 'exists:promotions,id'],
        'weekdays' => ['required', 'array', 'min:1'],
        'weekdays.*' => ['integer', 'between:1,7', 'distinct'],
    ];
}
```
`UpdateStudentRequest`: mesmas regras com `sometimes` (o PUT envia o conjunto completo de weekdays).

- [ ] **Step 4: Implementar controller e resource**

`api/app/Http/Controllers/Api/StudentController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\{StoreStudentRequest, UpdateStudentRequest};
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller {
    public function index(Request $request) {
        return StudentResource::collection(
            $request->user()->students()->with('weekdays', 'promotion')->orderBy('name')->get()
        );
    }
    public function store(StoreStudentRequest $request) {
        $student = DB::transaction(function () use ($request) {
            $data = $request->safe()->except('weekdays');
            $student = $request->user()->students()->create($data);
            $this->syncWeekdays($student, $request->input('weekdays'));
            return $student;
        });
        return (new StudentResource($student->load('weekdays', 'promotion')))->response()->setStatusCode(201);
    }
    public function show(Request $request, int $student) {
        return new StudentResource(
            $request->user()->students()->with('weekdays', 'promotion')->findOrFail($student)
        );
    }
    public function update(UpdateStudentRequest $request, int $student) {
        $model = $request->user()->students()->findOrFail($student);
        DB::transaction(function () use ($request, $model) {
            $model->update($request->safe()->except('weekdays'));
            if ($request->has('weekdays')) $this->syncWeekdays($model, $request->input('weekdays'));
        });
        return new StudentResource($model->load('weekdays', 'promotion'));
    }
    public function destroy(Request $request, int $student) {
        $request->user()->students()->findOrFail($student)->delete();
        return response()->json(null, 204);
    }
    private function syncWeekdays(Student $student, array $weekdays): void {
        $student->weekdays()->delete();
        $student->weekdays()->createMany(collect($weekdays)->map(fn ($w) => ['weekday' => $w])->all());
    }
}
```

`StudentResource`:
```php
return [
    'id' => $this->id,
    'name' => $this->name,
    'phone' => $this->phone,
    'due_day' => $this->due_day,
    'weekdays' => $this->weekdays->pluck('weekday')->sort()->values(),
    'promotion' => $this->promotion ? [
        'id' => $this->promotion->id, 'name' => $this->promotion->name,
        'discount_percent' => (string) $this->promotion->discount_percent,
    ] : null,
];
```
`routes/api.php`: `Route::apiResource('students', StudentController::class);`

- [ ] **Step 5: Rodar** — `cd api && php artisan test --filter=StudentTest` → PASS

- [ ] **Step 6: Commit**
```bash
git add api && git commit -m "feat: CRUD de alunos com dias da semana e isolamento"
```

---

## Task 7: Frontend — telas de promoções e alunos

**Files:**
- Create: `web/src/features/promotions/{PromotionsPage.tsx,api.ts}`, `web/src/features/students/{StudentsPage.tsx,StudentForm.tsx,api.ts}`
- Modify: `web/src/router.tsx` (adicionar rotas `/alunos`, `/promocoes`)
- Test: `web/src/features/students/StudentForm.test.tsx`

**Interfaces:**
- Consumes: `apiFetch`, endpoints das Tasks 5 e 6.
- Produces: páginas de listagem e formulário de aluno (dias como múltipla escolha).

- [ ] **Step 1: Escrever o teste do formulário (deve falhar)**

`web/src/features/students/StudentForm.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentForm } from './StudentForm'

describe('StudentForm', () => {
  it('envia os dias selecionados', () => {
    const onSubmit = vi.fn()
    render(<StudentForm onSubmit={onSubmit} promotions={[]} />)
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '31999998888' } })
    fireEvent.change(screen.getByLabelText('Dia de vencimento'), { target: { value: '10' } })
    fireEvent.click(screen.getByLabelText('Segunda'))
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana', weekdays: [1] }))
  })
})
```

- [ ] **Step 2: Rodar e ver falhar** — `cd web && npx vitest run src/features/students/StudentForm.test.tsx` → FAIL

- [ ] **Step 3: Implementar o formulário e as páginas**

`web/src/features/students/StudentForm.tsx` (resumo do essencial):
```tsx
const WEEKDAYS = [
  { value: 1, label: 'Segunda' }, { value: 2, label: 'Terça' }, { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' }, { value: 5, label: 'Sexta' }, { value: 6, label: 'Sábado' }, { value: 7, label: 'Domingo' },
]

export function StudentForm({ initial, promotions, onSubmit }: {
  initial?: StudentInput; promotions: { id: number; name: string }[]; onSubmit: (v: StudentInput) => void
}) {
  const [form, setForm] = useState<StudentInput>(initial ?? { name: '', phone: '', due_day: 10, weekdays: [], promotion_id: null })
  const toggle = (w: number) => setForm((f) => ({ ...f, weekdays: f.weekdays.includes(w) ? f.weekdays.filter((x) => x !== w) : [...f.weekdays, w] }))
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}>
      <label className="block">Nome<input id="name" aria-label="Nome" className="w-full rounded border p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="block">Telefone<input aria-label="Telefone" className="w-full rounded border p-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
      <label className="block">Dia de vencimento<input aria-label="Dia de vencimento" type="number" min={1} max={31} className="w-full rounded border p-2" value={form.due_day} onChange={(e) => setForm({ ...form, due_day: Number(e.target.value) })} /></label>
      <fieldset><legend>Dias de aula</legend>
        {WEEKDAYS.map((w) => (<label key={w.value} className="mr-3"><input type="checkbox" checked={form.weekdays.includes(w.value)} onChange={() => toggle(w.value)} />{w.label}</label>))}
      </fieldset>
      <label className="block">Promoção<select aria-label="Promoção" className="w-full rounded border p-2" value={form.promotion_id ?? ''} onChange={(e) => setForm({ ...form, promotion_id: e.target.value ? Number(e.target.value) : null })}>
        <option value="">Nenhuma</option>{promotions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select></label>
      <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">Salvar</button>
    </form>
  )
}
```

`web/src/features/students/api.ts`: funções `listStudents()`, `createStudent`, `updateStudent`, `deleteStudent` usando `apiFetch`.
`web/src/features/students/StudentsPage.tsx`: lista + formulário em painel; invalida `['students']` após salvar.
`web/src/features/promotions/{api.ts,PromotionsPage.tsx}`: CRUD simples de promoções.
`router.tsx`: rotas `/alunos` e `/promocoes` dentro de `Protected`; adicionar navegação (`<nav>` com links).

- [ ] **Step 4: Rodar o teste** — `cd web && npx vitest run src/features/students/StudentForm.test.tsx` → PASS

- [ ] **Step 5: Commit**
```bash
git add web && git commit -m "feat: telas de alunos e promoções no frontend"
```

---

## Task 8: Services de cálculo — contagem de aulas e valor base

**Files:**
- Create: `api/app/Services/{LessonCounter,MensalidadeCalculator}.php`
- Test: `api/tests/Unit/MensalidadeCalculatorTest.php`

**Interfaces:**
- Produces:
  - `LessonCounter::countInMonth(array $weekdays, CarbonImmutable $month): int`
  - `MensalidadeCalculator::baseAmount(int $lessons, string $hourlyRate, ?string $discountPercent): string`
  - `MensalidadeCalculator::dueDate(CarbonImmutable $referenceMonth, int $dueDay): CarbonImmutable`

- [ ] **Step 1: Escrever os testes unitários (devem falhar)**

`api/tests/Unit/MensalidadeCalculatorTest.php`:
```php
<?php
use App\Services\{LessonCounter, MensalidadeCalculator};
use Carbon\CarbonImmutable;

it('conta as aulas de um dia da semana em setembro/2026', function () {
    // setembro/2026 tem as segundas: 7, 14, 21, 28 => 4
    expect((new LessonCounter)->countInMonth([1], CarbonImmutable::parse('2026-09-01')))->toBe(4);
});

it('soma as ocorrências de múltiplos dias no mês', function () {
    // setembro/2026: segundas=4, quartas=5 (2,9,16,23,30) => 9
    expect((new LessonCounter)->countInMonth([1, 3], CarbonImmutable::parse('2026-09-01')))->toBe(9);
});

it('calcula o valor base com desconto, 2 casas', function () {
    expect((new MensalidadeCalculator)->baseAmount(9, '20.00', '10.00'))->toBe('162.00');
    expect((new MensalidadeCalculator)->baseAmount(4, '25.50', null))->toBe('102.00');
});

it('clampa o vencimento para o último dia do mês quando o dia não existe', function () {
    // competência 2026-01 (31 dias) -> vence em 2026-02; 31/02 não existe => 28
    expect((new MensalidadeCalculator)->dueDate(CarbonImmutable::parse('2026-01-01'), 31)->format('Y-m-d'))
        ->toBe('2026-02-28');
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter=MensalidadeCalculatorTest` → FAIL

- [ ] **Step 3: Implementar**

`api/app/Services/LessonCounter.php`:
```php
<?php
namespace App\Services;

use Carbon\CarbonImmutable;

class LessonCounter {
    /** @param int[] $weekdays 1=seg ... 7=dom */
    public function countInMonth(array $weekdays, CarbonImmutable $month): int {
        $count = 0;
        for ($d = $month->startOfMonth(); $d->lte($month->endOfMonth()); $d = $d->addDay()) {
            if (in_array($d->isoWeekday(), $weekdays, true)) $count++;
        }
        return $count;
    }
}
```

`api/app/Services/MensalidadeCalculator.php`:
```php
<?php
namespace App\Services;

use Carbon\CarbonImmutable;

class MensalidadeCalculator {
    public function baseAmount(int $lessons, string $hourlyRate, ?string $discountPercent): string {
        $discount = $discountPercent === null ? 0.0 : (float) $discountPercent;
        $amount = $lessons * (float) $hourlyRate * (1 - $discount / 100);
        return number_format(round($amount, 2), 2, '.', '');
    }

    public function dueDate(CarbonImmutable $referenceMonth, int $dueDay): CarbonImmutable {
        $next = $referenceMonth->addMonthNoOverflow()->startOfMonth();
        return $next->day(min($dueDay, $next->daysInMonth));
    }
}
```

- [ ] **Step 4: Rodar** — `cd api && php artisan test --filter=MensalidadeCalculatorTest` → PASS

- [ ] **Step 5: Commit**
```bash
git add api && git commit -m "feat: services de contagem de aulas e cálculo da mensalidade"
```

---

## Task 9: Criação lazy das mensalidades e visão do mês

**Files:**
- Create: `api/app/Services/InvoiceService.php`, `api/app/Http/Controllers/Api/InvoiceController.php`, `api/app/Http/Requests/UpdateInvoiceRequest.php`, `api/app/Http/Resources/{InvoiceResource,AdjustmentResource}.php`
- Modify: `api/routes/api.php`
- Test: `api/tests/Feature/InvoiceTest.php`

**Interfaces:**
- Consumes: `LessonCounter`, `MensalidadeCalculator`, models.
- Produces: `InvoiceService::ensureMonth(Teacher, string $ym): Collection<Invoice>`; `GET /api/invoices?month=YYYY-MM`, `GET /api/invoices/{id}`, `PATCH /api/invoices/{id}` (status).

- [ ] **Step 1: Escrever o teste (deve falhar)**

`api/tests/Feature/InvoiceTest.php`:
```php
<?php
use App\Models\Teacher;

it('cria mensalidades lazy com snapshot, vencimento e status', function () {
    $teacher = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $promo = $teacher->promotions()->create(['name' => 'Irmãos', 'discount_percent' => '10']);
    $student = $teacher->students()->create(['name' => 'Ana', 'phone' => '5531999998888', 'due_day' => 10, 'promotion_id' => $promo->id]);
    $student->weekdays()->createMany([['weekday' => 1], ['weekday' => 3]]);

    $this->actingAs($teacher)->getJson('/api/invoices?month=2026-09')->assertOk()->assertJsonCount(1)
        ->assertJsonPath('0.base_lesson_count', 9)
        ->assertJsonPath('0.base_amount', '162.00')
        ->assertJsonPath('0.due_date', '2026-10-10')
        ->assertJsonPath('0.status', 'pending');

    // chamar de novo não duplica
    $this->actingAs($teacher)->getJson('/api/invoices?month=2026-09')->assertJsonCount(1);
    expect($teacher->invoices()->count())->toBe(1);
});

it('não acessa mensalidade de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $s = $owner->students()->create(['name' => 'X', 'phone' => '1', 'due_day' => 5]);
    $inv = $owner->invoices()->create(['student_id' => $s->id, 'reference_month' => '2026-09',
        'base_lesson_count' => 0, 'base_amount' => '0.00', 'due_date' => '2026-10-05', 'status' => 'pending']);
    $this->actingAs($other)->getJson("/api/invoices/{$inv->id}")->assertNotFound();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter=InvoiceTest` → FAIL

- [ ] **Step 3: Implementar o Service**

`api/app/Services/InvoiceService.php`:
```php
<?php
namespace App\Services;

use App\Models\{Invoice, Teacher};
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class InvoiceService {
    public function __construct(
        private LessonCounter $counter,
        private MensalidadeCalculator $calculator,
    ) {}

    /** @return Collection<int, Invoice> */
    public function ensureMonth(Teacher $teacher, string $ym): Collection {
        $month = CarbonImmutable::createFromFormat('Y-m', $ym)->startOfMonth();
        $students = $teacher->students()->with('weekdays', 'promotion')->get();

        return $students->map(function ($student) use ($teacher, $month) {
            $lessons = $this->counter->countInMonth($student->weekdays->pluck('weekday')->all(), $month);
            return Invoice::firstOrCreate(
                ['student_id' => $student->id, 'reference_month' => $month->format('Y-m')],
                [
                    'teacher_id' => $teacher->id,
                    'base_lesson_count' => $lessons,
                    'base_amount' => $this->calculator->baseAmount($lessons, $teacher->hourly_rate, $student->promotion?->discount_percent),
                    'due_date' => $this->calculator->dueDate($month, $student->due_day)->format('Y-m-d'),
                    'status' => 'pending',
                ],
            );
        });
    }
}
```

- [ ] **Step 4: Implementar controller, resource e rota**

`api/app/Http/Controllers/Api/InvoiceController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateInvoiceRequest;
use App\Http\Resources\InvoiceResource;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class InvoiceController extends Controller {
    public function __construct(private InvoiceService $service) {}

    public function index(Request $request) {
        $ym = $request->validate(['month' => ['required', 'date_format:Y-m']])['month'];
        $invoices = $this->service->ensureMonth($request->user(), $ym);
        $invoices->load('student', 'adjustments');
        return InvoiceResource::collection($invoices->sortBy('student.name')->values());
    }

    public function show(Request $request, int $invoice) {
        $model = $request->user()->invoices()->with('student', 'adjustments')->findOrFail($invoice);
        return new InvoiceResource($model);
    }

    public function update(UpdateInvoiceRequest $request, int $invoice) {
        $model = $request->user()->invoices()->with('student', 'adjustments')->findOrFail($invoice);
        $data = $request->validated();
        if (($data['status'] ?? null) === 'paid' && $model->status !== 'paid') $data['paid_at'] = now();
        if (($data['status'] ?? null) === 'pending') $data['paid_at'] = null;
        $model->update($data);
        return new InvoiceResource($model->fresh()->load('student', 'adjustments'));
    }
}
```

`api/app/Http/Requests/UpdateInvoiceRequest.php`: `status` required in: `pending,paid`.
`api/app/Http/Resources/InvoiceResource.php`:
```php
return [
    'id' => $this->id,
    'reference_month' => $this->reference_month,
    'student' => ['id' => $this->student->id, 'name' => $this->student->name],
    'base_lesson_count' => $this->base_lesson_count,
    'base_amount' => (string) $this->base_amount,
    'adjustments' => AdjustmentResource::collection($this->adjustments),
    'total_amount' => $this->total_amount,
    'due_date' => $this->due_date->format('Y-m-d'),
    'status' => $this->status,
    'paid_at' => $this->paid_at?->toIso8601String(),
];
```
`AdjustmentResource`: `['id','description','amount' => (string)]`.
`routes/api.php`: `Route::get('invoices', [InvoiceController::class, 'index']); Route::get('invoices/{invoice}', [InvoiceController::class, 'show']); Route::patch('invoices/{invoice}', [InvoiceController::class, 'update']);`

- [ ] **Step 5: Rodar** — `cd api && php artisan test --filter=InvoiceTest` → PASS

- [ ] **Step 6: Commit**
```bash
git add api && git commit -m "feat: criação lazy de mensalidades e visão do mês"
```

---

## Task 10: Frontend — visão do mês

**Files:**
- Create: `web/src/features/invoices/{MonthView.tsx,api.ts,types.ts}`
- Modify: `web/src/router.tsx` (substituir o placeholder `Home` pela `MonthView` na rota `/`)
- Test: `web/src/lib/format.test.ts` ampliado (data)

**Interfaces:**
- Consumes: `GET /api/invoices?month=YYYY-MM`.
- Produces: `MonthView` com seletor de mês e tabela (aluno, valor, vencimento, status).

- [ ] **Step 1: Escrever o teste de formatação de data (deve falhar)**

Adicionar a `web/src/lib/format.test.ts`:
```ts
import { formatDateBR } from './format'

describe('formatDateBR', () => {
  it('formata data ISO em pt-BR', () => {
    expect(formatDateBR('2026-10-10')).toBe('10/10/2026')
  })
})
```
E em `web/src/lib/format.ts` adicionar:
```ts
export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
```

- [ ] **Step 2: Rodar e ver falhar** — `cd web && npx vitest run src/lib/format.test.ts` → FAIL (até implementar `formatDateBR`)

- [ ] **Step 3: Implementar a visão do mês**

`web/src/features/invoices/api.ts`:
```ts
import { apiFetch } from '../../lib/api'
import type { Invoice } from './types'

export function listInvoices(month: string): Promise<Invoice[]> {
  return apiFetch<Invoice[]>(`/invoices?month=${month}`)
}
export function updateInvoiceStatus(id: number, status: 'pending' | 'paid'): Promise<Invoice> {
  return apiFetch<Invoice>(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
}
```

`web/src/features/invoices/MonthView.tsx`:
```tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listInvoices } from './api'
import { formatBRL, formatDateBR } from '../../lib/format'

export function MonthView() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const { data = [], isLoading } = useQuery({ queryKey: ['invoices', month], queryFn: () => listInvoices(month) })

  return (
    <section className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Visão do mês</h1>
        <input type="month" aria-label="Competência" value={month} onChange={(e) => setMonth(e.target.value)} className="rounded border p-2" />
      </div>
      {isLoading ? <p>Carregando…</p> : (
        <table className="w-full border-collapse">
          <thead><tr className="text-left"><th>Aluno</th><th>Valor</th><th>Vencimento</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="py-2">{inv.student.name}</td>
                <td>{formatBRL(inv.total_amount)}</td>
                <td>{formatDateBR(inv.due_date)}</td>
                <td>{inv.status === 'paid' ? 'Pago' : 'Pendente'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
```

- [ ] **Step 4: Rodar os testes** — `cd web && npx vitest run` → PASS

- [ ] **Step 5: Commit**
```bash
git add web && git commit -m "feat: visão do mês no frontend"
```

---

## Task 11: API de ajustes (aula extra e ajuste manual)

**Files:**
- Create: `api/app/Http/Controllers/Api/InvoiceAdjustmentController.php`, `api/app/Http/Requests/StoreAdjustmentRequest.php`
- Modify: `api/routes/api.php`
- Test: `api/tests/Feature/InvoiceAdjustmentTest.php`

**Interfaces:**
- Consumes: `Invoice`, `InvoiceAdjustment`.
- Produces: `POST /api/invoices/{id}/adjustments`, `DELETE /api/invoices/{id}/adjustments/{adjustmentId}`; `total_amount` atualizado.

- [ ] **Step 1: Escrever o teste (deve falhar)**

`api/tests/Feature/InvoiceAdjustmentTest.php`:
```php
<?php
use App\Models\{Teacher, Invoice};

function makeInvoice(Teacher $t, string $base = '100.00'): Invoice {
    $s = $t->students()->create(['name' => 'Ana', 'phone' => '1', 'due_day' => 5]);
    return $t->invoices()->create(['student_id' => $s->id, 'reference_month' => '2026-09',
        'base_lesson_count' => 5, 'base_amount' => $base, 'due_date' => '2026-10-05', 'status' => 'pending']);
}

it('adiciona aula extra e ajuste negativo, refletindo no total', function () {
    $t = Teacher::factory()->create(['hourly_rate' => '20.00']);
    $inv = makeInvoice($t);

    $this->actingAs($t)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'Aula extra', 'amount' => '20.00'])
        ->assertCreated();
    $this->actingAs($t)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'Falta', 'amount' => '-20.00'])
        ->assertCreated();

    $this->actingAs($t)->getJson("/api/invoices/{$inv->id}")->assertJsonPath('total_amount', '100.00');
});

it('não adiciona ajuste em mensalidade de outro professor (404)', function () {
    $owner = Teacher::factory()->create();
    $other = Teacher::factory()->create();
    $inv = makeInvoice($owner);
    $this->actingAs($other)->postJson("/api/invoices/{$inv->id}/adjustments", ['description' => 'x', 'amount' => '1'])
        ->assertNotFound();
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter=InvoiceAdjustmentTest` → FAIL

- [ ] **Step 3: Implementar**

`api/app/Http/Requests/StoreAdjustmentRequest.php`:
```php
public function rules(): array {
    return [
        'description' => ['required', 'string', 'max:255'],
        'amount' => ['required', 'numeric'],
    ];
}
```

`api/app/Http/Controllers/Api/InvoiceAdjustmentController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdjustmentRequest;
use App\Http\Resources\AdjustmentResource;
use Illuminate\Http\Request;

class InvoiceAdjustmentController extends Controller {
    public function store(StoreAdjustmentRequest $request, int $invoice) {
        $model = $request->user()->invoices()->findOrFail($invoice);
        $adjustment = $model->adjustments()->create($request->validated());
        return (new AdjustmentResource($adjustment))->response()->setStatusCode(201);
    }
    public function destroy(Request $request, int $invoice, int $adjustment) {
        $model = $request->user()->invoices()->findOrFail($invoice);
        $model->adjustments()->findOrFail($adjustment)->delete();
        return response()->json(null, 204);
    }
}
```
`routes/api.php`: `Route::post('invoices/{invoice}/adjustments', [InvoiceAdjustmentController::class, 'store']);` e `Route::delete('invoices/{invoice}/adjustments/{adjustment}', [InvoiceAdjustmentController::class, 'destroy']);`

- [ ] **Step 4: Rodar** — `cd api && php artisan test --filter=InvoiceAdjustmentTest` → PASS

- [ ] **Step 5: Commit**
```bash
git add api && git commit -m "feat: ajustes e aulas extras na mensalidade"
```

---

## Task 12: Mensagem e link do WhatsApp

**Files:**
- Create: `api/app/Services/{MessageTemplateRenderer,WhatsAppLinkBuilder}.php`, `api/app/Http/Controllers/Api/WhatsappLinkController.php`
- Modify: `api/routes/api.php`
- Test: `api/tests/Unit/WhatsAppLinkBuilderTest.php`, `api/tests/Feature/WhatsappLinkTest.php`

**Interfaces:**
- Consumes: `Invoice`, `Teacher`, `Placeholders`.
- Produces: `GET /api/invoices/{id}/whatsapp-link` → `{url, message}`.

- [ ] **Step 1: Escrever os testes (devem falhar)**

`api/tests/Unit/WhatsAppLinkBuilderTest.php`:
```php
<?php
use App\Services\{MessageTemplateRenderer, WhatsAppLinkBuilder};

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
```

`api/tests/Feature/WhatsappLinkTest.php`:
```php
<?php
use App\Models\Teacher;

it('gera o link do WhatsApp da mensalidade', function () {
    $t = Teacher::factory()->create(['hourly_rate' => '20.00', 'name' => 'Carol']);
    $s = $t->students()->create(['name' => 'Ana', 'phone' => '31999998888', 'due_day' => 10]);
    $s->weekdays()->create(['weekday' => 1]);
    $this->actingAs($t)->getJson('/api/invoices?month=2026-09');
    $inv = $t->invoices()->first();

    $this->actingAs($t)->getJson("/api/invoices/{$inv->id}/whatsapp-link")
        ->assertOk()->assertJsonPath('url', fn ($u) => str_starts_with($u, 'https://wa.me/5531999998888?text='));
});
```

- [ ] **Step 2: Rodar e ver falhar** — `cd api && php artisan test --filter='WhatsAppLinkBuilderTest|WhatsappLinkTest'` → FAIL

- [ ] **Step 3: Implementar**

`api/app/Services/WhatsAppLinkBuilder.php`:
```php
<?php
namespace App\Services;

class WhatsAppLinkBuilder {
    public function build(string $phone, string $message): string {
        return 'https://wa.me/'.$this->normalizePhone($phone).'?text='.rawurlencode($message);
    }
    public function normalizePhone(string $phone): string {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 11) $digits = '55'.$digits;
        return $digits;
    }
}
```

`api/app/Services/MessageTemplateRenderer.php`:
```php
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
```

`api/app/Http/Controllers/Api/WhatsappLinkController.php`:
```php
<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\{MessageTemplateRenderer, WhatsAppLinkBuilder};
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class WhatsappLinkController extends Controller {
    public function __invoke(Request $request, int $invoice) {
        $teacher = $request->user();
        $model = $teacher->invoices()->with('student', 'adjustments')->findOrFail($invoice);

        $competencia = Carbon::createFromFormat('Y-m', $model->reference_month)->format('m/Y');
        $message = (new MessageTemplateRenderer)->render($teacher->message_template, [
            'aluno' => $model->student->name,
            'competencia' => $competencia,
            'aulas' => $model->base_lesson_count,
            'valor' => 'R$ '.number_format((float) $model->total_amount, 2, ',', '.'),
            'vencimento' => $model->due_date->format('d/m/Y'),
            'professora' => $teacher->name,
        ]);
        $url = (new WhatsAppLinkBuilder)->build($model->student->phone, $message);

        return response()->json(['url' => $url, 'message' => $message]);
    }
}
```
`routes/api.php`: `Route::get('invoices/{invoice}/whatsapp-link', WhatsappLinkController::class);`

- [ ] **Step 4: Rodar** — `cd api && php artisan test --filter='WhatsApp'` → PASS

- [ ] **Step 5: Commit**
```bash
git add api && git commit -m "feat: geração da mensagem e link do WhatsApp"
```

---

## Task 13: Frontend — detalhe da cobrança (ajustes, envio, pago)

**Files:**
- Create: `web/src/features/invoices/{InvoiceDetail.tsx,AdjustmentsPanel.tsx}`
- Modify: `web/src/features/invoices/api.ts`, `web/src/router.tsx` (rota `/invoices/:id`)
- Test: `web/src/features/invoices/AdjustmentsPanel.test.tsx`

**Interfaces:**
- Consumes: endpoints das Tasks 9, 11, 12.
- Produces: `InvoiceDetail` (lista ajustes, adicionar aula extra/ajuste, "Enviar cobrança" abre `url`, marcar pago/pendente).

- [ ] **Step 1: Escrever o teste (deve falhar)**

`web/src/features/invoices/AdjustmentsPanel.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdjustmentsPanel } from './AdjustmentsPanel'

describe('AdjustmentsPanel', () => {
  it('adiciona aula extra com o valor da hora-aula', () => {
    const onAdd = vi.fn()
    render(<AdjustmentsPanel hourlyRate="20.00" onAdd={onAdd} />)
    fireEvent.click(screen.getByRole('button', { name: /aula extra/i }))
    expect(onAdd).toHaveBeenCalledWith({ description: 'Aula extra', amount: '20.00' })
  })
})
```

- [ ] **Step 2: Rodar e ver falhar** — `cd web && npx vitest run src/features/invoices/AdjustmentsPanel.test.tsx` → FAIL

- [ ] **Step 3: Implementar**

`web/src/features/invoices/AdjustmentsPanel.tsx`:
```tsx
import { useState } from 'react'
import type { Adjustment } from './types'
import { formatBRL } from '../../lib/format'

export function AdjustmentsPanel({ hourlyRate, adjustments = [], onAdd, onRemove }: {
  hourlyRate: string; adjustments?: Adjustment[]
  onAdd: (a: { description: string; amount: string }) => void
  onRemove?: (id: number) => void
}) {
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState('')
  return (
    <div className="space-y-3">
      <ul className="divide-y">
        {adjustments.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-1">
            <span>{a.description}</span>
            <span className="flex items-center gap-3">
              {formatBRL(a.amount)}
              {onRemove && <button aria-label={`remover-${a.id}`} onClick={() => onRemove(a.id)}>×</button>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-2">
        <button className="rounded bg-emerald-600 px-3 py-2 text-white"
          onClick={() => onAdd({ description: 'Aula extra', amount: hourlyRate })}>Aula extra</button>
        <input aria-label="Descrição" className="rounded border p-2" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input aria-label="Valor" className="rounded border p-2" placeholder="Valor (ex.: -20,00)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="rounded border px-3 py-2"
          onClick={() => { if (description && amount) { onAdd({ description, amount: amount.replace(',', '.') }); setDescription(''); setAmount('') } }}>Adicionar</button>
      </div>
    </div>
  )
}
```

`web/src/features/invoices/InvoiceDetail.tsx`: busca `GET /invoices/{id}`, exibe total, `AdjustmentsPanel`, botão **"Enviar cobrança"** (`GET /invoices/{id}/whatsapp-link` → `window.open(url)`), e botões marcar **Pago/Pendente** (`PATCH`). Invalida `['invoice', id]` e `['invoices', month]` após mutações.
`web/src/features/invoices/api.ts`: adicionar `getInvoice(id)`, `addAdjustment(id, payload)`, `removeAdjustment(invoiceId, adjId)`, `getWhatsappLink(id)`.
`router.tsx`: `{ path: '/invoices/:id', element: <Protected><InvoiceDetail /></Protected> }`; na `MonthView`, cada linha vira link para o detalhe.

- [ ] **Step 4: Rodar os testes** — `cd web && npx vitest run` → PASS

- [ ] **Step 5: Commit**
```bash
git add web && git commit -m "feat: detalhe da cobrança com ajustes, envio e pagamento"
```

---

## Task 14: Frontend — perfil (hora-aula e modelo de mensagem)

**Files:**
- Create: `web/src/features/profile/{ProfilePage.tsx,api.ts}`
- Modify: `web/src/router.tsx` (rota `/perfil`)
- Test: `web/src/features/students/StudentForm.test.tsx` (mantém-se) — sem novo teste obrigatório; validar manualmente a validação de placeholders no backend (Task 3).

**Interfaces:**
- Consumes: `GET/PUT /api/profile`.

- [ ] **Step 1: Implementar a página de perfil**

`web/src/features/profile/ProfilePage.tsx`:
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { Teacher } from '../../lib/useAuth'

const PLACEHOLDERS = ['{aluno}', '{competencia}', '{aulas}', '{valor}', '{vencimento}', '{professora}']

export function ProfilePage() {
  const qc = useQueryClient()
  const { data } = useQuery({ queryKey: ['me'], queryFn: () => apiFetch<Teacher>('/me') })
  const save = useMutation({
    mutationFn: (payload: Partial<Teacher>) => apiFetch<Teacher>('/profile', { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
  if (!data) return <p className="p-6">Carregando…</p>
  return (
    <section className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Perfil</h1>
      <label className="block">Valor da hora-aula
        <input aria-label="Valor da hora-aula" className="w-full rounded border p-2" defaultValue={data.hourly_rate}
          onBlur={(e) => save.mutate({ hourly_rate: e.target.value })} /></label>
      <label className="block">Modelo da mensagem
        <textarea aria-label="Modelo da mensagem" className="h-32 w-full rounded border p-2" defaultValue={data.message_template ?? ''}
          onBlur={(e) => save.mutate({ message_template: e.target.value })} /></label>
      <p className="text-sm text-gray-500">Placeholders permitidos: {PLACEHOLDERS.join(' ')}</p>
    </section>
  )
}
```
`router.tsx`: rota `/perfil`.

- [ ] **Step 2: Verificar manualmente**

Run: `cd web && npm run dev` (com a API rodando) e ajustar hora-aula/modelo; confirmar persistência ao recarregar.
Expected: valores persistidos; placeholder inválido rejeitado pelo backend (422).

- [ ] **Step 3: Commit**
```bash
git add web && git commit -m "feat: tela de perfil (hora-aula e modelo de mensagem)"
```

---

## Task 15: Empacotamento — Docker Compose, Nginx e Dockerfiles

**Files:**
- Create: `api/Dockerfile`, `web/Dockerfile`, `docker/nginx/default.conf`, `docker-compose.yml`, `.env.example`
- Test: verificação de subida (`docker compose up`).

**Interfaces:**
- Produces: stack completa em um domínio; Nginx serve os estáticos da SPA e faz proxy `/api` e `/sanctum` para o PHP-FPM.

- [ ] **Step 1: Criar os Dockerfiles**

`api/Dockerfile`:
```dockerfile
FROM php:8.3-fpm
RUN apt-get update && apt-get install -y git unzip libzip-dev \
  && docker-php-ext-install pdo_mysql zip \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
WORKDIR /var/www/api
COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN chown -R www-data:www-data storage bootstrap/cache
CMD ["php-fpm"]
```

`web/Dockerfile`:
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

`docker/nginx/default.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    location /api { try_files $uri @api; }
    location /sanctum { try_files $uri @api; }
    location / { try_files $uri /index.html; }

    location @api {
        include fastcgi_params;
        fastcgi_pass api:9000;
        fastcgi_param SCRIPT_FILENAME /var/www/api/public/index.php;
    }
}
```

- [ ] **Step 2: Criar o docker-compose**

`docker-compose.yml`:
```yaml
services:
  nginx:
    build: ./web
    ports: ["80:80"]
    volumes: ["./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [api]
  api:
    build: ./api
    depends_on: [mysql]
    volumes: ["./api:/var/www/api"]
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: mensalize
      MYSQL_ROOT_PASSWORD: secret
    volumes: ["dbdata:/var/lib/mysql"]
volumes:
  dbdata:
```

- [ ] **Step 3: Subir e verificar**

Run: `docker compose up -d --build && curl -s -o /dev/null -w "%{http_code}" http://localhost/api/me`
Expected: `401` (API respondendo; SPA servida em `/`)

- [ ] **Step 4: Commit**
```bash
git add api/Dockerfile web/Dockerfile docker docker-compose.yml .env.example
git commit -m "chore: empacotamento com Docker Compose e Nginx"
```

---

## Task 16: CI e teste ponta-a-ponta (Playwright)

**Files:**
- Create: `.github/workflows/ci.yml`, `web/playwright.config.ts`, `web/e2e/critical-path.spec.ts`
- Test: execução do Playwright contra a stack local/CI.

**Interfaces:**
- Consumes: toda a aplicação.
- Produces: pipeline que roda Pest, Vitest e Playwright.

- [ ] **Step 1: Escrever o E2E do caminho crítico (deve falhar)**

`web/e2e/critical-path.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('professora cadastra, cria aluno, cobra e marca pago', async ({ page }) => {
  const email = `carol${Date.now()}@example.com`
  await page.goto('/registrar')
  await page.getByLabel('Nome').fill('Carol')
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill('secret123')
  await page.getByLabel('Confirmar senha').fill('secret123')
  await page.getByLabel('Hora-aula').fill('20')
  await page.getByRole('button', { name: /cadastrar/i }).click()

  await page.getByRole('link', { name: /alunos/i }).click()
  await page.getByRole('button', { name: /novo aluno/i }).click()
  await page.getByLabel('Nome').fill('Ana')
  await page.getByLabel('Telefone').fill('31999998888')
  await page.getByLabel('Segunda').check()
  await page.getByRole('button', { name: /salvar/i }).click()

  await page.getByRole('link', { name: /mês|início/i }).click()
  await expect(page.getByText('Ana')).toBeVisible()
  await page.getByText('Ana').click()
  await page.getByRole('button', { name: /aula extra/i }).click()
  await page.getByRole('button', { name: /marcar como pago/i }).click()
  await expect(page.getByText('Pago')).toBeVisible()
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd web && npx playwright test`
Expected: FAIL (app/rotas ainda sem todos os elementos; corrigir seletores/aria-labels até passar)

- [ ] **Step 3: Configurar o Playwright e o CI**

`web/playwright.config.ts`: `baseURL: 'http://localhost:5173'`, `webServer` subindo `npm run dev` (ou apontando para o Compose).
`.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env: { MYSQL_DATABASE: mensalize, MYSQL_ROOT_PASSWORD: secret }
        ports: ['3306:3306']
    defaults: { run: { working-directory: api } }
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3' }
      - run: composer install --no-interaction
      - run: cp .env.ci .env || true
      - run: php artisan key:generate
      - run: php artisan migrate --force
      - run: php artisan test
  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: web } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx vitest run
```

- [ ] **Step 4: Rodar novamente**

Run: `cd web && npx playwright test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add .github web/playwright.config.ts web/e2e
git commit -m "test: E2E do caminho crítico e pipeline de CI"
```

---

## Cobertura do TDD (self-review)

| Seção do TDD | Task(s) |
|---|---|
| Modelo de dados (ER) | 2 |
| Auth Sanctum SPA + perfil | 3, 4, 14 |
| Promoções (1 por aluno) | 5, 7 |
| Alunos (múltiplos dias, vencimento) | 6, 7 |
| Cálculo + snapshot + lazy | 8, 9 |
| Visão do mês | 9, 10 |
| Ajustes/aula extra + total | 11, 13 |
| Promoção só no base | 8 (base), 11 (sem desconto nos ajustes) |
| Mensagem editável + placeholders | 3 (`Placeholders`), 12, 14 |
| Link WhatsApp (deep link) | 12, 13 |
| Isolamento por professora | 5, 6, 9, 11 |
| Deploy (Docker/Nginx/mesmo domínio) | 15 |
| Testes (Pest/Vitest/Playwright) | 1, 8, 11, 12, 16 |
| Multi-professor (cadastro/isolamento) | 3, 5, 6, 9, 11 |

Itens do PRD ainda sem decisão (não bloqueiam o plano): hora-aula variável por aluno; feriados/férias automáticos; dispositivo principal (mobile vs desktop); verificação de e-mail (registrada como pendência no TDD).

## Documentação relacionada

Cada task acima deve, ao virar issue/plano de execução, terminar com links reais para: o
[TDD](../tdd/2026-10-05-mensalize-tdd.md) (seções 4–6), o
[PRD](../prd/2026-09-29-mensalize-prd.md) e os ADRs citados no corpo de cada task.
