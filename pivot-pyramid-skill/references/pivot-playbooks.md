# Pivot Playbooks

Step-by-step execution guides for each pivot type.

---

## Customer Pivot Playbook

**When to use**: Evidence shows you're targeting customers who can't support a viable business (no budget, don't buy software, can't reach decision-makers).

**Blast radius**: 4 layers (everything changes)

### Step 1: Identify New Customer

Be specific. Not "enterprise" but "engineering teams at companies with 100+ employees."

**Specificity test**:
- Can you name 20 specific companies/individuals in this segment?
- Can you find them in a week?
- Can you get 5 to talk to you?
- Can you get 3 to confirm they have the problem?
- Can you get 1 to say they'd pay?

### Step 2: Validate Existence

**The 20-5-3-1 test**:
- Find 20 potential customers in one week
- Get 5 to agree to a conversation
- Find 3 who confirm they have the problem and it's urgent
- Find 1 who says they'd pay to solve it

If you can't hit these numbers, the segment may not exist or isn't accessible.

### Step 3: Map the Full Cascade

Document what else must change:
- What problems do these new customers have?
- What solution will resonate with them?
- What technology changes are required?
- What channels reach them?

### Step 4: Plan for Identity Shift

Customer pivots require saying goodbye to your old vision. This is psychologically hard.

**Prepare for**:
- Existing customers may not transition
- Team may need retraining or new hires
- Marketing, sales, product all need reimagining
- Investor communication about the change

### Step 5: Execute with Commitment

Half-pivots don't work. Once you commit:
- Focus entirely on new customer
- Don't try to serve both segments
- Be willing to lose old customers
- Measure against new success criteria

---

## Problem Pivot Playbook

**When to use**: Evidence shows you're solving a "nice-to-have" problem, not a "must-have" problem.

**Blast radius**: 3 layers (Solution, Technology, Growth)

### Step 1: Discover the Real Problem

**Listen for workarounds**: What are customers doing manually? What hacks have they built?

**Watch behavior**: What do they actually do (not just say)?

**Ask different questions**:
- "What's the most frustrating part of your day?"
- "What would you pay money to make go away?"
- "What keeps you up at night professionally?"

### Step 2: Validate Severity

**Willingness tests**:
- Will they talk? (30-minute call)
- Will they show? (Demo their current workflow)
- Will they pay? (Deposit, LOI, early access fee)

**Urgency signals**:
- They're actively searching for solutions
- They've tried to solve it before
- They're spending money on alternatives
- It's in their top 5 priorities

### Step 3: Assess Cascade Impact

Problem pivots affect less than customer pivots, but still significant:
- Solution must change to address new problem
- Technology may need rebuilding
- Growth messaging definitely changes
- Customers stay the same (this is what makes it a problem pivot, not customer pivot)

### Step 4: Transition Existing Customers

Unlike customer pivots, you can often bring existing customers along:
- They already trust you
- They may have the new problem too
- Position the change as an upgrade

**Communication**: "We've learned that the bigger pain point is X, so we're evolving our product to solve that."

---

## Solution Pivot Playbook

**When to use**: Evidence shows current solution doesn't deliver 10x value, even though problem is validated.

**Blast radius**: 2 layers (Technology, Growth)

### Step 1: Clarify What Stays Constant

