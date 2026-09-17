import { skillPerceptionEngine } from './SkillPerceptionEngine';
import { getHistory, type Inclination } from './DecisionHistory';

export interface UserProfile {
  preferredMode: 'smooth' | 'analytical' | 'silent';
  preferredVoiceRate: number;
  activeHours: number[];
  frequentContexts: string[];
  confidence: number;
}

export interface Suggestion {
  id: string;
  description: string;
  action: () => Promise<void>;
  accepted: boolean;
}

let pendingSuggestions: Suggestion[] = [];

export async function computeInclination(): Promise<UserProfile> {
  const decisions = await getHistory(200);
  const patterns = await skillPerceptionEngine.getLearnedPatterns();
  const modeCounts: Record<UserProfile['preferredMode'], number> = { smooth: 0, analytical: 0, silent: 0 };
  let preferredVoiceRate = 1;

  decisions.forEach((decision) => {
    if (decision.type !== 'preference') return;
    const value = decision.value;
    if (value?.mode in modeCounts) modeCounts[value.mode as UserProfile['preferredMode']] += 1;
    if (typeof value?.voiceRate === 'number') preferredVoiceRate = value.voiceRate;
  });

  const preferredMode = (Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'smooth') as UserProfile['preferredMode'];
  const activeHours = Array.from(new Set(patterns.flatMap((pattern) => pattern.hourRange))).sort((a, b) => a - b);
  const frequentContexts = Array.from(new Set(patterns.map((pattern) => pattern.approximateLocation))).slice(0, 5);
  const confidence = Math.min(1, (decisions.length + patterns.length) / 10);
  return { preferredMode, preferredVoiceRate, activeHours, frequentContexts, confidence };
}

export async function getSuggestions(): Promise<Suggestion[]> {
  const profile = await computeInclination();
  pendingSuggestions = profile.confidence < 0.3 ? [] : [{
    id: 'suggest-preferred-mode',
    description: `Podrías probar el modo ${profile.preferredMode}.`,
    accepted: false,
    action: async () => undefined,
  }];
  return pendingSuggestions;
}

export async function applySuggestion(suggestionId: string): Promise<boolean> {
  const suggestion = pendingSuggestions.find((item) => item.id === suggestionId);
  if (!suggestion || suggestion.accepted) return false;
  await suggestion.action();
  suggestion.accepted = true;
  return true;
}

export type { Inclination };