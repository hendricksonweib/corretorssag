import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

interface Habilidade {
  bncc_id: number;
  bncc_codigo: string;
  bncc_descricao: string;
  bncc_serie: string;
  componente_curricular_nome: string;
  total_questoes: number;
  total_respostas: number;
  total_acertos: number;
  percentual_acertos: number | string;
}

interface ApiResponse {
  data: Habilidade[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const TabelaHabilidadesBNCC = () => {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selecionada, setSelecionada] = useState<Habilidade | null>(null);
  const [filtroOrdem, setFiltroOrdem] = useState<"acertos" | "erros">("acertos");
  const { filtros } = useFiltroDashboard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        params.append("filtro", filtroOrdem);

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
        if (filtros.provaId) params.append("prova_id", filtros.provaId); // ✅ corrigido aqui

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/bncc-skills?${params.toString()}`);
        const json: ApiResponse = await res.json();

        setHabilidades(json.data);
        setTotalPages(json.totalPages);
        setTotal(json.total);
      } catch (err) {
        console.error("Erro ao buscar habilidades BNCC:", err);
      }
    };

    fetchData();
  }, [page, filtros, filtroOrdem]);

  const renderPagination = () => {
    const pagesToShow = [];
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
      pagesToShow.push(<span key="dots1" className="px-2">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pagesToShow.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded border ${
            page === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages - 1) {
      pagesToShow.push(<span key="dots2" className="px-2">...</span>);
    }

    return pagesToShow;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Habilidades BNCC / SAEB</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFiltroOrdem("erros");
              setPage(1);
            }}
            className={`px-3 py-1 text-sm rounded ${
              filtroOrdem === "erros"
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            Mais Críticas
          </button>
          <button
            onClick={() => {
              setFiltroOrdem("acertos");
              setPage(1);
            }}
            className={`px-3 py-1 text-sm rounded ${
              filtroOrdem === "acertos"
                ? "bg-green-500 text-white"
                : "bg-green-100 text-green-600 hover:bg-green-200"
            }`}
          >
            Melhores Resultados
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {habilidades.map(h => {
          const percentual = parseFloat(h.percentual_acertos as any);
          const pct = isNaN(percentual) ? "0.00%" : percentual.toFixed(2) + "%";

          let bgColor = "bg-green-100 text-green-800";
          if (percentual < 70) {
            bgColor = "bg-yellow-100 text-yellow-800";
          }

          return (
            <button
              key={h.bncc_id}
              onClick={() => setSelecionada(h)}
              className={`${bgColor} p-4 rounded-lg text-left shadow hover:shadow-md transition`}
            >
              <p className="font-bold text-sm">{h.bncc_codigo}</p>
              <p className="text-2xl font-extrabold">{pct}</p>
              <p className="text-xs text-gray-600">
                {h.total_questoes} {h.total_questoes > 1 ? "questões" : "questão"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">
          Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, total)} de {total} resultados
        </p>
        <div className="flex gap-1 items-center">
          <button
            onClick={() => setPage(1)}
            className="w-8 h-8 border rounded bg-white hover:bg-gray-100"
          >
            ‹
          </button>
          {renderPagination()}
          <button
            onClick={() => setPage(totalPages)}
            className="w-8 h-8 border rounded bg-white hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>

      {selecionada && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg" role="dialog" aria-modal="true">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selecionada.bncc_codigo}</h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelecionada(null)}
              >
                ✕
              </button>
            </div>

            <p><strong>Componente:</strong> {selecionada.componente_curricular_nome}</p>
            <p><strong>Série:</strong> {selecionada.bncc_serie}</p>
            <p><strong>Descrição:</strong> {selecionada.bncc_descricao}</p>
            <p><strong>Total de Questões:</strong> {selecionada.total_questoes}</p>
            <p><strong>Média de Desempenho:</strong> {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%</p>

            <div className="mt-4">
              <h4 className="font-semibold">Evolução do Desempenho</h4>
              <p className="text-gray-500 italic py-4 border rounded">
                Não há dados históricos suficientes para exibir a evolução.
              </p>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Histórico Detalhado</h4>
              <table className="w-full text-sm text-left text-gray-700 mt-2">
                <thead>
                  <tr>
                    <th className="py-2">Avaliação</th>
                    <th className="py-2">Data</th>
                    <th className="py-2">Desempenho</th>
                    <th className="py-2">Evolução</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Média de {selecionada.total_questoes} questões</td>
                    <td className="py-2">Data não disponível</td>
                    <td className="py-2 text-green-600">
                      {parseFloat(selecionada.percentual_acertos as any).toFixed(2)}%
                    </td>
                    <td className="py-2">Primeira avaliação</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setSelecionada(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
