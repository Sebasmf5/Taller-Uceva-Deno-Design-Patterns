/**
 * ! Patrón Flyweight
 *
 * 1. ¿Qué hace el patrón?
 * Es un patrón de diseño estructural que nos permite usar objetos compartidos
 * para soportar eficientemente grandes cantidades de objetos, compartiendo la
 * parte de su estado que se repite (estado intrínseco) para no guardar la misma
 * información en cada instancia.
 *
 * 2. ¿Qué problema se está resolviendo?
 * Un coliseo tiene 20.000 asientos (100 filas × 200 asientos) en 3 zonas:
 * VIP, Preferencial y General. Los asientos de una misma zona repiten zona,
 * precio, símbolo, servicios y descripción. Guardar esos datos en cada asiento
 * implica 20.000 copias en memoria de solo 3 configuraciones.
 *
 * 3. ¿Por qué Flyweight es adecuado para ese problema?
 * Los datos repetidos quedan en 3 objetos `TipoAsiento` que la fábrica crea una
 * sola vez y reutiliza. Cada `Asiento` guarda únicamente su estado extrínseco
 * (fila, número y si está ocupado) junto con la referencia a su `TipoAsiento`.
 *
 * https://refactoring.guru/es/design-patterns/flyweight
 */

import { COLORS } from "../../helpers/colors.ts";

type ZonaColiseo = "VIP" | "Preferencial" | "General";

// 1. Flyweight: TipoAsiento (estado intrínseco, compartido e inmutable)
class TipoAsiento {
  readonly zona: ZonaColiseo;
  readonly precio: number;
  readonly simbolo: string;
  readonly servicios: readonly string[];
  readonly descripcion: string;

  constructor(
    zona: ZonaColiseo,
    precio: number,
    simbolo: string,
    servicios: string[],
    descripcion: string,
  ) {
    this.zona = zona;
    this.precio = precio;
    this.simbolo = simbolo;
    this.servicios = [...servicios];
    this.descripcion = descripcion;
  }

  describir(fila: number, numero: number, ocupado: boolean): string {
    const estado = ocupado ? "ocupado" : "disponible";
    const precio = `$${this.precio.toLocaleString("es-CO")}`;
    return `Fila ${fila}, asiento ${numero} | ${this.zona} (${this.descripcion}) | ${precio} | ${estado} | ${
      this.servicios.join(", ")
    }`;
  }
}

// 2. Fábrica de Flyweights: FabricaTipoAsiento
class FabricaTipoAsiento {
  private tipos: Map<ZonaColiseo, TipoAsiento> = new Map();

  obtenerTipo(zona: ZonaColiseo): TipoAsiento {
    let tipo = this.tipos.get(zona);

    if (!tipo) {
      console.log(
        `%cCreando una instancia de TipoAsiento: ${zona}`,
        COLORS.red,
      );

      if (zona === "VIP") {
        tipo = new TipoAsiento(
          "VIP",
          180000,
          "🟨",
          ["Silla acolchada", "Ingreso exclusivo", "Refrigerio"],
          "Frente al escenario",
        );
      } else if (zona === "Preferencial") {
        tipo = new TipoAsiento(
          "Preferencial",
          90000,
          "🟦",
          ["Silla numerada", "Ingreso preferencial"],
          "Platea central",
        );
      } else {
        tipo = new TipoAsiento(
          "General",
          40000,
          "🟩",
          ["Gradería numerada"],
          "Graderías superiores y laterales",
        );
      }

      this.tipos.set(zona, tipo);
    }

    return tipo;
  }

  totalTipos(): number {
    return this.tipos.size;
  }
}

// 3. Contexto: Asiento (estado extrínseco)
class Asiento {
  readonly fila: number;
  readonly numero: number;
  readonly ocupado: boolean;
  readonly tipo: TipoAsiento;

  constructor(
    fila: number,
    numero: number,
    ocupado: boolean,
    tipo: TipoAsiento,
  ) {
    this.fila = fila;
    this.numero = numero;
    this.ocupado = ocupado;
    this.tipo = tipo;
  }

  simbolo(): string {
    return this.ocupado ? "⬛" : this.tipo.simbolo;
  }

  describir(): string {
    return this.tipo.describir(this.fila, this.numero, this.ocupado);
  }
}

// 4. Versión sin patrón, solo para comparar la memoria: AsientoSinFlyweight
class AsientoSinFlyweight {
  readonly fila: number;
  readonly numero: number;
  readonly ocupado: boolean;
  readonly zona: string;
  readonly precio: number;
  readonly simbolo: string;
  readonly servicios: string[];
  readonly descripcion: string;

