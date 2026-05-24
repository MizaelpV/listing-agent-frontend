import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listingsApi, type MeliAttribute } from "@/api/listings";
import { AxiosError } from "axios";

interface DraftState {
  draft_id: string;
  title: string;
  description: string;
  category_id: string;
  category_name: string;
  required_attributes: MeliAttribute[];
  image_urls: string[];
}

const PROGRESS_MESSAGES = [
  "Uploading images...",
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
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setImages((prev) => {
      const combined = [...prev, ...files];
      return combined.slice(0, 8); // enforce max 8
    });

    setPreviews((prev) => {
      const newUrls = files.map((f) => URL.createObjectURL(f));
      const combined = [...prev, ...newUrls];
      return combined.slice(0, 8);
    });

    // Reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    startProgress();
    try {
      // 1. Upload images to R2 first
      const image_urls: string[] = [];
      for (const file of images) {
        const result = await listingsApi.uploadImage(file);
        image_urls.push(result.url);
      }

      // 2. Generate listing
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("condition", form.condition);
      formData.append("listing_type_id", form.listing_type_id);
      formData.append("available_quantity", form.available_quantity);

      const response = await listingsApi.generate(formData);

      const draft: DraftState = {
        draft_id: response.data.draft_id,
        title: response.data.title,
        description: response.data.description,
        category_id: response.data.category_id,
        category_name: response.data.category_name,
        required_attributes: response.data.required_attributes ?? [],
        image_urls,
      };

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Nuevo listing</h1>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Descripción del producto
        </label>
        <textarea
          placeholder="Describe tu producto con el mayor detalle posible: marca, modelo, especificaciones, estado, accesorios incluidos..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={5}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Imágenes <span className="text-gray-400 font-normal">(máximo 8)</span>
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {previews.map((url, i) => (
              <div key={url} className="relative group aspect-square">
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover rounded border border-gray-200"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || images.length >= 8}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-6 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
        >
          {images.length === 0
            ? "Haz clic para agregar imágenes"
            : `${images.length} imagen${images.length > 1 ? "es" : ""} seleccionada${images.length > 1 ? "s" : ""} — agregar más`}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Precio (CLP)
          </label>
          <input
            type="number"
            placeholder="Ej: 500000"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            placeholder="1"
            value={form.available_quantity}
            onChange={(e) =>
              setForm({ ...form, available_quantity: e.target.value })
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Condición
          </label>
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tipo de publicación
          </label>
          <select
            value={form.listing_type_id}
            onChange={(e) =>
              setForm({ ...form, listing_type_id: e.target.value })
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="gold_special">Gold Special</option>
            <option value="free">Gratis</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !form.description.trim() || !form.price}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded transition-colors"
      >
        {loading ? PROGRESS_MESSAGES[progressIndex] : "Generar listing"}
      </button>
    </div>
  );
}
