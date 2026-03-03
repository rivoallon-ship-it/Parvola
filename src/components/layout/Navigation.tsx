import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Users, FileText, LayoutGrid, ClipboardList, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ViewType } from '@/types';
import { colors } from '@/constants/colors';
import { useNavigation, useUser } from '@/hooks';
import { getNavItems } from '@/utils/permissions';
import { SIMULATED_USERS } from '@/context/UserContext';

// ============================================
// Composant Navigation
// ============================================

const ALL_NAV_ITEMS: Array<{ key: ViewType; icon: React.ElementType; labelKey: string }> = [
  { key: 'semesters', icon: Calendar, labelKey: 'nav.campaign' },
  { key: 'nine-box', icon: LayoutGrid, labelKey: 'nav.matrix' },
  { key: 'team', icon: Users, labelKey: 'nav.team' },
  { key: 'templates', icon: FileText, labelKey: 'nav.position' },
  { key: 'my-evaluations', icon: ClipboardList, labelKey: 'nav.myEvaluations' },
];

const ROLE_COLORS: Record<string, string> = {
  rh: '#10b981',
  manager: '#3b82f6',
  employee: '#f59e0b',
};

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView, setViewingSemester, setSelectedEmployee, setSelectedSemester } = useNavigation();
  const { currentUser, switchUser } = useUser();
  const { t, i18n } = useTranslation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Visible nav items based on role
  const allowedViews = getNavItems(currentUser.role);
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => allowedViews.includes(item.key));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showProfileMenu]);

  // When role changes, navigate to a valid view
  useEffect(() => {
    if (!allowedViews.includes(currentView as ViewType)) {
      setCurrentView(allowedViews[0]);
      setViewingSemester(null);
      setSelectedEmployee(null);
      setSelectedSemester(null);
    }
  }, [currentUser.role]);

  const handleNavClick = (key: ViewType) => {
    setCurrentView(key);
    setViewingSemester(null);
    setSelectedEmployee(null);
    setSelectedSemester(null);
  };

  const handleSwitchUser = (userId: string) => {
    switchUser(userId);
    setShowProfileMenu(false);
  };

  const roleLabel = t(`user.role${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` as string);

  return (
    <nav style={{ backgroundColor: colors.nav.bg }}>
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/Logo.png" alt="Talent Review" className="h-auto max-h-8" />
          </div>

          <div className="flex items-center gap-4">
            {/* Nav Items */}
            <div className="flex gap-1">
              {visibleNavItems.map(({ key, icon: Icon, labelKey }) => (
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
                  {t(labelKey)}
                  {currentView === key && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ backgroundColor: colors.nav.accent }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Profile Selector */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg transition hover:bg-white/10"
                style={{ color: colors.nav.text }}
              >
                <span className="text-lg">{currentUser.photo}</span>
                <div className="text-left">
                  <span className="text-xs block leading-tight">{currentUser.name}</span>
                  <span
                    className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: ROLE_COLORS[currentUser.role],
                      color: '#fff',
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
                <ChevronDown size={14} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[220px]">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                    {t('user.switchProfile')}
                  </div>
                  {SIMULATED_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchUser(user.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                        user.id === currentUser.id ? 'bg-gray-100 font-medium' : ''
                      }`}
                    >
                      <span className="text-xl">{user.photo}</span>
                      <div className="text-left flex-1">
                        <span className="block text-gray-800">{user.name}</span>
                        <span
                          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: ROLE_COLORS[user.role],
                            color: '#fff',
                          }}
                        >
                          {t(`user.role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}` as string)}
                        </span>
                      </div>
                      {user.id === currentUser.id && (
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.nav.accent }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex gap-1">
              {LANGUAGES.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => i18n.changeLanguage(code)}
                  className="px-2 py-1 text-xs font-medium rounded transition"
                  style={{
                    backgroundColor: i18n.language?.startsWith(code) ? colors.nav.accent : 'transparent',
                    color: i18n.language?.startsWith(code) ? '#fff' : colors.nav.text,
                    opacity: i18n.language?.startsWith(code) ? 1 : 0.7,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
