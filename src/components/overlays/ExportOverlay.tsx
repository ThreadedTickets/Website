"use client";
import confetti from "canvas-confetti";
import { useCallback, useEffect } from "react";

export default function ExportStatusOverlay({
  status,
  error,
  setStatus,
}: {
  status: "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR";
  error: string | null;
  setStatus: (newStatus: "NULL" | "LOADING" | "SUCCESSFUL" | "ERROR") => void;
}) {
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: -0.1, x: 1.05 },
      startVelocity: 30,
      gravity: 0.7,
      angle: 220,
    });
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: -0.1, x: -0.05 },
      startVelocity: 30,
      gravity: 0.7,
      angle: 320,
    });
  }, []);

  useEffect(() => {
    if (status === "SUCCESSFUL") triggerConfetti();
  }, [status, triggerConfetti]);

  return (
    <div>
      {status !== "NULL" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="bg-midground rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border"
            style={{
              borderColor:
                status === "ERROR"
                  ? "var(--color-red-500)"
                  : status === "SUCCESSFUL"
                  ? "var(--color-green-500)"
                  : "var(--color-midground)",
            }}
          >
            <h2 className="text-2xl font-bold text-center mb-4 text-text">
              {
                {
                  LOADING: "Exporting your message...",
                  SUCCESSFUL: "Export Complete!",
                  ERROR: "Export Failed",
                }[status]
              }
            </h2>

            <div className="bg-foreground rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                {status === "LOADING" && (
                  <>
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-100"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse delay-200"></div>
                  </>
                )}

                {status === "SUCCESSFUL" && (
                  <span className="ml-2">You can now close this tab</span>
                )}

                {status === "ERROR" && (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-red-500 text-sm text-center">
                      Something went wrong while exporting.
                    </span>
                    {error && (
                      <pre className="text-sm text-red-300 bg-red-900/30 p-2 text-center rounded whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
                        {error}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {status !== "SUCCESSFUL" && (
                <button
                  className="w-full bg-primary hover:bg-primary/80 cursor-pointer text-text-inverted font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setStatus("NULL")}
                  disabled={status !== "ERROR"}
                >
                  {status === "ERROR" ? "Try Again" : "Close"}
                </button>
              )}

              {status === "SUCCESSFUL" && (
                <button
                  className="w-full bg-primary hover:bg-primary/80 text-text-inverted cursor-pointer font-medium py-2 px-4 rounded-lg"
                  onClick={() => window.close()}
                >
                  Close Tab
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
