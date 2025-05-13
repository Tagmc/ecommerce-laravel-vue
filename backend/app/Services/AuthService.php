<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function register($data)
    {
        return $this->userRepository->create($data);
    }

    public function login($credentials)
    {
        if (!$token = JWTAuth::attempt($credentials)) {
            return false;
        }
        return $token;
    }

    public function getUser()
    {
        return auth()->user();
    }

    public function logout()
    {
        $token = JWTAuth::getToken();
        if ($token) {
            JWTAuth::invalidate($token);
        }

        return response()->json(['message' => 'Đăng xuất thành công'])
            ->cookie('refresh_token', null, -1, '/', null, false, true);
    }

    public function refreshToken(string $token)
    {
        try {
            $payload = JWTAuth::manager()->decode(new \Tymon\JWTAuth\Token($token));
            if (!isset($payload['type']) || $payload['type'] !== 'refresh') {
                throw new TokenInvalidException('Invalid token type');
            }
            $userId = $payload['sub'];
            $user = \App\Models\User::find($userId);

            if (!$user) {
                throw new TokenInvalidException('User not found');
            }
            $newAccessToken = JWTAuth::fromUser($user);
            $newRefreshToken = JWTAuth::claims(['type' => 'refresh'])->fromUser($user);

            return [
                'access_token' => $newAccessToken,
                'refresh_token' => $newRefreshToken,
            ];
        } catch (\Exception $e) {
            throw new TokenInvalidException('Cannot refresh token: ' . $e->getMessage());
        }
    }

    public function forgotPassword(string $email): bool|string
    {
        return Password::sendResetLink(['email' => $email]);
    }

    public function resetPassword(array $data): bool|string
    {
        return Password::reset(
            $data,
            function ($user) use ($data) {
                $user->password = bcrypt($data['password']);
                $user->save();
            }
        );
    }
}
