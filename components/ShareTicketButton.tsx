"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Share, Loader2, Check } from "lucide-react";
// Asegúrate de que este path sea correcto
import { supabase } from "@/lib/supabase-client"; 
import { useToast } from "@/hooks/use-toast";

interface RifaData {
    id: number;
    titulo: string;
    fecha_culminacion: string;
}

interface BoletoData {
    numero_boleto: string;
}

interface ShareTicketButtonProps {
    // Datos necesarios para generar el PDF
    rifa: RifaData;
    boletos: BoletoData[];
    cedulaComprador: string; 
}

const ShareTicketButton: React.FC<ShareTicketButtonProps> = ({ rifa, boletos, cedulaComprador }) => {
    const [canShare, setCanShare] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [publicUrl, setPublicUrl] = useState<string | null>(null);
    const { toast } = useToast();

    // Comprueba si el navegador soporta la Web Share API
    useEffect(() => {
        if (typeof navigator.share === "function") {
            setCanShare(true);
        }
    }, []);

    // Función adaptada para subir el Blob a Supabase
    const uploadPdf = async (pdfBlob: Blob, rifaTitulo: string, cedula: string): Promise<string | null> => {
        // Genera un nombre de archivo único
        const fileName = `${cedula}_${rifaTitulo.replace(/\s/g, '_')}.pdf`;
        const filePath = `${rifaTitulo.replace(/\s/g, '_')}/${fileName}`;
        
        // 1. Subir el archivo (Blob)
        const { error: uploadError } = await supabase.storage
            .from("comprobantes_boletos") // Asume que este es tu bucket para documentos/archivos
            .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true // Sobrescribe si existe (aunque el nombre es único)
            });

        if (uploadError) {
            console.error("Error subiendo PDF a Supabase:", uploadError.message);
            return null;
        }
        
        // 2. Obtener la URL pública
        const { data } = supabase.storage
            .from("comprobantes_boletos") // Mismo bucket
            .getPublicUrl(filePath);

        return data.publicUrl;
    };
    
    const handleShare = async () => {
        if (isSharing || boletos.length === 0) return;

        setIsSharing(true);
        setPublicUrl(null); // Reiniciar la URL al empezar

        try {
            // 1. Generar el PDF (mismo proceso que el botón Descargar)
            const ticketNumbersFormatted = boletos.map(boleto => boleto.numero_boleto.toString().padStart(4, "0"));
            
            const pdfData = {
                nombreRifa: rifa.titulo,
                fechaJuego: rifa.fecha_culminacion,
                cedula: cedulaComprador, 
                boletos: ticketNumbersFormatted,
            };
            
            const response = await fetch('/api/pdf_boletos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pdfData),
            });
            
            if (!response.ok) {
                throw new Error('Error al generar el PDF para compartir.');
            }
            
            const pdfBlob = await response.blob();
            
            // 2. Subir el PDF a Supabase
            const url = await uploadPdf(pdfBlob, rifa.titulo, cedulaComprador);
            
            if (!url) {
                throw new Error('No se pudo obtener la URL pública de Supabase.');
            }
            
            setPublicUrl(url);

            // 3. Usar Web Share API con la URL pública
            await navigator.share({
                title: `Mis boletos para la rifa: ${rifa.titulo}`,
                text: `¡Mira mis boletos para la rifa: ${rifa.titulo}!`,
                url: url, // 🎯 URL del PDF subido
            });
            
            toast({
                title: "Compartido",
                description: "El PDF de los boletos ha sido compartido exitosamente.",
            });

        } catch (error: any) {
            console.error('Error en el proceso de compartir:', error);
            toast({
                title: "Error al Compartir",
                description: error.message || "No se pudo completar la acción de compartir.",
                variant: "destructive",
            });
        } finally {
            setIsSharing(false);
        }
    };

    // Si el navegador no soporta la API, no mostramos el botón (se asume que hay otros métodos)
    if (!canShare) {
        return null;
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 bg-transparent"
            disabled={isSharing || boletos.length === 0}
        >
            {isSharing ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Subiendo...</span>
                </>
            ) : (
                <>
                    <Share className="h-4 w-4" />
                    <span>Compartir</span>
                </>
            )}
        </Button>
    );
};

export default ShareTicketButton;