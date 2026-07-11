import { CircleUserRound, Search, UsersRound } from 'lucide-react';

import logo from '@images/logo.png';

type DashboardHeaderProps = {
    onOpenUsers: () => void;
    onOpenAddMovie: () => void;
};

export function DashboardHeader({ onOpenUsers, onOpenAddMovie }: DashboardHeaderProps) {
    return (
        <header className="filmLibrary__header">
            <img src={logo} alt="Biblioteca de Filmes" className="filmLibrary__logo" />
            <div className="filmLibrary__banner" aria-hidden="true" />
            <nav className="filmLibrary__actions" aria-label="Ações principais">
                <button type="button" className="filmLibrary__action filmLibrary__actionYellow" onClick={onOpenUsers}>
                    <UsersRound aria-hidden="true" />
                    <span>Usuários</span>
                </button>
                <button type="button" className="filmLibrary__action filmLibrary__actionGreen" onClick={onOpenAddMovie}>
                    <Search aria-hidden="true" />
                    <span>Adicionar filme</span>
                </button>
                <button type="button" className="filmLibrary__profile">
                    <CircleUserRound aria-hidden="true" />
                    <span>Alan PS</span>
                    <small>Sair</small>
                </button>
            </nav>
        </header>
    );
}
