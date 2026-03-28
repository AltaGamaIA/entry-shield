"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { uploadSelfieBase64 } from "@/app/actions/upload";

export default function VideoUploader({ visitorId, onUploadSuccess, onAgePredicted }: { visitorId?: string, onUploadSuccess?: (url: string) => void, onAgePredicted?: (age: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [detectingAI, setDetectingAI] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
        setErrorMsg("");
      } else {
        setErrorMsg("API de cámara no sportada en este navegador.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Permiso de cámara denegado o no hay cámara disponible.");
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

  useEffect(() => {
    let mounted = true;
    const loadFaceModels = async () => {
      try {
        if (!(window as any).faceapi) return;
        const faceapi = (window as any).faceapi;
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        await faceapi.nets.ageGenderNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model');
        if (mounted) setModelLoaded(true);
      } catch (e) {
        console.error("IA Models Load Error:", e);
      }
    };

    const interval = setInterval(() => {
      if ((window as any).faceapi) {
        clearInterval(interval);
        loadFaceModels();
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas to match video intrinsic dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.9);
        setPhoto(base64);
        
        // Stop the camera tracks to freeze the image
        if (video.srcObject) {
           (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        }

        // Run AI Age Detection immediately on capture
        if (modelLoaded && (window as any).faceapi) {
           setDetectingAI(true);
           const faceapi = (window as any).faceapi;
           // We use setTimeout to let React render the frozen image first before heavy blocking workload
           setTimeout(async () => {
             try {
               const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions()).withAgeAndGender();
               if (detection && onAgePredicted) {
                 onAgePredicted(detection.age);
               }
             } catch (e) {
               console.error("Error predict age", e);
             } finally {
               setDetectingAI(false);
             }
           }, 50);
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
    const res = await uploadSelfieBase64(photo, visitorId);
    setLoading(false);
    
    if (res.success) {
      if (onUploadSuccess && res.url) {
        onUploadSuccess(res.url);
      } else {
        alert("Fotografía verificada y subida exitosamente.");
      }
    } else {
      alert(res.error || "Ocurrió un error al subir la foto.");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="relative aspect-[3/4] md:aspect-video w-full rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/15 shadow-2xl flex items-center justify-center">
        {errorMsg && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-black/80">
                <span className="material-symbols-outlined text-error text-4xl mb-2">videocam_off</span>
                <p className="text-error font-bold">{errorMsg}</p>
                <p className="text-on-surface-variant text-sm mt-2">Por favor, permita el acceso en su navegador y recargue la página.</p>
            </div>
        )}
        
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`absolute inset-0 w-full h-full object-cover ${photo ? 'hidden' : 'block'}`}
          style={{ transform: 'scaleX(-1)' }} // Mirror selfie mode
        />
        
        {photo && (
          <img 
            src={photo} 
            alt="Captured Selfie" 
            className="absolute inset-0 w-full h-full object-cover" 
            style={{ transform: 'scaleX(-1)' }} // Keep mirror consistent with video
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Face Oval Overlay - Guideline */}
        {hasCamera && !photo && !errorMsg && (
            <>
                <div 
                    className="absolute inset-0 bg-black/50 pointer-events-none"
                    style={{
                        WebkitMaskImage: 'radial-gradient(ellipse 35% 55% at 50% 50%, transparent 95%, black 100%)',
                        maskImage: 'radial-gradient(ellipse 35% 55% at 50% 50%, transparent 95%, black 100%)'
                    }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[50%] h-[68%] border-2 border-dashed border-primary/50 rounded-[100%] flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-primary font-label text-xs uppercase tracking-[0.2em] font-bold drop-shadow-md">
                            Alinee el Rostro Aquí
                        </div>
                    </div>
                </div>
            </>
        )}

      </div>

      {hasCamera && !errorMsg && (
        <div className="flex items-center justify-center gap-4">
          {!photo ? (
             <button onClick={capturePhoto} className="px-8 py-3 bg-gradient-to-br from-[#adc6ff] to-[#004493] text-on-primary font-headline font-bold rounded-lg shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
                 <span className="material-symbols-outlined">{modelLoaded ? 'smart_camera' : 'camera'}</span>
                 {modelLoaded ? 'Captura e IA' : 'Capturar Selfie'}
             </button>
          ) : (
            <>
                <button onClick={handleUpload} disabled={loading || detectingAI} className="px-8 py-3 bg-gradient-to-br from-tertiary-container to-tertiary-fixed text-tertiary font-headline font-bold rounded-lg shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                    <span className="material-symbols-outlined">cloud_upload</span>
                    {loading ? "Verificando..." : detectingAI ? "Escanenado Rostro (IA)..." : "Confirmar e Investigar"}
                </button>
                <button onClick={retryPhoto} disabled={loading || detectingAI} className="px-8 py-3 bg-surface-container-high text-on-surface font-headline font-semibold rounded-lg hover:bg-surface-bright transition-all disabled:opacity-50">
                    Repetir
                </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
