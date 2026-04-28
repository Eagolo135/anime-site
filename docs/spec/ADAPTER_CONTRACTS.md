# Adapter Contracts

Last updated: 2026-04-28

## Purpose
Define source boundaries so UI composition stays stable while data/image providers can be swapped later.

## Archive Provider
File: `src/lib/providers/archiveProvider.ts`

Contract:
- `listEntries(): Promise<ArchiveEntry[]>`

Current implementation:
- `mockArchiveProvider` returns local mock archive entries.

Future implementation examples:
- AniList-backed archive mapper
- custom CMS/local JSON provider

## Image Provider
File: `src/lib/providers/imageProvider.ts`

Contract:
- `lookupByAnimeTitles(titles: string[]): Promise<Record<string, string | null>>`

Current implementation:
- `jikanRouteImageProvider` calls internal route `/api/jikan-images`.

Future implementation examples:
- Local curated image index
- cloud media resolver with confidence scoring

## Integration Rules
- UI components should call provider helper functions, not external APIs directly.
- Mock archive remains canonical for poetry content in current phases.
- Provider replacement must not require structural UI rewrites.
