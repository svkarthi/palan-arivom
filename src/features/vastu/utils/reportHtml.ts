import i18n, { type Lang } from '@core/i18n';
import { ROOM_BY_ID } from '../data/rooms';
import { ZONE_BY_ID } from '../data/zones';
import { gradeFor, type Analysis } from './scoring';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const VERDICT_COLOR = { ideal: '#2E7D32', acceptable: '#B7791F', neutral: '#8D7B68', avoid: '#C62828' };

/** Printable report; Tamil text relies on the system font of the print WebView. */
export function buildReportHtml(analysis: Analysis, lang: Lang, date: string): string {
  const t = i18n.getFixedT(lang, 'vastu');
  const score = analysis.score;

  const rows = analysis.findings
    .map((f) => {
      const room = ROOM_BY_ID[f.roomId];
      const zone = ZONE_BY_ID[f.zone];
      const color = VERDICT_COLOR[f.verdict];
      const tip =
        f.verdict === 'avoid' || f.verdict === 'neutral'
          ? `<div class="tip">${escapeHtml(room.remedy[lang])}</div>`
          : '';
      return `<tr>
        <td>${escapeHtml(room.name[lang])}</td>
        <td>${escapeHtml(zone.name[lang])}</td>
        <td style="color:${color};font-weight:bold">${escapeHtml(t(`report.verdict.${f.verdict}`))}</td>
        <td>${f.score}${tip}</td>
      </tr>`;
    })
    .join('');

  const unplaced = analysis.unplaced.map((id) => escapeHtml(ROOM_BY_ID[id].name[lang])).join(', ');

  return `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, 'Noto Sans Tamil', 'Tamil Sangam MN', sans-serif; color: #2B1B10; padding: 24px; }
  h1 { color: #7A1F1F; margin-bottom: 4px; }
  .score { font-size: 44px; font-weight: bold; color: #B4410B; }
  table { border-collapse: collapse; width: 100%; margin-top: 16px; }
  th, td { border: 1px solid #EBDDC8; padding: 8px; text-align: left; vertical-align: top; font-size: 14px; }
  th { background: #FFF3E0; }
  .tip { font-weight: normal; color: #7B6A5A; font-size: 12px; margin-top: 4px; }
  .note { margin-top: 24px; font-size: 12px; color: #7B6A5A; }
</style></head><body>
<h1>${escapeHtml(t('report.pdfHeading'))}</h1>
<div>${escapeHtml(t('report.generatedOn', { date }))}</div>
<p>${escapeHtml(t('report.score'))}: <span class="score">${score ?? '—'}</span>${
    score === null ? '' : ` — ${escapeHtml(t(`report.grade.${gradeFor(score)}`))}`
  }</p>
<table>
  <tr><th>${escapeHtml(t('guide.rooms'))}</th><th>${escapeHtml(t('tabs.plan'))}</th><th></th><th>${escapeHtml(t('report.score'))}</th></tr>
  ${rows}
</table>
${unplaced ? `<p><b>${escapeHtml(t('report.unplaced'))}:</b> ${unplaced}</p>` : ''}
<p class="note">${escapeHtml(t('report.disclaimer'))}</p>
</body></html>`;
}
