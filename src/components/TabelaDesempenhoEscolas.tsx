import { useEffect, useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

interface EscolaDesempenho {
  escola_id: number;
  escola_nome: string;
  regiao_id: number;
  grupo_id: number;
  regiao_nome: string;
  grupo_nome: string;
  total_alunos: number;
  total_desempenhos: number;
  media_desempenho: number | null;
  total_turmas: number;
}

export const TabelaDesempenhoEscolas = () => {
  const { filtros } = useFiltroDashboard();
  const [dados, setDados] = useState<EscolaDesempenho[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: pagina.toString(),
      limit: "10",
    });

    if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
    if (filtros.serie) params.append("serie", filtros.serie);
    if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
    if (filtros.provaId) params.append("prova_id", filtros.provaId); 
    
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/dashboard/school-performance?${params.toString()}`
      );
      const json = await res.json();

      setDados(json.data || []);
      setTotalPaginas(json.totalPages || 1);
      setTotal(json.total || 0);
    } catch (error) {
      console.error("Erro ao carregar desempenho por escola:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagina, filtros]);

  const gerarBotoesPaginacao = (): (number | string)[] => {
    const botoes: (number | string)[] = [];
    const maxVisiveis = 3;

    if (totalPaginas <= maxVisiveis + 2) {
      for (let i = 1; i <= totalPaginas; i++) botoes.push(i);
    } else {
      if (pagina <= maxVisiveis) {
        for (let i = 1; i <= maxVisiveis + 1; i++) botoes.push(i);
        botoes.push("...");
        botoes.push(totalPaginas);
      } else if (pagina >= totalPaginas - maxVisiveis + 1) {
        botoes.push(1);
        botoes.push("...");
        for (let i = totalPaginas - maxVisiveis; i <= totalPaginas; i++) botoes.push(i);
      } else {
        botoes.push(1);
        botoes.push("...");
        botoes.push(pagina - 1);
        botoes.push(pagina);
        botoes.push(pagina + 1);
        botoes.push("...");
        botoes.push(totalPaginas);
      }
    }

    return botoes;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Desempenho por Escolas</h2>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-2">Posição</th>
              <th className="px-4 py-2">Escola</th>
              <th className="px-4 py-2">Região</th>
              <th className="px-4 py-2">Grupo</th>
              <th className="px-4 py-2">Média</th>
              <th className="px-4 py-2">Alunos Avaliados</th>
              <th className="px-4 py-2">Total Alunos</th>
              <th className="px-4 py-2">Turmas</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((escola, index) => (
              <tr
                key={escola.escola_id}
                className="hover:bg-gray-50 border-b border-gray-100"
              >
                <td className="px-4 py-3 font-medium">{(pagina - 1) * 10 + index + 1}º</td>
                <td className="px-4 py-3">{escola.escola_nome}</td>
                <td className="px-4 py-3">{escola.regiao_nome}</td>
                <td className="px-4 py-3">{escola.grupo_nome || "Não Definido"}</td>
                <td className="px-4 py-3 text-blue-700 font-semibold">
                  {typeof escola.media_desempenho === "number"
                    ? escola.media_desempenho.toFixed(1)
                    : "0.0"}
                </td>
                <td className="px-4 py-3">{escola.total_desempenhos ?? 0}</td>
                <td className="px-4 py-3">{escola.total_alunos ?? 0}</td>
                <td className="px-4 py-3">{escola.total_turmas ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-6 text-sm text-gray-700">
        <p>
          Mostrando {(pagina - 1) * 10 + 1} a {Math.min(pagina * 10, total)} de {total} resultados
        </p>

        <div className="flex gap-2 items-center flex-wrap">
          <button
            onClick={() => setPagina(1)}
            disabled={pagina === 1}
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-40 transition"
          >
            &lt;
          </button>

          {gerarBotoesPaginacao().map((num, i) =>
            num === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-3 py-1.5 text-gray-400 text-sm"
              >
                ...
              </span>
            ) : (
              <button
                key={num}
                onClick={() => setPagina(num as number)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                  pagina === num
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={() => setPagina(totalPaginas)}
            disabled={pagina === totalPaginas}
            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-100 disabled:opacity-40 transition"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};
