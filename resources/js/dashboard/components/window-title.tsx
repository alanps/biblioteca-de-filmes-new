import type { ReactNode } from 'react';

type WindowTitleProps = {
    children: ReactNode;
};

export function WindowTitle({ children }: WindowTitleProps) {
    return (
        <header className="filmLibrary__windowTitle">
            <span>{children}</span>
            <i aria-hidden="true" />
            <b aria-hidden="true" />
        </header>
    );
}
