<?php

namespace App\Services;

use App\Jobs\SendOrderConfirmationEmail;
use App\Models\Order;
use App\Models\Product;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use Illuminate\Support\Facades\DB;

class OrderService
{
    protected $orderRepository;
    protected $cartRepository;
    protected $productRepository;

    public function __construct(OrderRepository $orderRepository, CartRepository $cartRepository, ProductRepository $productRepository)
    {
        $this->orderRepository = $orderRepository;
        $this->cartRepository = $cartRepository;
        $this->productRepository = $productRepository;
    }

    public function getOrders($userId = null, $status = null, $page = 1, $limit = 10)
    {
        return $this->orderRepository->getOrders($userId, $status, $page, $limit);
    }

    public function getOrderById($orderId, $userId = null)
    {
        return $this->orderRepository->getOrderById($orderId, $userId);
    }

    public function createOrder($userId, $orderData)
    {
        try {
            DB::beginTransaction();
            $cartItems = $this->cartRepository->getCartItems($userId);
            if ($cartItems->isEmpty()) {
                throw new \Exception('Giỏ hàng trống');
            }

            $total = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                $product = $this->productRepository->findById($item->product_id);
                if (!$product || $product->stock < $item->quantity) {
                    throw new \Exception("Sản phẩm {$product->name} không đủ số lượng");
                }

                $this->productRepository->update($product->id, [
                    'stock' => $product->stock - $item->quantity
                ]);

                $price = $product->price;
                $subtotal = $price * $item->quantity;
                $total += $subtotal;

                $orderItems[] = [
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $price
                ];
            }
            $orderData['user_id'] = $userId;
            $orderData['total_price'] = $total;
            $order = $this->orderRepository->createOrder($orderData, $orderItems);

            $this->cartRepository->clearCart($userId);

            DB::commit();

            SendOrderConfirmationEmail::dispatch($order);

            return $order;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
    public function updateOrderStatus($orderId, $status)
    {
        return $this->orderRepository->updateOrderStatus($orderId, $status);
    }


    public function deleteOrder($id)
    {
        return DB::transaction(function () use ($id) {
            $order = Order::findOrFail($id);

            // Nếu đơn hàng đã được xác nhận hoặc đang xử lý, hoàn lại số lượng sản phẩm
            if (in_array($order->status, ['pending', 'processing'])) {
                foreach ($order->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->stock += $item->quantity;
                        $product->save();
                    }
                }
            }
            $order->items()->delete();
            $order->delete();

            return true;
        });
    }
}
