import { useState } from "react";

interface ImportAlunosModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportAlunosModal = ({ onClose, onSuccess }: ImportAlunosModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadModelo = async () => {
  const apiUrl = import.meta.env.VITE_API_URL; 
  const response = await fetch(`${apiUrl}/api/export/template-importacao`, {
    method: 'GET',
    headers: {
      'accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });

  if (response.ok) {
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'alunos-sag.xlsx';
    link.click();
  } else {
    console.error('Erro ao baixar o modelo:', response.statusText);
  }
};


  const handleSubmit = async () => {
    if (!file) {
      alert("Selecione um arquivo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/importacao/alunos-excel`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erro ao importar alunos");

      const data = await res.json();
      setResult(data.results);
      onSuccess();
    } catch (err) {
      setError("Falha ao importar arquivo. Verifique o formato e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Importar Alunos via Planilha</h2>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleDownloadModelo}
            className="px-4 py-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 transition w-fit"
          >
            Baixar Modelo Excel
          </button>

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          {result && (
            <div className="text-sm text-green-700 bg-green-50 p-2 rounded-md">
              <p>Importação concluída</p>
              <ul className="list-disc pl-5">
                <li>Escolas encontradas: {result.escolasEncontradas}</li>
                <li>Escolas não encontradas: {result.escolasNaoEncontradas}</li>
                <li>Turmas criadas: {result.turmasCriadas}</li>
                <li>Alunos criados: {result.alunosCriados}</li>
                {result.erros?.length > 0 && (
                  <li className="text-red-700">Erros: {result.erros.join(", ")}</li>
                )}
              </ul>
            </div>
          )}
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
            {loading ? "Importando..." : "Importar"}
          </button>
        </div>
      </div>
    </div>
  );
};
