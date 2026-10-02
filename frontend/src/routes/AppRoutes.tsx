import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { SignupPage } from '../pages/SignupPage'
import { DashboardPage } from '../pages/DashboardPage'
import { DealsPage } from '../pages/DealsPage'
import { DealDetailPage } from '../pages/DealDetailPage'
import { MemoryPage } from '../pages/MemoryPage'
import { InteractionsPage } from '../pages/InteractionsPage'
import { AccountsPage } from '../pages/AccountsPage'
import { FollowUpsPage } from '../pages/FollowUpsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { HelpPage } from '../pages/HelpPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Authenticated / Application Workspace Routes */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/deals/:dealId" element={<DealDetailPage />} />
        <Route path="/memory" element={<MemoryPage />} />
        <Route path="/interactions" element={<InteractionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/follow-ups" element={<FollowUpsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
