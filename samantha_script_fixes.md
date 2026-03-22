# Samantha Outbound Script — Recommended Fixes
## Review before pushing to Retell LLM

---

## Fix 1: Tighten the Opening (HIGH PRIORITY)

**Current:**
"Hey {{first_name}}, my name is Samantha and I work with growing companies in the {{service_type}} industry here in {{google_address}}. I know you're busy and I'm not gonna take up much of your time. I love saving businesses tens of thousands of dollars a year with a simple but incredibly effective service. I've got just one question, and then you can tell me if it's worth talking. Sound fair?"

**Problem:** 4 sentences before they get a word in. Contractors on job sites hang up fast.

**Recommended:**
"Hey {{first_name}}, this is Samantha — I work with {{service_type}} businesses in {{google_address}}. Super quick: can I ask you one question about missed calls? Takes 30 seconds."

[Wait for response]

**Why:** Gets to the value prop in under 10 seconds. Respects their time immediately.

---

## Fix 2: Move the Reveal Earlier (MEDIUM PRIORITY)

**Current position:** After opening → question → math → picture → stat → THEN reveal.

**Problem:** Most contractors won't stay through 5 stages on a cold call. The reveal is your strongest hook — it's wasted at the end.

**Recommended position:** Move reveal to immediately after The Math:

> "Here's the crazy part — [stat]. And here's what I want to tell you: you've been talking to an AI this whole time. That's exactly what I'm offering you. I'm not selling software — I am the product. Want to throw a curveball at me? Try to stump me."

**Why:** The "I am the product" moment creates immediate curiosity and re-engagement. They stop thinking about hanging up and start testing you.

---

## Fix 3: Fix the Cal.com Tool Reference (CRITICAL)

**Current in script:** Books to Event ID `3762379` (30-min discovery call)

**Problem:** This event does NOT exist in your cal.com account. Samantha will fail to book.

**Fix:** Update `book_discovery_call` tool to use:
- Event ID: `5115304`
- Slug: `ai-setup`
- URL: `https://cal.com/matthew-martelli/ai-setup`
- Duration: 15 minutes

---

## Fix 4: Add a Weekend/Gatekeeper Handler

**Gap exposed by Caloosa Cooling call:** Samantha reached Edward (not Kenn), handled it well, but had no explicit logic for "owner unavailable, here's the window."

**Add to script:**
```
If a gatekeeper says the owner is unavailable:
- Ask for owner's name (if not already known)
- Ask for best callback window: "Is there a day/time this week that's best to catch [owner]?"
- Confirm: "Got it — I'll reach back out [day/time]. What's the best number to call?"
- Do NOT push for an immediate transfer or leave a pitch with the gatekeeper
```

---

## Fix 5: Voicemail Should Include Demo Number

**Current voicemail:**
"Hey {{first_name}}, this is Samantha with Growth Mindset AI. I work with {{service_type}} companies in {{google_address}} and I had a quick question for you. Most businesses your size are losing thirty, forty thousand a year just on missed calls... Give me a call back when you get a chance."

**Missing:** A specific number to call back AND a way to experience the product without calling back.

**Recommended addition at end:**
"...Give me a call back at 239-241-7194, or if you want to hear what this sounds like for your business, call 239-259-9975 — that's our demo line, available anytime. Talk soon."

**Why:** The demo number is the secret weapon. A curious contractor who won't call back a sales rep WILL call a demo line at 10pm.

---

## Fix 6: The Math Should Use Their Google Rating

**Current:** Uses generic default numbers.

**Opportunity:** You have `{{google_rating}}` and `{{review_count}}` in scope. Use them:

> "You've got a {{google_rating}}-star rating from {{review_count}} reviews — that's real credibility. But the people who called after hours and got voicemail? They never left a review. They left for your competitor."

This makes the math feel personal, not generic.

---

## Summary of Changes

| Fix | Priority | Where to make it |
|---|---|---|
| Tighten opening | HIGH | Retell LLM prompt |
| Move reveal earlier | MEDIUM | Retell LLM prompt |
| Fix cal.com event ID | CRITICAL | Retell tool config |
| Add gatekeeper handler | MEDIUM | Retell LLM prompt |
| Voicemail + demo number | HIGH | Retell LLM prompt |
| Use google_rating in math | LOW | Retell LLM prompt |

---

## Test Protocol Before Next Batch

1. Matt calls 239-259-9975 posing as a Naples roofer — full scenario test
2. Verify cal.com booking completes end-to-end
3. Matt's cell receives one test outbound call with his own vars
4. Matt says "go" → batch fires
