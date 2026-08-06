import {
  Users,
  FileText,
  Building2,
  CalendarDays,
  GitBranch,
  Clock3,
} from "lucide-react";

export default function DashboardStats({ stats }) {
  if (!stats) {
    return (
      <div className="text-center py-5">
        <div
          className="spinner-border text-primary"
          role="status"
        >
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-3">
          Loading dashboard...
        </p>
      </div>
    );
  }

  const cards = [
    {
      title: "Researchers",
      value: stats.researchers ?? 0,
      color: "primary",
      icon: <Users size={42} />,
    },
    {
      title: "Publications",
      value: stats.publications ?? 0,
      color: "success",
      icon: <FileText size={42} />,
    },
    {
      title: "Institutions",
      value: stats.institutions ?? 0,
      color: "warning",
      icon: <Building2 size={42} />,
    },
    {
      title: "Conferences",
      value: stats.conferences ?? 0,
      color: "info",
      icon: <CalendarDays size={42} />,
    },
    {
      title: "Collaborations",
      value: stats.collaborations ?? 0,
      color: "secondary",
      icon: <GitBranch size={42} />,
    },
    {
      title: "Pending Collaborations",
      value: stats.pending_collaborations ?? 0,
      color: "danger",
      icon: <Clock3 size={42} />,
    },
  ];

  return (
    <div className="row g-4 mb-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="col-xl-4 col-lg-4 col-md-6"
        >
          <div
            className={`card border-0 shadow h-100 border-start border-5 border-${card.color}`}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">
                    {card.title}
                  </h6>

                  <h2 className={`text-${card.color}`}>
                    {card.value}
                  </h2>
                </div>

                <div className={`text-${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
