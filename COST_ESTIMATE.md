# 💰 AI Cost Estimate – 100 Inputs Demo

Rough cost for **100 user messages** in your Store Pilot demo, using OpenAI’s **Standard** pricing (as of platform docs).

---

## Your app’s usage pattern

- **1 user message** often triggers **2 API calls** (initial reply + one follow-up after a function call).
- Sometimes **3 calls** when the AI chains two functions (e.g. `searchProducts` then `addToCart`).
- Each call sends: **system prompt** (~600 tokens) + **function definitions** (~1,500 tokens) + **conversation history** (grows with each message) + **user message** (~20–50 tokens).
- **Max output** per call is 1,000 tokens (your `max_tokens` setting).

So token use **per user message** is in the range below (including history growth over 100 messages).

---

## Assumptions for “100 inputs”

| Scenario | Input tokens (total) | Output tokens (total) |
|----------|----------------------|------------------------|
| **Light** (short replies, few function calls) | ~300k | ~25k |
| **Typical** (mix of search, add to cart, haggle) | ~500k | ~35k |
| **Heavy** (long chat, many function chains) | ~800k | ~50k |

---

## Price per 1M tokens (Standard)

| Model | Input | Output |
|--------|--------|--------|
| **gpt-4o** (default in your app) | $2.50 | $10.00 |
| **gpt-4o-mini** | $0.15 | $0.60 |

*Source: [OpenAI API Pricing](https://platform.openai.com/docs/pricing) – Text tokens, Standard.*

---

## Estimated cost for 100 inputs

| Model | Light | Typical | Heavy |
|--------|--------|---------|--------|
| **gpt-4o** | **~$1.25** | **~$2.00** | **~$2.50** |
| **gpt-4o-mini** | **~$0.07** | **~$0.11** | **~$0.15** |

So for a **typical 100-message demo**:

- **gpt-4o:** about **$2**
- **gpt-4o-mini:** about **$0.10**

---

## Summary

- **100 inputs with gpt-4o (default):** usually **about $1.25–2.50**, often around **$2**.
- **100 inputs with gpt-4o-mini:** usually **about $0.07–0.15**, often around **$0.10**.

To use the cheaper model for testing, set in `.env.local`:

```bash
OPENAI_MODEL=gpt-4o-mini
```

Pricing can change; check [OpenAI Pricing](https://platform.openai.com/docs/pricing) for current rates.
