import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface QualityIndicators {
  totalCommits: number;
  totalPRsOpened: number;
  totalPRsMerged: number;
  prMergeRate: number;
  totalIssuesOpened: number;
  totalIssuesClosed: number;
  issueCloseRate: number;
  activeDays: number;
  totalContributors: number;
}

interface RadarQualityChartProps {
  quality: QualityIndicators;
}

export function RadarQualityChart({ quality }: RadarQualityChartProps) {
  // Normalize values to 0-100 scale for radar chart
  const maxCommits = 1000;
  const maxPRs = 100;
  const maxIssues = 100;
  const maxActiveDays = 365;
  const maxContributors = 50;

  const data = [
    {
      subject: 'Commits',
      value: Math.min((quality.totalCommits / maxCommits) * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'PRs',
      value: Math.min((quality.totalPRsOpened / maxPRs) * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'PR Merge Rate',
      value: quality.prMergeRate,
      fullMark: 100,
    },
    {
      subject: 'Issues',
      value: Math.min((quality.totalIssuesOpened / maxIssues) * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'Issue Close Rate',
      value: quality.issueCloseRate,
      fullMark: 100,
    },
    {
      subject: 'Active Days',
      value: Math.min((quality.activeDays / maxActiveDays) * 100, 100),
      fullMark: 100,
    },
    {
      subject: 'Contributors',
      value: Math.min((quality.totalContributors / maxContributors) * 100, 100),
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Quality Metrics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Quality"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            animationDuration={1500}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

