import { archiveMockData, type ArchiveEntry } from "@/data/mock/archive";

export type ArchiveProvider = {
  listEntries: () => Promise<ArchiveEntry[]>;
};

export const mockArchiveProvider: ArchiveProvider = {
  async listEntries() {
    return archiveMockData;
  },
};

export async function loadArchiveEntries(provider: ArchiveProvider = mockArchiveProvider) {
  return provider.listEntries();
}
