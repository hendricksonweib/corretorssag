import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";
import { SelectProvas } from "../components/selects/SelectProvas";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const alunoId = location.state?.alunoId ?? null;
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    
    console.log(gabaritoObj);  
    
    return (
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="border px-4 py-2">Questão</th>
            <th className="border px-4 py-2">Resposta</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(gabaritoObj).map((key) => (
            <tr key={key}>
              <td className="border px-4 py-2">{key}</td>
              <td className="border px-4 py-2">{gabaritoObj[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    const checkCameraResolution = () => {
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video as HTMLVideoElement;
        setCameraResolution(`${video.videoWidth}x${video.videoHeight}`);
        setCameraReady(true);
        console.log("📷 Resolução da câmera:", `${video.videoWidth}x${video.videoHeight}`);
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

    console.log("📸 Foto capturada:", {
      width: canvas.width,
      height: canvas.height,
      size: highQualityPhoto.length,
    });

    setPhoto(highQualityPhoto);
    setError(null);
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

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(photo).then((res) => res.blob());

      const formData = new FormData();
      formData.append("imagem", blob, "high_quality_photo.png");
      formData.append("numero_questoes", questionCount);
      formData.append("prova_id", selectedProva);

      if (!isCadastrado) {
        formData.append("not_cadast", "1");
      }

      console.log("📤 Enviando imagem:", {
        size: blob.size,
        type: blob.type,
      });

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
          rawJson = {};
        }
      }

      if (Object.keys(rawJson).length === 0) {
        throw new Error("Nenhum dado retornado da API.");
      }

      setGabarito(rawJson);
      countRespostas(JSON.stringify(rawJson));
      setShowEnviarButton(true);

      console.log(rawJson);

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setError(err?.message ? `Erro ao processar: ${err.message}` : "Erro ao processar o gabarito. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarRespostas = async () => {
    if (!gabarito) return;

    setLoading(true);
    setError(null);

    try {
      const payload = [
        {
          resposta: gabarito,
          exam_id: selectedProva,
          id: alunoId 
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

      console.log("Payload enviado:", payload);

      const result: ApiResponse = await response.json();
      console.log('Resposta da API:', result);

      if (result.codigo_http !== 200) {
        let errorMessage = "Erro ao enviar respostas para o servidor.";
        
        if (result.mensagem) {
          errorMessage = result.mensagem;
        } else if (result.resposta_api) {
          try {
            const respostaDetalhada = JSON.parse(result.resposta_api);
            if (respostaDetalhada.message) {
              errorMessage = respostaDetalhada.message;
            }
            if (respostaDetalhada.resultados && respostaDetalhada.resultados.length > 0) {
              errorMessage = respostaDetalhada.resultados[0].erro || errorMessage;
            }
          } catch (e) {
            console.error("Erro ao parsear resposta da API:", e);
          }
        }
        
        throw new Error(errorMessage);
      }

      setError("Respostas enviadas com sucesso!");
      setShowEnviarButton(false);

    } catch (error: any) {
      console.error("Erro ao enviar as respostas:", error);
      setError(error.message || "Erro ao enviar as respostas para o servidor.");
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
    if (/^\d{0,2}$/.test(inputValue)) {
      if (Number(inputValue) <= 60) {
        setQuestionCount(inputValue);
      }
    }
  };

  const handleProvaChange = (id: string) => {
    setSelectedProva(id);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg sm:max-w-md p-4 flex-1">
        <h2 className="text-xl font-semibold text-blue-600 text-center mb-4">
          Capture o Gabarito
        </h2>

        <div className="w-full mb-4">
          <SelectProvas value={selectedProva} onChange={handleProvaChange} />
        </div>

        <div className="w-full mb-4 relative">
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
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <p className="text-white">Carregando câmera...</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-2">
          Resolução da câmera: {cameraResolution}
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <Button label="Capturar Foto" onClick={handleCapture} disabled={loading || !cameraReady} />
          <Button label="Recarregar Câmera" onClick={retryCamera} />
        </div>

        {photo && (
          <div className="mt-4 mb-4 text-center">
            <h3 className="text-sm text-gray-500 mb-2">Pré-visualização:</h3>
            <img
              src={photo}
              alt="Captured HD"
              className="w-48 h-48 object-contain rounded-lg mx-auto border"
            />
          </div>
        )}

        <div className="w-full mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isCadastrado}
              onChange={(e) => setIsCadastrado(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Aluno é cadastrado</span>
          </label>
        </div>

        <div className="w-full mb-4">
          <label htmlFor="questionCount" className="block text-sm text-gray-700 mb-2">
            Número de Questões:
          </label>
          <input
            id="questionCount"
            type="text"
            value={questionCount}
            onChange={handleQuestionCountChange}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Ex: 60"
          />
        </div>

        {gabarito && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Gabarito Processado:</h3>
            {renderGabarito(gabarito)}
            <div className="mt-4">
              <p className="text-sm">Total de Respostas:</p>
              <ul className="list-disc pl-5">
                <li>Resposta A: {respostasCount.a}</li>
                <li>Resposta B: {respostasCount.b}</li>
                <li>Resposta C: {respostasCount.c}</li>
                <li>Resposta D: {respostasCount.d}</li>
                <li>Resposta Nula: {respostasCount.nula}</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className={`p-3 mb-4 rounded-lg ${error.includes("sucesso") ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`text-center ${error.includes("sucesso") ? "text-green-600" : "text-red-600"}`}>{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            label={loading ? "⏳ Processando..." : "Processar Gabarito"}
            onClick={handleProcessarGabarito}
            disabled={loading || !photo}
          />

          {showEnviarButton && (
            <Button
              label={loading ? "⏳ Enviando..." : "Enviar Respostas"}
              onClick={handleEnviarRespostas}
              disabled={loading}
            />
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default CameraCapture;