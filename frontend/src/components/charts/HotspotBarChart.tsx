import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateForChart } from '../../utils/charts';
import { formatNumber } from '../../utils/formatNumbers';

interface Hotspot {
  prId: string;
  number: number;
  title: string;
  additions: number;
  deletions: number;
  totalChanges: number;
  createdAt: string;
  mergedAt: string | null;
}

interface HotspotBarChartProps {
  hotspots: Hotspot[];
  maxItems?: number;
}

export function HotspotBarChart({ hotspots, maxItems = 10 }: HotspotBarChartProps) {
  const displayHotspots = hotspots.slice(0, maxItems);

  const chartData = displayHotspots.map((hotspot) => ({
    name: `PR #${hotspot.number}`,
    fullName: hotspot.title,
    additions: hotspot.additions,
    deletions: hotspot.deletions,
    totalChanges: hotspot.totalChanges,
  }));

  const colors = {
    additions: '#22c55e',
    deletions: '#ef4444',
  };

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
        >
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
            width={80}
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
            formatter={(value: number, name: string) => [formatNumber(value), name]}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
          />
          <Legend />
          <Bar dataKey="additions" fill={colors.additions} name="Additions" animationDuration={1500} />
          <Bar dataKey="deletions" fill={colors.deletions} name="Deletions" animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>

      {/* Hotspot Details */}
      <div className="mt-4 space-y-2">
        {displayHotspots.map((hotspot) => (
          <div
            key={hotspot.prId}
            className="p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">
                  PR #{hotspot.number}: {hotspot.title}
                </h4>
                <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                  <span className="text-green-600 font-medium">
                    +{formatNumber(hotspot.additions)}
                  </span>
                  <span className="text-red-600 font-medium">
                    -{formatNumber(hotspot.deletions)}
                  </span>
                  <span>Total: {formatNumber(hotspot.totalChanges)}</span>
                  <span>•</span>
                  <span>{formatDateForChart(hotspot.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

