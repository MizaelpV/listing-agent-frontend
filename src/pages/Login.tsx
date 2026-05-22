import { authApi } from "@/api/auth";

export default function Login() {
  const handleLogin = () => {
    window.location.href = authApi.getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8 text-center">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            MeLi Listing Agent
          </h1>
          <p className="text-muted-foreground text-sm">
            Crea listings en MercadoLibre con inteligencia artificial
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-xl border bg-card p-6 space-y-4 text-left">
          <div className="space-y-1">
            <h2 className="font-semibold text-base">Conecta tu cuenta</h2>
            <p className="text-sm text-muted-foreground">
              Necesitamos acceso a tu cuenta de MercadoLibre para publicar
              listings en tu nombre.
            </p>
          </div>

          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Acceso de solo lectura y escritura a tus listings</li>
            <li>✓ No almacenamos tu contraseña</li>
            <li>✓ Puedes revocar el acceso en cualquier momento</li>
          </ul>

          <button
            onClick={handleLogin}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-semibold px-6 py-3 transition-colors"
          >
            Conectar con MercadoLibre
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Serás redirigido a MercadoLibre para autorizar el acceso. Volverás
          aquí automáticamente.
        </p>
      </div>
    </div>
  );
}
