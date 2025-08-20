import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RegiaoDesempenho {
  regiao_id: number;
  regiao_nome: string;
  media_desempenho: number;
}

interface EstatisticasGerais {
  total_regioes: number;
  media_geral: number;
  melhor_regiao: string;
  pior_regiao?: string;
}

export const GraficoRankingRegioes = () => {
  const [dadosRegioes, setDadosRegioes] = useState<RegiaoDesempenho[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    total_regioes: 0,
    media_geral: 0,
    melhor_regiao: "",
  });

  const { filtros } = useFiltroDashboard();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();

        if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
        if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
        if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
        if (filtros.serie) params.append("serie", filtros.serie);
        if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
        if (filtros.provaId) params.append("prova_id", filtros.provaId); // ✅ corrigido

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/regional-performance?${params.toString()}`);
        const data = await res.json();

        setDadosRegioes(data.dados_grafico || []);
        setEstatisticas(data.estatisticas_gerais || {});
      } catch (error) {
        console.error("Erro ao buscar dados de desempenho por região", error);
      }
    };

    fetchData();
  }, [filtros]);

  const chartData = {
    labels: dadosRegioes.map((r) => r.regiao_nome),
    datasets: [
      {
        label: "Desempenho por Região",
        data: dadosRegioes.map((r) => r.media_desempenho),
        backgroundColor: "rgba(255, 205, 86, 0.8)",
        borderColor: "rgba(255, 205, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: { display: true, text: "Desempenho (%)" },
      },
      x: {
        title: { display: true, text: "Regiões" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <h2 className="text-lg font-semibold mb-4">Ranking das Regiões</h2>

      {dadosRegioes.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum dado encontrado com os filtros aplicados.</p>
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm text-gray-700">
        <div className="bg-gray-50 border rounded-xl p-4 text-center">
          <p className="text-gray-500">Total de Regiões</p>
          <p className="text-lg font-semibold">{estatisticas.total_regioes}</p>
        </div>
        <div className="bg-gray-50 border rounded-xl p-4 text-center">
          <p className="text-gray-500">Média Geral</p>
          <p className="text-lg font-semibold">{estatisticas.media_geral?.toFixed(1) || "0.0"}</p>
        </div>
        <div className="bg-gray-50 border rounded-xl p-4 text-center">
          <p className="text-gray-500">Melhor Região</p>
          <p className="text-lg font-semibold text-blue-700">
            {estatisticas.melhor_regiao || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};
