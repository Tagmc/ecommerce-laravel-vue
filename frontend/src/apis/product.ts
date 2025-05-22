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
  productData: ProductPayload | FormData
): Promise<Product> => {
  if (productData instanceof FormData) {
    const response = await workApi.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.product;
  }

  const formData = new FormData();
  
  formData.append("name", productData.name || '');
  
  if (productData.price !== undefined && productData.price !== null) {
    formData.append("price", String(productData.price));
  } else {
    formData.append("price", "0");
  }
  
  if (productData.stock !== undefined && productData.stock !== null) {
    formData.append("stock", String(productData.stock));
  } else {
    formData.append("stock", "0");
  }
  
  if (productData.description) {
    formData.append("description", productData.description);
  }
  
  if (productData.category_ids && Array.isArray(productData.category_ids) && productData.category_ids.length > 0) {
    productData.category_ids.forEach((id, index) => {
      if (id !== undefined && id !== null) {
        formData.append(`category_ids[${index}]`, String(id));
      }
    });
  }
  if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
    productData.images.forEach((image) => {
      if (image) {
        formData.append("images[]", image);
      }
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
  productData: ProductPayload | FormData
): Promise<Product> => {
  if (productData instanceof FormData) {
    if (!productData.has('_method')) {
      productData.append('_method', 'PUT');
    }
    
    const response = await workApi.post(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.product;
  }

  const formData = new FormData();
  formData.append("_method", "PUT");
  
  if (productData.name !== undefined) {
    formData.append("name", productData.name || '');
  }
  
  if (productData.price !== undefined && productData.price !== null) {
    formData.append("price", String(productData.price));
  }
  
  if (productData.stock !== undefined && productData.stock !== null) {
    formData.append("stock", String(productData.stock));
  }
  
  if (productData.description !== undefined) {
    formData.append("description", productData.description || "");
  }
  
  if (productData.category_ids && Array.isArray(productData.category_ids) && productData.category_ids.length > 0) {
    productData.category_ids.forEach((id, index) => {
      if (id !== undefined && id !== null) {
        formData.append(`category_ids[${index}]`, String(id));
      }
    });
  }
  
  if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
    productData.images.forEach((image) => {
      if (image) {
        formData.append("images[]", image);
      }
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