// Utility functions for chart data processing

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export function prepareTimelineData<T extends { day: string }>(
  data: T[]
): Array<T & { name: string }> {
  return data.map((item) => ({
    ...item,
    name: formatDateForChart(item.day),
  }));
}

export function formatDateForChart(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

