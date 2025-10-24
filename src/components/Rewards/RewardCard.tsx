import { Award, Gift } from 'lucide-react';
import { Reward } from '../../lib/supabase';

type RewardCardProps = {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
};

const CATEGORY_ICONS: Record<string, any> = {
  descuento: Gift,
  reconocimiento: Award,
  beneficio: Gift,
};

export function RewardCard({ reward, userPoints, onRedeem }: RewardCardProps) {
  const canRedeem = userPoints >= reward.points_required;
  const Icon = CATEGORY_ICONS[reward.category] || Gift;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
        <Icon className="w-20 h-20 text-white" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 flex-1">{reward.title}</h3>
          <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold whitespace-nowrap">
            {reward.points_required} pts
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{reward.description}</p>

        {reward.available_quantity !== null && reward.available_quantity !== undefined && (
          <p className="text-xs text-gray-500 mb-3">
            Disponibles: {reward.available_quantity}
          </p>
        )}

        <button
          onClick={() => onRedeem(reward)}
          disabled={!canRedeem}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            canRedeem
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canRedeem ? 'Canjear' : 'Puntos insuficientes'}
        </button>
      </div>
    </div>
  );
}
