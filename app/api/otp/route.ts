import { NextResponse } from 'next/server';
import { generateOtp } from '@/lib/r4service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { banco, monto, telefono, cedula } = body;
    console.log(banco, monto, telefono, cedula);
    console.log(typeof banco, typeof monto, typeof telefono, typeof cedula)
    if (!banco || !monto || !telefono || !cedula) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }
    const result = await generateOtp({ banco, monto, telefono, cedula });
    console.log(result)
    
    if (result.code === '202' || result.success === true) {
      return NextResponse.json({
        success: true,
        message: result.message,
        originalCode: result.code
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || 'Error al generar OTP',
        originalCode: result.code
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}