import React, { useState } from 'react';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'register') {
      if (!form.username || !form.email || !form.password) {
        toast.error('All fields are required');
        setLoading(false);
        return;
      }
      const { user, error } = await authService.signUp(form.username, form.email, form.password);
      if (error) toast.error(error);
      else toast.success('Registered! Now login.');
    } else {
      if (!form.username || !form.password) {
        toast.error('Username and password required');
        setLoading(false);
        return;
      }
      const { user, error } = await authService.signIn(form.username, form.password);
      if (error) toast.error(error);
      else toast.success('Logged in!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        {mode === 'register' && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
            required
          />
        )}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded bg-gray-700 text-white"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-emerald-600 text-white rounded font-semibold"
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
        <div className="flex justify-between mt-2">
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-emerald-400">
            {mode === 'login' ? 'Create account' : 'Already have an account?'}
          </button>
        </div>
      </form>
    </div>
  );
}