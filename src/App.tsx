import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Navbar } from './components/Layout/Navbar';
import { ReportsView } from './components/Reports/ReportsView';
import { RewardsView } from './components/Rewards/RewardsView';
import { EducationView } from './components/Education/EducationView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { ProfileView } from './components/Profile/ProfileView';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState('reports');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando EcoCiudad...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      <main>
        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'rewards' && <RewardsView />}
        {activeView === 'education' && <EducationView />}
        {activeView === 'profile' && <ProfileView />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
