import React from 'react';

interface ButtonProps {
  label?: string;
}

const Button: React.FC<ButtonProps> = ({
  label = 'Zephyr Federated Button',
}) => (
  <button
    style={{
      padding: '12px 20px',
      backgroundColor: '#0070f3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    }}
  >
    {label}
  </button>
);

export default Button;
