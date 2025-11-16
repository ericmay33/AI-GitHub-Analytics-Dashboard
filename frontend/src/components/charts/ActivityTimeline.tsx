import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatDateForChart } from '../../utils/charts';

interface ActivityTimelineProps {
  data:
    | Array<{
        day: string;
        commitsCount: number;
        prsOpened: number;
        prsMerged: number;
        issuesOpened: number;
        issuesClosed: number;
        linesAdded: number;
        linesDeleted: number;
      }>
    | {
        commits: Array<{ day: string; commits: number; additions: number; deletions: number }>;
        prs: Array<{ day: string; opened: number; merged: number }>;
        issues: Array<{ day: string; opened: number; closed: number }>;
      };
}

export function ActivityTimeline({ data }: ActivityTimelineProps) {
  // Handle both data formats
  let chartData: Array<{
    name: string;
    commits: number;
    prsOpened: number;
    prsMerged: number;
    issuesOpened: number;
    issuesClosed: number;
  }>;

  if (Array.isArray(data)) {
    // Format: daily metrics array
    chartData = data.map((item) => ({
      name: formatDateForChart(item.day),
      commits: item.commitsCount,
      prsOpened: item.prsOpened,
      prsMerged: item.prsMerged,
      issuesOpened: item.issuesOpened,
      issuesClosed: item.issuesClosed,
    }));
  } else {
    // Format: timeline object with commits, prs, issues arrays
    // Merge all days and combine data
    const allDays = new Set<string>();
    data.commits.forEach((c) => allDays.add(c.day));
    data.prs.forEach((p) => allDays.add(p.day));
    data.issues.forEach((i) => allDays.add(i.day));

    chartData = Array.from(allDays)
      .sort()
      .map((day) => {
        const commit = data.commits.find((c) => c.day === day);
        const pr = data.prs.find((p) => p.day === day);
        const issue = data.issues.find((i) => i.day === day);
        return {
          name: formatDateForChart(day),
          commits: commit?.commits || 0,
          prsOpened: pr?.opened || 0,
          prsMerged: pr?.merged || 0,
          issuesOpened: issue?.opened || 0,
          issuesClosed: issue?.closed || 0,
        };
      });
  }

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          stroke="#6b7280"
          tick={{ fill: '#6b7280', fontSize: 12 }}
        />
        <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
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
        <Area
          type="monotone"
          dataKey="commits"
          stackId="1"
          stroke="#3b82f6"
          fill="url(#colorCommits)"
          name="Commits"
          animationDuration={1500}
        />
        <Area
          type="monotone"
          dataKey="prsOpened"
          stackId="2"
          stroke="#6366f1"
          fill="url(#colorPRs)"
          name="PRs Opened"
          animationDuration={1500}
        />
        <Area
          type="monotone"
          dataKey="prsMerged"
          stackId="2"
          stroke="#4f46e5"
          fill="#6366f1"
          fillOpacity={0.6}
          name="PRs Merged"
          animationDuration={1500}
        />
        <Area
          type="monotone"
          dataKey="issuesOpened"
          stackId="3"
          stroke="#f59e0b"
          fill="url(#colorIssues)"
          name="Issues Opened"
          animationDuration={1500}
        />
      </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

