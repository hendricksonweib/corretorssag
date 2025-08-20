import { Badge } from "../components/Badge";
import { IconButton } from "../components/IconButton";

type UserRowProps = {
  nome: string;
  email: string;
  tipo_usuario: string;
  onEdit: () => void;
  onDelete: () => void;
};

export const UserRow = ({ nome, email, tipo_usuario, onEdit, onDelete }: UserRowProps) => {

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
          {nome.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-800 leading-tight">{nome}</p>
          <p className="text-sm text-gray-500">Email: {email}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Badge text={tipo_usuario} />
        <div className="flex gap-3">
          <IconButton type="edit" onClick={onEdit} />
          <IconButton type="delete" onClick={onDelete} />
        </div>
      </div>
    </div>
  );
};
