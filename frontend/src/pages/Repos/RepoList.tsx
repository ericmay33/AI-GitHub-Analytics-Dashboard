import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRepositories } from '../../hooks/useRepo';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { formatRelativeTime } from '../../utils/formatDates';
import { Github, ArrowRight, BarChart3 } from 'lucide-react';

export function RepoList() {
  const navigate = useNavigate();
  const { data: repositories, isLoading } = useRepositories();

  return (
    <div>
      <PageHeader
        title="Repositories"
        description="All synced repositories"
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : repositories && repositories.length > 0 ? (
        <div className="grid gap-4">
          {repositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900text-white mb-2">
                        {repo.fullName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600text-gray-400 flex-wrap">
                        <span className="font-medium">{repo.owner}</span>
                        {repo.lastSyncedAt && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>Synced {formatRelativeTime(repo.lastSyncedAt)}</span>
                          </>
                        )}
                        {repo.hasAnalytics && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                            <BarChart3 className="w-3 h-3" />
                            Analytics
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/repos/${repo.id}`)}
                    className="p-3 text-blue-600text-blue-400 hover:bg-blue-50hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110 active:scale-95"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12 text-gray-600text-gray-400">
            <Github className="w-12 h-12 mx-auto mb-4 text-gray-400text-gray-600" />
            <p className="text-lg font-medium mb-2">No repositories</p>
            <p className="text-sm">
              Go to Home to sync your first repository
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

