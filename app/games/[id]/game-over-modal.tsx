"use client";

import { useState } from "react";

export default function GameOverModal({
  score,
  defaultName,
  onSave,
  onRestart,
  onExit,
}: {
  score: number;
  defaultName: string;
  onSave: (name: string) => void;
  onRestart: () => void;
  onExit: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [saved, setSaved] = useState(false);

  return (
    <div className="modal-bd">
      <div className="modal">
        <h2>FIN DEL JUEGO</h2>
        <div className="final-label">PUNTUACIÓN FINAL</div>
        <div className="final">{score.toLocaleString("es-ES")}</div>
        {!saved ? (
          <div className="input-row">
            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value.toUpperCase().slice(0, 10))
              }
              placeholder="TUS INICIALES"
            />
            <button
              className="btn yellow"
              onClick={() => {
                onSave(name.trim() || "INVITADO");
                setSaved(true);
              }}
            >
              GUARDAR PUNTUACIÓN
            </button>
          </div>
        ) : (
          <div className="toast-saved">▸ PUNTUACIÓN GUARDADA_</div>
        )}
        <div className="actions">
          <button className="btn" onClick={onRestart}>
            JUGAR DE NUEVO
          </button>
          <button className="btn magenta" onClick={onExit}>
            VOLVER AL VAULT
          </button>
        </div>
      </div>
    </div>
  );
}
