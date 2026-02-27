import { NextRequest, NextResponse } from "next/server";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  renderToStream,
  Image,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.1/fonts/Roboto/roboto-regular-webfont.ttf",
});
Font.register({
  family: "Roboto-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.1/fonts/Roboto/roboto-bold-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 9,
    fontFamily: "Roboto",
    color: "#333",
    position: 'relative',
  },
  
  contentContainer: {
    paddingVertical: 100, // Aumentado para más espacio en el encabezado
    paddingHorizontal: 80,
    height: '100%',
  },
  
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  logoSection: {
    width: "33.333%",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 125,
    height: 125,
  },
  titleSection: {
    width: "66.667%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  mainTitle: {
    fontSize: 24,
    fontFamily: "Roboto-Bold",
    textAlign: "right",
    marginBottom: 2,
  },
  subTitle: {
    fontSize: 18,
    textAlign: "right",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    textAlign: "right",
  },
  
  ticketsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    alignContent: "center",
  },
  ticketBox: {
    width: "18%",
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    marginBottom: "2%",
    marginRight: "2%",
  },
  ticketNumber: {
    fontSize: 18,
    fontFamily: "Roboto-Bold",
    color: "#4B5563",
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    objectFit: "cover",
  },
});

const MyDocument = ({ data }) => {
  const { nombreRifa, fechaJuego, cedula, boletos } = data;
  var fecha_formateada;
  if (!fechaJuego) {
    fecha_formateada = "---";
  } else {
    fecha_formateada = new Date(fechaJuego)
      .toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric"
      }).replace(/^(\d{2}) ([a-záéíóúñ]+) (\d{4})$/, " $1 de $2, $3");
  }  
  const boletosPorPagina = 20; // 5 columnas x 4 filas
  const paginasDeBoletos = [];
  for (let i = 0; i < boletos.length; i += boletosPorPagina) {
    paginasDeBoletos.push(boletos.slice(i, i + boletosPorPagina));
  }

  const numFilas = 4; // Fijo en 4 filas por página
  const pageHeight = 595;
  const contentPadding = 100 * 2; // Basado en el nuevo paddingVertical
  const headerHeight = 100;
  const ticketsGridMarginTop = 20;
  const rowMarginBottom = 15;
  const availableHeight = pageHeight - contentPadding - headerHeight - ticketsGridMarginTop;
  const rowHeight = (availableHeight - (rowMarginBottom * (numFilas - 1))) / numFilas;
  const ticketHeight = Math.max(40, rowHeight);

  return (
    <Document>
      {paginasDeBoletos.map((boletosDePagina, paginaIndex) => (
        <Page key={paginaIndex} size="A4" orientation="landscape" style={styles.page}>
          <View fixed style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Image src={"https://jasljnkyrqwbhjerqrus.supabase.co/storage/v1/object/public/imagenes_variadas/fondoCarta.png"} style={styles.backgroundImage} />
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <View style={styles.logoSection}>
                <Image src={"https://jasljnkyrqwbhjerqrus.supabase.co/storage/v1/object/public/imagenes_variadas/LogoganaConAutos33.png"} style={styles.logo} />
              </View>
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>GANA CON AUTOS 33</Text>
                <Text style={styles.subTitle}>{nombreRifa}</Text>
                <Text style={styles.dateText}>Fecha de juego: {fecha_formateada}</Text>
                <Text style={styles.dateText}>Cédula: {cedula}</Text>
              </View>
            </View>

            <View style={styles.ticketsGrid}>
              {boletosDePagina.map((numero, index) => (
                <View key={index} style={[styles.ticketBox, { height: ticketHeight }]}>
                  <Text style={styles.ticketNumber}>{numero}</Text>
                </View>
              ))}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export async function POST(request) {
  try {
    const data = await request.json();
    const stream = await renderToStream(<MyDocument data={data} />);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}