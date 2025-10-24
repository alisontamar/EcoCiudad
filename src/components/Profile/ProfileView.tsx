import { useState, useEffect } from 'react';
import { User, Award, MapPin, Calendar, Shield, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function ProfileView() {
  const { profile } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalAssigned: 0,
    resolved: 0,
    inProgress: 0,
  });

  const isAdmin = profile?.role === 'municipal_admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    }
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    const { data: assigned } = await supabase
      .from('reports')
      .select('*')
      .eq('assigned_to', profile?.id);

    if (assigned) {
      const resolved = assigned.filter((r) => r.status === 'resuelto').length;
      const inProgress = assigned.filter((r) => r.status === 'en_proceso').length;

      setAdminStats({
        totalAssigned: assigned.length,
        resolved,
        inProgress,
      });
    }
  };

  const ROLE_LABELS: Record<string, string> = {
    citizen: 'Ciudadano',
    municipal_admin: 'Administrador Municipal',
    super_admin: 'Super Administrador',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-green-600 to-blue-600"></div>

        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
              {isAdmin ? (
                <Shield className="w-16 h-16 text-blue-600" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{profile?.full_name}</h1>
            <p className="text-gray-600">{profile?.email}</p>
            <div className="mt-2">
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{ROLE_LABELS[profile?.role || 'citizen']}</span>
              </span>
            </div>
          </div>

          {isAdmin ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <span className="font-semibold text-gray-800">Asignados</span>
                  </div>
                  <p className="text-4xl font-bold text-blue-600">{adminStats.totalAssigned}</p>
                  <p className="text-sm text-gray-600 mt-2">Reportes bajo tu gestión</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                    <span className="font-semibold text-gray-800">En Proceso</span>
                  </div>
                  <p className="text-4xl font-bold text-yellow-600">{adminStats.inProgress}</p>
                  <p className="text-sm text-gray-600 mt-2">Actualmente trabajando</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-gray-800">Resueltos</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600">{adminStats.resolved}</p>
                  <p className="text-sm text-gray-600 mt-2">Casos completados</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Miembro desde</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 ml-6">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-gray-800">Tasa de Resolución</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600">
                    {adminStats.totalAssigned > 0
                      ? Math.round((adminStats.resolved / adminStats.totalAssigned) * 100)
                      : 0}
                    %
                  </p>
                  <p className="text-sm text-gray-600 mt-2">De reportes asignados</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Responsabilidades del Administrador
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Revisar y gestionar reportes ciudadanos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Actualizar estados y agregar comentarios</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Supervisar métricas y estadísticas de la ciudad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Gestionar recompensas y contenido educativo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Mantener comunicación transparente con ciudadanos</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-6 h-6 text-green-600" />
                    <span className="font-semibold text-gray-800">Puntos Acumulados</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600">{profile?.points || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Sigue participando para ganar más puntos
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Rol</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 ml-6">
                        {ROLE_LABELS[profile?.role || 'citizen']}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Miembro desde</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-800 ml-6">
                        {profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Cómo ganar más puntos
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 font-bold">+10</span>
                    <span>Crear un reporte ambiental válido</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 font-bold">+5</span>
                    <span>Leer contenido educativo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 font-bold">+15</span>
                    <span>Participar en actividades de reciclaje</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2 font-bold">+3</span>
                    <span>Compartir contenido educativo</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
