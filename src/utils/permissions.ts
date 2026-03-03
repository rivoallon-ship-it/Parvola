import type { UserRole, User, Employee, Team, ViewType, CampaignStatus, EvaluationStatus } from '@/types';

// ============================================
// Fonctions de permission par rôle
// ============================================

// ---------- Navigation ----------

export const getNavItems = (role: UserRole): ViewType[] => {
  switch (role) {
    case 'rh':
      return ['semesters', 'nine-box', 'team', 'templates'];
    case 'manager':
      return ['semesters', 'nine-box', 'team'];
    case 'employee':
      return ['my-evaluations'];
  }
};

// ---------- Campagnes ----------

export const canCreateCampaign = (role: UserRole): boolean => role === 'rh';
export const canPublishCampaign = (role: UserRole): boolean => role === 'rh';
export const canCloseCampaign = (role: UserRole): boolean => role === 'rh';
export const canDeleteCampaign = (role: UserRole): boolean => role === 'rh';

// ---------- Employés ----------

export const canEditEmployees = (role: UserRole): boolean => role === 'rh';

// ---------- Templates ----------

export const canEditTemplates = (role: UserRole): boolean => role === 'rh';

// ---------- Évaluations ----------

export const canEditEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  if (campaignStatus !== 'active') return false;
  if (evalStatus === 'submitted' || evalStatus === 'validated') return false;
  return role === 'rh' || role === 'manager';
};

export const canSubmitEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  return role === 'manager' && campaignStatus === 'active' && evalStatus === 'in_progress';
};

export const canValidateEvaluation = (
  role: UserRole,
  campaignStatus: CampaignStatus,
  evalStatus?: EvaluationStatus
): boolean => {
  return role === 'rh' && campaignStatus === 'active' && evalStatus === 'submitted';
};

// ---------- 9-Box ----------

export const canViewNineBoxRatings = (role: UserRole): boolean => role !== 'employee';
export const canEditNineBoxRatings = (role: UserRole): boolean => role === 'rh' || role === 'manager';

// ---------- Bilans ----------

export const canViewBilanManager = (role: UserRole): boolean => role !== 'employee';

// ---------- Guide d'entretien ----------

export const canViewInterviewGuide = (role: UserRole): boolean => role !== 'employee';

// ---------- Périmètre ----------

export const isEmployeeInScope = (user: User, employee: Employee, _teams: Team[]): boolean => {
  if (user.role === 'rh') return true;

  if (user.role === 'employee') {
    return employee.id === user.employeeId;
  }

  // Manager: employee must be in one of the manager's teams
  if (user.role === 'manager' && user.teamIds) {
    // Employee is directly in one of the manager's teams
    if (employee.teamId && user.teamIds.includes(employee.teamId)) return true;

    // Employee is at establishment level (no team) but in manager's establishment
    if (!employee.teamId && employee.establishmentId === user.establishmentId) return true;

    return false;
  }

  return false;
};

export const getEmployeesInScope = (user: User, employees: Employee[], teams: Team[]): Employee[] => {
  return employees.filter((e) => isEmployeeInScope(user, e, teams));
};
