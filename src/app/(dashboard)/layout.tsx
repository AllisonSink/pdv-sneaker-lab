'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  Users,
  Menu,
  X,
  HelpCircle,
  MessageCircle,
  Bell,
  History
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useStoreSimulator } from '@/hooks/useStoreSimulator';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Run the background event simulator
  const [isPushEnabled, setIsPushEnabled] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('sneaker_pos_push_enabled');
        return saved ? JSON.parse(saved) : false;
      }
    } catch (e) {
      console.warn('Failed to load push state:', e);
    }
    return false;
  });

  useStoreSimulator(isPushEnabled);

  // Profile Customization states
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');

  // Modal editing states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAvatar, setTempAvatar] = useState('');

  // Support states
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  // Notifications states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; text: string; date: string; unread: boolean }[]>([]);

  // Load initial notifications from LocalStorage or seed if empty
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('sneaker_pos_notifications');
        if (saved) {
          setNotifications(JSON.parse(saved));
        } else {
          const initialNotifications = [
            { id: 1, text: 'Venda aprovada: R$ 1.200,00', date: 'Hoje, 14:32', unread: true },
            { id: 2, text: 'Alerta: Air Force 1 Esgotado', date: 'Hoje, 10:15', unread: true },
          ];
          setNotifications(initialNotifications);
          localStorage.setItem('sneaker_pos_notifications', JSON.stringify(initialNotifications));
        }
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e);
    }
  }, []);

  // Listen to background simulator updates to reload notifications instantly
  useEffect(() => {
    const handleUpdate = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const saved = localStorage.getItem('sneaker_pos_notifications');
          if (saved) {
            setNotifications(JSON.parse(saved));
          }
        }
      } catch (e) {
        console.warn('Failed to update notifications:', e);
      }
    };
    window.addEventListener('sneaker_pos_update', handleUpdate);
    return () => window.removeEventListener('sneaker_pos_update', handleUpdate);
  }, []);

  const hasUnreadNotifications = notifications.some(n => n.unread);

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    try {
      localStorage.setItem('sneaker_pos_notifications', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    toast.success("Notificações marcadas como lidas.");
  };

  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      toast.error('Este navegador não suporta notificações.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificações autorizadas!');
        
        // Register service worker if supported
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado com sucesso:', registration);
          toast.success('Dispositivo ativado para receber alertas.');
        }
        setIsPushEnabled(true);
        localStorage.setItem('sneaker_pos_push_enabled', JSON.stringify(true));
      } else if (permission === 'denied') {
        toast.error('Permissão de notificações recusada.');
      }
    } catch (error) {
      console.error('Erro ao registrar notificações:', error);
      toast.error('Erro ao ativar notificações.');
    }
  };

  const handleTogglePush = async () => {
    if (isPushEnabled) {
      setIsPushEnabled(false);
      try {
        localStorage.setItem('sneaker_pos_push_enabled', JSON.stringify(false));
        toast.success("Notificações e simulador pausados.");
      } catch (e) {
        console.warn(e);
      }
    } else {
      await handleEnableNotifications();
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      toast.error("Por favor, descreva seu feedback ou sugestão.");
      return;
    }
    setIsSupportOpen(false);
    setFeedbackText('');
    toast.success("Feedback enviado! Nossa equipe vai analisar em breve.");
  };

  useEffect(() => {
    if (!user) return;

    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const { name, avatar } = JSON.parse(savedProfile);
          setProfileName(name || user.username);
          setProfileAvatar(avatar || '');
        } else {
          setProfileName(user.username);
          setProfileAvatar('');
        }
      } catch (e) {
        console.warn("Error loading user profile", e);
        setProfileName(user.username);
        setProfileAvatar('');
      }
    };

    // Use a timeout fallback to schedule async loading
    const timer = setTimeout(loadProfile, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const openEditProfile = () => {
    setTempName(profileName);
    setTempAvatar(profileAvatar);
    setIsEditProfileOpen(true);
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    const options = {
      maxSizeMB: 0.1, // 100KB is 0.1MB
      maxWidthOrHeight: 256,
      useWebWorker: true,
    };

    try {
      const imageCompression = (await import('browser-image-compression')).default;
      const compressedFile = await imageCompression(imageFile, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setTempAvatar(base64data);
      };
    } catch (error) {
      console.error(error);
      toast.error("Erro ao comprimir imagem.");
    }
  };

  const handleSaveProfile = () => {
    if (!tempName.trim()) {
      toast.error("O nome de exibição não pode ser vazio.");
      return;
    }
    try {
      const profileData = {
        name: tempName.trim(),
        avatar: tempAvatar,
      };
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      setProfileName(profileData.name);
      setProfileAvatar(profileData.avatar);
      setIsEditProfileOpen(false);
      toast.success("Perfil atualizado!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar alterações.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Sidebar Links based on role
  const allLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, role: ['admin'] },
    { href: '/pdv', label: 'Frente de Caixa (PDV)', icon: ShoppingBag, role: ['admin', 'seller'] },
    { href: '/historico', label: 'Histórico de Vendas', icon: History, role: ['admin', 'seller'] },
    { href: '/estoque', label: 'Estoque & Produtos', icon: Layers, role: ['admin'] },
    { href: '/configuracoes', label: 'Configurações', icon: Settings, role: ['admin'] },
    { href: '/equipe', label: 'Equipe & Vendedores', icon: Users, role: ['admin'] },
  ];

  // Filter links by user role
  const navLinks = allLinks.filter(link => link.role.includes(user.role));

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 font-sans antialiased">
           {/* 1. DESKTOP SIDEBAR */}
      <aside 
        className={`relative hidden md:flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200/40 dark:border-zinc-900 sticky top-0 h-screen transition-all duration-300 ease-in-out z-40 ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Toggle Button sits on the right border */}
        <button 
          onClick={toggleSidebar}
          className="absolute top-6 -right-3 z-50 p-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-full shadow-md text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center w-6 h-6 focus:outline-none"
          title={isSidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
        >
          {isSidebarExpanded ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Sidebar Header / Logo */}
        <div className={`h-16 flex items-center border-b border-zinc-100 dark:border-zinc-900 transition-all duration-300 ${
          isSidebarExpanded ? 'px-5 justify-between' : 'px-0 justify-center'
        }`}>
          <div 
            onClick={toggleSidebar}
            className={`flex items-center cursor-pointer select-none group transition-all duration-300 ${
              isSidebarExpanded ? 'gap-3' : 'gap-0'
            }`}
            title={isSidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
          >
            <div className="w-8.5 h-8.5 rounded-xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 font-bold shrink-0 shadow-md group-hover:scale-105 transition-transform">
              S
            </div>
            <span className={`font-bold tracking-tight text-sm truncate transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
            }`}>
              Sneaker Lab
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center rounded-2xl text-sm font-medium transition-all group select-none active:scale-[0.98] ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-md shadow-zinc-950/5'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-450 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60'
                } ${isSidebarExpanded ? 'gap-3.5 py-3 px-3.5' : 'gap-0 justify-center py-3 px-0'}`}
                title={!isSidebarExpanded ? link.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'scale-105' : 'group-hover:scale-105 transition-transform'}`} />
                <span className={`truncate transition-all duration-300 ease-in-out ${
                  isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Ajuda & Suporte Trigger */}
          <button
            onClick={() => setIsSupportOpen(true)}
            className={`w-full flex items-center rounded-2xl text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-450 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60 transition-all group select-none active:scale-[0.98] cursor-pointer ${
              isSidebarExpanded ? 'gap-3.5 py-3 px-3.5' : 'gap-0 justify-center py-3 px-0'
            }`}
            title={!isSidebarExpanded ? "Ajuda & Suporte" : undefined}
          >
            <HelpCircle className={`w-5 h-5 shrink-0 group-hover:scale-105 transition-transform`} />
            <span className={`truncate text-left transition-all duration-300 ease-in-out ${
              isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
            }`}>
              Ajuda & Suporte
            </span>
          </button>

          {/* Notificações Bell Item */}
          {user.role === 'admin' && (
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className={`w-full flex items-center rounded-2xl text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-450 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60 transition-all group select-none active:scale-[0.98] cursor-pointer relative ${
                isSidebarExpanded ? 'gap-3.5 py-3 px-3.5' : 'gap-0 justify-center py-3 px-0'
              }`}
              title={!isSidebarExpanded ? "Notificações" : undefined}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {hasUnreadNotifications && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-950 animate-pulse" />
                )}
              </div>
              <span className={`truncate text-left transition-all duration-300 ease-in-out ${
                isSidebarExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
              }`}>
                Notificações
              </span>
              {isSidebarExpanded && hasUnreadNotifications && (
                <span className="ml-auto text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {notifications.filter(n => n.unread).length}
                </span>
              )}
            </button>
          )}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="mt-auto p-4 border-t border-border pb-6 transition-all duration-300">
          {isSidebarExpanded ? (
            <div className="flex items-center justify-between p-1 rounded-2xl bg-transparent">
              <button
                onClick={openEditProfile}
                className="flex flex-1 items-center gap-3 min-w-0 p-2 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors duration-200 text-left focus:outline-none cursor-pointer"
                title="Editar Perfil"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-zinc-800 overflow-hidden">
                  {profileAvatar ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{getInitials(profileName)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate text-zinc-900 dark:text-zinc-50">{profileName}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                    {user.role === 'admin' ? 'Dono / Admin' : 'Vendedor'}
                  </p>
                </div>
              </button>
              <button
                onClick={logout}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none"
                title="Sair do Sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={openEditProfile}
                className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors duration-200 cursor-pointer focus:outline-none overflow-hidden"
                title="Editar Perfil"
              >
                {profileAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{getInitials(profileName)}</span>
                )}
              </button>
              <button
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center text-zinc-450 hover:text-red-500 transition-colors duration-200 cursor-pointer focus:outline-none"
                title="Sair do Sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200/40 dark:border-zinc-900 px-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 font-bold">
              S
            </div>
            <span className="font-bold tracking-tight text-sm">Sneaker Lab</span>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 rounded-xl bg-zinc-55 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-300 relative shrink-0"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-950 animate-pulse" />
                )}
              </button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Slide-over Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute top-0 bottom-0 right-0 w-64 bg-white dark:bg-zinc-950 border-l border-zinc-200/60 dark:border-zinc-900 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Navegação</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <nav className="space-y-1.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3.5 py-3.5 px-4 rounded-2xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}

                  {/* Ajuda & Suporte Trigger (Mobile Drawer) */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSupportOpen(true);
                    }}
                    className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60 transition-all text-left cursor-pointer"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span>Ajuda & Suporte</span>
                  </button>

                  {/* Notificações Trigger (Mobile Drawer) */}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsNotificationsOpen(true);
                      }}
                      className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-2xl text-sm font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60 transition-all text-left cursor-pointer relative"
                    >
                      <div className="relative">
                        <Bell className="w-5 h-5" />
                        {hasUnreadNotifications && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-950 animate-pulse" />
                        )}
                      </div>
                      <span>Notificações</span>
                      {hasUnreadNotifications && (
                        <span className="ml-auto text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {notifications.filter(n => n.unread).length}
                        </span>
                      )}
                    </button>
                  )}
                </nav>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-3 p-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200/20 overflow-hidden">
                    {profileAvatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{getInitials(profileName)}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">{profileName}</p>
                    <p className="text-[9px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold">
                      {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3.5 py-3 px-4 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto pb-6 md:pb-0">
          {children}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div 
            className="w-full max-w-sm overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-6 w-full text-left">
              Editar Perfil
            </h3>

            {/* Avatar upload circular area */}
            <div className="relative group cursor-pointer mb-6">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
                id="avatar-upload"
              />
              <label 
                htmlFor="avatar-upload"
                className="block w-24 h-24 rounded-full border-2 border-dashed border-zinc-250 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center justify-center overflow-hidden cursor-pointer relative group transition-all"
              >
                {tempAvatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="flex flex-col items-center text-zinc-450 dark:text-zinc-500">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">Foto</span>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  Alterar
                </div>
              </label>
            </div>

            {/* Name Input */}
            <div className="w-full space-y-2 mb-8">
              <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-semibold text-left block">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
                placeholder="Seu nome de exibição"
              />
            </div>

            {/* Buttons */}
            <div className="w-full flex gap-3">
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-sm cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl transition-all text-sm shadow-md cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div 
            className="w-full max-w-sm overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col items-center transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mb-1 w-full text-left">
              Como podemos ajudar?
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-450 mb-6 w-full text-left leading-relaxed">
              Escolha um canal de atendimento ou reporte um problema no sistema.
            </p>

            {/* WhatsApp Primary Action */}
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1] active:bg-emerald-500/[0.15] dark:bg-emerald-500/[0.06] dark:hover:bg-emerald-500/[0.1] border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm select-none"
            >
              <MessageCircle className="w-4 h-4" />
              Fale Conosco (WhatsApp)
            </a>

            {/* Divider */}
            <div className="w-full border-t border-zinc-100 dark:border-zinc-900 my-6" />

            {/* Report Bug Secondary Action */}
            <div className="w-full space-y-2 mb-6">
              <label className="text-[10px] text-zinc-450 dark:text-zinc-500 uppercase font-bold tracking-wider text-left block">
                Reportar Bug ou Sugestão
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Descreva o bug ou deixe sua sugestão..."
                className="w-full h-24 p-3 bg-zinc-50/50 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-50/10 focus:border-zinc-900 dark:focus:border-zinc-50 transition-all placeholder-zinc-400 dark:placeholder-zinc-650 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="w-full flex gap-3">
              <button
                onClick={() => {
                  setIsSupportOpen(false);
                  setFeedbackText('');
                }}
                className="flex-1 py-3 px-4 bg-zinc-100 hover:bg-zinc-200/80 active:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium rounded-2xl transition-all text-sm cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSendFeedback}
                className="flex-1 py-3 px-4 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl transition-all text-sm shadow-md cursor-pointer"
              >
                Enviar Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <div 
            className="w-full max-w-md overflow-hidden bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-3xl p-6 md:p-8 flex flex-col transform scale-100 transition-transform duration-300 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-zinc-150/40 dark:border-zinc-900 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-zinc-800 dark:text-zinc-250" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-55 tracking-tight">
                  Central de Notificações
                </h3>
              </div>
              {hasUnreadNotifications && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {/* List */}
            <div className="space-y-3 my-2 max-h-60 overflow-y-auto pr-1">
              {notifications.map((item) => (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 text-left ${
                    item.unread
                      ? 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-850'
                      : 'bg-transparent border-zinc-100 dark:border-zinc-900/40 opacity-70'
                  }`}
                >
                  {item.unread && (
                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-normal">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* PWA Notification Opt-in Toggle */}
            <div className="w-full mt-4">
              <button
                onClick={handleTogglePush}
                className={`w-full py-3 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs ${
                  isPushEnabled
                    ? 'bg-red-500/[0.06] hover:bg-red-500/[0.10] active:bg-red-500/[0.15] dark:bg-red-500/[0.04] dark:hover:bg-red-500/[0.08] border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400'
                    : 'bg-emerald-550/[0.08] hover:bg-emerald-550/[0.12] active:bg-emerald-550/[0.18] dark:bg-emerald-500/[0.08] dark:hover:bg-emerald-500/[0.12] border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isPushEnabled ? 'Desativar Notificações' : 'Ativar Notificações no Celular'}
              </button>
            </div>

            {/* Close Button */}
            <div className="w-full mt-3 flex">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-850 active:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:active:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-2xl transition-all text-sm shadow-md cursor-pointer text-center focus:outline-none"
              >
                Fechar Notificações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
