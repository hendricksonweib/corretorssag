import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "../components/Button";

interface CameraCaptureProps {
  apiUrl: string;
}

const CameraCapture = ({ apiUrl }: CameraCaptureProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraResolution, setCameraResolution] = useState("");

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Configurações de resolução máxima
  const videoConstraints = {
    facingMode: "environment",
    width: { ideal: 4096 },
    height: { ideal: 2160 },
    advanced: [
      { width: 4096, height: 2160 }, // 4K
      { width: 3840, height: 2160 }, // 4K UHD
      { width: 1920, height: 1080 }, // Full HD
      { width: 1280, height: 720 },  // HD
    ]
  };

  useEffect(() => {
    // Verifica as capacidades da câmera quando estiver pronta
    const checkCameraResolution = () => {
      if (webcamRef.current?.video) {
        const video = webcamRef.current.video;
        setCameraResolution(`${video.videoWidth}x${video.videoHeight}`);
        setCameraReady(true);
        console.log("📷 Resolução da câmera:", `${video.videoWidth}x${video.videoHeight}`);
      }
    };

    if (webcamRef.current?.video) {
      webcamRef.current.video.addEventListener('loadedmetadata', checkCameraResolution);
    }

    return () => {
      if (webcamRef.current?.video) {
        webcamRef.current.video.removeEventListener('loadedmetadata', checkCameraResolution);
      }
    };
  }, []);


  const handleCapture = () => {
    if (!webcamRef.current || !cameraReady) return;

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // Configura o canvas com as dimensões reais do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Captura o frame em alta resolução
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converte para PNG com máxima qualidade
    const highQualityPhoto = canvas.toDataURL('image/png', 1.0);
    
    console.log("📸 Foto capturada:", {
      width: canvas.width,
      height: canvas.height,
      size: highQualityPhoto.length
    });

    setPhoto(highQualityPhoto);
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

    try {
      // Converte para Blob mantendo alta qualidade
      const blob = await fetch(photo).then(res => res.blob());
      
      const formData = new FormData();
      formData.append("imagem", blob, "high_quality_photo.png");
      formData.append("numero_questoes", String(questionCount));

      console.log("📤 Enviando imagem:", {
        size: blob.size,
        type: blob.type
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Resposta da API:", result);

      alert("Foto em alta qualidade enviada com sucesso!");
    } catch (err) {
      console.error("❌ Erro no envio:", err);
      setError("Erro ao enviar os dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const retryCamera = () => {
    setCameraReady(false);
    setTimeout(() => {
      if (webcamRef.current?.video) {
        setCameraReady(true);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-2xl p-6">
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
              borderRadius: '8px',
              transform: 'scaleX(-1)' // Espelha horizontalmente para modo espelho
            }}
          />
          
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <p className="text-white">Carregando câmera...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <Button
            label="Capturar Foto"
            onClick={handleCapture}
            disabled={loading || !cameraReady}
          />
          <Button
            label="Recarregar Camera"
            onClick={retryCamera}
          />
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
              {Math.round(photo.length / 1024)} KB - {cameraResolution}
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
            min="1"
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

        {/* Canvas invisível para captura de alta qualidade */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default CameraCapture;