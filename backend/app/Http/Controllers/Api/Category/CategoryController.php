<?php

namespace App\Http\Controllers\Api\Category;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Services\CategoryService;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(CategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }

    public function index() {
        $categories = $this->categoryService->getAllCategories();
        return response()->json($categories);
    }

    public function store(StoreCategoryRequest $request) {
        $categoryData = $request->validated();
        $category = $this->categoryService->createCategory($categoryData);
        return response()->json([
            'message' => 'Tạo danh mục thành công',
            'category' => $category
        ], 201);
    }

    public function update(StoreCategoryRequest $request, $id) {
        $category = $this->categoryService->updateCategory($id, $request->validated());

        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại'
            ], 401);
        }
        return response()->json([
            'message' => 'Cập nhật danh mục thành công',
            'category' => $category
        ], 200);
    }
    public function delete($id) {
        $deleted = $this->categoryService->deleteCategory($id);
        if (!$deleted) {
            return response()->json([
                'message' => 'Danh mục không tồn tại'
            ], 404);
        }
        return response()->json([
            'message' => 'Xóa danh mục thành công'
        ], 200);
    }

    public function show($id) {
        $category = $this->categoryService->getCategoryById($id);
        if (!$category) {
            return response()->json([
                'message' => 'Danh mục không tồn tại'
            ], 404);
        }
        return response()->json([
            'category' => $category
        ], 200);
    }
}
