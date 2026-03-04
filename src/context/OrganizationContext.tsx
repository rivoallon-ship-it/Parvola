import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  OrganizationContextType,
  OrganizationState,
  Establishment,
  Team,
  NewEstablishmentForm,
  NewTeamForm,
} from '@/types';
import {
  insertEstablishment,
  updateEstablishmentDb,
  deleteEstablishmentDb,
  insertTeam,
  updateTeamDb,
  deleteTeamDb,
} from '@/services/supabase-data';

type Action =
  | { type: 'SET_ESTABLISHMENTS'; payload: Establishment[] }
  | { type: 'ADD_ESTABLISHMENT'; payload: Establishment }
  | { type: 'UPDATE_ESTABLISHMENT'; payload: Establishment }
  | { type: 'REMOVE_ESTABLISHMENT'; payload: string }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'UPDATE_TEAM'; payload: Team }
  | { type: 'REMOVE_TEAM'; payload: string }
  | { type: 'REMOVE_TEAMS_BY_ESTABLISHMENT'; payload: string };

const reducer = (state: OrganizationState, action: Action): OrganizationState => {
  switch (action.type) {
    case 'SET_ESTABLISHMENTS':
      return { ...state, establishments: action.payload };
    case 'ADD_ESTABLISHMENT':
      return { ...state, establishments: [...state.establishments, action.payload] };
    case 'UPDATE_ESTABLISHMENT':
      return { ...state, establishments: state.establishments.map((e) => e.id === action.payload.id ? action.payload : e) };
    case 'REMOVE_ESTABLISHMENT':
      return { ...state, establishments: state.establishments.filter((e) => e.id !== action.payload) };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] };
    case 'UPDATE_TEAM':
      return { ...state, teams: state.teams.map((t) => t.id === action.payload.id ? action.payload : t) };
    case 'REMOVE_TEAM':
      return { ...state, teams: state.teams.filter((t) => t.id !== action.payload) };
    case 'REMOVE_TEAMS_BY_ESTABLISHMENT':
      return { ...state, teams: state.teams.filter((t) => t.establishmentId !== action.payload) };
    default:
      return state;
  }
};

const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  children: React.ReactNode;
  initialEstablishments?: Establishment[];
  initialTeams?: Team[];
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({
  children,
  initialEstablishments,
  initialTeams,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    establishments: initialEstablishments || [],
    teams: initialTeams || [],
  });

  const addEstablishment = useCallback(async (form: NewEstablishmentForm) => {
    const establishment = await insertEstablishment(form);
    dispatch({ type: 'ADD_ESTABLISHMENT', payload: establishment });
  }, []);

  const updateEstablishment = useCallback(async (establishment: Establishment) => {
    await updateEstablishmentDb(establishment);
    dispatch({ type: 'UPDATE_ESTABLISHMENT', payload: establishment });
  }, []);

  const deleteEstablishment = useCallback(async (id: string) => {
    // CASCADE in DB handles teams + employee FK SET NULL automatically
    await deleteEstablishmentDb(id);
    dispatch({ type: 'REMOVE_ESTABLISHMENT', payload: id });
    dispatch({ type: 'REMOVE_TEAMS_BY_ESTABLISHMENT', payload: id });
  }, []);

  const addTeam = useCallback(async (form: NewTeamForm) => {
    const team = await insertTeam(form);
    dispatch({ type: 'ADD_TEAM', payload: team });
  }, []);

  const updateTeam = useCallback(async (team: Team) => {
    await updateTeamDb(team);
    dispatch({ type: 'UPDATE_TEAM', payload: team });
  }, []);

  const deleteTeam = useCallback(async (id: string) => {
    // CASCADE in DB handles employee FK SET NULL automatically
    await deleteTeamDb(id);
    dispatch({ type: 'REMOVE_TEAM', payload: id });
  }, []);

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
