import { ROOM_BY_ID, ROOMS, type Room, type RoomId } from '../data/rooms';
import type { ZoneId } from '../data/zones';

export type Placements = Partial<Record<RoomId, ZoneId>>;
export type Verdict = 'ideal' | 'acceptable' | 'neutral' | 'avoid';

export const VERDICT_SCORE: Record<Verdict, number> = {
  ideal: 100,
  acceptable: 60,
  neutral: 30,
  avoid: 0,
};

export function verdictFor(room: Room, zone: ZoneId): Verdict {
  if (room.ideal.includes(zone)) return 'ideal';
  if (room.avoid.includes(zone)) return 'avoid';
  if (room.acceptable.includes(zone)) return 'acceptable';
  return 'neutral';
}

export type Finding = {
  roomId: RoomId;
  zone: ZoneId;
  verdict: Verdict;
  score: number;
};

export type Analysis = {
  /** Weighted score 0-100, or `null` when nothing is placed yet. */
  score: number | null;
  findings: Finding[];
  unplaced: RoomId[];
};

export function analyse(placements: Placements): Analysis {
  const findings: Finding[] = [];
  const unplaced: RoomId[] = [];
  let weighted = 0;
  let totalWeight = 0;

  for (const room of ROOMS) {
    const zone = placements[room.id];
    if (!zone) {
      unplaced.push(room.id);
      continue;
    }
    const verdict = verdictFor(ROOM_BY_ID[room.id], zone);
    const score = VERDICT_SCORE[verdict];
    findings.push({ roomId: room.id, zone, verdict, score });
    weighted += score * room.weight;
    totalWeight += room.weight;
  }

  return {
    score: totalWeight === 0 ? null : Math.round(weighted / totalWeight),
    findings,
    unplaced,
  };
}

export type Grade = 'excellent' | 'good' | 'fair' | 'poor';

export function gradeFor(score: number): Grade {
  if (score >= 85) return 'excellent';
  if (score >= 65) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}
