/**
 * Every static translation key used in the source must exist in both languages, otherwise the
 * app shows the raw key (for example "basis.label") instead of text.
 */
import * as fs from 'fs';
import * as path from 'path';

import i18n from '../src/core/i18n';

const SRC = path.join(__dirname, '..', 'src');

const files = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? files(full) : /\.(ts|tsx)$/.test(e.name) ? [full] : [];
  });

/** Namespace used by a file: the argument of useTranslation / getFixedT, else the default one. */
function namespaceOf(source: string): string {
  const m = /useTranslation\('([^']+)'\)/.exec(source) ?? /getFixedT\([^,]+,\s*'([^']+)'\)/.exec(source);
  return m ? m[1] : 'translation';
}

describe('translation keys', () => {
  const used: { file: string; ns: string; key: string }[] = [];
  for (const file of files(SRC)) {
    const source = fs.readFileSync(file, 'utf8');
    const ns = namespaceOf(source);
    for (const m of source.matchAll(/\bt\(\s*'([A-Za-z0-9_.]+)'/g)) {
      // A key can name its own namespace as the next argument: t('key', { ns: '...' }).
      const rest = source.slice(m.index! + m[0].length);
      const own = /^\s*,\s*\{\s*ns:\s*'([^']+)'/.exec(rest);
      used.push({ file: path.relative(SRC, file), ns: own ? own[1] : ns, key: m[1] });
    }
  }

  it('finds a reasonable number of keys', () => {
    expect(used.length).toBeGreaterThan(150);
  });

  it.each(['ta', 'en'])('has every static key in %s (with fallback to the core namespace)', async (lng) => {
    await i18n.changeLanguage(lng);
    const missing = used.filter(({ ns, key }) => !i18n.exists(key, { lng, ns }));
    expect(missing.map((m) => `${m.file}: ${m.ns}:${m.key}`)).toEqual([]);
  });

  // Keys built at run time (t(`group.${value}`)) cannot be found by reading the source, so list them.
  const dynamic: { ns: string; keys: string[] }[] = [
    { ns: 'nallaNaal', keys: [
      ...['goodTithi', 'badTithi', 'amavasai', 'goodNakshatra', 'badNakshatra', 'badYoga', 'vishti', 'goodWeekday', 'badWeekday', 'avoidMonth', 'cautionMonth', 'karinaal', 'taraGood', 'taraBad', 'chandraGood', 'chandraBad', 'chandrashtama'].map((c) => `reason.${c}`),
      ...['excellent', 'good', 'fair', 'poor'].map((g) => `grade.${g}`),
    ] },
    { ns: 'nallaNeram', keys: [
      ...['good', 'rahu', 'yama', 'kuligai', 'neutral'].map((k) => `now.${k}`),
      ...['rahu', 'yama', 'kuligai'].map((k) => `avoid.${k}`),
      ...['good', 'mixed', 'avoid'].map((k) => `hora.quality.${k}`),
      'panchang.shukla', 'panchang.krishna',
    ] },
    { ns: 'vastu', keys: [
      ...['excellent', 'good', 'fair', 'poor'].map((g) => `report.grade.${g}`),
      ...['ideal', 'acceptable', 'neutral', 'avoid'].map((v) => `report.verdict.${v}`),
    ] },
  ];

  it.each(['ta', 'en'])('has every run-time key in %s', async (lng) => {
    await i18n.changeLanguage(lng);
    const missing = dynamic.flatMap(({ ns, keys }) => keys.filter((k) => !i18n.exists(k, { lng, ns })).map((k) => `${ns}:${k}`));
    expect(missing).toEqual([]);
  });
});
