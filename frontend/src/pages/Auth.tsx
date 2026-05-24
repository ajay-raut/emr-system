import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What is your favorite color?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const res = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      login(res.data.access_token);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (err) {
      toast.error('Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        username,
        password,
        security_question: securityQuestion,
        security_answer: securityAnswer
      });
      toast.success('Registration successful. Please login.');
      setMode('login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    }
  };

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.get(`/auth/security-question/${username}`);
      setFetchedQuestion(res.data.question);
      setMode('reset');
    } catch (err) {
      toast.error('User not found');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/reset-password', {
        username,
        security_answer: securityAnswer,
        new_password: password
      });
      toast.success('Password reset successfully. Please login.');
      setMode('login');
    } catch (err) {
      toast.error('Incorrect security answer');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-surface-900 p-8 rounded-xl shadow-lg border border-surface-200 dark:border-surface-800">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-surface-900 dark:text-white">
            {mode === 'login' && 'Sign in to MedRecord Pro'}
            {mode === 'register' && 'Create new account'}
            {mode === 'forgot' && 'Reset your password'}
            {mode === 'reset' && 'Answer security question'}
          </h2>
        </div>
        
        {mode === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Username" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <button type="button" onClick={() => setMode('forgot')} className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300">Forgot your password?</button>
              </div>
            </div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Sign in</button>
            <div className="text-sm text-center">
              <button type="button" onClick={() => setMode('register')} className="font-medium text-surface-600 dark:text-surface-400 hover:text-surface-500">Don't have an account? Register</button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm -space-y-px">
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-t-md focus:outline-none sm:text-sm" placeholder="Username" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none sm:text-sm" placeholder="Password" />
              <select value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none sm:text-sm">
                <option>What is your favorite color?</option>
                <option>What city were you born in?</option>
                <option>What is the name of your first pet?</option>
              </select>
              <input type="text" required value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-b-md focus:outline-none sm:text-sm" placeholder="Security Answer" />
            </div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Register</button>
            <div className="text-sm text-center">
              <button type="button" onClick={() => setMode('login')} className="font-medium text-surface-600 dark:text-surface-400 hover:text-surface-500">Back to login</button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="mt-8 space-y-6" onSubmit={handleGetQuestion}>
            <div className="rounded-md shadow-sm">
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none sm:text-sm" placeholder="Enter your username" />
            </div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Get Security Question</button>
            <div className="text-sm text-center">
              <button type="button" onClick={() => setMode('login')} className="font-medium text-surface-600 dark:text-surface-400 hover:text-surface-500">Back to login</button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Question: {fetchedQuestion}</div>
            <div className="rounded-md shadow-sm -space-y-px">
              <input type="text" required value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-t-md focus:outline-none sm:text-sm" placeholder="Your Answer" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-surface-300 dark:border-surface-700 placeholder-surface-500 bg-white dark:bg-surface-900 text-surface-900 dark:text-white rounded-b-md focus:outline-none sm:text-sm" placeholder="New Password" />
            </div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Reset Password</button>
            <div className="text-sm text-center">
              <button type="button" onClick={() => setMode('login')} className="font-medium text-surface-600 dark:text-surface-400 hover:text-surface-500">Back to login</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
