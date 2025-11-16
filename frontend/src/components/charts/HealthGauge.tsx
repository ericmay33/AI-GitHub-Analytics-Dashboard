import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number; // 0-100
}

export function HealthGauge({ score }: HealthGaugeProps) {
  const data = [
    {
      name: 'Health',
      value: score,
      fill: getHealthColor(score),
    },
  ];

  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Repository Health Score
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="90%"
          barSize={20}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            fill={data[0].fill}
            animationDuration={1500}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <motion.div
        className="mt-4 text-4xl font-bold"
        style={{ color: getHealthColor(score) }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score.toFixed(0)}
      </motion.div>
      <p className="text-sm text-gray-600 mt-2">
        {getHealthLabel(score)}
      </p>
    </div>
  );
}

function getHealthColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  if (score >= 40) return '#ef4444'; // orange
  return '#dc2626'; // red
}

function getHealthLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

