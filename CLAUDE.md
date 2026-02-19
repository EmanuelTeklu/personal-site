# emanuelteklu.com

Personal portfolio + productivity command center.

## Stack

- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind v4
- **Backend**: FastAPI + Python (SSE streaming, Anthropic SDK)
- **Auth**: Supabase (JWT)
- **Data**: Supabase + local file reads (PM2, git, tokens)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

## Project Structure

```
src/
  components/     # UI components (layout/, private/, public/, ui/)
  pages/          # Route pages (public + private)
  hooks/          # 11 custom hooks (useAuth, useTasks, useAIChat, etc.)
  lib/            # Utilities (api.ts, constants.ts, supabase.ts)
  types/          # TypeScript interfaces (project.ts, task.ts)
  data/           # Static data (projects, movies, links, stream)
api/
  main.py         # FastAPI entry with CORS
  routers/        # 6 endpoints (agent, health, tokens, overnight, research, signals)
  services/       # agent_runner.py, file_reader.py
  middleware/     # JWT auth verification
ops/
  cc-start.sh     # tmux dev environment (frontend :5180, backend :8000)
  agents/         # System prompts for orchestrator, frontend, backend, aesthetic agents
  aesthetic/      # Campaign management scripts
```

## Conventions

- TypeScript strict mode with path alias `@/*`
- Immutable types (readonly fields on all interfaces)
- Functional components with hooks
- Tailwind for all styling — no inline styles
- Components under 100 lines — split if larger
- TanStack React Query for server state

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Vite preview
```

## Backend

```bash
cd api && source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

## Mistakes to Avoid

- Don't use `any` — always specify types
- Don't inline styles — use Tailwind classes
- Don't skip auth checks on private routes
- Don't commit `.env` or `.env.local`
- Don't use localStorage for tokens — use Supabase session
