import { useState } from "react";
import { useFiltroDashboard } from "../hooks/useFiltroDashboard";
import { SelectRegiao } from "./selects/SelectRegiao";
import { SelectGrupo } from "./selects/SelectGrupo";
import { SelectEscola } from "./selects/SelectEscola";
import { SelectSerie } from "./selects/SelectSerie";
import { SelectTurma } from "./selects/SelectTurma";
import { SelectResultado } from "./selects/SelectResultado";
import { SelectProvas } from "./selects/SelectProvas";

export const FiltroAvaliacoes = () => {
  const [regiaoId, setRegiaoId] = useState("");
  const [grupoId, setGrupoId] = useState("");
  const [escolaId, setEscolaId] = useState("");
  const [serie, setSerie] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [provaId, setProvaId] = useState("");
  const [filtro, setFiltro] = useState("acertos");

  const { setFiltros } = useFiltroDashboard();

  const handleAplicarFiltros = () => {
    setFiltros({
      regiaoId,
      grupoId,
      escolaId,
      serie,
      turmaId,
      provaId,
      filtro,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-semibold mb-2">Filtro de Avaliações</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SelectRegiao value={regiaoId} onChange={setRegiaoId} />
        <SelectGrupo regiaoId={regiaoId} value={grupoId} onChange={setGrupoId} />
        <SelectEscola regiaoId={regiaoId} grupoId={grupoId} value={escolaId} onChange={setEscolaId} />
        <SelectSerie escolaId={escolaId} value={serie} onChange={setSerie} />
        <SelectTurma escolaId={escolaId} serie={serie} value={turmaId} onChange={setTurmaId} />
        <SelectProvas value={provaId} onChange={setProvaId} />
        <SelectResultado value={filtro} onChange={setFiltro} />
        <button
          onClick={handleAplicarFiltros}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};
