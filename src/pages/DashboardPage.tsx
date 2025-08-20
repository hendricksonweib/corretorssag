import { Header } from "../components/Header";
import { PdfUploader } from "../ui/PdfUploader";

export const DashboardPage = () => {


  return (
    <>
      <Header />
      <div className="pt-20 p-12 bg-gray-100 min-h-screen">
<PdfUploader />
      </div>
    </>
  );
};
