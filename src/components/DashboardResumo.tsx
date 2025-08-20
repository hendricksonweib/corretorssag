import { useEffect, useState } from "react";
import {
  BuildingLibraryIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CalculatorIcon
} from "@heroicons/react/24/solid";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";

interface Statistics {
  total_escolas: number;
  total_turmas: number;
  total_alunos: number;
  total_provas: number;
  participacao: number;
  media_geral: number;
}

export const DashboardResumo = () => {
  const { filtros } = useFiltroDashboard(); 
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (filtros.regiaoId) queryParams.append("regiao_id", filtros.regiaoId);
    if (filtros.grupoId) queryParams.append("grupo_id", filtros.grupoId);
    if (filtros.escolaId) queryParams.append("escola_id", filtros.escolaId);
    if (filtros.serie) queryParams.append("serie", filtros.serie);
    if (filtros.turmaId) queryParams.append("turma_id", filtros.turmaId);
    if (filtros.provaId) queryParams.append("prova_id", filtros.provaId); 

    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/statistics?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar estatísticas:", err);
        setLoading(false);
      });
  }, [filtros]); 

  if (loading || !stats) {
    return <p className="text-center text-gray-500 py-8">Carregando resumo...</p>;
  }

  const cards = [
    {
      label: "Escolas",
      valor: stats.total_escolas ?? 0,
      icon: <BuildingLibraryIcon className="w-6 h-6 text-blue-700" />,
      bg: "bg-blue-100"
    },
    {
      label: "Turmas",
      valor: stats.total_turmas ?? 0,
      icon: <UsersIcon className="w-6 h-6 text-green-700" />,
      bg: "bg-green-100"
    },
    {
      label: "Alunos",
      valor: stats.total_alunos ?? 0,
      icon: <AcademicCapIcon className="w-6 h-6 text-purple-700" />,
      bg: "bg-purple-100"
    },
    {
      label: "Provas",
      valor: stats.total_provas ?? 0,
      icon: <DocumentTextIcon className="w-6 h-6 text-yellow-700" />,
      bg: "bg-yellow-100"
    },
    {
      label: "Participação",
      valor: typeof stats.participacao === "number" ? `${stats.participacao.toFixed(2)}%` : "0%",
      icon: <ChartPieIcon className="w-6 h-6 text-red-700" />,
      bg: "bg-red-100"
    },
    {
      label: "Média Geral",
      valor: typeof stats.media_geral === "number" ? stats.media_geral.toFixed(2) : "0.00",
      icon: <CalculatorIcon className="w-6 h-6 text-indigo-700" />,
      bg: "bg-indigo-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${card.bg}`}
          >
            {card.icon}
          </div>
          <div>
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className="text-xl font-semibold text-gray-800">{card.valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
