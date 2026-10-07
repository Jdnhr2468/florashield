import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/api';
import { checkPasswordStrength, isPasswordStrongEnough } from '../utils/passwordStrength';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

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

    if (!token) {
      newErrors.general = 'Invalid or missing reset link';
    }
    if (!isPasswordStrongEnough(password)) {
      newErrors.password = 'Password is too weak';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await api.post('/reset-password', { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'The link may have expired. Please request a new one.' });
    }
  };

  return (
    <div className="min-h-screen bg-bgPage flex flex-col justify-center items-center py-20 font-sans">
      <div className="w-[520px] min-h-[420px] bg-white border border-borderLight rounded-3xl shadow-[0px_12px_24px_rgba(0,0,0,0.05)] flex flex-col p-10 box-border">

        <div className="flex flex-col items-center mb-6">
          <div className="w-[56px] h-[56px] bg-primary rounded-2xl flex justify-center items-center mb-4">
            <span className="text-white text-2xl">🌱</span>
          </div>
          <span className="font-extrabold text-[22px] leading-7 text-textDark">FloraShield</span>
          <span className="font-semibold text-[10px] leading-3 uppercase text-textMuted mt-1">AI + IoT Crop Health</span>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle size={48} className="text-primary" />
            <h1 className="font-extrabold text-[22px] text-textDark">Password reset!</h1>
            <p className="text-[15px] text-textMuted text-center">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-extrabold text-[26px] leading-8 text-textDark mb-1">Set a new password</h1>
            <p className="text-[15px] text-textMuted mb-6">Choose a strong password for your account</p>

            {!token && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                This reset link is invalid or missing a token. Please request a new one.
              </div>
            )}

            {errors.general && token && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} />
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="font-bold text-[13px] leading-4 text-textDark">New Password</label>
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
                        setPasswordStrength(checkPasswordStrength(e.target.value));
                      }}
                      placeholder="Enter new password"
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

                {password && passwordStrength && (
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
                    placeholder="Confirm new password"
                    required
                    className="flex-1 outline-none bg-transparent font-normal text-sm text-textDark placeholder:text-gray-400"
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="flex items-center gap-1.5 text-xs text-red-500 mt-0.5">
                    <AlertTriangle size={12} /> {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!token || (password && !isPasswordStrongEnough(password))}
                className={`w-full py-4 rounded-2xl flex justify-center items-center gap-2 font-bold text-[15px] text-white shadow-[0_4px_20px_rgba(45,106,79,0.3)] mt-2 transition ${
                  !token || (password && !isPasswordStrongEnough(password))
                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                    : 'bg-primary hover:bg-primaryDark'
                }`}
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;