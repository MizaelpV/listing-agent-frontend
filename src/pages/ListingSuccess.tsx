// src/pages/ListingSuccess.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ExternalLink, Plus } from "lucide-react";

interface SuccessState {
  meli_url: string;
  draft_id: string;
  title: string;
}

export default function ListingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // State is passed via router navigation — see ListingPreview.tsx
  const state = location.state as SuccessState | null;

  // Guard: if someone lands here directly without state, send them home
  if (!state?.meli_url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No listing data found.</p>
          <button
            onClick={() => navigate("/listings/new")}
            className="text-primary underline"
          >
            Create a new listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Success icon */}
        <div className="flex justify-center">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Listing published!
          </h1>
          {state.title && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {state.title}
            </p>
          )}
        </div>

        {/* MeLi URL card */}
        <div className="rounded-xl border bg-card p-4 space-y-3 text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Your listing is live on MercadoLibre
          </p>
          <a
            href={state.meli_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary font-medium break-all hover:underline"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            {state.meli_url}
          </a>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href={state.meli_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold px-6 py-3 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View on MercadoLibre
          </a>

          <button
            onClick={() => navigate("/listings/new")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background hover:bg-accent px-6 py-3 text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create another listing
          </button>
        </div>
      </div>
    </div>
  );
}
