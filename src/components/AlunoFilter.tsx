import { useEffect, useState } from "react";

interface Escola {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome: string;
}

interface AlunoFilterProps {
  onFilter: (nome: string, escolaId: number | null, turmaId: number | null) => void;
}

export const AlunoFilter = ({ onFilter }: AlunoFilterProps) => {
  const [nome, setNome] = useState("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [turmaId, setTurmaId] = useState<number | "">("");

  useEffect(() => {
    const fetchEscolas = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200`);
      const data = await res.json();
      setEscolas(Array.isArray(data.data) ? data.data : data);
    };

    fetchEscolas();
  }, []);

  useEffect(() => {
    if (escolaId === "") {
      setTurmas([]);
      setTurmaId("");
      return;
    }

    const fetchTurmas = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turmas?escola_id=${escolaId}`);
      const data = await res.json();
      setTurmas(Array.isArray(data.data) ? data.data : data);
    };

    fetchTurmas();
  }, [escolaId]);

  const handleFilter = () => {
    onFilter(
      nome.trim(),
      escolaId !== "" ? escolaId : null,
      turmaId !== "" ? turmaId : null
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Buscar Alunos</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex items-center w-full md:w-1/2 relative">
          <span className="absolute left-3 text-gray-400">
            <i className="fas fa-search" />
          </span>
          <input
            type="text"
            placeholder="Digite o nome do aluno..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={escolaId}
          onChange={(e) => setEscolaId(e.target.value === "" ? "" : parseInt(e.target.value))}
        >
          <option value="">Todas as escolas</option>
          {escolas.map((escola) => (
            <option key={escola.id} value={escola.id}>
              {escola.nome}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value === "" ? "" : parseInt(e.target.value))}
        >
          <option value="">Todas as turmas</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>

        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Filtrar
        </button>
      </div>
    </div>
  );
};
