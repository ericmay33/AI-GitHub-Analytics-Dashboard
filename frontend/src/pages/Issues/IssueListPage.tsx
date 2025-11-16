import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useIssues } from '../../hooks/useIssues';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatRelativeTime } from '../../utils/formatDates';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';

export function IssueListPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const [page, setPage] = useState(1);
  const [stateFilter, setStateFilter] = useState<'open' | 'closed' | undefined>(undefined);

  const { data, isLoading } = useIssues(repoId || '', {
    page,
    limit: 20,
    state: stateFilter,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-600text-gray-400">No data available</p>
        </div>
      </Card>
    );
  }

  const { issues, pagination } = data;

  return (
    <div>
      <PageHeader
        title="Issues"
        description={`${pagination.total} total issues`}
        actions={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="pl-10 pr-4 py-2.5 border-2 border-slate-300border-slate-700 rounded-xl bg-whitebg-slate-900 text-slate-900text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50focus:ring-blue-400/50 focus:border-blue-500focus:border-blue-400 transition-all"
              />
            </div>
            <select
              value={stateFilter || 'all'}
              onChange={(e) => {
                const value = e.target.value;
                setStateFilter(value === 'all' ? undefined : (value as 'open' | 'closed'));
                setPage(1);
              }}
              className="px-4 py-2.5 border-2 border-slate-300border-slate-700 rounded-xl bg-whitebg-slate-900 text-slate-900text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50focus:ring-blue-400/50 focus:border-blue-500focus:border-blue-400 transition-all"
            >
              <option value="all">All States</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        }
      />

      <div className="space-y-3">
        {issues.length > 0 ? (
          issues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card hover>
                <Link
                  to={`/repos/${repoId}/issues/${issue.id}`}
                  className="block group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2.5 rounded-xl ${
                        issue.state === 'open'
                          ? 'bg-gradient-to-br from-green-500 to-green-600'
                          : 'bg-gradient-to-br from-amber-500 to-amber-600'
                      } shadow-lg group-hover:scale-110 transition-transform`}>
                        {issue.state === 'open' ? (
                          <AlertCircle className="w-5 h-5 text-white" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-900text-slate-50 group-hover:text-blue-600group-hover:text-blue-400 transition-colors">
                            #{issue.number} {issue.title}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              issue.state === 'open'
                                ? 'bg-green-100bg-green-900/30 text-green-700text-green-400 border border-green-200border-green-800'
                                : 'bg-amber-100bg-amber-900/30 text-amber-700text-amber-400 border border-amber-200border-amber-800'
                            }`}
                          >
                            {issue.state.charAt(0).toUpperCase() + issue.state.slice(1)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600text-slate-400 flex-wrap">
                          {issue.contributor && (
                            <div className="flex items-center gap-2">
                              {issue.contributor.avatarUrl && (
                                <img
                                  src={issue.contributor.avatarUrl}
                                  alt={issue.contributor.login}
                                  className="w-6 h-6 rounded-full border-2 border-gray-200border-gray-700"
                                />
                              )}
                              <span className="font-medium">{issue.contributor.login}</span>
                            </div>
                          )}
                          <span className="text-slate-400">•</span>
                          <span>Created {formatRelativeTime(issue.createdAt)}</span>
                          {issue.closedAt && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span>Closed {formatRelativeTime(issue.closedAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <div className="text-center py-16 text-slate-600text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100bg-slate-800 mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400text-slate-600" />
              </div>
              <p className="font-semibold text-lg mb-2 text-slate-900text-slate-50">No issues found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 p-4 bg-whitebg-slate-900 rounded-xl border border-slate-200border-slate-800 shadow-lg">
          <div className="text-sm font-medium text-slate-600text-slate-400">
            Page <span className="font-bold text-slate-900text-slate-50">{pagination.page}</span> of{' '}
            <span className="font-bold text-slate-900text-slate-50">{pagination.totalPages}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border-2 border-slate-300border-slate-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium text-slate-700text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border-2 border-slate-300border-slate-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium text-slate-700text-slate-300"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