Document explicitly:
- **Customers**: [Who we're serving—unchanged]
- **Problem**: [What we're solving—unchanged]
- **Success metric**: [How we measure value—unchanged]

This clarity prevents scope creep during the pivot.

### Step 2: Identify Why Current Solution Fails

**Common failure modes**:
- **Effectiveness**: Doesn't actually solve the problem
- **Usability**: Too hard to use
- **Workflow fit**: Doesn't fit how customers work
- **Time-to-value**: Takes too long to get value
- **Cost**: Too expensive relative to value

### Step 3: Generate Alternatives

Brainstorm 3-5 alternative approaches. For each:
- How would this solve the same problem differently?
- What's the 10x advantage of this approach?
- What would it take to build?
- What would it take to validate?

**Apply the 10x test**: Is this approach dramatically better, or just incrementally better?

### Step 4: Validate Before Building

Don't build the new solution before validating it will work.

**Validation methods**:
- **Concierge MVP**: Deliver the solution manually
- **Wizard of Oz**: Fake automation with human behind scenes
- **Prototype test**: Show mockups and gauge reaction
- **Landing page test**: Measure interest before building

### Step 5: Plan the Cascade

Solution pivots affect:
- **Technology**: What needs to be built differently?
- **Growth**: How does messaging change?

Document these changes explicitly before starting.

---

## Technology Pivot Playbook

**When to use**: Technical architecture constrains the solution, or technology upgrade unlocks new capabilities.

**Blast radius**: 1 layer (Growth, potentially)

### Step 1: Distinguish from Engineering Debt

**Technology pivot**: Fundamental change in approach (monolith → microservices, on-prem → cloud)

**Engineering debt**: Incremental improvements within current approach (refactoring, optimization)

If it's debt, address it without calling it a pivot.

### Step 2: Assess True Cost

| Factor | Assessment |
|--------|------------|
| Timeline | How long to rebuild/migrate? |
| Team capability | Do we have the skills? |
| Customer impact | Will customers notice? |
| Opportunity cost | What aren't we building? |

### Step 3: Choose Migration Path

**Option A: Big Bang**
- Replace everything at once
- Fastest to complete
- Highest risk
- Best for small systems

**Option B: Strangler Fig**
- Replace piece by piece
- Slower but safer
- Run old and new in parallel
- Best for large systems

**Option C: Parallel Systems**
- Build new system alongside old
- Migrate customers gradually
- Most expensive but lowest risk
- Best for mission-critical systems

### Step 4: Protect Customer Experience

Technology pivots should be invisible to customers if done right.

**Plan for**:
- Data migration
- API compatibility (if applicable)
- Performance during transition
- Rollback if issues arise

---

## Growth Pivot Playbook

**When to use**: Current channels aren't working, but product and problem are validated.

**Blast radius**: 0 layers (nothing else changes)

### Step 1: Diagnose Current State

**Channel performance analysis**:
- What's CAC for each channel?
- What's conversion rate at each stage?
- What's LTV for customers from each channel?
- Which channel has best CAC:LTV ratio?

### Step 2: Identify Alternatives

**Three growth engines** (from Lean Startup):

**Paid Engine**:
- Acquire customers through advertising
- Works if CAC < LTV
- Examples: Google Ads, Facebook Ads, sponsorships

**Viral Engine**:
- Acquire customers through referrals
- Works if each customer brings >1 new customer
- Examples: Referral programs, sharing features, network effects

**Sticky Engine**:
- Acquire customers through retention
- Works if churn is very low
- Examples: High switching costs, habitual use, data lock-in

### Step 3: Match Engine to Reality

| Your Reality | Best Engine |
|-------------|-------------|
| High margins, clear ROI | Paid |
| Social product, low friction | Viral |
| High switching costs, data value | Sticky |

**Don't force it**: If your product isn't naturally viral, don't expect a referral program to work.

### Step 4: Design the Experiment

**90-day test plan**:
```
CHANNEL: [Name]

HYPOTHESIS: [What you believe will happen]

SUCCESS METRICS:
- CAC target: $___
- Conversion target: ___%
- Leads target: ___

RESOURCES:
- Budget: $___
- Timeline: 90 days
- Owner: [Name]

COMMITMENT: We will run this test for 90 days
before concluding whether this channel works.
```

### Step 5: Execute Without Changing Product

Growth pivots should not require product changes. If you find yourself saying "we need feature X for this channel to work," you may be doing a Solution pivot, not a Growth pivot.

---

## Multi-Layer Pivot Warning

If you find yourself needing to pivot 2+ layers simultaneously, pause and reconsider.

**Signs of trouble**:
- Cascade analysis shows changes to 3+ layers
- No clear sequence (what to change first)
- Team is confused about what's changing
- Each layer change seems to require another layer change

**Better approach**:
- Pick the lowest broken layer
- Pivot that layer first
- Stabilize
- Then assess if higher layers still need pivoting

Sequential pivots are safer than simultaneous pivots.

---

## Kill Criteria

Before starting any pivot, define kill criteria—conditions that would cause you to abandon the pivot.

**Example kill criteria**:
```
We will abandon this pivot if:
- After 90 days, leading indicators show <50% of target
- After 60 days, we can't find 10 customers in new segment
- After 30 days, every customer conversation is negative
- Burn rate exceeds runway buffer
```

Kill criteria prevent sunk cost fallacy and ensure you can course-correct.
