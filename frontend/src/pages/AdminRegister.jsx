import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await auth.register({ name, email, password, secretKey });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="auth-card animate-fade-in text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Eagle Shop" className="h-20 w-auto" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-gradient mb-1">Admin Registration</h2>
        <p className="text-warm-silver text-sm font-ui mb-8">Create a new admin account</p>
        
        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
        
        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <Input 
            label="Full Name" 
            name="name" 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="John Doe" 
            required 
          />
          <Input 
            label="Email Address" 
            name="email" 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="admin@eagleshop.com" 
            required 
          />
          <div className="form-row">
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
            <Input 
              label="Confirm Password" 
              name="confirmPassword" 
              type="password" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
              minLength={6}
            />
          </div>
          
          <div className="relative">
            <Input 
              label="Secret Registration Key" 
              name="secretKey" 
              type={showSecret ? "text" : "password"} 
              value={secretKey} 
              onChange={e => setSecretKey(e.target.value)} 
              placeholder="Enter the secret key" 
              required 
              autoComplete="new-password"
              data-form-type="other"
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-warm-silver hover:text-eagle-gold transition-colors"
              onClick={() => setShowSecret(!showSecret)}
              aria-label={showSecret ? "Hide secret key" : "Show secret key"}
            >
              {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <Button type="submit" icon={UserPlus} className="w-full justify-center mt-6" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminRegister;
