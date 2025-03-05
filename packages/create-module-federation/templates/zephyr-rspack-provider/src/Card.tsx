import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
}

const Card: React.FC<CardProps> = ({
  title = 'Zephyr Federated Card',
  description = 'This card component is federated through Module Federation with Zephyr and Rspack.',
}) => (
  <div
    style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    }}
  >
    <h3 style={{ margin: '0 0 10px 0' }}>{title}</h3>
    <p style={{ margin: '0' }}>{description}</p>
  </div>
);

export default Card;
