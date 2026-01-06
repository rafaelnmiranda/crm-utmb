# UTMB CRM

Sistema de CRM personalizado para gestão de patrocinadores, parceiros e expositores de eventos de corrida em trilha.

## Stack Tecnológica

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** com paleta Sunrise Glow
- **Supabase** (PostgreSQL, Auth, Storage)
- **Microsoft Graph API** (Calendar e Email)
- **OpenAI/Anthropic** (Geração de mensagens com IA)
- **shadcn/ui** (Componentes UI)
- **@dnd-kit** (Kanban drag-and-drop)
- **React Query** + **Zustand** (Estado)

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura do Projeto

```
utmb-crm/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── data/             # Arquivos de dados e referência
├── docs/             # Documentação do projeto
├── lib/              # Utilitários e configurações
├── scripts/          # Scripts de desenvolvimento
│   └── sql/          # Scripts SQL de manutenção
├── types/            # TypeScript types
└── supabase/         # Migrations e schemas
```

## Documentação

Veja [`docs/INTEGRACOES.md`](docs/INTEGRACOES.md) para detalhes sobre todas as integrações necessárias.

Outros documentos úteis:
- [`docs/CRIAR_USUARIO_TESTE.md`](docs/CRIAR_USUARIO_TESTE.md) - Como criar usuário de teste
- [`docs/APLICAR_MIGRATIONS.md`](docs/APLICAR_MIGRATIONS.md) - Como aplicar migrations
- [`docs/SCHEMA.md`](docs/SCHEMA.md) - Schema do banco de dados




