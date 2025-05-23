<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Cart\CartController;
use App\Http\Controllers\Api\Category\CategoryController;
use App\Http\Controllers\Api\Order\OrderController;
use App\Http\Controllers\Api\Product\ProductController;
use App\Http\Controllers\Api\User\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'getUser']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

Route::prefix('products')->group(function () {
    Route::middleware(['auth:api', 'role:admin'])->group(function () {
        Route::post('/', [ProductController::class, 'store'])->name('products.store');
        Route::put('/{id}', [ProductController::class, 'update'])->name('products.update')->where('id', '[0-9]+');
        Route::delete('/{id}', [ProductController::class, 'destroy'])->name('products.destroy')->where('id', '[0-9]+');
    });

    // Các route công khai hoặc yêu cầu xác thực khác (nếu có)
    // GET /api/products
    // GET /api/products?category_ids[]=1&category_ids[]=5 (Lọc theo nhiều ID danh mục)
    // GET /api/products?category_id=2 (Lọc theo một ID danh mục)
    // GET /api/products?category_slug=ao-khoac (Lọc theo slug danh mục)
    // GET /api/products?search=tên sản phẩm
    // GET /api/products?sort_by=price&sort_direction=asc
    // GET /api/products?per_page=20 (Số sản phẩm mỗi trang)
    // GET /api/products?all=true (Lấy tất cả không phân trang)
    Route::get('/', [ProductController::class, 'index'])->name('products.index');
    Route::get('/{id}', [ProductController::class, 'show'])->name('products.show')->where('id', '[0-9]+');
});


Route::prefix('categories')->group(function () {
    Route::middleware(['auth:api', 'role:admin'])->group(function () {
        Route::post('/', [CategoryController::class, 'store']);
        Route::put('{id}', [CategoryController::class, 'update']);
        Route::delete('{id}', [CategoryController::class, 'delete']);
    });
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('{id}', [CategoryController::class, 'show']);
});

// Cart routes
Route::middleware('auth:api')->prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/add', [CartController::class, 'store']);
    Route::put('/{productId}', [CartController::class, 'update']);
    Route::delete('/{productId}', [CartController::class, 'destroy']);
    Route::delete('/', [CartController::class, 'clear']);
});

// Order routes
Route::middleware('auth:api')->prefix('orders')->group(function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::delete('/{id}', [OrderController::class, 'destroy']);
    Route::put('/{id}/status', [OrderController::class, 'updateStatus'])->middleware('role:admin');
});

Route::middleware(['auth:api', 'role:admin'])->prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/{id}', [UserController::class, 'show']);
    Route::post('/', [UserController::class, 'store']);
    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{id}', [UserController::class, 'destroy']);
});
