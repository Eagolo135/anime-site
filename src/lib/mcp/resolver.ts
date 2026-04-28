import { archiveMockData } from "@/data/mock/archive";
import type { ClarificationOption } from "@/lib/mcp/contracts";

type Resolution = {
  anime: string | null;
  character: string | null;
  isAmbiguous: boolean;
  clarificationOptions: ClarificationOption[];
};

type ResolveOptions = {
  pendingClarification?: ClarificationOption[];
  resolvedContext?: {
    anime: string;
    character: string;
  } | null;
  allowCarryForward?: boolean;
};

type CharacterAlias = {
  token: string;
  anime: string;
  character: string;
};

const AMBIGUOUS_CHARACTER_MAP: Record<string, ClarificationOption[]> = {
  sakura: [
    { anime: "Naruto", character: "Sakura Haruno", confidence: 0.93 },
    { anime: "Cardcaptor Sakura", character: "Sakura Kinomoto", confidence: 0.89 },
    { anime: "Fate/stay night", character: "Matou Sakura", confidence: 0.82 },
  ],
  rei: [
    { anime: "Neon Genesis Evangelion", character: "Rei Ayanami", confidence: 0.93 },
    { anime: "Sailor Moon", character: "Rei Hino", confidence: 0.88 },
    { anime: "Buddy Daddies", character: "Rei Suwa", confidence: 0.77 },
  ],
  zero: [
    { anime: "Code Geass", character: "Zero", confidence: 0.92 },
    { anime: "Vampire Knight", character: "Zero Kiryu", confidence: 0.83 },
    { anime: "Drakengard 3", character: "Zero", confidence: 0.71 },
  ],
};

const CHARACTER_ALIASES: CharacterAlias[] = [
  { token: "goku", anime: "Dragon Ball", character: "Son Goku" },
  { token: "vegeta", anime: "Dragon Ball", character: "Vegeta" },
  { token: "gojo", anime: "Jujutsu Kaisen", character: "Satoru Gojo" },
  { token: "tanjiro", anime: "Demon Slayer", character: "Tanjiro Kamado" },
  { token: "shinji", anime: "Neon Genesis Evangelion", character: "Shinji Ikari" },
  { token: "spike", anime: "Cowboy Bebop", character: "Spike Spiegel" },
];

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function findAnimeMention(message: string): string | null {
  const normalized = normalize(message);

  const matched = archiveMockData.find((entry) => normalized.includes(normalize(entry.animeTitle)));
  return matched?.animeTitle ?? null;
}

function findCharacterMentions(message: string): Array<{ anime: string; character: string }> {
  const normalized = normalize(message);

  const archiveMentions = archiveMockData
    .filter((entry) => {
      const full = normalize(entry.character);
      const firstName = full.split(" ")[0] ?? full;
      return normalized.includes(full) || normalized.includes(firstName);
    })
    .map((entry) => ({
      anime: entry.animeTitle,
      character: entry.character,
    }));

  const aliasMentions = CHARACTER_ALIASES.filter((alias) =>
    normalized.includes(alias.token)
  ).map((alias) => ({
    anime: alias.anime,
    character: alias.character,
  }));

  const deduped = new Map<string, { anime: string; character: string }>();
  for (const mention of [...archiveMentions, ...aliasMentions]) {
    deduped.set(`${mention.anime}::${mention.character}`, mention);
  }

  return Array.from(deduped.values());
}

function fromCharacterAmbiguity(message: string): ClarificationOption[] {
  const normalized = normalize(message);

  for (const [token, options] of Object.entries(AMBIGUOUS_CHARACTER_MAP)) {
    if (normalized.includes(token)) {
      return options.slice(0, 3);
    }
  }

  return [];
}

function chooseFromPendingClarification(
  message: string,
  options: ClarificationOption[]
): ClarificationOption | null {
  if (options.length === 0) {
    return null;
  }

  const normalized = normalize(message);

  const explicitIndex = [
    /\b(first|1|one)\b/,
    /\b(second|2|two)\b/,
    /\b(third|3|three)\b/,
  ].findIndex((pattern) => pattern.test(normalized));

  if (explicitIndex >= 0 && options[explicitIndex]) {
    return options[explicitIndex];
  }

  const directMatch = options.find((option) => {
    const anime = normalize(option.anime);
    const character = normalize(option.character);
    const firstName = character.split(" ")[0] ?? character;
    return normalized.includes(anime) || normalized.includes(character) || normalized.includes(firstName);
  });

  if (directMatch) {
    return directMatch;
  }

  if (/\b(yes|that one|go with that|sounds right)\b/.test(normalized)) {
    return options[0] ?? null;
  }

  return null;
}

function shouldCarryForward(message: string): boolean {
  const normalized = normalize(message);

  if (/(forget|reset|different anime|new anime|something else)/.test(normalized)) {
    return false;
  }

  return /(poem|verse|write|another|shorter|longer|image|artwork|same character|same anime|again)/.test(
    normalized
  );
}

export function resolveContext(message: string, options: ResolveOptions = {}): Resolution {
  const pendingMatch = chooseFromPendingClarification(message, options.pendingClarification ?? []);
  if (pendingMatch) {
    return {
      anime: pendingMatch.anime,
      character: pendingMatch.character,
      isAmbiguous: false,
      clarificationOptions: [],
    };
  }

  const animeMention = findAnimeMention(message);
  const characterMentions = findCharacterMentions(message);

  if (animeMention && characterMentions.length > 0) {
    const matched = characterMentions.find((item) => item.anime === animeMention) ?? characterMentions[0];
    return {
      anime: animeMention,
      character: matched.character,
      isAmbiguous: false,
      clarificationOptions: [],
    };
  }

  if (!animeMention && characterMentions.length === 1) {
    return {
      anime: characterMentions[0].anime,
      character: characterMentions[0].character,
      isAmbiguous: false,
      clarificationOptions: [],
    };
  }

  if (characterMentions.length > 1) {
    return {
      anime: null,
      character: null,
      isAmbiguous: true,
      clarificationOptions: characterMentions.slice(0, 3).map((item, index) => ({
        anime: item.anime,
        character: item.character,
        confidence: Number((0.94 - index * 0.08).toFixed(2)),
      })),
    };
  }

  const ambiguousOptions = fromCharacterAmbiguity(message);
  if (ambiguousOptions.length > 0) {
    return {
      anime: null,
      character: null,
      isAmbiguous: true,
      clarificationOptions: ambiguousOptions,
    };
  }

  if (animeMention) {
    return {
      anime: animeMention,
      character: null,
      isAmbiguous: true,
      clarificationOptions: archiveMockData
        .filter((entry) => entry.animeTitle === animeMention)
        .slice(0, 3)
        .map((entry) => ({
          anime: entry.animeTitle,
          character: entry.character,
          confidence: 0.85,
        })),
    };
  }

  if (options.allowCarryForward && options.resolvedContext && shouldCarryForward(message)) {
    return {
      anime: options.resolvedContext.anime,
      character: options.resolvedContext.character,
      isAmbiguous: false,
      clarificationOptions: [],
    };
  }

  return {
    anime: null,
    character: null,
    isAmbiguous: false,
    clarificationOptions: [],
  };
}
