function Hero() {
  return (
    <div className="container hero py-5">

      <h1 className="display-3 fw-bold">
        Welcome to SCNA
      </h1>

      <p className="lead fs-3 text-secondary">
        Scientific Collaboration Network Analyzer
      </p>

      <p className="fs-5 text-muted w-75">
        SCNA is a research collaboration platform that helps researchers,
        institutions, and publications connect, analyze research networks,
        and discover scientific collaborations efficiently.
      </p>

      <div className="mt-4">
        <button className="btn btn-primary btn-lg me-3">
          View Researchers
        </button>

        <button className="btn btn-outline-secondary btn-lg">
          Explore Institutions
        </button>
      </div>

    </div>
  );
}

export default Hero;