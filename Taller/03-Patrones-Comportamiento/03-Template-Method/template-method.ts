/**
 * ! Patrón Template Method
 *
 * 1. ¿Qué hace el patrón?
 * Define en una clase base el esqueleto de un algoritmo (los pasos y su orden)
 * y deja que las subclases cambien solo algunos pasos, sin alterar la
 * estructura general.
 *
 * 2. ¿Qué problema se está resolviendo?
 * La universidad genera reportes de notas (CSV), asistencia (HTML) y un resumen
 * en texto plano. Todos siguen los mismos pasos (obtener datos, procesarlos,
 * darles formato y entregarlos) y solo cambia el formato. Sin el patrón, cada
 * reporte copiaría el flujo completo.
 *
 * 3. ¿Por qué Template Method es adecuado para ese problema?
 * El flujo vive una sola vez en `generar()` y las subclases solo implementan
 * `formatear()`. Si el flujo cambia, se arregla en un solo lugar y todos los
 * reportes quedan actualizados.
 *
 * https://refactoring.guru/es/design-patterns/template-method
 */

import { COLORS } from "../../../helpers/colors.ts";

interface Registro {
  estudiante: string;
  nota: number;
  asistencias: number;
}

//* 1. Clase abstracta con el método plantilla
abstract class ReporteBase {
  // Método plantilla: el orden de los pasos es fijo y no se sobrescribe
  generar(): string {
    const datos = this.obtenerDatos();
    const procesados = this.procesar(datos);
    const encabezado = this.agregarEncabezado();
    const cuerpo = this.formatear(procesados);
    console.log("%c  4. Entregando reporte...", COLORS.gray);
    return encabezado + cuerpo;
  }

  //* 2. Pasos con implementación común
  protected obtenerDatos(): Registro[] {
    console.log("%c  1. Obteniendo datos...", COLORS.gray);
    return [
      { estudiante: "Laura Gómez", nota: 4.5, asistencias: 18 },
      { estudiante: "Carlos Pérez", nota: 2.8, asistencias: 12 },
      { estudiante: "Ana Torres", nota: 3.9, asistencias: 16 },
    ];
  }

  protected procesar(datos: Registro[]): Registro[] {
    console.log("%c  2. Procesando (ordenando por nombre)...", COLORS.gray);
    return [...datos].sort((a, b) => a.estudiante.localeCompare(b.estudiante));
  }

  //* 3. Paso abstracto: cada subclase lo implementa a su manera
  protected abstract formatear(datos: Registro[]): string;

  //* 4. Hook: opcional, por defecto no hace nada
  protected agregarEncabezado(): string {
    return "";
  }
}

//* 5. Reportes concretos
class ReporteNotasCSV extends ReporteBase {
  protected formatear(datos: Registro[]): string {
    console.log("%c  3. Formateando en CSV...", COLORS.gray);
    const filas = datos.map((d) => `${d.estudiante},${d.nota}`);
    return ["estudiante,nota", ...filas].join("\n");
  }
}

class ReporteAsistenciaHTML extends ReporteBase {
  protected formatear(datos: Registro[]): string {
    console.log("%c  3. Formateando en HTML...", COLORS.gray);
    const items = datos.map(
      (d) => `  <li>${d.estudiante}: ${d.asistencias} clases</li>`,
    );
    return `<ul>\n${items.join("\n")}\n</ul>`;
  }
}

class ReporteResumenTexto extends ReporteBase {
  protected formatear(datos: Registro[]): string {
    console.log("%c  3. Formateando en texto plano...", COLORS.gray);
    const promedio = datos.reduce((suma, d) => suma + d.nota, 0) / datos.length;
    return `Estudiantes: ${datos.length}\nPromedio de notas: ${
      promedio.toFixed(2)
    }`;
  }

  // Esta sí sobrescribe el hook
  protected override agregarEncabezado(): string {
    return "=== RESUMEN DEL CURSO ===\n";
  }
}

//* 6. Código cliente
function main(): void {
  const reportes: { titulo: string; reporte: ReporteBase }[] = [
    { titulo: "Notas (CSV)", reporte: new ReporteNotasCSV() },
    { titulo: "Asistencia (HTML)", reporte: new ReporteAsistenciaHTML() },
    { titulo: "Resumen (Texto)", reporte: new ReporteResumenTexto() },
  ];

  for (const { titulo, reporte } of reportes) {
    console.log(`\n%cGenerando reporte: ${titulo}`, COLORS.purple);
    console.log(`%c${reporte.generar()}`, COLORS.green);
  }
}

main();
