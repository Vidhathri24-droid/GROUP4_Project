export default function DashboardStats({ stats }) {

    if (!stats) {
        return <p>Loading analytics...</p>;
    }

    const cards = [
        {
            title: "Researchers",
            value: stats.researchers,
        },
        {
            title: "Publications",
            value: stats.publications,
        },
        {
            title: "Institutions",
            value: stats.institutions,
        },
        {
            title: "Conferences",
            value: stats.conferences,
        },
    ];

    return (
        <div className="row g-4 mb-5">

            {cards.map((card) => (
                <div
                    key={card.title}
                    className="col-md-3"
                >
                    <div className="card shadow-sm border-0 text-center h-100">

                        <div className="card-body">

                            <h5>{card.title}</h5>

                            <h2 className="text-primary">
                                {card.value}
                            </h2>

                        </div>

                    </div>
                </div>
            ))}

        </div>
    );
}
