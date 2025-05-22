<!-- backend/resources/views/emails/orders/confirmed.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Xác nhận đơn hàng</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
        }
        .order-info {
            margin: 20px 0;
        }
        .order-items {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .order-items th, .order-items td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            text-align: left;
        }
        .order-total {
            margin: 20px 0;
            text-align: right;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Xác nhận đơn hàng</h1>
        </div>

        <p>Xin chào {{ $order->user->name }},</p>

        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>

        <div class="order-info">
            <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
            <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
            <p><strong>Trạng thái:</strong>
                @if($order->status == 'pending') Đang chờ xử lý
                @elseif($order->status == 'processing') Đang xử lý
                @elseif($order->status == 'completed') Hoàn thành
                @elseif($order->status == 'cancelled') Đã hủy
                @endif
            </p>
        </div>

        <h3>Chi tiết đơn hàng</h3>

        <table class="order-items">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>{{ $item->product->name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->price) }}đ</td>
                    <td>{{ number_format($item->price * $item->quantity) }}đ</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="order-total">
            <p><strong>Tổng tiền:</strong> {{ number_format($order->total_price) }}đ</p>
        </div>

        <h3>Thông tin giao hàng</h3>

        <p>
            {{ $order->shipping_address }}<br>
            {{ $order->shipping_city }},
            @if($order->shipping_state){{ $order->shipping_state }}, @endif
            {{ $order->shipping_country }}<br>
            Mã bưu điện: {{ $order->shipping_postal_code }}<br>
            Điện thoại: {{ $order->shipping_phone }}
        </p>

        <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng của bạn được gửi đi.</p>

        <p>Trân trọng,<br>
        Đội ngũ cửa hàng</p>

        <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
        </div>
    </div>
</body>
</html>
