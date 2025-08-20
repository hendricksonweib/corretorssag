import { Pencil, Trash2 } from "lucide-react";

type IconButtonProps = {
  type: "edit" | "delete";
  onClick: () => void;
};

export const IconButton = ({ type, onClick }: IconButtonProps) => {
  const Icon = type === "edit" ? Pencil : Trash2;
  const color = type === "edit" ? "text-blue-500" : "text-red-500";

  return (
    <button
      onClick={onClick}
      className={`hover:scale-110 transition-transform duration-150 ${color}`}
      title={type === "edit" ? "Editar" : "Excluir"}
    >
      <Icon size={18} />
    </button>
  );
};
