import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllData } from '@/services/supabase-data';
import { UserProvider, useUserContext } from './UserContext';
import { NavigationProvider, useNavigationContext } from './NavigationContext';
import { EmployeeProvider } from './EmployeeContext';
import { OrganizationProvider } from './OrganizationContext';
import { SemesterProvider } from './SemesterContext';
import { TemplateProvider, useTemplateContext } from './TemplateContext';
import { ProfessionalInterviewProvider } from './ProfessionalInterviewContext';
import { LoginPage, SignupPage } from '@/components/auth';
import { colors } from '@/constants/colors';
import type { Employee, Semester, ObjectiveTemplate, StorageData } from '@/types';

// Auth gate — only renders children (DataLoader) when authenticated
const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthLoading } = useUserContext();
  const { t } = useTranslation();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (isAuthLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.body.bg }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (authView === 'signup') {
      return <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToSignup={() => setAuthView('signup')} />;
  }

  return <>{children}</>;
};

// DataLoader fetches all data from Supabase and initializes contexts
const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = React.useState<StorageData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    fetchAllData()
      .then(setData)
      .catch((err) => {
        console.error('Failed to load data from Supabase:', err);
        setError('Une erreur est survenue lors du chargement des donnees.');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="font-semibold">Erreur de chargement</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.body.bg }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <DataLoadedProviders data={data}>
      {children}
    </DataLoadedProviders>
  );
};

const DataLoadedProviders: React.FC<{ data: StorageData; children: React.ReactNode }> = ({ data, children }) => {
  const selectedEmployeeRef = useRef<(() => Employee | null) | null>(null);
  const selectedSemesterRef = useRef<(() => Semester | null) | null>(null);
  const templatesRef = useRef<(() => ObjectiveTemplate[]) | null>(null);

  return (
    <EmployeeProvider initialEmployees={data.employees}>
      <OrganizationProvider
        initialEstablishments={data.establishments}
        initialTeams={data.teams}
      >
        <SemesterProvider
          initialSemesters={data.semesters}
          initialEvaluations={data.evaluations}
          getSelectedEmployee={() => selectedEmployeeRef.current?.() || null}
          getSelectedSemester={() => selectedSemesterRef.current?.() || null}
          getTemplates={() => templatesRef.current?.() || []}
        >
          <TemplateProvider
            initialPositions={data.positions}
            initialTemplates={data.templates}
          >
            <ProfessionalInterviewProvider
              initialCampaigns={data.professionalCampaigns}
              initialInterviews={data.professionalInterviews}
            >
              <RefWiring
                selectedEmployeeRef={selectedEmployeeRef}
                selectedSemesterRef={selectedSemesterRef}
                templatesRef={templatesRef}
              />
              <LoadingDone>
                {children}
              </LoadingDone>
            </ProfessionalInterviewProvider>
          </TemplateProvider>
        </SemesterProvider>
      </OrganizationProvider>
    </EmployeeProvider>
  );
};

// Wires refs to actual context values
const RefWiring: React.FC<{
  selectedEmployeeRef: React.MutableRefObject<(() => Employee | null) | null>;
  selectedSemesterRef: React.MutableRefObject<(() => Semester | null) | null>;
  templatesRef: React.MutableRefObject<(() => ObjectiveTemplate[]) | null>;
}> = ({ selectedEmployeeRef, selectedSemesterRef, templatesRef }) => {
  const { selectedEmployee, selectedSemester } = useNavigationContext();
  const { templates } = useTemplateContext();

  selectedEmployeeRef.current = () => selectedEmployee;
  selectedSemesterRef.current = () => selectedSemester;
  templatesRef.current = () => templates;

  return null;
};

// Sets loading to false once everything is mounted
const LoadingDone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setIsLoading, isLoading } = useNavigationContext();

  useEffect(() => {
    if (isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

// Main AppProvider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <NavigationProvider>
        <AuthGate>
          <DataLoader>
            {children}
          </DataLoader>
        </AuthGate>
      </NavigationProvider>
    </UserProvider>
  );
};

export default AppProvider;
