# demo-cli

A TypeScript CLI template repo used by the [demo-prep](https://github.com/Factory-Academy/demo-creation-skill) skill to generate personalized Factory AI sales demos.

**This is not a real application.** It's a minimal skeleton designed to be cloned, customized with prospect-specific domain models, and used as the backdrop for a 10-15 minute live demo of Factory's Droid. Best suited for prospects building developer tools, CLIs, or platform engineering infrastructure.

## How this repo gets used

1. An SE runs `/demo-prep` in Droid and provides a prospect company name
2. The skill researches the prospect's industry and tech stack
3. It creates a branch (`demo/{company}-{date}`) off this repo
4. Generic code (`item`, `widget` commands) is replaced with domain-specific commands
5. Demo moments are planted — path traversal bugs for code review, hardcoded secrets, vague Linear tickets for spec mode
6. A draft PR is opened so Droid can review it live during the demo

The main branch stays untouched. All customization happens on ephemeral demo branches.

## What's in here

| Path | Purpose |
|---|---|
| `src/index.ts` | CLI entry point — registers commands via Commander.js |
| `src/commands/item.ts` | Primary command (list, create, get — gets renamed) |
| `src/commands/widget.ts` | Secondary command (gets renamed) |
| `src/utils/format.ts` | Table formatting utility |
| `tests/item.test.ts` | Basic test coverage |
| `.factory/AGENTS.md` | Droid coding instructions |

## Customization markers

Files contain `{{MARKER}}` placeholders that the demo-prep skill replaces at branch creation time. See the [demo-api README](https://github.com/Factory-Academy/demo-api#customization-markers) for the full marker table — the same markers are used across all three templates.

Files and commands are also renamed: `item.ts` becomes `workspace.ts`, the `items` command becomes `workspaces`, and all imports are updated.

## Running locally

```bash
npm install
npm run dev -- items list
npm run dev -- items create --name "Test"
```

Tests: `npm test`.

## Persistent reviewed branch

The `demo/reviewed-example` branch has a draft PR ([#1](../../pull/1)) with pre-written review comments (path traversal in file export, hardcoded API key, missing error handling). SEs use this as a fallback if the live PR hasn't been reviewed yet.

## Related repos

- [demo-api](https://github.com/Factory-Academy/demo-api) — Python FastAPI template
- [demo-web-app](https://github.com/Factory-Academy/demo-web-app) — Next.js/React/TypeScript template
