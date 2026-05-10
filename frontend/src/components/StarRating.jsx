import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

export const StarRating = ({ rating = 0, size = 'md', interactive = false, onChange }) => {
  const sizeMap = { sm: 'h-3 w-3', md: 'h-5 w-5', lg: 'h-7 w-7' };
  const starSize = sizeMap[size] || sizeMap.md;

  if (interactive) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                starSize,
                'transition-colors',
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = star <= Math.floor(rating);
        const half = !fill && star === Math.ceil(rating) && rating % 1 >= 0.25;
        return (
          <Star
            key={star}
            className={cn(
              starSize,
              'transition-colors',
              fill || half
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        );
      })}
    </div>
  );
};
