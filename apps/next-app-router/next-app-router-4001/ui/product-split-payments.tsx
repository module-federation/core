import { ProductCurrencySymbol } from '#/ui/product-currency-symbol';
import { allocate, toDecimal, type Dinero } from 'dinero.js';

export const ProductSplitPayments = ({ price }: { price: Dinero<number> }) => {
  // only offer split payments for more expensive items
  if (toDecimal(price, ({ value }) => Number(value)) < 150) {
    return null;
  }

  const [perMonth] = allocate(price, [1, 2]);
  return (
    <div className="text-sm text-gray-400">
      Or <ProductCurrencySymbol dinero={price} />
      {toDecimal(perMonth, ({ value }) => Math.ceil(Number(value)))}/month for 3
      months
    </div>
  );
};
