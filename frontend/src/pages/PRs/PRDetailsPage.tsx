import { useParams, Link } from 'react-router-dom';
import { usePullRequest, useGeneratePRSummary } from '../../hooks/usePRs';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatRelativeTime } from '../../utils/formatDates';
import { formatNumber } from '../../utils/formatNumbers';
import { 
  GitPullRequest, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  Plus,
  Minus,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export function PRDetailsPage() {
  const { prId } = useParams<{ prId: string }>();
  const { data: pr, isLoading } = usePullRequest(prId || '');
  const generateSummaryMutation = useGeneratePRSummary();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!pr) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600text-red-400">
            Pull request not found
          </p>
        </div>
      </Card>
    );
  }

  const handleGenerateSummary = () => {
    if (prId) {
      generateSummaryMutation.mutate(prId);
    }
  };

  return (
    <div>
      <PageHeader
        title={`PR #${pr.number}: ${pr.title}`}
        description={pr.repository ? `${pr.repository.fullName}` : undefined}
        actions={
          pr.repository && (
            <Link
              to={`/repos/${pr.repository.id}`}
              className="px-4 py-2 border border-gray-300border-gray-700 rounded-lg hover:bg-gray-100hover:bg-gray-800 transition-colors"
            >
              View Repository
            </Link>
          )
        }
      />

      {/* PR Status Card */}
      <div className="mb-8">
        <Card glass>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-3 rounded-xl ${
                pr.state === 'open'
                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                  : pr.mergedAt
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                  : 'bg-gradient-to-br from-red-500 to-red-600'
              } shadow-lg`}>
                {pr.state === 'open' ? (
                  <GitPullRequest className="w-6 h-6 text-white" />
                ) : pr.mergedAt ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <XCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                      pr.state === 'open'
                        ? 'bg-green-100bg-green-900/30 text-green-700text-green-400 border border-green-200border-green-800'
                        : pr.mergedAt
                        ? 'bg-indigo-100bg-indigo-900/30 text-indigo-700text-indigo-400 border border-indigo-200border-indigo-800'
                        : 'bg-red-100bg-red-900/30 text-red-700text-red-400 border border-red-200border-red-800'
                    }`}
                  >
                    {pr.mergedAt ? 'Merged' : pr.state.charAt(0).toUpperCase() + pr.state.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pr.contributor && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-500text-slate-400" />
                      <div className="flex items-center gap-2">
                        {pr.contributor.avatarUrl && (
                          <img
                            src={pr.contributor.avatarUrl}
                            alt={pr.contributor.login}
                            className="w-6 h-6 rounded-full border-2 border-slate-200border-slate-700"
                          />
                        )}
                        <span className="font-semibold text-slate-900text-slate-50">{pr.contributor.login}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatRelativeTime(pr.createdAt)}</span>
                  </div>
                  {pr.mergedAt && (
                    <div className="flex items-center gap-2 text-sm text-slate-600text-slate-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Merged {formatRelativeTime(pr.mergedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(pr.additions || pr.deletions || pr.changedFiles) && (
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50bg-slate-800/50 border border-slate-200border-slate-700">
                {pr.additions !== null && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-green-100bg-green-900/30">
                      <Plus className="w-4 h-4 text-green-600text-green-400" />
                    </div>
                    <div>
                      <div className="text-green-600text-green-400 font-bold text-lg">
                        {formatNumber(pr.additions)}
                      </div>
                      <div className="text-xs text-slate-500text-slate-400">additions</div>
                    </div>
                  </div>
                )}
                {pr.deletions !== null && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-100bg-red-900/30">
                      <Minus className="w-4 h-4 text-red-600text-red-400" />
                    </div>
                    <div>
                      <div className="text-red-600text-red-400 font-bold text-lg">
                        {formatNumber(pr.deletions)}
                      </div>
                      <div className="text-xs text-slate-500text-slate-400">deletions</div>
                    </div>
                  </div>
                )}
                {pr.changedFiles !== null && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100bg-slate-700">
                      <FileText className="w-4 h-4 text-slate-600text-slate-400" />
                    </div>
                    <div>
                      <div className="text-slate-900text-slate-50 font-bold text-lg">
                        {formatNumber(pr.changedFiles)}
                      </div>
                      <div className="text-xs text-slate-500text-slate-400">files</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* AI Summary */}
      <div className="mb-8">
        <Card glass className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900text-white">
                  AI Summary
                </h2>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={generateSummaryMutation.isPending}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {generateSummaryMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Summary
                  </>
                )}
              </button>
            </div>

            {pr.aiSummary ? (
              <div className="proseprose-invert max-w-none">
                <div className="p-6 rounded-xl bg-white/50bg-slate-900/50 border border-slate-200/50border-slate-700/50">
                  <p className="text-slate-700text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {pr.aiSummary.summary}
                  </p>
                  <p className="text-xs text-slate-500text-slate-400 mt-4 pt-4 border-t border-slate-200border-slate-700">
                    Generated {formatRelativeTime(pr.aiSummary.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600text-slate-400">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100bg-slate-800 mb-4">
                  <Sparkles className="w-8 h-8 text-slate-400text-slate-600" />
                </div>
                <p className="font-semibold text-lg mb-2 text-slate-900text-slate-50">No AI summary available</p>
                <p className="text-sm">
                  Click "Generate Summary" to create an AI-powered analysis
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* PR Body */}
      {pr.body && (
        <div className="mb-8">
          <Card glass>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 mb-6 tracking-tight">
              Description
            </h2>
            <div className="proseprose-invert max-w-none">
              <div className="p-6 rounded-xl bg-white/50bg-slate-900/50 border border-slate-200/50border-slate-700/50">
                <p className="text-slate-700text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {pr.body}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

