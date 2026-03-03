import type { AISuggestedObjective, AISuggestedTemplate, InterviewGuide, Employee, Semester, Evaluation, Position } from '@/types';
import { AI_CONFIG, AI_INTERVIEW_GUIDE_CONFIG } from '@/constants/config';
import { parseAIResponse } from '@/utils/helpers';
import i18n from '@/i18n';

// ============================================
// Service d'Intelligence Artificielle (Anthropic)
// ============================================

interface AIResponse {
  content: Array<{ type: string; text?: string }>;
}

interface AIModelConfig {
  model: string;
  maxTokens: number;
  apiKey: string;
}

/**
 * Appelle l'API Anthropic avec un prompt et une config
 */
const callAnthropicAPIWithConfig = async (prompt: string, config: AIModelConfig): Promise<string> => {
  const apiUrl = '/api/anthropic/v1/messages';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API error: ${response.status} — ${errorBody}`);
  }

  const data: AIResponse = await response.json();
  return data.content
    ?.map((item) => (item.type === 'text' ? item.text : ''))
    .filter(Boolean)
    .join('\n') || '';
};

/**
 * Appelle l'API Anthropic avec le modèle par défaut (Sonnet)
 */
const callAnthropicAPI = async (prompt: string): Promise<string> => {
  return callAnthropicAPIWithConfig(prompt, AI_CONFIG);
};

const t = (key: string) => i18n.t(key);

/**
 * Génère des objectifs SMART pour un employé
 */
export const generateObjectives = async (
  employee: Employee,
  semester: Semester | null,
  userPrompt: string
): Promise<AISuggestedObjective[]> => {
  const prompt = `${t('aiPrompt.systemRole')}

${t('aiPrompt.context')}
- ${t('aiPrompt.employee')} ${employee.name}
- ${t('aiPrompt.position')} ${employee.position}
- ${t('aiPrompt.semester')} ${semester?.name || t('aiPrompt.notSpecified')}

${t('aiPrompt.userRequest')} ${userPrompt}

${t('aiPrompt.instructions')}
- ${t('aiPrompt.generateSMART')}
- ${t('aiPrompt.relevantObjectives')}
- ${t('aiPrompt.jsonOnly')}

${t('aiPrompt.outputFormat')}
[
  {
    "title": "${t('aiPrompt.shortTitle')}",
    "description": "${t('aiPrompt.detailedDescription')}",
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
  const prompt = `${t('aiPrompt.systemRole')}

${t('aiPrompt.context')}
- ${t('aiPrompt.position')} ${position.name}
- ${t('aiPrompt.positionDescription')} ${position.description || t('aiPrompt.notSpecifiedFeminine')}

${t('aiPrompt.userRequest')} ${userPrompt}

${t('aiPrompt.instructions')}
- ${t('aiPrompt.generateTemplates')}
- ${t('aiPrompt.genericTemplates')}
- ${t('aiPrompt.jsonOnly')}

${t('aiPrompt.outputFormat')}
[
  {
    "title": "${t('aiPrompt.shortTemplateTitle')}",
    "description": "${t('aiPrompt.detailedTemplateDescription')}",
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
  const prompt = `${t('aiPrompt.smartExpert')}

${t('aiPrompt.objectiveToAnalyze')}
- ${t('aiPrompt.objectiveTitle')} ${objective.title}
- ${t('aiPrompt.objectiveDescription')} ${objective.description}
- ${t('aiPrompt.employeePosition')} ${employeePosition}

${t('aiPrompt.analyzeInstruction')}

${t('aiPrompt.respondInFrench')}`;

  try {
    return await callAnthropicAPI(prompt);
  } catch (error) {
    console.error('Error analyzing objective:', error);
    throw error;
  }
};

/**
 * Génère un guide d'entretien pour un manager
 */
export const generateInterviewGuide = async (
  employee: Employee,
  semester: Semester | null,
  evaluation: Evaluation | null
): Promise<InterviewGuide> => {
  const objectives = evaluation?.objectives || [];

  const objectivesSummary = objectives.length > 0
    ? objectives.map((obj, i) =>
        `${i + 1}. "${obj.title}" — ${t('interviewGuidePrompt.status')}: ${obj.status}, ${t('interviewGuidePrompt.progress')}: ${obj.progress}%${obj.deadline ? `, ${t('interviewGuidePrompt.deadline')}: ${obj.deadline}` : ''}${obj.comments ? `, ${t('interviewGuidePrompt.comments')}: ${obj.comments}` : ''}${obj.evaluation ? `, ${t('interviewGuidePrompt.evalNote')}: ${obj.evaluation}` : ''}`
      ).join('\n')
    : t('interviewGuidePrompt.noObjectives');

  const completed = objectives.filter(o => o.status === 'completed').length;
  const inProgress = objectives.filter(o => o.status === 'in_progress').length;
  const blocked = objectives.filter(o => o.status === 'blocked').length;
  const notStarted = objectives.filter(o => o.status === 'not_started').length;

  const prompt = `${t('interviewGuidePrompt.systemRole')}

${t('interviewGuidePrompt.context')}
- ${t('interviewGuidePrompt.employee')} ${employee.name}
- ${t('interviewGuidePrompt.position')} ${employee.position}
- ${t('interviewGuidePrompt.semester')} ${semester?.name || t('aiPrompt.notSpecified')}
- ${t('interviewGuidePrompt.salary')} ${employee.salary !== undefined ? `${employee.salary.toLocaleString('fr-FR')} EUR` : t('aiPrompt.notSpecified')}
- ${t('interviewGuidePrompt.lateCount')} ${employee.lateCount ?? t('aiPrompt.notSpecified')}
- ${t('interviewGuidePrompt.unjustifiedAbsences')} ${employee.unjustifiedAbsences ?? t('aiPrompt.notSpecified')}
- ${t('interviewGuidePrompt.justifiedAbsences')} ${employee.justifiedAbsences ?? t('aiPrompt.notSpecified')}

${t('interviewGuidePrompt.objectivesTitle')}
${objectivesSummary}

${t('interviewGuidePrompt.objectivesStats')}
- ${t('interviewGuidePrompt.total')} ${objectives.length}
- ${t('interviewGuidePrompt.completedCount')} ${completed}
- ${t('interviewGuidePrompt.inProgressCount')} ${inProgress}
- ${t('interviewGuidePrompt.blockedCount')} ${blocked}
- ${t('interviewGuidePrompt.notStartedCount')} ${notStarted}
${evaluation?.performanceRating ? `- ${t('interviewGuidePrompt.performanceRating')} ${evaluation.performanceRating}/3` : ''}
${evaluation?.potentialRating ? `- ${t('interviewGuidePrompt.potentialRating')} ${evaluation.potentialRating}/3` : ''}
${evaluation?.bilanManager ? `\n${t('interviewGuidePrompt.bilanManager')} ${evaluation.bilanManager}` : ''}
${evaluation?.bilanEmployee ? `\n${t('interviewGuidePrompt.bilanEmployee')} ${evaluation.bilanEmployee}` : ''}

${t('interviewGuidePrompt.instructions')}

${t('interviewGuidePrompt.outputFormat')}
{
  "discussionPoints": "${t('interviewGuidePrompt.discussionPointsDesc')}",
  "questions": "${t('interviewGuidePrompt.questionsDesc')}",
  "semesterReview": "${t('interviewGuidePrompt.semesterReviewDesc')}"
}`;

  try {
    const text = await callAnthropicAPIWithConfig(prompt, AI_INTERVIEW_GUIDE_CONFIG);
    // Extraction robuste du JSON : chercher le premier { ... } dans la réponse
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    const parsed = JSON.parse(jsonMatch[0]) as InterviewGuide;

    if (!parsed.discussionPoints || !parsed.questions || !parsed.semesterReview) {
      throw new Error('Invalid guide structure: missing required fields');
    }
    return parsed;
  } catch (error) {
    console.error('Error generating interview guide:', error);
    throw error;
  }
};

export const aiService = {
  generateObjectives,
  generateTemplates,
  analyzeObjective,
  generateInterviewGuide,
};

export default aiService;
