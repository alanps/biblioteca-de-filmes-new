<?php

namespace App\Models;

use Database\Factories\MovieFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $original_title
 * @property Carbon|null $release_date
 * @property string|null $synopsis
 * @property string|null $poster_url
 */
#[Fillable(['user_id', 'title', 'original_title', 'release_date', 'synopsis', 'poster_url'])]
class Movie extends Model
{
    /** @use HasFactory<MovieFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'release_date' => 'date',
        ];
    }
}
