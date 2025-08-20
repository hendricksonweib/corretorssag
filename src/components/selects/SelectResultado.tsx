interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SelectResultado = ({ value, onChange }: Props) => {
  return (
    <div>
      <label className="text-sm text-gray-600 mb-1 block">Resultado</label>
      <select
        className="w-full border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos os Resultados</option>
        <option value="melhores">Melhores</option>
        <option value="criticos">Resultados Críticos</option>
      </select>
    </div>
  );
};
