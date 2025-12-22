# Pivot Pyramid Coach Skill

AI coaching skill for founders navigating startup experimentation using the Pivot Pyramid framework.

## Uploading to Claude Console

### Step 1: Create ZIP file

From the `west-monroe` directory:

```bash
zip -r pivot-pyramid-coach.zip pivot-pyramid-coach -x "*.DS_Store"
```

### Step 2: Upload to Claude Console

1. Go to [Claude Console](https://console.anthropic.com) → **Skills**
2. Click **+ Add skill**
3. Drag and drop `pivot-pyramid-coach.zip` into the modal
4. Click **Continue**

### Step 3: Enable the skill

Toggle the skill on in your Skills list. It will automatically trigger when users mention:
- "should I pivot"
- "diagnose why my startup isn't growing"
- "run a pivot assessment"
- "what layer is broken"
- "help me plan a pivot"

## File Structure

```
pivot-pyramid-coach/
├── SKILL.md                    # Core coaching framework (required)
├── README.md                   # This file
├── layer-definitions.md        # Deep validation questions per layer
├── evidence-hierarchy.md       # Evidence assessment framework
├── cascade-analysis.md         # Blast radius by pivot type
├── diagnostic-guide.md         # Symptom → root cause mapping
├── anti-patterns.md            # Half-Pivot, Multi-Track Trap, etc.
├── 90-day-rule.md              # When NOT to pivot
├── pivot-playbooks.md          # Step-by-step for each pivot type
├── examples/
│   ├── coaching-conversation.md
│   └── pivot-plan-output.md
└── scripts/
    └── assessment-template.sh  # Generates blank assessment form
```

## Skill Requirements

Per [Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview):

- **SKILL.md** must be at the root level
- **Frontmatter** requires only `name` and `description` fields
- **name**: max 64 chars, lowercase letters/numbers/hyphens only
- **description**: max 1024 chars, non-empty
- Reference files should be at the same level as SKILL.md (not nested in subdirectories)
- `scripts/` and `examples/` subdirectories are allowed

## Updating the Skill

1. Edit files in this directory
2. Re-create the ZIP: `zip -r pivot-pyramid-coach.zip pivot-pyramid-coach -x "*.DS_Store"`
3. In Claude Console → Skills, delete the old version
4. Upload the new ZIP

## Alternative: Claude Code Plugin

For use with Claude Code (local CLI), use the `pivot-pyramid-skill/` directory which has the nested `references/` structure. Copy to `~/.claude/skills/pivot-pyramid-coach/`.
