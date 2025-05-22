<?php
namespace App\Http\Controllers\Api\Order;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    public function index(Request $request)
    {
        try {
            $userId = null;
            $status = $request->status;
            $page = $request->page ?? 1;
            $limit = $request->limit ?? 10;
            if (!auth()->user()->role == 'Admin'
) {
                $userId = auth()->id();
            }

            $orders = $this->orderService->getOrders($userId, $status, $page, $limit);

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy danh sách đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'shipping_address' => 'required|string',
                'shipping_city' => 'required|string',
                'shipping_country' => 'required|string',
                'shipping_postal_code' => 'required|string',
                'shipping_phone' => 'required|string',
                'notes' => 'nullable|string',
            ]);

            $userId = auth()->id();
            $orderData = $request->only([
                'shipping_address',
                'shipping_city',
                'shipping_state',
                'shipping_country',
                'shipping_postal_code',
                'shipping_phone',
                'notes'
            ]);

            $order = $this->orderService->createOrder($userId, $orderData);

            return response()->json([
                'message' => 'Đặt hàng thành công',
                'order' => $order
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể tạo đơn hàng',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    public function show($id)
    {
        try {
            $userId = null;
            if (!auth()->user()->role == 'Admin') {
                $userId = auth()->id();
            }
            $order = $this->orderService->getOrderById($id, $userId);

            return response()->json($order);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy thông tin đơn hàng',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        try {

            if (!auth()->user()->role == 'Admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            $request->validate([
                'status' => 'required|in:pending,processing,completed,cancelled'
            ]);

            $order = $this->orderService->updateOrderStatus($id, $request->status);

            return response()->json([
                'message' => 'Cập nhật trạng thái đơn hàng thành công',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể cập nhật trạng thái đơn hàng',
                'error' => $e->getMessage()
            ], 400);
        }
    }
}
