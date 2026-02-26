// Re-export de tous les services
export { storage, storageService } from './storage';
export { aiService, generateObjectives, generateTemplates, analyzeObjective } from './ai';
export {
  parseEmployeesFromExcel,
  convertToEmployees,
  generateExportHTML,
  printExport,
  type ImportedEmployee,
  type ExportData,
} from './excel';
