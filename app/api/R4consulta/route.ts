import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase-client";

export async function POST(request: Request) {
  try {
    // 1. Validar el token de autorización (UUID) que envía el banco [cite: 136]
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.R4_COMMERCE_TOKEN || '';

    if (!authHeader || authHeader !== expectedToken) {
      console.warn("Acceso denegado: Token inválido en /R4consulta");
      return NextResponse.json({ status: false }, { status: 401 });
    }

    // 2. Extraer los datos del cuerpo de la petición enviada por R4 [cite: 140, 142]
    const body = await request.json();
    const { IdCliente, Monto } = body;

    // 3. Buscar en Supabase usando tu cliente importado
    const { data: pedido, error } = await supabase
      .from('Pedidos')
      .select('id, monto')
      .eq('cedula_cliente', IdCliente)
      .eq('estatus', 'pendiente')
      .limit(1);

    if (error || !pedido || pedido.length === 0) {
      console.log(`Consulta rechazada: No se encontró pedido para la cédula ${IdCliente}`);
      return NextResponse.json({ status: false });
    }

    console.log(`Consulta aprobada para la cédula ${IdCliente}`);
    return NextResponse.json({ status: true }); // [cite: 146]

  } catch (error) {
    console.error("Error en el webhook /R4consulta:", error);
    return NextResponse.json({ status: false }, { status: 500 });
  }
}