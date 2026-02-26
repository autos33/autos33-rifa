import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    // 1. Validar el token de autorización [cite: 187]
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.R4_WEBHOOK_UUID_TOKEN || '';

    if (!authHeader || authHeader !== expectedToken) {
      console.warn("Acceso denegado: Token inválido en /R4notifica");
      return NextResponse.json({ abono: false }, { status: 401 });
    }

    // 2. Extraer los datos de la notificación [cite: 203-211]
    const body = await request.json();
    const { Referencia, BancoEmisor, Monto, CodigoRed, TelefonoEmisor } = body;

    // 3. Validar el estado de la red interbancaria [cite: 228, 229]
    if (CodigoRed !== "00") {
      console.log(`Transacción fallida en red. Código: ${CodigoRed}`);
      return NextResponse.json({ abono: false }); // [cite: 217]
    }

    // 4. Verificación de Referencia y Banco [cite: 184]
    const { data: pedidoPendiente, error: fetchError } = await supabase
      .from('Pedidos')
      .select('id, monto')
      .eq('referencia_bancaria', Referencia)
      .eq('banco_emisor', BancoEmisor)
      .eq('estatus', 'pendiente')
      .single();

    if (fetchError || !pedidoPendiente) {
      console.warn(`Notificación rechazada: Referencia ${Referencia} no encontrada o ya procesada.`);
      return NextResponse.json({ abono: false }); // [cite: 217]
    }

    if (parseFloat(Monto) < parseFloat(pedidoPendiente.monto)) {
        console.warn(`Notificación rechazada: Monto insuficiente para Referencia ${Referencia}.`);
       return NextResponse.json({ abono: false }); // [cite: 217]
    }

    // 5. Actualizar el pedido a 'pagado'
    const { error: updateError } = await supabase
      .from('Pedidos')
      .update({ 
        estatus: 'pagado',
        fecha_pago: new Date().toISOString()
      })
      .eq('id', pedidoPendiente.id);

    if (updateError) {
      console.error("Error actualizando en Supabase:", updateError);
      return NextResponse.json({ abono: false }, { status: 500 });
    }

    console.log(`Pago procesado exitosamente. Referencia: ${Referencia}`);
    return NextResponse.json({ abono: true }); // [cite: 213]

  } catch (error) {
    console.error("Error en el webhook /R4notifica:", error);
    return NextResponse.json({ abono: false }, { status: 500 });
  }
}