<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MovieDestroyController extends Controller
{
    public function __invoke(Request $request, int $movie): Response
    {
        /** @var User $user */
        $user = $request->user();
        $user->movies()->findOrFail($movie)->delete();

        return response()->noContent();
    }
}
