/**
 * ! Patrón Observer
 *
 * 1. ¿Qué hace el patrón?
 * Establece una relación de uno a muchos entre un objeto sujeto y varios
 * objetos observadores, para que cuando el sujeto cambie de estado notifique
 * automáticamente a todos los observadores suscritos.
 *
 * 2. ¿Qué problema se está resolviendo?
 * Cuando un docente publica una nota en un curso virtual, distintos módulos
 * (notificaciones, bienestar universitario, auditoría) deben reaccionar. Si el
 * curso llamara directamente a cada módulo quedaría acoplado a todos ellos.
 *
 * 3. ¿Por qué Observer es adecuado para ese problema?
 * El curso solo conoce la interfaz `Observer` y avisa a quienes estén suscritos.
 * Así se pueden agregar o quitar módulos en tiempo de ejecución sin modificar
 * el código de `CursoVirtual`.
 *
 * https://refactoring.guru/es/design-patterns/observer
 */

import { COLORS } from "../../helpers/colors.ts";

interface Nota {
  estudiante: string;
  materia: string;
  valor: number;
}

//* 1. Interfaz Observer
interface Observer {
  actualizar(nota: Nota): void;
}

//* 2. Sujeto: CursoVirtual
class CursoVirtual {
  private observadores: Observer[] = [];
  private nombre: string;

  constructor(nombre: string) {
    this.nombre = nombre;
  }

  suscribir(observer: Observer): void {
    this.observadores.push(observer);
    console.log(
      `Nuevo módulo suscrito al curso %c${this.nombre}`,
      COLORS.green,
    );
  }

  cancelar(observer: Observer): void {
    this.observadores = this.observadores.filter((obs) => obs !== observer);
    console.log(
      `Un módulo ha cancelado su suscripción en %c${this.nombre}`,
      COLORS.red,
    );
  }

  publicarNota(nota: Nota): void {
    console.log(
      `\nNota publicada en ${nota.materia}: %c${nota.estudiante} -> ${nota.valor}`,
      COLORS.blue,
    );

    for (const observer of this.observadores) {
      observer.actualizar(nota);
    }
  }
}

//* 3. Observadores concretos
class NotificadorEstudiante implements Observer {
  actualizar(nota: Nota): void {
    console.log(
      `%c[Notificador] %cHola ${nota.estudiante}, ya puedes consultar tu nota de ${nota.materia}: %c${nota.valor}`,
      COLORS.cyan,
      COLORS.white,
      COLORS.yellow,
    );
  }
}

class AlertaBienestar implements Observer {
  private umbral: number;

  constructor(umbral: number) {
    this.umbral = umbral;
  }

  actualizar(nota: Nota): void {
    if (nota.valor < this.umbral) {
      console.log(
        `%c[Bienestar] %cAlerta de riesgo académico para ${nota.estudiante} en ${nota.materia} (nota ${nota.valor} menor a ${this.umbral})`,
        COLORS.red,
        COLORS.yellow,
      );
    }
  }
}

class RegistroAuditoria implements Observer {
  private registros: Nota[] = [];

  actualizar(nota: Nota): void {
    this.registros.push(nota);
    console.log(
      `%c[Auditoría] %cNota registrada correctamente. Total de registros: %c${this.registros.length}`,
      COLORS.purple,
      COLORS.white,
      COLORS.green,
    );
  }
}

//* 4. Código cliente
function main(): void {
  const curso = new CursoVirtual("Arquitectura de Software");

  const notificador = new NotificadorEstudiante();
  const bienestar = new AlertaBienestar(3.0);
  const auditoria = new RegistroAuditoria();

  curso.suscribir(notificador);
  curso.suscribir(bienestar);
  curso.suscribir(auditoria);

  curso.publicarNota({
    estudiante: "Sebastián Morales",
    materia: "Arquitectura de Software",
    valor: 4.2,
  });

  curso.publicarNota({
    estudiante: "Carlos Pérez",
    materia: "Arquitectura de Software",
    valor: 2.1,
  });

  console.log("");
  curso.cancelar(auditoria);

  curso.publicarNota({
    estudiante: "Laura Gómez",
    materia: "Arquitectura de Software",
    valor: 3.8,
  });
}

main();
