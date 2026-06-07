'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff, User, Store } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [storeNameInput, setStoreNameInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!emailInput || !passwordInput || (isRegistering && (!fullNameInput || !storeNameInput))) {
        setError('Por favor, preencha todos os campos.');
        setIsSubmitting(false);
        return;
      }

      // Simulador de Atraso Artificial (Fake Delay)
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (isRegistering) {
        toast.success('Conta criada com sucesso! Faça o login.');
        setIsRegistering(false);
        setPasswordInput('');
        setFullNameInput('');
        setStoreNameInput('');
      } else {
        // Criar usuário mock e salvar nos storages
        const mockUser = {
          id: 'mock-user-id',
          username: emailInput.split('@')[0] || 'demo',
          email: emailInput,
          role: emailInput.includes('seller') ? 'seller' : 'admin' as 'admin' | 'seller',
          tenant_id: 'mock-tenant-id'
        };

        // Salvar localmente e nos cookies para hidratação de cliente e servidor
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=86400`;

        toast.success('Login efetuado com sucesso (Mock)!');
        
        // Roteamento imediato para a raiz
        window.location.href = '/';
      }
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      setError('Ocorreu um erro ao processar sua solicitação.');
      toast.error(err?.message || 'E-mail ou senha incorretos. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setEmailInput(email);
    setPasswordInput('123456'); // Standard mock/initial password
    setError('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] flex flex-col justify-center items-center px-6 py-12 font-sans antialiased selection:bg-zinc-100 dark:selection:bg-zinc-800">
      
      {/* Container: Extreme Whitespace, no heavy card borders or heavy shadow */}
      <div className="w-full max-w-sm flex flex-col gap-10">
        
        {/* Header Section */}
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3 text-center cursor-pointer hover:opacity-80 transition-opacity">
          {/* Minimalist Premium Logo */}
          <div className="mx-auto w-10 h-10 rounded-xl bg-zinc-955 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-955 font-black text-lg tracking-tight select-none">
            K
          </div>
          <div className="mt-2 space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {isRegistering ? 'Criar nova conta' : 'Kicks PDV'}
            </h1>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
              {isRegistering ? 'Cadastre sua loja de sneakers' : 'Frente de Caixa & Controle de Estoque'}
            </p>
          </div>
        </a>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-955/10 border border-red-100/50 dark:border-red-900/30 flex items-start gap-2.5 text-red-650 dark:text-red-400 text-xs leading-normal animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegistering && (
            <>
              {/* Seu Nome field */}
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-155">
                <label htmlFor="fullName" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                  Seu Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                    required={isRegistering}
                  />
                </div>
              </div>

              {/* Nome da Loja field */}
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-1 duration-155">
                <label htmlFor="storeName" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                  Nome da Loja
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="storeName"
                    type="text"
                    placeholder="Ex: Kicks Shop"
                    value={storeNameInput}
                    onChange={(e) => setStoreNameInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                    required={isRegistering}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
              E-mail Comercial
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[10px] text-zinc-400 dark:text-zinc-555 uppercase font-bold tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-955 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-450 dark:placeholder-zinc-600"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-350 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button - High Contrast */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 active:bg-black dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl transition-all duration-200 shadow-md active:scale-[0.99] select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white dark:border-zinc-950 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
            ) : (
              isRegistering ? 'Cadastrar Sistema' : 'Entrar no Sistema'
            )}
          </button>

          {/* Secondary Text Link to toggle between sign in and sign up */}
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium text-center self-center cursor-pointer transition-colors focus:outline-none"
          >
            {isRegistering ? 'Já tem uma conta? Entre no sistema' : 'Não tem uma conta? Crie sua loja'}
          </button>
        </form>

        {/* Quick Access credentials (Whitespace design) */}
        {!isRegistering && (
          <div className="flex flex-col gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900 animate-in fade-in">
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-wider text-center block">
              Acesso Rápido para Demonstração
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@kickspdv.com')}
                className="py-2.5 px-3 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 border border-zinc-150/45 dark:border-zinc-800/30 rounded-xl text-[10px] font-bold text-zinc-800 dark:text-zinc-355 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Dono / Admin</span>
                <span className="text-[8px] text-zinc-400 font-normal">admin@kickspdv.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('seller@kickspdv.com')}
                className="py-2.5 px-3 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 border border-zinc-150/45 dark:border-zinc-800/30 rounded-xl text-[10px] font-bold text-zinc-800 dark:text-zinc-355 flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              >
                <span>Vendedor / Frente</span>
                <span className="text-[8px] text-zinc-455 font-normal">seller@kickspdv.com</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
