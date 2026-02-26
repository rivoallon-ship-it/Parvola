import React from 'react';
import { Calendar, Users, FileText, LayoutGrid } from 'lucide-react';
import type { ViewType } from '@/types';
import { colors } from '@/constants/colors';
import { useApp } from '@/hooks';

// ============================================
// Composant Navigation
// ============================================

const navItems: Array<{ key: ViewType; icon: React.ElementType; label: string }> = [
  { key: 'semesters', icon: Calendar, label: 'Campagne' },
  { key: 'nine-box', icon: LayoutGrid, label: 'Matrice' },
  { key: 'team', icon: Users, label: 'Équipe' },
  { key: 'templates', icon: FileText, label: 'Poste' },
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, setViewingSemester, setSelectedEmployee, setSelectedSemester } = useApp();

  const handleNavClick = (key: ViewType) => {
    setCurrentView(key);
    setViewingSemester(null);
    setSelectedEmployee(null);
    setSelectedSemester(null);
  };

  return (
    <nav style={{ backgroundColor: colors.nav.bg }}>
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/Logo.png" alt="Talent Review" className="h-auto max-h-8" />
          </div>

          {/* Nav Items */}
          <div className="flex gap-1">
            {navItems.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                className="px-3 py-1 transition relative text-sm"
                style={{
                  backgroundColor: currentView === key ? colors.nav.selected : 'transparent',
                  color: colors.nav.text,
                  borderRadius: '8px 8px 0 0',
                }}
              >
                <Icon className="inline mr-1" size={14} />
                {label}
                {currentView === key && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: colors.nav.accent }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
