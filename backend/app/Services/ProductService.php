<?php

namespace App\Services;

use App\Repositories\ProductRepository;

class ProductService
{
    protected $productRepository;

    public function __construct(ProductRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }

    public function createProduct($data)
    {
        $imagePaths = [];
        if (isset($data['images'])) {
            foreach ($data['images'] as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = 'storage/' . $path;
            }
        }
        $data['images'] = $imagePaths;
        $product = $this->productRepository->create($data);
        if (isset($data['category_ids'])) {
            $product->categories()->attach($data['category_ids']);
        }

        return $product;
    }

    public function updateProduct($id, $data)
    {
        if (isset($data['images'])) {
            $imagePaths = [];
            foreach ($data['images'] as $image) {
                $path = $image->store('products', 'public');
                $imagePaths[] = 'storage/' . $path;
            }
            $data['images'] = $imagePaths;
        }

        $product = $this->productRepository->update($id, $data);

        if (isset($data['category_ids'])) {
            $product->categories()->sync($data['category_ids']);
        }

        return $product;
    }

    public function getAllProducts()
    {
        return $this->productRepository->getAll();
    }

    public function getProduct($id)
    {
        return $this->productRepository->find($id);
    }

    public function deleteProduct($id)
    {
        return $this->productRepository->delete($id);
    }
}
