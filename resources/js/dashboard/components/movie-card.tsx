import { Plus } from 'lucide-react';

import { Poster } from './poster';
import type { Movie } from '../types';

type MovieCardProps = {
    movie: Movie;
    onRemove: () => void;
};

export function MovieCard({ movie, onRemove }: MovieCardProps) {
    return (
        <article className="filmLibrary__movieCard">
            <Poster title={movie.title} />
            <div className="filmLibrary__movieContent">
                <h2>{movie.title}</h2>
                <p>{movie.synopsis}</p>
            </div>
            <div className="filmLibrary__movieTags">
                {movie.genres.map((genre) => (
                    <span key={genre}>{genre}</span>
                ))}
                <button type="button" aria-label={`Adicionar ${movie.title}`}>
                    <Plus size={15} strokeWidth={3} />
                </button>
            </div>
            <button type="button" className="filmLibrary__movieStatus" aria-label={`Remover ${movie.title}`} onClick={onRemove} />
        </article>
    );
}
