import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, UserPlus, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/common';
import { Input } from '@/components/common/Input';
import { colors } from '@/constants/colors';
import { useUserContext } from '@/context/UserContext';

// ============================================
// Page d'inscription entreprise (2 etapes)
// ============================================

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export const SignupPage: React.FC<SignupPageProps> = ({ onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { signUp } = useUserContext();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [companyName, setCompanyName] = useState('');
  const [slug, setSlug] = useState('');

  // Step 2 fields
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const slugFromName = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

  const handleCompanyNameChange = (value: string) => {
    setCompanyName(value);
    if (!slug || slug === slugFromName(companyName)) {
      setSlug(slugFromName(value));
    }
  };

  const isStep1Valid = companyName.trim().length >= 2 && SLUG_REGEX.test(slug);
  const isStep2Valid =
    userName.trim().length >= 1 &&
    email.includes('@') &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (isStep1Valid) setStep(2);
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signUp({ companyName: companyName.trim(), slug, email, password, userName: userName.trim() });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || t('auth.signupError'));
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
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > 1 ? <Check size={14} /> : '1'}
            </div>
            <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-accent' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
              step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {step === 1 ? t('auth.step1Company') : t('auth.step2Account')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {step === 1 ? t('auth.step1Hint') : t('auth.step2Hint')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <Input
                  label={t('auth.companyName')}
                  value={companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="Sushi Neko"
                  required
                  icon={<Building2 size={16} />}
                />
                <div className="space-y-1">
                  <Input
                    label={t('auth.companySlug')}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="sushi-neko"
                    required
                  />
                  <p className="text-xs text-gray-400">
                    {t('auth.slugHint')}
                  </p>
                  {slug && !SLUG_REGEX.test(slug) && (
                    <p className="text-xs text-red-500">{t('auth.slugInvalid')}</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label={t('auth.yourName')}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Sophie Laurent"
                  required
                  icon={<UserPlus size={16} />}
                />
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
                  autoComplete="new-password"
                  error={password.length > 0 && password.length < 8 ? t('auth.passwordTooShort') : undefined}
                />
                <Input
                  label={t('auth.confirmPassword')}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  error={confirmPassword.length > 0 && password !== confirmPassword ? t('auth.passwordMismatch') : undefined}
                />
              </>
            )}

            {error && (
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
              >
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  icon={<ArrowLeft size={16} />}
                >
                  {t('common.back')}
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                rounded="lg"
                loading={loading}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                icon={step === 1 ? <ArrowRight size={16} /> : <Check size={16} />}
              >
                {step === 1 ? t('common.next') : t('auth.signUpButton')}
              </Button>
            </div>
          </form>

          {/* Switch to login */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-accent hover:underline"
            >
              {t('auth.alreadyHaveAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
