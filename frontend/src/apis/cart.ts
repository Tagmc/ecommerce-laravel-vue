import workApi from "../axios";


export const getCart = async () => {
  const response = await workApi.get("/cart");
  return response.data;
}

export const addToCart = async (productId: number, quantity: number) => {
  const response = await workApi.post("/cart/add", {
    product_id: productId,
    quantity
  });
  return response.data;
}

export const updateCartItem = async (productId: number, quantity: number) => {
  const response = await workApi.put(`/cart/${productId}`, {
    quantity
  });
  return response.data;
}

export const removeFromCart = async (productId: number) => {
  const response = await workApi.delete(`/cart/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await workApi.delete("/cart");
  return response.data;
};