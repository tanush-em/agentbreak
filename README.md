# AgentBreak

AI-agent red-teaming and security assessment workbench (POC).

Evaluate LLM agent profiles against prompt injection, system-prompt extraction, indirect injection, tool abuse, privilege escalation, data exfiltration, memory poisoning, and MCP attack surfaces — combining real OpenAI-based adversarial tests with deterministic simulated modules and automated risk scoring/reporting.

## Stack

Next.js · React · TypeScript · OpenAI · Prisma · SQLite · Zod · Tailwind · shadcn/ui · Recharts

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The dashboard is populated immediately from seed data (3 agents, historical assessments, findings, reports).

## Demo Mode vs Live AI Tests

| Condition | Mode | Behavior |
|-----------|------|----------|
| No `OPENAI_API_KEY` | **Demo Mode** | App fully works. REAL attack modules use deterministic demo results. |
| `OPENAI_API_KEY` set | **Live AI Tests** | Direct Prompt Injection + System Prompt Extraction call OpenAI. |

Never expose the API key to the browser. Configure:

```env
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Reseed demo data (idempotent wipe + seed) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run lint` | ESLint |

## Demo flow (3–5 min)

1. **Overview** — security posture, KPIs, recent assessments  
2. **Agents → Customer Support Agent** — tools, system prompt, attack surface  
3. **Run Security Assessment** — watch live attack execution  
4. **Open a critical finding** — e.g. indirect prompt injection  
5. **Security Report** — score, success rates, remediations  

## Attack coverage

- **REAL:** Direct Prompt Injection, System Prompt Extraction  
- **SIMULATED:** Indirect Injection, Tool Abuse, Privilege Escalation, Data Exfiltration, Memory Poisoning, MCP Manipulation  
- **Coming soon:** Excessive Agency, Context Poisoning, Cost Amplification, Cross-Agent Attacks, and more (see Attack Library)

## Project structure

```
app/           # Screens + API routes
components/    # UI by domain
lib/security/  # Attack modules, scoring, orchestrator
lib/openai/    # OpenAI client + demo-mode fallback
prisma/        # Schema + seed
```

## Security boundary

AgentBreak only tests user-provided agent profiles with synthetic prompts, documents, and mock tools. It does not target arbitrary external systems.

## License

MIT (portfolio POC)
