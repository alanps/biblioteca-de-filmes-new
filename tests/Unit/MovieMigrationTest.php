<?php

use Illuminate\Database\MySqlConnection;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

uses(TestCase::class);

test('movies table belongs to users and prevents duplicate original titles per user', function () {
    $migration = require database_path('migrations/2026_07_13_232745_create_movies_table.php');

    Schema::shouldReceive('create')
        ->once()
        ->with('movies', Mockery::on(function (Closure $definition): bool {
            $connection = new MySqlConnection(static fn (): never => throw new RuntimeException('Database access is not expected.'));
            $connection->useDefaultSchemaGrammar();
            $blueprint = new Blueprint($connection, 'movies');
            $definition($blueprint);

            $columns = collect($blueprint->getColumns())->keyBy('name');
            $commands = collect($blueprint->getCommands());
            $foreign = $commands->firstWhere('name', 'foreign');
            $unique = $commands->firstWhere('name', 'unique');

            expect($columns->keys()->all())->toContain(
                'id',
                'user_id',
                'title',
                'original_title',
                'release_date',
                'synopsis',
                'poster_url',
                'created_at',
                'updated_at',
            )
                ->and($foreign->columns)->toBe(['user_id'])
                ->and($foreign->references)->toBe('id')
                ->and((string) $foreign->on)->toBe('users')
                ->and($foreign->onDelete)->toBe('cascade')
                ->and($unique->columns)->toBe(['user_id', 'original_title']);

            return true;
        }));

    Schema::shouldReceive('dropIfExists')->once()->with('movies');

    $migration->up();
    $migration->down();
});
