import { NextResponse } from 'next/server';
import { processDebitoInmediato } from '@/lib/r4service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { banco, monto, telefono, cedula, nombre, otp, concepto } = body;

    /* Respuesta Pendiente
    return NextResponse.json({
        success: true,
        status: 'PENDIENTE',
        message: "Operación en Espera de Respuesta del Receptor",
        id: "98ebfbd5-5a3f-4f89-83ba-68bec74c7702",
        originalCode: "AC00"
      });
    */

    /* Respuesta Aprobada
    return NextResponse.json({
        success: true,
        status: 'APROBADO',
        message: "Operación Exitosa",
        reference: "123456789",
        id: "98ebfbd5-5a3f-4f89-83ba-68bec74c7702"
      });
    */
    if (!otp || !monto || !telefono || !cedula || !banco || !nombre || !concepto) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos (OTP, Monto, etc.)' },
        { status: 400 }
      );
    }

    const result = await processDebitoInmediato({ 
      banco, monto, telefono, cedula, nombre, otp, concepto 
    });

    if (result.code === 'ACCP') {
      // Éxito o Aprobado 
      return NextResponse.json({
        success: true,
        status: 'APROBADO',
        message: result.message,
        reference: result.reference,
        id: result.id
      });
    } 
    else if (result.code === 'AC00') {
      // El front se encargará de hacer polling en este caso, no es un error
      return NextResponse.json({
        success: true, 
        status: 'PENDIENTE',
        message: 'Operación en espera de confirmación del banco receptor',
        id: result.id,
        originalCode: result.code
      });
    } 
    else {
      return NextResponse.json({
        success: false,
        status: 'RECHAZADO',
        message: 'La operación no pudo completarse',
        originalCode: result.code
      }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error interno de comunicación' },
      { status: 500 }
    );
  }
}