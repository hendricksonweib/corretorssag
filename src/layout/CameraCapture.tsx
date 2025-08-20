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
  const [cameraResolution, setCameraResolution] = useState("");

  const [results, setResults] = useState<Results | null>(null);
  const [stats, setStats] = useState<Record<Alt, number>>({
    a: 0, b: 0, c: 0, d: 0, nula: 0
  });

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Constraints de resolução (prioriza alta)
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

  // Normaliza uma resposta “suja” (chaves duplicadas, além de 1..N, valores fora do conjunto)
  const normalizeResults = (raw: ApiRaw, total: number): Results => {
    const norm: Results = {};
    // Mantém a última ocorrência da questão (se duplicada na resposta)
    const entries = Object.entries(raw);
    // Ordena por número da pergunta; se a API tiver duplicatas, a última vence
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

  const computeStats = (r: Results) => {
    const s: Record<Alt, number> = { a: 0, b: 0, c: 0, d: 0, nula: 0 };
    Object.values(r).forEach((alt) => (s[alt] += 1));
    return s;
  };

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

      const rawJson = (await response.json()) as ApiRaw;
      console.log("✅ Resposta (bruta) da API:", rawJson);

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

  const mismatch =
    results &&
    (Object.keys(results).length !== questionCount ||
      Object.keys(results).some((k) => Number(k) < 1 || Number(k) > questionCount));

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
            style={{
              borderRadius: "8px",
              transform: "scaleX(-1)", // espelho
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
              {Math.round(photo.length / 1024)} KB — {cameraResolution}
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

        {/* RESULTADOS */}
        {results && (
          <div className="mt-6">
            {mismatch && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  Atenção: a resposta da API foi normalizada para 1..{questionCount}.
                </p>
              </div>
            )}

            <h3 className="text-lg font-semibold mb-2">Resumo</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {(["a", "b", "c", "d", "nula"] as Alt[]).map((k) => (
                <div key={k} className="border rounded-md p-3 text-center">
                  <div className="text-sm text-gray-500 uppercase">{k}</div>
                  <div className="text-xl font-semibold">{stats[k]}</div>
                </div>
              ))}
            </div>

            <div className="max-h-80 overflow-auto border rounded-md">
              <table className="w-full text-left">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 border-b">Questão</th>
                    <th className="px-3 py-2 border-b">Resposta</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: questionCount }, (_, i) => i + 1).map((q) => (
                    <tr key={q} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-2 border-b">{q}</td>
                      <td className="px-3 py-2 border-b uppercase">
                        {results[q]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              Total: {questionCount} — Respondidas (A-D):{" "}
              {stats.a + stats.b + stats.c + stats.d} — Nulas: {stats.nula}
            </p>
          </div>
        )}

        {/* Canvas invisível para captura de alta qualidade */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default CameraCapture;
