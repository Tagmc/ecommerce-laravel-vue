<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'exists:categories,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên sản phẩm là bắt buộc.',
            'name.string' => 'Tên sản phẩm phải là một chuỗi.',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'description.string' => 'Mô tả sản phẩm phải là một chuỗi.',
            'price.required' => 'Giá sản phẩm là bắt buộc.',
            'price.numeric' => 'Giá sản phẩm phải là một số.',
            'price.min' => 'Giá sản phẩm phải lớn hơn hoặc bằng 0.',
            'images.*.image' => 'Hình ảnh không hợp lệ.',
            'images.*.mimes' => 'Hình ảnh phải có định dạng jpeg, png, jpg hoặc gif.',
            'images.*.max' => 'Kích thước hình ảnh không được vượt quá 2MB.',
            'category_ids.array' => 'Danh sách danh mục không hợp lệ.',
            'category_ids.*.exists' => 'Danh mục không tồn tại.',
            'stock.required' => 'Số lượng sản phẩm là bắt buộc.',
            'stock.integer' => 'Số lượng sản phẩm phải là một số nguyên.',
            'stock.min' => 'Số lượng sản phẩm phải lớn hơn hoặc bằng 0.',
        ];
    }
}
