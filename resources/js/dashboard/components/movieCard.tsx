import { Poster } from './poster';
import type { Movie } from '../types';

type MovieCardProps = {
    movie: Movie;
    isRemoving: boolean;
    onRemove: () => void;
};

export function MovieCard({ movie, isRemoving, onRemove }: MovieCardProps) {
    return (
        <article className="filmLibrary__movieCard">
            <Poster title={movie.title} posterUrl={movie.posterUrl} />
            <div className="filmLibrary__movieContent">
                <h2>{movie.title}</h2>
                <dl className="filmLibrary__movieMeta">
                    <div><dt>Título original:</dt><dd>{movie.originalTitle}</dd></div>
                    <div><dt>Data de lançamento:</dt><dd>{movie.releaseDate}</dd></div>
                </dl>
                <p><strong>Sinopse:</strong> {movie.synopsis}</p>
            </div>
            <button type="button" className="filmLibrary__movieStatus" aria-label={`Remover ${movie.title}`} disabled={isRemoving} onClick={onRemove} />
        </article>
    );
}
