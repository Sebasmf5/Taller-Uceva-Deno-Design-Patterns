/**
 * ! Patrón Adapter (Adaptador / Wrapper):
 *
 * 1. ¿Qué hace el patrón?
 * Es un patrón de diseño estructural que permite la colaboración entre objetos
 * con interfaces incompatibles. Actúa como un intermediario (envoltorio) que
 * recibe las llamadas dirigidas a una interfaz estándar esperada por el sistema
 * y las traduce al formato, firma y parámetros que requiere una clase o librería
 * externa.
 *
 * 2. ¿Qué problema se está resolviendo?
 * Una aplicación universitaria emite certificados de participación que incluyen
 * un código QR de verificación. La lógica de negocio del sistema espera trabajar
 * siempre con una interfaz uniforme (`GeneradorQR` con el método `generar(texto)`).
 * Sin embargo, las librerías externas disponibles para generar códigos QR tienen
 * métodos y parámetros completamente distintos (`makeCode(data, opciones)` vs.
 * `render(contenido)`) y su código fuente no se puede modificar. Si la aplicación
 * invocara directamente estas librerías, quedaría fuertemente acoplada a ellas y
 * cualquier cambio de proveedor obligaría a modificar la lógica de emisión de
 * certificados.
 *
 * 3. ¿Por qué Adapter es adecuado para ese problema?
 * - Desacopla por completo la lógica de negocio (`emitirCertificado`) de la
 *   implementación concreta de las librerías externas de terceros.
 * - Cumple con el Principio de Responsabilidad Única (SRP), separando la lógica
 *   de conversión de datos de la lógica principal de la aplicación.
 * - Cumple con el Principio Abierto/Cerrado (OCP), permitiendo integrar nuevas
 *   librerías de QR en el futuro creando nuevos adaptadores sin modificar una
 *   sola línea del código cliente ni de las librerías externas.
 */

const COLORS = {
    blue: 'color: blue',
    green: 'color: green',
    purple: 'color: purple',
    yellow: 'color: yellow',
    cyan: 'color: cyan',
};

//* 1. Interfaz Objetivo (Target): lo que la aplicación espera utilizar
interface GeneradorQR {
    generar(texto: string): string;
}

//* 2. Librerías Externas Incompatibles (Adaptees): simuladas, no se pueden modificar
class LibreriaQR {
    makeCode(data: string, opciones: { size: number; margen: number }): string {
        return `[QR ${opciones.size}px | margen ${opciones.margen}] ${data}`;
    }
}

class OtraLibreriaQR {
    render(contenido: string): string {
        return `<svg QR>${contenido}</svg>`;
    }
}

//* 3. Clases Adaptadoras (Adapters): traducen la interfaz objetivo a cada librería

// Adaptador para LibreriaQR
class AdaptadorLibreriaQR implements GeneradorQR {
    private libreria: LibreriaQR;
    private size: number;
    private margen: number;

    constructor(libreria: LibreriaQR, size: number = 200, margen: number = 2) {
        this.libreria = libreria;
        this.size = size;
        this.margen = margen;
    }

    generar(texto: string): string {
        return this.libreria.makeCode(texto, {
            size: this.size,
            margen: this.margen,
        });
    }
}

// Adaptador para OtraLibreriaQR
class AdaptadorOtraLibreriaQR implements GeneradorQR {
    private otraLibreria: OtraLibreriaQR;

    constructor(otraLibreria: OtraLibreriaQR) {
        this.otraLibreria = otraLibreria;
    }

    generar(texto: string): string {
        return this.otraLibreria.render(texto);
    }
}

//* 4. Código Cliente: conoce ÚNICAMENTE la interfaz GeneradorQR
function emitirCertificado(
    generador: GeneradorQR,
    participante: string,
    evento: string,
): void {
    const payloadVerificacion = `CERT|${evento}|${participante}`;
    const codigoQR = generador.generar(payloadVerificacion);

    console.log(`%c====================================================`, COLORS.cyan);
    console.log(`%c       CERTIFICADO DE PARTICIPACIÓN - UCEVA         `, COLORS.green);
    console.log(`%c====================================================`, COLORS.cyan);
    console.log(`  Participante : ${participante}`);
    console.log(`  Evento       : ${evento}`);
    console.log(`  Código QR    : ${codigoQR}`);
    console.log(`%c====================================================\n`, COLORS.cyan);
}

function main() {
    const evento = 'Congreso de Arquitectura de Software 2026';

    // Uso con la primera librería externa mediante su adaptador (tamaño 200 por defecto)
    console.log('%c1. Emitiendo certificado con AdaptadorLibreriaQR:', COLORS.blue);
    const libreriaExterna1 = new LibreriaQR();
    const adaptadorQR1: GeneradorQR = new AdaptadorLibreriaQR(libreriaExterna1);

    emitirCertificado(adaptadorQR1, 'Sebastián Morales', evento);

    // Uso con la segunda librería externa mediante su adaptador
    // La función emitirCertificado no sufre ningún cambio
    console.log('%c2. Emitiendo certificado con AdaptadorOtraLibreriaQR:', COLORS.purple);
    const libreriaExterna2 = new OtraLibreriaQR();
    const adaptadorQR2: GeneradorQR = new AdaptadorOtraLibreriaQR(libreriaExterna2);

    emitirCertificado(adaptadorQR2, 'Valentina Ríos', evento);
}

main();
