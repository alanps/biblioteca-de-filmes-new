import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import Signature from "@/components/signature";
import { initialUsers, movieCatalog, moviesPerPage, randomMovies, usersPerPage } from '@/dashboard/data';
import { DashboardHeader } from '@/dashboard/components/dashboard-header';
import { MovieCard } from '@/dashboard/components/movie-card';
import { Poster } from '@/dashboard/components/poster';
import { WindowTitle } from '@/dashboard/components/window-title';

export default function Dashboard() {
    const [search, setSearch] = useState('');
    const [activeGenre, setActiveGenre] = useState<string | null>(null);
    const [ascending, setAscending] = useState(true);
    const [libraryMovies, setLibraryMovies] = useState(() => randomMovies(2));
    const [users, setUsers] = useState(initialUsers);
    const [addMovieSearch, setAddMovieSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [activeModal, setActiveModal] = useState<'add-movie' | 'users' | null>(null);
    const [expandedMovieResult, setExpandedMovieResult] = useState<number | null>(null);
    const [addMoviePage, setAddMoviePage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);

    const movies = useMemo(() => {
        return libraryMovies.filter((movie) => {
            const matchesSearch = movie.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
            const matchesGenre = activeGenre === null || movie.genres.includes(activeGenre);

            return matchesSearch && matchesGenre;
        });
    }, [activeGenre, libraryMovies, search]);

    const addMovieResults = useMemo(() => {
        return [...movieCatalog]
            .sort(() => Math.random() - 0.5)
            .filter((movie) => movie.title.toLocaleLowerCase().includes(addMovieSearch.toLocaleLowerCase()));
    }, [addMovieSearch]);

    const filteredUsers = useMemo(
        () => users.filter((user) => user.toLocaleLowerCase().includes(userSearch.toLocaleLowerCase())),
        [userSearch, users],
    );

    const addMoviePageCount = Math.max(1, Math.ceil(addMovieResults.length / moviesPerPage));
    const usersPageCount = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
    const visibleMovieResults = addMovieResults.slice((addMoviePage - 1) * moviesPerPage, addMoviePage * moviesPerPage);
    const visibleUsers = filteredUsers.slice((usersPage - 1) * usersPerPage, usersPage * usersPerPage);

    const genres = ['ação', 'comédia', 'ficção científica'];

    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActiveModal(null);
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, []);

    return (
        <>
            <Head title="Biblioteca de Filmes" />

            <main className="filmLibrary">
                <DashboardHeader
                    onOpenUsers={() => {
                        setUsersPage(1);
                        setActiveModal('users');
                    }}
                    onOpenAddMovie={() => {
                        setAddMoviePage(1);
                        setExpandedMovieResult(null);
                        setActiveModal('add-movie');
                    }}
                />

                <section className="filmLibrary__filters" aria-label="Filtros de filmes">
                    <div className="filmLibrary__filterLines">
                        <div>
                            <span>Classificar:</span>
                            <button type="button" className={ascending ? 'isActive' : ''} onClick={() => setAscending(true)}>
                                A a Z
                            </button>
                            <button type="button" className={!ascending ? 'isActive' : ''} onClick={() => setAscending(false)}>
                                Z a A
                            </button>
                        </div>
                        <div>
                            <span>Filtros:</span>
                            {genres.map((genre) => (
                                <button
                                    type="button"
                                    key={genre}
                                    className={activeGenre === genre ? 'isActive' : ''}
                                    onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="filmLibrary__search">
                        <span>Busca:</span>
                        <input value={search} onChange={(event) => setSearch(event.target.value)} />
                        <small>Total de <strong>{libraryMovies.length}</strong> filmes listados</small>
                    </label>
                </section>

                <section className="filmLibrary__movieGrid" aria-live="polite">
                    {movies.length ? movies.map((movie) => <MovieCard key={movie.id} movie={movie} onRemove={() => setLibraryMovies((currentMovies) => currentMovies.filter((currentMovie) => currentMovie.id !== movie.id))} />) : <p className="filmLibrary__empty">Nenhum filme encontrado.</p>}
                </section>

                <button type="button" className="filmLibrary__loadMore" onClick={() => setLibraryMovies((currentMovies) => {
                    const availableMovies = movieCatalog.filter((movie) => !currentMovies.some((currentMovie) => currentMovie.id === movie.id));

                    return availableMovies.length
                        ? [...currentMovies, availableMovies[Math.floor(Math.random() * availableMovies.length)]]
                        : currentMovies;
                })}>Carregar Mais</button>
                <aside className="filmLibrary__bottomBanner" aria-label="Espaço publicitário" />

                {activeModal && <div className="filmLibrary__modal" role="presentation" onClick={(event) => event.currentTarget === event.target && setActiveModal(null)}>
                    <section className="filmLibrary__modalDialog" role="dialog" aria-modal="true" aria-label={activeModal === 'users' ? 'Usuários' : 'Adicionar filme'}>
                        {activeModal === 'add-movie' && <section className="filmLibrary__window filmLibrary__windowAdd">
                            <WindowTitle>Adicionar filme</WindowTitle>
                            <div className="filmLibrary__windowBody">
                                <label className="filmLibrary__smallSearch">Busca:<input autoFocus value={addMovieSearch} onChange={(event) => {
                                    setAddMovieSearch(event.target.value);
                                    setAddMoviePage(1);
                                    setExpandedMovieResult(null);
                                }} /></label>
                                <p>Total de <strong>{addMovieResults.length}</strong> filmes encontrados</p>
                                <ul className="filmLibrary__resultList">
                                    {visibleMovieResults.map((result) => <li key={result.id} className={expandedMovieResult === result.id ? 'isExpanded' : ''}>
                                        <span className="filmLibrary__resultName">{result.title.toLocaleUpperCase()}</span>
                                        <span className="filmLibrary__resultIndicators">
                                            <button
                                                type="button"
                                                className="filmLibrary__resultToggle"
                                                aria-label={`Mostrar detalhes de ${result.title}`}
                                                aria-expanded={expandedMovieResult === result.id}
                                                onClick={() => setExpandedMovieResult(expandedMovieResult === result.id ? null : result.id)}
                                            />
                                            <button
                                                type="button"
                                                className="filmLibrary__resultAdd"
                                                aria-label={`Adicionar ${result.title} à listagem`}
                                                onClick={() => {
                                                    setLibraryMovies((currentMovies) => currentMovies.some((movie) => movie.id === result.id) ? currentMovies : [...currentMovies, result]);
                                                    setExpandedMovieResult(null);
                                                    setActiveModal(null);
                                                }}
                                            />
                                        </span>
                                        {expandedMovieResult === result.id && <div className="filmLibrary__resultDetails">
                                            <div className="filmLibrary__selectedMovie"><Poster title={result.title} /><div>{result.genres.map((genre) => <span key={genre}>{genre}</span>)}<button type="button"><Plus size={14} /></button></div></div>
                                        </div>}
                                    </li>)}
                                </ul>
                                <nav className="filmLibrary__modalPagination" aria-label="Paginação de filmes">
                                    {Array.from({ length: addMoviePageCount }, (_, index) => <button type="button" key={index} className={addMoviePage === index + 1 ? 'isCurrent' : ''} onClick={() => {
                                        setAddMoviePage(index + 1);
                                        setExpandedMovieResult(null);
                                    }}>{index + 1}</button>)}
                                </nav>
                            </div>
                        </section>}

                        {activeModal === 'users' && <section className="filmLibrary__window filmLibrary__windowUsers">
                            <WindowTitle>Usuários</WindowTitle>
                            <div className="filmLibrary__windowBody">
                                <label className="filmLibrary__smallSearch">Busca:<input autoFocus value={userSearch} onChange={(event) => {
                                    setUserSearch(event.target.value);
                                    setUsersPage(1);
                                }} /></label>
                                <p>Total de <strong>{filteredUsers.length}</strong> usuários listados</p>
                                <ul className="filmLibrary__userList">
                                    {visibleUsers.map((user) => <li key={`modal-${user}`}>{user}<button type="button" aria-label={`Excluir ${user}`} onClick={() => setUsers(users.filter((name) => name !== user))}>×</button></li>)}
                                </ul>
                                <nav className="filmLibrary__modalPagination" aria-label="Paginação de usuários">
                                    {Array.from({ length: usersPageCount }, (_, index) => <button type="button" key={index} className={usersPage === index + 1 ? 'isCurrent' : ''} onClick={() => setUsersPage(index + 1)}>{index + 1}</button>)}
                                </nav>
                            </div>
                        </section>}
                    </section>
                </div>}

                <Signature />
            </main>
        </>
    );
}
