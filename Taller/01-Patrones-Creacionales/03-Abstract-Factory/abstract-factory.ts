/**
 * ! Patrón Abstract Factory (Creacional)
 *
 * * ¿Qué hace el patrón?
 * Permite crear familias de objetos relacionados sin indicar sus clases
 * concretas. Una "fábrica" sabe crear todos los objetos de una misma familia,
 * y el resto del programa solo trabaja con las interfaces.
 *
 * * ¿Qué problema resolvemos?
 * Una tienda en línea envía pedidos con dos transportadoras: EnvíaYa y
 * RápidoExpress (nombres de ejemplo). Para cada envío se necesitan dos cosas
 * de la MISMA transportadora:
 *   1. Un cotizador, que calcula el precio según el peso.
 *   2. Una guía, que es el documento con el número de rastreo.
 * Si se mezclan (cotizar con una y generar la guía con la otra) el cliente paga
 * un precio y la guía sale con otra empresa. Además, si el código de la tienda
 * hace "new CotizadorEnviaYa()" en todas partes, agregar una tercera
 * transportadora obliga a cambiar muchos archivos.
 *
 * * ¿Por qué el Abstract Factory es adecuado?
 * - Cada transportadora tiene su propia fábrica que crea su cotizador y su guía,
 *   así que los dos objetos siempre son de la misma empresa.
 * - La función que despacha el pedido recibe una fábrica y no sabe cuál es:
 *   cambiar de transportadora es pasar otra fábrica.
 * - Agregar una transportadora nueva es crear una fábrica nueva, sin tocar el
 *   código que ya funciona.
 *
 * https://refactoring.guru/es/design-patterns/abstract-factory
 */

import { COLORS } from '../../../helpers/colors.ts';

// ---------- Productos abstractos (lo que la tienda necesita) ----------

interface Cotizador {
    cotizar(pesoKg: number, ciudad: string): number;
}

interface Guia {
    generar(destinatario: string, ciudad: string): string;
}

// ---------- Familia EnvíaYa ----------

class CotizadorEnviaYa implements Cotizador {
    cotizar(pesoKg: number, ciudad: string): number {
        // Tarifa fija + valor por kilo; a Bogotá cobra un recargo
        const recargo = ciudad === 'Bogotá' ? 3000 : 0;
        return 8000 + pesoKg * 1500 + recargo;
    }
}

class GuiaEnviaYa implements Guia {
    generar(destinatario: string, ciudad: string): string {
        const numero = Math.floor(Math.random() * 900000) + 100000;
        return `ENV-${numero} | ${destinatario} | ${ciudad}`;
    }
}

// ---------- Familia RápidoExpress ----------

class CotizadorRapidoExpress implements Cotizador {
    cotizar(pesoKg: number, _ciudad: string): number {
        // Cobra por rangos de peso, sin importar la ciudad
        if (pesoKg <= 2) return 12000;
        if (pesoKg <= 5) return 18000;
        return 25000;
    }
}

class GuiaRapidoExpress implements Guia {
    generar(destinatario: string, ciudad: string): string {
        const numero = Math.floor(Math.random() * 9000) + 1000;
        return `RX${numero}-COL | Para: ${destinatario} (${ciudad})`;
    }
}

// ---------- Fábrica abstracta y fábricas concretas ----------

/**
 * Cada transportadora debe saber crear su cotizador y su guía.
 */
interface TransportadoraFactory {
    nombre: string;
    crearCotizador(): Cotizador;
    crearGuia(): Guia;
}

class EnviaYaFactory implements TransportadoraFactory {
    nombre = 'EnvíaYa';
    crearCotizador(): Cotizador {
        return new CotizadorEnviaYa();
    }
    crearGuia(): Guia {
        return new GuiaEnviaYa();
    }
}

class RapidoExpressFactory implements TransportadoraFactory {
    nombre = 'RápidoExpress';
    crearCotizador(): Cotizador {
        return new CotizadorRapidoExpress();
    }
    crearGuia(): Guia {
        return new GuiaRapidoExpress();
    }
}

// ---------- Código cliente ----------

/**
 * Despacha un pedido. Solo conoce las interfaces: no sabe qué
 * transportadora es, y aun así el cotizador y la guía siempre coinciden.
 */
function despacharPedido(factory: TransportadoraFactory, destinatario: string, ciudad: string, pesoKg: number) {
    const cotizador = factory.crearCotizador();
    const guia = factory.crearGuia();

    console.log(`%cTransportadora: ${factory.nombre}`, COLORS.blue);
    console.log(`Costo del envío (${pesoKg} kg a ${ciudad}): $${cotizador.cotizar(pesoKg, ciudad)}`);
    console.log(`Guía: ${guia.generar(destinatario, ciudad)}\n`);
}

function main() {

    // El mismo pedido despachado con las dos transportadoras
    despacharPedido(new EnviaYaFactory(), 'Carlos Ruiz', 'Bogotá', 3);
    despacharPedido(new RapidoExpressFactory(), 'Carlos Ruiz', 'Bogotá', 3);

    // La transportadora se puede elegir en tiempo de ejecución
    const pesoPaquete = 7;
    const factory: TransportadoraFactory = pesoPaquete > 5
        ? new EnviaYaFactory()          // para paquetes pesados sale más barata
        : new RapidoExpressFactory();

    console.log('%cPaquete pesado: se elige la transportadora más barata', COLORS.green);
    despacharPedido(factory, 'María López', 'Tuluá', pesoPaquete);

}

main();