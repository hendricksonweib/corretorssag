type LabelProps = {
  text: string;
};

export const Label = ({ text }: LabelProps) => (
  <label className="text-sm font-medium text-gray-700 mb-1 block">{text}</label>
);
