import { useCallback, useState } from "react";

export const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false); // Adicionando estado de carregamento
  const [error, setError] = useState<string | null>(null); // Para capturar erro da API

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      alert("Apenas arquivos PDF são permitidos.");
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Apenas arquivos PDF são permitidos.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo PDF primeiro.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://gerador-gabarito-preprocessador.lh6c5d.easypanel.host/api/enviar-pdf/",
        {
          method: "POST", 
          body: formData, 
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Gabarito enviado com sucesso:", result);
        alert("Gabarito enviado com sucesso!");
      } else {
        const errorData = await response.json();
        console.error("Erro ao enviar:", errorData);
        setError("Erro ao enviar o arquivo. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      setError("Erro de rede. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl shadow p-6 text-center bg-white">
      <h2 className="text-xl font-bold mb-2 text-gray-800">
        Enviar Gabarito da Prova
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Faça o upload do gabarito da prova em PDF para correção automática.
      </p>

      <div
        className={`w-full border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all ${
          dragActive ? "border-blue-700" : "border-blue-500"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-3xl mb-2 text-blue-600">⬆️</div>
        <p className="font-semibold text-lg mb-1 text-gray-800">
          Arraste e solte o PDF aqui
        </p>
        <p className="text-sm text-gray-600">
          ou{" "}
          <label className="text-blue-600 font-semibold cursor-pointer hover:underline">
            selecione um arquivo
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>{" "}
          do seu dispositivo
        </p>
      </div>

      {file && (
        <p className="mt-4 text-sm text-green-600 truncate">
          📄 {file.name}
        </p>
      )}

      {loading && (
        <p className="mt-4 text-sm text-gray-600">Enviando gabarito...</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-6 py-2 rounded-full mt-6 hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Enviando..." : "Enviar Gabarito"}
      </button>
    </div>
  );
};
