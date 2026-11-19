import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { getContrastTextColor, isHexColorDark, verifyWishPassword } from '../utils/wishLogic';

interface Page1GateProps {
  wish: WishConfig;
  isEditing: boolean;
  onUnlock: () => void;
}

export function Page1Gate({ wish, isEditing, onUnlock }: Page1GateProps) {
  const [attempt, setAttempt] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shaking, setShaking] = useState(false);

  const darkCanvas = isHexColorDark(wish.colors.background);
  const borderColor = darkCanvas ? 'rgba(255,255,255,0.16)' : 'rgba(15,9,6,0.14)';
  const cardBg = darkCanvas ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)';
  const accentText = getContrastTextColor(wish.colors.accent);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!wish.passwordEnabled || !wish.password.trim()) {
      setErrorMsg('');
      onUnlock();
      return;
    }
    if (!attempt.trim()) {
      setErrorMsg('Please enter the secret word to unlock.');
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
      return;
    }
    if (verifyWishPassword(wish, attempt)) {
      setErrorMsg('');
      onUnlock();
    } else {
      setErrorMsg("That doesn't match yet. Check the hint below and try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 450);
    }
  };

  return (
    <section className="relative z-10 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12">
      <div
        className={`animate-card-in relative overflow-hidden w-full max-w-md rounded-2xl p-8 sm:p-10 text-center shadow-lg transition-colors ${
          shaking ? 'animate-shake' : ''
        }`}
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          color: wish.colors.ink,
        }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: `linear-gradient(90deg, ${wish.colors.secondary}, ${wish.colors.accent}, ${wish.colors.secondary})`,
          }}
        />

        <div
          className="animate-gentle-bob mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xs"
          style={{
            backgroundColor: darkCanvas ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${wish.colors.secondary}55`,
            color: wish.colors.accent,
          }}
        >
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>

        <p
          className="text-xs font-medium tracking-widest uppercase mb-2 opacity-75"
          style={{ color: wish.colors.secondary }}
        >
          {wish.occasion} · For {wish.recipientName}
        </p>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-balance"
          style={{ fontFamily: 'var(--wish-display-font)', color: wish.colors.ink }}
        >
          {wish.gateTitle || 'A special surprise awaits'}
        </h1>

        <p className="text-sm sm:text-base opacity-80 mb-7 leading-relaxed">
          {wish.passwordEnabled
            ? wish.gateSubtitle || 'Enter the secret word to unlock your personal keepsake.'
            : 'Password lock is currently turned off. Open whenever you are ready.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {wish.passwordEnabled && (
            <div>
              <label htmlFor="wish-password-input" className="block text-xs font-medium mb-1.5 opacity-80">
                Secret word
              </label>
              <div className="relative">
                <input
                  id="wish-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={attempt}
                  onChange={(e) => {
                    setAttempt(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Type your secret word"
                  autoComplete="off"
                  className="w-full px-4 py-3 pr-11 rounded-md text-base focus:outline-2 focus:outline-offset-1"
                  style={{
                    backgroundColor: darkCanvas ? 'rgba(0,0,0,0.28)' : '#ffffff',
                    border: `1px solid ${errorMsg ? wish.colors.accent : borderColor}`,
                    color: wish.colors.ink,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded opacity-70 hover:opacity-100 cursor-pointer"
                  style={{ color: wish.colors.ink }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <p role="alert" className="text-sm font-medium" style={{ color: wish.colors.accent }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-5 rounded-md font-semibold text-base cursor-pointer transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: wish.colors.accent,
              color: accentText,
            }}
          >
            {wish.passwordEnabled ? 'Unlock Keepsake' : 'Open Keepsake'}
          </button>
        </form>

        {wish.passwordEnabled && wish.passwordHint.trim() && (
          <p className="mt-5 text-xs opacity-75">
            Hint: <span className="font-medium">{wish.passwordHint}</span>
          </p>
        )}

        {isEditing && wish.passwordEnabled && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor }}>
            <button
              type="button"
              onClick={onUnlock}
              className="text-xs font-medium underline underline-offset-4 opacity-80 hover:opacity-100 cursor-pointer"
              style={{ color: wish.colors.secondary }}
            >
              Skip password while editing preview
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
