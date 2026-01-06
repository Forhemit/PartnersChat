# PartnerChat Technical Stack

This document outlines the core technologies, frameworks, and architecture used in the PartnerChat application.

## 🚀 Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: 
  - **Tailwind CSS 4**: Modern utility-first CSS framework.
  - **Framer Motion**: Fluid animations and spring physics.
  - **OKLCH Colors**: High-fidelity UI color space.
  - **Antigravity Design Protocol**: Custom avant-garde design system and layout principles.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme Management**: `next-themes` (Light, Dark, Race Track, and Party modes).
- **Content Rendering**: `react-markdown` for AI responses.

## 🔗 Backend & Infrastructure
- **Real-time Engine**: [Convex](https://www.convex.dev/) (Handles database, serverless functions, and real-time synchronization).
- **Secondary Database**: [Supabase](https://supabase.com/) (PostgreSQL and type generation).
- **Authentication**: [Clerk](https://clerk.com/) (Secure user management).
- **Analytics**: [PostHog](https://posthog.com/) (Product usage tracking).

## 🧠 AI & Logic
- **AI Gateway**: [OpenRouter API](https://openrouter.ai/) (Multi-model support and orchestration).
- **Council System**: Modular logic for specialized AI "Councils":
  - Standard Board
  - Personal Decision
  - Creative Collective
  - Ethical Oversight
  - Party Mode

## 🛠 Developer Utilities
- **Animations**: `canvas-confetti`
- **Utility Classes**: `clsx`, `tailwind-merge`
- **Environment**: Root project uses a Python environment for additional utility scripts and orchestration.

## 🏗 Directory Structure
- `/PartnerChatApp`: Main Next.js application.
- `/convex`: Convex backend functions and schema.
- `/backend`: Python-based utility services.
- `/frontend`: Legacy or alternative frontend components.
