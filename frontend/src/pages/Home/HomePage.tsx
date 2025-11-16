import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { syncRepository } from '../../api/sync';
import { useRepositories } from '../../hooks/useRepo';
import { Loader } from '../../components/ui/Loader';
import { Card } from '../../components/ui/Card';
import { formatRelativeTime } from '../../utils/formatDates';
import { cn } from '../../lib/utils';
import { Github, ArrowRight, Sparkles, TrendingUp, BarChart3, Zap } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: repositories, isLoading } = useRepositories();
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const syncMutation = useMutation({
    mutationFn: syncRepository,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      navigate(`/repos/${data.result.repoId}`);
      setRepoUrl('');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to sync repository');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }
    syncMutation.mutate(repoUrl.trim());
  };

  const recentRepos = repositories
    ?.sort((a, b) => {
      const aTime = a.lastSyncedAt ? new Date(a.lastSyncedAt).getTime() : 0;
      const bTime = b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <div className="relative min-h-screen">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pt-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50bg-blue-950/30 border border-blue-200border-blue-900 text-blue-700text-blue-300 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI-Powered Analytics</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold mb-6 text-slate-900text-slate-50 tracking-tight">
            AI-powered GitHub
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="text-xl text-slate-600text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Sync and analyze your GitHub repositories with AI-powered insights, 
            quality metrics, and actionable recommendations
          </p>
        </motion.div>

        {/* Sync Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card glass className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="repoUrl"
                  className="block text-sm font-semibold text-gray-700text-gray-300 mb-3"
                >
                  GitHub Repository URL
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="repoUrl"
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repo"
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-300border-slate-700 rounded-xl bg-whitebg-slate-900 text-slate-900text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50focus:ring-blue-400/50 focus:border-blue-500focus:border-blue-400 transition-all"
                      disabled={syncMutation.isPending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={syncMutation.isPending || !repoUrl.trim()}
                    className={cn(
                      "px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95",
                      !repoUrl.trim() || syncMutation.isPending
                        ? "bg-slate-300bg-slate-700 text-slate-500text-slate-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    )}
                  >
                    {syncMutation.isPending ? (
                      <>
                        <Loader size="sm" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Sync Repository
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-sm text-red-600text-red-400 font-medium"
                  >
                    {error}
                  </motion.p>
                )}
                <p className="mt-3 text-sm text-gray-500text-gray-400">
                  Enter a GitHub repository URL to sync and analyze it
                </p>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Recent Repositories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900text-white">
              Recent Repositories
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader />
            </div>
          ) : recentRepos && recentRepos.length > 0 ? (
            <div className="grid gap-4">
              {recentRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                          <Github className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900text-white mb-1">
                            {repo.fullName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600text-gray-400">
                            {repo.lastSyncedAt && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Synced {formatRelativeTime(repo.lastSyncedAt)}
                              </span>
                            )}
                            {repo.hasAnalytics && (
                              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-semibold shadow-md">
                                Analytics Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/repos/${repo.id}`)}
                        className="ml-4 p-3 text-blue-600text-blue-400 hover:bg-blue-50hover:bg-blue-900/20 rounded-xl transition-all hover:scale-110 active:scale-95"
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
              <div className="text-center py-16 text-gray-600text-gray-400">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100bg-gray-800 mb-4">
                  <Github className="w-10 h-10 text-gray-400text-gray-600" />
                </div>
                <p className="text-xl font-semibold mb-2 text-gray-900text-white">
                  No repositories yet
                </p>
                <p className="text-sm">
                  Sync a GitHub repository above to get started
                </p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

