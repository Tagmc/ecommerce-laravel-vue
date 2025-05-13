<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function create($data)
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role' => $data['role'] ?? 'user',
        ]);
    }
    public function findUserByEmail($email)
    {
        return User::where('email', $email)->first();
    }
}
