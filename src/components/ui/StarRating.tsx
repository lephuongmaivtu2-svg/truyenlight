import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "../../supabaseClient";

type Props = {
  storyId: string;
  initialRating: number;
};

export function StarRating({ storyId, initialRating }: Props) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleClick = async (value: number) => {
    setRating(value);                 // optimistic UI
    setSaving(true);
    const { error } = await supabase
      .from("stories")
      .update({ rating: value })
      .eq("id", storyId);
    if (error) console.error("❌ update rating error:", error);
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((v) => {
        const active = v <= (hover || rating);
        return (
          <button
            key={v}
            type="button"
            className="p-0 m-0 leading-none"
            onClick={() => !saving && handleClick(v)}
            onMouseEnter={() => setHover(v)}
            onMouseLeave={() => setHover(0)}
            aria-label={`Đánh giá ${v} sao`}
          >
            <Star
              size={24}
              strokeWidth={2}
              // DÙNG PROP FILL để override fill="none" mặc định của lucide
              fill={active ? "currentColor" : "none"}
              className={active ? "text-yellow-400" : "text-gray-300"}
            />
          </button>
        );
      })}
    </div>
  );
}
