import { useEffect, useState } from "react";

interface Props {
  escolaId?: string;
  value: string;
  onChange: (val: string) => void;
}

const nomeSerieLegivel: Record<string, string> = {
  "PRIMEIRO_ANO": "1º Ano",
  "SEGUNDO_ANO": "2º Ano",
  "TERCEIRO_ANO": "3º Ano",
  "QUARTO_ANO": "4º Ano",
  "QUINTO_ANO": "5º Ano",
  "SEXTO_ANO": "6º Ano",
  "SETIMO_ANO": "7º Ano",
  "OITAVO_ANO": "8º Ano",
  "NONO_ANO": "9º Ano",
  "PRIMEIRA_SERIE": "1ª Série",
  "SEGUNDA_SERIE": "2ª Série",
  "TERCEIRA_SERIE": "3ª Série",
  "EJA": "EJA",
};

// todas as séries disponíveis no sistema
const TODAS_AS_SERIES = Object.keys(nomeSerieLegivel);

export const SelectSerie = ({ escolaId, value, onChange }: Props) => {
  const [series, setSeries] = useState<string[]>(TODAS_AS_SERIES);

  useEffect(() => {
    if (!escolaId) {
      setSeries(TODAS_AS_SERIES); // reset para todas
      return;
    }

    const url = `${
      import.meta.env.VITE_API_URL
    }/api/obter-series-escola?escola_id=${escolaId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("Séries da escola carregadas:", data);
        setSeries(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erro ao carregar séries da escola:", err);
        setSeries([]);
      });
  }, [escolaId]);

  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">Série</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecione uma série</option>
        {series.map((serie) => (
          <option key={serie} value={serie}>
            {nomeSerieLegivel[serie] ?? serie}
          </option>
        ))}
      </select>
    </div>
  );
};
