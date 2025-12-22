# Cascade Analysis

Understanding how changes at one layer ripple through your startup.

---

## The Cascade Rules

1. **Changes cascade upward.** When you change a layer, everything above must be reconsidered.
2. **Changes don't cascade downward.** When you change a layer, nothing below is affected.
3. **The lower the layer, the wider the cascade.** Customer pivots affect four layers. Growth pivots affect zero.

---

## Blast Radius by Pivot Type

### Customer Pivot (Layer 1)
**Blast radius: 4 layers affected**

When you change who you're building for:
- **Problem changes**: Different customers have different problems
- **Solution changes**: Approach that works for one segment may not work for another
- **Technology changes**: Different solutions may require different technical approaches
- **Growth changes**: Different customers are reached through different channels

**Cost**: Quarters to years. Essentially starting a new company.

---

### Problem Pivot (Layer 2)
**Blast radius: 3 layers affected**

When you change the problem you're solving (same customers):
- **Solution changes**: New problems require new solutions
- **Technology changes**: New solutions may require new technical approaches
- **Growth changes**: New value propositions need new positioning and channels
- **Customers remain**: Still serving the same people

**Cost**: Months to quarters.

---

### Solution Pivot (Layer 3)
**Blast radius: 2 layers affected**

When you change how you solve the same problem:
- **Technology changes**: New solutions need new implementations
- **Growth changes**: New products need new go-to-market approaches
- **Problem remains**: Still solving the same pain
- **Customers remain**: Still serving the same people

**Cost**: Months.

---

### Technology Pivot (Layer 4)
**Blast radius: 1 layer potentially affected**

When you change how you build the solution:
- **Growth may change**: New capabilities may enable new channels
- **Solution remains**: Still delivering the same value
- **Problem remains**: Still solving the same pain
- **Customers remain**: Still serving the same people

**Cost**: Weeks to months. Often invisible to customers.

---

### Growth Pivot (Layer 5)
**Blast radius: 0 layers affected**

When you change how you acquire and retain users:
- **Nothing below changes**: Product, technology, solution, problem, and customers remain exactly the same.

**Cost**: Days to weeks. Lowest risk, highest experimentation frequency.

---

## Cost Analysis

### Time Cost

| Pivot Type | Typical Timeline | With Buffer |
|------------|-----------------|-------------|
| Growth | Days-Weeks | +1 week |
| Technology | Weeks-Months | +2 months |
| Solution | Months | +3 months |
| Problem | Months-Quarters | +3-6 months |
| Customer | Quarters-Years | +6 months |

### Capital Cost

| Pivot Type | Estimated Burn |
|------------|---------------|
| Growth | $5K-50K for channel experiments |
| Technology | 1-6 months of engineering burn |
| Solution | 3-12 months of product development burn |
| Problem/Customer | 6-18+ months of complete rebuild burn |

### Capability Cost

Pivots may require skills your team doesn't have:

| Pivot Type | Capability Gap Examples |
|------------|------------------------|
| Growth | Content → Paid acquisition requires performance marketing expertise |
| Technology | Monolith → Microservices requires distributed systems experience |
| Customer | SMB → Enterprise requires enterprise sales capabilities |

---

## Cascade Checklists

Use these before committing to any pivot.

### Customer Pivot Checklist

- [ ] Have we fully validated that our current customer segment can't support a viable business?
- [ ] Have we done extensive discovery with the new customer segment (50+ conversations)?
- [ ] Do we have the team capabilities to serve this new segment?
- [ ] Do we have the runway for a 12-18 month pivot?
- [ ] Have we modeled the new problem, solution, technology, and growth layers?
- [ ] Have we considered the identity shift this requires?
- [ ] Have we planned communication to existing customers?

### Problem Pivot Checklist

