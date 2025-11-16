import { motion } from 'framer-motion';

export function Topbar() {
  return (
    <motion.div
      className="h-20 glass border-b border-slate-200 flex items-center justify-between px-8 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-green-700">
            System Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Placeholder for future profile/user dropdown */}
        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-300"></div>
      </div>
    </motion.div>
  );
}

