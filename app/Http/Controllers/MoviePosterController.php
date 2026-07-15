<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MoviePosterController extends Controller
{
    public function __invoke(int $movie): Response|StreamedResponse
    {
        $path = "movie-posters/{$movie}.webp";

        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path, headers: $this->responseHeaders());
        }

        $posterUrl = Cache::get("trakt.movie.{$movie}.poster");

        abort_unless(is_string($posterUrl) && $this->isTraktUrl($posterUrl), 404);

        $response = Http::withOptions(['verify' => config('services.trakt.verify_tls')])
            ->connectTimeout(3)
            ->timeout(10)
            ->get($posterUrl)
            ->throw();
        $contentType = $response->header('Content-Type');

        abort_unless(Str::startsWith($contentType, 'image/'), 502);

        Storage::disk('local')->put($path, $response->body());

        return response($response->body(), 200, $this->responseHeaders());
    }

    private function isTraktUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);

        return is_string($host) && ($host === 'trakt.tv' || Str::endsWith($host, '.trakt.tv'));
    }

    /**
     * @return array<string, string>
     */
    private function responseHeaders(): array
    {
        return [
            'Cache-Control' => 'public, max-age=604800, immutable',
            'Content-Type' => 'image/webp',
        ];
    }
}
