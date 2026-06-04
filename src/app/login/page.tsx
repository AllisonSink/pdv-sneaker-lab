'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!usernameInput || !passwordInput) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const success = login(usernameInput, passwordInput);
    if (!success) {
      setError('Credenciais inválidas. Tente admin/admin ou user/user.');
    }
  };

  const handleQuickFill = (user: 'admin' | 'seller') => {
    if (user === 'admin') {
      setUsernameInput('admin');
      setPasswordInput('admin');
    } else {
      setUsernameInput('user');
      setPasswordInput('user');
    }
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Sleek Logo */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 font-black text-xl tracking-tight shadow-lg shadow-zinc-950/10 mb-6">
          S
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Sneaker Lab
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Acesse a Frente de Caixa e Gestão de Estoque
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900/30 flex items-start gap-3 text-red-700 dark:text-red-400 text-xs leading-normal animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
                Usuário / Identificador
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="Nome de usuário"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider mb-2 block">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-655"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.99] select-none shadow-lg shadow-zinc-950/10 dark:shadow-zinc-50/5 flex items-center justify-center gap-2"
            >
              Entrar
            </button>
          </form>

          {/* Quick Access Credentials (UX Shortcut) */}
          <div className="mt-8 pt-6 border-t border-zinc-200/40 dark:border-zinc-800/40">
            <h3 className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-bold tracking-wider mb-3 text-center">
              Acesso Rápido para Testes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <span className="text-zinc-900 dark:text-zinc-200 font-bold">Perfil Dono</span>
                <span className="text-[10px] text-zinc-400 font-normal">admin / admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('seller')}
                className="py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <span className="text-zinc-900 dark:text-zinc-200 font-bold">Perfil Vendedor</span>
                <span className="text-[10px] text-zinc-400 font-normal">user / user</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