  constructor(
    fila: number,
    numero: number,
    ocupado: boolean,
    zona: ZonaColiseo,
  ) {
    this.fila = fila;
    this.numero = numero;
    this.ocupado = ocupado;
    this.zona = copiar(zona);

    if (zona === "VIP") {
      this.precio = 180000;
      this.simbolo = copiar("🟨");
      this.servicios = [
        "Silla acolchada",
        "Ingreso exclusivo",
        "Refrigerio",
      ].map(copiar);
      this.descripcion = copiar("Frente al escenario");
    } else if (zona === "Preferencial") {
      this.precio = 90000;
      this.simbolo = copiar("🟦");
      this.servicios = ["Silla numerada", "Ingreso preferencial"].map(copiar);
      this.descripcion = copiar("Platea central");
    } else {
      this.precio = 40000;
      this.simbolo = copiar("🟩");
      this.servicios = ["Gradería numerada"].map(copiar);
      this.descripcion = copiar("Graderías superiores y laterales");
    }
  }
}

function copiar(texto: string): string {
  return texto.split("").join("");
}

function zonaDeFila(fila: number): ZonaColiseo {
  if (fila <= 3) return "VIP";
  if (fila <= 30) return "Preferencial";
  return "General";
}

function estaOcupado(fila: number, numero: number): boolean {
  return (fila * 31 + numero * 17) % 5 === 0;
}

function memoriaEnUso(): number {
  (globalThis as { gc?: () => void }).gc?.();
  return Deno.memoryUsage().heapUsed;
}

function aMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function imprimirMapa(mapa: Asiento[][], columnas: number): void {
  console.log("                       ESCENARIO");
  console.log("🟨 VIP | 🟦 Preferencial | 🟩 General | ⬛ Ocupado\n");

  const imprimirFila = (indice: number) => {
    const numeroFila = String(indice + 1).padStart(3, " ");
    const asientos = mapa[indice]
      .slice(0, columnas)
      .map((a) => a.simbolo())
      .join("");
    console.log(`Fila ${numeroFila}: ${asientos}`);
  };

  for (let i = 0; i < 5; i++) imprimirFila(i);
  console.log("   ...");
  for (let i = 28; i < 32; i++) imprimirFila(i);
}

// 5. Código Cliente para probar el Flyweight
function main() {
  const FILAS = 100;
  const ASIENTOS_POR_FILA = 200;

  // 1. Crear los 20.000 asientos usando la fábrica
  const memoriaInicial = memoriaEnUso();
  const fabrica = new FabricaTipoAsiento();
  const mapa: Asiento[][] = [];

  for (let fila = 1; fila <= FILAS; fila++) {
    const tipo = fabrica.obtenerTipo(zonaDeFila(fila));
    const filaAsientos: Asiento[] = [];

    for (let numero = 1; numero <= ASIENTOS_POR_FILA; numero++) {
      filaAsientos.push(
        new Asiento(fila, numero, estaOcupado(fila, numero), tipo),
      );
    }

    mapa.push(filaAsientos);
  }

  const asientos = mapa.flat();
  const memoriaConFlyweight = memoriaEnUso() - memoriaInicial;

  // 2. Imprimir fragmento del mapa en consola
  console.log(
    "\n%c1. Mapa del coliseo (primeros 30 asientos de cada fila):\n",
    COLORS.blue,
  );
  imprimirMapa(mapa, 30);

  // 3. Consultar e imprimir dos asientos con describir()
  console.log("\n%c2. Consulta de dos asientos:", COLORS.green);
  console.log(" ", mapa[0][0].describir());
  console.log(" ", mapa[9][4].describir());

  // 4. Construir los 20.000 asientos SIN Flyweight y comparar
  const memoriaAntes = memoriaEnUso();
  const sinPatron: AsientoSinFlyweight[] = [];

  for (let fila = 1; fila <= FILAS; fila++) {
    const zona = zonaDeFila(fila);
    for (let numero = 1; numero <= ASIENTOS_POR_FILA; numero++) {
      sinPatron.push(
        new AsientoSinFlyweight(fila, numero, estaOcupado(fila, numero), zona),
      );
    }
  }

  const memoriaSinFlyweight = memoriaEnUso() - memoriaAntes;

  console.log("\n%c3. Comparación con y sin Flyweight:", COLORS.yellow);
  console.log(`  Asientos creados: ${asientos.length.toLocaleString("es-CO")}`);
  console.log(`  Objetos TipoAsiento con Flyweight: ${fabrica.totalTipos()}`);
  console.log(
    `  Copias de datos sin Flyweight: ${
      sinPatron.length.toLocaleString("es-CO")
    }`,
  );
  console.log(`  Memoria aprox. con Flyweight: ${aMB(memoriaConFlyweight)}`);
  console.log(`  Memoria aprox. sin Flyweight: ${aMB(memoriaSinFlyweight)}`);

  if (memoriaSinFlyweight > memoriaConFlyweight) {
    const ahorro =
      ((memoriaSinFlyweight - memoriaConFlyweight) / memoriaSinFlyweight) * 100;
    console.log(
      `  %cAhorro aproximado: ${ahorro.toFixed(1)}%\n`,
      COLORS.green,
    );
  }
}

main();
