# Sift — Open Questions & Deferred Decisions

## Pricing screen: should we collect the current product price during Setup?

**Context:** The Gabor-Granger pricing screen currently uses a hardcoded price ladder ($5–$40/mo). In practice, the right price range depends on what a customer already pays.

**Why it matters:**
- The price ladder should be calibrated relative to the existing plan price — asking about $40/mo add-ons for a $10/mo product produces bad data
- Anchor effects mean respondents relativize add-on prices against what they already pay
- "Would you pay $20 extra on top of your current $X/month plan?" is a more realistic question than an unanchored one

**Options to consider:**
1. Add an optional "current plan price" field to the Setup screen — auto-scale the ladder as a % of that price (e.g. 10%, 20%, 30%, 50%)
2. Let the PM set the price ladder range manually (min/max) in Setup
3. Keep GG as-is but add a Van Westendorp option for products without an established price
4. Replace GG entirely with conjoint/discrete choice for existing-priced products

**Leaning toward:** Option 1 (optional field, smart defaults) — low friction, covers most cases.

**Status:** Deferred — leave prototype as-is for now, revisit before v1 spec.

---

## Reading list

### Customer discovery & validation
- **The Mom Test** — Rob Fitzpatrick. How to ask questions that get honest answers instead of polite ones. Core rule: ask about past behavior, not future intentions. Essential before doing any discovery interviews.

### Building a SaaS business
- **Zero to Sold** — Arvid Kahl. Bootstrapped SaaS from zero to acquisition, written by someone who did it. Unusually practical and honest about the hard parts.
- **The SaaS Playbook** — Rob Walling. Tactical playbook for bootstrapped SaaS founders. Good on pricing, positioning, and when to hire.

### Positioning & messaging
- **Obviously Awesome** — April Dunford. How to position a product so the right people immediately understand why it matters. Directly relevant to figuring out how to talk about Sift to PMs vs. researchers.

### Understanding the customer (PMs)
- **Inspired** — Marty Cagan. The definitive book on how product teams work. Valuable for understanding the world your buyer lives in — how roadmap decisions get made, what PMs are measured on, where research fits.

### Discovery interview technique
- **Demand-Side Sales 101** — Bob Moesta. Jobs to Be Done applied to sales and customer interviews. Teaches you to find the "struggling moment" that makes someone actually switch to a new tool — useful for structuring discovery conversations.

### Bridging research and product
- **Continuous Discovery Habits** — Teresa Torres. Written specifically for product teams who want to talk to customers regularly. Bridges UX research discipline with product decision-making. Very aligned with your background and the problem Sift is solving.
