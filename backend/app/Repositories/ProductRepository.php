<?php
namespace App\Repositories;

use App\Models\Product;

class ProductRepository
{
    public function create($data) {
        return Product::create($data);
    }

    public function getAll() {
        return Product::with('categories')->get();
    }

    public function find($id) {
        return Product::with('categories')->find($id);
    }

    public function update($id, $data) {
        $product = Product::findOrFail($id);
        $product->update($data);
        return $product;
    }

    public function delete($id) {
        $product = Product::findOrFail($id);
        $product->delete();
        return true;
    }
}
