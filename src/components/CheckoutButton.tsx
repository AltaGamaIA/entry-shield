"use client";

import React, { useState } from 'react';
import { checkoutVisitor } from '@/app/actions/checkout';

interface CheckoutButtonProps {
    visitId: string;
}

export default function CheckoutButton({ visitId }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        const result = await checkoutVisitor(visitId);
        if (!result.success) {
            alert(result.error);
        }
        setLoading(false);
    }

    return (
        <button 
            onClick={handleCheckout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-error-container/20 hover:bg-error-container/40 text-error-dim rounded-lg font-bold text-sm transition-colors uppercase tracking-widest disabled:opacity-50 active:scale-95"
        >
            <span className="material-symbols-outlined text-sm" data-icon="logout">logout</span>
            <span>{loading ? "Saliendo..." : "Salida"}</span>
        </button>
    );
}
