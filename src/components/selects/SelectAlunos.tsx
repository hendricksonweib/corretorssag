import { useEffect, useState } from "react";

interface Aluno {
  id: number;
  nome: string;
}

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export const SelectAlunos = ({ value, onChange }: Props) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/alunos?page=1&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlunos(data);
        } else if (Array.isArray(data.data)) {
          setAlunos(data.data);
        } else {
          console.error("Formato inesperado da resposta:", data);
          setAlunos([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar alunos:", err);
        setAlunos([]);
      });
  }, []);

  return (
    <div>
      <label className="text-sm text-gray-700 mb-1 block">Alunos</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos os Alunos</option>
        {alunos.map((aluno) => (
          <option key={aluno.id} value={aluno.id.toString()}>
            {aluno.nome}
          </option>
        ))}
      </select>
    </div>
  );
};
