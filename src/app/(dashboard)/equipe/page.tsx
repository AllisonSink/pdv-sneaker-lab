'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { 
  Users, 
  Plus, 
  Trash2, 
  Pencil,
  UserCheck, 
  Lock, 
  TrendingUp, 
  BadgePercent,
  Search,
  KeyRound
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeamPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { teamMembers, addTeamMember, updateTeamMember, removeTeamMember, toggleMemberStatus } = useTeam();
  const router = useRouter();

  // Search filtering
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  // Form Inputs
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'admin' | 'seller'>('seller');
  const [pinInput, setPinInput] = useState('');
  const [commissionInput, setCommissionInput] = useState('2');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.replace('/pdv');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#09090b]">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error('Informe o nome do funcionário.');
      return;
    }

    // Validate PIN (4 to 6 numeric digits)
    const pinRegex = /^[0-9]{4,6}$/;
    if (!pinRegex.test(pinInput)) {
      toast.error('O PIN de acesso deve conter de 4 a 6 dígitos apenas numéricos.');
      return;
    }

    // Validate Commission (0 to 100)
    const commissionVal = parseFloat(commissionInput);
    if (isNaN(commissionVal) || commissionVal < 0 || commissionVal > 100) {
      toast.error('A comissão deve ser um valor entre 0% e 100%.');
      return;
    }

    if (editingMemberId) {
      const success = updateTeamMember(editingMemberId, nameInput.trim(), roleInput, pinInput, commissionVal);
      if (success) {
        toast.success(`Membro ${nameInput.trim()} atualizado com sucesso!`);
        setNameInput('');
        setRoleInput('seller');
        setPinInput('');
        setCommissionInput('2');
        setEditingMemberId(null);
        setIsAddModalOpen(false);
      } else {
        toast.error('Erro: Já existe outro funcionário com este nome ou PIN cadastrado.');
      }
    } else {
      const success = addTeamMember(nameInput.trim(), roleInput, pinInput, commissionVal);
      if (success) {
        toast.success(`Membro ${nameInput.trim()} adicionado com sucesso!`);
        setNameInput('');
        setRoleInput('seller');
        setPinInput('');
        setCommissionInput('2');
        setIsAddModalOpen(false);
      } else {
        toast.error('Erro: Já existe um funcionário com este nome ou PIN cadastrado.');
      }
    }
  };

  const filteredMembers = teamMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregate stats
  const totalSellers = teamMembers.filter(m => m.role === 'seller').length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const totalSalesMonthValue = teamMembers.reduce((acc, m) => acc + m.salesValueMonth, 0);

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] p-4 lg:p-8 font-sans antialiased min-h-screen relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-200" />
            Gestão de Equipe
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gerencie o time de vendas, crie PINs de acesso e monitore comissões individuais.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="py-2.5 px-4 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-955 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-150/10 shrink-0 text-zinc-500">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-450 dark:text-zinc-550 font-bold uppercase tracking-wider">Ativos / Total</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{activeMembers} / {teamMembers.length}</p>
          </div>
        </div>
        
        <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-150/10 shrink-0 text-zinc-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-455 dark:text-zinc-550 font-bold uppercase tracking-wider">Vendedores</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{totalSellers} cadastrados</p>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-150/10 shrink-0 text-zinc-500">
            <BadgePercent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-455 dark:text-zinc-550 font-bold uppercase tracking-wider">Faturamento Equipe</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {totalSalesMonthValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Searchbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar membro pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-base md:text-xs focus:outline-none focus:ring-1 focus:ring-zinc-955 transition-all placeholder-zinc-400"
          />
        </div>
      </div>

      {/* Team Data Table */}
      {filteredMembers.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-3xl bg-white/40">
          <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-850 mx-auto mb-3" />
          <h3 className="text-sm font-semibold">Nenhum funcionário encontrado</h3>
          <p className="text-xs text-zinc-450 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Não encontramos membros cadastrados que correspondam à sua busca.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-955 border border-zinc-200/40 dark:border-zinc-900 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 uppercase font-bold tracking-wider bg-zinc-50/50 dark:bg-zinc-955">
                  <th className="py-4 px-6">Funcionário</th>
                  <th className="py-4 px-4">Cargo</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Comissão</th>
                  <th className="py-4 px-4 text-right">Vendas (Qtd)</th>
                  <th className="py-4 px-6 text-right">Faturado no Mês</th>
                  <th className="py-4 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(member => (
                  <tr 
                    key={member.id}
                    className="border-b border-zinc-100 dark:border-zinc-900 text-xs hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-zinc-150">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/80 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-bold">{member.name}</span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono mt-0.5">
                            <Lock className="w-2.5 h-2.5" /> PIN: {member.pin}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {member.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200/20">
                          Administrador
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-955/20 dark:text-blue-400 border border-blue-200/20">
                          Vendedor
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleMemberStatus(member.id)}
                        className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[9px] font-bold border cursor-pointer select-none transition-all ${
                          member.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40'
                            : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200/30 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                        {member.status === 'active' ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="block font-medium text-green-600 dark:text-green-400">
                        {(member.salesValueMonth * ((member.commissionPercentage ?? 0) / 100)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {member.commissionPercentage ?? 0}% de comissão
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-zinc-700 dark:text-zinc-200">
                      {member.salesCountMonth}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-zinc-900 dark:text-zinc-50">
                      {member.salesValueMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMemberId(member.id);
                            setNameInput(member.name);
                            setRoleInput(member.role);
                            setPinInput(member.pin);
                            setCommissionInput((member.commissionPercentage ?? 0).toString());
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                          title="Editar Membro"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {member.id !== 'mem-1' ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja excluir ${member.name} da equipe?`)) {
                                removeTeamMember(member.id);
                                toast.success('Membro removido da equipe.');
                              }
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-955/15 cursor-pointer transition-colors"
                            title="Remover Membro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium italic select-none ml-1">Dono</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Adicionar/Editar Membro */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <form 
            onSubmit={handleAddMemberSubmit}
            className="w-full max-w-sm overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 mb-4 border border-zinc-200/10 flex items-center justify-center self-center shrink-0">
              <Users className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight text-center mb-2">
              {editingMemberId ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}
            </h3>
            <p className="text-xs text-zinc-405 dark:text-zinc-500 mb-6 text-center leading-relaxed">
              {editingMemberId 
                ? 'Atualize as permissões, PIN de acesso e comissão do colaborador.' 
                : 'Cadastre um administrador ou vendedor para a comissão e PIN de acesso.'}
            </p>

            <div className="w-full space-y-4 mb-6 text-left">
              {/* Name */}
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do colaborador"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-250/20 dark:border-zinc-800 rounded-xl text-base md:text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-955 transition-all text-zinc-900 dark:text-white"
                />
              </div>

              {/* Role select */}
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  Cargo na Empresa
                </label>
                <select
                  required
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as 'admin' | 'seller')}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-250/20 dark:border-zinc-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-955 text-zinc-900 dark:text-white"
                >
                  <option value="seller">Vendedor</option>
                  <option value="admin">Administrador (Dono)</option>
                </select>
              </div>

              {/* PIN code */}
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1 flex justify-between">
                  <span>PIN de Acesso</span>
                  <span className="text-[9px] lowercase italic opacity-85">4 a 6 dígitos</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="PIN numérico (ex: 2983)"
                    value={pinInput}
                    onChange={(e) => {
                      // Filter non-numeric chars
                      const val = e.target.value.replace(/\D/g, '');
                      setPinInput(val);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-250/20 dark:border-zinc-800 rounded-xl text-base md:text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-zinc-955 transition-all text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Commission input */}
              <div>
                <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold block mb-1">
                  % de Comissão
                </label>
                <div className="relative">
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">%</span>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    step="any"
                    placeholder="Taxa de comissão (ex: 2.5)"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 bg-zinc-50 dark:bg-zinc-955 border border-zinc-250/20 dark:border-zinc-800 rounded-xl text-base md:text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-955 transition-all text-zinc-900 dark:text-white"
                  />
                </div>
                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-550">Sugestões:</span>
                  {['2', '3', '5'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setCommissionInput(pct)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer select-none active:scale-95 ${
                        commissionInput === pct
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200/40 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNameInput('');
                  setRoleInput('seller');
                  setPinInput('');
                  setCommissionInput('2');
                  setEditingMemberId(null);
                }}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-xs cursor-pointer focus:outline-none"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-black dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-100 text-white dark:text-black font-bold rounded-2xl transition-all text-xs shadow-md cursor-pointer focus:outline-none"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
