import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { AdminLayout } from '../components/layout/AdminLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminCampDetailPage } from '../pages/admin/AdminCampDetailPage';
import { AchievementsPage } from '../pages/admin/AchievementsPage';
import { BattleDetailPage } from '../pages/admin/BattleDetailPage';
import { CampsPage } from '../pages/admin/CampsPage';
import { CampTypesPage } from '../pages/admin/CampTypesPage';
import { MedalsPage } from '../pages/admin/MedalsPage';
import { PlayersPage } from '../pages/admin/PlayersPage';
import { PhotosPage } from '../pages/admin/PhotosPage';
import { RanksPage } from '../pages/admin/RanksPage';
import { TeamTemplatesPage } from '../pages/admin/TeamTemplatesPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { CampPublicPage } from '../pages/public/CampPublicPage';
import { PlayerProfilePage } from '../pages/public/PlayerProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'camps',
            element: <CampsPage />,
          },
          {
            path: 'camps/:campId',
            element: <AdminCampDetailPage />,
          },
          {
            path: 'battles/:battleId',
            element: <BattleDetailPage />,
          },
          {
            path: 'camp-types',
            element: <CampTypesPage />,
          },
          {
            path: 'team-templates',
            element: <TeamTemplatesPage />,
          },
          {
            path: 'players',
            element: <PlayersPage />,
          },
          {
            path: 'achievements',
            element: <AchievementsPage />,
          },
          {
            path: 'ranks',
            element: <RanksPage />,
          },
          {
            path: 'medals',
            element: <MedalsPage />,
          },
          {
            path: 'photos',
            element: <PhotosPage />,
          },
          {
            path: '*',
            element: <AdminDashboardPage />,
          },
        ],
      },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/camps/:campId',
        element: <CampPublicPage />,
      },
      {
        path: '/players/:playerId',
        element: <PlayerProfilePage />,
      },
    ],
  },
]);
