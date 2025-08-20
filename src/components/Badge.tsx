type BadgeProps = {
  text: string;
};

export const Badge = ({ text }: BadgeProps) => {
  const base = "text-xs px-2 py-1 rounded-full font-semibold";

  const colorMap: Record<string, string> = {
    ADMINISTRADOR: "bg-red-100 text-red-700",
    COORDENADOR: "bg-yellow-100 text-yellow-800",
    PROFESSOR: "bg-purple-100 text-purple-700",
    GESTOR: "bg-green-100 text-green-700",
    SECRETARIA: "bg-blue-100 text-blue-700",
  };

  const style = colorMap[text.toUpperCase()] || "bg-gray-100 text-gray-700";

  return <span className={`${base} ${style}`}>{text}</span>;
};
