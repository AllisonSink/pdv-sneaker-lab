'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  ShoppingBag, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Bell, 
  RotateCcw 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'basic',
      title: 'Plano Básico',
      description: 'Ideal para revendedores individuais e novas lojas.',
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
      cta: 'Começar o Teste Grátis',
      highlighted: false,
    },
    {
      id: 'pro',
      title: 'Plano Pro',
      description: 'O padrão da indústria para lojas de sneakers em crescimento.',
      price: isAnnual ? 'R$ 119,90' : 'R$ 149,90',
      period: '/mês',
      billingInfo: isAnnual ? 'Cobrado anualmente (R$ 1.438,80/ano)' : 'Cobrado mensalmente',
      badge: 'Mais Escolhido',
      features: [
        'Tudo do Plano Básico',
        'Multi-usuários (Dono + 3 Vendedores)',
        'Dashboard Avançado com Metas',
        'Exportação de Relatórios (.XLSX)',
        'Suporte WhatsApp VIP 24h',
        'Crédito de Troca Automático no Carrinho',
      ],
      cta: 'Começar o Teste Grátis',
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
      cta: 'Começar o Teste Grátis',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased selection:bg-zinc-150 flex flex-col">
      
      {/* 1. Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/40 bg-white/85 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
              K
            </div>
            <span className="font-bold tracking-tight text-sm text-zinc-900">
              Kicks PDV
            </span>
          </Link>

          {/* Action Button */}
          <Link
            href="/login"
            className="text-xs sm:text-sm border border-zinc-200 hover:bg-zinc-50 px-4 py-2 rounded-2xl font-medium transition-all duration-200 focus:outline-none text-zinc-900 bg-transparent"
          >
            Já tenho acesso
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest bg-zinc-100 text-zinc-500 px-3.5 py-1.5 rounded-full mb-8 shadow-xs border border-zinc-200/20">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            O PDV Oficial das Lojas de Sneakers
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-[70px] font-bold tracking-tight leading-[1.08] text-zinc-900 mb-8 max-w-3xl">
            A gestão da sua loja de Sneakers, elevada ao nível premium.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl leading-relaxed mb-12">
            Do estoque à venda final. O PDV feito para quem entende que cada detalhe importa.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-6">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-zinc-800 active:bg-zinc-900 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              Começar o Teste Grátis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-semibold rounded-2xl transition-all text-sm flex items-center justify-center"
            >
              Ver Demonstração
            </Link>
          </div>
          
          {/* Social Proof */}
          <p className="text-[11px] text-zinc-400 font-medium">
            Aprovado por operações reais de streetwear.
          </p>
        </div>

        {/* Subtle Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
      </section>

      {/* 3. Features Highlights (Bento Box Grid) */}
      <section className="py-24 border-t border-zinc-100 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4 sm:text-4xl">
              Projetado para revendedores de alta performance
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
              Elimine planilhas complexas e controle tudo em uma única interface integrada e fluida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bento Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100 shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2">PDV Nativo e Fluido</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Realize vendas instantâneas por código de barras ou busca rápida de produtos. Grade completa integrada e emissão de cupons de forma fluida.
                </p>
              </div>
            </div>
            
            {/* Bento Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100 shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2">Alertas Inteligentes de Estoque</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Centralização de estoque crítico e reposição instantânea. Monitore numerações baixas ou esgotadas em tempo real com facilidade.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-900 mb-6 border border-zinc-100 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 mb-2">Trocas sem dor de cabeça</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Gere créditos a partir de produtos devolvidos e os aplique automaticamente no carrinho. Perfeito para upsells de tamanhos ou modelos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing Section */}
      <section id="planos" className="py-24 bg-white border-t border-zinc-100 px-6 scroll-mt-16">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4 sm:text-4xl">
              Plano ideal para o seu tamanho
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 leading-relaxed">
              Experimente grátis por 14 dias. Sem taxa de setup e com cancelamento a qualquer momento.
            </p>
          </div>

          {/* Pricing Toggle (Monthly vs. Annual) */}
          <div className="flex items-center gap-3 mb-16 p-1 bg-zinc-100 rounded-2xl border border-zinc-200/10 select-none">
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
              <Card 
                key={plan.id}
                className={`flex flex-col justify-between transition-all hover:shadow-lg relative overflow-hidden bg-white text-zinc-900 ${
                  plan.highlighted 
                    ? 'border-zinc-900 border-2 shadow-xl md:scale-[1.03] z-10' 
                    : 'border-zinc-200/80'
                }`}
              >
                {/* Highlight / Promo Badge */}
                {plan.badge && (
                  <span className="absolute top-4 right-4 text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-black text-white border border-zinc-900">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-lg font-bold text-zinc-900">{plan.title}</CardTitle>
                    <CardDescription className="text-xs text-zinc-500 mt-1">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 pt-0 flex-1">
                    {/* Price and Period */}
                    <div className="flex flex-col mb-6 border-b border-zinc-100 pb-5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">{plan.price}</span>
                        <span className="text-xs text-zinc-500 font-medium">{plan.period}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium mt-1">{plan.billingInfo}</span>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3.5 text-xs text-zinc-650">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </div>

                <CardFooter className="p-6 pt-0 mt-auto">
                  <Link
                    href="/cadastro"
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-center transition-all duration-200 select-none active:scale-[0.98] ${
                      plan.highlighted
                        ? 'bg-black hover:bg-zinc-800 active:bg-zinc-900 text-white shadow-md'
                        : 'border border-zinc-200 hover:bg-zinc-50 text-zinc-900 bg-transparent'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trust Badges / Social Proof */}
      <section className="py-24 border-t border-zinc-150 bg-slate-50 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-zinc-400 mb-4" />
          <h3 className="font-bold text-xl text-zinc-900 mb-2">Segurança de Dados de Nível Empresarial</h3>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md leading-relaxed">
            Seus dados de faturamento, estoque de grade e registros de clientes são protegidos por criptografia de ponta a ponta com redundância de servidores.
          </p>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-zinc-200/60 bg-white">
        <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-medium">
          <div>
            &copy; 2026 Kicks PDV. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-900 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Políticas de Privacidade</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
