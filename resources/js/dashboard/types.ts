export type Movie = {
    id: number;
    title: string;
    originalTitle: string;
    releaseDate: string;
    synopsis: string;
    genres: string[];
    posterUrl?: string | null;
};

export type DashboardUser = {
    id: number;
    name: string;
};
