<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection as EloquentCollection;

class ProductRepository
{
    protected Product $model;

    public function __construct(Product $product)
    {
        $this->model = $product;
    }

    /**
     * Tạo sản phẩm mới.
     *
     * @param array $data
     * @return Product
     */
    public function create(array $data): Product
    {
        return $this->model->create($data);
    }

    public function getAll(array $filters = [], ?int $perPage = 15)
    {
        $query = $this->model->query()->with('categories');
        if (!empty($filters['category_ids']) && is_array($filters['category_ids'])) {
            $query->whereHas('categories', function (Builder $q) use ($filters) {
                $q->whereIn('categories.id', $filters['category_ids']);
            });
        }
        if (isset($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }
        if (!empty($filters['category_slug'])) {
            $query->whereHas('categories', function (Builder $q) use ($filters) {
                $q->where('categories.slug', $filters['category_slug']);
            });
        }
        if (!empty($filters['category_id'])) {
            $query->whereHas('categories', function (Builder $q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function (Builder $q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        if (in_array($sortBy, ['name', 'price', 'created_at', 'updated_at']) && in_array(strtolower($sortDirection), ['asc', 'desc'])) {
            if (in_array($sortBy, $this->model->getFillable()) || $sortBy === 'created_at' || $sortBy === 'updated_at') {
                $query->orderBy($this->model->getTable() . '.' . $sortBy, $sortDirection);
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }
        }


        if ($perPage) {
            return $query->paginate($perPage);
        }

        return $query->get();
    }

    /**
     * Tìm sản phẩm bằng ID.
     *
     * @param int $id
     * @return Product|null
     */
    public function findById(int $id): ?Product
    {
        return $this->model->with('categories')->find($id);
    }

    /**
     * Cập nhật sản phẩm.
     *
     * @param int $id
     * @param array $data
     * @return Product|null
     */
    public function update(int $id, array $data): ?Product
    {
        $product = $this->findById($id);
        if ($product) {
            $product->update($data);
            return $product->load('categories');
        }
        return null;
    }
    /**
     * Xóa sản phẩm.
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id): bool
    {
        $product = $this->model->find($id);
        if ($product) {
            return $product->delete();
        }
        return false;
    }
}
