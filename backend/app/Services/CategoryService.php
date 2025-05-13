<?php
namespace App\Services;

use App\Repositories\CategoryRepository;

class CategoryService {
    protected $categoryRepository;
    public function __construct(CategoryRepository $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllCategories() {
        return $this->categoryRepository->getAllCategories();
    }

    public function createCategory($data) {
        return $this->categoryRepository->create($data);
    }

    public function getCategoryById($id)
    {
        return $this->categoryRepository->findCategoryById($id);
    }

    public function updateCategory($id, $data)
    {
        return $this->categoryRepository->update($id, $data);
    }

    public function deleteCategory($id)
    {
        return $this->categoryRepository->delete($id);
    }
}
