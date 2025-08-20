import { Label } from "../components/Label";
import { Input } from "../components/Input";

type InputFieldProps = {
  label: string;
  type: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
}: InputFieldProps) => (
  <div className="mb-4">
    <Label text={label} />
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);
