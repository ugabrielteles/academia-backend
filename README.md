# Academia Backend

Sistema de gerenciamento de academia - Backend desenvolvido com NestJS + MongoDB + TypeScript.

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.x (local ou Atlas)

## 🚀 Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/ugabrielteles/academia-backend.git
cd academia-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/academia
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

### 4. Inicie o servidor em modo desenvolvimento

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3001`.

## 📡 Endpoints

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/login` | Login com email e senha, retorna JWT | ❌ |

### Students

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/students` | Listar todos os alunos | ✅ admin/staff |
| GET | `/students/:id` | Buscar aluno por ID | ✅ admin/staff |
| POST | `/students` | Criar novo aluno | ✅ admin/staff |
| PUT | `/students/:id` | Atualizar aluno | ✅ admin/staff |
| DELETE | `/students/:id` | Excluir aluno | ✅ admin |

### Plans

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/plans` | Listar todos os planos | ✅ admin/staff |
| POST | `/plans` | Criar novo plano | ✅ admin |
| PUT | `/plans/:id` | Atualizar plano | ✅ admin |
| DELETE | `/plans/:id` | Excluir plano | ✅ admin |

### Workouts

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/workouts` | Listar todos os treinos | ✅ admin/staff |
| GET | `/workouts/student/:studentId` | Treinos de um aluno | ✅ admin/staff |
| POST | `/workouts` | Criar treino | ✅ admin/staff |
| PUT | `/workouts/:id` | Atualizar treino | ✅ admin/staff |
| DELETE | `/workouts/:id` | Excluir treino | ✅ admin/staff |

### Checkin

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/checkin` | Registrar check-in | ✅ admin/staff |
| GET | `/checkin/student/:studentId` | Histórico de check-ins | ✅ admin/staff |

### Turnstile (Catraca)

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/turnstile/authorize` | Autorizar acesso na catraca | ✅ admin/staff |
| GET | `/turnstile/logs` | Listar logs da catraca (paginado) | ✅ admin/staff |

### Finance

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/finance` | Listar todas as cobranças | ✅ admin/staff |
| GET | `/finance/student/:studentId` | Cobranças de um aluno | ✅ admin/staff |
| POST | `/finance` | Criar cobrança | ✅ admin/staff |
| PUT | `/finance/:id` | Atualizar cobrança (ex: marcar como pago) | ✅ admin/staff |

### Billing

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/billing` | Listar todas as billings | ✅ admin/staff |
| POST | `/billing/generate` | Gerar cobrança manual para um aluno | ✅ admin |

## 📁 Estrutura de Pastas

```
src/
  modules/
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      dto/login.dto.ts
      guards/jwt-auth.guard.ts
      guards/roles.guard.ts
      decorators/roles.decorator.ts
      strategies/jwt.strategy.ts
      strategies/local.strategy.ts
    students/
      students.module.ts
      students.controller.ts
      students.service.ts
      students.repository.ts
      dto/create-student.dto.ts
      dto/update-student.dto.ts
      schemas/student.schema.ts
    plans/
      plans.module.ts
      plans.controller.ts
      plans.service.ts
      dto/create-plan.dto.ts
      dto/update-plan.dto.ts
      schemas/plan.schema.ts
    workouts/
      workouts.module.ts
      workouts.controller.ts
      workouts.service.ts
      dto/create-workout.dto.ts
      dto/update-workout.dto.ts
      schemas/workout.schema.ts
    checkin/
      checkin.module.ts
      checkin.controller.ts
      checkin.service.ts
      dto/create-checkin.dto.ts
      schemas/checkin.schema.ts
    turnstile/
      turnstile.module.ts
      turnstile.controller.ts
      turnstile.service.ts
      dto/authorize-turnstile.dto.ts
      schemas/turnstile-log.schema.ts
    finance/
      finance.module.ts
      finance.controller.ts
      finance.service.ts
      dto/create-finance.dto.ts
      dto/update-finance.dto.ts
      schemas/finance.schema.ts
    billing/
      billing.module.ts
      billing.controller.ts
      billing.service.ts
      dto/create-billing.dto.ts
      schemas/billing.schema.ts
  jobs/
    checkin-reset.job.ts
    billing-generate.job.ts
    billing-notify.job.ts
  app.module.ts
  main.ts
```

## ⚙️ Jobs Automáticos

| Job | Cron | Descrição |
|-----|------|-----------|
| `CheckinResetJob` | `0 0 * * 1` | Segunda-feira 00:00 — Log de início da nova semana ISO |
| `BillingGenerateJob` | `0 8 1 * *` | Dia 1 de cada mês às 08:00 — Gera Finance para alunos ativos |
| `BillingNotifyJob` | `0 9 * * *` | Diariamente às 09:00 — Marca cobranças vencidas como overdue e bloqueia alunos |

## 🔐 Autenticação

A API usa JWT (JSON Web Token). Para acessar os endpoints protegidos:

1. Faça login em `POST /auth/login` com `email` e `password`
2. Use o `access_token` retornado no header `Authorization: Bearer <token>`

### Roles

- `admin` — acesso total
- `staff` — acesso de operação (sem operações destrutivas)

## 🛠️ Tecnologias Utilizadas

- **[NestJS](https://nestjs.com/)** — Framework Node.js progressivo
- **[MongoDB](https://www.mongodb.com/)** — Banco de dados NoSQL
- **[Mongoose](https://mongoosejs.com/)** — ODM para MongoDB
- **[Passport.js](http://www.passportjs.org/)** — Autenticação com JWT e Local Strategy
- **[class-validator](https://github.com/typestack/class-validator)** — Validação de DTOs
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** — Hash de senhas
- **[@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)** — Cron jobs
- **TypeScript** — Tipagem estática

## 🏗️ Scripts

```bash
npm run start        # Inicia a aplicação
npm run start:dev    # Inicia em modo desenvolvimento (watch)
npm run build        # Compila o TypeScript
npm run start:prod   # Inicia a versão compilada
```