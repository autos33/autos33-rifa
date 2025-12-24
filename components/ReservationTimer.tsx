import React, { useState, useEffect } from 'react';

interface ReservationTimerProps {
  expiryTimestamp: string | number; // Puede ser un ISO String o milisegundos
  onExpire?: () => void; // Opcional: acción adicional antes de recargar
}

const ReservationTimer: React.FC<ReservationTimerProps> = ({ expiryTimestamp, onExpire }) => {
  // Estado para el tiempo restante en segundos
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Formatear segundos a MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsClient(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expiryTimestamp).getTime();
      const difference = expiration - now;

      // Si el tiempo ya pasó
      if (difference <= 0) {
        return 0;
      }
      
      // Convertir ms a segundos
      return Math.floor(difference / 1000);
    };

    // Cálculo inicial
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // LÓGICA DE EXPIRACIÓN
      if (remaining <= 0) {
        clearInterval(timer);
        
        // Ejecutar acción opcional si existe
        if (onExpire) onExpire();

        // Pequeño delay para que el usuario vea 00:00 y entienda qué pasó
        setTimeout(() => {
          alert("El tiempo de reserva ha expirado. Los boletos han sido liberados. Por favor, Vuelva a intentarlo");
          window.location.reload(); // Recarga la página
        }, 1000);
      }
    }, 1000);

    // Limpieza al desmontar
    return () => clearInterval(timer);
  }, [expiryTimestamp, onExpire]);

  // Evitar hidratación incorrecta en Next.js
  if (!isClient) return null;

  return (
    <div className={`
      flex flex-col items-center justify-center p-3 rounded-lg border 
      ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-800'}
    `}>
      <span className="text-xs font-semibold uppercase tracking-wider">
        Tiempo para pagar
      </span>
      <span className="text-2xl font-bold font-mono">
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};

export default ReservationTimer;