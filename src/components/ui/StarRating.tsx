import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "../../supabaseClient";

type Props = {
  storyId: string;
  initialRating: number;
  onChange?: (value: number) => void;
};

export function StarRating({ storyId, initialRating, onChange }: Props) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);

  const handleClick = async (value: number) => {
    // optimistic UI
    setRating(value);
    onChange?.(value);

    const { error } = await supabase
      .from("stories")
      .update({ rating: value })
      .eq("id", storyId);

    if (error) {
      console.error("❌ update rating error:", error);
      // rollback nếu cần
      setRating(initialRating || 0);
      onChange?.(initialRating || 0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((v) => {
        const active = v <= (hover || rating);
        return (
          <button
            key={v}
            type="button"
            className="p-0 m-0 leading-none"
            onClick={() => handleClick(v)}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Đánh giá ${v} sao`}
          >
            <Star
              size={24}
              strokeWidth={2}
              fill={active ? "currentColor" : "none"}
              className={active ? "text-yellow-400" : "text-gray-300"}
            />
          </button>
        );
      })}
    </div>
  );
}

