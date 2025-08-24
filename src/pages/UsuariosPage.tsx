import { useState } from "react";
import { PaginatedList } from "../layout/PaginatedList";
import { Header } from "../components/Header";
import { PageHeader } from "../ui/PageHeader";
import { CreateUserModal } from "../components/modals/CreateUserModal";
import { Plus } from "lucide-react";
export const UsuariosPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [reloadList, setReloadList] = useState(false);

  const handleSuccess = () => {
    setShowModal(false);
    setReloadList(true);
  };

  return (
    <>
      <Header />

      <div className="pt-16 sm:pt-20 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 lg:px-8">

          <div className="sm:hidden sticky top-16 z-20 bg-gradient-to-b from-gray-50 to-gray-100/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
            <div className="flex items-center justify-between py-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Usuários</h1>
                <p className="text-sm text-gray-600">Gerenciamento de usuários do sistema</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium shadow-sm active:scale-[0.98] transition"
                aria-label="Criar novo usuário"
              >
                <Plus className="h-4 w-4" />
                Novo
              </button>
            </div>
          </div>

          <div className="hidden sm:block">
            <PageHeader
              title="Usuários"
              description="Gerenciamento de usuários do sistema"
              actionLabel="Novo Usuário"
              onActionClick={() => setShowModal(true)}
            />
          </div>

          <section
            aria-label="Lista de usuários"
            className="mt-4 sm:mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">Todos os usuários</h2>
                {/* Espaço para filtros no futuro */}
              </div>
            </div>

            <div className="px-2 sm:px-4 py-2 sm:py-4">
              <PaginatedList
                reload={reloadList}
                onReloadDone={() => setReloadList(false)}
              />
            </div>
          </section>

          <div className="h-24 sm:h-0 pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="sm:hidden fixed bottom-6 right-6 z-30 rounded-full shadow-lg border border-gray-200 bg-white p-4 active:scale-95 transition"
        aria-label="Criar novo usuário (flutuante)"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
