
import { Header } from "../components/Header";
import CameraCapture from "../layout/CameraCapture";

export default function GabaritoPage() {
  const apiUrl = "https://gerador-gabarito-corretor-experimental.lh6c5d.easypanel.host/api/leitor/";
  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
        <CameraCapture apiUrl={apiUrl} />
      </div>
    </>
  );
}
