import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";

function FeaturedJobs() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // HELPER
  // ==========================================

  const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // LOAD FEATURED JOBS
  // ==========================================

  useEffect(() => {
    const loadFeaturedJobs = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        // ==========================================
        // FIRST REQUEST
        // ==========================================

        try {
          response = await api.get("/jobs", {
            params: {
              sort: "salary_desc",
              per_page: 3,
            },
          });
        } catch (firstError) {
          // ==========================================
          // RETRY AFTER 3 SECONDS
          // Useful when Render backend is waking up
          // ==========================================

          console.log(
            "First featured jobs request failed. Retrying in 3 seconds..."
          );

          await sleep(3000);

          response = await api.get("/jobs", {
            params: {
              sort: "salary_desc",
              per_page: 3,
            },
          });
        }

        // ==========================================
        // PROCESS RESPONSE
        // ==========================================

        setFeaturedJobs(response.data.jobs || []);
      } catch (error) {
        console.error(
          "Failed to load featured jobs:",
          error
        );

        setError(
          "Featured jobs could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedJobs();
  }, []);

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="py-5">
      <div className="container">

        {/* ======================================
            HEADER
        ======================================= */}

        <div className="text-center mb-4">
          <h2 className="fw-bold">
            Featured Jobs
          </h2>

          <p className="text-muted">
            Best available jobs with top packages
          </p>
        </div>

        {/* ======================================
            LOADING
        ======================================= */}

        {loading ? (
          <div className="text-center">
            <p>Loading featured jobs...</p>
          </div>

        ) : error ? (

          /* ======================================
             ERROR
          ======================================= */

          <div className="text-center">
            <p className="text-muted">
              {error}
            </p>
          </div>

        ) : featuredJobs.length === 0 ? (

          /* ======================================
             NO JOBS
          ======================================= */

          <div className="text-center">
            <p>
              No jobs available right now.
            </p>
          </div>

        ) : (

          /* ======================================
             FEATURED JOBS
          ======================================= */

          <div className="row g-4">

            {featuredJobs.map((job) => (
              <div
                className="col-md-6 col-lg-4"
                key={job.id}
              >

                <div className="card border-0 shadow-sm h-100 rounded-4 p-3">

                  {/* COMPANY / TITLE */}

                  <div className="d-flex align-items-center mb-3">

                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                      }}
                    >
                      <strong>
                        {job.company
                          ? job.company
                              .slice(0, 2)
                              .toUpperCase()
                          : "CO"}
                      </strong>
                    </div>

                    <div>
                      <h5 className="fw-bold mb-0">
                        {job.title}
                      </h5>

                      <small className="text-muted">
                        {job.company}
                      </small>
                    </div>

                  </div>

                  {/* LOCATION */}

                  <p className="mb-2">
                    📍 {job.location}
                  </p>

                  {/* SALARY */}

                  <p className="mb-2 text-success fw-semibold">
                    💰 ₹
                    {job.max_salary
                      ? `${(
                          job.max_salary / 100000
                        ).toFixed(1)} LPA`
                      : "Not specified"}
                  </p>

                  {/* JOB TYPE */}

                  <span className="badge bg-light text-dark border mb-4 align-self-start">
                    {job.job_type || "Full Time"}
                  </span>

                  {/* VIEW DETAILS */}

                  <Link
                    to={`/jobs/${job.id}`}
                    className="btn btn-primary w-100 rounded-pill"
                  >
                    View Details
                  </Link>

                </div>

              </div>
            ))}

          </div>
        )}

        {/* ======================================
            VIEW ALL JOBS
        ======================================= */}

        <div className="text-center mt-4">

          <Link
            to="/jobs"
            className="btn btn-outline-primary rounded-pill px-4"
          >
            View Jobs
          </Link>

        </div>

      </div>
    </section>
  );
}

export default FeaturedJobs;