import { useEffect, useState } from "react";

interface Turma {
  id: number;
  nome: string;
  serie: string;
  turno: string;
  escola_id: number;
}

interface Props {
  escolaId?: string;
  serie?: string;
  value: string;
  onChange: (id: string) => void;
}

export const SelectTurma = ({ escolaId, serie, value, onChange }: Props) => {
  const [turmas, setTurmas] = useState<Turma[]>([]);

  useEffect(() => {
    if (!escolaId || !serie) {
      setTurmas([]);
      return;
    }

    const params = new URLSearchParams({
      escola_id: escolaId,
      serie: serie,
    });

    const url = `${
      import.meta.env.VITE_API_URL
    }/api/turmas?page=1&limit=200${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("Turmas carregadas:", data);
        const lista = Array.isArray(data?.data) ? data.data : [];
        setTurmas(lista);
      })
      .catch((err) => {
        console.error("Erro ao carregar turmas:", err);
        setTurmas([]);
      });
  }, [escolaId, serie]);

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">Turma</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!turmas.length}
      >
        <option value="">Selecione uma turma</option>
        {turmas.map((turma) => (
          <option key={turma.id} value={turma.id.toString()}>
            {turma.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
