import {
  Users,
  FileText,
  Building2,
  CalendarDays,
  GitBranch,
  Clock3,
} from "lucide-react";

export default function DashboardStats({
  stats,
  collaborationStats,
}) {
  if (!stats) {
    return (
      <div className="text-center py-5">
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
      icon: <Users size={40} />,
    },
    {
      title: "Publications",
      value: stats.publications ?? 0,
      color: "success",
      icon: <FileText size={40} />,
    },
    {
      title: "Institutions",
      value: stats.institutions ?? 0,
      color: "warning",
      icon: <Building2 size={40} />,
    },
    {
      title: "Conferences",
      value: stats.conferences ?? 0,
      color: "info",
      icon: <CalendarDays size={40} />,
    },
    {
      title: "Collaborations",
      value: collaborationStats?.collaborations ?? 0,
      color: "secondary",
      icon: <GitBranch size={40} />,
    },
    {
      title: "Pending Collaborations",
      value:
        collaborationStats?.pending_collaborations ?? 0,
      color: "danger",
      icon: <Clock3 size={40} />,
    },
  ];

  return (
    <div className="row g-4 mb-4">
      {cards.map((card) => (
        <div
          className="col-md-6 col-lg-4"
          key={card.title}
        >
          <div
            className={`card border-0 shadow h-100 border-start border-5 border-${card.color}`}
          >
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted mb-2">
                  {card.title}
                </div>

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
      ))}
    </div>
  );
}