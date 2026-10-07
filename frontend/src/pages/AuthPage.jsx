import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Microchip, Wifi, AlertTriangle } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { checkPasswordStrength, isPasswordStrongEnough } from '../utils/passwordStrength';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Инлайн-ошибки по полям вместо одного общего баннера
  const [errors, setErrors] = useState({});
  const [forgotMessage, setForgotMessage] = useState('');

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isLogin && !isPasswordStrongEnough(password)) {
      newErrors.password = 'Password is too weak';
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      if (isLogin) {
        const response = await api.post('/login', { email, password });
        login(response.data.access_token);
        localStorage.setItem('userEmail', email);
        navigate('/dashboard');
      } else {
        await api.post('/register', { email, password });
        setForgotMessage('Account created! Please check your email to verify your account before signing in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        setPasswordStrength(null);
      }
    } catch (err) {
        const detail = err.response?.data?.detail || 'Something went wrong';

        if (err.response?.status === 403) {
          setErrors({ general: detail + ' — check your inbox or request a new link below.' });
          setNeedsVerification(true);
        } else if (detail.toLowerCase().includes('email') || detail.toLowerCase().includes('существует')) {
          setErrors({ email: detail });
        } else if (detail.toLowerCase().includes('пароль') || detail.toLowerCase().includes('password')) {
          setErrors({ password: detail });
        } else {
          setErrors({ general: detail });
        }
      }
  };

  const handleForgotPassword = async () => {
    setForgotMessage('');
    if (!email) {
      setErrors({ email: 'Enter your email address first' });
      return;
    }
    clearFieldError('email');
    try {
      await api.post('/forgot-password', { email });
      setForgotMessage('If this email exists, a reset link has been sent.');
    } catch (err) {
      setErrors({ email: 'Failed to send reset email' });
    }
  };

  const handleResendVerification = async () => {
    setForgotMessage('');
    try {
      await api.post('/resend-verification', { email });
      setForgotMessage('Verification email sent — please check your inbox.');
      setNeedsVerification(false);
      setErrors({});
    } catch (err) {
      setErrors({ general: 'Failed to resend verification email' });
    }
  };

  return (
    <div className="min-h-screen bg-bgPage flex flex-col justify-center items-center py-20 font-sans">
      <div className="flex flex-row justify-center items-center gap-12">

        {/* LEFT — auth-intro-card (без изменений) */}
        <div className="w-[420px] h-[539px] bg-white border border-borderLight rounded-3xl flex flex-col items-start p-10 gap-8 box-border">

          <div className="flex flex-row items-center gap-2.5">
            <div className="w-[42px] h-[42px] bg-primary rounded-[10px] flex justify-center items-center">
              <span className="text-white text-lg">🌱</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-extrabold text-[20px] leading-6 text-textDark">FloraShield</span>
              <span className="font-semibold text-[10px] leading-3 uppercase text-textMuted">AI + IoT Crop Health</span>
            </div>
          </div>

          <div className="w-full h-px bg-borderLight" />

          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-row gap-4 w-full">
              <div className="w-10 h-10 bg-iconGreenBg rounded-[10px] flex justify-center items-center flex-shrink-0">
                <Microchip size={20} className="text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[15px] leading-[18px] text-textDark">AI-Powered Diagnoses</span>
                <span className="font-normal text-[13px] leading-[140%] text-textMuted">
                  Instant botanical diagnosis for over 45 leaf-borne diseases.
                </span>
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full">
              <div className="w-10 h-10 bg-iconBlueBg rounded-[10px] flex justify-center items-center flex-shrink-0">
                <Wifi size={20} className="text-iconBlue" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-[15px] leading-[18px] text-textDark">IoT Soil & Climate Sync</span>
                <span className="font-normal text-[13px] leading-[140%] text-textMuted">
                  Real-time telemetry tracking ambient humidity and soil moisture.
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-[180px] rounded-2xl bg-gradient-to-br from-green-200 to-green-500" />
        </div>

        {/* RIGHT — auth-card */}
        <div className="w-[520px] min-h-[539px] bg-white border border-borderLight rounded-3xl shadow-[0px_12px_24px_rgba(0,0,0,0.05)] flex flex-col p-10 box-border">

          <div className="flex flex-col items-center mb-6">
            <div className="w-[56px] h-[56px] bg-primary rounded-2xl flex justify-center items-center mb-4">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <span className="font-extrabold text-[22px] leading-7 text-textDark">FloraShield</span>
            <span className="font-semibold text-[10px] leading-3 uppercase text-textMuted mt-1">AI + IoT Crop Health</span>
          </div>

          <h1 className="font-extrabold text-[26px] leading-8 text-textDark mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-[15px] text-textMuted mb-6">
            {isLogin ? 'Sign in to your Farm account' : 'Start monitoring your crops today'}
          </p>

          {errors.general && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                {errors.general}
              </div>
              {needsVerification && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="font-semibold text-xs text-red-600 underline text-left w-fit"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          {forgotMessage && (
            <div className="bg-green-50 text-primary text-sm rounded-xl px-4 py-3 mb-4">
              {forgotMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

            {/* Email */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="font-bold text-[13px] leading-4 text-textDark">Email Address</label>
              <div className={`flex flex-row items-center gap-2.5 px-4 py-3.5 bg-bgPage border rounded-2xl w-full box-border transition ${
                errors.email ? 'border-red-400' : 'border-borderLight focus-within:border-primary'
              }`}>
                <Mail size={18} className="text-textMuted flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); setForgotMessage(''); setNeedsVerification(false); }}
                  placeholder="example@gmail.com"
                  required
                  className="flex-1 outline-none bg-transparent font-normal text-sm text-textDark placeholder:text-gray-400"
                />
                {errors.email && <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />}
              </div>
              {errors.email && (
                <span className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5">
                  <AlertTriangle size={12} /> {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex flex-row justify-between items-center">
                <label className="font-bold text-[13px] leading-4 text-textDark">Password</label>
                {isLogin && (
                  <button type="button" onClick={handleForgotPassword} className="font-semibold text-[13px] text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className={`flex flex-row justify-between items-center px-4 py-3.5 bg-bgPage border rounded-2xl w-full box-border transition ${
                errors.password ? 'border-red-400' : 'border-borderLight focus-within:border-primary'
              }`}>
                <div className="flex flex-row items-center gap-2.5 flex-1">
                  <Lock size={18} className="text-textMuted flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                      if (!isLogin) {
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                      }
                    }}
                    placeholder="Enter your password"
                    required
                    className="outline-none bg-transparent font-normal text-sm text-textDark placeholder:text-gray-400 flex-1"
                  />
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-textMuted flex-shrink-0">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5">
                  <AlertTriangle size={12} /> {errors.password}
                </span>
              )}

              {!isLogin && password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex flex-row justify-between items-center mb-1.5">
                    <span className="text-xs text-textMuted">Password strength</span>
                    <span className="text-xs font-semibold" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-borderLight rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${passwordStrength.value}%`, backgroundColor: passwordStrength.color }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`flex items-center gap-1.5 text-xs ${passwordStrength.checks.length ? 'text-green-600' : 'text-textMuted'}`}>
                      <span>{passwordStrength.checks.length ? '✓' : '○'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${passwordStrength.checks.hasUpperLower ? 'text-green-600' : 'text-textMuted'}`}>
                      <span>{passwordStrength.checks.hasUpperLower ? '✓' : '○'}</span>
                      <span>Upper & lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${passwordStrength.checks.hasNumber ? 'text-green-600' : 'text-textMuted'}`}>
                      <span>{passwordStrength.checks.hasNumber ? '✓' : '○'}</span>
                      <span>At least one number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${passwordStrength.checks.hasSpecial ? 'text-green-600' : 'text-textMuted'}`}>
                      <span>{passwordStrength.checks.hasSpecial ? '✓' : '○'}</span>
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            {!isLogin && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-bold text-[13px] leading-4 text-textDark">Confirm Password</label>
                <div className={`flex flex-row items-center gap-2.5 px-4 py-3.5 bg-bgPage border rounded-2xl w-full box-border transition ${
                  errors.confirmPassword ? 'border-red-400' : 'border-borderLight focus-within:border-primary'
                }`}>
                  <Lock size={18} className="text-textMuted flex-shrink-0" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                    placeholder="Confirm your password"
                    required
                    className="flex-1 outline-none bg-transparent font-normal text-sm text-textDark placeholder:text-gray-400"
                  />
                  {errors.confirmPassword && <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />}
                </div>
                {errors.confirmPassword && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5">
                    <AlertTriangle size={12} /> {errors.confirmPassword}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!isLogin && password && !isPasswordStrongEnough(password)}
              className={`w-full py-4 rounded-2xl flex justify-center items-center gap-2 font-bold text-[15px] text-white shadow-[0_4px_20px_rgba(45,106,79,0.3)] mt-2 transition ${
                !isLogin && password && !isPasswordStrongEnough(password)
                  ? 'bg-gray-300 cursor-not-allowed shadow-none'
                  : 'bg-primary hover:bg-primaryDark'
              }`}
            >
              {isLogin ? 'Sign In' : 'Create Account'} <LogIn size={18} />
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-textMuted">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setForgotMessage('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setPasswordStrength(null);
              }}
              className="font-bold text-primary"
            >
              {isLogin ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;