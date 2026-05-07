## The LLM as engineering primitive

If you're going to build systems on top of an LLM, you need a working mental model of what it actually is. Not a research paper's worth of detail — *just enough to predict where it'll break.*

Here's the engineer's version.

### What it is

An LLM is a function that takes a sequence of tokens and produces a probability distribution over the next token. Run that loop, sample from each distribution, and you get coherent text.

Treated as an API, what it gives you:

- **Instruction following** — you tell it what to do in natural language, it tries to do it
- **In-context learning (ICL)** — show it examples in the prompt, it generalizes the pattern. No training, no fine-tuning
- **Coherent generation** — output stays on topic and reads like a person wrote it
- **Cross-task generalization** — the same model summarizes, classifies, and codes without specialized training

That's the gift. It's enormous. It's also misleading.

## What it gets wrong (and why)

Three failure modes you'll see in production. **None of them are bugs. All of them are predictable.**

### Hallucination

The LLM produces fluent, confident-sounding text that is factually wrong. Not occasionally — *routinely*.

**Why it happens:** the model is trained to predict plausible next tokens. "Plausible" and "true" are correlated in training data, but they're not the same thing. The model has no notion of *truth* — only of *likelihood under the training distribution*.

**Engineering response:** don't ask the model facts it can't verify. Plug it into knowledge sources (RAG — Lecture 1.4). Verify outputs against ground truth. Use evals to catch drift.

### Sycophancy

Ask the model "is my idea good?" and it'll usually say yes. Ask "is my idea bad?" and it'll usually say yes to that too.

**Why it happens:** RLHF training rewards responses humans rate highly. Humans rate agreement higher. The model learns to agree.

**Engineering response:** never ask the model for self-evaluation in a way that incentivizes flattery. Use external graders. Reframe questions to be neutral ("evaluate against criteria X, Y, Z" — not "is this good?").

### Jailbreak

Despite safety training, the model can be tricked into producing content it was told not to produce — via roleplay, encoding, prompt injection, or persistent rephrasing.

**Why it happens:** safety is a *behavioral pattern* learned in fine-tuning, not an architectural guarantee. Patterns can be circumvented.

**Engineering response:** don't trust the model to enforce safety. Build safety at the system boundary — input filtering, output sanitization, scope limits on what tools the model is allowed to call. (We dedicate **Chapter 7** to this.)

## Tokens

The model doesn't see characters. It sees **tokens** — chunks of text that range from a single character (`a`) to whole common words (`the`) to fragments (`ing`).

Why care?

- **Context window is measured in tokens, not words.** A 200K-token window holds roughly 150K English words but only ~80K tokens of dense Chinese, Hindi, or code
- **Cost is per token.** Predict your bill by predicting your token volume
- **Multilingual workloads cost more.** Same content in English vs. Hindi can have a 2–3× token ratio

Run text through OpenAI's tokenizer or `tiktoken` to see your real token counts. *Don't estimate from word count.*

## Sampling

When the model outputs a token, you choose which one to sample. Two knobs matter:

- **Temperature** (0.0–2.0) — higher = more random
  - `0.0` picks the most likely token every time (deterministic)
  - `1.0` samples by probability (creative)
  - `>1.0` distorts toward unlikely tokens
- **Top-p** (0.0–1.0) — sample from the smallest set of tokens whose cumulative probability is at least *p*. Cuts off the long tail of unlikely options.

Defaults you'll see in practice:

| Use case | Temp | Top-p |
|---|---|---|
| Code generation | 0.0–0.3 | 0.9 |
| Creative writing | 0.7–1.0 | 0.95 |
| Tool calling / structured output | 0.0 | 1.0 |

## RLHF — why models follow your instructions

Modern LLMs aren't just trained on raw text. They go through **Reinforcement Learning from Human Feedback (RLHF)** — a stage where humans rate model outputs and the model is fine-tuned to maximize those ratings.

You don't need to implement RLHF. You need to know it exists because:

1. **It's why instruction-following works.** Without RLHF, the model just continues text. With RLHF, it actually *answers questions*.
2. **It's why sycophancy happens.** Human raters reward agreement. The model learned that.
3. **It's why "safety" is fragile.** Safety is patterns learned in RLHF, not architectural guarantees. Patterns can be circumvented.

## The mental model to leave with

The LLM is a powerful, fluent, confident text generator with **no internal model of truth.** It's wrong in patterned ways, and those patterns are predictable from how it was trained.

Build around it like you'd build around any unreliable component:

- Don't trust it on facts it can't verify
- Don't ask it to grade itself
- Don't put it on the trust boundary
- *Do* measure what it does in production

## What's next

Lecture 1.3 — how to make the LLM **think harder** before answering. Chain-of-thought, reasoning models, when the extra cost is worth it, and when it isn't.
