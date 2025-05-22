<?php

namespace App\Services;

use App\Repositories\CartRepository;
use App\Repositories\ProductRepository;

class CartService
{
    protected $cartRepository;
    protected $productRepository;

    public function __construct(CartRepository $cartRepository, ProductRepository $productRepository)
    {
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
    }

    public function getCartWithProducts($userId)
    {
        $cartItems = $this->cartRepository->getCartItems($userId);
        $total = 0;

        foreach ($cartItems as $item) {
            $item->subtotal = $item->product->price * $item->quantity;
            $total += $item->subtotal;
        }

        return [
            'items' => $cartItems,
            'total' => $total,
            'count' => $cartItems->sum('quantity')
        ];
    }

    public function addToCart($userId, $productId, $quantity = 1) {
        $product = $this->productRepository->findById($productId);

        if (!$product || $product->stock < $quantity) {
            throw new \Exception('Sản phẩm không tồn tại hoặc không đủ số lượng');
        }
        return $this->cartRepository->addToCart($userId, $productId, $quantity);
    }

    public function updateCartItem($userId, $productId, $quantity)
    {
        $product = $this->productRepository->findById($productId);

        if (!$product || $product->stock < $quantity) {
            throw new \Exception('Sản phẩm không tồn tại hoặc không đủ số lượng');
        }

        return $this->cartRepository->updateCartItem($userId, $productId, $quantity);
    }

    public function removeFromCart($userId, $productId)
    {
        return $this->cartRepository->removeFromCart($userId, $productId);
    }

    public function clearCart($userId)
    {
        return $this->cartRepository->clearCart($userId);
    }
}
