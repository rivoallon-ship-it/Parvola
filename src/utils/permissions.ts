import type { UserRole, User, Employee, Team, ViewType, CampaignStatus, EvaluationStatus } from '@/types';

// ============================================
// Fonctions de permission par rôle (5 niveaux)
// admin > rh > directeur > manager > employee
// ============================================

// ---------- Helpers de groupement ----------

const FULL_ACCESS_ROLES: UserRole[] = ['admin', 'rh'];
const EVALUATOR_ROLES: UserRole[] = ['admin', 'rh', 'directeur', 'manager'];

export const hasFullAccess = (role: UserRole): boolean => FULL_ACCESS_ROLES.includes(role);
export const isEvaluator = (role: UserRole): boolean => EVALUATOR_ROLES.includes(role);

// ---------- Navigation ----------

export const getNavItems = (role: UserRole): ViewType[] => {
  switch (role) {
    case 'admin':
    case 'rh':
      return ['semesters', 'nine-box', 'team', 'templates', 'settings'];
    case 'directeur':
    case 'manager':
      return ['semesters', 'nine-box', 'team'];
    case 'employee':
      return ['my-evaluations', 'my-professional-interviews'];
  }
};

// ---------- Campagnes ----------

export const canCreateCampaign = (role: UserRole): boolean => hasFullAccess(role);
export const canPublishCampaign = (role: UserRole): boolean => hasFullAccess(role);
export const canCloseCampaign = (role: UserRole): boolean => hasFullAccess(role);
export const canDeleteCampaign = (role: UserRole): boolean => hasFullAccess(role);

// ---------- Employés ----------

export const canEditEmployees = (role: UserRole): boolean => hasFullAccess(role);

// ---------- Templates ----------

export const canEditTemplates = (role: UserRole): boolean => hasFullAccess(role);

// ---------- Évaluations ----------

export const canEditEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  if (campaignStatus !== 'active') return false;
  if (evalStatus === 'submitted' || evalStatus === 'validated') return false;
  return isEvaluator(role);
};

export const canSubmitEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  return (role === 'manager' || role === 'directeur') && campaignStatus === 'active' && evalStatus === 'in_progress';
};

export const canValidateEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  return hasFullAccess(role) && campaignStatus === 'active' && evalStatus === 'submitted';
};

// ---------- 9-Box ----------

export const canViewNineBoxRatings = (role: UserRole): boolean => role !== 'employee';
export const canEditNineBoxRatings = (role: UserRole): boolean => isEvaluator(role);

// ---------- Bilans ----------

export const canViewBilanManager = (role: UserRole): boolean => role !== 'employee';

// ---------- Guide d'entretien ----------

export const canViewInterviewGuide = (role: UserRole): boolean => role !== 'employee';

// ---------- Invitations ----------

export const canInviteUsers = (role: UserRole): boolean => hasFullAccess(role);

export const getInvitableRoles = (role: UserRole): UserRole[] => {
  switch (role) {
    case 'admin':
      return ['rh', 'directeur', 'manager', 'employee'];
    case 'rh':
      return ['directeur', 'manager', 'employee'];
    default:
      return [];
  }
};

// ---------- Périmètre ----------

export const isEmployeeInScope = (user: User, employee: Employee, _teams: Team[]): boolean => {
  // Admin & RH: full company access
  if (hasFullAccess(user.role)) return true;

  // Employee: self only
  if (user.role === 'employee') {
    return employee.id === user.employeeId;
  }

  // Directeur: employees in assigned establishments
  if (user.role === 'directeur' && user.establishmentIds) {
    return !!employee.establishmentId && user.establishmentIds.includes(employee.establishmentId);
  }

  // Manager: employee must be in one of the manager's teams
  if (user.role === 'manager' && user.teamIds) {
    if (employee.teamId && user.teamIds.includes(employee.teamId)) return true;
    if (!employee.teamId && employee.establishmentId === user.establishmentId) return true;
    return false;
  }

  return false;
};

export const getEmployeesInScope = (user: User, employees: Employee[], teams: Team[]): Employee[] => {
  return employees.filter((e) => isEmployeeInScope(user, e, teams));
};
