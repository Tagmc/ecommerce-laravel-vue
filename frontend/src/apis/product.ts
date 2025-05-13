import workApi from "../axios";
import type {
  Product,
  ProductFilterParams,
  ProductPayload,
  ProductsResponse,
} from "../types/product";

export const getProducts = async (
  params?: ProductFilterParams
): Promise<ProductsResponse | Product[]> => {
  const response = await workApi.get("/products", { params });
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await workApi.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  productData: ProductPayload
): Promise<Product> => {
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("price", productData.price.toString());
  formData.append("stock", productData.stock.toString());
  if (productData.description) {
    formData.append("description", productData.description);
  }
  if (productData.category_ids && productData.category_ids.length > 0) {
    productData.category_ids.forEach((id, index) => {
      formData.append(`category_ids[${index}]`, id.toString());
    });
  }
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      formData.append("images[]", image);
    });
  }
  const response = await workApi.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.product;
};

export const updateProduct = async (
  id: number,
  productData: ProductPayload
): Promise<Product> => {
  const formData = new FormData();
  formData.append("_method", "PUT");
  if (productData.name) formData.append("name", productData.name);
  if (productData.price !== undefined)
    formData.append("price", productData.price.toString());
  if (productData.stock !== undefined)
    formData.append("stock", productData.stock.toString());
  if (productData.description !== undefined)
    formData.append("description", productData.description || "");
  if (productData.category_ids && productData.category_ids.length > 0) {
    productData.category_ids.forEach((id, index) => {
      formData.append(`category_ids[${index}]`, id.toString());
    });
  }
  if (productData.images && productData.images.length > 0) {
    productData.images.forEach((image) => {
      formData.append("images[]", image);
    });
  }
  const response = await workApi.post(`/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.product;
};
export const deleteProduct = async (id: number): Promise<void> => {
  await workApi.delete(`/products/${id}`);
};