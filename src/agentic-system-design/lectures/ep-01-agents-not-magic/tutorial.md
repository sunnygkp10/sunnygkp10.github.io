## The 60-year setup

For 60 years engineers have wanted machines that do real work — not just answer questions, but actually take action in the world. **Eliza** tried in 1966. Expert systems tried in the 1980s. Each generation got closer; each one hit the same wall: *the system can talk, but it can't actually do anything.*

Then ChatGPT changed the conversation. Suddenly we had a system that could understand intent, reason about steps, and produce coherent plans. The next obvious move: give it tools. Let it click buttons, send emails, query databases. We called the result an **agent**.

And the moment we did, every engineer who has ever shipped a distributed system started feeling déjà vu.

## The reframe

Stop treating the LLM as a black box. **Treat it as one unreliable component in a distributed system.**

Google's CTO put it well: *"An LLM is a brain in a jar that knows facts. An agent is that brain with hands and a plan."* The brain alone is interesting. The brain with hands is dangerous — and useful, and worth engineering carefully around.

That's what an agent actually is:

```
Agent = LLM + Tools + Memory + Control loop
```

Take any of those pieces away and you don't have an agent. Add unbounded autonomy with no engineering discipline and you don't have an agent — you have a lawsuit waiting to happen (see *Moffatt v. Air Canada*, 2024, where a court held an airline liable for a refund its chatbot hallucinated).

## Why this matters: the 85% problem

Pick any modern frontier LLM. On a single tool call it's right roughly 85% of the time. Sounds great.

Now stack it across 10 steps:

```
0.85 ^ 10 = 0.197
```

**20% success on a 10-step workflow.** This is industry consensus, and it's the brutal math behind why agents work in dev demos and fall apart in production. A demo is 1–3 steps. A real workflow is 10–50. The gap between "works on the happy path" and "works reliably" is mostly engineering, not modeling.

## Six reframes that practitioners say "clicked"

These are the mental shifts you'll keep returning to throughout this course:

1. **LLM ≠ Agent** — The model is one component. The system around it is the engineering.
2. **Atomic → transactional thinking** — Multi-step actions need undo stacks, idempotent tools, checkpointing.
3. **Autonomy was overpromised, under-engineered** — The gap isn't model capability. It's operational discipline.
4. **Instruction quality = output quality** — Precision in prompts, tool docs, and context replaces fuzzy intuition.
5. **Evaluation is architecture, not validation** — Evals are specs you author *before* the build, not after.
6. **Agents are the new microservices** — Move from monolithic agents to coordinated, specialized ones.

## What this course is

Forty-three lectures across two parts.

**Part 1 — Concepts** (the chapter you're in) teaches the LLM through the engineer's lens — what it gives you as a primitive, what it gets wrong, and the building blocks that turned it into an agent.

**Part 2 — Engineering** builds a real agentic system on AWS end-to-end, with each chapter opening on a problem the previous chapter created. By the final lecture you've shipped *AI Digest* — a production-grade autonomous content pipeline with crawlers, ranking, human approval, and a live chat interface.

The thesis is one sentence: **agents are distributed systems with an unreliable component.** Engineering them is the same job you've always done — observability, evals, retries, idempotency, blast-radius control — applied to a new primitive.

That's what we're going to learn.

## What's next

Lecture 1.2 cracks open the LLM itself. What it actually does, what makes it wrong, and why hallucination, sycophancy, and jailbreak aren't bugs to fix — they're failure modes to design around.
