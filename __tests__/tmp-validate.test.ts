import { dayPanchang, tamilDate } from '../src/core/astro/panchang';
import { placeById } from '../src/core/astro/places';
import { specialDays } from '../src/core/astro/specialDays';
import { addDays, weekdayOf, type CivilDate } from '../src/core/astro/time';
import { NAKSHATRAS, TAMIL_MONTHS, tithiName } from '../src/core/astro/names';
import { PURPOSE_BY_ID } from '../src/features/nalla-naal/data/purposes';
import { judgeDay } from '../src/features/nalla-naal/logic';

const chennai = placeById('chennai');
const ymd = (m: number, d: number): CivilDate => ({ y: 2026, m, d });
const key = (c: CivilDate) => `${c.m}-${c.d}`;

const POURNAMI = ['1-3','2-1','3-3','4-1','5-1','5-31','6-29','7-29','8-27','9-26','10-25','11-24','12-23'];
const AMAVASAI = ['1-18','2-17','3-18','4-17','5-16','6-14','7-14','8-12','9-10','10-10','11-8','12-8'];
const KARINAAL = ['1-15','1-16','1-17','1-25','1-31','2-27','2-28','3-1','3-20','3-29','4-2','4-19','4-28','5-21','5-30','5-31','6-15','6-20','7-18','7-26','8-5','8-19','8-26','9-14','10-3','10-16','10-23','11-6','11-17','11-23','11-26','12-3','12-21','12-24'];
const MUHURTHAM = ['1-28','2-6','2-8','2-13','2-15','2-16','2-20','3-5','3-6','3-8','3-15','3-16','3-25','4-6','4-12','4-13','4-16','4-20','4-23','4-30','5-8','5-13','5-14','5-18','5-28','5-29','6-4','6-7','6-17','6-18','6-24','6-25','7-2','7-5','7-12','8-23','8-30','8-31','9-7','9-13','9-17','10-25','10-30','11-1','11-11','11-13','11-15','11-16','11-20','11-29','12-4','12-6','12-10','12-13','12-14'];

it('validate', () => {
  const out: string[] = [];
  const days: { c: CivilDate; id: string; p: ReturnType<typeof dayPanchang> }[] = [];
  let c = ymd(1, 1);
  while (c.y === 2026) { days.push({ c, id: key(c), p: dayPanchang(c, chennai) }); c = addDays(c, 1); }

  const found = (id: string) => days.filter((d) => specialDays(d.p).some((s) => s.id === id)).map((d) => d.id);
  const diff = (name: string, ours: string[], theirs: string[]) => {
    out.push(`${name}: ours ${ours.length}, theirs ${theirs.length}; only ours [${ours.filter((x) => !theirs.includes(x))}] only theirs [${theirs.filter((x) => !ours.includes(x))}]`);
  };
  diff('pournami', found('pournami'), POURNAMI);
  diff('amavasai', found('amavasai'), AMAVASAI);
  out.push('pradosham ours: ' + found('pradosham').join(' '));
  out.push('sankashti ours: ' + found('sankashti').join(' '));
  out.push('vinayaka ours: ' + found('vinayakaChaturthi').join(' '));
  out.push('shashti ours: ' + found('shashti').join(' '));
  out.push('karthigai ours: ' + [...found('karthigai'), ...found('karthigaiDeepam')].join(' '));

  // karinaal: Tamil month/day by our engine for the site's dates
  const kari: Record<string, string[]> = {};
  for (const id of KARINAAL) {
    const d = days.find((x) => x.id === id)!;
    const t = d.p.tamil;
    (kari[TAMIL_MONTHS[t.month].en] ||= []).push(`${t.day}(${id})`);
  }
  out.push('karinaal by our Tamil date: ' + JSON.stringify(kari));

  // muhurtham analysis
  const mar = PURPOSE_BY_ID.marriage;
  const none = { birthNakshatra: null, birthRashi: null };
  const wd: number[] = [0,0,0,0,0,0,0];
  const nak: Record<string, number> = {};
  const tith: Record<number, number> = {};
  const rows: string[] = [];
  let hit = 0;
  for (const id of MUHURTHAM) {
    const d = days.find((x) => x.id === id)!;
    const v = judgeDay(d.p, mar, none);
    wd[v.weekday]++;
    nak[NAKSHATRAS[v.nakshatra].en] = (nak[NAKSHATRAS[v.nakshatra].en] || 0) + 1;
    const pos = (v.tithi % 15) + 1;
    tith[pos] = (tith[pos] || 0) + (1);
    if (v.score >= 60) hit++;
    rows.push(`${id} wd${v.weekday} tithi${v.tithi}(${tithiName(v.tithi).en}) nak${v.nakshatra}(${NAKSHATRAS[v.nakshatra].en}) month${v.tamil.month} score${v.score}`);
  }
  out.push(`muhurtham: our marriage score >=60 on ${hit}/${MUHURTHAM.length}`);
  out.push('weekday counts Sun..Sat ' + wd.join(','));
  out.push('nakshatra counts ' + JSON.stringify(nak));
  out.push('tithi position counts ' + JSON.stringify(tith));
  // how many non-listed days we call good
  const good = days.filter((d) => judgeDay(d.p, mar, none).score >= 60).map((d) => d.id);
  out.push(`our good marriage days: ${good.length}; of those listed by site: ${good.filter((g) => MUHURTHAM.includes(g)).length}`);
  out.push(rows.join('\n'));
  console.log(out.join('\n'));
});
