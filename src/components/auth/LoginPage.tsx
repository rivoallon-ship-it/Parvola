import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/common';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { useUserContext } from '@/context/UserContext';

interface LoginPageProps {
  onSwitchToSignup?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignup }) => {
  const { t } = useTranslation();
  const { signIn } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      // Don't expose raw Supabase error details to users
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Invalid login')) {
        setError(t('auth.invalidCredentials'));
      } else {
        setError(t('auth.genericError'));
      }
      if (import.meta.env.DEV) console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: colors.body.bg }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/Logo.png" alt="Talent Review" className="h-10 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t('auth.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl shadow-lg border p-8"
          style={{ borderColor: colors.card.border }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('auth.signIn')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sophie@sushineko.fr"
              required
              autoComplete="email"
            />

            <Input
              label={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              rounded="lg"
              loading={loading}
              icon={<LogIn size={16} />}
            >
              {t('auth.signInButton')}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">{t('auth.demoHint')}</p>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <button
                type="button"
                onClick={() => { setEmail('sophie@sushineko.fr'); setPassword('password123'); }}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="block text-lg mb-0.5">👱🏾‍♀️</span>
                <span className="text-gray-600 font-medium">RH</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('kenji@sushineko.fr'); setPassword('password123'); }}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="block text-lg mb-0.5">👨🏻</span>
                <span className="text-gray-600 font-medium">Manager</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('maxime@sushineko.fr'); setPassword('password123'); }}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <span className="block text-lg mb-0.5">👨🏻‍🦰</span>
                <span className="text-gray-600 font-medium">Employee</span>
              </button>
            </div>
          </div>

          {/* Switch to signup */}
          {onSwitchToSignup && (
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-sm text-accent hover:underline"
              >
                {t('auth.noAccount')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
