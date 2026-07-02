import * as XLSX from 'xlsx';
import type { Employee, Semester, Objective, EvaluationStatus } from '@/types';
import { getRandomEmoji, getStatusLabel } from '@/utils/helpers';
import i18n from '@/i18n';

// ============================================
// Service d'import/export Excel
// ============================================

export interface ImportedEmployee {
  name: string;
  position: string;
  photo: string;
  email?: string;
  establishmentName?: string;
  teamName?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS = 5000;
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

/**
 * Parse un fichier Excel et extrait les employés.
 * Format attendu (1re ligne = en-têtes, ignorée) :
 *   A = Prénom, B = Nom, C = Poste, D = Email, E = Établissement, F = Équipe.
 * Rétrocompatible : ancien format 4 colonnes (poste en D) toujours accepté.
 */
export const parseEmployeesFromExcel = async (file: File): Promise<ImportedEmployee[]> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 5 MB)');
  }

  // Validate file extension
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file type. Accepted: .xlsx, .xls, .csv');
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  if (jsonData.length > MAX_ROWS) {
    throw new Error(`Too many rows (max ${MAX_ROWS})`);
  }

  const employees: ImportedEmployee[] = [];

  // Sanitize cell: strip leading formula characters
  const sanitizeCell = (val: unknown): string => {
    const s = val ? String(val).trim() : '';
    return s.replace(/^[=+\-@]/, '');
  };

  // Skip header row (index 0)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const firstName = sanitizeCell(row[0]);
    const lastName = sanitizeCell(row[1]);
    const colC = sanitizeCell(row[2]);
    const colD = sanitizeCell(row[3]);
    const colE = sanitizeCell(row[4]);
    const colF = sanitizeCell(row[5]);

    const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

    // Nouveau format : A=Prénom B=Nom C=Poste D=Email E=Établissement F=Équipe
    // Rétrocompat : ancien format avait le poste en D (colC vide + colD sans @)
    const position = colC || (looksLikeEmail(colD) ? '' : colD);
    const email = looksLikeEmail(colD) ? colD : '';
    const establishmentName = colE;
    const teamName = colF;

    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    if (fullName) {
      employees.push({
        name: fullName,
        position,
        photo: getRandomEmoji(),
        ...(email && { email }),
        ...(establishmentName && { establishmentName }),
        ...(teamName && { teamName }),
      });
    }
  }

  return employees;
};

/**
 * Génère et télécharge un modèle Excel d'import des employés
 * (ligne d'en-têtes + deux lignes d'exemple).
 */
export const downloadEmployeeTemplate = (): void => {
  const headers = [
    t('excel.templateFirstName'),
    t('excel.templateLastName'),
    t('excel.templatePosition'),
    t('excel.templateEmail'),
    t('excel.templateEstablishment'),
    t('excel.templateTeam'),
  ];
  const examples = [
    ['Sophie', 'Laurent', 'Cheffe de cuisine', 'sophie.laurent@restaurant.fr', 'Paris Centre', 'Cuisine'],
    ['Marc', 'Dubois', 'Serveur', 'marc.dubois@restaurant.fr', 'Paris Centre', 'Salle'],
  ];
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...examples]);
  worksheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 30 }, { wch: 22 }, { wch: 18 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t('excel.templateSheetName'));
  XLSX.writeFile(workbook, 'modele-import-employes.xlsx');
};

/**
 * Exporte une évaluation vers un format imprimable
 */
export interface ExportData {
  employee: Employee;
  semester: Semester;
  objectives: Objective[];
  bilanManager?: string;
  bilanEmployee?: string;
}

const t = (key: string) => i18n.t(key);

