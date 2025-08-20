import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

interface Aluno {
  aluno_id: number;
  aluno_nome: string;
  turma_id: number;
  turma_nome: string;
  escola_id: number;
  escola_nome: string;
  regiao_id: number;
  grupo_id: number;
  regiao_nome: string;
  grupo_nome: string;
  total_desempenhos: number;
  media_geral: number;
  maior_nota: number;
  menor_nota: number;
}

interface ApiResponse {
  data: Aluno[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const RankingAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { filtros } = useFiltroDashboard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId); 
        if (filtros.provaId) params.append("prova_id", filtros.provaId); 

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/student-ranking?${params.toString()}`);
        const json: ApiResponse = await res.json();

        setAlunos(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      } catch (err) {
        console.error("Erro ao buscar ranking de alunos:", err);
      }
    };

    fetchData();
  }, [page, filtros]);

  const renderPagination = () => {
    const buttons = [];
    const delta = 2;

    const createPageButton = (p: number) => (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`w-8 h-8 rounded-md text-sm border transition ${
          page === p
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {p}
      </button>
    );

    if (page > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => setPage(page - 1)}
          className="px-2 h-8 rounded-md border text-gray-600 hover:bg-gray-100"
        >
          {"<"}
        </button>
      );
    }

    if (page > delta + 2) {
      buttons.push(createPageButton(1));
      buttons.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
    }

    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      buttons.push(createPageButton(i));
    }

    if (page < totalPages - delta - 1) {
      buttons.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
      buttons.push(createPageButton(totalPages));
    }

    if (page < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => setPage(page + 1)}
          className="px-2 h-8 rounded-md border text-gray-600 hover:bg-gray-100"
        >
          {">"}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold mb-5 text-gray-800">🏅 Ranking de Alunos</h2>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3">Posição</th>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Escola</th>
              <th className="px-4 py-3">Turma</th>
              <th className="px-4 py-3">Desempenho</th>
              <th className="px-4 py-3">Notas</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno, index) => {
              const posicao = (page - 1) * 20 + index + 1;
              const bg =
                posicao === 1
                  ? "bg-yellow-100"
                  : posicao <= 3
                  ? "bg-yellow-50"
                  : "hover:bg-gray-50";

              return (
                <tr key={aluno.aluno_id} className={`${bg} border-b transition`}>
                  <td className="px-4 py-3 font-medium text-gray-800">{posicao}º</td>
                  <td className="px-4 py-3">{aluno.aluno_nome}</td>
                  <td className="px-4 py-3">{aluno.escola_nome}</td>
                  <td className="px-4 py-3">{aluno.turma_nome}</td>
                  <td className="px-4 py-3 text-blue-700 font-semibold">
                    {aluno.media_geral.toFixed(1)}%
                    <span className="text-gray-400 text-xs ml-1">
                      ({aluno.total_desempenhos} avaliações)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {aluno.maior_nota} / {aluno.menor_nota}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
        <p className="text-sm text-gray-500">
          Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} alunos
        </p>
        <div className="flex gap-1 items-center">{renderPagination()}</div>
      </div>
    </div>
  );
};
