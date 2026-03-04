// Re-export de tous les services
export { aiService, generateObjectives, generateTemplates, analyzeObjective } from './ai';
export {
  parseEmployeesFromExcel,
  generateExportHTML,
  printExport,
  type ImportedEmployee,
  type ExportData,
} from './excel';
