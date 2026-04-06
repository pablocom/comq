# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is ComQ

ComQ is a web-based AAC (Augmentative and Alternative Communication) system for patients with brain damage. Patients ("communicators") navigate a configurable tree of needs using scan buttons; caregivers ("facilitators") configure the tree. All UI text is in Spanish; code is in English.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm test             # Run all unit/integration tests (vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run Playwright E2E tests (builds first via webServer config)
npm run lint         # ESLint
npm run format       # Prettier
```

Run a single test file: `npx vitest run src/__tests__/domain/services/ScanningDomainService.test.ts`

E2E tests require `npm run build` first (Playwright uses `npm run preview` as the webServer).

## Architecture

Four-layer architecture with a strict dependency rule — each layer only imports from the layer below it:

```
Presentation  →  Application  →  Domain  ←  Infrastructure
```

- **domain/** — Pure TypeScript, zero dependencies. Entities (`BoardNode`, `CommunicationBoard`), value objects (`ScanState`, `Utterance`), repository interfaces, domain services (`ScanningDomainService`), and validation.
- **application/** — Use-case orchestration. Services (`ScanningAppService`, `BoardEditorService`, `BoardSharingService`) and port interfaces (`IVoiceOutputPort`, `IHapticFeedbackPort`). Imports domain only.
- **infrastructure/** — Adapters for browser APIs and persistence. `LocalStorageBoardRepository`, `WebSpeechVoiceOutput`, `NavigatorHapticFeedback`. Implements ports defined in application/domain.
- **presentation/** — React components, view-models (custom hooks), and providers. Consumes services via DI context (`ServiceProvider`), never imports infrastructure directly.

Path aliases: `@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@test/*` (configured in tsconfig.json and vitest.config.ts).

## Key Patterns

**MVVM via hooks**: Each view has a corresponding ViewModel hook (e.g., `useCommunicatorViewModel`). Views are pure rendering; ViewModels hold state and delegate to application services.

**DI via React Context**: `ServiceContainer` (infrastructure/di) wires all services. `ServiceProvider` exposes them via context. Views access services through `useServices()`.

**Immutable domain entities**: `BoardNode` and `CommunicationBoard` are immutable — mutation methods (`withLabel`, `addChild`, `withRootNodes`) return new instances.

**Composite pattern**: `BoardNode` serves as both category (has children) and message (leaf). `isCategory()`/`isMessage()` are derived from `children.length`.

**Persistence**: All data in localStorage under keys `comq:boards:v1` (JSON map of boards by ID) and `comq:active-board` (active board ID string).

## Domain Language (AAC terminology)

| Code Term | Meaning |
|---|---|
| `CommunicationBoard` | The configurable tree of categories and messages |
| `BoardNode` | A node in the tree — category (has children) or message (leaf) |
| Scanning | Sequential navigation through options (AAC term) |
| Selection | Confirming/choosing an item |
| Communicator | The patient using the system |
| Facilitator | The caregiver who configures boards |
| Voice Output | Text-to-speech feedback |
| Utterance | The spoken phrase when a message is selected |

## Testing

Tests mirror the src/ structure under `src/__tests__/`. Test names follow `"[unit] [scenario] [expected behavior]"`. Domain layer has the highest test density. Application tests mock ports. Infrastructure tests run against real localStorage (jsdom). E2E tests are in `e2e/`.

## UI Interaction Model

- **Communicator view** (`/`): Three buttons — Siguiente (scan next), Seleccionar (select), Volver (back). Voice output on every scan step. Haptic vibration on interaction.
- **Board editor** (`/board-editor`): Drag-and-drop tree editor. Hold-to-confirm pattern for destructive actions. Accessed via 3-second long-press on gear icon.
- **Board sharing** (`/board-sharing`): Export/import all boards as `.comq.json`.
