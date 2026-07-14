import { CircleUserRound, Search, UsersRound } from 'lucide-react';

import logo from '@images/logo.png';

type DashboardHeaderProps = {
    userName: string;
    showUsers: boolean;
    isLoggingOut: boolean;
    onOpenUsers: () => void;
    onOpenAddMovie: () => void;
    onLogout: () => void;
};

export function DashboardHeader({ userName, showUsers, isLoggingOut, onOpenUsers, onOpenAddMovie, onLogout }: DashboardHeaderProps) {
    return (
        <header className="filmLibrary__header">
            <img src={logo} alt="Biblioteca de Filmes" className="filmLibrary__logo" />
            <div className="filmLibrary__banner" aria-hidden="true" />
            <nav className="filmLibrary__actions" aria-label="Ações principais">
                {showUsers && <button type="button" className="filmLibrary__action filmLibrary__actionYellow" onClick={onOpenUsers}>
                    <UsersRound aria-hidden="true" />
                    <span>Usuários</span>
                </button>}
                <button type="button" className="filmLibrary__action filmLibrary__actionGreen" onClick={onOpenAddMovie}>
                    <Search aria-hidden="true" />
                    <span>Adicionar filme</span>
                </button>
                <button type="button" className="filmLibrary__profile" disabled={isLoggingOut} onClick={onLogout}>
                    <CircleUserRound aria-hidden="true" />
                    <span>{userName}</span>
                    <small>{isLoggingOut ? 'Saindo...' : 'Sair'}</small>
                </button>
            </nav>
        </header>
    );
}
