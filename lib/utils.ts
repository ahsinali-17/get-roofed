export const formatPrice = (price: number): string => {
  let newPrice: number | string = price;
  if (price >= 10000000) newPrice = price / 10000000 + " Cr";
  else if (price >= 100000) newPrice = price / 100000 + " Lac";

  return newPrice.toLocaleString("en-US", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 1,
  });
};
