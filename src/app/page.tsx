'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  ShoppingBag, 
  Barcode, 
  Mail,
  MousePointer,
  TrendingUp,
  DollarSign,
  Target,
  Layers,
  Grid,
  LayoutList,
  Search,
  Plus,
  Minus,
  CreditCard,
  QrCode,
  Coins,
  User,
  Trash2,
  Edit,
  ChevronRight,
  ArrowUpRight,
  Download,
  Calendar
} from 'lucide-react';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [animTime, setAnimTime] = useState(0);

  // Run the walkthrough animation loop (0s to 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimTime((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        return next >= 10 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Calculate mouse position inside the mockup
  const getCursorPosition = () => {
    let x = 40;
    let y = 40;
    
    if (animTime >= 0 && animTime < 2.7) {
      const t = animTime / 2.7;
      x = 40 + (8 - 40) * t;
      y = 40 + (21 - 40) * t;
    } else if (animTime >= 2.7 && animTime < 3.2) {
      x = 8;
      y = 21;
    } else if (animTime >= 3.2 && animTime < 5.8) {
      const t = (animTime - 3.2) / 2.6;
      x = 8 + (85 - 8) * t;
      y = 21 + (87 - 21) * t;
    } else if (animTime >= 5.8 && animTime < 6.5) {
      x = 85;
      y = 87;
    } else if (animTime >= 6.5 && animTime < 8.5) {
      const t = (animTime - 6.5) / 2.0;
      x = 85 + (40 - 85) * t;
      y = 87 + (40 - 87) * t;
    } else {
      x = 40;
      y = 40;
    }
    return { x, y };
  };

  const cursorState = getCursorPosition();

  // Screen state derivation based on animTime
  const activeScreen = (animTime < 3.0 ? 'dashboard' : animTime < 6.5 ? 'pdv' : 'dashboard') as 'dashboard' | 'pdv' | 'estoque';

  const isDashboardActive = activeScreen === 'dashboard';
  const isPDVActive = activeScreen === 'pdv';
  const isEstoqueActive = false;

  const isDashboardHovered = false;
  const isPDVHovered = (animTime >= 2.2 && animTime < 2.8);
  const isEstoqueHovered = false;

  const isDashboardClicked = false;
  const isPDVClicked = (animTime >= 2.8 && animTime < 3.0);
  const isEstoqueClicked = false;
  
  const isSubmitClicked = (animTime >= 6.0 && animTime < 6.4);

  // Dynamic values for simulation
  const faturamentoVal = animTime >= 6.5 ? 'R$ 6.190,00' : 'R$ 4.890,00';
  const vendasVal = animTime >= 6.5 ? '13 pedidos' : '12 pedidos';
  const ticketVal = animTime >= 6.5 ? 'R$ 476,15' : 'R$ 407,50';
  const metaVal = animTime >= 6.5 ? 6190 : 4890;
  const metaPct = Math.round((metaVal / 8000) * 100);
  const pixVal = animTime >= 6.5 ? 4190 : 2890;
  const cartaoVal = 2000;
  const pixPct = Math.round((pixVal / (pixVal + cartaoVal)) * 100);
  const cartaoPct = 100 - pixPct;

  const plans = [
    {
      id: 'basic',
      title: 'Plano Básico',
      description: 'Ideal para revendedores individuais e novas lojas de sneakers.',
      price: isAnnual ? 'R$ 71,90' : 'R$ 89,90',
      period: '/mês',
      billingInfo: isAnnual ? 'Cobrado anualmente (R$ 862,80/ano)' : 'Cobrado mensalmente',
      features: [
        'Estoque de Grade Ilimitado',
        'Frente de Caixa (PDV) Premium',
        'Leitor de Código de Barras (Bipador)',
        'Dashboard Financeiro Básico',
        'Suporte por E-mail',
      ],
      cta: 'Começar Teste Grátis',
      highlighted: false,
    },
    {
      id: 'premium',
      title: 'Plano Premium',
      description: 'O padrão da indústria para sneaker shops em crescimento.',
      price: isAnnual ? 'R$ 95,90' : 'R$ 119,90',
      period: '/mês',
      billingInfo: isAnnual ? 'Cobrado anualmente (R$ 1.150,80/ano)' : 'Cobrado mensalmente',
      badge: 'Mais Escolhido',
      features: [
        'Tudo do Plano Básico',
        'Multi-usuários (Dono + 3 Vendedores)',
        'Dashboard Avançado com Metas',
        'Exportação de Relatórios (.XLSX)',
        'Suporte WhatsApp VIP 24h',
        'Crédito de Troca Automático no Carrinho',
      ],
      cta: 'Assinar Plano Premium',
      highlighted: true,
    },
    {
      id: 'scale',
      title: 'Plano Scale',
      description: 'Para operações multiloja e franquias de streetwear.',
      price: isAnnual ? 'R$ 199,90' : 'R$ 249,90',
      period: '/mês',
      billingInfo: isAnnual ? 'Cobrado anualmente (R$ 2.398,80/ano)' : 'Cobrado mensalmente',
      features: [
        'Acesso Ilimitado de Usuários',
        'Relatórios e BI Customizados',
        'Sem Mensalidades adicionais por terminal',
        'Integrações com Marketplaces',
        'Gerente de Conta Dedicado',
        'Suporte VIP Vitalício 24/7',
      ],
      cta: 'Começar Teste Grátis',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-150 flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mockFadeIn {
          from { opacity: 0; transform: translateY(1px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-quick {
          animation: mockFadeIn 0.15s ease-out forwards;
        }
        @keyframes emeraldFlash {
          0% { background-color: rgb(240, 253, 250); border-color: rgb(16, 185, 129); box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
          50% { background-color: rgb(209, 250, 229); border-color: rgb(16, 185, 129); box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3); }
          100% { background-color: white; border-color: rgb(244, 244, 245); box-shadow: none; }
        }
        .animate-emerald-flash {
          animation: emeraldFlash 1.5s ease-out forwards;
        }
      `}} />
      
      {/* 1. Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md transition-all select-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo (Left) */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="text-zinc-900 transition-transform group-hover:scale-105 flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 2h4v8.5l9.5-9.5h5.5L12 12l11 10h-5.5L8 12.5V22H4V2z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-sm text-zinc-900">
              Kicks PDV
            </span>
          </Link>

          {/* Navigation Links (Center) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            <a href="#recursos" className="hover:text-zinc-900 transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-zinc-900 transition-colors">Preços</a>
            <Link href="/login" className="hover:text-zinc-900 transition-colors">Demo</Link>
          </nav>

          {/* CTA Button (Right) */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-650 hover:text-zinc-900 transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer select-none"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 px-6 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center relative z-10">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-zinc-50 text-zinc-500 px-4 py-1.5 rounded-full mb-8 border border-zinc-150">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            O PDV Oficial das Lojas de Sneakers
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[68px] font-black tracking-tight leading-[1.08] text-zinc-900 mb-8 max-w-4xl">
            O PDV que Amarra a Gestão da sua Sneaker Shop.
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl leading-relaxed mb-12 font-medium">
            Do estoque ao caixa, tudo em um sistema rápido, bonito e intuitivo. Feito especialmente para sneaker shops e revendedores premium.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto px-8 py-4 bg-zinc-955 hover:bg-zinc-850 active:bg-zinc-900 text-white font-bold rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 text-sm select-none"
            >
              Teste Grátis 14 dias
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-2xl transition-all text-sm flex items-center justify-center select-none"
            >
              Ver Demonstração
            </Link>
          </div>

          {/* Real-time simulation warning label */}
          <div className="text-[10px] tracking-wider uppercase font-bold text-zinc-400 select-none mb-2.5 animate-pulse">
            SIMULAÇÃO DE NAVEGAÇÃO (DADOS FICTÍCIOS)
          </div>

          {/* 2.1 Dashboard App Mockup Container (Interactive Walkthrough Simulation) */}
          <div className="w-full max-w-5xl aspect-[16/10] rounded-3xl border border-zinc-200 bg-zinc-100 shadow-2xl p-3 relative overflow-hidden select-none">
            
            {/* Simulated Mouse Pointer */}
            <div 
              className="absolute pointer-events-none z-50 text-zinc-950 transition-all duration-75 ease-out" 
              style={{ left: `${cursorState.x}%`, top: `${cursorState.y}%` }}
            >
              <svg className="w-5 h-5 drop-shadow-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.65376 1.83618C5.23961 1.01784 4.02641 1.20571 3.87679 2.11585L1.08518 19.099C0.923838 20.0805 2.01633 20.7307 2.76672 20.0526L8.52843 14.8465L14.7788 22.3789C15.2289 22.9213 16.0592 22.9904 16.5959 22.5298L19.5298 20.0096C20.0664 19.5491 20.099 18.7236 19.6006 18.2252L13.4332 12.0578L20.8927 8.32804C21.7588 7.89498 21.6841 6.62104 20.7714 6.29177L5.65376 1.83618Z" fill="#09090b" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Window Controls (Mac style) */}
            <div className="flex items-center gap-1.5 mb-2.5 px-1 text-left">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[9px] text-zinc-400 font-bold ml-2 font-mono">Kicks PDV - Simulação</span>
            </div>
            
            {/* Simulated App Frame */}
            <div className="w-full h-[calc(100%-20px)] rounded-2xl bg-white border border-zinc-200/60 flex overflow-hidden shadow-inner relative">
              
              {/* Mock Sidebar */}
              <div className="w-44 bg-zinc-955 text-zinc-400 border-r border-zinc-900 p-4 flex flex-col justify-between hidden md:flex text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <div className="text-white">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 2h4v8.5l9.5-9.5h5.5L12 12l11 10h-5.5L8 12.5V22H4V2z" />
                      </svg>
                    </div>
                    <span className="font-bold text-[11px] text-white tracking-tight">Kicks PDV</span>
                  </div>
                  <div className="space-y-1">
                    <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      isDashboardActive 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : (isDashboardHovered || isDashboardClicked) 
                          ? 'bg-zinc-800 text-white scale-98' 
                          : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                    }`}>
                      Dashboard
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      isPDVActive 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : (isPDVHovered || isPDVClicked) 
                          ? 'bg-zinc-800 text-white scale-98' 
                          : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                    }`}>
                      Frente de Caixa (PDV)
                    </div>
                    <div className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      isEstoqueActive 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : (isEstoqueHovered || isEstoqueClicked) 
                          ? 'bg-zinc-800 text-white scale-98' 
                          : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-white'
                    }`}>
                      Estoque de Grade
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-zinc-400 hover:bg-zinc-900/60 hover:text-white cursor-pointer">
                      Histórico de Vendas
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-zinc-400 hover:bg-zinc-900/60 hover:text-white cursor-pointer">
                      Equipe e PINs
                    </div>
                    <div className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold text-zinc-400 hover:bg-zinc-900/60 hover:text-white cursor-pointer">
                      Configurações
                    </div>
                  </div>
                </div>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800/80 text-left">
                  <span className="text-[7px] text-zinc-500 font-bold block uppercase tracking-wider">Período de Teste</span>
                  <span className="text-[9px] text-zinc-200 font-black mt-0.5 block">Trial: 7 dias restantes</span>
                </div>
              </div>

              {/* Mock Main Content Area */}
              <div className="flex-1 bg-zinc-50/20 p-4 md:p-5 overflow-hidden flex flex-col justify-between text-left relative">
                
                {activeScreen === 'dashboard' && (
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between h-full animate-fade-in-quick">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                      <div>
                        <h4 className="text-xs font-bold tracking-tight text-zinc-900">Dashboard Financeiro</h4>
                        <p className="text-[9px] text-zinc-550 mt-0.5">Métricas de receita e histórico consolidado do caixa.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="bg-zinc-200/40 p-0.5 rounded-lg flex gap-0.5 border border-zinc-200/20 text-[8px] font-bold text-zinc-555">
                          <span className="px-1.5 py-0.5 bg-white text-zinc-900 shadow-xs rounded">7 Dias</span>
                          <span className="px-1.5 py-0.5">30 Dias</span>
                        </div>
                        <button className="flex items-center gap-1 text-[8px] px-2 py-1 rounded bg-white border border-zinc-200 text-zinc-700 font-semibold shadow-sm">
                          <Download className="w-2.5 h-2.5" />
                          <span>Exportar .XLSX</span>
                        </button>
                        <button className="flex items-center gap-1 text-[8px] px-2 py-1 rounded bg-zinc-900 text-white font-bold hover:bg-zinc-800 shadow-sm transition-all duration-150">
                          <Plus className="w-2.5 h-2.5" />
                          <span>+ Nova Venda</span>
                        </button>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-4 gap-3 my-3">
                      <div className={`p-3 rounded-xl shadow-xs flex flex-col justify-between h-20 transition-all duration-300 ${
                        (animTime >= 6.5 && animTime < 8.2) 
                          ? 'animate-emerald-flash border border-emerald-400' 
                          : 'bg-white border border-zinc-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Faturamento</span>
                          <div className="p-1 rounded bg-emerald-50 text-emerald-550 border border-emerald-100/30">
                            <DollarSign className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="mt-1">
                          <h3 className="text-sm font-black text-zinc-955 leading-none">{faturamentoVal}</h3>
                          <p className="text-[7px] text-zinc-455 mt-1 flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                            <span className="text-emerald-550 font-semibold">Receita consolidada</span>
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-zinc-100 rounded-xl shadow-xs flex flex-col justify-between h-20">
                        <div className="flex justify-between items-center">
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Vendas</span>
                          <div className="p-1 rounded bg-blue-50 text-blue-555 border border-blue-100/30">
                            <ShoppingBag className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="mt-1">
                          <h3 className="text-sm font-black text-zinc-955 leading-none">{vendasVal}</h3>
                          <p className="text-[7px] text-zinc-455 mt-1">Transações efetuadas</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-zinc-100 rounded-xl shadow-xs flex flex-col justify-between h-20">
                        <div className="flex justify-between items-center">
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Ticket Médio</span>
                          <div className="p-1 rounded bg-purple-50 text-purple-555 border border-purple-100/30">
                            <Calendar className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="mt-1">
                          <h3 className="text-sm font-black text-zinc-955 leading-none">{ticketVal}</h3>
                          <p className="text-[7px] text-zinc-455 mt-1">Média por transação</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-zinc-100 rounded-xl shadow-xs flex flex-col justify-between h-20">
                        <div className="flex justify-between items-center">
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Meta Diária</span>
                          <div className="p-1 rounded bg-amber-50 text-amber-555 border border-amber-100/30">
                            <Target className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="mt-1">
                          <div className="flex items-baseline justify-between">
                            <h3 className="text-sm font-black text-zinc-955 leading-none">{faturamentoVal}</h3>
                            <span className="text-[6.5px] text-zinc-450">meta: R$ 8.000</span>
                          </div>
                          <div className="w-full bg-zinc-100 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-550 rounded-full" style={{ width: `${metaPct}%` }} />
                          </div>
                          <p className="text-[6.5px] text-zinc-500 font-semibold mt-1 flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-zinc-400" /> Faltam R$ {Math.max(0, 8000 - metaVal)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Charts and Tables */}
                    <div className="grid grid-cols-5 gap-3 flex-1 overflow-hidden">
                      <div className="col-span-3 bg-white border border-zinc-100 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                        <div>
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider">Receita nos últimos 7 dias</span>
                          <div className="flex items-end justify-between h-20 pt-2">
                            {[10, 25, 15, 40, 20, 60, animTime >= 6.5 ? 95 : 75].map((h, i) => (
                              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                <div className="w-4 bg-zinc-900 rounded-t-xs hover:bg-zinc-850 transition-colors duration-150" style={{ height: `${h}%` }} />
                                <span className="text-[6.5px] font-bold text-zinc-400">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-zinc-100 pt-2 mt-2 flex items-center justify-between text-[7px] text-zinc-400">
                          <span>Gráfico de receita do caixa</span>
                          <span className="flex items-center gap-0.5 text-emerald-500 font-semibold">Sincronizado <ArrowUpRight className="w-2.5 h-2.5" /></span>
                        </div>
                      </div>

                      <div className="col-span-2 bg-white border border-zinc-100 rounded-xl p-3 flex flex-col justify-between shadow-xs">
                        <div>
                          <span className="text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Divisão de Pagamentos</span>
                          <p className="text-[6.5px] text-zinc-450 mb-2">Proporção financeira por meio de pagamento no período.</p>
                          
                          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden flex mb-2">
                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pixPct}%` }} />
                            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${cartaoPct}%` }} />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[7px]">
                              <div className="flex items-center gap-1 text-zinc-550">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>PIX</span>
                              </div>
                              <span className="font-semibold text-zinc-800">R$ {pixVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pixPct}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-[7px]">
                              <div className="flex items-center gap-1 text-zinc-555">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span>Cartão</span>
                              </div>
                              <span className="font-semibold text-zinc-800">R$ {cartaoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({cartaoPct}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-[7px]">
                              <div className="flex items-center gap-1 text-zinc-550">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Dinheiro</span>
                              </div>
                              <span className="font-semibold text-zinc-800">R$ 0,00 (0%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeScreen === 'pdv' && (
                  <div className="flex-1 flex flex-col justify-between h-full overflow-hidden animate-fade-in-quick">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 px-1">
                      <div>
                        <h4 className="text-xs font-bold tracking-tight text-zinc-900">Frente de Caixa (PDV)</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Operações de venda rápida de calçados e acessórios.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-855 font-bold uppercase tracking-wider animate-pulse">Caixa Aberto</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden my-2 items-stretch">
                      <div className="col-span-7 border-r border-zinc-100 p-2 flex flex-col justify-between text-left">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                          <div className="w-full pl-6 pr-2 py-1 bg-white border border-zinc-200 rounded-lg text-[9px] text-zinc-400 text-left flex items-center h-6">
                            Buscar produto ou bipar código (F2)...
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-between mt-2">
                          <div className="flex flex-col items-center justify-center py-2 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200/50">
                            <div className="flex items-center gap-1 text-zinc-455 mb-0.5">
                              <Barcode className="w-3.5 h-3.5" />
                              <span className="text-[7.5px] uppercase tracking-wider font-bold">Leitor Ativo</span>
                            </div>
                            <p className="text-[7px] text-zinc-450">Pressione F2 para buscar ou F8 para finalizar</p>
                          </div>

                          <div className="space-y-1.5 mt-2">
                            <h5 className="text-[7.5px] uppercase font-bold text-zinc-400">Acessórios & Venda Rápida</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { name: 'Kit Limpeza Premium', price: 'R$ 89' },
                                { name: 'Par de Meias', price: 'R$ 45' },
                                { name: 'Cadarço Extra', price: 'R$ 20' },
                                { name: 'Sacola Presente', price: 'R$ 10' }
                              ].map((acc, i) => (
                                <div key={i} className="p-1.5 bg-white border border-zinc-150 rounded-lg text-left flex flex-col justify-between shadow-xs">
                                  <span className="text-[7.5px] font-bold text-zinc-700 truncate">{acc.name}</span>
                                  <span className="text-[8px] font-black text-zinc-900 mt-1">{acc.price},00</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-5 bg-zinc-50/50 rounded-xl p-2.5 flex flex-col justify-between border border-zinc-100 text-left">
                        <div>
                          <div className="flex justify-between items-center pb-1.5 border-b border-zinc-100 mb-2">
                            <span className="text-[8px] font-bold text-zinc-900 uppercase">Carrinho [2]</span>
                            <span className="text-[7.5px] text-zinc-455">Itens</span>
                          </div>
                          
                          <div className="space-y-1.5 max-h-20 overflow-y-auto mb-2 pr-0.5">
                            <div className="flex items-center justify-between text-[7.5px] bg-white p-1.5 rounded-md border border-zinc-100 shadow-xs">
                              <div className="truncate max-w-[65px]">
                                <span className="font-bold text-zinc-900 block truncate">Air Force 1</span>
                                <span className="text-[6.5px] text-zinc-400 font-mono">T41 • AF-1-SUP-41</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-500 font-medium">1x</span>
                                <span className="font-bold text-zinc-900">R$ 800</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-[7.5px] bg-white p-1.5 rounded-md border border-zinc-100 shadow-xs">
                              <div className="truncate max-w-[65px]">
                                <span className="font-bold text-zinc-900 block truncate">Jordan 1 High</span>
                                <span className="text-[6.5px] text-zinc-400 font-mono">T40 • AJ-1-CHI-40</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-zinc-500 font-medium">1x</span>
                                <span className="font-bold text-zinc-900">R$ 500</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 mb-2 pt-1 border-t border-zinc-100">
                            <div>
                              <span className="text-[6.5px] text-zinc-400 font-bold block uppercase tracking-wider">Cliente</span>
                              <div className="px-1.5 py-0.5 border border-zinc-150 rounded bg-white text-[7.5px] font-bold text-zinc-805 truncate h-5 flex items-center">
                                Ana Silva
                              </div>
                            </div>
                            <div>
                              <span className="text-[6.5px] text-zinc-400 font-bold block uppercase tracking-wider">CPF</span>
                              <div className="px-1.5 py-0.5 border border-zinc-150 rounded bg-white text-[7.5px] font-medium text-zinc-805 truncate h-5 flex items-center font-mono">
                                000.000...
                              </div>
                            </div>
                            <div>
                              <span className="text-[6.5px] text-zinc-400 font-bold block uppercase tracking-wider">Vendedor</span>
                              <div className="px-1.5 py-0.5 border border-zinc-150 rounded bg-white text-[7.5px] font-bold text-zinc-805 truncate h-5 flex items-center font-mono">
                                Allison
                              </div>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-zinc-100">
                            <span className="text-[6.5px] text-zinc-400 font-bold block mb-1 uppercase tracking-wider">Pagamento</span>
                            <div className="grid grid-cols-4 gap-1">
                              {['Crédito', 'Débito', 'Pix', 'Dinheiro'].map((meth, i) => (
                                <span 
                                  key={i} 
                                  className={`py-1 text-[7px] font-extrabold rounded-md text-center border block select-none ${
                                    meth === 'Pix' 
                                      ? 'bg-zinc-955 text-white border-zinc-955 font-black' 
                                      : 'bg-white text-zinc-500 border-zinc-150'
                                  }`}
                                >
                                  {meth}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-100 mt-2">
                          <div className="space-y-0.5 text-[7px] text-zinc-500">
                            <div className="flex justify-between font-medium">
                              <span>Subtotal</span>
                              <span>R$ 1.300,00</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Desconto</span>
                              <span>R$ 0,00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-end my-1">
                            <span className="text-[8px] font-bold text-zinc-900">Total</span>
                            <span className="text-xs font-black text-zinc-955">R$ 1.300,00</span>
                          </div>
                        </div>
                          
                          <button 
                            className={`w-full py-1.5 rounded-lg text-[8px] font-bold text-center text-white select-none transition-all ${
                              isSubmitClicked 
                                ? 'bg-zinc-800 scale-98 shadow-sm' 
                                : 'bg-zinc-950 hover:bg-zinc-900'
                            }`}
                          >
                            Finalizar Venda
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {activeScreen === 'estoque' && (
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between h-full animate-fade-in-quick">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-100 px-1">
                      <div>
                        <h4 className="text-xs font-bold tracking-tight text-zinc-900">Estoque de Grade</h4>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Visualização de estoque por tamanho e códigos de barra.</p>
                      </div>
                      
                      <button className="flex items-center gap-1 text-[8px] px-2 py-1 rounded bg-zinc-955 hover:bg-zinc-850 text-white font-bold select-none cursor-pointer">
                        <Plus className="w-2.5 h-2.5" />
                        <span>Novo Tênis</span>
                      </button>
                    </div>

                    <div className="my-2 flex items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-405" />
                        <div className="w-full pl-6 pr-2 py-1 bg-white border border-zinc-200 rounded-lg text-[8px] text-zinc-450 text-left flex items-center h-6">
                          Filtrar por marca ou modelo...
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200/50 shrink-0">
                        <span className="p-1 rounded bg-zinc-900 text-white text-[7px] font-bold shadow-sm"><Layers className="w-2.5 h-2.5" /></span>
                        <span className="p-1 rounded text-zinc-400"><Grid className="w-2.5 h-2.5" /></span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
                      {['Todos os Produtos', 'Nike', 'Adidas', 'Jordan'].map((b, i) => (
                        <span 
                          key={i} 
                          className={`px-2.5 py-0.5 rounded-full text-[7.5px] font-semibold border block whitespace-nowrap select-none ${
                            b === 'Todos os Produtos' 
                              ? 'bg-zinc-900 border-zinc-900 text-white font-bold' 
                              : 'bg-white border-zinc-200 text-zinc-500'
                          }`}
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5 text-left">
                      <div className="bg-white border border-zinc-150 rounded-xl p-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200/70 border border-zinc-200/30 shrink-0 overflow-hidden flex items-center justify-center font-black text-zinc-450 text-[8px] shadow-xs">
                              AF1
                            </div>
                            <div>
                              <span className="text-[7px] text-zinc-400 font-bold block uppercase tracking-wider leading-none">Nike</span>
                              <h5 className="text-[9.5px] font-bold text-zinc-900 leading-tight">Air Force 1 Supreme - Black/White</h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <span className="text-[6.5px] text-zinc-400 font-bold block uppercase tracking-wider">Estoque Global</span>
                              <span className="text-[9.5px] font-black text-zinc-900">5 pares</span>
                            </div>
                            <button 
                              className={`py-1 px-2.5 border rounded-lg text-[8.5px] font-semibold flex items-center gap-1 transition-all ${
                                (animTime >= 10.2 && animTime < 12.0) 
                                  ? 'bg-zinc-950 border-zinc-955 text-white font-black scale-98 shadow-sm' 
                                  : 'border-zinc-200 text-zinc-700 bg-white'
                              }`}
                            >
                              <Edit className="w-2.5 h-2.5" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            { size: '38', stock: 0, desc: 'Esgotado' },
                            { size: '39', stock: 1, desc: '1 un' },
                            { size: '40', stock: 1, desc: '1 un' },
                            { size: '41', stock: 2, desc: '2 un' },
                            { size: '42', stock: 1, desc: '1 un' },
                            { size: '43', stock: 0, desc: 'Esgotado' }
                          ].map((sz, i) => (
                            <div 
                              key={i}
                              className={`p-1.5 rounded-lg border flex flex-col justify-between ${
                                sz.stock === 0
                                  ? 'bg-zinc-50 border-zinc-150 opacity-60 text-zinc-400'
                                  : sz.stock <= 1
                                  ? 'bg-amber-50/20 border-amber-250/20 text-amber-600'
                                  : 'bg-zinc-50/50 border-zinc-150'
                              }`}
                            >
                              <span className="text-[8px] font-black block">T {sz.size}</span>
                              <span className="text-[6.5px] opacity-75 font-medium mt-1">{sz.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-zinc-150 rounded-xl p-3 shadow-xs opacity-90">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200/70 border border-zinc-200/30 shrink-0 overflow-hidden flex items-center justify-center font-black text-zinc-450 text-[8px] shadow-xs">
                              YZY
                            </div>
                            <div>
                              <span className="text-[7px] text-zinc-400 font-bold block uppercase tracking-wider leading-none">Adidas</span>
                              <h5 className="text-[9.5px] font-bold text-zinc-900 leading-tight">Yeezy Boost 350 - Zebra</h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-right">
                            <div>
                              <span className="text-[6.5px] text-zinc-400 font-bold block uppercase tracking-wider">Estoque Global</span>
                              <span className="text-[9.5px] font-black text-zinc-900">12 pares</span>
                            </div>
                            <button className="py-1 px-2.5 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-[8.5px] font-semibold flex items-center gap-1">
                              <Edit className="w-2.5 h-2.5" />
                              <span>Editar</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-6 gap-1.5">
                          {[
                            { size: '38', stock: 2, desc: '2 un' },
                            { size: '39', stock: 0, desc: 'Esgotado' },
                            { size: '40', stock: 4, desc: '4 un' },
                            { size: '41', stock: 0, desc: 'Esgotado' },
                            { size: '42', stock: 6, desc: '6 un' },
                            { size: '43', stock: 0, desc: 'Esgotado' }
                          ].map((sz, i) => (
                            <div 
                              key={i}
                              className={`p-1.5 rounded-lg border flex flex-col justify-between ${
                                sz.stock === 0
                                  ? 'bg-zinc-50 border-zinc-150 opacity-60 text-zinc-400'
                                  : 'bg-zinc-50/50 border-zinc-150'
                              }`}
                            >
                              <span className="text-[8px] font-black block">T {sz.size}</span>
                              <span className="text-[6.5px] opacity-75 font-medium mt-1">{sz.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Seção de Stats (Authority Indicators) */}
      <section className="py-12 bg-zinc-50 border-b border-zinc-100 select-none">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '+500', label: 'Lojas Ativas' },
              { num: 'R$ 2M+', label: 'Transacionados' },
              { num: '100%', label: 'Seguro & Estável' },
              { num: '24/7', label: 'Suporte VIP' }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl md:text-3xl font-black text-zinc-950 font-mono tracking-tight">{stat.num}</div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Como Funciona - Split Sections */}
      <section id="recursos" className="py-20 lg:py-28 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 space-y-24 lg:space-y-36">
          
          {/* Section 1: Stock Grade (Text Left, Visual Right) */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text (Left) */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/50 flex items-center justify-center text-zinc-900 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-2xl md:text-3.5xl font-black tracking-tight text-zinc-955">
                Controle seu Estoque como um Pro
              </h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-medium">
                Nunca mais perca uma venda por falta de numeração. Nosso sistema de controle de grade é feito sob medida para colecionadores e revendedores de tênis.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  { title: "Grade Segmentada", desc: "Grade estruturada para calçados Adulto e Infantil separadamente." },
                  { title: "Geração de SKUs e EANs", desc: "Criação automática de códigos com base nos atributos do tênis." },
                  { title: "Alertas Críticos", desc: "Sinalização visual imediata de numerações que estão prestes a esgotar." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block font-bold mb-0.5">{item.title}</strong>
                      <span className="text-[11px] leading-relaxed text-zinc-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual (Right) - Interactive Size Grid Mockup */}
            <div className="w-full lg:w-1/2 p-6 bg-zinc-50 border border-zinc-200/60 rounded-3xl shadow-sm text-left select-none max-w-md mx-auto">
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block mb-4">Grade de Tamanhos & Estoque</span>
              
              {/* Category Segment Control */}
              <div className="flex bg-zinc-200/50 p-0.5 rounded-lg mb-6 w-fit text-[9px] font-bold text-zinc-500 select-none">
                <span className="px-2.5 py-1 bg-white text-zinc-900 shadow-xs rounded-md">Adulto</span>
                <span className="px-2.5 py-1 bg-transparent">Infantil</span>
              </div>

              {/* Sizes Grid */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { sz: "38", qty: 12 },
                  { sz: "39", qty: 0 },
                  { sz: "40", qty: 8 },
                  { sz: "41", qty: 1 },
                  { sz: "42", qty: 15 },
                  { sz: "43", qty: 0 },
                  { sz: "44", qty: 4 },
                  { sz: "45", qty: 2 }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2.5 rounded-xl border flex flex-col gap-0.5 justify-center ${
                      item.qty === 0 
                        ? 'bg-red-50/20 border-red-100/30' 
                        : item.qty <= 2 
                          ? 'bg-amber-50/20 border-amber-200/40' 
                          : 'bg-white border-zinc-150'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold text-zinc-800">{item.sz}</span>
                    <span className={`text-[8px] font-black ${
                      item.qty === 0 
                        ? 'text-red-500' 
                        : item.qty <= 2 
                          ? 'text-amber-600' 
                          : 'text-zinc-400'
                    }`}>
                      {item.qty === 0 ? 'Zerado' : `${item.qty} un`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 2: PDV (Visual Left, Text Right) */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Visual (Left) - Checkout screen representation */}
            <div className="w-full lg:w-1/2 p-6 bg-zinc-50 border border-zinc-200/60 rounded-3xl shadow-sm text-left select-none max-w-md mx-auto">
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider block mb-4">Checkout Rápido (PDV)</span>
              
              <div className="space-y-4 bg-white p-3.5 border border-zinc-150 rounded-2xl shadow-xs">
                {/* Product row */}
                <div className="flex gap-3 pb-3.5 border-b border-zinc-100">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 text-xs font-bold">AF1</div>
                  <div className="flex-1 text-[9px] text-left">
                    <span className="font-extrabold text-zinc-800 block">Air Force 1 Supreme White</span>
                    <span className="text-zinc-400 font-medium mt-0.5 block">Tamanho: BR 41 | SKU: AF-1-WHT-41</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-zinc-500 font-bold">Qtd: 1</span>
                      <span className="text-zinc-900 font-black">R$ 1.899,00</span>
                    </div>
                  </div>
                </div>
                
                {/* Details list */}
                <div className="space-y-2 text-[9px]">
                  <div className="flex justify-between text-zinc-500 font-semibold">
                    <span>Subtotal</span>
                    <span>R$ 1.899,00</span>
                  </div>
                  <div className="flex justify-between text-zinc-500 font-semibold">
                    <span>Desconto</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-zinc-900 font-black pt-1.5 border-t border-zinc-100">
                    <span>Total a Receber</span>
                    <span>R$ 1.899,00</span>
                  </div>
                </div>

                {/* Payment selection */}
                <div className="flex gap-2 pt-2.5">
                  <span className="flex-1 py-1.5 rounded-lg bg-zinc-900 text-white text-[8px] font-black text-center">Pix</span>
                  <span className="flex-1 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[8px] font-bold text-center">Cartão</span>
                  <span className="flex-1 py-1.5 rounded-lg border border-zinc-200 text-zinc-500 text-[8px] font-bold text-center">Dinheiro</span>
                </div>
              </div>
            </div>

            {/* Text (Right) */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/50 flex items-center justify-center text-zinc-900 shrink-0">
                <Barcode className="w-5 h-5" />
              </div>
              <h3 className="text-2xl md:text-3.5xl font-black tracking-tight text-zinc-955">
                Frente de Caixa Veloz
              </h3>
              <p className="text-zinc-650 text-sm leading-relaxed font-medium">
                Realize vendas instantâneas e emita recibos de forma fluida. O sistema suporta atalhos de teclado e leitor de código de barras para alta performance no balcão.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  { title: "Atalhos Rápidos", desc: "Aperte F2 para pesquisar ou F8 para fechar pagamentos sem tirar a mão do teclado." },
                  { title: "Bipagem de Código", desc: "Bipe EANs de tamanhos específicos para lançar diretamente na venda." },
                  { title: "Recibos Térmicos (80mm)", desc: "Envie e imprima cupons de teste e 2ª via no padrão de impressora térmica." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-xs text-zinc-600 font-medium">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-zinc-900 block font-bold mb-0.5">{item.title}</strong>
                      <span className="text-[11px] leading-relaxed text-zinc-500">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Pricing Grid */}
      <section id="precos" className="py-20 lg:py-28 bg-zinc-50/50 border-b border-zinc-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Planos simples para crescer.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium mt-3">
              Experimente grátis por 14 dias. Sem taxas ocultas ou compromissos.
            </p>
          </div>

          {/* Billing Toggle (Mensal / Anual) */}
          <div className="flex items-center gap-3 mb-16 p-1 bg-zinc-150 rounded-2xl border border-zinc-200/20 select-none">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isAnnual
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
              }`}
            >
              Faturamento Mensal
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isAnnual
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
              }`}
            >
              Faturamento Anual
              <span className="text-[9px] font-black bg-emerald-500 text-white py-0.5 px-2 rounded-full uppercase tracking-wider scale-95 origin-left">
                Economize 20%
              </span>
            </button>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch w-full">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden bg-white text-zinc-900 rounded-3xl p-6 ${
                  plan.highlighted 
                    ? 'border-zinc-350 border-2 shadow-xl md:scale-[1.03] z-10' 
                    : 'border border-zinc-200'
                }`}
              >
                {/* Highlight Badge */}
                {plan.badge && (
                  <span className="absolute top-4 right-4 text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-955 text-white border border-zinc-950">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <div className="pb-4">
                    <h3 className="text-lg font-black text-zinc-955">{plan.title}</h3>
                    <p className="text-xs text-zinc-550 mt-1 font-medium leading-normal">{plan.description}</p>
                  </div>

                  <div className="flex-1">
                    {/* Price and Period */}
                    <div className="flex flex-col mb-6 border-b border-zinc-100 pb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-955 font-mono">{plan.price}</span>
                        <span className="text-xs text-zinc-500 font-bold">{plan.period}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold mt-1.5 uppercase tracking-wider">{plan.billingInfo}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 text-xs text-zinc-650 font-medium">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug text-zinc-650">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <Link
                    href="/cadastro"
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-center block transition-all duration-200 select-none active:scale-[0.98] cursor-pointer ${
                      plan.highlighted
                        ? 'bg-zinc-955 hover:bg-zinc-850 active:bg-zinc-900 text-white shadow-md'
                        : 'border border-zinc-200 hover:bg-zinc-50 text-zinc-900 bg-transparent'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Testemunhais */}
      <section className="py-20 lg:py-28 bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              Quem usa o Kicks PDV aprova.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium mt-3">
              Depoimentos de donos de lojas de sneakers de todo o país.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "O Kicks PDV mudou a velocidade do nosso checkout. Meus vendedores amam os atalhos e a facilidade de gerar códigos de barra de numerações complexas.",
                author: "Pedro Ramos",
                role: "Dono da Drop Kicks SP"
              },
              {
                quote: "Melhor ferramenta para quem trabalha com grade de sneakers. A gestão de estoques por abas (Adulto/Infantil) resolveu nossa maior dor no balcão.",
                author: "Juliana Mendes",
                role: "Co-fundadora da Hype Store"
              },
              {
                quote: "A facilidade de emitir cupons térmicos e processar trocas diretamente no carrinho agilizou nosso atendimento no horário de pico. Recomendo 100%!",
                author: "Felipe Costa",
                role: "Gerente Operacional da Sneaker Club"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-zinc-50 border border-zinc-200/50 rounded-3xl flex flex-col justify-between text-left">
                <p className="text-xs text-zinc-650 font-medium leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="mt-6">
                  <span className="font-bold text-zinc-955 block">{t.author}</span>
                  <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-wider">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Footer Expandido */}
      <footer className="bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            
            {/* Column 1 (Brand info) */}
            <div className="col-span-2 space-y-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="text-zinc-900">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 2h4v8.5l9.5-9.5h5.5L12 12l11 10h-5.5L8 12.5V22H4V2z" />
                  </svg>
                </div>
                <span className="font-bold tracking-tight text-sm text-zinc-900">
                  Kicks PDV
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed font-semibold">
                O sistema de gestão e frente de caixa premium idealizado para o mercado de streetwear e sneaker shops.
              </p>
            </div>

            {/* Column 2 */}
            <div className="text-left">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-4">Produto</span>
              <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
                <li><a href="#recursos" className="hover:text-zinc-950 transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="hover:text-zinc-950 transition-colors">Preços</a></li>
                <li><Link href="/login" className="hover:text-zinc-950 transition-colors">Demonstração</Link></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="text-left">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-4">Empresa</span>
              <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
                <li><a href="#" className="hover:text-zinc-950 transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-zinc-950 transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-zinc-950 transition-colors">Carreiras</a></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div className="text-left">
              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-4">Suporte</span>
              <ul className="space-y-2.5 text-xs text-zinc-600 font-medium">
                <li><a href="mailto:suporte@kickspdv.com" className="hover:text-zinc-950 transition-colors flex items-center gap-1.5 font-sans">
                  <Mail className="w-3.5 h-3.5" /> suporte@kickspdv.com
                </a></li>
                <li><a href="#" className="hover:text-zinc-950 transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-zinc-950 transition-colors">Privacidade</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom attribution */}
          <div className="mt-12 pt-8 border-t border-zinc-200/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-zinc-455 font-bold select-none">
            <div>
              &copy; 2026 Kicks PDV. Todos os direitos reservados.
            </div>
            <div>
              Idealizado com estética minimalista e premium.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
