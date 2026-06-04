'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TeamMember } from '@/types';

interface TeamContextType {
  teamMembers: TeamMember[];
  addTeamMember: (name: string, role: 'admin' | 'seller', pin: string, commissionPercentage: number) => boolean;
  updateTeamMember: (id: string, name: string, role: 'admin' | 'seller', pin: string, commissionPercentage: number) => boolean;
  removeTeamMember: (id: string) => void;
  toggleMemberStatus: (id: string) => void;
  registerSaleForMember: (name: string, saleAmount: number) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Dono (Admin)',
    role: 'admin',
    status: 'active',
    pin: '1111',
    salesCountMonth: 3,
    salesValueMonth: 4199.70,
    commissionPercentage: 5
  },
  {
    id: 'mem-2',
    name: 'Lucas Vendedor',
    role: 'seller',
    status: 'active',
    pin: '2222',
    salesCountMonth: 12,
    salesValueMonth: 9540.00,
    commissionPercentage: 2
  },
  {
    id: 'mem-3',
    name: 'Mariana Silva',
    role: 'seller',
    status: 'active',
    pin: '3333',
    salesCountMonth: 8,
    salesValueMonth: 6120.50,
    commissionPercentage: 3
  }
];

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load members from LocalStorage
  useEffect(() => {
    const loadState = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedMembers = localStorage.getItem('sneaker_pos_team_members');
          if (savedMembers) {
            const parsed = JSON.parse(savedMembers);
            const normalized = Array.isArray(parsed)
              ? parsed.map((m: Partial<TeamMember>) => ({
                  ...m,
                  commissionPercentage: typeof m.commissionPercentage === 'number' ? m.commissionPercentage : 0
                } as TeamMember))
              : DEFAULT_MEMBERS;
            setTeamMembers(normalized);
            localStorage.setItem('sneaker_pos_team_members', JSON.stringify(normalized));
          } else {
            localStorage.setItem('sneaker_pos_team_members', JSON.stringify(DEFAULT_MEMBERS));
            setTeamMembers(DEFAULT_MEMBERS);
          }
        }
      } catch (e) {
        console.warn('Failed to load team members from LocalStorage:', e);
      }
    };
    setTimeout(loadState, 0);
  }, []);

  const saveToStorage = (members: TeamMember[]) => {
    setTeamMembers(members);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('sneaker_pos_team_members', JSON.stringify(members));
      }
    } catch (e) {
      console.error('Failed to save team members to LocalStorage:', e);
    }
  };

  const addTeamMember = (name: string, role: 'admin' | 'seller', pin: string, commissionPercentage: number): boolean => {
    // Check if name or pin already exists
    const nameExists = teamMembers.some(m => m.name.toLowerCase() === name.toLowerCase());
    const pinExists = teamMembers.some(m => m.pin === pin);

    if (nameExists || pinExists) {
      return false;
    }

    const newMember: TeamMember = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      role,
      status: 'active',
      pin,
      salesCountMonth: 0,
      salesValueMonth: 0,
      commissionPercentage
    };

    saveToStorage([...teamMembers, newMember]);
    return true;
  };

  const updateTeamMember = (id: string, name: string, role: 'admin' | 'seller', pin: string, commissionPercentage: number): boolean => {
    // Check if another member has the same name or PIN
    const duplicateName = teamMembers.some(m => m.id !== id && m.name.toLowerCase() === name.toLowerCase());
    const duplicatePin = teamMembers.some(m => m.id !== id && m.pin === pin);

    if (duplicateName || duplicatePin) {
      return false;
    }

    const updated = teamMembers.map(m => {
      if (m.id === id) {
        return {
          ...m,
          name: name.trim(),
          role,
          pin,
          commissionPercentage
        };
      }
      return m;
    });

    saveToStorage(updated);
    return true;
  };

  const removeTeamMember = (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    saveToStorage(updated);
  };

  const toggleMemberStatus = (id: string) => {
    const updated = teamMembers.map(m => {
      if (m.id === id) {
        return {
          ...m,
          status: (m.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive'
        };
      }
      return m;
    });
    saveToStorage(updated);
  };

  const registerSaleForMember = (name: string, saleAmount: number) => {
    const updated = teamMembers.map(m => {
      if (m.name === name) {
        return {
          ...m,
          salesCountMonth: m.salesCountMonth + 1,
          salesValueMonth: m.salesValueMonth + saleAmount
        };
      }
      return m;
    });
    saveToStorage(updated);
  };

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        addTeamMember,
        updateTeamMember,
        removeTeamMember,
        toggleMemberStatus,
        registerSaleForMember
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};
