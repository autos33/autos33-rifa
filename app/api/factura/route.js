import { NextRequest, NextResponse } from "next/server";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  renderToStream,
  Font,
} from "@react-pdf/renderer";
/*
// Registro de fuentes para asegurar una correcta renderización del texto
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.1/fonts/Roboto/roboto-regular-webfont.ttf",
});
Font.register({
  family: "Roboto-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.1/fonts/Roboto/roboto-bold-webfont.ttf",
});
*/
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    // fontfamily: "Roboto",
    color: "#000",
  },
  // --- Encabezado ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  issuerSection: {
    width: "50%",
    flexDirection: "column",
  },
  issuerName: {
    fontSize: 14,
    // fontfamily: "Roboto-Bold",
    marginBottom: 4,
  },
  invoiceSection: {
    width: "50%",
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 20,
    // fontfamily: "Roboto-Bold",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  boldText: {
    // fontfamily: "Roboto-Bold",
    fontWeight: "bold",
  },
  // --- Datos del Cliente ---
  clientContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 3,
  },
  col: {
    flexDirection: "column",
  },
  // --- Tabla de Artículos ---
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#e4e4e4",
    // fontfamily: "Roboto-Bold",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  // Anchos de columnas
  colCodigo: { width: "15%" },
  colCant: { width: "10%", textAlign: "center" },
  colDesc: { width: "45%" },
  colPrecio: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },
  
  // --- Totales ---
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  totalsBox: {
    width: "40%",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  // --- Pie de página (Imprenta Digital) ---
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    fontSize: 8,
    textAlign: "center",
    color: "#555",
  },
});

const InvoiceDocument = ({ data }) => {
  const { emisor, factura, cliente, articulos, totales, imprenta } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* ENCABEZADO: Datos del Emisor y Controles Fiscales */}
        <View style={styles.headerContainer}>
          <View style={styles.issuerSection}>
            <Text style={styles.issuerName}>{emisor.razonSocial}</Text>
            <Text>RIF: {emisor.rif}</Text>
            <Text>Domicilio Fiscal: {emisor.domicilio}</Text>
          </View>
          
          <View style={styles.invoiceSection}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text><Text style={styles.boldText}>Nº de Factura:</Text> {factura.numero}</Text>
            <Text><Text style={styles.boldText}>Nº de Control:</Text> {factura.control}</Text>
            <Text>Control asignado: desde el Nº {factura.rangoDesde} hasta el N° {factura.rangoHasta}</Text>
            <Text>Fecha asig. control: {factura.fechaAsignacion}</Text>
            <Text>Fecha de emisión: {factura.fechaEmision}</Text>
            <Text>Hora de emisión: {factura.horaEmision}</Text>
          </View>
        </View>

        {/* DATOS DEL CLIENTE */}
        <View style={styles.clientContainer}>
          <Text style={[styles.boldText, { marginBottom: 5 }]}>Datos del Adquiriente:</Text>
          <Text>Razón Social / Nombre: {cliente.nombre}</Text>
          <Text>RIF / C.I / Pasaporte: {cliente.identificacion}</Text>
          <Text>Domicilio Fiscal: {cliente.domicilio}</Text>
        </View>

        {/* DETALLES DE LA TRANSACCIÓN (Tabla) */}
        <View style={styles.table}>
          {/* Cabecera de tabla */}
          <View style={styles.tableRowHeader}>
            <View style={[styles.tableCol, styles.colCodigo]}><Text>Código</Text></View>
            <View style={[styles.tableCol, styles.colCant]}><Text>Cant.</Text></View>
            <View style={[styles.tableCol, styles.colDesc]}><Text>Descripción</Text></View>
            <View style={[styles.tableCol, styles.colPrecio]}><Text>Precio Unit.</Text></View>
            <View style={[styles.tableCol, styles.colTotal]}><Text>Total</Text></View>
          </View>
          
          {/* Filas de artículos */}
          {articulos.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={[styles.tableCol, styles.colCodigo]}>
                <Text>{item.codigo}</Text>
              </View>
              <View style={[styles.tableCol, styles.colCant]}>
                <Text>{item.cantidad}</Text>
              </View>
              <View style={[styles.tableCol, styles.colDesc]}>
                {/* Si es exento, se coloca la (E) como manda la providencia */}
                <Text>{item.descripcion} {item.exento ? "(E)" : ""}</Text>
              </View>
              <View style={[styles.tableCol, styles.colPrecio]}>
                <Text>{item.precioUnitario.toFixed(2)}</Text>
              </View>
              <View style={[styles.tableCol, styles.colTotal]}>
                <Text>{(item.precioUnitario * item.cantidad).toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CÁLCULOS Y TOTALES */}
        <View style={styles.totalsContainer} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Monto Exento/Exonerado:</Text>
              <Text>{totales.montoExento.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Base Imponible ({totales.porcentajeIva}%):</Text>
              <Text>{totales.baseImponible.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Impuesto IVA:</Text>
              <Text>{totales.iva.toFixed(2)}</Text>
            </View>
            <View style={[styles.totalRow, styles.boldText, { marginTop: 5, borderTopWidth: 1, paddingTop: 5 }]}>
              <Text>VALOR TOTAL:</Text>
              <Text>{totales.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* PROVEEDOR TECNOLÓGICO (Imprenta Digital) */}
        <View style={styles.footer} fixed>
          <Text style={styles.boldText}>Proveedor Tecnológico / Imprenta Digital Autorizada:</Text>
          <Text>{imprenta.razonSocial} | RIF: {imprenta.rif}</Text>
          <Text>Providencia Administrativa: {imprenta.nomenclatura} de fecha {imprenta.fechaProvidencia}</Text>
        </View>
      </Page>
    </Document>
  );
};

export async function POST(request) {
  try {
    const data = await request.json();
    const stream = await renderToStream(<InvoiceDocument data={data} />);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
        // Descomenta la siguiente línea si deseas que el navegador fuerce la descarga del PDF en lugar de visualizarlo
        // "Content-Disposition": 'attachment; filename="factura_fiscal.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al generar la factura" },
      { status: 500 }
    );
  }
}

