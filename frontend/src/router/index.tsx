import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { HomePage } from '../pages/Home/HomePage';
import { RepoList } from '../pages/Repos/RepoList';
import { RepoOverviewPage } from '../pages/Repos/RepoOverviewPage';
import { RepoAnalyticsPage } from '../pages/Repos/RepoAnalyticsPage';
import { PRListPage } from '../pages/PRs/PRListPage';
import { PRDetailsPage } from '../pages/PRs/PRDetailsPage';
import { IssueListPage } from '../pages/Issues/IssueListPage';
import { IssueDetailsPage } from '../pages/Issues/IssueDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'repos',
        element: <RepoList />,
      },
      {
        path: 'repos/:repoId',
        element: <RepoOverviewPage />,
      },
      {
        path: 'repos/:repoId/analytics',
        element: <RepoAnalyticsPage />,
      },
      {
        path: 'repos/:repoId/prs',
        element: <PRListPage />,
      },
      {
        path: 'repos/:repoId/prs/:prId',
        element: <PRDetailsPage />,
      },
      {
        path: 'repos/:repoId/issues',
        element: <IssueListPage />,
      },
      {
        path: 'repos/:repoId/issues/:issueId',
        element: <IssueDetailsPage />,
      },
    ],
  },
]);

