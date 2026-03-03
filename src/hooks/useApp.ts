import { useNavigationContext } from '@/context/NavigationContext';
import { useEmployeeContext } from '@/context/EmployeeContext';
import { useOrganizationContext } from '@/context/OrganizationContext';
import { useSemesterContext } from '@/context/SemesterContext';
import { useTemplateContext } from '@/context/TemplateContext';

/**
 * Hook de compatibilité qui combine tous les contextes domaine.
 * À utiliser uniquement pendant la migration progressive.
 * Préférer les hooks spécifiques (useNavigation, useEmployees, etc.).
 */
export const useApp = () => {
  const nav = useNavigationContext();
  const emp = useEmployeeContext();
  const org = useOrganizationContext();
  const sem = useSemesterContext();
  const tpl = useTemplateContext();

  return {
    ...nav,
    ...emp,
    ...org,
    ...sem,
    ...tpl,
  };
};
