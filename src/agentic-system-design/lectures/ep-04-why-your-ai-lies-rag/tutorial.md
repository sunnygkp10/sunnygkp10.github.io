## A note before you watch

Honestly, the thing that surprised me about RAG isn't the pattern. The pattern is famous — chunk the docs, embed, find the nearest, paste into the prompt. You've probably seen the napkin diagram a hundred times.

The thing that surprised me is how easy it is to ship a RAG system that lies *more* than the LLM did before you added it.

You retrieve the wrong chunks → the model hallucinates from them, with citations. You over-stuff the context window → accuracy drops AND your bill goes up. You forget to update the index → your agent confidently quotes a policy that was replaced three months ago.

The fix isn't more clever retrieval. It's discipline.

Treat the vector store as a system of record — not a side car. Back it up. Version it. Eval the retrieval quality the same way you'd eval the model. Watch what goes *into* retrieval as carefully as what comes out — prompt injection loves scraped content. And on the engineering side: per-tool-call retrieval, not one shot at the start of the conversation.

The video walks through:
- Why your AI lies — the structural reason, not "it's a probability distribution"
- Air Canada paying $812 because their chatbot invented a refund policy (Moffatt v. Air Canada, Feb 2024)
- The three jobs: chunk + embed → find top-K → inject as context
- The five ways RAG actually breaks in production
- Why "just throw everything in the context window" is the most expensive mistake in agentic AI

If you came here for "how do I add citations to my LLM" — yes, RAG, and the video shows you the clean way. If you came here for "why does my chatbot keep making things up" — same thing, different angle.

Watch it. Then go look at your agent and ask: what would actually happen if I tested how its retrieval works against ground truth?

---

→ [Watch on YouTube](https://youtu.be/51ma74uS_Ow)
