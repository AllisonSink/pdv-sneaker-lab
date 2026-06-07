'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Store, ArrowLeft, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterCheckoutPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pixCode = "00020101021126360014br.gov.bcb.pix0114614882330001705204000053039865406119.905802BR592561.488.233 ALLISON DE JES6009SAO PAULO622905251KTHPYWHD84FPAB3Z5TYNX2YS63048B2A";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success('Código Pix copiado para a área de transferência!');
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !storeName.trim() || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Por favor, insira um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate minor loading for premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
    }, 600);
  };

  // Simulate payment confirmation after 8 seconds
  useEffect(() => {
    if (step === 2 && !paymentConfirmed) {
      const timer = setTimeout(() => {
        setPaymentConfirmed(true);
        toast.success('Assinatura ativada com sucesso! Pagamento confirmado.');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [step, paymentConfirmed]);

  const handleFinalize = () => {
    // Save mock user session to localstorage and cookie
    const mockUser = {
      id: 'mock-' + Math.random().toString(36).substr(2, 9),
      username: fullName || email.split('@')[0],
      email: email,
      role: 'admin',
      tenant_id: storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'mock-tenant-id'
    };

    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=86400`;

    toast.success('Bem-vindo ao Kicks PDV!');
    
    // Hard refresh to root route to trigger auth hydrator
    window.location.href = '/';
  };

  // Truncate function for premium PIX string rendering
  const truncatePix = (code: string) => {
    return code.substring(0, 26) + "..." + code.substring(code.length - 8);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white dark:bg-zinc-955 font-sans antialiased text-zinc-900 dark:text-zinc-50">
      
      {/* Scoped CSS Styles for Scanning & Drawing animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { top: 8%; }
          50% { top: 92%; }
        }
        .scan-line {
          animation: scan 3s ease-in-out infinite;
        }
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        .checkmark-path {
          stroke-dasharray: 22;
          stroke-dashoffset: 22;
          animation: draw 0.5s ease-out forwards 0.2s;
        }
        .fade-in-slide {
          animation: fadeInSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />

      {/* Lado Esquerdo - Painel Escuro (Brand & Authority) */}
      <div className="w-full lg:w-1/2 bg-zinc-950 flex flex-col justify-between p-8 md:p-12 lg:p-20 text-white min-h-[35vh] lg:min-h-screen relative overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-zinc-900">
        
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-zinc-800/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-zinc-900/40 blur-[120px] pointer-events-none" />
        
        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-955 font-black text-lg shadow-xl shadow-white/5">
            K
          </div>
          <span className="font-extrabold tracking-tight text-base text-white">Kicks PDV</span>
        </div>

        {/* Text Area */}
        <div className="my-auto py-12 lg:py-0 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.15] text-white">
            A gestão definitiva para a sua Sneaker Shop.
          </h2>
          <p className="mt-4 text-sm text-zinc-400 max-w-md leading-relaxed font-medium">
            Frente de caixa ultra-rápida, controle de grade completo e relatórios financeiros em uma única interface premium.
          </p>
          <div className="mt-8 space-y-3.5">
            {[
              "Grade de tamanhos inteligente (Adulto/Infantil)",
              "Impressão de recibos térmicos de 80mm",
              "Leitor de código de barras e atalhos de PDV",
              "Módulo de troca automática no carrinho"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-zinc-550 font-medium relative z-10">
          © 2026 Kicks PDV. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Painel de Fluxo (Checkout/Cadastro) */}
      <div className="w-full lg:w-1/2 bg-white dark:bg-[#09090b] flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 min-h-[65vh] lg:min-h-screen relative">
        
        {/* Back Button (Only step 2 pending) */}
        {step === 2 && !paymentConfirmed && (
          <button 
            onClick={() => setStep(1)} 
            className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-semibold cursor-pointer select-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar
          </button>
        )}

        <div className="w-full max-w-sm flex flex-col gap-8 fade-in-slide">
          
          {/* PASSO 1: DADOS DE CADASTRO */}
          {step === 1 && (
            <>
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Crie sua conta</h1>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">Preencha os dados abaixo para configurar o seu painel.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleStep1Submit} className="flex flex-col gap-5">
                
                {/* Nome Completo */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullName" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ex: Allison Sink"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                      required
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                    E-mail Comercial
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                    <input
                      id="email"
                      type="email"
                      placeholder="nome@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                      required
                    />
                  </div>
                </div>

                {/* Nome da Loja */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="storeName" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                    Nome da Loja
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                    <input
                      id="storeName"
                      type="text"
                      placeholder="Ex: Kicks Shop"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                      required
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-zinc-50 focus:border-zinc-950 dark:focus:border-zinc-50 transition-all placeholder-zinc-455 dark:placeholder-zinc-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-350 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Plano Recurrente (Resumo Discreto) */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150/45 dark:border-zinc-800/30 rounded-2xl select-none">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Plano Premium</span>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-medium">Cobrança recorrente via Pix</span>
                  </div>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-50">R$ 119,90 / mês</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 active:bg-black dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl transition-all duration-200 shadow-md active:scale-[0.99] select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white dark:border-zinc-955 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Continuar para Pagamento'
                  )}
                </button>
              </form>
            </>
          )}

          {/* PASSO 2: CHECKOUT PIX */}
          {step === 2 && !paymentConfirmed && (
            <div className="flex flex-col gap-6 fade-in-slide">
              {/* Header */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Finalizar Assinatura</h1>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                  Escaneie o código Pix ou utilize a chave copia e cola abaixo para efetivar seu acesso.
                </p>
              </div>

              {/* Elegant Simulated QR Code Card */}
              <div className="relative w-48 h-48 mx-auto bg-white p-3.5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/40 shadow-sm flex items-center justify-center group overflow-hidden select-none">
                {/* Animated Scanner Line */}
                <div className="absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_#10b981] z-10 scan-line" />
                
                {/* Custom SVG QR Code */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900">
                  {/* Finder pattern Top-Left */}
                  <rect x="0" y="0" width="22" height="22" rx="3" fill="currentColor" />
                  <rect x="3" y="3" width="16" height="16" rx="1.5" fill="white" />
                  <rect x="6" y="6" width="10" height="10" rx="0.5" fill="currentColor" />
                  
                  {/* Finder pattern Top-Right */}
                  <rect x="78" y="0" width="22" height="22" rx="3" fill="currentColor" />
                  <rect x="81" y="3" width="16" height="16" rx="1.5" fill="white" />
                  <rect x="84" y="6" width="10" height="10" rx="0.5" fill="currentColor" />

                  {/* Finder pattern Bottom-Left */}
                  <rect x="0" y="78" width="22" height="22" rx="3" fill="currentColor" />
                  <rect x="3" y="81" width="16" height="16" rx="1.5" fill="white" />
                  <rect x="6" y="84" width="10" height="10" rx="0.5" fill="currentColor" />

                  {/* Stylized QR dots scattered */}
                  <rect x="28" y="2" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="40" y="4" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="2" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="64" y="5" width="8" height="6" rx="1" fill="currentColor" />

                  <rect x="28" y="12" width="12" height="6" rx="1" fill="currentColor" />
                  <rect x="46" y="14" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="58" y="12" width="12" height="6" rx="1" fill="currentColor" />

                  <rect x="0" y="28" width="6" height="12" rx="1" fill="currentColor" />
                  <rect x="12" y="34" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="24" y="28" width="6" height="6" rx="1" fill="currentColor" />
                  <rect x="36" y="32" width="12" height="6" rx="1" fill="currentColor" />
                  <rect x="54" y="28" width="18" height="6" rx="1" fill="currentColor" />
                  <rect x="80" y="28" width="6" height="18" rx="1" fill="currentColor" />

                  <rect x="0" y="46" width="12" height="6" rx="1" fill="currentColor" />
                  <rect x="18" y="46" width="6" height="12" rx="1" fill="currentColor" />
                  <rect x="28" y="52" width="18" height="6" rx="1" fill="currentColor" />
                  <rect x="76" y="52" width="24" height="6" rx="1" fill="currentColor" />

                  <rect x="28" y="64" width="6" height="12" rx="1" fill="currentColor" />
                  <rect x="40" y="68" width="18" height="6" rx="1" fill="currentColor" />
                  <rect x="64" y="64" width="12" height="12" rx="1" fill="currentColor" />
                  <rect x="82" y="68" width="18" height="6" rx="1" fill="currentColor" />

                  <rect x="28" y="84" width="18" height="6" rx="1" fill="currentColor" />
                  <rect x="52" y="80" width="6" height="12" rx="1" fill="currentColor" />
                  <rect x="64" y="84" width="12" height="6" rx="1" fill="currentColor" />
                  
                  {/* Brand identity center square */}
                  <rect x="36" y="36" width="28" height="28" rx="6" fill="white" />
                  <rect x="39" y="39" width="22" height="22" rx="4.5" fill="currentColor" />
                  <text x="50" y="55" fill="white" fontSize="14" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">K</text>
                </svg>
              </div>

              {/* PIX Copia e Cola box */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-550 uppercase font-bold tracking-wider">Pix Copia e Cola</span>
                <div className="flex items-center justify-between gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150/45 dark:border-zinc-800/30 rounded-2xl w-full">
                  <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400 overflow-hidden select-all pr-2 truncate">
                    {truncatePix(pixCode)}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 active:bg-zinc-250 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 text-[10px]">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Recurrent Details */}
              <div className="border-t border-zinc-100 dark:border-zinc-900/50 pt-5 text-center">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-450 block">Assinatura Premium</span>
                <span className="text-[10px] text-zinc-400 font-medium">Renovação mensal por R$ 119,90</span>
              </div>

              {/* Status Indicator (Pulse) */}
              <div 
                onClick={() => setPaymentConfirmed(true)}
                className="flex items-center justify-center p-3.5 bg-emerald-50/50 dark:bg-emerald-955/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all select-none"
                title="Clique para simular a confirmação imediata"
              >
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-2.5" />
                <span className="text-xs font-semibold text-emerald-650 dark:text-emerald-400">
                  Aguardando confirmação do pagamento...
                </span>
              </div>
            </div>
          )}

          {/* PASSO 3: PAGAMENTO CONFIRMADO E SUCESSO */}
          {paymentConfirmed && (
            <div className="flex flex-col gap-6 text-center fade-in-slide py-4">
              
              {/* Checkmark SVG with custom drawing animation */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-500 mx-auto animate-in zoom-in duration-300">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="checkmark-path" />
                </svg>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Assinatura Confirmada!</h2>
                <p className="text-xs text-zinc-455 dark:text-zinc-500 leading-relaxed max-w-xs mx-auto">
                  Sua conta foi criada com sucesso e seu acesso já está liberado.
                </p>
              </div>

              {/* Summary details */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-150/45 dark:border-zinc-800/30 rounded-2xl p-4 text-left space-y-3.5 text-xs text-zinc-650 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="font-semibold opacity-70">Loja</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold opacity-70">E-mail</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{email}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200/50 dark:border-zinc-800/40 pt-3">
                  <span className="font-semibold opacity-70">Plano</span>
                  <span className="font-extrabold text-emerald-650 dark:text-emerald-400">Premium (R$ 119,90)</span>
                </div>
              </div>

              {/* Access Dashboard Button */}
              <button
                onClick={handleFinalize}
                className="w-full py-3.5 bg-zinc-950 hover:bg-zinc-900 active:bg-black dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-950 font-bold rounded-xl transition-all duration-200 shadow-md active:scale-[0.99] select-none flex items-center justify-center gap-2 cursor-pointer"
              >
                Acessar Painel
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
