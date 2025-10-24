import { useState, useEffect } from 'react';
import { Award, TrendingUp, History } from 'lucide-react';
import { supabase, Reward, Activity, UserReward } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { RewardCard } from './RewardCard';

export function RewardsView() {
  const { profile, refreshProfile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [userRewards, setUserRewards] = useState<(UserReward & { rewards: Reward })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'activity' | 'redeemed'>('available');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [rewardsData, activitiesData, userRewardsData] = await Promise.all([
      supabase.from('rewards').select('*').eq('is_active', true).order('points_required'),
      supabase
        .from('activities')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('user_rewards')
        .select('*, rewards(*)')
        .eq('user_id', profile?.id)
        .order('redeemed_at', { ascending: false }),
    ]);

    if (!rewardsData.error && rewardsData.data) setRewards(rewardsData.data);
    if (!activitiesData.error && activitiesData.data) setActivities(activitiesData.data);
    if (!userRewardsData.error && userRewardsData.data) setUserRewards(userRewardsData.data);

    setLoading(false);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!profile || profile.points < reward.points_required) return;

    const { error } = await supabase.from('user_rewards').insert({
      user_id: profile.id,
      reward_id: reward.id,
      status: 'pendiente',
    });

    if (error) {
      alert('Error al canjear la recompensa');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ points: profile.points - reward.points_required })
      .eq('id', profile.id);

    if (!updateError) {
      await refreshProfile();
      fetchData();
      alert('¡Recompensa canjeada exitosamente!');
    }
  };

  const ACTIVITY_LABELS: Record<string, string> = {
    reporte_valido: 'Reporte Válido',
    reciclaje: 'Reciclaje',
    educacion: 'Educación',
    compartir: 'Compartir',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tus Puntos</h1>
              <p className="text-green-100">Gana más puntos y obtén recompensas increíbles</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 justify-end mb-1">
                <Award className="w-8 h-8" />
                <span className="text-5xl font-bold">{profile?.points || 0}</span>
              </div>
              <span className="text-green-100">Puntos disponibles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'available'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Award className="w-5 h-5 inline mr-2" />
            Recompensas Disponibles
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Mi Actividad
          </button>
          <button
            onClick={() => setActiveTab('redeemed')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'redeemed'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <History className="w-5 h-5 inline mr-2" />
            Mis Canjes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'available' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  userPoints={profile?.points || 0}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {activities.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No hay actividad registrada aún
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-800">
                            {ACTIVITY_LABELS[activity.activity_type]}
                          </span>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          +{activity.points_earned}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'redeemed' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRewards.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600 bg-white rounded-lg shadow-md">
                  No has canjeado recompensas aún
                </div>
              ) : (
                userRewards.map((userReward) => (
                  <div
                    key={userReward.id}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {userReward.rewards.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{userReward.rewards.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          userReward.status === 'entregado'
                            ? 'bg-green-100 text-green-700'
                            : userReward.status === 'usado'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {userReward.status.charAt(0).toUpperCase() + userReward.status.slice(1)}
                      </span>
                      <span className="text-gray-500">
                        {new Date(userReward.redeemed_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
