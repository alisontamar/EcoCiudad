import { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Activity as ActivityIcon, Eye, ThumbsUp } from 'lucide-react';
import { supabase, EducationalContent } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function EducationView() {
  const { profile } = useAuth();
  const [contents, setContents] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('educational_content')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContents(data);
    }
    setLoading(false);
  };

  const handleViewContent = async (content: EducationalContent) => {
    setSelectedContent(content);

    const { data: existingInteraction } = await supabase
      .from('content_interactions')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('content_id', content.id)
      .eq('interaction_type', 'view')
      .maybeSingle();

    if (!existingInteraction) {
      await supabase.from('content_interactions').insert({
        user_id: profile?.id,
        content_id: content.id,
        interaction_type: 'view',
      });

      await supabase
        .from('educational_content')
        .update({ views: content.views + 1 })
        .eq('id', content.id);

      await supabase.from('activities').insert({
        user_id: profile?.id,
        activity_type: 'educacion',
        points_earned: 5,
        description: `Leyó: ${content.title}`,
      });

      fetchContents();
    }
  };

  const handleLike = async (content: EducationalContent) => {
    const { data: existingLike } = await supabase
      .from('content_interactions')
      .select('*')
      .eq('user_id', profile?.id)
      .eq('content_id', content.id)
      .eq('interaction_type', 'like')
      .maybeSingle();

    if (existingLike) {
      await supabase
        .from('content_interactions')
        .delete()
        .eq('id', existingLike.id);
    } else {
      await supabase.from('content_interactions').insert({
        user_id: profile?.id,
        content_id: content.id,
        interaction_type: 'like',
      });
    }

    fetchContents();
  };

  const CATEGORY_LABELS: Record<string, string> = {
    campana: 'Campaña',
    consejo: 'Consejo',
    actividad: 'Actividad',
  };

  const CATEGORY_ICONS: Record<string, any> = {
    campana: BookOpen,
    consejo: Lightbulb,
    actividad: ActivityIcon,
  };

  const filteredContents =
    categoryFilter === 'all'
      ? contents
      : contents.filter((c) => c.category === categoryFilter);

  if (selectedContent) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => setSelectedContent(null)}
          className="mb-6 text-green-600 hover:text-green-700 font-medium"
        >
          ← Volver
        </button>

        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
            {(() => {
              const Icon = CATEGORY_ICONS[selectedContent.category];
              return <Icon className="w-24 h-24 text-white" />;
            })()}
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {CATEGORY_LABELS[selectedContent.category]}
              </span>
              <span className="flex items-center text-gray-500 text-sm">
                <Eye className="w-4 h-4 mr-1" />
                {selectedContent.views} vistas
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {selectedContent.title}
            </h1>

            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line mb-6">
              {selectedContent.content}
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => handleLike(selectedContent)}
                className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
              >
                <ThumbsUp className="w-5 h-5" />
                <span>Me gusta</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Educación Ambiental</h1>
        <p className="text-gray-600">
          Aprende sobre el cuidado del medio ambiente y gana puntos
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Categorías</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              categoryFilter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setCategoryFilter('campana')}
            className={`px-4 py-2 rounded-md transition-colors ${
              categoryFilter === 'campana'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Campañas
          </button>
          <button
            onClick={() => setCategoryFilter('consejo')}
            className={`px-4 py-2 rounded-md transition-colors ${
              categoryFilter === 'consejo'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Consejos
          </button>
          <button
            onClick={() => setCategoryFilter('actividad')}
            className={`px-4 py-2 rounded-md transition-colors ${
              categoryFilter === 'actividad'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Actividades
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No hay contenido disponible en esta categoría</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => {
            const Icon = CATEGORY_ICONS[content.category];
            return (
              <div
                key={content.id}
                onClick={() => handleViewContent(content)}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <Icon className="w-16 h-16 text-white" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {CATEGORY_LABELS[content.category]}
                    </span>
                    <span className="flex items-center text-gray-500 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      {content.views}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {content.content.substring(0, 150)}...
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    {new Date(content.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
