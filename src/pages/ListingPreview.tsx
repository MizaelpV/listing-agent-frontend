import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listingsApi,
  type MeliAttribute,
  type FilledAttribute,
} from "../api/listings";
import { AxiosError } from "axios";

interface Draft {
  draft_id: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  required_attributes: MeliAttribute[];
}

interface LocationState {
  draft: Draft;
}

function isLocationState(s: unknown): s is LocationState {
  if (typeof s !== "object" || s === null) return false;
  const obj = s as Record<string, unknown>;
  if (typeof obj.draft !== "object" || obj.draft === null) return false;
  const draft = obj.draft as Record<string, unknown>;
  return (
    typeof draft.draft_id === "string" &&
    typeof draft.title === "string" &&
    typeof draft.description === "string" &&
    typeof draft.category_id === "string"
  );
}

export default function ListingPreview() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isLocationState(location.state)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">No hay datos de listing.</p>
          <button
            onClick={() => navigate("/listings/new")}
            className="text-blue-600 underline text-sm"
          >
            Crear nuevo listing
          </button>
        </div>
      </div>
    );
  }

  return <ListingPreviewForm draft={location.state.draft} />;
}

function ListingPreviewForm({ draft }: { draft: Draft }) {
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize attribute values as empty strings keyed by attribute id
  const [attrValues, setAttrValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      draft.required_attributes.map((attr) => [
        attr.id,
        attr.prefilled_value ?? "",
      ]),
    ),
  );

  const handleAttrChange = (id: string, value: string) => {
    setAttrValues((prev) => ({ ...prev, [id]: value }));
  };

  const buildFilledAttributes = (): FilledAttribute[] =>
    Object.entries(attrValues)
      .filter(([, value]) => value.trim() !== "")
      .map(([id, value_name]) => ({ id, value_name }));

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      const result = await listingsApi.publish(draft.draft_id, {
        title,
        description,
        attributes: buildFilledAttributes(),
      });
      navigate("/listings/success", {
        state: {
          meli_url: result.meli_url,
          draft_id: draft.draft_id,
          title,
        },
      });
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const detail = err.response?.data?.detail as unknown;
        const msg =
          typeof detail === "object" && detail !== null
            ? JSON.stringify(
                (detail as Record<string, unknown>).meli_error ?? detail,
              )
            : typeof detail === "string"
              ? detail
              : "Error al publicar. Intenta de nuevo.";
        setError(msg);
      } else {
        setError("Error inesperado. Intenta de nuevo.");
      }
    } finally {
      setPublishing(false);
    }
  }

  console.log("required_attributes", draft.required_attributes);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/listings/new")}
          className="text-sm text-gray-500 hover:text-gray-800 underline"
        >
          ← Volver
        </button>
        <h1 className="text-xl font-semibold">Vista previa del listing</h1>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Categoría
        </label>
        <p className="text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-700">
          {draft.category_name ?? draft.category_id}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Título <span className="text-gray-400 font-normal">(editable)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          {title.length}/60 caracteres
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Descripción{" "}
          <span className="text-gray-400 font-normal">(editable)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Dynamic attribute form */}
      {draft.required_attributes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Especificaciones requeridas
          </h2>
          {draft.required_attributes.map((attr) => (
            <AttributeField
              key={attr.id}
              attr={attr}
              value={attrValues[attr.id] ?? ""}
              onChange={(val) => handleAttrChange(attr.id, val)}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 whitespace-pre-wrap">
          {error}
        </p>
      )}

      <button
        onClick={handlePublish}
        disabled={publishing || !title.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded transition-colors"
      >
        {publishing ? "Publicando..." : "Publicar en MercadoLibre"}
      </button>
    </div>
  );
}

interface AttributeFieldProps {
  attr: MeliAttribute;
  value: string;
  onChange: (val: string) => void;
}

function AttributeField({ attr, value, onChange }: AttributeFieldProps) {
  const isGtin = attr.id === "GTIN";

  const label = (
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {attr.name}
      {attr.default_unit && (
        <span className="text-gray-400 font-normal ml-1">
          ({attr.default_unit})
        </span>
      )}
      {isGtin && (
        <span className="text-gray-400 font-normal ml-1">
          — EAN, UPC u otro código de barras
        </span>
      )}
    </label>
  );

  // list type — predefined values → render a select
  if (attr.values && attr.values.length > 0) {
    return (
      <div>
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar...</option>
          {attr.values.map((v) => (
            <option key={v.id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // boolean type → render a select with Sí/No
  if (attr.value_type === "boolean") {
    return (
      <div>
        {label}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar...</option>
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </select>
      </div>
    );
  }

  // number_unit and string types → plain text input
  return (
    <div>
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={attr.default_unit ? `Ej: 512` : `Ej: ${attr.name}`}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {attr.default_unit && (
        <p className="text-xs text-gray-400 mt-1">
          Ingresa solo el número — la unidad ({attr.default_unit}) se agrega
          automáticamente
        </p>
      )}
    </div>
  );
}
