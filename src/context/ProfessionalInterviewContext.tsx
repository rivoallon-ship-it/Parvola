import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  ProfessionalInterviewContextType,
  ProfessionalInterviewState,
  ProfessionalCampaign,
  ProfessionalInterview,
  NewProfessionalCampaignForm,
} from '@/types';
import {
  insertProfessionalCampaign,
  updateProfessionalCampaignDb,
  deleteProfessionalCampaignDb,
  insertProfessionalInterview,
  updateProfessionalInterviewDb,
  deleteProfessionalInterviewDb,
  signProfessionalInterviewAsEmployee,
} from '@/services/supabase-data';

type Action =
  | { type: 'SET_CAMPAIGNS'; payload: ProfessionalCampaign[] }
  | { type: 'ADD_CAMPAIGN'; payload: ProfessionalCampaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: ProfessionalCampaign }
  | { type: 'REMOVE_CAMPAIGN'; payload: string }
  | { type: 'SET_INTERVIEWS'; payload: ProfessionalInterview[] }
  | { type: 'ADD_INTERVIEW'; payload: ProfessionalInterview }
  | { type: 'UPDATE_INTERVIEW'; payload: { id: string; changes: Partial<ProfessionalInterview> } }
  | { type: 'REMOVE_INTERVIEW'; payload: string }
  | { type: 'REMOVE_INTERVIEWS_BY_CAMPAIGN'; payload: string };

const reducer = (state: ProfessionalInterviewState, action: Action): ProfessionalInterviewState => {
  switch (action.type) {
    case 'SET_CAMPAIGNS':
      return { ...state, professionalCampaigns: action.payload };
    case 'ADD_CAMPAIGN':
      return { ...state, professionalCampaigns: [...state.professionalCampaigns, action.payload] };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        professionalCampaigns: state.professionalCampaigns.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'REMOVE_CAMPAIGN':
      return {
        ...state,
        professionalCampaigns: state.professionalCampaigns.filter((c) => c.id !== action.payload),
      };
    case 'SET_INTERVIEWS':
      return { ...state, professionalInterviews: action.payload };
    case 'ADD_INTERVIEW':
      return { ...state, professionalInterviews: [...state.professionalInterviews, action.payload] };
    case 'UPDATE_INTERVIEW':
      return {
        ...state,
        professionalInterviews: state.professionalInterviews.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload.changes } : i
        ),
      };
    case 'REMOVE_INTERVIEW':
      return {
        ...state,
        professionalInterviews: state.professionalInterviews.filter((i) => i.id !== action.payload),
      };
    case 'REMOVE_INTERVIEWS_BY_CAMPAIGN':
      return {
        ...state,
        professionalInterviews: state.professionalInterviews.filter((i) => i.campaignId !== action.payload),
      };
    default:
      return state;
  }
};

const ProfessionalInterviewContext = createContext<ProfessionalInterviewContextType | null>(null);

interface ProfessionalInterviewProviderProps {
  children: React.ReactNode;
  initialCampaigns?: ProfessionalCampaign[];
  initialInterviews?: ProfessionalInterview[];
}

export const ProfessionalInterviewProvider: React.FC<ProfessionalInterviewProviderProps> = ({
  children,
  initialCampaigns,
  initialInterviews,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    professionalCampaigns: initialCampaigns || [],
    professionalInterviews: initialInterviews || [],
  });

  const addProfessionalCampaign = useCallback(async (form: NewProfessionalCampaignForm) => {
    const campaign = await insertProfessionalCampaign(form);
    dispatch({ type: 'ADD_CAMPAIGN', payload: campaign });
  }, []);

  const updateProfessionalCampaign = useCallback(async (campaign: ProfessionalCampaign) => {
    await updateProfessionalCampaignDb(campaign);
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: campaign });
  }, []);

  const deleteProfessionalCampaign = useCallback(async (id: string) => {
    await deleteProfessionalCampaignDb(id);
    dispatch({ type: 'REMOVE_CAMPAIGN', payload: id });
    dispatch({ type: 'REMOVE_INTERVIEWS_BY_CAMPAIGN', payload: id });
  }, []);

  const publishProfessionalCampaign = useCallback(async (id: string) => {
    const current = state.professionalCampaigns.find((c) => c.id === id);
    if (!current || current.status !== 'draft') return;
    const updated = { ...current, status: 'active' as const };
    await updateProfessionalCampaignDb(updated);
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: updated });
  }, [state.professionalCampaigns]);

  const closeProfessionalCampaign = useCallback(async (id: string) => {
    const current = state.professionalCampaigns.find((c) => c.id === id);
    if (!current || current.status !== 'active') return;
    const updated = { ...current, status: 'closed' as const };
    await updateProfessionalCampaignDb(updated);
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: updated });
  }, [state.professionalCampaigns]);

  const addProfessionalInterview = useCallback(async (campaignId: string, employeeId: string) => {
    const existing = state.professionalInterviews.find(
      (i) => i.campaignId === campaignId && i.employeeId === employeeId
    );
    if (existing) return existing;
    const interview = await insertProfessionalInterview({ campaignId, employeeId });
    dispatch({ type: 'ADD_INTERVIEW', payload: interview });
    return interview;
  }, [state.professionalInterviews]);

  const updateProfessionalInterview = useCallback(async (id: string, fields: Partial<ProfessionalInterview>) => {
    await updateProfessionalInterviewDb(id, fields);
    dispatch({ type: 'UPDATE_INTERVIEW', payload: { id, changes: fields } });
  }, []);

  const deleteProfessionalInterview = useCallback(async (id: string) => {
    await deleteProfessionalInterviewDb(id);
    dispatch({ type: 'REMOVE_INTERVIEW', payload: id });
  }, []);

  const signProfessionalInterview = useCallback(async (id: string, by: 'employee' | 'manager', signature: string, name: string) => {
    const now = new Date().toISOString();
    if (by === 'employee') {
      // Employees only hold SELECT on the table; sign via SECURITY DEFINER RPC.
      await signProfessionalInterviewAsEmployee(id, signature, name);
      dispatch({ type: 'UPDATE_INTERVIEW', payload: { id, changes: { employeeSignedAt: now, employeeSignature: signature, employeeSignatureName: name } } });
    } else {
      const changes = { managerSignedAt: now, managerSignature: signature, managerSignatureName: name };
      await updateProfessionalInterviewDb(id, changes);
      dispatch({ type: 'UPDATE_INTERVIEW', payload: { id, changes } });
    }
  }, []);

  const value: ProfessionalInterviewContextType = {
    ...state,
    addProfessionalCampaign,
    updateProfessionalCampaign,
    deleteProfessionalCampaign,
    publishProfessionalCampaign,
    closeProfessionalCampaign,
    addProfessionalInterview,
    updateProfessionalInterview,
    deleteProfessionalInterview,
    signProfessionalInterview,
  };

  return (
    <ProfessionalInterviewContext.Provider value={value}>
      {children}
    </ProfessionalInterviewContext.Provider>
  );
};

export const useProfessionalInterviewContext = (): ProfessionalInterviewContextType => {
  const context = useContext(ProfessionalInterviewContext);
  if (!context) {
    throw new Error('useProfessionalInterviewContext must be used within a ProfessionalInterviewProvider');
  }
  return context;
};
