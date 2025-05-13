<?php

namespace App\Repositories;

use App\Models\Category;

class CategoryRepository
{
    public function getAllCategories()
    {
        return Category::all();
    }
    public function create($data)
    {
        return Category::create($data);
    }
    public function findCategoryById($id)
    {
        return Category::find($id);
    }

    public function update($id, $data)
    {
        $category = Category::findOrFail($id);
        if ($category) {
            $category->update($data);
            return $category;
        }
        return null;
    }

    public function delete($id) {
        $category = Category::findOrFail($id);
        if ($category) {
            $category->delete();
            return true;
        }
        return false;
    }
}
