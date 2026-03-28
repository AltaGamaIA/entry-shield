"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { uploadIdCardBase64 } from "@/app/actions/upload";
import { useRouter } from "next/navigation";

export default function IdScanner({ visitorId, nextRoute = "/occupancy", onUploadSuccess }: { visitorId?: string, nextRoute?: string, onUploadSuccess?: (url: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const startCamera = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Use environment facing camera (back camera) for documents if on mobile
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
        setErrorMsg("");
      } else {
        setErrorMsg("API de cámara no soportada en este navegador.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Permiso de cámara denegado o cámara no disponible.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup streams on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Downscale to prevent 1MB Vercel server action payload limit truncation
      const maxW = 800;
      const ratio = video.videoHeight / video.videoWidth;
      canvas.width = maxW;
      canvas.height = maxW * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setPhoto(base64);
        
        // Stop the camera tracks to freeze the image
        if (video.srcObject) {
           (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }
      }
    }
  };

  const retryPhoto = () => {
    setPhoto(null);
    startCamera();
  };

  const handleUpload = async () => {
    if (!photo) return;
    setLoading(true);
    const res = await uploadIdCardBase64(photo, visitorId);
    setLoading(false);
    
    if (res.success) {
      if (onUploadSuccess && res.url) {
        onUploadSuccess(res.url);
      } else {
        router.push(nextRoute);
      }
    } else {
      alert(res.error || "Ocurrió un error al subir el documento.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/15 shadow-2xl flex items-center justify-center">
        {errorMsg && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/80">
                <span className="material-symbols-outlined text-error text-4xl mb-2">videocam_off</span>
                <p className="text-error font-bold">{errorMsg}</p>
                <p className="text-on-surface-variant text-sm mt-2">Permita el acceso en su navegador.</p>
            </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover ${photo ? 'hidden' : 'block'}`}
          // NOT mirrored because we need to read text on the ID card
        />
        
        {photo && (
          <img 
            src={photo} 
            alt="Captured Document" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Document Guideline Overlay */}
        {hasCamera && !photo && !errorMsg && (
            <>
                <div 
                    className="absolute inset-0 bg-black/60 pointer-events-none"
                    style={{
                        WebkitMaskImage: 'linear-gradient(black, black), rounded-rectangle(15% 25% 70% 50%, 16px)',
                        maskImage: 'linear-gradient(black, black), rounded-rectangle(15% 25% 70% 50%, 16px)'
                    }}
                >
                    {/* Fallback mask since rounded-rectangle isn't standard in all browsers */}
                    <div className="absolute inset-[15%] rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-[70%] h-[60%] border-2 border-dashed border-primary/60 rounded-xl flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-primary font-label text-xs uppercase tracking-[0.2em] font-bold drop-shadow-md">
                            Alinee el Documento
                        </div>
                    </div>
                </div>
            </>
        )}
      </div>

      {hasCamera && !errorMsg && (
        <div className="flex items-center justify-center gap-4">
          {!photo ? (
             <button onClick={capturePhoto} className="px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold rounded-lg shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                 <span className="material-symbols-outlined">center_focus_weak</span>
                 Escanear Documento
             </button>
          ) : (
            <>
                <button onClick={handleUpload} disabled={loading} className="px-8 py-3 bg-gradient-to-br from-[#adc6ff] to-[#004493] text-on-primary font-headline font-bold rounded-lg shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                    <span className="material-symbols-outlined">check_circle</span>
                    {loading ? "Procesando..." : "Confirmar Legibilidad"}
                </button>
                <button onClick={retryPhoto} disabled={loading} className="px-8 py-3 bg-surface-container-high text-on-surface font-headline font-semibold rounded-lg hover:bg-surface-bright transition-all disabled:opacity-50">
                    Repetir
                </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
