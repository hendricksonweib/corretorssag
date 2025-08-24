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
  onOpenCreateAlunoModal: () => void;
}

export const AlunoFilter = ({ onFilter, onOpenCreateAlunoModal }: AlunoFilterProps) => {
  const [nome, setNome] = useState("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [turmaId, setTurmaId] = useState<number | "">("");

  useEffect(() => {
    const fetchEscolas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200`);
        const data = await res.json();
        setEscolas(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Erro ao carregar as escolas:", error);
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/turmas?escola_id=${escolaId}`);
        const data = await res.json();
        setTurmas(Array.isArray(data.data) ? data.data : []);
      } catch (error) {
        console.error("Erro ao carregar as turmas:", error);
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

  return (
    <section className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 md:p-6 mb-6">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
          Buscar Alunos
        </h2>

        <div className="hidden sm:flex gap-2">
          <button
            onClick={handleClear}
            type="button"
            className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Limpar
          </button>
          <button
            onClick={onOpenCreateAlunoModal}
            type="button"
            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Criar Aluno
          </button>
        </div>
      </header>

      <form
        onSubmit={handleFilter}
        className="
          grid gap-3
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          auto-rows-fr
        "
      >
        <div className="relative">
          <label htmlFor="busca-aluno" className="sr-only">
            Nome do aluno
          </label>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="fas fa-search" />
          </span>
          <input
            id="busca-aluno"
            type="text"
            placeholder="Digite o nome do aluno..."
            className="
              w-full pl-10 pr-3 py-2.5
              rounded-lg border border-gray-300
              text-gray-800 placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            inputMode="text"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="select-escola" className="sr-only">
            Escola
          </label>
          <select
            id="select-escola"
            className="
              w-full px-3 py-2.5
              rounded-lg border border-gray-300 bg-white
              text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            "
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
        </div>

        <div>
          <label htmlFor="select-turma" className="sr-only">
            Turma
          </label>
          <select
            id="select-turma"
            className="
              w-full px-3 py-2.5
              rounded-lg border border-gray-300 bg-white
              text-gray-800
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-60 disabled:cursor-not-allowed
            "
            value={turmaId}
            disabled={escolaId === "" || turmas.length === 0}
            onChange={(e) => setTurmaId(e.target.value === "" ? "" : parseInt(e.target.value))}
          >
            <option value="">
              {escolaId === "" ? "Escolha uma escola" : "Todas as turmas"}
            </option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="flex-1 px-3 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Filtrar
          </button>
        </div>

        <div className="hidden sm:flex items-stretch gap-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={onOpenCreateAlunoModal}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Criar Aluno
          </button>
        </div>
      </form>
    </section>
  );
};
