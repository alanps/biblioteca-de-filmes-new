type CardProps = {
    color: string;
    icon: string;
    title: string;
};

export default function Card({ color, icon, title }: CardProps) {
    return (
        <article className={`landingCard ${color}`}>
            <div className="landingCardIcon">
                <img src={icon} alt="" />
            </div>
            <p>{title}</p>
        </article>
    );
}
