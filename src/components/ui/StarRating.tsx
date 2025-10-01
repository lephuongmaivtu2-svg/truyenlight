import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "../supabaseClient";

type Props = {
  storyId: string;
  initialRating: number;
};

export function StarRating({ storyId, initialRating }: Props) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);

  const handleClick = async (value: number) => {
    setRating(value);

    // update rating trong Supabase
    const { error } = await supabase
      .from("stories")
      .update({ rating: value })
      .eq("id", storyId);

    if (error) {
      console.error("❌ update rating error:", error);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer ${
            star <= (hover || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        />
      ))}
    </div>
  );
}
