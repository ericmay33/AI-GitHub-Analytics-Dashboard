import { useParams } from 'react-router-dom';
import { useRepositoryAnalytics } from '../../hooks/useRepo';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { MetricCard } from '../../components/ui/MetricCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { HealthGauge } from '../../components/charts/HealthGauge';
import { RadarQualityChart } from '../../components/charts/RadarQualityChart';
import { ActivityTimeline } from '../../components/charts/ActivityTimeline';
import { ContributorImpactChart } from '../../components/charts/ContributorImpactChart';
import { HotspotBarChart } from '../../components/charts/HotspotBarChart';
import { formatNumber } from '../../utils/formatNumbers';
import { 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Users,
  GitBranch,
  AlertCircle,
  Sparkles,
  Shield,
  Activity
} from 'lucide-react';

export function RepoAnalyticsPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { data, isLoading, error } = useRepositoryAnalytics(repoId || '');

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
            {error instanceof Error ? error.message : 'Failed to load analytics'}
          </p>
        </div>
      </Card>
    );
  }

  const { repo, quality, ai, timeline, contributors, hotspots } = data;
  const { repoAnalysis, weeklyReport } = ai;

  const riskColor = {
    low: 'text-green-600text-green-400',
    medium: 'text-yellow-600text-yellow-400',
    high: 'text-red-600text-red-400',
  };

  return (
    <div>
      <PageHeader
        title={`${repo.fullName} - Analytics`}
        description="AI-powered insights and comprehensive metrics"
        actions={
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border-2 border-slate-200border-slate-700 rounded-xl hover:bg-slate-100hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            title="Open repository on GitHub"
            aria-label="Open repository on GitHub"
          >
            <ExternalLink className="w-5 h-5 text-slate-600text-slate-400" />
            <span className="text-sm font-medium text-slate-600text-slate-400 hidden sm:inline">GitHub</span>
          </a>
        }
      />

      {/* Health Score & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card glass>
          <HealthGauge score={repoAnalysis.healthScore} />
        </Card>
        <Card glass>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10from-red-500/20to-orange-500/20 border border-red-200/50border-red-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600text-red-400" />
                <h3 className="text-xs font-semibold text-slate-600text-slate-400 uppercase tracking-wider">
                  Risk Level
                </h3>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${riskColor[repoAnalysis.riskLevel]}`}>
                {repoAnalysis.riskLevel.charAt(0).toUpperCase() + repoAnalysis.riskLevel.slice(1)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-600text-slate-400 uppercase tracking-wider mb-2">
                  Contributors
                </h3>
                <div className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
                  {quality.totalContributors}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-600text-slate-400 uppercase tracking-wider mb-2">
                  Active Days
                </h3>
                <div className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
                  {quality.activeDays}
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card glass>
          <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
            <RadarQualityChart quality={quality} />
          </div>
        </Card>
      </div>

      {/* 2-Column Layout: AI Insights + Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Left Column: AI Insights */}
        <div className="space-y-6">
          {/* AI Analysis Summary */}
          <Card glass className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200border-slate-800">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
                  AI Analysis
                </h2>
              </div>
              <p className="text-slate-700text-slate-300 mb-6 leading-relaxed">
                {repoAnalysis.summary}
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10from-green-500/20to-emerald-500/20 border border-green-200/50border-green-800/50">
                  <h3 className="text-sm font-bold text-green-700text-green-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h3>
                  <ul className="space-y-2.5">
                    {repoAnalysis.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="text-green-500 mt-0.5 font-bold text-base">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10from-red-500/20to-orange-500/20 border border-red-200/50border-red-800/50">
                  <h3 className="text-sm font-bold text-red-700text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <XCircle className="w-4 h-4" />
                    Weaknesses
                  </h3>
                  <ul className="space-y-2.5">
                    {repoAnalysis.weaknesses.map((weakness, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700text-slate-300 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="text-red-500 mt-0.5 font-bold text-base">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {repoAnalysis.recommendations.length > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10from-blue-500/20to-indigo-500/20 border border-blue-200/50border-blue-800/50">
                    <h3 className="text-sm font-bold text-blue-700text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <TrendingUp className="w-4 h-4" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2.5">
                      {repoAnalysis.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-slate-700text-slate-300 flex items-start gap-2.5 leading-relaxed"
                        >
                          <span className="text-blue-500 mt-0.5 font-bold text-base">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Weekly Report */}
          <Card glass>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200border-slate-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
                Weekly Report
              </h2>
            </div>
            <div className="space-y-6">
              {weeklyReport.highlights.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50bg-blue-950/20 border border-blue-200/50border-blue-800/50">
                  <h3 className="text-sm font-bold text-blue-700text-blue-400 mb-3 uppercase tracking-wider">
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {weeklyReport.highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700text-slate-300 leading-relaxed"
                      >
                        • {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="p-4 rounded-xl bg-slate-50bg-slate-800/50 border border-slate-200/50border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-700text-slate-300 mb-2 uppercase tracking-wider">
                  Velocity Summary
                </h3>
                <p className="text-sm text-slate-600text-slate-400 leading-relaxed">
                  {weeklyReport.velocitySummary}
                </p>
              </div>
              {weeklyReport.riskAlerts.length > 0 && (
                <div className="p-4 rounded-xl bg-red-50bg-red-950/20 border border-red-200/50border-red-800/50">
                  <h3 className="text-sm font-bold text-red-700text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    Risk Alerts
                  </h3>
                  <ul className="space-y-2">
                    {weeklyReport.riskAlerts.map((alert, index) => (
                      <li
                        key={index}
                        className="text-sm text-red-700text-red-400 leading-relaxed"
                      >
                        • {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Charts */}
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Total Commits"
              value={formatNumber(quality.totalCommits)}
              icon={<GitBranch className="w-5 h-5" />}
              gradient="blue"
            />
            <MetricCard
              title="PRs Opened"
              value={formatNumber(quality.totalPRsOpened)}
              subtitle={`${quality.prMergeRate.toFixed(1)}% merged`}
              icon={<TrendingUp className="w-5 h-5" />}
              gradient="green"
            />
            <MetricCard
              title="Issues Opened"
              value={formatNumber(quality.totalIssuesOpened)}
              subtitle={`${quality.issueCloseRate.toFixed(1)}% closed`}
              icon={<AlertCircle className="w-5 h-5" />}
              gradient="purple"
            />
            <MetricCard
              title="Contributors"
              value={formatNumber(quality.totalContributors)}
              icon={<Users className="w-5 h-5" />}
              gradient="orange"
            />
          </div>

          {/* Activity Timeline */}
          <Card glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
              Activity Timeline
            </h2>
          </div>
            <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
              <ActivityTimeline data={timeline} />
            </div>
          </Card>
        </div>
      </div>

      {/* Contributors */}
      <div className="mb-10">
        <Card glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
              Contributors
            </h2>
          </div>
          {contributors.length > 0 ? (
            <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
              <ContributorImpactChart contributors={contributors} />
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

      {/* Hotspots */}
      {hotspots.length > 0 && (
        <div className="mb-10">
          <Card glass>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900text-slate-50 tracking-tight">
              Code Hotspots
            </h2>
            <span className="ml-auto text-sm text-slate-500text-slate-400 font-medium">
              High Churn PRs
            </span>
          </div>
            <div className="bg-white/50bg-gray-900/50 rounded-xl p-4 overflow-hidden">
              <HotspotBarChart hotspots={hotspots} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

