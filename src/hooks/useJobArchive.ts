
import { useState, useMemo } from 'react';
import { Job } from './useJobs';

export const useJobArchive = (jobs: Job[]) => {
  const [showArchived, setShowArchived] = useState(false);

  // Jobs that can be archived (completed and paid)
  const archivableJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'completed' && job.is_paid);
  }, [jobs]);

  // Active jobs (not completed and paid)
  const activeJobs = useMemo(() => {
    return jobs.filter(job => !(job.status === 'completed' && job.is_paid));
  }, [jobs]);

  // Currently displayed jobs based on view mode
  const displayedJobs = useMemo(() => {
    return showArchived ? archivableJobs : activeJobs;
  }, [showArchived, archivableJobs, activeJobs]);

  const toggleArchiveView = () => {
    setShowArchived(!showArchived);
  };

  return {
    archivableJobs,
    activeJobs,
    displayedJobs,
    showArchived,
    toggleArchiveView,
    archivedCount: archivableJobs.length,
    activeCount: activeJobs.length
  };
};
