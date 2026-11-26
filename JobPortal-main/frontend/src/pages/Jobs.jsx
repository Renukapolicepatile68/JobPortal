import { useEffect, useState } from "react";
import api from "../api";
import JobCard from "../components/Jobs/JobCard";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [initialJobs, setInitialJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [allJobsLoading, setAllJobsLoading] = useState(false);

  const [error, setError] = useState("");
  const [allJobsError, setAllJobsError] = useState("");

  const [showAllJobs, setShowAllJobs] = useState(() => {
    return localStorage.getItem("jobsViewMode") === "all";
  });

  // ==========================================
  // HELPER
  // ==========================================

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ==========================================
  // LOAD JOBS
  // ==========================================

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    const savedViewMode = localStorage.getItem("jobsViewMode");

    try {
      setLoading(true);
      setError("");

      let response;

      // ==========================================
      // LOAD JOBS
      // ==========================================

      try {
        response = await api.get("/jobs", {
          params: {
            page: 1,
            per_page: savedViewMode === "all" ? 50 : 5,
          },
        });
      } catch (firstError) {
        // ==========================================
        // RETRY AFTER 3 SECONDS
        // Useful when Render backend is waking up
        // ==========================================

        console.log(
          "First jobs request failed. Retrying in 3 seconds..."
        );

        await sleep(3000);

        response = await api.get("/jobs", {
          params: {
            page: 1,
            per_page: savedViewMode === "all" ? 50 : 5,
          },
        });
      }

      // ==========================================
      // PROCESS RESPONSE
      // ==========================================

      const loadedJobs = response.data.jobs || [];

      if (savedViewMode === "all") {
        setJobs(loadedJobs);
        setShowAllJobs(true);
      } else {
        const firstFiveJobs = loadedJobs.slice(0, 5);

        setJobs(firstFiveJobs);
        setShowAllJobs(false);
      }

      setInitialJobs(loadedJobs.slice(0, 5));
    } catch (err) {
      console.error("Failed to load jobs:", err);

      setError(
        "Failed to load jobs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW ALL / SHOW LESS
  // ==========================================

  const handleViewAllJobs = async () => {
    // ==========================================
    // SHOW LESS
    // ==========================================

    if (showAllJobs) {
      setJobs(initialJobs);
      setShowAllJobs(false);

      localStorage.setItem("jobsViewMode", "five");

      return;
    }

    // ==========================================
    // VIEW ALL JOBS
    // ==========================================

    try {
      setAllJobsLoading(true);
      setAllJobsError("");

      let response;

      try {
        response = await api.get("/jobs", {
          params: {
            page: 1,
            per_page: 50,
          },
        });
      } catch (firstError) {
        console.log(
          "First all-jobs request failed. Retrying in 3 seconds..."
        );

        await sleep(3000);

        response = await api.get("/jobs", {
          params: {
            page: 1,
            per_page: 50,
          },
        });
      }

      const allJobs = response.data.jobs || [];

      setJobs(allJobs);
      setShowAllJobs(true);

      localStorage.setItem("jobsViewMode", "all");
    } catch (err) {
      console.error("Failed to load all jobs:", err);

      setAllJobsError(
        "Failed to load all jobs. Please try again."
      );
    } finally {
      setAllJobsLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h4>Loading jobs...</h4>
      </div>
    );
  }

  // ==========================================
  // INITIAL ERROR
  // ==========================================

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  // ==========================================
  // JOBS PAGE
  // ==========================================

  return (
    <div className="container py-5">

      {/* ======================================
          HEADER
      ======================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2 className="fw-bold">
          Available Jobs
        </h2>

        <span className="badge bg-primary fs-6">
          {jobs.length} Jobs
        </span>

      </div>

      {/* ======================================
          JOB LIST
      ======================================= */}

      {jobs.length === 0 ? (
        <div className="alert alert-info text-center">
          No jobs available.
        </div>
      ) : (
        <div className="row g-4">

          {jobs.map((job) => (
            <div
              className="col-md-6 col-lg-4"
              key={job.id}
            >
              <JobCard job={job} />
            </div>
          ))}

        </div>
      )}

      {/* ======================================
          ERROR LOADING ALL JOBS
      ======================================= */}

      {allJobsError && (
        <div className="alert alert-danger text-center mt-4">
          {allJobsError}
        </div>
      )}

      {/* ======================================
          VIEW ALL / SHOW LESS BUTTON
      ======================================= */}

      {initialJobs.length > 0 && (
        <div className="text-center mt-5">

          <button
            type="button"
            className="btn btn-outline-primary rounded-pill px-4"
            onClick={handleViewAllJobs}
            disabled={allJobsLoading}
          >
            {allJobsLoading
              ? "Loading Jobs..."
              : showAllJobs
              ? "Show Less"
              : "View All Jobs"}
          </button>

        </div>
      )}

    </div>
  );
}

export default Jobs;