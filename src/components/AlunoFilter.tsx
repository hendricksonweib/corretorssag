import { useEffect, useState } from "react";
import { Search, Filter, X, School as SchoolIcon, Users } from "lucide-react";

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
  const [loadingEscolas, setLoadingEscolas] = useState(true);
  const [loadingTurmas, setLoadingTurmas] = useState(false);

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        setLoadingEscolas(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200`);
        const data = await res.json();
        setEscolas(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Erro ao carregar as escolas:", error);
      } finally {
        setLoadingEscolas(false);
      }
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
      try {
        setLoadingTurmas(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turmas?escola_id=${escolaId}`);
        const data = await res.json();
        setTurmas(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Erro ao carregar as turmas:", error);
      } finally {
        setLoadingTurmas(false);
      }
    };
    fetchTurmas();
  }, [escolaId]);

  const handleFilter = (e?: React.FormEvent) => {
    e?.preventDefault();
    onFilter(
      nome.trim(),
      escolaId !== "" ? escolaId : null,
      turmaId !== "" ? turmaId : null
    );
  };

  const handleClear = () => {
    setNome("");
    setEscolaId("");
    setTurmaId("");
    onFilter("", null, null);
  };

  const hasActiveFilters = nome !== "" || escolaId !== "" || turmaId !== "";

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Search size={20} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
            Buscar Alunos
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              type="button"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <X size={16} />
              Limpar Filtros
            </button>
          )}
        </div>
      </header>

      <form
        onSubmit={handleFilter}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3"
      >
        {/* Campo de busca por nome */}
        <div className="lg:col-span-4">
          <label htmlFor="busca-aluno" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do aluno
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              id="busca-aluno"
              type="text"
              placeholder="Digite o nome do aluno..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              inputMode="text"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Select de Escola */}
        <div className="lg:col-span-3">
          <label htmlFor="select-escola" className="block text-sm font-medium text-gray-700 mb-1">
            Escola
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SchoolIcon size={18} />
            </div>
            <select
              id="select-escola"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
              value={escolaId}
              onChange={(e) => setEscolaId(e.target.value === "" ? "" : parseInt(e.target.value))}
              disabled={loadingEscolas}
            >
              <option value="">Todas as escolas</option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
              {loadingEscolas ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <Filter size={16} />
              )}
            </div>
          </div>
        </div>

        {/* Select de Turma */}
        <div className="lg:col-span-3">
          <label htmlFor="select-turma" className="block text-sm font-medium text-gray-700 mb-1">
            Turma
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Users size={18} />
            </div>
            <select
              id="select-turma"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              value={turmaId}
              disabled={escolaId === "" || loadingTurmas}
              onChange={(e) => setTurmaId(e.target.value === "" ? "" : parseInt(e.target.value))}
            >
              <option value="">
                {escolaId === "" ? "Selecione uma escola" : "Todas as turmas"}
              </option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400">
              {loadingTurmas ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              ) : (
                <Filter size={16} />
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação - Desktop */}
        <div className="lg:col-span-2 flex flex-col justify-end">
          <div className="hidden sm:flex items-center gap-2 h-full">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
            >
              Filtrar
            </button>
          </div>
        </div>

        {/* Botões de ação - Mobile */}
        <div className="sm:hidden flex gap-2 col-span-full">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              <X size={16} />
              Limpar
            </button>
          )}
          <button
            type="submit"
            className="flex-1 px-3 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium"
          >
            Aplicar Filtros
          </button>
        </div>
      </form>

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {nome && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Nome: {nome}
              <button
                onClick={() => setNome("")}
                className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {escolaId !== "" && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Escola: {escolas.find(e => e.id === escolaId)?.nome}
              <button
                onClick={() => setEscolaId("")}
                className="ml-1 rounded-full hover:bg-green-200 p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          )}
          {turmaId !== "" && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Turma: {turmas.find(t => t.id === turmaId)?.nome}
              <button
                onClick={() => setTurmaId("")}
                className="ml-1 rounded-full hover:bg-purple-200 p-0.5"
              >
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
};