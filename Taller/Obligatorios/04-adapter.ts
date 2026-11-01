/**
 * ! Patrón Adapter
 *
 * 1. ¿Qué hace el patrón?
 * Permite que clases con interfaces incompatibles trabajen juntas mediante un
 * objeto adaptador que traduce las llamadas de una interfaz a otra.
 *
 * 2. ¿Qué problema se está resolviendo?
 * La aplicación genera certificados con un código QR y espera usar siempre la
 * interfaz `GeneradorQR`, pero las librerías externas tienen métodos y
 * parámetros distintos (`makeCode` y `render`) y no se pueden modificar.
 *
 * 3. ¿Por qué Adapter es adecuado para ese problema?
 * Cada adaptador envuelve una librería externa y traduce `generar(texto)` al
 * método propio de esa librería, de modo que la aplicación emite certificados
 * sin acoplarse a ninguna librería en particular.
 *
 * https://refactoring.guru/es/design-patterns/adapter
 */

import { COLORS } from "../../helpers/colors.ts";

//* 1. Interfaz objetivo (lo que la aplicación espera)
interface GeneradorQR {
  generar(texto: string): string;
}

//* 2. Librerías externas incompatibles (simuladas, no se pueden modificar)
class LibreriaQR {
  makeCode(data: string, opciones: { size: number; margen: number }): string {
    return `[QR ${opciones.size}px, margen ${opciones.margen}] ${data}`;
  }
}

class OtraLibreriaQR {
  render(contenido: string): string {
    return `<svg QR>${contenido}</svg>`;
  }
}

//* 3. Adaptadores
class AdaptadorLibreriaQR implements GeneradorQR {
  private libreria: LibreriaQR;
  private size: number;

  constructor(libreria: LibreriaQR, size: number = 200) {
    this.libreria = libreria;
    this.size = size;
  }

  generar(texto: string): string {
    return this.libreria.makeCode(texto, { size: this.size, margen: 2 });
  }
}

class AdaptadorOtraLibreriaQR implements GeneradorQR {
  private otraLibreria: OtraLibreriaQR;

  constructor(otraLibreria: OtraLibreriaQR) {
    this.otraLibreria = otraLibreria;
  }

  generar(texto: string): string {
    return this.otraLibreria.render(texto);
  }
}

//* 4. Código cliente (solo conoce la interfaz GeneradorQR)
function emitirCertificado(
  generador: GeneradorQR,
  participante: string,
  evento: string,
): void {
  const texto = `CERT|${evento}|${participante}`;
  const qr = generador.generar(texto);

  console.log(`Certificado de: %c${participante}`, COLORS.green);
  console.log(`  Evento: ${evento}`);
  console.log(`  QR:     ${qr}\n`);
}

function main(): void {
  const evento = "Congreso de Arquitectura de Software";

  console.log("%c1. Usando AdaptadorLibreriaQR:", COLORS.blue);
  const adaptador1: GeneradorQR = new AdaptadorLibreriaQR(new LibreriaQR());
  emitirCertificado(adaptador1, "Sebastián Morales", evento);

  console.log("%c2. Usando AdaptadorOtraLibreriaQR:", COLORS.purple);
  const adaptador2: GeneradorQR = new AdaptadorOtraLibreriaQR(
    new OtraLibreriaQR(),
  );
  emitirCertificado(adaptador2, "Valentina Ríos", evento);
}

main();
