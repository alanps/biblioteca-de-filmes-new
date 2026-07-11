import { Head } from '@inertiajs/react';
import { Plus, Search, UserRound, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import logo from '@images/logo.png';
import Signature from "@/components/signature";

const movie = {
    title: 'A Busca da Pedra Filosofal',
    synopsis:
        'Sinopse é uma descrição sintética da ideia do filme. Deve deixar claro o que será abordado no documentário, quem são as personagens e onde se passa, também pode trazer, sucintamente, por que é importante contar aquela história. Ela não precisa especificar como o filme será feito...',
    genres: ['ação', 'comédia', 'ficção científica'],
};

const initialUsers = ['Alan PS', 'Marina Silva', 'Caio Lima', 'Beatriz Alves', 'Rafael Costa', 'Julia Martins'];

function Poster() {
    return (
        <div className="film-library__poster" aria-label="Pôster do filme Não Olhe para Cima">
            <span>um filme de adam mckay</span>
            <strong>Não Olhe para</strong>
            <em>Cima</em>
            <small>apenas olhe para cima</small>
        </div>
    );
}

function MovieCard() {
    return (
        <article className="film-library__movie-card">
            <Poster />
            <div className="film-library__movie-content">
                <h2>{movie.title}</h2>
                <p>{movie.synopsis}</p>
            </div>
            <div className="film-library__movie-tags">
                {movie.genres.map((genre) => (
                    <span key={genre}>{genre}</span>
                ))}
                <button type="button" aria-label={`Adicionar ${movie.title}`}>
                    <Plus size={15} strokeWidth={3} />
                </button>
            </div>
            <span className="film-library__movie-status" aria-hidden="true" />
        </article>
    );
}

function WindowTitle({ children }: { children: React.ReactNode }) {
    return (
        <header className="film-library__window-title">
            <span>{children}</span>
            <i aria-hidden="true" />
            <b aria-hidden="true" />
        </header>
    );
}

export default function Dashboard() {
    const [search, setSearch] = useState('');
    const [activeGenre, setActiveGenre] = useState<string | null>(null);
    const [ascending, setAscending] = useState(true);
    const [users, setUsers] = useState(initialUsers);

    const movies = useMemo(() => {
        const matchesSearch = movie.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
        const matchesGenre = activeGenre === null || movie.genres.includes(activeGenre);

        return matchesSearch && matchesGenre ? [movie, movie] : [];
    }, [activeGenre, search]);

    const genres = ['ação', 'comédia', 'ficção científica'];

    return (
        <>
            <Head title="Biblioteca de Filmes" />

            <main className="film-library">
                <header className="film-library__header">
                    <img src={logo} alt="Biblioteca de Filmes" className="film-library__logo" />
                    <div className="film-library__banner" aria-hidden="true" />
                    <nav className="film-library__actions" aria-label="Ações principais">
                        <button type="button" className="film-library__action film-library__action--yellow">
                            <UsersRound aria-hidden="true" />
                            <span>Usuários</span>
                        </button>
                        <button type="button" className="film-library__action film-library__action--green">
                            <Search aria-hidden="true" />
                            <span>Adicionar filme</span>
                        </button>
                        <button type="button" className="film-library__profile">
                            <UserRound aria-hidden="true" />
                            <span>Alan PS</span>
                            <small>Sair</small>
                        </button>
                    </nav>
                </header>

                <section className="film-library__filters" aria-label="Filtros de filmes">
                    <div className="film-library__filter-lines">
                        <div>
                            <span>Classificar:</span>
                            <button type="button" className={ascending ? 'is-active' : ''} onClick={() => setAscending(true)}>
                                A a Z
                            </button>
                            <button type="button" className={!ascending ? 'is-active' : ''} onClick={() => setAscending(false)}>
                                Z a A
                            </button>
                            <button type="button">Gênero</button>
                        </div>
                        <div>
                            <span>Filtros:</span>
                            {genres.map((genre) => (
                                <button
                                    type="button"
                                    key={genre}
                                    className={activeGenre === genre ? 'is-active' : ''}
                                    onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="film-library__search">
                        <span>Busca:</span>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} />
                        <small>Total de <strong>{movies.length ? 100 : 0}</strong> filmes listados</small>
                    </label>
                </section>

                <section className="film-library__movie-grid" aria-live="polite">
                    {movies.length ? movies.map((_, index) => <MovieCard key={index} />) : <p className="film-library__empty">Nenhum filme encontrado.</p>}
                </section>

                <button type="button" className="film-library__load-more">Carregar Mais</button>

                <section className="film-library__lower-panels">
                    <section className="film-library__window">
                        <WindowTitle>Adicionar filme</WindowTitle>
                        <div className="film-library__window-body">
                            <label className="film-library__small-search">Busca:<input /></label>
                            <p>Total de <strong>10</strong> filmes encontrados</p>
                            <ul className="film-library__result-list">
                                <li>A BUSCA DA PEDRA FILOSOFAL <span><i /><b /></span></li>
                                <li>A BUSCA DA PEDRA FILOSOFAL <span><i className="is-dark" /><b /></span></li>
                            </ul>
                            <div className="film-library__selected-movie"><Poster /><div>{movie.genres.map((genre) => <span key={genre}>{genre}</span>)}<button type="button"><Plus size={14} /></button></div></div>
                            <ul className="film-library__result-list"><li>A BUSCA DA PEDRA FILOSOFAL <span><i /><b /></span></li></ul>
                            <div className="film-library__pagination"><button type="button">1</button><button type="button">2</button><button type="button" className="is-current">3</button><span>...</span><button type="button">67</button><button type="button">68</button></div>
                        </div>
                    </section>

                    <div className="film-library__lower-banner" aria-hidden="true" />

                    <section className="film-library__window">
                        <WindowTitle>Usuários</WindowTitle>
                        <div className="film-library__window-body">
                            <label className="film-library__small-search">Busca:<input /></label>
                            <p>Total de <strong>{users.length ? 100 : 0}</strong> usuários listados</p>
                            <ul className="film-library__user-list">
                                {users.map((user) => <li key={user}>{user}<button type="button" aria-label={`Excluir ${user}`} onClick={() => setUsers(users.filter((name) => name !== user))}>×</button></li>)}
                            </ul>
                            <div className="film-library__pagination"><button type="button">1</button><button type="button">2</button><button type="button" className="is-current">3</button><span>...</span><button type="button">67</button><button type="button">68</button></div>
                        </div>
                    </section>
                </section>

                <Signature />
            </main>
        </>
    );
}
