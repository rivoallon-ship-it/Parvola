import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/components/common';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { useUserContext } from '@/context/UserContext';

// ============================================
// Onboarding — invited users set their password
// ============================================

export const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, completeOnboarding, signOut } = useUserContext();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid =
    password.length >= 8 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('onboarding.passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('onboarding.passwordMismatch'));
      return;
    }
    setLoading(true);
    try {
      await completeOnboarding(password);
    } catch (err) {
      setError(t('onboarding.genericError'));
      if (import.meta.env.DEV) console.error('Onboarding error:', err);
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
          <img src="/Logo.png" alt="Parvola" className="h-10 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t('auth.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div
          className="bg-white rounded-2xl shadow-lg border p-8"
          style={{ borderColor: colors.card.border }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {currentUser?.name
              ? t('onboarding.welcomeNamed', { name: currentUser.name })
              : t('onboarding.welcome')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">{t('onboarding.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('onboarding.newPassword')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Input
              label={t('onboarding.confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
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
              disabled={!isValid}
              icon={<Check size={16} />}
            >
              {t('onboarding.submit')}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={signOut}
              className="text-sm text-gray-400 hover:underline"
            >
              {t('onboarding.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
