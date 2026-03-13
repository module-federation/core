import React, { useState } from 'react';

const CheckoutTitle = () => {
  const [hookData] = useState('with hooks data');
  console.log('CHECKOUT TITLE Componnet');

  return (
    <h3 className="title">
      This title came from <code>checkout</code> {hookData}!!!
    </h3>
  );
};

export default CheckoutTitle;
