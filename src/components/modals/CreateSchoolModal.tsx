import { useEffect, useState } from "react";

interface CreateSchoolModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  escolaId?: number | null;
}

interface Regiao {
  id: number;
  nome: string;
}

interface Grupo {
  id: number;
  nome: string;
}

export const CreateSchoolModal = ({
  onClose,
  onSuccess,
  escolaId,
}: CreateSchoolModalProps) => {
  const [nome, setNome] = useState("");
  const [regiaoId, setRegiaoId] = useState("");
  const [grupoId, setGrupoId] = useState("");

  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegioes = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/regioes`);
      const data = await res.json();
      setRegioes(data);
    };

    const fetchGrupos = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grupos`);
      const data = await res.json();
      setGrupos(data);
    };

    fetchRegioes();
    fetchGrupos();
  }, []);

  useEffect(() => {
    if (!escolaId) return;

    const fetchEscola = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/escolas/${escolaId}`
        );
        if (!res.ok) throw new Error("Erro ao buscar escola");
        const data = await res.json();
        setNome(data.nome);
        setRegiaoId(String(data.regiao_id));
        setGrupoId(String(data.grupo_id));
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchEscola();
  }, [escolaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      nome,
      regiao_id: Number(regiaoId),
      grupo_id: Number(grupoId),
    };

    try {
      const res = await fetch(
        escolaId
          ? `${import.meta.env.VITE_API_URL}/api/escolas/${escolaId}`
          : `${import.meta.env.VITE_API_URL}/api/escolas`,
        {
          method: escolaId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar escola");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {escolaId ? "Editar Escola" : "Adicionar Nova Escola"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome da Escola
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Região
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={regiaoId}
              onChange={(e) => setRegiaoId(e.target.value)}
              required
            >
              <option value="">Selecione uma região</option>
              {regioes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grupo
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
              value={grupoId}
              onChange={(e) => setGrupoId(e.target.value)}
              required
            >
              <option value="">Selecione um grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading
                ? escolaId
                  ? "Salvando..."
                  : "Cadastrando..."
                : escolaId
                ? "Salvar"
                : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
