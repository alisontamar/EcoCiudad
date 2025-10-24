import { MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Report } from '../../lib/supabase';

type ReportCardProps = {
  report: Report & { profiles?: { full_name: string } };
  onClick: () => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  basura: 'Basura y Residuos',
  contaminacion: 'Contaminación',
  tala_ilegal: 'Tala Ilegal',
  mal_uso_espacios: 'Mal Uso de Espacios',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  en_proceso: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  resuelto: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  rechazado: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado',
};

const PRIORITY_COLORS: Record<string, string> = {
  baja: 'text-blue-600',
  media: 'text-yellow-600',
  alta: 'text-red-600',
};

export function ReportCard({ report, onClick }: ReportCardProps) {
  const statusStyle = STATUS_COLORS[report.status];
  const priorityColor = PRIORITY_COLORS[report.priority];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">
            {report.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} whitespace-nowrap`}
          >
            {STATUS_LABELS[report.status]}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {report.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            {CATEGORY_LABELS[report.category]}
          </span>
          <span className={`px-2 py-1 bg-gray-100 rounded text-xs font-medium ${priorityColor}`}>
            Prioridad {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
          </span>
        </div>

        <div className="space-y-1 text-xs text-gray-500">
          {report.address && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{report.address}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>
              {new Date(report.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          {report.profiles && (
            <div className="flex items-center">
              <span className="font-medium">Reportado por: {report.profiles.full_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
