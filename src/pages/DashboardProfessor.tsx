
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { FiltroAvaliacoes } from "../components/FiltroAvaliacoes";
import { DashboardResumo } from "../components/DashboardResumo";
import { GraficoDesempenhoAvaliacoes } from "../components/GraficoDesempenhoAvaliacoes";
import { TabelaHabilidadesBNCC } from "../components/TabelaHabilidadesBNCC";
import { RankingAlunos } from "../components/RankingAlunos";
const DashboardProfessor = () => {

  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <PageHeader
          title="Dashboard"
          description="Visão geral do Sistema de Avaliação e Gerenciamento"
        />

        <div className="mt-8">
          <FiltroAvaliacoes />
        </div>

        <div className="mt-8">
          <DashboardResumo />
        </div>

        <GraficoDesempenhoAvaliacoes />

        <div className="mt-8">
          <TabelaHabilidadesBNCC />
        </div>

        <div className="mt-8">
          <RankingAlunos />
        </div>
      </div>
    </>
  );
};

export default DashboardProfessor;
