<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderItem;

class OrderRepository
{
    public function getOrders($userId = null, $status = null, $page = 1, $limit = 10)
    {
        $query = Order::query()->with(['items.product', 'user']);

        if ($userId) {
            $query->where('user_id', $userId);
        }
        if ($status) {
            $query->where('status', $status);
        }
        return $query->orderBy('created_at', 'desc')->paginate($limit, ['*'], 'page', $page);
    }
    public function getOrderById($orderId, $userId = null)
    {
        $query = Order::with(['items.product', 'user']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->findOrFail($orderId);
    }

    public function createOrder($orderData, $orderItems)
    {
        $order = Order::create($orderData);

        foreach ($orderItems as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price']
            ]);
        }

        return $order->load('items.product');
    }

    public function updateOrderStatus($orderId, $status)
    {
        $order = Order::findOrFail($orderId);
        $order->status = $status;
        $order->save();

        return $order;
    }
}
