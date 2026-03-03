import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  OrganizationContextType,
  OrganizationState,
  Establishment,
  Team,
  NewEstablishmentForm,
  NewTeamForm,
} from '@/types';
import { storage } from '@/services/storage';
import { generateId } from '@/utils/helpers';

type Action =
  | { type: 'SET_ESTABLISHMENTS'; payload: Establishment[] }
  | { type: 'SET_TEAMS'; payload: Team[] };

const reducer = (state: OrganizationState, action: Action): OrganizationState => {
  switch (action.type) {
    case 'SET_ESTABLISHMENTS':
      return { ...state, establishments: action.payload };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    default:
      return state;
  }
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  children: React.ReactNode;
  initialEstablishments?: Establishment[];
  initialTeams?: Team[];
  onEmployeesChanged?: (updater: (employees: import('@/types').Employee[]) => import('@/types').Employee[]) => void;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
  initialEstablishments,
  initialTeams,
  onEmployeesChanged,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    establishments: initialEstablishments || [],
    teams: initialTeams || [],
  });

  const addEstablishment = useCallback(async (form: NewEstablishmentForm) => {
    const establishment: Establishment = {
      id: generateId(),
      name: form.name,
      description: form.description || '',
    };
    const newEstablishments = [...state.establishments, establishment];
    await storage.setEstablishments(newEstablishments);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
  }, [state.establishments]);

  const updateEstablishment = useCallback(async (establishment: Establishment) => {
    const newEstablishments = state.establishments.map((e) =>
      e.id === establishment.id ? establishment : e
    );
    await storage.setEstablishments(newEstablishments);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
  }, [state.establishments]);

  const deleteEstablishment = useCallback(async (id: string) => {
    const newEstablishments = state.establishments.filter((e) => e.id !== id);
    const deletedTeamIds = state.teams
      .filter((t) => t.establishmentId === id)
      .map((t) => t.id);
    const newTeams = state.teams.filter((t) => t.establishmentId !== id);

    // Update employees: reset teamId for affected employees
    if (onEmployeesChanged && deletedTeamIds.length > 0) {
      onEmployeesChanged((employees) =>
        employees.map((emp) =>
          emp.teamId && deletedTeamIds.includes(emp.teamId)
            ? { ...emp, teamId: undefined }
            : emp
        )
      );
    }

    await Promise.all([
      storage.setEstablishments(newEstablishments),
      storage.setTeams(newTeams),
    ]);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.establishments, state.teams, onEmployeesChanged]);

  const addTeam = useCallback(async (form: NewTeamForm) => {
    const team: Team = {
      id: generateId(),
      establishmentId: form.establishmentId,
      name: form.name,
      description: form.description || '',
    };
    const newTeams = [...state.teams, team];
    await storage.setTeams(newTeams);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.teams]);

  const updateTeam = useCallback(async (team: Team) => {
    const newTeams = state.teams.map((t) => (t.id === team.id ? team : t));
    await storage.setTeams(newTeams);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.teams]);

  const deleteTeam = useCallback(async (id: string) => {
    const newTeams = state.teams.filter((t) => t.id !== id);

    // Update employees: reset teamId
    if (onEmployeesChanged) {
      onEmployeesChanged((employees) =>
        employees.map((emp) =>
          emp.teamId === id ? { ...emp, teamId: undefined } : emp
        )
      );
    }

    await storage.setTeams(newTeams);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.teams, onEmployeesChanged]);

  const value: OrganizationContextType = {
    ...state,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment,
    addTeam,
    updateTeam,
    deleteTeam,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganizationContext = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
};
