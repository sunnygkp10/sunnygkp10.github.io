## The 2022 result that sounds like a joke

In 2022, a Google researcher took a math word problem, fed it to a state-of-the-art LLM, and got the wrong answer. Then they added a single instruction to the prompt — *"Let's think step by step."* — and the same model, on the same problem, returned the **right** answer. Accuracy on a benchmark called GSM8K jumped from **17.7% → 56.9%**. Same model. Same prompt. One sentence added.

That paper — **Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (NeurIPS 2022)** — is why modern agents can reason at all.

It's also why your bill can run **60× higher** than it needs to.

This lecture is about both halves of that.

## Why it works

Three reasons, none of them mysterious:

1. **More tokens = more compute.** The model thinks *with* tokens. When it writes "Step 1, Step 2, Step 3," it gets more passes through the network per piece of the problem. More passes → more chances to be right.
2. **It commits to intermediate steps.** Once the model writes `5 + 6 = 11`, it can't suddenly decide the final answer is 27 — the text already narrows where it can go. The model literally constrains itself.
3. **Same reason "show your work" works for humans.** Write each step → catch your own mistakes. Skip to the answer → wrong more often.

If a step in your agent benefits from "writing it down," CoT will help. If it doesn't, CoT is theatre.

## Two ways to get "thinking"

Since 2022, the field split this trick into two distinct mechanisms. They look similar from the outside; they differ a lot in cost.

### → Prompted Chain-of-Thought (the classic)

You add `"Let's think step by step"` to your prompt. **Any model works.** The reasoning is **visible** — you can read it, eval it, trim it, redirect it. It's also free of vendor lock-in: the same prompt produces similar gains across GPT-4, Claude, Gemini, Llama, etc.

### → Reasoning models (built-in)

A new class of model — **o1, o3, DeepSeek R1, Claude with extended thinking** — does Chain of Thought *internally* before giving you the answer. You never see the steps; you just see the final response. **Better on hard problems** (o3 hit **96.7%** on AIME 2024 high-school olympiad math, up from o1's 74.3%). Significantly more expensive. The reasoning is **hidden** or summarized.

> The trade-off in one line: prompted CoT is the universal trick that any model can do. Reasoning models are the maxed-out version that's worth the price *only when the problem genuinely needs it.*

## When to reach for CoT

| Use it when… | Skip it when… |
|---|---|
| Multi-step math or logic | Simple factual lookup ("capital of France?") |
| Planning an action ("what should I do first?") | Classification or labeling ("is this spam?") |
| Debugging — trace through code | Format conversion (JSON → Markdown) |
| Complex instructions with multiple constraints | One-shot transformations |
| Anything where "writing out the steps" would help a *person* | High-volume calls where latency matters |

The rule: **if a careful person would write notes, give the model permission to write notes.**

## What thinking actually costs

Here are the numbers most tutorials skip:

| Approach | Output tokens | Relative cost |
|---|---|---|
| Direct answer | ~50 | 1× |
| CoT prompt | ~300 | **~6×** |
| Reasoning model | ~3000 (internal + visible) | **~60×** |

For an agent making **1,000 calls a day**, that's the difference between **$1** and **$60** of LLM spend. Per day. For agents that scale to millions of calls, the gap can be a runway-ending decision. Choose the right tool for the right step — *don't let the whole agent pay the reasoning tax.*

## The discipline: per-step, not per-agent

This is the part that turns the trick into engineering.

An agent isn't one LLM call. It's a loop that may call the model 5–50 times for one user request — once for the planner, once for each tool-call decision, once to format the tool input, once to interpret the output, once to summarize, once to critique. That's *six different model calls.* They don't all benefit equally from reasoning.

Walk through them:

- **The planner step** — *probably use CoT.* Deciding what to do next benefits from showing the work.
- **The tool-call formatting step** — *skip it.* You just need valid JSON. The model doesn't need to reason about quotes.
- **The critic / review step** — *use it.* Catching your own mistakes is exactly what CoT is good for.
- **The summary step** — *skip it.* You want concise output, not a thinking tape.

Pick reasoning **per step, not per agent.** Most teams turn on CoT for the whole agent, watch their bill explode, and call reasoning "too expensive." It isn't. They just billed it on the steps that didn't need it.

When we build *AI Digest* in Part 2 of this course, every one of these choices appears explicitly in the CDK config and the cost dashboard. Per-step model selection is one of the largest cost levers in any production agent.

## The mental model to leave with

Chain of Thought is the engineering trick that turned LLMs from confident pattern-matchers into something that can actually reason through multi-step problems. **It works. It's also not free.** The discipline isn't "use it" or "don't use it" — it's "use it on the steps that need it; skip it on the steps that don't."

Reasoning models are the natural next step: same trick, internalized, more expensive, better on hard problems. Use them when the problem actually warrants the cost.

The whole reframe: **your agent has many steps. Reasoning is a per-step decision.** Get this right and your agent gets smarter for cheap. Get it wrong and you're paying for thinking that doesn't help.

## What's next

Lecture 1.4 — **Giving the LLM Knowledge**. Chain of Thought helps the model reason through what it *already knows*. It can't manufacture facts it was never trained on. Ask it about yesterday's news — no amount of "think step by step" will help. So how do you give the model knowledge it doesn't have? That's where retrieval-augmented generation comes in.
