import { ArrowUpRight, BookOpen, Building2, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

export default function SearchCard({
  id,
  type,
  title,
  subtitle,
  badge,
  description,
}) {
  const getLink = () => {
    switch (type) {
      case "researcher":
        return `/researchers/${id}`;
      case "publication":
        return `/publications/${id}`;
      case "institution":
        return `/institutions/${id}`;
      default:
        return "#";
    }
  };

  const icon = {
    researcher: <UserRound size={19} />,
    publication: <BookOpen size={19} />,
    institution: <Building2 size={19} />,
  }[type];

  return (
    <article className="search-result-card">
      <div className={`search-result-icon ${type}`}>
        {icon}
      </div>

      <div className="search-result-main">
        <div className="search-result-topline">
          <h3>{title}</h3>
          {badge && <span className="search-result-badge">{badge}</span>}
        </div>

        {subtitle && <p className="search-result-subtitle">{subtitle}</p>}
        {description && <p className="search-result-description">{description}</p>}
      </div>

      <Link to={getLink()} className="search-view-btn">
        View
        <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
