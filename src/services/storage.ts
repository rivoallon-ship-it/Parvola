import type { StorageKey, StorageData } from '@/types';
import { STORAGE_CONFIG } from '@/constants/config';

// ============================================
// Service de Storage Abstrait
// Permet de basculer facilement entre localStorage et API backend
// ============================================

interface StorageProvider {
  get<K extends StorageKey>(key: K): Promise<StorageData[K] | null>;
  set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void>;
  remove(key: StorageKey): Promise<void>;
  clear(): Promise<void>;
}

// ---------- LocalStorage Provider ----------
class LocalStorageProvider implements StorageProvider {
  async get<K extends StorageKey>(key: K): Promise<StorageData[K] | null> {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as StorageData[K];
      }
      return null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  async set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      throw error;
    }
  }

  async remove(key: StorageKey): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    const keys = Object.values(STORAGE_CONFIG.keys);
    keys.forEach((key) => localStorage.removeItem(key));
  }
}

// ---------- API Provider ----------
class APIStorageProvider implements StorageProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<K extends StorageKey>(key: K): Promise<StorageData[K] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${key}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${key} from API:`, error);
      return null;
    }
  }

  async set<K extends StorageKey>(key: K, value: StorageData[K]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error saving ${key} to API:`, error);
      throw error;
    }
  }

  async remove(key: StorageKey): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/${key}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting ${key} from API:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    const keys = Object.values(STORAGE_CONFIG.keys);
    await Promise.all(keys.map((key) => this.remove(key as StorageKey)));
  }
}

// ---------- Storage Service Factory ----------
const createStorageProvider = (): StorageProvider => {
  if (STORAGE_CONFIG.mode === 'api') {
    return new APIStorageProvider(STORAGE_CONFIG.apiBaseUrl);
  }
  return new LocalStorageProvider();
};

// Export de l'instance unique du service
export const storageService = createStorageProvider();

// ---------- Fonctions utilitaires de haut niveau ----------
export const storage = {
  // Establishments
  getEstablishments: () => storageService.get('establishments'),
  setEstablishments: (data: StorageData['establishments']) => storageService.set('establishments', data),

  // Teams
  getTeams: () => storageService.get('teams'),
  setTeams: (data: StorageData['teams']) => storageService.set('teams', data),

  // Employees
  getEmployees: () => storageService.get('employees'),
  setEmployees: (data: StorageData['employees']) => storageService.set('employees', data),

  // Semesters
  getSemesters: () => storageService.get('semesters'),
  setSemesters: (data: StorageData['semesters']) => storageService.set('semesters', data),

  // Evaluations
  getEvaluations: () => storageService.get('evaluations'),
  setEvaluations: (data: StorageData['evaluations']) => storageService.set('evaluations', data),

  // Positions
  getPositions: () => storageService.get('positions'),
  setPositions: (data: StorageData['positions']) => storageService.set('positions', data),

  // Templates
  getTemplates: () => storageService.get('templates'),
  setTemplates: (data: StorageData['templates']) => storageService.set('templates', data),

  // Load all data
  loadAll: async (): Promise<StorageData> => {
    const [employees, semesters, evaluations, positions, templates, establishments, teams] = await Promise.all([
      storageService.get('employees'),
      storageService.get('semesters'),
      storageService.get('evaluations'),
      storageService.get('positions'),
      storageService.get('templates'),
      storageService.get('establishments'),
      storageService.get('teams'),
    ]);

    return {
      employees: employees || [],
      semesters: semesters || [],
      evaluations: evaluations || [],
      positions: positions || [],
      templates: templates || [],
      establishments: establishments || [],
      teams: teams || [],
    };
  },

  // Clear all data
  clearAll: () => storageService.clear(),
};

export default storage;
