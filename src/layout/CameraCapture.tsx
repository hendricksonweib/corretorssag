import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";
import { SelectProvas } from "../components/selects/SelectProvas";
import { useSearchParams, useNavigate } from "react-router-dom";

interface CameraCaptureProps {
  apiUrl: string;
}

type ApiRaw = Record<string, any>;

interface ApiResponse {
  status: string;
  mensagem?: string;
  codigo_http?: number;
  resposta_api?: string;
}

const CameraCapture = ({ apiUrl }: CameraCaptureProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const alunoId = searchParams.get('alunoId');
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraResolution, setCameraResolution] = useState("");
  const [selectedProva, setSelectedProva] = useState<string>("");
  const [isCadastrado, setIsCadastrado] = useState(true);
  const [gabarito, setGabarito] = useState<any>(null);
  const [respostasCount, setRespostasCount] = useState<any>({
    a: 0,
    b: 0,
    c: 0,
    d: 0,
    nula: 0,
  });
  const [showEnviarButton, setShowEnviarButton] = useState(false);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const videoConstraints: MediaTrackConstraints = {
    facingMode: "environment",
    width: { ideal: 4096 },
    height: { ideal: 2160 },
    advanced: [
      { width: 4096, height: 2160 },
      { width: 3840, height: 2160 },
      { width: 1920, height: 1080 },
      { width: 1280, height: 720 },
    ],
  };

  // Verificar se alunoId existe
  useEffect(() => {
    if (!alunoId) {
      setError("Nenhum aluno selecionado. Volte e selecione um aluno primeiro.");
    }
  }, [alunoId]);

  const countRespostas = (gabarito: any) => {
    let gabaritoObj = gabarito;
    if (typeof gabarito === "string") {
      try {
        gabaritoObj = JSON.parse(gabarito);
      } catch {
        gabaritoObj = {};
      }
    }
    const count = {
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      nula: 0,
    };
    for (const key in gabaritoObj) {
      if (gabaritoObj[key] === "a") count.a++;
      if (gabaritoObj[key] === "b") count.b++;
      if (gabaritoObj[key] === "c") count.c++;
      if (gabaritoObj[key] === "d") count.d++;
      if (gabaritoObj[key] === "nula") count.nula++;
    }
    setRespostasCount(count);
  };

  const renderGabarito = (gabarito: any) => {
    let gabaritoObj = gabarito;
    if (typeof gabarito === "string") {
      try {
        gabaritoObj = JSON.parse(gabarito);
      } catch {
        gabaritoObj = {};
      }
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Questão</th>
              <th className="border px-4 py-2 text-left">Resposta</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(gabaritoObj).map((key) => (
              <tr key={key}>
                <td className="border px-4 py-2">{key}</td>
                <td className="border px-4 py-2 font-medium">{gabaritoObj[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  useEffect(() => {
    const checkCameraResolution = () => {
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video as HTMLVideoElement;
        setCameraResolution(`${video.videoWidth}x${video.videoHeight}`);
        setCameraReady(true);
      }
    };

    const v = webcamRef.current?.video as HTMLVideoElement | undefined;
    v?.addEventListener("loadedmetadata", checkCameraResolution);
    return () => v?.removeEventListener("loadedmetadata", checkCameraResolution);
  }, []);

  const handleCapture = () => {
    if (!webcamRef.current || !cameraReady) return;

    const video = webcamRef.current.video as HTMLVideoElement | null;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const highQualityPhoto = canvas.toDataURL("image/png", 1.0);

    setPhoto(highQualityPhoto);
    setError(null);
    setSuccess(null);
    setShowEnviarButton(false);
    setGabarito(null);
  };

  const handleProcessarGabarito = async () => {
    if (!photo) {
      setError("Por favor, tire uma foto primeiro.");
      return;
    }

    if (questionCount.trim() === "" || Number(questionCount) <= 0 || Number(questionCount) > 60) {
      setError("Por favor, informe um número de questões válido (1-60).");
      return;
    }

    if (!selectedProva) {
      setError("Por favor, selecione uma prova.");
      return;
    }

    if (!alunoId) {
      setError("Aluno ID não encontrado.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const blob = await fetch(photo).then((res) => res.blob());
      const formData = new FormData();
      formData.append("imagem", blob, "gabarito.png");
      formData.append("numero_questoes", questionCount);
      formData.append("prova_id", selectedProva);

      if (!isCadastrado) {
        formData.append("not_cadast", "1");
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      let rawJson = await response.json() as ApiRaw;

      if (typeof rawJson === "string") {
        try {
          rawJson = JSON.parse(rawJson);
        } catch {
          throw new Error("Formato de resposta inválido da API");
        }
      }

      if (Object.keys(rawJson).length === 0) {
        throw new Error("Nenhum dado retornado da API.");
      }

      setGabarito(rawJson);
      countRespostas(rawJson);
      setShowEnviarButton(true);
      setSuccess("Gabarito processado com sucesso!");

    } catch (err: any) {
      console.error("Erro no processamento:", err);
      setError(err?.message || "Erro ao processar o gabarito. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarRespostas = async () => {
    if (!gabarito || !alunoId) {
      setError("Dados incompletos para envio.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = [
        {
          resposta: gabarito,
          exam_id: selectedProva,
          id: parseInt(alunoId)
        }
      ];

      const apiKey = `${import.meta.env.VITE_API_TOLKEN}`;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/desempenho-alunos/respostas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse = await response.json();

      // Verifica se foi bem-sucedido
      if (result.codigo_http === 200 || result.status === "success") {
        setSuccess("Respostas enviadas com sucesso!");
        setShowEnviarButton(false);
        
        // Limpar após sucesso
        setTimeout(() => {
          setPhoto(null);
          setGabarito(null);
          setQuestionCount("");
        }, 2000);
        
      } else {
        // Tratar erro específico da API
        let errorMessage = "Erro ao enviar respostas.";
        
        if (result.mensagem) {
          errorMessage = result.mensagem;
        } else if (result.resposta_api) {
          try {
            const respostaDetalhada = JSON.parse(result.resposta_api);
            errorMessage = respostaDetalhada.message || errorMessage;
          } catch {
            errorMessage = "Erro no servidor. Tente novamente.";
          }
        }
        
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error("Erro ao enviar respostas:", error);
      setError(error.message || "Erro ao enviar as respostas.");
    } finally {
      setLoading(false);
    }
  };

  const retryCamera = () => {
    setCameraReady(false);
    setTimeout(() => {
      if (webcamRef.current?.video) setCameraReady(true);
    }, 1000);
  };

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d{0,2}$/.test(inputValue) && Number(inputValue) <= 60) {
      setQuestionCount(inputValue);
    }
  };

  const handleProvaChange = (id: string) => {
    setSelectedProva(id);
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg p-4">
        <h2 className="text-xl font-semibold text-blue-600 text-center mb-4">
          Capture o Gabarito
        </h2>

        {alunoId && (
          <div className="text-center mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Aluno ID: {alunoId}
            </span>
          </div>
        )}

        <div className="w-full mb-4">
          <SelectProvas value={selectedProva} onChange={handleProvaChange} />
        </div>

        <div className="w-full mb-4 relative rounded-lg overflow-hidden">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            width="100%"
            videoConstraints={videoConstraints}
            onUserMediaError={() => {
              setError("Erro ao acessar a câmera. Verifique as permissões.");
            }}
          />
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <p className="text-white">Carregando câmera...</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4 text-center">
          Resolução: {cameraResolution || "Não detectada"}
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <Button 
            label="Capturar Foto" 
            onClick={handleCapture} 
            disabled={loading || !cameraReady} 
          />
          <Button 
            label="Recarregar Câmera" 
            onClick={retryCamera}
          />
        </div>

        {photo && (
          <div className="mb-4 text-center">
            <h3 className="text-sm text-gray-500 mb-2">Pré-visualização:</h3>
            <img
              src={photo}
              alt="Foto capturada"
              className="w-32 h-32 object-contain rounded-lg mx-auto border"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isCadastrado}
                onChange={(e) => setIsCadastrado(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Aluno cadastrado</span>
            </label>
          </div>
          
          <div>
            <label htmlFor="questionCount" className="block text-sm mb-1">
              Nº de Questões:
            </label>
            <input
              id="questionCount"
              type="number"
              min="1"
              max="60"
              value={questionCount}
              onChange={handleQuestionCountChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Ex: 60"
            />
          </div>
        </div>

        {/* Mensagens de status */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <p className="text-red-600 text-center text-sm">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4">
            <p className="text-green-600 text-center text-sm">✅ {success}</p>
          </div>
        )}

        {gabarito && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Gabarito Processado:</h3>
            {renderGabarito(gabarito)}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Resumo:</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span>A: {respostasCount.a}</span>
                <span>B: {respostasCount.b}</span>
                <span>C: {respostasCount.c}</span>
                <span>D: {respostasCount.d}</span>
                <span>Nula: {respostasCount.nula}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            label={loading ? "Processando..." : "Processar Gabarito"}
            onClick={handleProcessarGabarito}
            disabled={loading || !photo}
          />

          {showEnviarButton && (
            <Button
              label={loading ? "Enviando..." : "Enviar Respostas"}
              onClick={handleEnviarRespostas}
              disabled={loading}
            />
          )}
        </div>

        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/alunos')}
            className="text-blue-600 text-sm hover:underline"
          >
            ← Voltar para lista de alunos
          </button>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default CameraCapture;