import { useEffect, useState } from "react";

interface Regiao {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
}

interface SchoolFilterProps {
  onFilter: (nome: string, regiaoId: number | null, grupoId: number | null) => void;
}

export const SchoolFilter = ({ onFilter }: SchoolFilterProps) => {
  const [nome, setNome] = useState("");
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [regiaoId, setRegiaoId] = useState<number | "">("");
  const [grupoId, setGrupoId] = useState<number | "">("");

  useEffect(() => {
    const fetchRegioes = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/regioes`);
      const data = await res.json();
      setRegioes(data);
    };

    const fetchGrupos = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos`);
      const data = await res.json();
      setGrupos(data);
    };

    fetchRegioes();
    fetchGrupos();
  }, []);

  const handleFilter = () => {
    onFilter(
      nome.trim(),
      regiaoId !== "" ? regiaoId : null,
      grupoId !== "" ? grupoId : null
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-all">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Buscar Escolas</h2>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex items-center w-full md:w-1/2 relative">
          <span className="absolute left-3 text-gray-400 pointer-events-none">
            <i className="fas fa-search" />
          </span>
          <input
            type="text"
            placeholder="Digite o nome da escola..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <select
          className="w-full md:w-auto px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          value={regiaoId}
          onChange={(e) =>
            setRegiaoId(e.target.value === "" ? "" : parseInt(e.target.value))
          }
        >
          <option value="">Todas as regiões</option>
          {regioes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>

        <select
          className="w-full md:w-auto px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          value={grupoId}
          onChange={(e) =>
            setGrupoId(e.target.value === "" ? "" : parseInt(e.target.value))
          }
        >
          <option value="">Todos os grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition-all duration-200"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
};
