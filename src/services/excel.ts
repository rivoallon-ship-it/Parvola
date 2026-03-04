import * as XLSX from 'xlsx';
import type { Employee, Semester, Objective } from '@/types';
import { getRandomEmoji, getStatusLabel } from '@/utils/helpers';
import i18n from '@/i18n';

// ============================================
// Service d'import/export Excel
// ============================================

export interface ImportedEmployee {
  name: string;
  position: string;
  photo: string;
}

/**
 * Parse un fichier Excel et extrait les employés
 * Format attendu: Colonne A = Prénom, Colonne B = Nom, Colonne D = Poste
 */
export const parseEmployeesFromExcel = async (file: File): Promise<ImportedEmployee[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

  const employees: ImportedEmployee[] = [];

  // Skip header row (index 0)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const col1 = row[0] ? String(row[0]).trim() : '';
    const col2 = row[1] ? String(row[1]).trim() : '';
    const col4 = row[3] ? String(row[3]).trim() : '';

    const fullName = [col1, col2].filter(Boolean).join(' ').trim();

    if (fullName) {
      employees.push({
        name: fullName,
        position: col4,
        photo: getRandomEmoji(),
      });
    }
  }

  return employees;
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

export const generateExportHTML = (data: ExportData): string => {
  const { employee, semester, objectives, bilanManager, bilanEmployee } = data;

  const objectivesHTML = objectives
    .map(
      (obj, index) => `
    <div class="objective">
      <div class="objective-header">
        <span class="objective-number">${index + 1}.</span>
        <h3>${obj.title || t('common.noTitle')}</h3>
        <span class="status ${obj.status}">${getStatusLabel(obj.status)}</span>
      </div>
      ${obj.description ? `<p class="description">${obj.description}</p>` : ''}
      <div class="progress-section">
        <span>${t('excel.progression')} ${obj.progress}%</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${obj.progress}%"></div>
        </div>
      </div>
      ${obj.deadline ? `<p class="deadline">${t('excel.deadline')} ${obj.deadline}</p>` : ''}
      ${obj.comments ? `<p class="comments">${t('excel.comments')} ${obj.comments}</p>` : ''}
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
          <p>${bilanManager}</p>
        </div>
      ` : ''}
      ${bilanEmployee ? `
        <div class="bilan-block">
          <h4>${t('excel.employeeComment')}</h4>
          <p>${bilanEmployee}</p>
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
      <title>${t('excel.evaluation')} - ${employee.name} - ${semester.name}</title>
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
          <span class="employee-photo">${employee.photo}</span>
          <div>
            <h1>${employee.name}</h1>
            <p class="subtitle">${employee.position}</p>
          </div>
        </div>
        <p class="subtitle">${t('excel.evaluation')} ${semester.name}</p>
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
