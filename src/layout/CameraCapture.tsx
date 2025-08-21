import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";

interface CameraCaptureProps {
  apiUrl: string;
}

type Alt = "a" | "b" | "c" | "d" | "nula";
type ApiRaw = Record<string, string>;
type Results = Record<number, Alt>;

const CameraCapture = ({ apiUrl }: CameraCaptureProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [stats, setStats] = useState<Record<Alt, number>>({
    a: 0, b: 0, c: 0, d: 0, nula: 0
  });

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Constraints de resolução para a câmera
  const videoConstraints: MediaTrackConstraints = {
    facingMode: "environment", // Garante que a câmera traseira seja usada
    width: { ideal: 1920 }, // Aumentei a largura para 1920px
    height: { ideal: 1080 }, // Aumentei a altura para 1080px
  };

  useEffect(() => {
    const checkCameraResolution = () => {
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video as HTMLVideoElement;
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

    // PNG qualidade máxima
    const highQualityPhoto = canvas.toDataURL("image/png", 1.0);

    console.log("📸 Foto capturada:", {
      width: canvas.width,
      height: canvas.height,
      size: highQualityPhoto.length,
    });

    setPhoto(highQualityPhoto);
    setResults(null);
    setStats({ a: 0, b: 0, c: 0, d: 0, nula: 0 });
    setError(null);
  };

  // Normaliza a resposta da API
  const normalizeResults = (raw: ApiRaw, total: number): Results => {
    const norm: Results = {};
    const entries = Object.entries(raw);
    entries.sort((a, b) => Number(a[0]) - Number(b[0]));

    for (const [k, v] of entries) {
      const n = Number(k);
      if (!Number.isFinite(n)) continue;
      if (n < 1 || n > total) continue;

      const val = (v || "").toLowerCase().trim();
      const alt: Alt = (["a", "b", "c", "d"].includes(val) ? val : "nula") as Alt;
      norm[n] = alt;
    }

    // Garante que todas as 1..total existam
    for (let i = 1; i <= total; i++) {
      if (!norm[i]) norm[i] = "nula";
    }

    return norm;
  };

  // Atualiza as estatísticas
  const computeStats = (r: Results) => {
    const s: Record<Alt, number> = { a: 0, b: 0, c: 0, d: 0, nula: 0 };
    Object.values(r).forEach((alt) => (s[alt] += 1));
    return s;
  };

  // Envia a foto para a API
  const handleSubmit = async () => {
    if (!photo) {
      setError("Por favor, tire uma foto primeiro.");
      return;
    }

    if (questionCount <= 0) {
      setError("Por favor, informe o número de questões.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const blob = await fetch(photo).then((res) => res.blob());

      const formData = new FormData();
      formData.append("imagem", blob, "high_quality_photo.png");
      formData.append("numero_questoes", String(questionCount));

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

      const rawJson = await response.json() as ApiRaw;

      if (rawJson.error || Object.keys(rawJson).length === 0) {
        throw new Error("Erro na API: Nenhum dado válido retornado.");
      }

      console.log("✅ Resposta (bruta) da API:", rawJson);

      // Alertar a resposta JSON no mobile
      alert(JSON.stringify(rawJson, null, 2)); // Exibe o JSON formatado

      // Normaliza a resposta da API
      const norm = normalizeResults(rawJson, questionCount);
      setResults(norm);
      setStats(computeStats(norm));

    } catch (err: any) {
      console.error("❌ Erro no envio:", err);
      setError(err?.message ? `Erro ao enviar: ${err.message}` : "Erro ao enviar os dados. Tente novamente.");
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-3xl p-6">
        <h2 className="text-2xl font-semibold text-blue-600 text-center mb-4">
          Tire a Foto do Gabarito
        </h2>

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

        <div className="flex gap-2 mb-4">
          <Button label="Capturar Foto" onClick={handleCapture} disabled={loading || !cameraReady} />
          <Button label="Recarregar Câmera" onClick={retryCamera} />
        </div>

        {photo && (
          <div className="mt-4 mb-4 text-center">
            <h3 className="text-sm text-gray-500 mb-2">Pré-visualização (reduzida):</h3>
            <img
              src={photo}
              alt="Captured HD"
              className="w-64 h-64 object-contain rounded-lg mx-auto border"
            />
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(photo.length / 1024)} KB — {webcamRef.current?.video?.videoWidth}x{webcamRef.current?.video?.videoHeight} px
            </p>
          </div>
        )}

        <div className="w-full mb-4">
          <label htmlFor="questionCount" className="block text-sm text-gray-700 mb-2">
            Número de Questões:
          </label>
          <input
            id="questionCount"
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            min={1}
            placeholder="Ex: 60"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        )}

        <Button
          label={loading ? "⏳ Enviando..." : "Enviar Foto"}
          onClick={handleSubmit}
          disabled={loading || !photo}
        />

       

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default CameraCapture;
