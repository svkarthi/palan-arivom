import { ROOM_BY_ID, ROOMS } from '../src/features/vastu/data/rooms';
import { ZONES } from '../src/features/vastu/data/zones';
import { analyse, gradeFor, verdictFor } from '../src/features/vastu/utils/scoring';

describe('room rules', () => {
  it.each(ROOMS)('$id has no zone listed in more than one category', (room) => {
    const all = [...room.ideal, ...room.acceptable, ...room.avoid];
    expect(new Set(all).size).toBe(all.length);
  });

  it('only references real zones', () => {
    const valid = new Set<string>([...ZONES.map((z) => z.id), 'C']);
    for (const room of ROOMS) {
      for (const z of [...room.ideal, ...room.acceptable, ...room.avoid]) expect(valid.has(z)).toBe(true);
    }
  });
});

describe('verdictFor', () => {
  it('classifies zones', () => {
    expect(verdictFor(ROOM_BY_ID.kitchen, 'SE')).toBe('ideal');
    expect(verdictFor(ROOM_BY_ID.kitchen, 'NW')).toBe('acceptable');
    expect(verdictFor(ROOM_BY_ID.kitchen, 'NE')).toBe('avoid');
    expect(verdictFor(ROOM_BY_ID.kitchen, 'N')).toBe('neutral');
  });
});

describe('analyse', () => {
  it('returns a null score when nothing is placed', () => {
    const result = analyse({});
    expect(result.score).toBeNull();
    expect(result.unplaced).toHaveLength(ROOMS.length);
  });

  it('scores a perfect placement as 100', () => {
    expect(analyse({ kitchen: 'SE', pooja: 'NE' }).score).toBe(100);
  });

  it('weights key rooms double', () => {
    // kitchen (weight 2, ideal=100) + study (weight 1, avoid=0) => 200 / 3
    expect(analyse({ kitchen: 'SE', study: 'SE' }).score).toBe(67);
  });

  it('lists placed and unplaced rooms', () => {
    const result = analyse({ kitchen: 'SE' });
    expect(result.findings.map((f) => f.roomId)).toEqual(['kitchen']);
    expect(result.unplaced).not.toContain('kitchen');
  });
});

describe('gradeFor', () => {
  it('maps score bands', () => {
    expect(gradeFor(90)).toBe('excellent');
    expect(gradeFor(70)).toBe('good');
    expect(gradeFor(50)).toBe('fair');
    expect(gradeFor(10)).toBe('poor');
  });
});
