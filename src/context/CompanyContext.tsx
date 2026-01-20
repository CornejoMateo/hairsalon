import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Company from '../models/Company';
import { getCompanies } from '../database/company';
import { useDatabase } from '../database/databaseProvider';

interface CompanyContextType {
    company: Company | null;
    refreshCompany: () => void;
    isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
    children: ReactNode;
}

export const CompanyProvider = ({ children }: CompanyProviderProps) => {
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isReady } = useDatabase();

    const loadCompany = () => {
        if (!isReady) return;
        
        try {
            const companies = getCompanies();
            if (companies.length > 0) {
                setCompany(companies[0]);
            }
        } catch (error) {
            console.error('Error al cargar la compañía:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCompany();
    }, [isReady]);

    const refreshCompany = () => {
        loadCompany();
    };

    return (
        <CompanyContext.Provider value={{ company, refreshCompany, isLoading }}>
            {children}
        </CompanyContext.Provider>
    );
};

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany debe ser usado dentro de un CompanyProvider');
    }
    return context;
};
