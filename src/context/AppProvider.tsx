import React, { useEffect, useCallback, useRef } from 'react';
import { storage } from '@/services/storage';
import { seedData } from '@/data/seedData';
import { UserProvider } from './UserContext';
import { NavigationProvider, useNavigationContext } from './NavigationContext';
import { EmployeeProvider, useEmployeeContext } from './EmployeeContext';
import { OrganizationProvider } from './OrganizationContext';
import { SemesterProvider, useSemesterContext } from './SemesterContext';
import { TemplateProvider, useTemplateContext } from './TemplateContext';
import type { Employee, Semester, ObjectiveTemplate, StorageData } from '@/types';

// Migrate existing data to new workflow schema
const migrateData = (data: Awaited<ReturnType<typeof storage.loadAll>>) => {
  let needsPersist = false;

  // Semesters without status → 'active' (they were already usable)
  const semesters = data.semesters.map((s) => {
    if (!s.status) {
      needsPersist = true;
      return { ...s, status: 'active' as const };
    }
    return s;
  });

  // Evaluations: ensure validationStatus is set
  const evaluations = data.evaluations.map((e) => {
    if (!e.validationStatus) {
      needsPersist = true;
      return {
        ...e,
        validationStatus: e.objectives.length > 0
          ? 'in_progress' as const
          : 'not_started' as const,
      };
    }
    return e;
  });

  if (needsPersist) {
    storage.setSemesters(semesters);
    storage.setEvaluations(evaluations);
  }

  return { ...data, semesters, evaluations };
};

// Check if loaded data is empty (all arrays empty)
const isDataEmpty = (data: StorageData): boolean => {
  return (
    data.employees.length === 0 &&
    data.semesters.length === 0 &&
    data.evaluations.length === 0 &&
    data.positions.length === 0 &&
    data.templates.length === 0 &&
    data.establishments.length === 0 &&
    data.teams.length === 0
  );
};

// Persist seed data to storage
const persistSeedData = async (data: StorageData) => {
  await Promise.all([
    storage.setEmployees(data.employees),
    storage.setSemesters(data.semesters),
    storage.setEvaluations(data.evaluations),
    storage.setPositions(data.positions),
    storage.setTemplates(data.templates),
    storage.setEstablishments(data.establishments),
    storage.setTeams(data.teams),
  ]);
};

// DataLoader loads data and initializes all contexts
const DataLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = React.useState<Awaited<ReturnType<typeof storage.loadAll>> | null>(null);

  useEffect(() => {
    storage.loadAll().then(async (raw) => {
      // If storage is completely empty, load seed data
      if (isDataEmpty(raw)) {
        await persistSeedData(seedData);
        setData(seedData);
      } else {
        setData(migrateData(raw));
      }
    });
  }, []);

  if (!data) {
    return null;
  }

  return (
    <DataLoadedProviders data={data}>
      {children}
    </DataLoadedProviders>
  );
};

interface DataLoadedProvidersProps {
  data: Awaited<ReturnType<typeof storage.loadAll>>;
  children: React.ReactNode;
}

const DataLoadedProviders: React.FC<DataLoadedProvidersProps> = ({ data, children }) => {
  const employeeSetterRef = useRef<((employees: Employee[]) => void) | null>(null);
  const evaluationSetterRef = useRef<((evaluations: import('@/types').Evaluation[]) => void) | null>(null);
  const selectedEmployeeRef = useRef<(() => Employee | null) | null>(null);
  const selectedSemesterRef = useRef<(() => Semester | null) | null>(null);
  const templatesRef = useRef<(() => ObjectiveTemplate[]) | null>(null);

  const handleEmployeesChanged = useCallback((updater: (employees: Employee[]) => Employee[]) => {
    if (employeeSetterRef.current) {
      storage.getEmployees().then((employees) => {
        if (employees) {
          const updated = updater(employees);
          storage.setEmployees(updated);
          employeeSetterRef.current?.(updated);
        }
      });
    }
  }, []);

  return (
    <EmployeeProvider initialEmployees={data.employees}>
      <OrganizationProvider
        initialEstablishments={data.establishments}
        initialTeams={data.teams}
        onEmployeesChanged={handleEmployeesChanged}
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
            <RefWiring
              employeeSetterRef={employeeSetterRef}
              evaluationSetterRef={evaluationSetterRef}
              selectedEmployeeRef={selectedEmployeeRef}
              selectedSemesterRef={selectedSemesterRef}
              templatesRef={templatesRef}
            />
            <LoadingDone>
              {children}
            </LoadingDone>
          </TemplateProvider>
        </SemesterProvider>
      </OrganizationProvider>
    </EmployeeProvider>
  );
};

// Wires refs to actual context values
const RefWiring: React.FC<{
  employeeSetterRef: React.MutableRefObject<((employees: Employee[]) => void) | null>;
  evaluationSetterRef: React.MutableRefObject<((evaluations: import('@/types').Evaluation[]) => void) | null>;
  selectedEmployeeRef: React.MutableRefObject<(() => Employee | null) | null>;
  selectedSemesterRef: React.MutableRefObject<(() => Semester | null) | null>;
  templatesRef: React.MutableRefObject<(() => ObjectiveTemplate[]) | null>;
}> = ({ employeeSetterRef, evaluationSetterRef, selectedEmployeeRef, selectedSemesterRef, templatesRef }) => {
  const { setEmployees } = useEmployeeContext();
  const { setEvaluations } = useSemesterContext();
  const { selectedEmployee, selectedSemester } = useNavigationContext();
  const { templates } = useTemplateContext();

  employeeSetterRef.current = setEmployees;
  evaluationSetterRef.current = setEvaluations;
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
        <DataLoader>
          {children}
        </DataLoader>
      </NavigationProvider>
    </UserProvider>
  );
};

export default AppProvider;
