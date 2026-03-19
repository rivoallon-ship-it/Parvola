import type { AISuggestedObjective, AISuggestedTemplate, InterviewGuide, AIReviewResult, Employee, Semester, Evaluation, Position } from '@/types';
import { AI_CONFIG, AI_INTERVIEW_GUIDE_CONFIG, AI_DICTATION_CONFIG, AI_REVIEW_CONFIG } from '@/constants/config';
import { parseAIResponse } from '@/utils/helpers';
import { supabase } from '@/lib/supabase';
import i18n from '@/i18n';

// ============================================
// Service d'Intelligence Artificielle (Anthropic)
// via Supabase Edge Function
// ============================================

interface AIResponse {
  content: Array<{ type: string; text?: string }>;
}

interface AIModelConfig {
  model: string;
  maxTokens: number;
}

/**
 * Appelle l'API Anthropic via l'Edge Function ai-proxy
 */
const callAnthropicAPIWithConfig = async (prompt: string, config: AIModelConfig): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('ai-proxy', {
    body: {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [{ role: 'user', content: prompt }],
    },
  });

  if (error) {
    throw new Error(`AI proxy error: ${error.message}`);
  }

  const response = data as AIResponse;
  return response.content
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
  userPrompt: string,
  companyContext?: string
): Promise<AISuggestedObjective[]> => {
  const prompt = `${t('aiPrompt.systemRole')}

${t('aiPrompt.context')}
- ${t('aiPrompt.employee')} ${employee.name}
- ${t('aiPrompt.position')} ${employee.position}
- ${t('aiPrompt.semester')} ${semester?.name || t('aiPrompt.notSpecified')}
${companyContext ? `\n${t('aiPrompt.companyContext')}\n${companyContext}\n` : ''}
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
  userPrompt: string,
  companyContext?: string
): Promise<AISuggestedTemplate[]> => {
  const prompt = `${t('aiPrompt.systemRole')}

${t('aiPrompt.context')}
- ${t('aiPrompt.position')} ${position.name}
- ${t('aiPrompt.positionDescription')} ${position.description || t('aiPrompt.notSpecifiedFeminine')}
${companyContext ? `\n${t('aiPrompt.companyContext')}\n${companyContext}\n` : ''}
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

/**
 * Nettoie et reformule un texte dicté via speech-to-text
 */
export const cleanupDictation = async (rawText: string): Promise<string> => {
  const prompt = `${t('dictation.cleanupPrompt')}

${rawText}`;

  try {
    const cleaned = await callAnthropicAPIWithConfig(prompt, AI_DICTATION_CONFIG);
    return cleaned.trim();
  } catch (error) {
    console.error('Error cleaning dictation:', error);
    throw error;
  }
};

/**
 * Analyse une évaluation pour corrections, suggestions et alertes juridiques
 */
export const reviewEvaluation = async (
  employee: Employee,
  semester: Semester | null,
  evaluation: Evaluation
): Promise<AIReviewResult> => {
  // Extraire tous les champs texte non-vides
  interface FieldToReview { fieldId: string; fieldLabel: string; content: string }
  const fields: FieldToReview[] = [];

  if (evaluation.bilanManager?.trim()) {
    fields.push({ fieldId: 'bilanManager', fieldLabel: 'Bilan Manager', content: evaluation.bilanManager });
  }
  if (evaluation.bilanEmployee?.trim()) {
    fields.push({ fieldId: 'bilanEmployee', fieldLabel: 'Bilan Employé', content: evaluation.bilanEmployee });
  }

  evaluation.objectives.forEach((obj, index) => {
    const prefix = `Objectif ${index + 1}`;
    if (obj.title?.trim()) {
      fields.push({ fieldId: `objective-${obj.id}-title`, fieldLabel: `${prefix} - Titre`, content: obj.title });
    }
    if (obj.description?.trim()) {
      fields.push({ fieldId: `objective-${obj.id}-description`, fieldLabel: `${prefix} - Description`, content: obj.description });
    }
    if (obj.evaluation?.trim()) {
      fields.push({ fieldId: `objective-${obj.id}-evaluation`, fieldLabel: `${prefix} - Évaluation`, content: obj.evaluation });
    }
    if (obj.comments?.trim()) {
      fields.push({ fieldId: `objective-${obj.id}-comments`, fieldLabel: `${prefix} - Commentaires`, content: obj.comments });
    }
  });

  if (fields.length === 0) {
    return { fields: [], summary: { totalCorrections: 0, totalSuggestions: 0, criticalAlerts: 0 } };
  }

  const fieldsPayload = fields.map(f =>
    `--- CHAMP: ${f.fieldLabel} (id: ${f.fieldId}) ---\n${f.content}`
  ).join('\n\n');

  const prompt = `Tu es un expert RH et juridique français spécialisé dans la conformité des entretiens d'évaluation professionnelle au regard du droit du travail français et de la jurisprudence prud'homale.

CONTEXTE:
- Collaborateur: ${employee.name}
- Poste: ${employee.position}
- Semestre: ${semester?.name || 'Non spécifié'}
- Type de document: Évaluation professionnelle semestrielle

CHAMPS À ANALYSER:
${fieldsPayload}

MISSION:
Analyse chaque champ individuellement et fournis pour chacun:

1. CORRECTIONS DE FORME (corrections):
   - Fautes d'orthographe, grammaire, syntaxe
   - Problèmes de clarté ou de formulation ambiguë
   - Phrases trop longues ou mal structurées

2. SUGGESTIONS D'AMÉLIORATION (suggestions):
   - Rendre les commentaires plus factuels et objectifs (basés sur des faits observables)
   - Rendre les objectifs plus mesurables et vérifiables (critères SMART)
   - Remplacer les jugements subjectifs par des constats professionnels

3. ALERTES JURIDIQUES (legalAlerts) pour le contentieux prud'homal:

   a) DISCRIMINATION (Art. L1132-1 Code du travail):
      Références directes ou indirectes à: l'âge, le sexe, l'origine, l'orientation sexuelle, la situation familiale, la grossesse, l'apparence physique, le handicap, l'état de santé, les opinions politiques, les activités syndicales, les convictions religieuses, le lieu de résidence.

   b) JUGEMENTS DE VALEUR SUR LA PERSONNE (vs. le travail):
      Jugements sur la personnalité plutôt que sur les compétences professionnelles.
      Exemples: "personne difficile", "manque de maturité", "il est paresseux", "attitude négative".

   c) FORMULATIONS VAGUES/EXPLOITABLES:
      Expressions subjectives sans faits: "manque de motivation", "pas assez impliqué", "insuffisant", "n'est pas à la hauteur".

   d) OBJECTIFS IRRÉALISTES OU NON MESURABLES:
      Objectifs sans critère de réussite vérifiable, manifestement inatteignables, ou sans lien avec le poste (Art. L1222-1).

   e) SANCTIONS DÉGUISÉES:
      Commentaires menaçants ou ultimatums: "dernière chance", "si ça ne s'améliore pas...". Objectifs conçus pour mettre en échec.

   f) ATTEINTE À LA DIGNITÉ:
      Formulations humiliantes, infantilisantes ou dégradantes. Comparaisons nominatives avec d'autres salariés.

   Pour chaque alerte, indique:
   - severity: "critical" si risque direct aux Prud'hommes (discrimination, dignité, sanctions déguisées), "warning" si formulation à risque, "info" si amélioration recommandée
   - legalBasis: la référence légale applicable

RÈGLES:
- Analyse chaque champ séparément avec son fieldId exact
- N'inclus que les champs qui ont au moins un problème
- N'invente pas de problèmes — signale uniquement les vrais risques
- Les corrections doivent préserver le sens voulu par le manager
- Sois pédagogique (explique POURQUOI c'est un risque)

FORMAT DE SORTIE (JSON uniquement, aucun texte avant ou après):
{
  "fields": [
    {
      "fieldId": "identifiant_exact_du_champ",
      "fieldLabel": "Libellé du champ",
      "corrections": [
        { "original": "texte original", "suggested": "texte corrigé", "reason": "explication" }
      ],
      "suggestions": ["suggestion d'amélioration"],
      "legalAlerts": [
        { "severity": "critical", "excerpt": "extrait problématique", "issue": "description du problème", "suggestion": "formulation alternative", "legalBasis": "référence légale" }
      ]
    }
  ],
  "summary": {
    "totalCorrections": 0,
    "totalSuggestions": 0,
    "criticalAlerts": 0
  }
}`;

  try {
    const text = await callAnthropicAPIWithConfig(prompt, AI_REVIEW_CONFIG);
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in AI response');
    }
    const parsed = JSON.parse(jsonMatch[0]) as AIReviewResult;

    if (!parsed.fields || !Array.isArray(parsed.fields)) {
      throw new Error('Invalid review structure: missing fields array');
    }
    return parsed;
  } catch (error) {
    console.error('Error reviewing evaluation:', error);
    throw error;
  }
};

export const aiService = {
  generateObjectives,
  generateTemplates,
  analyzeObjective,
  generateInterviewGuide,
  cleanupDictation,
  reviewEvaluation,
};

export default aiService;
