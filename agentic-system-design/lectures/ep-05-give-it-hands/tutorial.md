## A note before you watch

There's a moment most AI tutorials skip. The model emits a "tool call." Your runtime executes it. The result goes back. Everyone nods at the diagram. Nobody ever opens DevTools.

I opened DevTools.

If you've used ChatGPT, you've watched it browse the web. Run Python. Generate an image. You've watched tokens type themselves out — letter by letter — like the model is *speaking*. None of that is the model. The model itself can't reach the internet, can't run code, can't even check the weather. Every one of those abilities is plumbing wrapped around it. This episode is the plumbing.

The headline is **function calling** — the protocol every major LLM API uses to make tools work. A typed function. A name. A description. Typed arguments. The model emits a structured "please call this," your runtime obeys, the result feeds back in. Five steps, one diagram, deceptively simple.

The hard part isn't the protocol. It's the discipline you wrap around it. Hallucinated arguments. Wrong tool picked. Agents that loop 47 times because nobody told them when to stop. Tool docstrings written like a hurried Slack message — and then surprise that the model picks the wrong one.

The video walks through:
- What a tool actually is — a typed function the model can ask to call (and what's *under* "ask")
- The round-trip diagram with a boundary drawn at the right place: **your machine** on one side, **the LLM** on the other
- Five prompt-engineering rules the model actually listens to (system prompt, format spec, examples, tool docstrings, stopping rules)
- The four ways tool calls break in production — with the engineering answer for each
- Why a toolkit of tools is *still not an agent* — and the one missing piece

Then the postmortem. I open DevTools on ChatGPT itself and we reverse-engineer the live network traffic. The same round-trip you just learned, firing on the wire as SSE events. Browser → server → model. Tools running on the server, not in the model. Three protocols stacked: HTTP carrying SSE carrying JSON-Patch deltas. Theory, made physical.

If you've been thinking "I roughly know how tool-calling works, but I've never seen it" — that's exactly what this episode is for.

---

→ [Watch on YouTube](https://youtu.be/5IE_FXHOYrU)
