import React from 'react';

interface FooterProps {
  companyName?: string;
}

const Footer: React.FC<FooterProps> = ({ companyName = '{{ mfName }}' }) => (
  <footer
    style={{
      backgroundColor: '#f5f5f5',
      padding: '20px',
      borderTop: '1px solid #ddd',
      marginTop: '40px',
      textAlign: 'center',
      borderRadius: '4px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '10px',
      }}
    >
      <a href="#" style={{ color: '#333', textDecoration: 'none' }}>
        Terms
      </a>
      <a href="#" style={{ color: '#333', textDecoration: 'none' }}>
        Privacy
      </a>
      <a href="#" style={{ color: '#333', textDecoration: 'none' }}>
        Contact
      </a>
    </div>
    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
      © {new Date().getFullYear()} {companyName} - Federated with Zephyr and
      Vite
    </p>
  </footer>
);

export default Footer;
