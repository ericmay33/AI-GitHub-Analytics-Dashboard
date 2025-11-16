import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getIssues } from '../../api/issues';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatRelativeTime } from '../../utils/formatDates';
import { AlertCircle, CheckCircle, User, Calendar } from 'lucide-react';

export function IssueDetailsPage() {
  const { repoId, issueId } = useParams<{ repoId: string; issueId: string }>();
  
  // Since there's no direct GET /issues/:id endpoint, we'll fetch all and filter
  // In a real app, you'd want a dedicated endpoint
  const { data, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const response = await getIssues(repoId || '', { limit: 1000 });
      const issue = response.issues.find((i) => i.id === issueId);
      if (!issue) throw new Error('Issue not found');
      return issue;
    },
    enabled: !!repoId && !!issueId,
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
          <p className="text-red-600text-red-400">
            Issue not found
          </p>
        </div>
      </Card>
    );
  }

  const issue = data;

  return (
    <div>
      <PageHeader
        title={`Issue #${issue.number}: ${issue.title}`}
        description={repoId ? `Repository: ${repoId}` : undefined}
        actions={
          repoId && (
            <Link
              to={`/repos/${repoId}`}
              className="px-4 py-2 border border-gray-300border-gray-700 rounded-lg hover:bg-gray-100hover:bg-gray-800 transition-colors"
            >
              View Repository
            </Link>
          )
        }
      />

      {/* Issue Status Card */}
      <div className="mb-8">
        <Card glass>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              issue.state === 'open'
                ? 'bg-gradient-to-br from-green-500 to-green-600'
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            } shadow-lg`}>
              {issue.state === 'open' ? (
                <AlertCircle className="w-6 h-6 text-white" />
              ) : (
                <CheckCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      issue.state === 'open'
                        ? 'bg-green-100bg-green-900/30 text-green-700text-green-400 border border-green-200border-green-800'
                        : 'bg-amber-100bg-amber-900/30 text-amber-700text-amber-400 border border-amber-200border-amber-800'
                    }`}
                  >
                    {issue.state.charAt(0).toUpperCase() + issue.state.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issue.contributor && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500text-slate-400" />
                      <div className="flex items-center gap-2">
                        {issue.contributor.avatarUrl && (
                          <img
                            src={issue.contributor.avatarUrl}
                            alt={issue.contributor.login}
                            className="w-6 h-6 rounded-full border-2 border-slate-200border-slate-700"
                          />
                        )}
                        <span className="font-semibold text-slate-900text-slate-50">{issue.contributor.login}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatRelativeTime(issue.createdAt)}</span>
                  </div>
                  {issue.closedAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-600text-slate-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Closed {formatRelativeTime(issue.closedAt)}</span>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Issue Body */}
      {issue.body && (
        <div className="mb-8">
          <Card glass>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 mb-6 tracking-tight">
              Description
            </h2>
            <div className="proseprose-invert max-w-none">
              <div className="p-6 rounded-xl bg-white/50bg-slate-900/50 border border-slate-200/50border-slate-700/50">
                <p className="text-slate-700text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {issue.body}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

