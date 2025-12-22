# Diagnostic Guide: Tracing Symptoms to Root Causes

Systematic framework for diagnosing which layer is broken when things aren't working.

---

## Core Principle

Symptoms are visible; root causes are hidden in the pyramid layers. The same symptom can arise from different broken layers—diagnosis requires investigation.

**Critical insight**: Start diagnosis from the bottom of the pyramid. A broken foundation makes higher fixes irrelevant.

---

## Symptom-to-Layer Mapping

### "We can't get users to sign up"

**Check layers bottom-up:**

1. **Customer Layer Check**
   - Are we reaching people who actually buy solutions like ours?
   - Do they have budget authority?
   - Have they bought similar products before?
   - Are we reaching decision-makers or users without buying power?

2. **Problem Layer Check**
   - Is the problem urgent enough to drive action?
   - When we describe the problem, do prospects lean in or tune out?
   - Are they actively searching for solutions?
   - Would they be willing to pay for a solution?

3. **Solution Layer Check**
   - Does our solution resonate?
   - Do prospects understand our value proposition quickly?
   - Do they see us as meaningfully better than alternatives?
   - Is there friction in our signup or trial process?

4. **Growth Layer Check**
   - Are we reaching prospects effectively?
   - Are we in the channels where customers spend time?
   - Is our messaging aligned with how customers describe the problem?
   - Is our targeting accurate?

---

### "Users sign up but don't engage"

**Check layers bottom-up:**

1. **Problem Layer Check**
   - Did we attract them with the right problem?
   - Did our marketing promise something our product delivers?
   - Is the problem they signed up for actually urgent for them?
   - Are they the right customers, or did we attract wrong segment?

2. **Solution Layer Check**
   - Does our product deliver on the promise?
   - Can users get to value quickly (time-to-value)?
   - Is the product intuitive or confusing?
   - Does using the product actually solve the problem?

3. **Technology Layer Check**
   - Are technical issues blocking engagement?
   - Is the product reliable and fast?
   - Are there bugs or friction points?
   - Does the product work across devices/contexts?

---

### "We're growing but not making money"

**Check layers bottom-up:**

1. **Customer Layer Check**
   - Are we targeting customers who can pay?
   - Is this segment willing and able to pay our price?
   - Are we attracting freeloaders who will never convert?
   - Is there a budget for this type of solution?

2. **Problem Layer Check**
   - Is the problem valuable enough?
   - How much is this problem costing our customers?
   - Are they willing to pay to solve it, or only use free alternatives?
   - Are we solving a "nice to have" vs. "must have"?

3. **Solution Layer Check**
   - Does our solution justify the price?
   - Is the value we deliver clearly worth what we charge?
   - Are customers getting enough value to retain?
   - Are there free alternatives that are "good enough"?

---

### "We can't retain users"

**Check layers bottom-up:**

1. **Problem Layer Check**
   - Is this a recurring problem?
   - Is the problem a one-time event or ongoing need?
   - Do customers need us continuously or just occasionally?
   - Did we solve the problem so well they don't need us anymore?

2. **Solution Layer Check**
   - Does our product continue to deliver value?
   - Is there ongoing value after the initial use?
   - Are we helping customers achieve their goals repeatedly?
   - Does the product get better with use or stale?

3. **Technology Layer Check**
   - Is product quality driving churn?
   - Are bugs or performance issues frustrating users?
   - Does the product reliably work when needed?
   - Are we shipping improvements or stagnating?

4. **Growth Layer Check**
   - Did we attract the wrong users?
   - Are churning users our ideal customers or wrong segment?
   - Did marketing promises misalign with product reality?
   - Are we measuring the right cohorts?

---

### "Sales cycles are too long"

**Check layers bottom-up:**

1. **Customer Layer Check**
   - Are we targeting the right decision-makers?
   - Do they have budget authority?
   - Is their buying process naturally long (enterprise) or are we in wrong segment?

2. **Problem Layer Check**
   - Is the problem urgent enough to drive fast action?
   - Is this a "hair on fire" problem or "nice to fix someday"?
   - Are there competing priorities that push this down?

3. **Solution Layer Check**
   - Is our solution differentiated enough to justify quick action?
   - Do prospects need extensive evaluation because we're not clearly better?
   - Is the value proposition crystal clear?

---

## The "Five Whys" Technique

For any issue, ask "why" five times to find the root cause:

**Example:**

*"Users aren't engaging with our product."*

1. Why? → They sign up but don't complete onboarding.
2. Why? → The onboarding asks for too much information upfront.
3. Why? → We need that information to personalize the experience.
4. Why? → We assumed personalization was required for value.
5. Why? → We never tested if users could get value without personalization.

