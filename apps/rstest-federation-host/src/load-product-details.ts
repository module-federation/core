export const loadProductDetails = async (): Promise<string> => {
  const { default: getProductDetails } =
    await import('catalogRemote/product-details');

  return getProductDetails();
};
