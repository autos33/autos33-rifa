import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  /*if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({}, { status: 404 });
  }*/
  try {
    const res = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error(`Error en ipify: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      ip: data.ip,
      mensaje: 'Esta es la IP de salida de Vercel'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Hubo un error obteniendo la IP', detalles: error.message }, 
      { status: 500 }
    );
  }
}