**Root cause**: Our assumption about the solution (personalization required) creates friction that prevents users from discovering value.

**Diagnosis**: This is a **Solution layer** issue, not a Growth layer issue.

---

## Diagnostic Interview Framework

### Who to Interview

- **Recently churned customers**: Why did they leave?
- **Users who never activated**: What happened?
- **Active power users**: Why do they stay? What almost made them leave?
- **Prospects who chose competitor**: Why?
- **Prospects who chose nothing**: Why not urgent?

### Core Questions by Layer

**Customer Layer Questions:**
- "Tell me about your role and your company."
- "How do you typically discover and evaluate new tools?"
- "Who else is involved in buying decisions like this?"
- "What's your typical budget for tools like this?"

**Problem Layer Questions:**
- "Walk me through the last time you experienced [problem]."
- "How often does this problem come up?"
- "What does it cost you when this problem occurs?"
- "What have you tried before to solve this problem?"
- "How important is solving this relative to other priorities?"

**Solution Layer Questions:**
- "When you first saw our product, what did you expect it to do?"
- "Did it meet that expectation? Where did it fall short?"
- "What would make this product indispensable to you?"
- "Compared to alternatives, what do we do better? Worse?"
- "If our product disappeared tomorrow, how would you feel?"

**Technology/Execution Questions:**
- "Did you encounter any frustrations using the product?"
- "Were there times when the product didn't work as expected?"
- "How would you describe the product's reliability and speed?"

**Growth/Discovery Questions:**
- "How did you first hear about us?"
- "What made you decide to try us?"
- "What almost stopped you from signing up?"

---

## The 20-Interview Rule

Before concluding which layer is broken, complete at least 20 diagnostic interviews. This is the minimum sample to distinguish signal from noise.

**Distribution suggestion:**
- 5 churned customers
- 5 users who never activated
- 5 active customers
- 5 prospects (including some who chose competitors)

**What to look for:**
- **Patterns**: Do you hear the same issues repeatedly?
- **Intensity**: When people mention problems, how emotional are they?
- **Specificity**: Can people describe the problem in detail, or is it vague?
- **Root cause**: When you ask "why" repeatedly, where do you end up?

After 20 interviews, you should confidently point to one or two layers as primary issues.

---

## Diagnostic Scorecard

Use this scorecard to systematically score each layer:

| Layer | Health Signals | Warning Signs | Score (1-5) |
|-------|---------------|---------------|-------------|
| **Customers** | Can identify 100+ prospects by name; have budget; bought similar | Struggle to find prospects; no budget; never bought software | ___ |
| **Problem** | Describe problem unprompted; top-5 priority; spending on alternatives | Only mention when prompted; low priority; free workarounds | ___ |
| **Solution** | Say "10x better"; "very disappointed" without it; recommend to others | "Nice to have"; wouldn't miss it; don't recommend | ___ |
| **Technology** | Reliable, fast, scalable; team can maintain; enables solution | Buggy, slow, doesn't scale; team struggles; constrains solution | ___ |
| **Growth** | Positive CAC:LTV; scalable channels; healthy retention | CAC > LTV; no scalable channels; high churn | ___ |

**Scoring Guide:**
- **5**: Strong evidence of health
- **4**: Mostly healthy with minor concerns
- **3**: Mixed signals, unclear
- **2**: Significant concerns
- **1**: Clearly broken

**Interpretation:**
- Lowest-scoring layer is likely biggest problem
- Fix from bottom up—broken foundation makes higher layers irrelevant
- If multiple layers score low, focus on lowest one first

---

## Case Study Examples

### Misdiagnosis: Thought Growth, Was Customer

**Symptom**: "We can't acquire customers. CAC is too high."

**Initial diagnosis**: Growth layer—optimize channels and messaging.

**What they tried**: New landing pages, different ad creative, hired growth marketer, tested new channels.

**Result**: CAC improved marginally, but overall acquisition stayed slow.

**Actual diagnosis**: Customer layer—targeting startups who don't have budget for premium tools.

**Correct pivot**: Change target customer from "all startups" to specific segment with budget and urgency.

---

### Misdiagnosis: Thought Solution, Was Problem

**Symptom**: "Users sign up but don't engage."

**Initial diagnosis**: Solution layer—onboarding is confusing, need to simplify.

**What they tried**: Redesigned onboarding three times, added tooltips, created video tutorials.

**Result**: Modest improvement in activation but still low engagement.

**Actual diagnosis**: Problem layer—the problem being solved wasn't urgent enough. "Nice-to-have" not "must-have."

**Correct pivot**: Reframe from broad "nice-to-have" problem to specific "must-have" problem with immediate urgency.
