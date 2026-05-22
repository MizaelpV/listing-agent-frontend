import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi } from "@/api/listings";
import { AxiosError } from "axios";

interface DraftResult {
  draft_id: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
}

const PROGRESS_MESSAGES = [
  "Analyzing your product...",
  "Searching for the best category...",
  "Writing your title...",
  "Crafting your description...",
  "Almost ready...",
];

export default function NewListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: "",
    price: "",
    condition: "new",
    listing_type_id: "gold_special",
    available_quantity: "1",
  });
  const [loading, setLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgress = () => {
    setProgressIndex(0);
    intervalRef.current = setInterval(() => {
      setProgressIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 4000);
  };

  const stopProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    startProgress();
    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("condition", form.condition);
      formData.append("listing_type_id", form.listing_type_id);
      formData.append("available_quantity", form.available_quantity);

      const response = await listingsApi.generate(formData);
      const draft = response.data as DraftResult;

      // Navigate to preview — pass draft as router state, no inline rendering
      navigate("/listings/preview", { state: { draft } });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const detail = err.response?.data?.detail as unknown;
        setError(typeof detail === "string" ? detail : "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      stopProgress();
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        placeholder="Product description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <input
        placeholder="Price (CLP)"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
      />
      <select
        value={form.condition}
        onChange={(e) => setForm({ ...form, condition: e.target.value })}
      >
        <option value="new">New</option>
        <option value="used">Used</option>
      </select>
      <select
        value={form.listing_type_id}
        onChange={(e) => setForm({ ...form, listing_type_id: e.target.value })}
      >
        <option value="gold_special">Gold Special</option>
        <option value="free">Free</option>
      </select>
      <input
        placeholder="Quantity"
        value={form.available_quantity}
        onChange={(e) =>
          setForm({ ...form, available_quantity: e.target.value })
        }
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? PROGRESS_MESSAGES[progressIndex] : "Generate Listing"}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}
