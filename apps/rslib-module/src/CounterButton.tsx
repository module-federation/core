interface CounterButtonProps {
  onClick: () => void;
  label: string;
  [key: string]: any;
}

export const CounterButton: React.FC<CounterButtonProps> = ({
  onClick,
  label,
  ...props
}) => (
  <button type="button" onClick={onClick} {...props}>
    {label}
  </button>
);
