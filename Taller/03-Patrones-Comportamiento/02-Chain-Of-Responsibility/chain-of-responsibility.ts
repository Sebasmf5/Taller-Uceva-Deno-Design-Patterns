/**
 * ! Patrón Chain of Responsibility
 *
 * 1. ¿Qué hace el patrón?
 * Pasa una solicitud por una cadena de manejadores. Cada uno decide si la
 * procesa y la deja seguir al siguiente, o si la corta ahí mismo.
 *
 * 2. ¿Qué problema se está resolviendo?
 * Para prestar una sala de estudio en la biblioteca, la solicitud debe pasar
 * varias validaciones en orden y parar en la primera que falle. Si el que
 * solicita llamara cada validación por su cuenta, repetiría lógica y el orden
 * de los pasos quedaría regado por todo el código.
 *
 * 3. ¿Por qué Chain of Responsibility es adecuado para ese problema?
 * Cada validación vive en su propio manejador y el orden se define una sola
 * vez al armar la cadena. Si una falla, las demás ni se ejecutan. Agregar o
 * quitar una validación no afecta a las otras.
 *
 * https://refactoring.guru/es/design-patterns/chain-of-responsibility
 */

import { COLORS } from "../../../helpers/colors.ts";

interface Solicitud {
  codigo: string;
  sala: string;
  horaInicio: number;
  horaFin: number;
}

interface Resultado {
  aprobada: boolean;
  motivo: string;
}

//* 1. Manejador base
abstract class ManejadorSolicitud {
  private proximo: ManejadorSolicitud | null = null;

  // Devuelve el manejador que recibe para poder encadenar: a.siguiente(b).siguiente(c)
  siguiente(manejador: ManejadorSolicitud): ManejadorSolicitud {
    this.proximo = manejador;
    return manejador;
  }

  manejar(solicitud: Solicitud): Resultado {
    if (this.proximo) {
      return this.proximo.manejar(solicitud);
    }
    return { aprobada: true, motivo: "Sin más validaciones" };
  }
}

//* 2. Manejadores concretos
class ValidadorDatos extends ManejadorSolicitud {
  override manejar(solicitud: Solicitud): Resultado {
    const codigoValido = /^\d{8}$/.test(solicitud.codigo);
    const horarioValido = solicitud.horaInicio >= 7 &&
      solicitud.horaFin <= 20 &&
      solicitud.horaInicio < solicitud.horaFin;

    if (!codigoValido || !horarioValido) {
      return { aprobada: false, motivo: "Código u horario inválido" };
    }
    console.log("%c[Datos] OK", COLORS.green);
    return super.manejar(solicitud);
  }
}

class ValidadorSancion extends ManejadorSolicitud {
  private sancionados: string[] = ["20231234"];

  override manejar(solicitud: Solicitud): Resultado {
    if (this.sancionados.includes(solicitud.codigo)) {
      return { aprobada: false, motivo: "El estudiante tiene una sanción" };
    }
    console.log("%c[Sanción] OK", COLORS.green);
    return super.manejar(solicitud);
  }
}

class ValidadorDisponibilidad extends ManejadorSolicitud {
  // Horas ya reservadas por sala
  private reservas: Record<string, number[]> = {
    "Sala 1": [9, 10],
    "Sala 2": [14],
  };

  override manejar(solicitud: Solicitud): Resultado {
    const ocupadas = this.reservas[solicitud.sala] ?? [];
    for (let hora = solicitud.horaInicio; hora < solicitud.horaFin; hora++) {
      if (ocupadas.includes(hora)) {
        return {
          aprobada: false,
          motivo: `${solicitud.sala} ocupada a las ${hora}:00`,
        };
      }
    }
    console.log("%c[Disponibilidad] OK", COLORS.green);
    return super.manejar(solicitud);
  }
}

class AprobadorFinal extends ManejadorSolicitud {
  override manejar(solicitud: Solicitud): Resultado {
    return {
      aprobada: true,
      motivo:
        `${solicitud.sala} reservada de ${solicitud.horaInicio}:00 a ${solicitud.horaFin}:00`,
    };
  }
}

//* 3. Código cliente
function procesar(cadena: ManejadorSolicitud, solicitud: Solicitud): void {
  console.log(
    `\nSolicitud de %c${solicitud.codigo} %cpara ${solicitud.sala}`,
    COLORS.blue,
    COLORS.white,
  );
  const resultado = cadena.manejar(solicitud);
  const color = resultado.aprobada ? COLORS.green : COLORS.red;
  const estado = resultado.aprobada ? "APROBADA" : "RECHAZADA";
  console.log(`%c${estado}: ${resultado.motivo}`, color);
}

function main(): void {
  const validadorDatos = new ValidadorDatos();
  validadorDatos
    .siguiente(new ValidadorSancion())
    .siguiente(new ValidadorDisponibilidad())
    .siguiente(new AprobadorFinal());

  procesar(validadorDatos, {
    codigo: "20241111",
    sala: "Sala 1",
    horaInicio: 15,
    horaFin: 17,
  });
  procesar(validadorDatos, {
    codigo: "abc",
    sala: "Sala 1",
    horaInicio: 15,
    horaFin: 17,
  });
  procesar(validadorDatos, {
    codigo: "20231234",
    sala: "Sala 1",
    horaInicio: 15,
    horaFin: 17,
  });
  procesar(validadorDatos, {
    codigo: "20241111",
    sala: "Sala 1",
    horaInicio: 10,
    horaFin: 12,
  });
}

main();
