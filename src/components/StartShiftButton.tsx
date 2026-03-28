'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StartShiftButtonProps {
  propertyId: string;
}

export default function StartShiftButton({ propertyId }: StartShiftButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();

  const handleStartShift = () => {
    // Give visual feedback (turn green)
    setIsActive(true);
    
    // Save locally to persist shift context
    if (typeof window !== 'undefined') {
      localStorage.setItem('activePropertyId', propertyId);
    }

    // Redirect after a short delay so the user sees the green state
    setTimeout(() => {
      router.push(`/dashboard?propertyId=${propertyId}`);
    }, 600);
  };

  return (
    <button
      onClick={handleStartShift}
      className={`w-full flex items-center justify-center gap-2 px-8 py-4 font-extrabold font-headline rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
        isActive 
          ? 'bg-tertiary text-on-tertiary shadow-[0_0_20px_rgba(105,246,184,0.4)]' 
          : 'bg-gradient-to-br from-[#adc6ff] to-[#004493] text-[#003d87]'
      }`}
    >
      {isActive ? (
        <>
          <span className="material-symbols-outlined text-xl">check_circle</span>
          TURNO INICIADO
        </>
      ) : (
        'Iniciar Turno'
      )}
    </button>
  );
}
