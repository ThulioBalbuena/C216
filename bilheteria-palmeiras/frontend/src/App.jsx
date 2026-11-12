import { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("Verificando conexão com a API…");

  useEffect(() => {
    const controller = new AbortController();
    async function checkConnection() {
      try {
        const response = await fetch("/api/health", {
          signal: controller.signal,
        });
        if (!response.ok || (await response.json()).status !== "ok") {
          throw new Error("API indisponível.");
        }
        if (!controller.signal.aborted) {
          setStatus("API e banco de dados conectados.");
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus("Conexão com a API indisponível.");
        }
      }
    }
    checkConnection();
    return () => controller.abort();
  }, []);

  return (
    <main>
      <h1>Bilheteria Palmeiras</h1>
      <p role="status">{status}</p>
    </main>
  );
}
