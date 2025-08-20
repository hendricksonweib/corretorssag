import { createContext, useContext, useState } from "react";

interface Filtros {
  regiaoId?: string;
  grupoId?: string;
  escolaId?: string;
  serie?: string;
  turmaId?: string;
  filtro?: string; 
   provaId?: string;
}


interface FiltroContextType {
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
}

const Context = createContext<FiltroContextType | null>(null);

export const FiltroDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [filtros, setFiltros] = useState<Filtros>({});
  return (
    <Context.Provider value={{ filtros, setFiltros }}>
      {children}
    </Context.Provider>
  );
};

export const useFiltroDashboard = () => {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useFiltroDashboard precisa estar dentro do Provider");
  return ctx;
};
