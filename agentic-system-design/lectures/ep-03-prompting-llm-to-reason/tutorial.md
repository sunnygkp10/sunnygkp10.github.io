## A note before you watch

Honestly, the thing that surprised me about Chain of Thought wasn't the trick. The trick is famous — *"Let's think step by step,"* one sentence, accuracy doubles, you've probably seen it.

The thing that surprised me is how easy it is to use it badly.

The cost ladder for "make the model think harder" goes roughly: 1× for a direct answer, 6× for a CoT prompt, 60× for a reasoning model like o3 or Claude with extended thinking. That's not a typo. **Sixty.** Most teams I've seen pick one of those tiers and apply it to their entire agent — every step, every call, the same expensive hammer for problems that didn't need any reasoning at all.

The reframe that took me longest to get: **reasoning is a per-step decision, not a per-agent one.**

An agent isn't one model call. It's a loop with a planner, a tool-formatter, a critic, a summarizer — six different jobs, six different reasoning needs. The planner probably benefits from CoT. The tool-formatter just needs valid JSON. The summarizer wants concise output, not a thinking tape. Turn CoT on for all of them and your bill explodes for no reason. Reserve the 60× reasoning model for the one step that genuinely needs it.

That's the whole engineering frame. Most of "production agents are too expensive" is actually "production agents reasoned on the wrong steps."

The video walks through:
- Why the trick works (three intuitions, no math)
- The 2022 Wei et al. paper — the original result, on screen
- Prompted CoT vs reasoning models — when to reach for which
- A clean rule for skipping CoT when it's just theatre
- The per-step discipline, applied to a real multi-step agent

If you came here for "should I add *let's think step by step* to my prompt" — yes, sometimes, and the video tells you when. If you came here for "how do I stop my reasoning model from costing me a runway" — that's the per-step discipline, also in the video.

Watch it. Then go look at your agent and ask which step actually needs to think.

---

→ [Watch on YouTube](https://youtu.be/rSTARr2JoSA)
