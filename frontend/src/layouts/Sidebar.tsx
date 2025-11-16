import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRepositories } from '../hooks/useRepo';
import { Loader } from '../components/ui/Loader';
import { formatRelativeTime } from '../utils/formatDates';
import { cn } from '../lib/utils';
import { 
  LayoutDashboard, 
  GitBranch, 
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { data: repositories, isLoading, refetch } = useRepositories();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-72 bg-gradient-to-b from-gray-50/95 via-white/95 to-gray-50/95 backdrop-blur-xl border-r border-gray-200/50 h-screen flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          {/* Minimal Logomark */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center">
              <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm"></div>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              GitPulse
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              AI-Powered Insights
            </p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200/50">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 group',
            isActive('/')
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <LayoutDashboard className={cn(
            'w-5 h-5 transition-transform group-hover:scale-110',
            isActive('/') ? 'text-white' : ''
          )} />
          <span className="font-semibold">Home</span>
        </Link>
        <Link
          to="/repos"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isActive('/repos')
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <GitBranch className={cn(
            'w-5 h-5 transition-transform group-hover:scale-110',
            isActive('/repos') ? 'text-white' : ''
          )} />
          <span className="font-semibold">Repositories</span>
        </Link>
      </div>

      {/* Repositories List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Repositories
          </h2>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
            title="Refresh repositories"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="sm" />
          </div>
        ) : repositories && repositories.length > 0 ? (
          <div className="space-y-2">
            {repositories.map((repo, index) => {
              const isRepoActive = location.pathname === `/repos/${repo.id}` ||
                location.pathname.startsWith(`/repos/${repo.id}/`);
              return (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                <Link
                  to={`/repos/${repo.id}`}
                  className={cn(
                    'block px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group relative',
                    isRepoActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  )}
                >
                  {isRepoActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>
                  )}
                  <div className="font-semibold truncate flex items-center gap-2">
                    <GitBranch className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isRepoActive ? 'text-blue-600' : 'text-slate-500'
                    )} />
                    <span className="truncate">{repo.fullName}</span>
                  </div>
                  {repo.lastSyncedAt && (
                    <div className="text-xs text-slate-500 mt-1">
                      {formatRelativeTime(repo.lastSyncedAt)}
                    </div>
                  )}
                </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-gray-500">
            <p className="mb-2">No repositories yet</p>
            <Link
              to="/"
              className="mt-2 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

