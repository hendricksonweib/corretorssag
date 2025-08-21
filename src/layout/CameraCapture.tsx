import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";

interface CameraCaptureProps {
  apiUrl: string;
}

type ApiRaw = Record<string, string>;

const CameraCapture = ({ apiUrl }: CameraCaptureProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraResolution, setCameraResolution] = useState("");

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
  };

  const handleSubmit = async () => {
    if (!photo) {
      setError("Por favor, tire uma foto primeiro.");
      return;
    }

    if (questionCount.trim() === "" || Number(questionCount) <= 0 || Number(questionCount) > 60) {
      setError("Por favor, informe um número de questões válido (1-60).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blob = await fetch(photo).then((res) => res.blob());

      const formData = new FormData();
      formData.append("imagem", blob, "high_quality_photo.png");
      formData.append("numero_questoes", questionCount);

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

      if (Object.keys(rawJson).length === 0) {
        throw new Error("Nenhum dado retornado da API.");
      }

      console.log("✅ Resposta (bruta) da API:", rawJson);
      alert(JSON.stringify(rawJson, null, 2));

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

  const handleQuestionCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d{0,2}$/.test(inputValue)) {
      if (Number(inputValue) <= 60) {
        setQuestionCount(inputValue);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg p-4 flex-1">
        <h2 className="text-xl font-semibold text-blue-600 text-center mb-4">
          Capture o Gabarito
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
            type="text"
            value={questionCount}
            onChange={handleQuestionCountChange}
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
