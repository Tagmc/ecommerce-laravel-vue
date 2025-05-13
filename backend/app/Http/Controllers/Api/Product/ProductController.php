<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    protected $productService;
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function store(StoreProductRequest $request)
    {
        try {
            $productData = $request->validated();


            if ($request->hasFile('images')) {
                $productData['images'] = $request->file('images');
            }

            $product = $this->productService->createProduct($productData);

            return response()->json([
                'message' => 'Tạo sản phẩm thành công',
                'product' => $product // Hoặc new ProductResource($product)
            ], 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log::error('Error creating product: ' . $e->getMessage());
            return response()->json(['message' => 'Không thể tạo sản phẩm.', 'error' => $e->getMessage()], 500);
        }
    }
    public function index(Request $request)
    {
        try {
            $products = $this->productService->getAllProducts($request);
            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể lấy danh sách sản phẩm.', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(int $id)
    {
        try {
            $product = $this->productService->getProductById($id);
            if (!$product) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm.'], 404);
            }
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể lấy thông tin sản phẩm.', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(StoreProductRequest $request, int $id)
    {
        try {
            $productData = $request->validated();

            if ($request->hasFile('images')) {
                $productData['images'] = $request->file('images');
            }
            $product = $this->productService->updateProduct($id, $productData);

            if (!$product) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm để cập nhật.'], 404);
            }
            return response()->json([
                'message' => 'Cập nhật sản phẩm thành công',
                'product' => $product
            ], 200);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Dữ liệu không hợp lệ.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể cập nhật sản phẩm.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id)
    {
        try {
            $deleted = $this->productService->deleteProduct($id);
            if (!$deleted) {
                return response()->json(['message' => 'Không tìm thấy sản phẩm để xóa hoặc xóa không thành công.'], 404);
            }
            return response()->json(['message' => 'Xóa sản phẩm thành công'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể xóa sản phẩm.', 'error' => $e->getMessage()], 500);
        }
    }
}
