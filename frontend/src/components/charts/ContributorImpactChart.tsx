import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface Contributor {
  id: string;
  login: string;
  avatarUrl: string | null;
  commitCount?: number;
  totalCommits?: number;
  totalPRs?: number;
  totalIssues?: number;
}

interface ContributorImpactChartProps {
  contributors: Contributor[];
  maxItems?: number;
}

export function ContributorImpactChart({ contributors, maxItems = 10 }: ContributorImpactChartProps) {
  const displayContributors = contributors.slice(0, maxItems);

  const chartData = displayContributors.map((contributor) => ({
    name: contributor.login,
    commits: contributor.commitCount || contributor.totalCommits || 0,
    prs: contributor.totalPRs || 0,
    issues: contributor.totalIssues || 0,
  }));

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#111827',
            }}
            labelStyle={{
              color: '#111827',
            }}
          />
          <Legend />
          <Bar dataKey="commits" fill="#3b82f6" name="Commits" animationDuration={1500} />
          <Bar dataKey="prs" fill="#6366f1" name="PRs" animationDuration={1500} />
          <Bar dataKey="issues" fill="#f59e0b" name="Issues" animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>

      {/* Contributor Avatars */}
      <div className="mt-4 flex flex-wrap gap-2">
        {displayContributors.map((contributor, index) => (
          <motion.div
            key={contributor.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200"
          >
            {contributor.avatarUrl && (
              <img
                src={contributor.avatarUrl}
                alt={contributor.login}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-sm font-semibold text-slate-900">
              {contributor.login}
            </span>
            <span className="text-xs text-slate-600">
              {contributor.commitCount || contributor.totalCommits || 0} commits
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

