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
        return true; // Hoặc true nếu bạn xử lý authorization ở middleware/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // 'sometimes' cho phép trường đó không cần gửi lên khi update, nhưng nếu gửi thì phải hợp lệ
        $imageRule = $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|array' : 'nullable|array';
        $imageFileRule = $this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|image' : 'nullable|image';


        return [
            'name' => ($this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|required' : 'required').'|string|max:255',
            'description' => 'nullable|string',
            'price' => ($this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|required' : 'required').'|numeric|min:0',
            'stock' => ($this->isMethod('put') || $this->isMethod('patch') ? 'sometimes|required' : 'required').'|integer|min:0',
            'images.*' => $imageFileRule.'|mimes:jpeg,png,jpg,gif,webp|max:2048', 
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
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
            'images.array' => 'Trường hình ảnh không hợp lệ.',
            'images.*.image' => 'Một trong các file không phải là hình ảnh hợp lệ.',
            'images.*.mimes' => 'Hình ảnh phải có định dạng jpeg, png, jpg, webp hoặc gif.',
            'images.*.max' => 'Kích thước mỗi hình ảnh không được vượt quá 2MB.',
            'category_ids.array' => 'Danh sách ID danh mục không hợp lệ.',
            'category_ids.*.integer' => 'Mỗi ID danh mục phải là số nguyên.',
            'category_ids.*.exists' => 'Một hoặc nhiều ID danh mục không tồn tại.',
            'stock.required' => 'Số lượng tồn kho là bắt buộc.',
            'stock.integer' => 'Số lượng tồn kho phải là một số nguyên.',
            'stock.min' => 'Số lượng tồn kho phải lớn hơn hoặc bằng 0.',
        ];
    }
}
