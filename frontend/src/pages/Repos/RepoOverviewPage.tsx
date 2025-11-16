import { useParams, Link } from 'react-router-dom';
import { useRepositoryOverview } from '../../hooks/useRepo';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { ActivityTimeline } from '../../components/charts/ActivityTimeline';
import { ContributorImpactChart } from '../../components/charts/ContributorImpactChart';
import { formatNumber } from '../../utils/formatNumbers';
import { 
  Github, 
  ExternalLink, 
  BarChart3, 
  Users, 
  GitBranch,
  TrendingUp 
} from 'lucide-react';

export function RepoOverviewPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { data, isLoading, error } = useRepositoryOverview(repoId || '');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600text-red-400">
            {error instanceof Error ? error.message : 'Failed to load repository'}
          </p>
        </div>
      </Card>
    );
  }

  const { repo, recentMetrics, topContributors } = data;

  const totalCommits = recentMetrics.reduce((sum, m) => sum + m.commitsCount, 0);
  const totalPRs = recentMetrics.reduce((sum, m) => sum + m.prsOpened, 0);
  const totalIssues = recentMetrics.reduce((sum, m) => sum + m.issuesOpened, 0);
  const totalLines = recentMetrics.reduce((sum, m) => sum + m.linesAdded - m.linesDeleted, 0);

  return (
    <div>
      <PageHeader
        title={repo.fullName}
        description={repo.htmlUrl}
        actions={
          <div className="flex items-center gap-3">
            <Link
              to={`/repos/${repoId}/analytics`}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <BarChart3 className="w-5 h-5" />
              Full Analytics
            </Link>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 border-2 border-slate-200border-slate-700 rounded-xl hover:bg-slate-100hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Open repository on GitHub"
              aria-label="Open repository on GitHub"
            >
              <ExternalLink className="w-5 h-5 text-slate-600text-slate-400" />
            </a>
          </div>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <MetricCard
          title="Total Commits"
          value={formatNumber(totalCommits)}
          subtitle="Last 30 days"
          icon={<GitBranch className="w-6 h-6" />}
          gradient="blue"
        />
        <MetricCard
          title="Pull Requests"
          value={formatNumber(totalPRs)}
          subtitle="Opened"
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="green"
        />
        <MetricCard
          title="Issues"
          value={formatNumber(totalIssues)}
          subtitle="Opened"
          icon={<Github className="w-6 h-6" />}
          gradient="purple"
        />
        <MetricCard
          title="Net Lines"
          value={formatNumber(totalLines)}
          subtitle="Added - Deleted"
          icon={<BarChart3 className="w-6 h-6" />}
          gradient="orange"
        />
      </div>

      {/* Activity Timeline */}
      <div className="mb-10">
        <Card glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
              Activity Timeline
            </h2>
            <span className="ml-auto text-sm text-slate-500text-slate-400 font-medium">
              Last 30 Days
            </span>
          </div>
          <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
            <ActivityTimeline data={recentMetrics} />
          </div>
        </Card>
      </div>

      {/* Top Contributors */}
      <div className="mb-10">
        <Card glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
              Top Contributors
            </h2>
          </div>
          {topContributors.length > 0 ? (
            <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
              <ContributorImpactChart contributors={topContributors} />
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600text-slate-400">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100bg-slate-800 mb-4">
                <Users className="w-8 h-8 text-slate-400text-slate-600" />
              </div>
              <p className="font-medium">No contributor data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover>
          <Link
            to={`/repos/${repoId}/prs`}
            className="block group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900text-slate-50 mb-2 group-hover:text-blue-600group-hover:text-blue-400 transition-colors">
                  View Pull Requests
                </h3>
                <p className="text-sm text-slate-600text-slate-400">
                  Browse and analyze all pull requests
                </p>
              </div>
            </div>
          </Link>
        </Card>
        <Card hover>
          <Link
            to={`/repos/${repoId}/issues`}
            className="block group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900text-slate-50 mb-2 group-hover:text-blue-600group-hover:text-blue-400 transition-colors">
                  View Issues
                </h3>
                <p className="text-sm text-slate-600text-slate-400">
                  Browse and analyze all issues
                </p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}

