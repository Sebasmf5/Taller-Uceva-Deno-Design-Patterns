/**
 * ! Patrón Strategy
 *
 * 1. ¿Qué hace el patrón?
 * Define una familia de algoritmos, mete cada uno en su propia clase y los
 * vuelve intercambiables. El objeto que los usa solo conoce una interfaz y
 * puede cambiar de algoritmo mientras el programa está corriendo.
 *
 * 2. ¿Qué problema se está resolviendo?
 * La cafetería de la universidad calcula el total de una cuenta con distintos
 * descuentos (ninguno, estudiante, docente o bono promocional). Sin el patrón,
 * la clase de la cuenta tendría un if/else gigante que crece con cada descuento
 * nuevo.
 *
 * 3. ¿Por qué Strategy es adecuado para ese problema?
 * Cada descuento queda aislado en su clase y `CuentaCafeteria` solo llama a
 * `calcular()`. Para agregar otro descuento basta con crear una clase nueva
 * que implemente `EstrategiaDescuento`, sin tocar la cuenta.
 *
 * https://refactoring.guru/es/design-patterns/strategy
 */

import { COLORS } from "../../../helpers/colors.ts";

interface Producto {
  nombre: string;
  precio: number;
}

//* 1. Interfaz Estrategia
interface EstrategiaDescuento {
  nombre: string;
  calcular(subtotal: number): number;
}

//* 3. Estrategias concretas
class SinDescuento implements EstrategiaDescuento {
  nombre = "Sin descuento";

  calcular(subtotal: number): number {
    return subtotal;
  }
}

class DescuentoEstudiante implements EstrategiaDescuento {
  nombre = "Descuento estudiante (10%)";

  calcular(subtotal: number): number {
    return subtotal * 0.9;
  }
}

class DescuentoDocente implements EstrategiaDescuento {
  nombre = "Descuento docente (15%)";

  calcular(subtotal: number): number {
    return subtotal * 0.85;
  }
}

class BonoPromocional implements EstrategiaDescuento {
  nombre: string;
  private valorBono: number;

  constructor(valorBono: number) {
    this.valorBono = valorBono;
    this.nombre = `Bono promocional ($${valorBono})`;
  }

  calcular(subtotal: number): number {
    // El total nunca puede quedar en negativo
    return Math.max(0, subtotal - this.valorBono);
  }
}

//* 2. Contexto: CuentaCafeteria
class CuentaCafeteria {
  private productos: Producto[] = [];
  private estrategia: EstrategiaDescuento;

  constructor(estrategia: EstrategiaDescuento) {
    this.estrategia = estrategia;
  }

  agregar(producto: Producto): void {
    this.productos.push(producto);
  }

  // Aquí se cambia el descuento en tiempo de ejecución
  setEstrategia(estrategia: EstrategiaDescuento): void {
    this.estrategia = estrategia;
    console.log(`Estrategia cambiada a: %c${estrategia.nombre}`, COLORS.yellow);
  }

  subtotal(): number {
    return this.productos.reduce((suma, p) => suma + p.precio, 0);
  }

  total(): number {
    return this.estrategia.calcular(this.subtotal());
  }

  mostrar(): void {
    console.log(
      `%c[${this.estrategia.nombre}] %cSubtotal: $${this.subtotal()} -> Total: %c$${this.total()}`,
      COLORS.cyan,
      COLORS.white,
      COLORS.green,
    );
  }
}

//* 4. Código cliente
function main(): void {
  const cuenta = new CuentaCafeteria(new SinDescuento());
  cuenta.agregar({ nombre: "Tinto", precio: 2000 });
  cuenta.agregar({ nombre: "Empanada", precio: 3500 });
  cuenta.agregar({ nombre: "Sándwich", precio: 7500 });

  console.log("%c--- La misma cuenta con cada estrategia ---", COLORS.purple);
  const estrategias: EstrategiaDescuento[] = [
    new SinDescuento(),
    new DescuentoEstudiante(),
    new DescuentoDocente(),
    new BonoPromocional(5000),
  ];

  for (const estrategia of estrategias) {
    cuenta.setEstrategia(estrategia);
    cuenta.mostrar();
  }

  console.log("\n%c--- Cambio en caliente ---", COLORS.purple);
  cuenta.setEstrategia(new DescuentoEstudiante());
  cuenta.mostrar();
  cuenta.setEstrategia(new BonoPromocional(50000));
  cuenta.mostrar();
}

main();
