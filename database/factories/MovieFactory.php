<?php

namespace Database\Factories;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Movie>
 */
class MovieFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'original_title' => fake()->unique()->sentence(3),
            'release_date' => fake()->date(),
            'synopsis' => fake()->paragraph(),
            'poster_url' => fake()->imageUrl(300, 450),
        ];
    }
}
