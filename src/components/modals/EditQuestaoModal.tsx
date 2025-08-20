import { useEffect, useState } from "react";
import { ModalBNCCEdit } from "./ModalBNCCEdit";

interface EditarQuestaoModalProps {
  questaoId: number;
  onClose: () => void;
  onSave?: () => void;
}

interface Alternativa {
  texto: string;
  correta: boolean;
}

interface ComponenteCurricular {
  id: number;
  nome: string;
}

export const EditarQuestaoModal = ({
  questaoId,
  onClose,
  onSave,
}: EditarQuestaoModalProps) => {
  const [enunciado, setEnunciado] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const [alternativas, setAlternativas] = useState<Alternativa[]>([]);
  const [nivelEnsino, setNivelEnsino] = useState("ANOS_INICIAIS");
  const [serie, setSerie] = useState("PRIMEIRO_ANO");
  const [dificuldade, setDificuldade] = useState("FACIL");
  const [pontos, setPontos] = useState(1);
  const [componenteId, setComponenteId] = useState(0);
  const [componentes, setComponentes] = useState<ComponenteCurricular[]>([]);
  const [codigosBNCC, setCodigosBNCC] = useState<number[]>([]);
  const [showModalBNCC, setShowModalBNCC] = useState(false);

  const niveis = ["ANOS_INICIAIS", "ANOS_FINAIS", "ENSINO_MEDIO"];
  const series = [
    "PRIMEIRO_ANO",
    "SEGUNDO_ANO",
    "TERCEIRO_ANO",
    "QUARTO_ANO",
    "QUINTO_ANO",
    "SEXTO_ANO",
    "SETIMO_ANO",
    "OITAVO_ANO",
    "NONO_ANO",
    "PRIMEIRA_SERIE",
    "SEGUNDA_SERIE",
    "TERCEIRA_SERIE",
  ];
  const dificuldades = ["FACIL", "MEDIA", "DIFICIL"];

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/questoes/${questaoId}`)
      .then((res) => res.json())
      .then((data) => {
        setEnunciado(data.enunciado || "");
        setImagemUrl(data.imagem_url || "");
        setImagemPreview(
          data.imagem_url
            ? `${import.meta.env.VITE_API_URL}/${data.imagem_url}`
            : ""
        );
        setAlternativas(data.alternativas || []);
        setNivelEnsino(data.nivel_ensino || "ANOS_INICIAIS");
        setSerie(data.serie || "PRIMEIRO_ANO");
        setDificuldade(data.dificuldade || "FACIL");
        setPontos(data.pontos || 1);
        setComponenteId(data.componente_curricular_id || 0);
        setCodigosBNCC(data.codigos_bncc || []);
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/componentes-curriculares`)
      .then((res) => res.json())
      .then((data) => setComponentes(data || []));
  }, [questaoId]);

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("imagem", file); 

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload/questao-imagem`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json(); 

    if (!res.ok || !data.success) {
      console.error("Erro ao enviar imagem:", data.message || res.statusText);
      alert("Erro ao enviar imagem.");
      return;
    }
    setImagemUrl(data.imagePath);
    setImagemPreview(`${import.meta.env.VITE_API_URL}/${data.imagePath}`);
  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Erro inesperado ao enviar imagem.");
  }
};



  const marcarCorreta = (index: number) => {
    const novas = alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index,
    }));
    setAlternativas(novas);
  };

  const handleSubmit = async () => {
    const payload = {
      enunciado,
      imagem_url: imagemUrl,
      nivel_ensino: nivelEnsino,
      dificuldade,
      serie,
      pontos,
      componente_curricular_id: componenteId,
      codigos_bncc: codigosBNCC,
      alternativas,
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/questoes/${questaoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erro ao atualizar questão:", res.status, errorText);
        alert("Erro ao atualizar questão.");
        return;
      }

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar questão.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto transition-all">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Editar Questão</h2>

        <textarea
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
        />

       <label className="block mb-4">
  <span className="text-sm font-medium text-gray-700">
    {imagemPreview ? "Inserir outro arquivo" : "Adicionar imagem"}
  </span>
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
  />
</label>

        {imagemPreview && (
          <div className="mb-4">
            <img
              src={imagemPreview}
              alt="Preview"
              className="max-h-48 rounded-lg border"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <select
            value={nivelEnsino}
            onChange={(e) => setNivelEnsino(e.target.value)}
            className="p-3 border rounded-xl"
          >
            {niveis.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <select
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="p-3 border rounded-xl"
          >
            {series.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={dificuldade}
            onChange={(e) => setDificuldade(e.target.value)}
            className="p-3 border rounded-xl"
          >
            {dificuldades.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={componenteId}
            onChange={(e) => setComponenteId(Number(e.target.value))}
            className="p-3 border rounded-xl"
          >
            <option value="">Componente Curricular</option>
            {componentes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <p className="text-red-600 text-sm font-medium mb-2">
          ⚠ É obrigatório selecionar pelo menos uma habilidade BNCC/SAEB.
        </p>
        <button
          onClick={() => setShowModalBNCC(true)}
          className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm"
        >
          + Selecionar Habilidades BNCC/SAEB
        </button>

        {alternativas.map((alt, i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <input
              type="radio"
              name="correta"
              checked={alt.correta}
              onChange={() => marcarCorreta(i)}
              className="accent-blue-600"
            />
            <input
              type="text"
              value={alt.texto}
              onChange={(e) => {
                const novas = [...alternativas];
                novas[i].texto = e.target.value;
                setAlternativas(novas);
              }}
              placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
              className="flex-1 p-3 border border-gray-300 rounded-xl"
            />
          </div>
        ))}

        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Salvar Alterações
          </button>
        </div>
      </div>

    {showModalBNCC && (
  <ModalBNCCEdit
    questaoId={questaoId}
    codigosSelecionados={codigosBNCC}
    onClose={() => setShowModalBNCC(false)}
    onSave={(novosCodigos) => {
      setCodigosBNCC(novosCodigos);
      setShowModalBNCC(false);
    }}
  />
)}

    </div>
  );
};
