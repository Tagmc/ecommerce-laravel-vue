<?php
// app/Http/Controllers/Api/User/UserController.php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            if (!auth()->user()->role == 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            $query = User::query();
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('role') && !empty($request->role)) {
                $query->where('role', $request->role);
            }

            $sortBy = $request->sort_by ?? 'created_at';
            $sortDirection = $request->sort_direction ?? 'desc';
            $query->orderBy($sortBy, $sortDirection);
            $perPage = $request->per_page ?? 10;
            $users = $query->paginate($perPage);
            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy danh sách người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            if (!auth()->user()->role == 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            $user = User::findOrFail($id);
            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể lấy thông tin người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            if (!auth()->user()->role == 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => ['required', Password::defaults()],
                'role' => 'required|string|in:admin,user',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            return response()->json([
                'message' => 'Tạo người dùng thành công',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể tạo người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            if (!auth()->user()->role == 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            $user = User::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
                'password' => ['sometimes', 'nullable', Password::defaults()],
                'role' => 'sometimes|required|string|in:admin,user',
            ]);

            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }

            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }

            if (isset($validated['password']) && !empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }

            if (isset($validated['role'])) {
                $user->role = $validated['role'];
            }

            $user->save();

            return response()->json([
                'message' => 'Cập nhật người dùng thành công',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể cập nhật người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            if (!auth()->user()->role == 'admin') {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này'
                ], 403);
            }

            // Check if user is not deleting themselves
            if (auth()->id() == $id) {
                return response()->json([
                    'message' => 'Bạn không thể xóa tài khoản của chính mình'
                ], 400);
            }

            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'message' => 'Xóa người dùng thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Không thể xóa người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
