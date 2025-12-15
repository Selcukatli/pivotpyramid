# Pivot Pyramid Canvas — Setup Guide

A complete AI-powered startup hypothesis canvas using the Pivot Pyramid framework. Built with Next.js, Convex, and OpenRouter.

## Features

- **Two-tab workflow**: Describe your startup → Generate AI hypotheses
- **AI Canvas Generation**: Gemini 2.5 Flash generates structured hypotheses from your description
- **AI Chat Advisor**: Real-time streaming chat with an AI startup advisor
- **Auto-save**: All changes saved automatically to Convex
- **Anonymous sessions**: Works without auth (localStorage-based sessions)
- **Responsive design**: Mobile-first with desktop chat panel

---

## Prerequisites

Before starting, you'll need:

1. **Node.js 18+** installed
2. **Convex account** — [Sign up free](https://convex.dev)
3. **OpenRouter API key** — [Get one here](https://openrouter.ai/keys)

---

## Step 1: Create a New Next.js Project

```bash
# Create new project
npx create-next-app@latest pivot-pyramid --typescript --tailwind --eslint --app --src-dir

# Navigate to project
cd pivot-pyramid
```

---

## Step 2: Install Dependencies

```bash
npm install convex @convex-dev/persistent-text-streaming @openrouter/ai-sdk-provider ai zod lucide-react use-debounce
```

---

## Step 3: Initialize Convex

```bash
# Initialize Convex (will prompt you to login/signup)
npx convex dev

# This creates:
# - convex/ folder
# - .env.local with CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL
```

Keep this terminal running during development. It syncs your Convex functions.

---

## Step 4: Copy Project Files

Copy the entire contents of this export folder:

```
pivot-pyramid-export/
├── convex/                    → your-project/convex/
│   ├── schema.ts
│   ├── convex.config.ts
│   ├── canvases.ts
│   ├── canvasMessages.ts
│   ├── canvasStream.ts
│   └── http.ts
├── src/
│   ├── app/canvas/           → your-project/src/app/canvas/
│   │   └── page.tsx
│   ├── components/
│   │   ├── canvas/           → your-project/src/components/canvas/
│   │   │   ├── canvas-provider.tsx
│   │   │   ├── canvas-tabs.tsx
│   │   │   ├── canvas-form.tsx
│   │   │   ├── canvas-header.tsx
│   │   │   ├── startup-profile-form.tsx
│   │   │   ├── layer-input.tsx
│   │   │   ├── confidence-slider.tsx
│   │   │   ├── chat-panel.tsx
│   │   │   ├── chat-input.tsx
│   │   │   └── chat-message.tsx
│   │   └── providers/        → your-project/src/components/providers/
│   │       └── convex-provider.tsx
│   ├── hooks/                → your-project/src/hooks/
│   │   ├── use-canvas-session.ts
│   │   └── use-driven-streams.ts
│   └── lib/                  → your-project/src/lib/
│       └── pivot-pyramid-data.ts
```

---

## Step 5: Configure Convex Provider

Update your root layout to include the Convex provider:

**`src/app/layout.tsx`**:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pivot Pyramid Canvas",
  description: "AI-powered startup hypothesis tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

---

## Step 6: Configure Path Aliases

Ensure your `tsconfig.json` has the `@/` path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Step 7: Add OpenRouter API Key

Add your OpenRouter API key to Convex environment:

```bash
# Via Convex dashboard (recommended)
# Go to: https://dashboard.convex.dev → Your Project → Settings → Environment Variables
# Add: OPENROUTER_API_KEY = your-key-here

# Or via CLI
npx convex env set OPENROUTER_API_KEY your-key-here
```

---

## Step 8: Update Homepage (Optional)

Create a simple homepage that links to the canvas:

**`src/app/page.tsx`**:
```tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-4">
          Pivot Pyramid Canvas
        </h1>
        <p className="text-stone-600 mb-8 max-w-md">
          Document your startup hypotheses with AI-powered guidance
        </p>
        <Link
          href="/canvas"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Start Your Canvas
        </Link>
      </div>
    </main>
  );
}
```

---

## Step 9: Run the Project

```bash
# Terminal 1: Convex dev server (if not already running)
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

Visit `http://localhost:3000/canvas` to see your canvas!

---

## Environment Variables Summary

Your `.env.local` should have (automatically created by `npx convex dev`):

```env
# Convex (auto-generated)
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Your Convex dashboard should have:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
```

---

## Project Structure Explained

### Convex Backend

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema (canvases + messages tables) |
| `convex.config.ts` | Component configuration (streaming) |
| `canvases.ts` | CRUD operations + AI generation action |
| `canvasMessages.ts` | Chat message operations + streaming |
| `canvasStream.ts` | HTTP action for AI streaming |
| `http.ts` | HTTP router for streaming endpoint |

### React Components

| Component | Purpose |
|-----------|---------|
| `canvas-provider.tsx` | React Context for canvas state |
| `canvas-tabs.tsx` | Profile / Canvas tab switcher |
| `startup-profile-form.tsx` | Freeform startup description input |
| `canvas-form.tsx` | Five-layer hypothesis form |
| `layer-input.tsx` | Individual layer with confidence slider |
| `chat-panel.tsx` | AI advisor chat interface |
| `chat-message.tsx` | Message component with streaming |

### Hooks

| Hook | Purpose |
|------|---------|
| `use-canvas-session.ts` | Anonymous session management |
| `use-driven-streams.ts` | Track client-initiated streams |

---

## Customization

### Change AI Model

Edit `convex/canvasStream.ts` and `convex/canvases.ts`:

```typescript
// Current
model: openrouter.chat("google/gemini-2.5-flash")

// Alternatives
model: openrouter.chat("anthropic/claude-3.5-sonnet")
model: openrouter.chat("openai/gpt-4o")
```

### Modify System Prompt

The AI advisor's behavior is defined in `convex/canvasStream.ts`:

```typescript
const PIVOT_PYRAMID_SYSTEM_PROMPT = `...`;
```

### Add Authentication

Replace the anonymous session system in `use-canvas-session.ts` with your auth provider (Clerk, Auth0, etc.) and update `canvas-provider.tsx` to use user IDs instead of session IDs.

### Change Styling

The project uses Tailwind CSS. Main colors:
- Primary: `amber-400` to `orange-500` gradient
- Background: `stone-50`
- Text: `stone-700`, `stone-800`

---

## Troubleshooting

### "Convex not found" errors

Make sure `npx convex dev` is running and `.env.local` has the correct URLs.

### AI not responding

1. Check OpenRouter API key is set in Convex dashboard
2. Check browser console for errors
3. Verify the model ID is valid on OpenRouter

### Streaming not working

The streaming uses HTTP actions. Make sure:
1. `convex/http.ts` exports the router
2. `convex/convex.config.ts` includes the streaming component
3. CORS is properly configured (already done in the files)

### Type errors

Run `npx convex dev` to regenerate types in `convex/_generated/`.

---

## Deployment

### Deploy Convex

```bash
npx convex deploy
```

This deploys your Convex backend to production. Don't forget to set `OPENROUTER_API_KEY` in the production environment variables.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_CONVEX_URL` — Your production Convex URL

---

## License

MIT License — Feel free to use this for your own projects!

---

## Credits

The Pivot Pyramid framework was created by **Selçuk Atlı** (YC W14, 500 Startups Venture Partner).

Learn more at [selcukatli.com/pivot-pyramid](https://selcukatli.com/pivot-pyramid)
