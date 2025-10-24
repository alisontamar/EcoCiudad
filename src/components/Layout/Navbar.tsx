import { Sprout, LogOut, User, Award, MapPin, BookOpen, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type NavbarProps = {
  activeView: string;
  onViewChange: (view: string) => void;
};

export function Navbar({ activeView, onViewChange }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const isAdmin = profile?.role === 'municipal_admin' || profile?.role === 'super_admin';

  const navItems = [
    { id: 'reports', label: 'Reportes', icon: MapPin },
    { id: 'rewards', label: 'Recompensas', icon: Award },
    { id: 'education', label: 'Educación', icon: BookOpen },
  ];

  if (isAdmin) {
    navItems.unshift({ id: 'dashboard', label: 'Panel', icon: LayoutDashboard });
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Sprout className="w-8 h-8 text-green-600" />
              <span className="text-xl font-bold text-gray-800">EcoCiudad</span>
            </div>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      activeView === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange('profile')}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-800">{profile?.full_name}</div>
                <div className="text-xs text-green-600">{profile?.points} puntos</div>
              </div>
            </button>

            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline font-medium">Salir</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                  activeView === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