- [ ] Have we validated our current customer segment wants to pay for the new problem?
- [ ] Is the new problem more urgent than our current problem ("hair on fire")?
- [ ] Do we have the domain expertise for this new problem space?
- [ ] Have we modeled the new solution, technology, and growth layers?
- [ ] Can we bring existing customers along, or do we need to start fresh?

### Solution Pivot Checklist

- [ ] Does our new solution address the same validated problem?
- [ ] Is it 10x better than alternatives?
- [ ] Do we have the capabilities to build it?
- [ ] Have we modeled the new technology and growth layers?
- [ ] Have we validated the new solution before committing to building?

### Technology Pivot Checklist

- [ ] Does the new technology enable our solution more effectively?
- [ ] Do we have the technical skills to execute?
- [ ] Is the migration path manageable?
- [ ] What growth opportunities does this unlock?
- [ ] How do we protect customer experience during transition?

### Growth Pivot Checklist

- [ ] Have we truly exhausted our current channels?
- [ ] Does the new channel match our customer behavior?
- [ ] Do we have the skills to execute in this new channel?
- [ ] Can we test this with limited resources before committing?
- [ ] Have we run a 90-day test on the current approach first?

---

## Cascade Mapping Template

Use this template before any pivot:

```
CASCADE ANALYSIS

Primary pivot: [Layer being intentionally changed]

CURRENT STATE:
- Customers: [Current hypothesis]
- Problem: [Current hypothesis]
- Solution: [Current hypothesis]
- Technology: [Current hypothesis]
- Growth: [Current hypothesis]

TARGET STATE:
- Customers: [New hypothesis or "No change"]
- Problem: [New hypothesis or "No change"]
- Solution: [New hypothesis or "No change"]
- Technology: [New hypothesis or "No change"]
- Growth: [New hypothesis or "No change"]

REQUIRED CHANGES:
Layer: [Name]
What changes: [Specific description]
Why: [Reason this must change]
Estimated effort: [Time/resources required]

Layer: [Name]
What changes: [Specific description]
Why: [Reason this must change]
Estimated effort: [Time/resources required]

WHAT WE'RE KEEPING:
Layer: [Name]
Why it stays: [Evidence that this layer is validated]

TOTAL ESTIMATED COST:
Timeline: [Duration]
Burn: [Capital required]
Capability gaps: [Skills needed]
```

---

## The Inverse Relationship

**Key strategic insight**: Lower pivots have higher cost but higher potential impact. Upper pivots have lower cost but lower potential impact.

```
                      Growth
                     ↗ Low cost, low impact
                   Technology
                 ↗
               Solution
             ↗
           Problem
         ↗
       Customers
     ↗ High cost, high impact
```

### Strategic Implication

**Start experiments at the top of the pyramid.**

Before pivoting customers, exhaust growth experiments.
Before pivoting problem, test different solutions.
Before pivoting solution, optimize technology.

Only pivot lower layers when you have strong evidence that upper layers are solid but lower layer is broken.

---

## Case Study: Restaurant Tech Cascade

Initial configuration:
- **Customers**: Independent restaurants
- **Problem**: Menus expensive to print and outdated
- **Solution**: QR code digital menus
- **Technology**: Simple web app with CMS
- **Growth**: Supplier partnerships + cold outreach

**Discovery**: Restaurants didn't care about menu printing. They cared about 30% commission to delivery apps.

**Problem Pivot**: "Menu updates" → "Commission-free online ordering"

**Cascade**:
- Solution: Static menus → Online ordering with pickup/delivery
- Technology: Simple CMS → Order management, payments, kitchen displays
- Growth: "Save on menus" → "Keep 100% of delivery revenue"
- Customers: No change (still independent restaurants)

**Outcome**: Companies making this pivot (ChowNow, Toast) found urgent problem. Toast went public at $20B+ valuation.

**Lesson**: Many founders thought they had growth problem ("not reaching enough restaurants"). Real problem was one layer lower—solving "nice-to-have" instead of "must-have."
