<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    protected $authService;
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $user = $this->authService->register($data);
        return response()->json([
            'message' => 'Đăng ký thành công',
            'user' => $user
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        $token = $this->authService->login($credentials);
        if (!$token) {
            return response()->json([
                'message' => 'Sai tài khoản hoặc mật khẩu'
            ], 401);
        }
        $refresh = JWTAuth::claims(['type' => 'refresh'])->fromUser(auth()->user());

        return response()
            ->json(['message' => 'Đăng nhập thành công', 'access_token' => $token, 'user' => auth()->user()])
            ->cookie('refresh_token', $refresh, 60 * 24 * 7, '/', null, false, true);
    }

    public function getUser()
    {
        $user = $this->authService->getUser();
        return response()->json([
            'user' => $user,
            'is_admin' => $user->role === 'admin'
        ], 200);
    }
    public function logout()
    {
        try {
            $token = JWTAuth::parseToken();
            if ($token) {
                JWTAuth::invalidate($token);
            }
            return response()->json([
                'message' => 'Đăng xuất thành công'
            ])->cookie('refresh_token', '', time() - 3600, '/', null, false, true);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đăng xuất thành công, nhưng có lỗi: ' . $e->getMessage()
            ])->cookie('refresh_token', '', time() - 3600, '/', null, false, true);
        }
    }
    public function refresh(Request $request)
    {
        try {
            $oldRefreshToken = $request->cookie('refresh_token');
            if (!$oldRefreshToken) {
                return response()->json(['message' => 'Không có refresh token'], 401);
            }
            try {
                $payload = JWTAuth::manager()->decode(new \Tymon\JWTAuth\Token($oldRefreshToken));

                if (!isset($payload['type']) || $payload['type'] !== 'refresh') {
                    return response()->json(['message' => 'Token không hợp lệ (sai loại)'], 401);
                }
                $expTime = $payload['exp'] ?? 0;
                if ($expTime < time()) {
                    return response()->json(['message' => 'Refresh token đã hết hạn'], 401);
                }
            } catch (\Exception $e) {
                $this->logout($request);
                return response()->json(['message' => 'Token không hợp lệ: ' . $e->getMessage()], 401);
            }
            $tokens = $this->authService->refreshToken($oldRefreshToken);
            return response()
                ->json([
                    'access_token' => $tokens['access_token'],
                    'message' => 'Token được làm mới thành công'
                ])
                ->cookie('refresh_token', $tokens['refresh_token'], 60 * 24 * 7, '/', null, false, true);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Không thể làm mới token: ' . $e->getMessage()], 401);
        }
    }
    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $status = $this->authService->forgotPassword($request->email);
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Link đặt lại mật khẩu đã được gửi.'])
            : response()->json(['message' => 'Không gửi được email.'], 400);
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $status = $this->authService->resetPassword($request->validated());
        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Đặt lại mật khẩu thành công.'])
            : response()->json(['message' => 'Token không hợp lệ.'], 400);
    }
}
