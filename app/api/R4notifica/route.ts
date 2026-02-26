import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.R4_WEBHOOK_UUID_TOKEN || '';

    if (!authHeader || authHeader !== expectedToken) {
      console.warn("Acceso denegado: Token inválido en /R4notifica");
      return NextResponse.json({ abono: false }, { status: 401 });
    }

    const body = await request.json();    
    const { Referencia, BancoEmisor, Monto, CodigoRed, TelefonoEmisor } = body;
    const referenciaCorta = Referencia.slice(-6); // últimos 6 digitos de  referencia bancaria
    const bancoCorto = parseInt(BancoEmisor, 10).toString();

    // 1. Verificar si la red interbancaria rechazó el pago
    if (CodigoRed !== "00") {
      const { data: p } = await supabase
      .from('Pedidos')
      .select('id')
      .eq('referencia_bancaria', referenciaCorta)
      .eq('estatus', 'pendiente')
      .single();
      if (p) await supabase.from('Pedidos').update({ estatus: 'rechazado' }).eq('id', p.id);
      
      return NextResponse.json({ abono: false }); 
    }

    // 2. Verificación de Referencia y Banco
    const { data: pedidoPendiente, error: fetchError } = await supabase
      .from('Pedidos')
      .select('id, monto')
      .eq('referencia_bancaria', referenciaCorta)
      .eq('banco_emisor', bancoCorto)
      .eq('estatus', 'pendiente')
      .single();

    if (fetchError || !pedidoPendiente) {
      console.warn(`Notificación rechazada: Ref ${Referencia} del banco ${BancoEmisor} no encontrada ${referenciaCorta} ${bancoCorto}.`);
      console.log(`Detalles del error:`, fetchError);
      //await supabase.from('Pedidos').update({ estatus: 'rechazado' }).eq('id', pedidoPendiente.id);
      return NextResponse.json({ abono: false }); 
    }

    // 3. Verificar si el cliente transfirió menos dinero del que debía
    if (parseFloat(Monto) < parseFloat(pedidoPendiente.monto)) {
      console.warn(`Notificación rechazada: Monto insuficiente para Referencia ${Referencia}.`);
      await supabase.from('Pedidos').update({ estatus: 'rechazado' }).eq('id', pedidoPendiente.id);
      return NextResponse.json({ abono: false }); 
    }

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
    return NextResponse.json({ abono: true }); 

  } catch (error) {
    console.error("Error en el webhook /R4notifica:", error);
    return NextResponse.json({ abono: false }, { status: 500 });
  }
}