/* =====================================================================
   REQUERIMIENTOS DEL FRONTEND (PAYLOAD ESPERADO EN EL POST)
   =====================================================================
   El frontend debe hacer una petición POST a esta ruta enviando el 
   siguiente objeto JSON. Nota los formatos estrictos requeridos por SENIAT:
   
   {
     "emisor": {
       "razonSocial": "Mi Empresa C.A.",
       "rif": "J-12345678-9",
       "domicilio": "Av. Principal, Edif. Centro, Local 1, Caracas."
     },
     "factura": {
       "numero": "00001542",
       "control": "00-000542",
       "rangoDesde": "00-000001",
       "rangoHasta": "00-100000",
       "fechaAsignacion": "15102024", // Formato estricto: DDMMAAAA (8 dígitos)
       "fechaEmision": "24032026",    // Formato estricto: DDMMAAAA (8 dígitos)
       "horaEmision": "14.30.00 p.m." // Formato estricto: HH.MM.SS a.m./p.m.
     },
     "cliente": {
       "nombre": "Juan Pérez",
       "identificacion": "V-12345678", // RIF, Cédula o Pasaporte
       "domicilio": "Calle los Cedros, Casa 4."
     },
     "articulos": [
       {
         "codigo": "ART-001",
         "cantidad": 2,
         "descripcion": "Repuesto de Motor",
         "precioUnitario": 50.00,
         "exento": false // Si es true, el sistema agregará automáticamente la "(E)"
       },
       {
         "codigo": "SRV-002",
         "cantidad": 1,
         "descripcion": "Mano de obra",
         "precioUnitario": 20.00,
         "exento": true
       }
     ],
     "totales": {
       "montoExento": 20.00,
       "baseImponible": 100.00,
       "porcentajeIva": 16,
       "iva": 16.00,
       "total": 136.00
     },
     "imprenta": {
       "razonSocial": "Imprenta Digital Venezolana C.A.",
       "rif": "J-98765432-1",
       "nomenclatura": "SNAT/2024/000XXX",
       "fechaProvidencia": "18 de Octubre de 2024"
     }
   }
   ===================================================================== */