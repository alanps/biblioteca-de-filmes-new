import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import Signature from "@/components/signature";
import { login } from '@/routes';
import { search as searchMovies, store as storeMovie } from '@/routes/movies';
import { destroy as destroySession, user as getAuthenticatedUser } from '@/routes/session';
import { index as listUsers } from '@/routes/users';
import type { DashboardUser, Movie } from '@/dashboard/types';
import { moviesPerPage, usersPerPage } from '@/dashboard/data';
import { DashboardHeader } from '@/dashboard/components/dashboardHeader';
import { MovieCard } from '@/dashboard/components/movieCard';
import { Poster } from '@/dashboard/components/poster';
import { WindowTitle } from '@/dashboard/components/windowTitle';

export default function Dashboard() {
    const [search, setSearch] = useState('');
    const [activeGenre, setActiveGenre] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'ascending' | 'descending' | null>(null);
    const [libraryMovies, setLibraryMovies] = useState<Movie[]>([]);
    const [users, setUsers] = useState<DashboardUser[]>([]);
    const [addMovieSearch, setAddMovieSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [activeModal, setActiveModal] = useState<'add-movie' | 'users' | null>(null);
    const [expandedMovieResult, setExpandedMovieResult] = useState<number | null>(null);
    const [addMoviePage, setAddMoviePage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);
    const [remoteMovieResults, setRemoteMovieResults] = useState<Movie[]>([]);
    const [isMovieSearchLoading, setIsMovieSearchLoading] = useState(false);
    const [movieSearchError, setMovieSearchError] = useState<string | null>(null);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [savingMovieId, setSavingMovieId] = useState<number | null>(null);
    const [movieSaveError, setMovieSaveError] = useState<string | null>(null);
    const [authenticatedUser, setAuthenticatedUser] = useState<DashboardUser | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const movies = useMemo(() => {
        return libraryMovies.filter((movie) => {
            const matchesSearch = movie.title.toLocaleLowerCase().includes(search.toLocaleLowerCase());
            const matchesGenre = activeGenre === null || movie.genres.includes(activeGenre);

            return matchesSearch && matchesGenre;
        }).sort((firstMovie, secondMovie) => {
            if (sortDirection === null) {
                return 0;
            }

            const result = firstMovie.title.localeCompare(secondMovie.title, 'pt-BR');

            return sortDirection === 'ascending' ? result : -result;
        });
    }, [activeGenre, libraryMovies, search, sortDirection]);

    const addMovieResults = useMemo(
        () => remoteMovieResults.filter((movie) => !libraryMovies.some((libraryMovie) =>
            libraryMovie.id === movie.id || libraryMovie.title.localeCompare(movie.title, 'pt-BR', { sensitivity: 'base' }) === 0,
        )),
        [libraryMovies, remoteMovieResults],
    );

    const filteredUsers = useMemo(
        () => users.filter((user) => user.name.toLocaleLowerCase().includes(userSearch.toLocaleLowerCase())),
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
                closeModal();
            }
        }

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, []);

    useEffect(() => {
        const token = window.localStorage.getItem('TOKEN_API');

        if (! token) {
            window.location.replace(login.url());

            return;
        }

        const controller = new AbortController();

        async function loadAuthenticatedUser() {
            try {
                const response = await fetch(getAuthenticatedUser.url(), {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    signal: controller.signal,
                });
                const payload = await response.json() as { user?: DashboardUser };

                if (response.status === 401) {
                    window.localStorage.removeItem('TOKEN_API');
                    window.location.replace(login.url());

                    return;
                }

                if (response.ok && payload.user) {
                    setAuthenticatedUser(payload.user);
                }
            } catch (error) {
                if (! (error instanceof DOMException && error.name === 'AbortError')) {
                    setAuthenticatedUser(null);
                }
            }
        }

        void loadAuthenticatedUser();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (activeModal !== 'add-movie') {
            return;
        }

        const typedTitle = addMovieSearch.trim();

        if (typedTitle.length > 0 && typedTitle.length < 3) {
            setRemoteMovieResults([]);
            setIsMovieSearchLoading(false);
            setMovieSearchError(null);

            return;
        }

        const controller = new AbortController();
        const title = typedTitle || 'jumanji';
        const delay = typedTitle ? 350 : 0;
        const timer = window.setTimeout(async () => {
            setIsMovieSearchLoading(true);
            setMovieSearchError(null);

            try {
                const response = await fetch(searchMovies.url({ query: { title } }), {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });
                const payload = await response.json() as { movies?: Movie[]; message?: string };

                if (! response.ok) {
                    throw new Error(payload.message || 'Não foi possível buscar os filmes agora.');
                }

                setRemoteMovieResults(payload.movies ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setRemoteMovieResults([]);
                setMovieSearchError(error instanceof Error ? error.message : 'Não foi possível buscar os filmes agora.');
            } finally {
                if (! controller.signal.aborted) {
                    setIsMovieSearchLoading(false);
                }
            }
        }, delay);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [activeModal, addMovieSearch]);

    useEffect(() => {
        if (activeModal !== 'users') {
            return;
        }

        const controller = new AbortController();

        async function loadUsers() {
            setIsUsersLoading(true);
            setUsersError(null);
            setUsers([]);

            try {
                const response = await fetch(listUsers.url(), {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal,
                });
                const payload = await response.json() as { users?: DashboardUser[]; message?: string };

                if (! response.ok) {
                    throw new Error(payload.message || 'Não foi possível carregar os usuários agora.');
                }

                setUsers(payload.users ?? []);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }

                setUsers([]);
                setUsersError(error instanceof Error ? error.message : 'Não foi possível carregar os usuários agora.');
            } finally {
                if (! controller.signal.aborted) {
                    setIsUsersLoading(false);
                }
            }
        }

        void loadUsers();

        return () => controller.abort();
    }, [activeModal]);

    function closeModal() {
        setActiveModal(null);
        setAddMovieSearch('');
        setUserSearch('');
        setExpandedMovieResult(null);
        setAddMoviePage(1);
        setUsersPage(1);
        setRemoteMovieResults([]);
        setIsMovieSearchLoading(false);
        setMovieSearchError(null);
        setIsUsersLoading(false);
        setUsersError(null);
        setSavingMovieId(null);
        setMovieSaveError(null);
    }

    async function addMovie(result: Movie) {
        if (savingMovieId !== null) {
            return;
        }

        const token = window.localStorage.getItem('TOKEN_API');

        if (! token) {
            setMovieSaveError('Faça login para adicionar um filme.');

            return;
        }

        setSavingMovieId(result.id);
        setMovieSaveError(null);

        try {
            const response = await fetch(storeMovie.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(result),
            });
            const payload = await response.json() as { movie?: Movie; message?: string; errors?: Record<string, string[]> };

            if (! response.ok || ! payload.movie) {
                const validationMessage = Object.values(payload.errors ?? {}).flat()[0];

                throw new Error(validationMessage || payload.message || 'Não foi possível adicionar o filme.');
            }

            const savedMovie = payload.movie;

            setSortDirection(null);
            setLibraryMovies((currentMovies) => [savedMovie, ...currentMovies.filter((movie) => movie.id !== savedMovie.id)]);
            closeModal();
        } catch (error) {
            setMovieSaveError(error instanceof Error ? error.message : 'Não foi possível adicionar o filme.');
            setSavingMovieId(null);
        }
    }

    async function logout() {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        const token = window.localStorage.getItem('TOKEN_API');

        try {
            if (token) {
                await fetch(destroySession.url(), {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
        } finally {
            window.localStorage.removeItem('TOKEN_API');
            window.location.replace(login.url());
        }
    }

    return (
        <>
            <Head title="Biblioteca de Filmes" />

            <main className="filmLibrary">
                <div className="filmLibrary__topBar" aria-hidden="true" />
                <DashboardHeader
                    userName={authenticatedUser?.name ?? 'Usuário'}
                    isLoggingOut={isLoggingOut}
                    onOpenUsers={() => {
                        setUsersPage(1);
                        setActiveModal('users');
                    }}
                    onOpenAddMovie={() => {
                        setAddMovieSearch('');
                        setAddMoviePage(1);
                        setExpandedMovieResult(null);
                        setRemoteMovieResults([]);
                        setMovieSearchError(null);
                        setActiveModal('add-movie');
                    }}
                    onLogout={() => void logout()}
                />

                <section className="filmLibrary__filters" aria-label="Filtros de filmes">
                    <div className="filmLibrary__filterLines">
                        <div>
                            <span>Classificar:</span>
                            <button type="button" className={sortDirection === 'ascending' ? 'isActive' : ''} onClick={() => setSortDirection('ascending')}>
                                A a Z
                            </button>
                            <button type="button" className={sortDirection === 'descending' ? 'isActive' : ''} onClick={() => setSortDirection('descending')}>
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
                        <small>Total de <strong>{search || activeGenre ? movies.length : libraryMovies.length}</strong> filmes listados</small>
                    </label>
                </section>

                <section className="filmLibrary__movieGrid" aria-live="polite">
                    {movies.length ? movies.map((movie) => <MovieCard key={movie.id} movie={movie} onRemove={() => setLibraryMovies((currentMovies) => currentMovies.filter((currentMovie) => currentMovie.id !== movie.id))} />) : <p className="filmLibrary__empty">Nenhum filme encontrado.</p>}
                </section>

                <aside className="filmLibrary__bottomBanner" aria-label="Espaço publicitário" />

                {activeModal && <div className="filmLibrary__modal" role="presentation" onClick={(event) => event.currentTarget === event.target && closeModal()}>
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
                                {isMovieSearchLoading && <p className="filmLibrary__modalMessage">Buscando filmes...</p>}
                                {movieSearchError && <p className="filmLibrary__modalMessage filmLibrary__modalMessageError">{movieSearchError}</p>}
                                {movieSaveError && <p className="filmLibrary__modalMessage filmLibrary__modalMessageError">{movieSaveError}</p>}
                                {!isMovieSearchLoading && !movieSearchError && addMovieSearch.trim().length > 0 && addMovieSearch.trim().length < 3 && <p className="filmLibrary__modalMessage">Digite pelo menos 3 caracteres.</p>}
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
                                                disabled={savingMovieId !== null}
                                                onClick={() => void addMovie(result)}
                                            />
                                        </span>
                                        {expandedMovieResult === result.id && <div className="filmLibrary__resultDetails">
                                            <div className="filmLibrary__selectedMovie">
                                                <Poster title={result.title} posterUrl={result.posterUrl} />
                                                <div className="filmLibrary__selectedMovieContent">
                                                    <p><strong>Título original:</strong> {result.originalTitle}</p>
                                                    <p><strong>Data de lançamento:</strong> {result.releaseDate}</p>
                                                    <p><strong>Sinopse:</strong> {result.synopsis}</p>
                                                </div>
                                            </div>
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
                                {isUsersLoading && <p className="filmLibrary__modalMessage">Carregando usuários...</p>}
                                {usersError && <p className="filmLibrary__modalMessage filmLibrary__modalMessageError">{usersError}</p>}
                                <ul className="filmLibrary__userList">
                                    {visibleUsers.map((user) => <li key={user.id}>{user.name}<button type="button" aria-label={`Excluir ${user.name}`} onClick={() => setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id))} /></li>)}
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
