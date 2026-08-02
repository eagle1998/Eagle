import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import logo from '../assets/logo.png';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await auth.login(email, password);
      const loggedUser = result?.data?.user || result?.user;
      navigate(loggedUser?.role === 'admin' ? '/admin' : '/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="auth-card animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Eagle Shop" className="h-20 w-auto" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-gradient mb-1">Admin Access</h2>
        <p className="text-warm-silver text-sm font-ui mb-8">Sign in to manage your store</p>
        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
        <form onSubmit={handleSubmit} className="text-left">
          <Input label="Email Address" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@eagleshop.com" required />
          <Input label="Password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          <Button type="submit" icon={LogIn} className="w-full justify-center mt-4" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Button as={Link} to="/admin/register" variant="secondary" icon={UserPlus} className="w-full justify-center mt-3">
            Create Admin Account
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
