import { useEffect, useState } from "react";

interface HabilidadeBNCC {
  id: number;
  codigo: string;
  descricao: string;
  componente_curricular: string;
  serie: string;
}

interface ModalBNCCEditProps {
  questaoId: number;
  codigosSelecionados: number[];
  onClose: () => void;
  onSave: (novosCodigos: number[]) => void;
}

const series = [
  "PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO",
  "SEXTO_ANO", "SETIMO_ANO", "OITAVO_ANO", "NONO_ANO", "PRIMEIRA_SERIE",
  "SEGUNDA_SERIE", "TERCEIRA_SERIE", "PRIMEIRO_E_SEGUNDO_ANOS",
  "TERCEIRO_AO_QUINTO_ANO", "PRIMEIRO_AO_QUINTO_ANO", "EJA"
];

export const ModalBNCCEdit = ({
  questaoId,
  onClose,
  onSave,
}: ModalBNCCEditProps) => {
  const [habilidades, setHabilidades] = useState<HabilidadeBNCC[]>([]);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);
  const [serieFiltro, setSerieFiltro] = useState("");
  const [saebFiltro, setSaebFiltro] = useState("");

  useEffect(() => {
    const fetchTodas = async () => {
      try {
        const allParams = new URLSearchParams();
        if (serieFiltro) allParams.append("serie", serieFiltro);
        if (saebFiltro) allParams.append("saeb", saebFiltro);

        const [resSelecionadas, resTodas] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/bncc?questao_id=${questaoId}`),
          fetch(`${import.meta.env.VITE_API_URL}/api/bncc?${allParams.toString()}`),
        ]);

        const dataSelecionadas = await resSelecionadas.json();
        const dataTodas = await resTodas.json();

        const selecionadasIds = dataSelecionadas.map((h: HabilidadeBNCC) => h.id);
        const habilidadesUnificadas = [
          ...dataSelecionadas,
          ...dataTodas.filter((h: HabilidadeBNCC) => !selecionadasIds.includes(h.id)),
        ];

        setHabilidades(habilidadesUnificadas);
        setSelecionadas(selecionadasIds);
      } catch (error) {
        console.error("Erro ao buscar habilidades BNCC:", error);
        alert("Erro ao carregar habilidades.");
      }
    };

    fetchTodas();
  }, [questaoId, serieFiltro, saebFiltro]);

  const toggleSelecionada = (id: number) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const confirmarSelecao = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questoes/${questaoId}/vincular-bncc`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigos_bncc: selecionadas }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Erro ao atualizar habilidades BNCC:", errText);
        alert("Erro ao salvar seleção de habilidades.");
        return;
      }

      onSave(selecionadas);
      onClose();
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      alert("Erro inesperado ao salvar seleção.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Editar Habilidades da BNCC
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            value={serieFiltro}
            onChange={(e) => setSerieFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
          >
            <option value="">Todas as Séries</option>
            {series.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={saebFiltro}
            onChange={(e) => setSaebFiltro(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl text-sm"
          >
            <option value="">SAEB e BNCC</option>
            <option value="true">Somente SAEB</option>
            <option value="false">Somente BNCC</option>
          </select>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-y-auto max-h-[300px] mb-6">
          {habilidades.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Nenhuma habilidade encontrada.
            </p>
          ) : (
            habilidades.map((h) => (
              <div
                key={h.id}
                className="p-4 border-b last:border-b-0 flex items-start gap-3 hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selecionadas.includes(h.id)}
                  onChange={() => toggleSelecionada(h.id)}
                  className="mt-1 accent-blue-600"
                />
                <div>
                  <p className="font-medium text-sm text-gray-800">{h.codigo}</p>
                  <p className="text-sm text-gray-600">{h.descricao}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarSelecao}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm transition"
          >
            Salvar Seleção
          </button>
        </div>
      </div>
    </div>
  );
};
