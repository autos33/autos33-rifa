import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.R4_WEBHOOK_UUID_TOKEN || '';

    const body = await request.json();

    if (!authHeader || authHeader !== expectedToken) {
      return NextResponse.json({ abono: false }, { status: 401 });
    }
    
    const { Referencia, BancoEmisor, Monto, CodigoRed, TelefonoEmisor } = body;

    if (CodigoRed !== "00") {
      return NextResponse.json({ abono: false }); 
    }

    const referenciaCorta = Referencia.slice(-6); // Tomamos los últimos 6 dígitos de la referencia
    const bancoCorto = parseInt(BancoEmisor, 10).toString();

    // 1. GUARDAMOS EL PAGO EN EL BUZÓN (pagos_recibidos)
    await supabase.from('pagos_recibidos').upsert({
        referencia: Referencia,
        banco: bancoCorto,
        monto: parseFloat(Monto),
        telefono_emisor: TelefonoEmisor
    }, { onConflict: 'referencia, banco' });

    // 2. Intentamos ver si el usuario ya llenó el Paso 2 en el frontend
    const { data: pedido } = await supabase
      .from('Pedidos')
      .select('id, monto')
      .eq('referencia_bancaria', referenciaCorta)
      .eq('banco_emisor', bancoCorto)
      .eq('estatus', 'pendiente')
      .single();

    if (pedido) {
      // Si el pedido ya existe y el monto es correcto, lo actualizamos
      if (parseFloat(Monto) >= parseFloat(pedido.monto)) {
          await supabase.from('Pedidos').update({ estatus: 'pagado', fecha_pago: new Date().toISOString() }).eq('id', pedido.id);
      } else {
        await supabase.from('Pedidos').update({ estatus: 'rechazado' }).eq('id', pedido.id);
      }
    }

    // SIEMPRE respondemos true al banco para confirmarles que retuvimos su notificación
    return NextResponse.json({ abono: true }); 

  } catch (error) {
    console.error("Error en el webhook /R4notifica:", error);
    return NextResponse.json({ abono: false }, { status: 500 });
  }
}