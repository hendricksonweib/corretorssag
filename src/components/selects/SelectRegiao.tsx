import { useEffect, useState } from "react";

interface Regiao {
  id: number;
  nome: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export const SelectRegiao = ({ value, onChange }: Props) => {
  const [regioes, setRegioes] = useState<Regiao[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/regioes?page=1&limit=200`)
      .then((res) => res.json())
      .then((data) => setRegioes(data || []))
      .catch(() => setRegioes([]));
  }, []);

  return (
    <div>
      <label className="text-sm text-gray-700 mb-1 block">Região</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todas as Regiões</option>
        {regioes.map((r) => (
          <option key={r.id} value={r.id.toString()}>
            {r.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
