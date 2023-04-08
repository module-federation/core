import React, { useEffect, useState } from 'react';
console.log(__webpack_share_scopes__, React)
const CheckoutTitle = () => {
  const [hookData, setHookData] = useState('');

  useEffect(() => {
    setHookData('with hooks data');
  }, []);

  return (
    <h3 className="title">
      This title came from <code>checkout</code> {hookData}!!!
    </h3>
  );
};

export default CheckoutTitle;
