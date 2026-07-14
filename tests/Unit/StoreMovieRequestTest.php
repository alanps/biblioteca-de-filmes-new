<?php

use App\Http\Requests\StoreMovieRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class);

test('movie data accepted from the search API is valid', function () {
    $validator = Validator::make([
        'title' => 'Jumanji',
        'originalTitle' => 'Jumanji',
        'releaseDate' => '15/12/1995',
        'synopsis' => 'Um jogo mágico transforma a vida de duas crianças.',
        'posterUrl' => 'https://image.example/jumanji.jpg',
    ], (new StoreMovieRequest)->rules());

    expect($validator->passes())->toBeTrue();
});

test('movie title and original title are required', function () {
    $validator = Validator::make([], (new StoreMovieRequest)->rules());

    expect($validator->errors()->keys())->toContain('title', 'originalTitle');
});

test('movie storage requires authentication', function () {
    $this->postJson(route('movies.store'), [
        'title' => 'Jumanji',
        'originalTitle' => 'Jumanji',
    ])->assertUnauthorized();
});
