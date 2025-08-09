import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  company_id: string;
}

interface CompanyContextType {
  // State
  companies: Company[];
  branches: Branch[];
  selectedCompany: string;
  selectedBranch: string;
  isLoading: boolean;
  
  // Actions
  setSelectedCompany: (companyId: string) => void;
  setSelectedBranch: (branchId: string) => void;
  refreshCompanies: () => Promise<void>;
  refreshBranches: () => Promise<void>;
  
  // Getters
  currentCompany: Company | null;
  currentBranch: Branch | null;
  hasValidSelection: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedCompany, setSelectedCompanyState] = useState<string>('');
  const [selectedBranch, setSelectedBranchState] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load companies on user change
  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      // Reset state when user logs out
      setCompanies([]);
      setBranches([]);
      setSelectedCompanyState('');
      setSelectedBranchState('');
      setIsLoading(false);
    }
  }, [user]);

  // Load branches when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadBranches();
    } else {
      setBranches([]);
      setSelectedBranchState('');
    }
  }, [selectedCompany]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Always load all companies first
      await refreshCompanies();
      
      // If user has assigned companies, try to select the first one
      if (user?.companies && user.companies.length > 0) {
        const userCompany = user.companies[0];
        console.log('User has companies:', user.companies);
        console.log('Setting selected company to:', userCompany.id);
        
        // Check if the user's company exists in the loaded companies
        setSelectedCompanyState(userCompany.id);
      } else {
        console.log('No user companies found, user object:', user);
      }
    } catch (error) {
      console.error('Error loading initial company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCompanies = async () => {
    try {
      console.log('Fetching companies from API...');
      const response = await apiService.getCompanies();
      console.log('Companies API response:', response);
      
      if (response.success && response.data) {
        console.log('Setting companies:', response.data);
        setCompanies(response.data);
        
        // Auto-select first company if none selected
        if (response.data.length > 0 && !selectedCompany) {
          console.log('Auto-selecting first company:', response.data[0]);
          setSelectedCompanyState(response.data[0].id);
        }
      } else {
        console.log('No companies found or API call failed');
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadBranches = async () => {
    if (!selectedCompany) return;
    
    try {
      const response = await apiService.getBranchesByCompany(selectedCompany);
      if (response.success && response.data) {
        setBranches(response.data);
        
        // Reset branch selection when company changes
        setSelectedBranchState('');
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const refreshBranches = async () => {
    await loadBranches();
  };

  const setSelectedCompany = (companyId: string) => {
    setSelectedCompanyState(companyId);
    // Store in localStorage for persistence
    if (companyId) {
      localStorage.setItem('selectedCompany', companyId);
    } else {
      localStorage.removeItem('selectedCompany');
    }
  };

  const setSelectedBranch = (branchId: string) => {
    setSelectedBranchState(branchId);
    // Store in localStorage for persistence
    if (branchId) {
      localStorage.setItem('selectedBranch', branchId);
    } else {
      localStorage.removeItem('selectedBranch');
    }
  };

  // Getters
  const currentCompany = companies.find(c => c.id === selectedCompany) || null;
  const currentBranch = branches.find(b => b.id === selectedBranch) || null;
  const hasValidSelection = !!selectedCompany;

  const contextValue: CompanyContextType = {
    companies,
    branches,
    selectedCompany,
    selectedBranch,
    isLoading,
    setSelectedCompany,
    setSelectedBranch,
    refreshCompanies,
    refreshBranches,
    currentCompany,
    currentBranch,
    hasValidSelection
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
