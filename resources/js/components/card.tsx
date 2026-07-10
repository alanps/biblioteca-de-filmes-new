type CardProps = {
    color: string;
    icon: string;
    title: string;
};

export default function Card({
    color,
    icon,
    title,
}: CardProps) {

    return (

        <article className={`card-filme ${color}`}>

            <div className="icon">
                <img src={icon} alt="" />
            </div>

            <p>{title}</p>

        </article>

    );

}