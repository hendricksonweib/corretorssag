import { useEffect, useState } from "react";

interface Escola {
  id: number;
  nome: string;
}

interface Props {
  regiaoId?: string;
  grupoId?: string;
  value: string;
  onChange: (id: string) => void;
}

export const SelectEscola = ({ regiaoId, grupoId, value, onChange }: Props) => {
  const [escolas, setEscolas] = useState<Escola[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", "1");
    params.append("limit", "200");

    if (regiaoId) params.append("regiao_id", regiaoId);
    if (grupoId) params.append("grupo_id", grupoId);

    const url = `${import.meta.env.VITE_API_URL}/api/escolas?page=1&limit=200${params.toString()}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data?.data) ? data.data : [];
        setEscolas(lista);
      })
      .catch(err => {
        console.error("Erro ao carregar escolas:", err);
        setEscolas([]);
      });
  }, [regiaoId, grupoId]);

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">Escola</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Selecione uma escola</option>
        {escolas.map((escola) => (
          <option key={escola.id} value={escola.id.toString()}>
            {escola.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