/** Escape user-provided strings before inserting them into HTML */
const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const generateExportHTML = (data: ExportData): string => {
  const { employee, semester, objectives, bilanManager, bilanEmployee } = data;

  const objectivesHTML = objectives
    .map(
      (obj, index) => `
    <div class="objective">
      <div class="objective-header">
        <span class="objective-number">${index + 1}.</span>
        <h3>${escapeHtml(obj.title || t('common.noTitle'))}</h3>
        <span class="status ${escapeHtml(obj.status)}">${escapeHtml(getStatusLabel(obj.status))}</span>
      </div>
      ${obj.description ? `<p class="description">${escapeHtml(obj.description)}</p>` : ''}
      <div class="progress-section">
        <span>${t('excel.progression')} ${Number(obj.progress)}%</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Number(obj.progress)}%"></div>
        </div>
      </div>
      ${obj.deadline ? `<p class="deadline">${t('excel.deadline')} ${escapeHtml(obj.deadline)}</p>` : ''}
      ${obj.comments ? `<p class="comments">${t('excel.comments')} ${escapeHtml(obj.comments)}</p>` : ''}
    </div>
  `
    )
    .join('');

  const bilanHTML = (bilanManager || bilanEmployee) ? `
    <div class="bilan-section">
      <h2>${t('excel.bilan')}</h2>
      ${bilanManager ? `
        <div class="bilan-block">
          <h4>${t('excel.managerComment')}</h4>
          <p>${escapeHtml(bilanManager)}</p>
        </div>
      ` : ''}
      ${bilanEmployee ? `
        <div class="bilan-block">
          <h4>${t('excel.employeeComment')}</h4>
          <p>${escapeHtml(bilanEmployee)}</p>
        </div>
      ` : ''}
    </div>
  ` : '';

  const signaturesHTML = `
    <div class="signatures-section">
      <div class="signature-block">
        <h4>${t('excel.employeeSignature')}</h4>
        <div class="signature-line"></div>
        <p class="signature-date">${t('excel.date')}</p>
      </div>
      <div class="signature-block">
        <h4>${t('excel.managerSignature')}</h4>
        <div class="signature-line"></div>
        <p class="signature-date">${t('excel.date')}</p>
      </div>
    </div>
  `;

  const locale = i18n.language || 'fr';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${t('excel.evaluation')} - ${escapeHtml(employee.name)} - ${escapeHtml(semester.name)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          margin: 40px;
          color: #2C2C2C;
          background: #FAF7F2;
        }
        .header {
          border-bottom: 3px solid #4AFFC3;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2C2C2C;
          margin: 0;
          font-size: 28px;
        }
        .header .subtitle {
          color: #666;
          margin-top: 5px;
        }
        .employee-info {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }
        .employee-photo {
          font-size: 48px;
        }
        .objective {
          background: #FFFFFF;
          border: 1px solid #D7D6D3;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .objective-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .objective-number {
          color: #4AFFC3;
          font-weight: bold;
          font-size: 1.2em;
        }
        .objective-header h3 {
          margin: 0;
          flex: 1;
        }
        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status.not_started { background: #f3f4f6; color: #374151; }
        .status.in_progress { background: #dbeafe; color: #1d4ed8; }
        .status.completed { background: #d1fae5; color: #047857; }
        .status.blocked { background: #fee2e2; color: #dc2626; }
        .description {
          color: #666;
          margin: 10px 0;
        }
        .progress-section {
          margin: 15px 0;
        }
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #D7D6D3;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 5px;
        }
        .progress-fill {
          height: 100%;
          background: #4AFFC3;
        }
        .deadline, .comments {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .bilan-section {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #D7D6D3;
        }
        .bilan-section h2 {
          color: #2C2C2C;
          margin-bottom: 20px;
        }
        .bilan-block {
          background: #FFFFFF;
          border: 1px solid #D7D6D3;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 15px;
        }
        .bilan-block h4 {
          color: #2C2C2C;
          margin: 0 0 10px 0;
          font-weight: 600;
        }
        .bilan-block p {
          color: #666;
          margin: 0;
          white-space: pre-wrap;
        }
        .signatures-section {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin-top: 60px;
          padding-top: 40px;
          border-top: 2px solid #D7D6D3;
        }
        .signature-block {
          flex: 1;
          text-align: center;
        }
        .signature-block h4 {
          color: #2C2C2C;
          margin: 0 0 30px 0;
          font-weight: 600;
        }
        .signature-line {
          border-bottom: 1px solid #2C2C2C;
          height: 60px;
          margin-bottom: 10px;
        }
        .signature-date {
          color: #666;
          font-size: 12px;
          margin: 0;
        }
        @media print {
          body { margin: 20px; background: white; }
          .signatures-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="employee-info">
          <span class="employee-photo">${escapeHtml(employee.photo)}</span>
          <div>
            <h1>${escapeHtml(employee.name)}</h1>
            <p class="subtitle">${escapeHtml(employee.position)}</p>
          </div>
        </div>
        <p class="subtitle">${t('excel.evaluation')} ${escapeHtml(semester.name)}</p>
      </div>

      <h2>${t('excel.objectives')} (${objectives.length})</h2>
      ${objectivesHTML || `<p>${t('excel.noObjectives')}</p>`}

      ${bilanHTML}

      ${signaturesHTML}

      <footer style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
        ${t('excel.generatedBy')} - ${new Date().toLocaleDateString(locale)}
      </footer>
    </body>
    </html>
  `;
};

/**
 * Ouvre une fenêtre d'impression avec les données d'export
 */
export const printExport = (data: ExportData): void => {
  const html = generateExportHTML(data);
  const printWindow = window.open('', '_blank');

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
};

// ============================================
// Synthèse de campagne (suivi RH — Lot C)
// ============================================
// Export d'avancement d'une campagne d'évaluation : une ligne par salarié
// (statut, objectifs, progression). Volontairement centré sur le SUIVI —
// pas de note 9-box ici, la matrice a sa propre vue.

export interface CampaignSummaryRow {
  employeeName: string;
  position: string;
  establishmentName: string;
  teamName: string;
  status: EvaluationStatus;
  statusLabel: string;
  objectiveCount: number;
  avgProgress: number;
  lastReminderAt?: string;
}

export interface CampaignSummaryData {
  semester: Semester;
  rows: CampaignSummaryRow[];
  counts: Record<EvaluationStatus, number>;
  generatedAt: string;
}

const STATUS_ROW_COLOR: Record<EvaluationStatus, string> = {
  not_started: '#9CA3AF',
  in_progress: '#3B82F6',
  submitted: '#F59E0B',
  validated: '#10B981',
};

const evalStatusI18nKey = (s: EvaluationStatus): string =>
  s === 'not_started' ? 'evaluationStatus.notStarted'
    : s === 'in_progress' ? 'evaluationStatus.inProgress'
    : `evaluationStatus.${s}`;

export const generateCampaignSummaryHTML = (data: CampaignSummaryData): string => {
  const { semester, rows, counts } = data;

  const countsHTML = (['validated', 'submitted', 'in_progress', 'not_started'] as EvaluationStatus[])
    .map(
      (s) => `
      <span class="count-chip">
        <span class="dot" style="background:${STATUS_ROW_COLOR[s]}"></span>
        ${escapeHtml(t(evalStatusI18nKey(s)))}: ${counts[s]}
      </span>`
    )
    .join('');

  const rowsHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.employeeName)}</td>
        <td>${escapeHtml(r.position)}</td>
        <td>${escapeHtml(r.establishmentName)}</td>
        <td>${escapeHtml(r.teamName)}</td>
        <td><span class="status-pill" style="background:${STATUS_ROW_COLOR[r.status]}">${escapeHtml(r.statusLabel)}</span></td>
        <td class="num">${r.objectiveCount}</td>
        <td class="num">${r.objectiveCount > 0 ? `${r.avgProgress}%` : '—'}</td>
        <td>${r.lastReminderAt ? escapeHtml(new Date(r.lastReminderAt).toLocaleDateString(i18n.language || 'fr')) : '—'}</td>
      </tr>`
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="${i18n.language || 'fr'}">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(t('campaignFollowUp.exportTitle'))} — ${escapeHtml(semester.name)}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; margin: 40px; color: #2C2C2C; }
        .header { border-bottom: 3px solid #008D7E; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header .subtitle { color: #555; margin-top: 4px; font-size: 14px; }
        .counts { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; font-size: 13px; }
        .count-chip { display: inline-flex; align-items: center; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #E5E7EB; }
        th { color: #555; font-weight: 600; background: #F9FAFB; }
        td.num { text-align: right; }
        .status-pill { color: #fff; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .footer { margin-top: 24px; font-size: 11px; color: #999; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(t('campaignFollowUp.exportTitle'))}</h1>
        <p class="subtitle">${escapeHtml(semester.name)} — ${escapeHtml(t('campaignFollowUp.generatedAt'))} ${escapeHtml(new Date(data.generatedAt).toLocaleDateString(i18n.language || 'fr'))}</p>
      </div>
      <div class="counts">${countsHTML}</div>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t('campaignFollowUp.colEmployee'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colPosition'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colEstablishment'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colTeam'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colStatus'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colObjectives'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colProgress'))}</th>
            <th>${escapeHtml(t('campaignFollowUp.colLastReminder'))}</th>
          </tr>
        </thead>
        <tbody>${rowsHTML}</tbody>
      </table>
      <p class="footer">${escapeHtml(t('campaignFollowUp.exportFooter'))}</p>
    </body>
    </html>`;
};

export const printCampaignSummary = (data: CampaignSummaryData): void => {
  const html = generateCampaignSummaryHTML(data);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }
};
