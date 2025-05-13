<?php

namespace App\Services;

use App\Repositories\ProductRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Để log lỗi nếu cần
use App\Models\Product; // For type hinting
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as EloquentCollection;


class ProductService
{
    protected ProductRepository $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    /**
     * Xử lý upload và lưu đường dẫn hình ảnh.
     *
     * @param array $files Mảng các file ảnh từ request.
     * @return array Mảng các đường dẫn đã lưu.
     */
    private function handleImageUploads(array $files): array
    {
        $imagePaths = [];
        foreach ($files as $image) {
            if ($image->isValid()) {
                $path = $image->store('products', 'public');
                $imagePaths[] = Storage::url($path);
            }
        }
        return $imagePaths;
    }

    public function createProduct(array $productData): Product
    {
        if (isset($productData['images']) && is_array($productData['images'])) {
            $productData['images'] = $this->handleImageUploads($productData['images']);
        } else {
            $productData['images'] = [];
        }
        $product = $this->productRepository->create($productData);

        if (!empty($productData['category_ids']) && is_array($productData['category_ids'])) {
            $product->categories()->attach($productData['category_ids']);
        }
        return $product->load('categories');
    }

    public function updateProduct(int $id, array $productData): ?Product
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            return null;
        }

        if (isset($productData['images']) && is_array($productData['images'])) {
            foreach (($product->images ?? []) as $oldImagePath) {
                $oldStoragePath = str_replace(Storage::url(''), '', $oldImagePath);
                if (Storage::disk('public')->exists($oldStoragePath)) {
                    Storage::disk('public')->delete($oldStoragePath);
                }
            }
            $productData['images'] = $this->handleImageUploads($productData['images']);
        }

        $updatedProduct = $this->productRepository->update($id, $productData);

        if ($updatedProduct && isset($productData['category_ids'])) {
            $updatedProduct->categories()->sync($productData['category_ids']);
        }

        return $updatedProduct ? $updatedProduct->load('categories') : null;
    }

    /**
     * Lấy tất cả sản phẩm dựa trên request.
     *
     * @param Request $request
     * @return LengthAwarePaginator|EloquentCollection
     */
    public function getAllProducts(Request $request)
    {
        $filters = [
            'category_ids' => $request->input('category_ids'), // Mảng ID: ?category_ids[]=1&category_ids[]=2
            'category_id' => $request->input('category_id'),   // Một ID: ?category_id=1
            'category_slug' => $request->input('category_slug'),// Một slug: ?category_slug=ten-danh-muc
            'search' => $request->input('search'),
            'sort_by' => $request->input('sort_by', 'created_at'),
            'sort_direction' => $request->input('sort_direction', 'desc'),
        ];

        // Loại bỏ các filter rỗng để không ảnh hưởng query
        $filters = array_filter($filters, function($value) {
            return !is_null($value) && $value !== '';
        });

        $perPage = $request->input('per_page') ? (int)$request->input('per_page') : 15;
        if ($request->has('all') && $request->boolean('all')) { // Thêm tham số ?all=true để lấy tất cả
            $perPage = null;
        }


        return $this->productRepository->getAll($filters, $perPage);
    }

    public function getProductById(int $id): ?Product
    {
        return $this->productRepository->findById($id);
    }

    public function deleteProduct(int $id): bool
    {
        $product = $this->productRepository->findById($id);
        if ($product) {
            return $this->productRepository->delete($id);
        }
        return false;
    }
}
