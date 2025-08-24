import { Header } from "../components/Header";
import CameraCapture from "../layout/CameraCapture";

export default function GabaritoPage() {
  const apiUrl = "https://gerador-gabarito-corretor-experimental.lh6c5d.easypanel.host/api/leitor/";

  return (
    <>
      <Header />
      <div className="pt-20 p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CameraCapture apiUrl={apiUrl} />
        </div>
      </div>
    </>
  );
}
