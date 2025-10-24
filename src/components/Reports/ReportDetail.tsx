import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, MessageCircle } from 'lucide-react';
import { supabase, Report, ReportUpdate } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ReportDetailProps = {
  report: Report & { profiles?: { full_name: string } };
  onClose: () => void;
  onUpdate: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

export function ReportDetail({ report, onClose, onUpdate }: ReportDetailProps) {
  const { profile } = useAuth();
  const [updates, setUpdates] = useState<(ReportUpdate & { profiles: { full_name: string } })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(report.status);
  const [loading, setLoading] = useState(false);

  const isAdmin = profile?.role === 'municipal_admin' || profile?.role === 'super_admin';
  const isOwner = profile?.id === report.user_id;

  useEffect(() => {
    fetchUpdates();
  }, [report.id]);

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from('report_updates')
      .select('*, profiles(full_name)')
      .eq('report_id', report.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUpdates(data);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const updateData: any = {
        report_id: report.id,
        user_id: profile?.id,
        comment: newComment,
      };

      if (isAdmin && newStatus !== report.status) {
        updateData.status = newStatus;

        await supabase
          .from('reports')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'resuelto' ? { resolved_at: new Date().toISOString() } : {}),
          })
          .eq('id', report.id);
      }

      const { error } = await supabase.from('report_updates').insert(updateData);

      if (error) throw error;

      setNewComment('');
      fetchUpdates();
      onUpdate();
    } catch (err) {
      console.error('Error adding update:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{report.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Detalles</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    Reportado por: <strong>{report.profiles?.full_name}</strong>
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">
                    {new Date(report.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {report.address && (
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="text-sm">{report.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {STATUS_LABELS[report.status]}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Prioridad:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                    {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Descripción</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{report.description}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Actualizaciones
            </h3>

            {(isAdmin || isOwner) && (
              <form onSubmit={handleAddUpdate} className="mb-6">
                {isAdmin && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actualizar Estado
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="rechazado">Rechazado</option>
                    </select>
                  </div>
                )}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Agregar un comentario o actualización..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Publicando...' : 'Publicar Actualización'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {updates.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay actualizaciones aún
                </p>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800 text-sm">
                          {update.profiles.full_name}
                        </span>
                        {update.status && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            Cambió estado a: {STATUS_LABELS[update.status]}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(update.created_at).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{update.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
