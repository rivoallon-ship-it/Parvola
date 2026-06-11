import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppProvider, ToastProvider } from '@/context';
import { useNavigation } from '@/hooks';
import { Navigation } from '@/components/layout';
import { EmployeeList } from '@/components/employees';
import { SemesterList, SemesterTeamView } from '@/components/semesters';
import { EvaluationView, MyEvaluationsView } from '@/components/evaluations';
import { TemplateList } from '@/components/templates';
import { NineBoxView } from '@/components/nine-box';
import { SettingsView } from '@/components/admin';
import { ProfessionalCampaignList, ProfessionalTeamView, ProfessionalInterviewView, MyProfessionalInterviewsView } from '@/components/professional-interviews';
import { colors } from '@/constants/colors';

// ============================================
// Composant principal de l'application
// ============================================

const AppContent: React.FC = () => {
  const { currentView, isLoading } = useNavigation();
  const { t } = useTranslation();

  if (isLoading) {
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

  const renderView = () => {
    switch (currentView) {
      case 'semesters':
        return <SemesterList />;
      case 'semester-team':
        return <SemesterTeamView />;
      case 'team':
        return <EmployeeList />;
      case 'templates':
        return <TemplateList />;
      case 'evaluation':
        return <EvaluationView />;
      case 'nine-box':
        return <NineBoxView />;
      case 'my-evaluations':
        return <MyEvaluationsView />;
      case 'settings':
        return <SettingsView />;
      case 'professional-campaigns':
        return <ProfessionalCampaignList />;
      case 'professional-team':
        return <ProfessionalTeamView />;
      case 'professional-interview':
        return <ProfessionalInterviewView />;
      case 'my-professional-interviews':
        return <MyProfessionalInterviewsView />;
      default:
        return <SemesterList />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.body.bg }}>
      <Navigation />
      <main className="max-w-7xl mx-auto px-6 py-8">{renderView()}</main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
};

export default App;
