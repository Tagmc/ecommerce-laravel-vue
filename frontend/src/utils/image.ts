/**
 * Lấy URL hợp lệ cho hình ảnh
 * @param url Đường dẫn ảnh gốc
 * @returns Đường dẫn đầy đủ
 */
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/placeholder.png';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const baseUrl = 'http://localhost:8000';
  if (url.startsWith('/storage/')) {
    return `${baseUrl}${url}`;
  }
  if (!url.startsWith('/')) {
    return `${baseUrl}/${url}`;
  }
  return `${baseUrl}${url}`;
};

/**
 * Lấy URL cho ảnh sản phẩm
 * @param images Mảng các đường dẫn ảnh
 * @returns Đường dẫn đầy đủ của ảnh đầu tiên hoặc ảnh mặc định
 */
export const getProductImageUrl = (images: string[] | null | undefined): string => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/images/placeholder.png';
  }
  
  return getImageUrl(images[0]);
};