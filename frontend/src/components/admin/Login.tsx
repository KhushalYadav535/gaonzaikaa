import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from './AdminSessionContext';
import { adminAPI } from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAdminSession();

  useEffect(() => {
    if (isLoggedIn) navigate('/admin');
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('Attempting login with:', { email, password });
    
    try {
      console.log('Making API call to admin login...');
      const response = await adminAPI.login({ email, password });
      console.log('API response received:', response);
      console.log('Response data structure:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('Login successful, response data:', response.data);
        console.log('Response.data.data:', response.data.data);
        // Use backend's returned name and role
        const { name, role } = response.data.data;
        console.log('Extracted name:', name, 'role:', role);
        login(name, role);
        navigate('/admin');
      } else {
        console.log('Login failed, response:', response.data);
        setError(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.'
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <div className="relative mb-4">
          <input
            className="border p-2 w-full rounded pr-10"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded w-full hover:bg-orange-600" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login; 