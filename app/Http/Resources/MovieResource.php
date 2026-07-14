<?php

namespace App\Http\Resources;

use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Movie */
class MovieResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'originalTitle' => $this->original_title,
            'releaseDate' => $this->release_date?->format('d/m/Y') ?? '',
            'synopsis' => $this->synopsis ?? '',
            'genres' => [],
            'posterUrl' => $this->poster_url,
        ];
    }
}
