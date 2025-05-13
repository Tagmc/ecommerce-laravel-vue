<?php

namespace App\Http\Controllers\Api\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Services\ProductService;

class ProductController extends Controller
{
    protected $productService;
    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

        public function store(StoreProductRequest $request)
        {
            $productData = $request->validated();
            $files = $request->file('images');
            if ($files) {
                if (!is_array($files)) {
                    $files = [$files];
                }
                $productData['images'] = $files;
            }
            $product = $this->productService->createProduct($productData);
            return response()->json([
                'message' => 'Tạo sản phẩm thành công',
                'product' => $product
            ], 201);
    }
    public function index()
    {
        $products = $this->productService->getAllProducts();
        return response()->json($products);
    }

    public function show($id)
    {
        $product = $this->productService->getProduct($id);
        return response()->json($product);
    }

    public function update(StoreProductRequest $request, $id)
    {
        $productData = $request->validated();
        $files = $request->file('images');
        if ($files) {
            if (!is_array($files)) {
                $files = [$files];
            }
            $productData['images'] = $files;
        }
        $product = $this->productService->updateProduct($id, $productData);
        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'product' => $product
        ], 200);
    }
    public function destroy($id)
{
    $this->productService->deleteProduct($id);
    return response()->json(['message' => 'Xóa sản phẩm thành công'], 204);
}
}
