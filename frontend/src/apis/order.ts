import workApi from "../axios";

export const getOrders = async (params = {}) => {
  const response = await workApi.get("/orders", { params });
  return response.data;
};

export const getOrderById = async (id: number) => {
  const response = await workApi.get(`/orders/${id}`);
  return response.data;
}

export const createOrder = async (orderData: any) => {
  const response = await workApi.post('/orders', orderData);
  return response.data;
}

export const updateOrderStatus = async (id: number, status: string) => {
  const response = await workApi.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const response = await workApi.delete(`/orders/${id}`);
  return response.data;
};
