import { NextResponse } from 'next/server';
import { getTasaBCV } from '@/lib/r4service';
import { verifyBankIP } from '@/lib/security';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({}, { status: 404 });
  }
  const isValidIP = verifyBankIP();
  /*
  if (!isValidIP) {
    console.warn("Intento de acceso no autorizado desde IP desconocida.");
    return NextResponse.json(
      { message: 'Forbidden: IP no autorizada' },
      { status: 403 }
    );
  }
  */
  try {
    
    const data = await getTasaBCV();
    
    if (data && data.code === '00') {
      return NextResponse.json({ 
        success: true, 
        tasa: data.tipocambio,
        fecha: data.fechavalor 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No se pudo obtener la tasa', 
        raw: data 
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
