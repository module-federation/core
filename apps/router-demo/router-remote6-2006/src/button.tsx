import styled from '@emotion/styled';

const ButtonContainer = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(139, 92, 246, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
  }
`;

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children = 'Remote6 Button (React Router v7)',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const handleClick = () => {
    console.log(
      '🎯 Remote6 button clicked! (React Router v7 + Module Federation)',
    );
    onClick?.();
  };

  return (
    <ButtonContainer type={type} onClick={handleClick} disabled={disabled}>
      {children} 🚀
    </ButtonContainer>
  );
};

export default Button;
