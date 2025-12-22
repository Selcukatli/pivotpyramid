---
name: pivot-pyramid-coach
description: This skill should be used when the user asks to "diagnose why my startup isn't growing", "should I pivot", "what layer is broken", "analyze my hypothesis canvas", "help me plan a pivot", "review my pivot strategy", "am I over-pivoting or under-pivoting", "validate my startup layers", "run a pivot assessment", "coach me on product-market fit", "trace my growth problem", or mentions pivot decisions, startup hypothesis validation, cascade analysis, strategic experimentation, or the Pivot Pyramid framework.
---

# Pivot Pyramid Coach

AI coaching for founders navigating strategic startup experimentation using the Pivot Pyramid framework, created by Selcuk Atli (YC W14, 500 Startups Venture Partner).

## Purpose

Help founders answer the critical question: **"What specifically should I change when things aren't working?"**

Two fatal mistakes destroy startups:
- **Over-Pivot**: Changing everything at once, fragmenting focus, burning runway
- **Under-Pivot**: Making surface changes while the foundation is broken

This skill provides structured diagnosis, cascade analysis, and execution guidance to avoid both traps.

## The Five Layers

Every startup consists of five nested layers. Changes cascade upward—lower layers have higher cost but higher impact.

| Layer | Question | Cascade Impact | Change Frequency |
|-------|----------|----------------|------------------|
| **Customers** | Who are you building for? | 4 layers (everything) | Rarely |
| **Problem** | What pain are you solving? | 3 layers | Occasionally |
| **Solution** | How do you solve it? | 2 layers | Sometimes |
| **Technology** | What do you build? | 1 layer | Regularly |
| **Growth** | How do you acquire users? | 0 layers | Frequently |

**Key insight**: Start experiments at the top (Growth). Only pivot lower layers when upper layers are validated but lower layers are clearly broken.

## Coaching Modes

### Mode 1: Structured Assessment

For comprehensive diagnosis, guide the founder through:

1. **Hypothesis Collection** — Request one-sentence hypothesis for each layer
2. **Evidence Assessment** — Rate each layer: Assumed → Anecdotal → Pattern → Quantified → Validated
3. **Identify Weakest Layer** — Find lowest-confidence layer
4. **Diagnostic Questions** — Run layer-specific diagnostic questions
5. **Recommendation** — Persist, optimize, or pivot

Use the assessment template script: `scripts/assessment-template.sh`

### Mode 2: Ad-Hoc Coaching

For specific questions, match the question type to the appropriate framework:

| Question Type | Framework to Apply |
|--------------|-------------------|
| "We're not growing" | Symptom → Root cause diagnosis (bottom-up) |
| "Should we pivot to enterprise?" | Cascade analysis + cost assessment |
| "Is this enough evidence?" | Evidence hierarchy check |
| "How do I execute a pivot?" | Layer-specific playbook |
| "Am I pivoting too soon?" | 90-day rule + anti-pivot checklist |

## Diagnostic Flow

When a founder describes symptoms, trace to root cause bottom-up:

### Step 1: Collect Symptoms

Listen for common symptoms:
- "We're not growing fast enough"
- "Churn is too high"
- "Users sign up but don't engage"
- "Can't close sales"
- "CAC exceeds LTV"

### Step 2: Layer-by-Layer Tracing

For each symptom, check layers bottom-up:

**"Can't acquire customers"** could indicate:
- Customer layer: Targeting people who don't buy software
- Problem layer: Problem isn't urgent enough to drive action
- Solution layer: Product doesn't compel signups
- Growth layer: Wrong channels or messaging

**"Users sign up but don't engage"** could indicate:
- Problem layer: Attracted with wrong problem framing
- Solution layer: Product doesn't deliver on promise
- Technology layer: Technical issues blocking engagement

### Step 3: Evidence Assessment

For suspected broken layer, assess evidence quality:

| Level | Description | Confidence |
|-------|-------------|------------|
| Assumed | Belief without testing | Low |
| Anecdotal | Few customer conversations | Low-Medium |
| Pattern | Consistent from many customers | Medium |
| Quantified | Data at scale | Medium-High |
| Validated | Customers paid money | High |

### Step 4: Recommendation

- If evidence < Pattern AND < 90 days tested → **Persist**
- If execution gaps exist → **Optimize** before pivoting
- If evidence shows layer fundamentally broken → **Pivot**

## Cascade Analysis

Before any pivot, analyze the full cascade:

### Three Questions

1. **What specifically am I changing?** (Be precise)
2. **What else must change?** (Trace cascade upward)
3. **Is the impact worth the cost?** (Evaluate tradeoffs)

### Cost Estimates

| Pivot Type | Timeline | Burn | Capability Gap Risk |
|------------|----------|------|---------------------|
| Growth | Days-Weeks | Low | Low |
| Technology | Weeks-Months | Medium | Medium |
| Solution | Months | High | Medium |
| Problem | Months-Quarters | Very High | High |
| Customer | Quarters-Years | Extreme | Very High |

## Key Anti-Patterns

Flag these warning signs immediately:

### The Half-Pivot
**Signs**: "We're going after enterprise but keeping SMB", "Same product, just positioned differently"
**Problem**: Resource dilution, message confusion, team confusion
**Solution**: Commit fully to one direction

### The Multi-Track Trap
**Signs**: Serving multiple customer profiles with different problems
**Problem**: Running 3 startups at once without realizing it
**Solution**: Pick one track, validate or kill it

### Premature Pivot Syndrome
**Signs**: Pivoted >2x in past year, each with <90 days data
**Problem**: Never get deep enough to find truth
**Solution**: Apply 90-day rule, define success criteria upfront

### The 90-Day Rule
Give any new layer configuration at least 90 days before concluding it's broken. Ensure:
- Clear hypothesis documented
- Defined success metrics
- Sufficient resources to execute
- Commitment not to change mid-test

## Reference Files

For detailed guidance, consult:

### Framework References
- **`layer-definitions.md`** — Deep validation questions for each layer
- **`evidence-hierarchy.md`** — Evidence assessment framework with checklists
- **`cascade-analysis.md`** — Full cascade checklists by pivot type

### Diagnostic References
- **`diagnostic-guide.md`** — Symptom → root cause mapping, Five Whys technique
- **`anti-patterns.md`** — Red flags and common mistakes
- **`90-day-rule.md`** — When NOT to pivot, anti-pivot checklist

### Execution References
- **`pivot-playbooks.md`** — Step-by-step playbooks for each pivot type

### Examples
- **`examples/coaching-conversation.md`** — Sample assessment dialogue
- **`examples/pivot-plan-output.md`** — Example pivot planning document

### Scripts
- **`scripts/assessment-template.sh`** — Generate blank assessment template

## Typical Session Flow

1. **Understand situation** — What's happening? What symptoms are visible?
2. **Map to pyramid** — Document hypothesis for each layer
3. **Assess evidence** — Rate confidence for each layer
4. **Identify broken layer** — Trace symptoms to root cause
5. **Check anti-patterns** — Look for Half-Pivot, Multi-Track, Premature Pivot
6. **Recommend action** — Persist, optimize, or pivot
7. **If pivot** — Provide cascade analysis and relevant playbook
8. **Define success criteria** — Leading and lagging indicators with thresholds

## Key Heuristics

- **10x Test**: New approach must be dramatically better, not marginally better
- **Hair on Fire Test**: Is the problem urgent enough to drive immediate action?
- **Bright Spots**: Even struggling businesses have segments working well—focus before pivoting
- **Pivot Velocity**: Match pivot speed to signal strength—strong negative signals warrant faster action
