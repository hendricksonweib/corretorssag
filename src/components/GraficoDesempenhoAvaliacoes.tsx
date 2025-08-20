import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DesempenhoProva {
  prova_id: number;
  prova_nome: string;
  percentual_acertos: number;
}

export const GraficoDesempenhoAvaliacoes = () => {
  const { filtros } = useFiltroDashboard();
  const [dados, setDados] = useState<DesempenhoProva[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
    if (filtros.serie) params.append("serie", filtros.serie);
    if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
     if (filtros.provaId) params.append("prova_id", filtros.provaId); 

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/provas-desempenho?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDados(data);
        } else {
          setDados([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do gráfico:", err);
        setDados([]);
      });
  }, [filtros]);

  const chartData = {
    labels: dados.map((item) => item.prova_nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.map((item) => item.percentual_acertos),
        backgroundColor: "rgba(139, 92, 246, 0.5)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Desempenho por Avaliação",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Percentual de acertos (%)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Avaliações",
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Notas Médias por Avaliação
      </h2>
      {dados.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum dado encontrado com os filtros aplicados.</p>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};
