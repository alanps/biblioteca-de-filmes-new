import moviePoster from '@images/movie-poster.png';

type PosterProps = {
    title: string;
};

export function Poster({ title }: PosterProps) {
    return (
        <div className="filmLibrary__poster" aria-label={`Pôster do filme ${title}`}>
            <img src={moviePoster} alt={`Pôster de ${title}`} />
        </div>
    );
}
