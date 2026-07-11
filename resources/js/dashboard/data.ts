import type { Movie } from './types';

export const movieCatalog: Movie[] = [
    { id: 1, title: 'A Última Órbita', synopsis: 'Uma astronauta recebe uma mensagem impossível enquanto tenta voltar para casa antes da última órbita.', genres: ['ação', 'ficção científica'] },
    { id: 2, title: 'Domingo em Lisboa', synopsis: 'Dois desconhecidos transformam um passeio sem planos por Lisboa em uma comédia cheia de encontros improváveis.', genres: ['comédia'] },
    { id: 3, title: 'Horizonte de Vidro', synopsis: 'Em uma cidade coberta por uma cúpula, uma jovem cientista descobre o que existe do outro lado do céu artificial.', genres: ['ficção científica'] },
    { id: 4, title: 'O Som do Eclipse', synopsis: 'Um técnico de rádio corre contra o tempo para impedir que uma transmissão misteriosa coloque a cidade em perigo.', genres: ['ação', 'ficção científica'] },
    { id: 5, title: 'Riso de Emergência', synopsis: 'Depois de perder o emprego, uma enfermeira cria um serviço de humor por telefone e muda a rotina de um hospital.', genres: ['comédia'] },
    { id: 6, title: 'Plano de Fuga', synopsis: 'Um ex-agente precisa atravessar a cidade em uma noite para salvar a única testemunha de uma conspiração.', genres: ['ação'] },
    { id: 7, title: 'Maré de Setembro', synopsis: 'Uma pequena vila costeira se une para salvar seu cinema e acaba redescobrindo suas histórias mais engraçadas.', genres: ['comédia'] },
    { id: 8, title: 'A Máquina do Tempo Perdida', synopsis: 'Três amigos encontram uma máquina que só viaja para momentos constrangedores do próprio passado.', genres: ['comédia', 'ficção científica'] },
    { id: 9, title: 'Neblina na Estrada', synopsis: 'Durante uma viagem noturna, uma motorista encontra pistas que a levam a uma perseguição sem saída.', genres: ['ação'] },
    { id: 10, title: 'O Clube das Estrelas', synopsis: 'Adolescentes montam um observatório clandestino e fazem uma descoberta que chama atenção do mundo inteiro.', genres: ['comédia', 'ficção científica'] },
    { id: 11, title: 'Quatro Minutos para Amanhã', synopsis: 'Um relógio experimental permite prever quatro minutos do futuro, mas cada uso muda tudo ao redor.', genres: ['ação', 'ficção científica'] },
    { id: 12, title: 'Café para Dois', synopsis: 'Um barista e uma escritora fingem se conhecer para escapar de um encontro desastroso e criam uma amizade inesperada.', genres: ['comédia'] },
];

export const initialUsers = ['Alan PS', 'Marina Silva', 'Caio Lima', 'Beatriz Alves', 'Rafael Costa', 'Julia Martins', 'Pedro Santos', 'Lara Gomes', 'Thiago Reis'];
export const moviesPerPage = 10;
export const usersPerPage = 10;

export function randomMovies(quantity: number): Movie[] {
    return [...movieCatalog].sort(() => Math.random() - 0.5).slice(0, quantity);
}
