import type { ArchiveEntry } from "@/data/mock/archive";

export function filterArchive(entries: ArchiveEntry[], query: string): ArchiveEntry[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return entries;
  }

  return entries.filter((entry) => {
    return (
      entry.animeTitle.toLowerCase().includes(normalized) ||
      entry.character.toLowerCase().includes(normalized) ||
      entry.phrase.toLowerCase().includes(normalized)
    );
  });
}
