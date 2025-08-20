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

interface DesempenhoComponente {
  componente_id: number;
  componente_nome: string;
  total_questoes: number;
  total_respostas: number;
  total_acertos: number;
  percentual_acertos: number;
}

export const GraficoComponentesCurriculares = () => {
  const [dados, setDados] = useState<DesempenhoComponente[]>([]);
  const { filtros } = useFiltroDashboard();

  useEffect(() => {
    const params = new URLSearchParams();

    if (filtros.regiaoId) params.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) params.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) params.append("escola_id", filtros.escolaId);
    if (filtros.serie) params.append("serie", filtros.serie);
    if (filtros.turmaId) params.append("turma_id", filtros.turmaId);
    if (filtros.provaId) params.append("prova_id", filtros.provaId); 

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/componentes-curriculares-desempenho?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDados(data);
        } else {
          setDados([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar desempenho de componentes curriculares", err);
        setDados([]);
      });
  }, [filtros]);

  const chartData = {
    labels: dados.map((item) => item.componente_nome),
    datasets: [
      {
        label: "Percentual de Acertos (%)",
        data: dados.map((item) => item.percentual_acertos),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
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
        max: 100,
        title: { display: true, text: "Percentual de Acertos (%)" },
      },
      x: {
        title: { display: true, text: "Componentes Curriculares" },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Análise de Componentes Curriculares</h2>
      {dados.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum dado encontrado com os filtros aplicados.</p>
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>
  );
};
