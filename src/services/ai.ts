import type { AISuggestedObjective, AISuggestedTemplate, Employee, Semester, Position } from '@/types';
import { AI_CONFIG } from '@/constants/config';
import { parseAIResponse } from '@/utils/helpers';

// ============================================
// Service d'Intelligence Artificielle (Anthropic)
// ============================================

interface AIResponse {
  content: Array<{ type: string; text?: string }>;
}

/**
 * Appelle l'API Anthropic avec un prompt
 */
const callAnthropicAPI = async (prompt: string): Promise<string> => {
  // Utilise le proxy Vite en développement pour éviter les erreurs CORS
  const apiUrl = '/api/anthropic/v1/messages';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_CONFIG.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      max_tokens: AI_CONFIG.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data: AIResponse = await response.json();
  return data.content
    ?.map((item) => (item.type === 'text' ? item.text : ''))
    .filter(Boolean)
    .join('\n') || '';
};

/**
 * Génère des objectifs SMART pour un employé
 */
export const generateObjectives = async (
  employee: Employee,
  semester: Semester | null,
  userPrompt: string
): Promise<AISuggestedObjective[]> => {
  const prompt = `Tu es un assistant RH expert en définition d'objectifs professionnels.

Contexte:
- Employé: ${employee.name}
- Poste: ${employee.position}
- Semestre: ${semester?.name || 'Non spécifié'}

Demande de l'utilisateur: ${userPrompt}

Instructions:
- Génère 3 à 5 objectifs SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel)
- Les objectifs doivent être pertinents pour le poste et la demande
- Retourne UNIQUEMENT un tableau JSON valide, sans texte explicatif

Format de sortie (JSON uniquement):
[
  {
    "title": "Titre court de l'objectif",
    "description": "Description détaillée incluant les critères de succès",
    "deadline": "2024-06-30"
  }
]`;

  try {
    const text = await callAnthropicAPI(prompt);
    return parseAIResponse<AISuggestedObjective>(text);
  } catch (error) {
    console.error('Error generating objectives:', error);
    throw error;
  }
};

/**
 * Génère des templates d'objectifs pour un poste
 */
export const generateTemplates = async (
  position: Position,
  userPrompt: string
): Promise<AISuggestedTemplate[]> => {
  const prompt = `Tu es un assistant RH expert en définition d'objectifs professionnels.

Contexte:
- Poste: ${position.name}
- Description du poste: ${position.description || 'Non spécifiée'}

Demande de l'utilisateur: ${userPrompt}

Instructions:
- Génère 3 à 5 templates d'objectifs SMART réutilisables
- Les templates doivent être génériques pour pouvoir s'appliquer à différents employés du même poste
- Retourne UNIQUEMENT un tableau JSON valide, sans texte explicatif

Format de sortie (JSON uniquement):
[
  {
    "title": "Titre court du template",
    "description": "Description détaillée du template d'objectif",
    "suggestedDeadlineDays": 90
  }
]`;

  try {
    const text = await callAnthropicAPI(prompt);
    return parseAIResponse<AISuggestedTemplate>(text);
  } catch (error) {
    console.error('Error generating templates:', error);
    throw error;
  }
};

/**
 * Analyse un objectif et suggère des améliorations
 */
export const analyzeObjective = async (
  objective: { title: string; description: string },
  employeePosition: string
): Promise<string> => {
  const prompt = `Tu es un assistant RH expert en définition d'objectifs SMART.

Objectif à analyser:
- Titre: ${objective.title}
- Description: ${objective.description}
- Poste de l'employé: ${employeePosition}

Analyse cet objectif et suggère des améliorations pour le rendre plus SMART (Spécifique, Mesurable, Atteignable, Réaliste, Temporel).

Retourne une réponse concise en français avec tes suggestions.`;

  try {
    return await callAnthropicAPI(prompt);
  } catch (error) {
    console.error('Error analyzing objective:', error);
    throw error;
  }
};

export const aiService = {
  generateObjectives,
  generateTemplates,
  analyzeObjective,
};

export default aiService;
