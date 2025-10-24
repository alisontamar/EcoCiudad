import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Users,
  Eye,
} from 'lucide-react';
import { supabase, Report } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ReportDetail } from '../Reports/ReportDetail';

type Stats = {
  total: number;
  pendiente: number;
  en_proceso: number;
  resuelto: number;
  rechazado: number;
  categorias: Record<string, number>;
  ultimosReportes: (Report & { profiles?: { full_name: string } })[];
  totalUsuarios: number;
};

export function DashboardView() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pendiente: 0,
    en_proceso: 0,
    resuelto: 0,
    rechazado: 0,
    categorias: {},
    ultimosReportes: [],
    totalUsuarios: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report & { profiles?: { full_name: string } } | null>(null);

  const isAdmin = profile?.role === 'municipal_admin' || profile?.role === 'super_admin';

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    setLoading(true);

    const { data: reports } = await supabase.from('reports').select('*');

    const { data: usuarios } = await supabase.from('profiles').select('id');

    const { data: ultimosReportes } = await supabase
      .from('reports')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reports) {
      const categorias: Record<string, number> = {};
      let pendiente = 0;
      let en_proceso = 0;
      let resuelto = 0;
      let rechazado = 0;

      reports.forEach((report) => {
        categorias[report.category] = (categorias[report.category] || 0) + 1;

        switch (report.status) {
          case 'pendiente':
            pendiente++;
            break;
          case 'en_proceso':
            en_proceso++;
            break;
          case 'resuelto':
            resuelto++;
            break;
          case 'rechazado':
            rechazado++;
            break;
        }
      });

      setStats({
        total: reports.length,
        pendiente,
        en_proceso,
        resuelto,
        rechazado,
        categorias,
        ultimosReportes: ultimosReportes || [],
        totalUsuarios: usuarios?.length || 0,
      });
    }

    setLoading(false);
  };

  const CATEGORY_LABELS: Record<string, string> = {
    basura: 'Basura y Residuos',
    contaminacion: 'Contaminación',
    tala_ilegal: 'Tala Ilegal',
    mal_uso_espacios: 'Mal Uso de Espacios',
  };

  const STATUS_LABELS: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    resuelto: 'Resuelto',
    rechazado: 'Rechazado',
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">
            Solo los administradores municipales pueden acceder al panel de control
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Control Municipal</h1>
        <p className="text-gray-600">
          Gestiona y supervisa los reportes ambientales de la ciudad
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Reportes</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.pendiente}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Resueltos</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.resuelto}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Usuarios</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalUsuarios}</p>
                </div>
                <Users className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Estado de Reportes
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">Pendientes</span>
                  </div>
                  <span className="font-bold text-yellow-600">{stats.pendiente}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">En Proceso</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.en_proceso}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Resueltos</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.resuelto}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700">Rechazados</span>
                  </div>
                  <span className="font-bold text-red-600">{stats.rechazado}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Reportes por Categoría
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.categorias).map(([categoria, cantidad]) => (
                  <div key={categoria} className="flex items-center justify-between">
                    <span className="text-gray-700">{CATEGORY_LABELS[categoria]}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(cantidad / stats.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="font-bold text-gray-800 w-8 text-right">{cantidad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Últimos Reportes - Gestión Rápida
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Haz clic en cualquier reporte para ver detalles y gestionar su estado
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.ultimosReportes.map((reporte) => (
                    <tr key={reporte.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {reporte.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {reporte.profiles?.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {CATEGORY_LABELS[reporte.category]}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reporte.status === 'pendiente'
                              ? 'bg-yellow-100 text-yellow-700'
                              : reporte.status === 'en_proceso'
                              ? 'bg-blue-100 text-blue-700'
                              : reporte.status === 'resuelto'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {STATUS_LABELS[reporte.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reporte.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedReport(reporte)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Gestionar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedReport && (
        <ReportDetail
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={() => {
            fetchStats();
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}
