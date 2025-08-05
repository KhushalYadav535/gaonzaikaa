import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from './AdminSessionContext';
import { adminAPI } from '../../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAdminSession();

  useEffect(() => {
    if (isLoggedIn) navigate('/admin');
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await adminAPI.login({ email, password });
      if (response.data.success) {
        // Store admin info in session
        login(email);
        navigate('/admin');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-orange-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <input
          className="border p-2 mb-4 w-full rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="border p-2 mb-4 w-full rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="bg-orange-500 text-white px-4 py-2 rounded w-full hover:bg-orange-600" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login; 