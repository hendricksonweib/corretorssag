import { useEffect, useState } from "react";

interface Prova {
  id: number;
  nome: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export const SelectProvas = ({ value, onChange }: Props) => {
  const [provas, setProvas] = useState<Prova[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/provas?page=1&limit=200`)
      .then((res) => res.json())
      .then((data) => setProvas(data || []))
      .catch(() => setProvas([]));
  }, []);

  return (
    <div>
      <label className="text-sm text-gray-700 mb-1 block">Provas</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todas as Provas</option>
        {provas.map((prova) => (
          <option key={prova.id} value={prova.id.toString()}>
            {prova.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
