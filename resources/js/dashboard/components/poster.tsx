import moviePoster from '@images/movie-poster.png';

type PosterProps = {
    title: string;
    posterUrl?: string | null;
};

export function Poster({ title, posterUrl }: PosterProps) {
    return (
        <div className="filmLibrary__poster" aria-label={`Pôster do filme ${title}`}>
            <img src={posterUrl || moviePoster} alt={`Pôster de ${title}`} />
        </div>
    );
}
