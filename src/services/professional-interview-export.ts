import type { Employee, ProfessionalCampaign, ProfessionalInterview } from '@/types';
import { getProfessionalInterviewFinalContent } from '@/utils/helpers';
import i18n from '@/i18n';

// ============================================
// Compte-rendu d'entretien professionnel (EPP)
// ============================================
// Export dédié à l'EPP, VOLONTAIREMENT séparé de l'export des évaluations de
// performance (src/services/excel.ts). Aucun rating, aucune 9-box, aucun
// vocabulaire de performance : uniquement les sections légales de l'EPP, les
// signatures et les dates (preuve de tenue et de remise).
//
// Le contenu provient du snapshot figé à la double signature quand il existe
// (voir migration 012 / getProfessionalInterviewFinalContent) ; à défaut, des
// champs vivants — de sorte qu'un compte-rendu émis après signature reflète
// exactement ce qui a été signé.

const t = (key: string, options?: Record<string, unknown>): string => i18n.t(key, options);

/** Échappement HTML local (pas de couplage avec l'export des évaluations). */
const escapeHtml = (value: string | undefined | null): string =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDateTime = (iso?: string): string => {
  if (!iso) return '';
  const locale = i18n.language || 'fr';
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
};

/** N'affiche que les data-URL d'image, sinon rien (prudence anti-injection). */
const safeSignatureImg = (dataUrl?: string): string => {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return '';
  return `<img class="signature-img" src="${dataUrl}" alt="" />`;
};

const section = (title: string, body: string): string =>
  body.trim()
    ? `<section class="section"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body).replace(/\n/g, '<br/>')}</p></section>`
    : '';

export interface ProfessionalInterviewReportData {
  interview: ProfessionalInterview;
  employee: Employee;
  campaign: ProfessionalCampaign;
}

export const generateProfessionalInterviewReportHTML = (
  data: ProfessionalInterviewReportData
): string => {
  const { interview, employee, campaign } = data;
  const content = getProfessionalInterviewFinalContent(interview);

  const mobilityLabel = t(`professionalInterview.mobility.${content.evolutionMobility}`);

  const sectionsHTML = [
    section(t('professionalInterview.section.careerReview'), content.careerReview),
    section(t('professionalInterview.skillsAcquired'), content.skillsAcquired),
    section(
      t('professionalInterview.section.evolution'),
      `${t('professionalInterview.evolutionMobility')} : ${mobilityLabel}\n${content.evolutionNotes}`
    ),
    section(t('professionalInterview.section.training'), content.trainingWishes),
    section(t('professionalInterview.section.conclusions'), content.conclusions),
    section(t('professionalInterview.managerComment'), content.managerComment),
    section(t('professionalInterview.employeeComment'), content.employeeComment),
  ].join('');

  const deliveryHTML = interview.deliveredAt
    ? `<p class="meta-line">${escapeHtml(t('professionalReport.deliveredOn'))} ${escapeHtml(formatDateTime(interview.deliveredAt))}</p>`
    : '';

  const signaturesHTML = `
    <section class="signatures">
      <div class="signature-block">
        <h3>${escapeHtml(t('professionalInterview.employeeSignature'))}</h3>
        ${safeSignatureImg(interview.employeeSignature)}
        <p class="signature-name">${escapeHtml(content.employeeSignatureName || '')}</p>
        <p class="signature-date">${content.employeeSignedAt ? escapeHtml(t('professionalInterview.signedOn') + ' ' + formatDateTime(content.employeeSignedAt)) : escapeHtml(t('professionalInterview.notSigned'))}</p>
      </div>
      <div class="signature-block">
        <h3>${escapeHtml(t('professionalInterview.managerSignature'))}</h3>
        ${safeSignatureImg(interview.managerSignature)}
        <p class="signature-name">${escapeHtml(content.managerSignatureName || '')}</p>
        <p class="signature-date">${content.managerSignedAt ? escapeHtml(t('professionalInterview.signedOn') + ' ' + formatDateTime(content.managerSignedAt)) : escapeHtml(t('professionalInterview.notSigned'))}</p>
      </div>
    </section>`;

  const scheduleLine = interview.conductedAt || interview.scheduledAt
    ? `<p class="meta-line">${escapeHtml(t('professionalReport.heldOn'))} ${escapeHtml(formatDateTime(interview.conductedAt || interview.scheduledAt))}</p>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="${i18n.language || 'fr'}">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(t('professionalReport.title'))} — ${escapeHtml(employee.name)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 40px; color: #2C2C2C; background: #FFFFFF; }
        .header { border-bottom: 3px solid #008D7E; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 26px; color: #2C2C2C; }
        .header .subtitle { color: #555; margin-top: 4px; font-size: 14px; }
        .meta { margin-bottom: 24px; }
        .meta-line { margin: 2px 0; color: #444; font-size: 14px; }
        .employee { font-size: 18px; font-weight: 600; margin: 0 0 2px; }
        .section { border: 1px solid #D7D6D3; border-radius: 12px; padding: 16px 20px; margin-bottom: 16px; }
        .section h2 { font-size: 15px; margin: 0 0 8px; color: #008D7E; }
        .section p { margin: 0; line-height: 1.5; white-space: normal; }
        .signatures { display: flex; gap: 24px; margin-top: 28px; }
        .signature-block { flex: 1; border: 1px solid #D7D6D3; border-radius: 12px; padding: 16px; text-align: center; }
        .signature-block h3 { font-size: 13px; margin: 0 0 10px; color: #555; }
        .signature-img { max-height: 90px; max-width: 100%; }
        .signature-name { font-weight: 600; margin: 6px 0 0; }
        .signature-date { font-size: 12px; color: #777; margin: 2px 0 0; }
        .footer { margin-top: 28px; font-size: 11px; color: #999; text-align: center; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(t('professionalReport.title'))}</h1>
        <p class="subtitle">${escapeHtml(t('professionalReport.subtitle'))}</p>
      </div>
      <div class="meta">
        <p class="employee">${escapeHtml(employee.name)}</p>
        <p class="meta-line">${escapeHtml(employee.position)}</p>
        <p class="meta-line">${escapeHtml(campaign.name)}</p>
        ${scheduleLine}
        ${deliveryHTML}
      </div>
      ${sectionsHTML}
      ${signaturesHTML}
      <p class="footer">${escapeHtml(t('professionalReport.footer'))}</p>
    </body>
    </html>`;
};

export const printProfessionalInterviewReport = (data: ProfessionalInterviewReportData): void => {
  const html = generateProfessionalInterviewReportHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
};
