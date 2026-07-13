<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMovieRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'originalTitle' => ['required', 'string', 'max:255'],
            'releaseDate' => ['nullable', 'date_format:d-m-Y,Y-m-d'],
            'synopsis' => ['nullable', 'string'],
            'posterUrl' => ['nullable', 'url', 'max:255'],
        ];
    }
}
