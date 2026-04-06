# ComQ

A web-based AAC (Augmentative and Alternative Communication) system that helps patients with brain damage communicate their needs.

Communicators navigate a configurable tree of categories and messages using three large buttons — scan, select, and back. Each step is spoken aloud via text-to-speech and confirmed with haptic vibration. Facilitators configure the communication boards through a drag-and-drop tree editor.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm test` | Run unit/integration tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Architecture

Four-layer clean architecture with strict dependency rules:

```
Presentation → Application → Domain ← Infrastructure
```

- **domain/** — Entities, value objects, repository interfaces, domain services. Pure TypeScript, zero dependencies.
- **application/** — Use-case orchestration, port interfaces.
- **infrastructure/** — Browser API adapters (localStorage, Web Speech, Vibration), DI container.
- **presentation/** — React views, MVVM view-models (hooks), shared components.

## Tech Stack

React 19, TypeScript 5 (strict), Vite 8, Vitest, Playwright, CSS Modules.

## License

ISC
