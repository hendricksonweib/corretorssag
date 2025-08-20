type ButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export const Button = ({ label, onClick, disabled }: ButtonProps) => (
  <button
    type="submit"
    onClick={onClick}
    disabled={disabled} 
    className={`w-full py-2 rounded-md font-semibold transition cursor-pointer ${
      disabled
        ? "bg-gray-400 text-gray-600 cursor-not-allowed" 
        : "bg-blue-600 text-white hover:bg-blue-700" 
    }`}
  >
    {label}
  </button>
);
