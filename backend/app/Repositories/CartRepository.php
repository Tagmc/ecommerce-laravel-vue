<?php

namespace App\Repositories;

use App\Models\Cart;

class CartRepository
{
    public function getCartItems($userId)
    {
        return Cart::where('user_id', $userId)
            ->with('product')
            ->get();
    }

    public function addToCart($userId, $productId, $quantity = 1)
    {
        $cart = Cart::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($cart) {
            $cart->quantity += $quantity;
            $cart->save();
            return $cart;
        }
        return Cart::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'quantity' => $quantity
        ]);
    }

    public function updateCartItem($userId, $productId, $quantity)
    {
        $cart = Cart::where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();
        if (!$cart) {
            return null;
        }

        $cart->quantity = $quantity;
        $cart->save();
        return $cart;
    }

    public function removeFromCart($userId, $productId)
    {
        return Cart::where('user_id', $userId)
            ->where('product_id', $productId)
            ->delete();
    }

    public function clearCart($userId)
    {
        return Cart::where('user_id', $userId)->delete();
    }
}
