import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('This verification link is invalid or missing a token.');
      return;
    }

    api.post('/verify-email', { token })
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/'), 2500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Verification failed. The link may have expired.');
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-bgPage flex flex-col justify-center items-center py-20 font-sans">
      <div className="w-[520px] min-h-[320px] bg-white border border-borderLight rounded-3xl shadow-[0px_12px_24px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center p-10 box-border gap-4">

        <div className="w-[56px] h-[56px] bg-primary rounded-2xl flex justify-center items-center">
          <span className="text-white text-2xl">🌱</span>
        </div>

        {status === 'loading' && (
          <>
            <Loader size={40} className="text-primary animate-spin" />
            <p className="text-[15px] text-textMuted">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-primary" />
            <h1 className="font-extrabold text-[22px] text-textDark">Email verified!</h1>
            <p className="text-[15px] text-textMuted text-center">Redirecting you to sign in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500" />
            <h1 className="font-extrabold text-[22px] text-textDark">Verification failed</h1>
            <p className="text-[15px] text-textMuted text-center">{message}</p>
            <Link to="/" className="font-bold text-primary text-sm mt-2 hover:underline">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;