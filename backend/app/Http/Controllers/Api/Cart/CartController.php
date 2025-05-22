<?php
namespace App\Http\Controllers\Api\Cart;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index(Request $request)
    {
        try {
            $userId = auth()->id();
            $cart = $this->cartService->getCartWithProducts($userId);

            return response()->json($cart);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy thông tin giỏ hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = auth()->id();
            $productId = $request->product_id;
            $quantity = $request->quantity;

            $cartItem = $this->cartService->addToCart($userId, $productId, $quantity);

            return response()->json([
                'message' => 'Thêm vào giỏ hàng thành công',
                'item' => $cartItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể thêm vào giỏ hàng',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function update(Request $request, $productId)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            $userId = auth()->id();
            $quantity = $request->quantity;

            $cartItem = $this->cartService->updateCartItem($userId, $productId, $quantity);

            if (!$cartItem) {
                return response()->json([
                    'message' => 'Sản phẩm không tồn tại trong giỏ hàng'
                ], 404);
            }

            return response()->json([
                'message' => 'Cập nhật giỏ hàng thành công',
                'item' => $cartItem
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể cập nhật giỏ hàng',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function destroy($productId)
    {
        try {
            $userId = auth()->id();
            $this->cartService->removeFromCart($userId, $productId);

            return response()->json([
                'message' => 'Đã xóa sản phẩm khỏi giỏ hàng'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể xóa sản phẩm khỏi giỏ hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clear()
    {
        try {
            $userId = auth()->id();
            $this->cartService->clearCart($userId);

            return response()->json([
                'message' => 'Đã xóa toàn bộ giỏ hàng'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể xóa giỏ hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
