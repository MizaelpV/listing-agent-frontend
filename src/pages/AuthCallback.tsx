import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type CallbackState = "loading" | "success" | "error";

export default function AuthCallback() {
  const { saveToken } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      saveToken(token);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("success");
      const timer = setTimeout(() => navigate("/"), 1500);
      return () => clearTimeout(timer);
    } else {
      setState("error");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        {state === "loading" && (
          <>
            <div className="h-10 w-10 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">
              Conectando tu cuenta de MercadoLibre...
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="text-4xl">✓</div>
            <p className="font-medium">¡Cuenta conectada!</p>
            <p className="text-sm text-muted-foreground">Redirigiendo...</p>
          </>
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="text-4xl">✗</div>
            <p className="font-medium">No se pudo conectar la cuenta</p>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error durante la autorización. Por favor intenta de
              nuevo.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background hover:bg-accent px-6 py-2 text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
