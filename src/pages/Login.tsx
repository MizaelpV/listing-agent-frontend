import { authApi } from "@/api/auth";

export default function Login() {
  const handleLogin = () => {
    window.location.href = authApi.getLoginUrl();
  };

  return <button onClick={handleLogin}>Connect with MercadoLibre</button>;
}
