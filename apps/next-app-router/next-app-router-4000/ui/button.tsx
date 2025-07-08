// Simple local Button component to replace Module Federation imports
// since Module Federation (nextjs-mf) doesn't support App Router
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Button({
  children,
  onClick,
  className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 ${className}`}
    >
      {children}
    </button>
  );
}
