import { useEffect, useState } from "react";

interface CreateAlunoModalProps {
  alunoId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface Escola {
  id: number;
  nome: string;
}

interface Turma {
  id: number;
  nome: string;
}

export const CreateAlunoModal = ({ alunoId, onClose, onSuccess }: CreateAlunoModalProps) => {
  const [nome, setNome] = useState("");
  const [escolaId, setEscolaId] = useState<number | "">("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState<number | "">("");
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEscolas = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/escolas`);
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.data;
      setEscolas(Array.isArray(lista) ? lista : []);
    };

    fetchEscolas();
  }, []);

  useEffect(() => {
    if (escolaId === "") {
      setTurmas([]);
      setTurmaId("");
      return;
    }

    const fetchTurmas = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/turmas?escola_id=${escolaId}`
      );
      const data = await res.json();
      const lista = Array.isArray(data) ? data : data.data;
      setTurmas(Array.isArray(lista) ? lista : []);
    };

    fetchTurmas();
  }, [escolaId]);

  useEffect(() => {
    if (alunoId !== null) {
      const fetchAluno = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/alunos/${alunoId}`);
        const data = await res.json();
        setNome(data.nome || "");
        setEscolaId(data.escola_id || "");
        setTurmaId(data.turma_id || "");

        // Força atualização das turmas após obter a escola
        if (data.escola_id) {
          const turmasRes = await fetch(`${import.meta.env.VITE_API_URL}/api/turmas?escola_id=${data.escola_id}`);
          const turmasData = await turmasRes.json();
          const lista = Array.isArray(turmasData) ? turmasData : turmasData.data;
          setTurmas(Array.isArray(lista) ? lista : []);
        }
      };
      fetchAluno();
    }
  }, [alunoId]);

  const handleSubmit = async () => {
    if (!nome.trim() || escolaId === "" || turmaId === "") {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    const payload = {
      nome,
      escola_id: Number(escolaId),
      turma_id: Number(turmaId),
    };

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/alunos${alunoId ? `/${alunoId}` : ""}`,
        {
          method: alunoId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Erro ao salvar aluno");

      onSuccess();
    } catch (err) {
      alert("Erro ao salvar aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">
          {alunoId ? "Editar Aluno" : "Adicionar Novo Aluno"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Nome do Aluno</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Escola</label>
            <select
              value={escolaId}
              onChange={(e) => setEscolaId(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma escola</option>
              {escolas.map((escola) => (
                <option key={escola.id} value={escola.id}>
                  {escola.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700 mb-1 block">Turma</label>
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
};
