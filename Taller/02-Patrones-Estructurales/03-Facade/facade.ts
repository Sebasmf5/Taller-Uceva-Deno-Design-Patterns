/**
 * ! Patrón Facade (Estructural)
 *
 * * ¿Qué hace el patrón?
 * Ofrece una interfaz simple (la "fachada") para un conjunto de subsistemas
 * complejos. El cliente llama a un solo método y la fachada se encarga de
 * coordinar a todos los subsistemas en el orden correcto.
 *
 * * ¿Qué problema resolvemos?
 * Para matricular una materia, el sistema de la universidad tiene que:
 *   1. Revisar en Financiera que el estudiante esté a paz y salvo.
 *   2. Revisar en Registro Académico que ya aprobó los prerrequisitos.
 *   3. Pedirle a Programación Académica que reserve un cupo en el grupo.
 *   4. Pedirle a Financiera que genere el recibo de pago.
 * Si la app del estudiante, el portal web y la ventanilla tuvieran que llamar
 * a los cuatro subsistemas por su cuenta, cada uno repetiría la misma lógica,
 * y si alguno se equivoca en el orden (reservar cupo antes de revisar la
 * deuda) se crean errores.
 *
 * * ¿Por qué el Facade es adecuado?
 * - Quien matricula solo llama a matricular(estudiante, materia).
 * - El orden de los pasos y las validaciones quedan en un solo lugar.
 * - Los subsistemas no se modifican: la fachada solo los coordina.
 *
 * https://refactoring.guru/es/design-patterns/facade
 */

import { COLORS } from '../../../helpers/colors.ts';

// ---------- Subsistemas (cada uno hace una sola cosa) ----------

class Financiera {

    private estudiantesConDeuda = ['230099'];

    estaAPazYSalvo(codigo: string): boolean {
        return !this.estudiantesConDeuda.includes(codigo);
    }

    generarRecibo(codigo: string, materia: string, creditos: number): string {
        const valor = creditos * 350000;
        return `Recibo ${codigo}-${materia}: $${valor}`;
    }

}

class RegistroAcademico {

    private aprobadas: Record<string, string[]> = {
        '230011': ['Cálculo I', 'Programación I'],
        '230099': ['Cálculo I'],
    };

    private prerrequisitos: Record<string, string[]> = {
        'Cálculo II': ['Cálculo I'],
        'Estructuras de Datos': ['Programación I'],
    };

    cumplePrerrequisitos(codigo: string, materia: string): boolean {
        const necesarios = this.prerrequisitos[materia] ?? [];
        const aprobadas = this.aprobadas[codigo] ?? [];
        return necesarios.every((requisito) => aprobadas.includes(requisito));
    }

}

class ProgramacionAcademica {

    private cupos: Record<string, number> = {
        'Cálculo II': 2,
        'Estructuras de Datos': 0,
    };

    reservarCupo(materia: string): boolean {
        if ((this.cupos[materia] ?? 0) <= 0) return false;
        this.cupos[materia]--;
        return true;
    }

}

// ---------- Fachada ----------

class MatriculaFacade {

    private financiera = new Financiera();
    private registro = new RegistroAcademico();
    private programacion = new ProgramacionAcademica();

    /**
     * Único método que necesita conocer el cliente.
     * Ejecuta los pasos en orden y se detiene en el primero que falle.
     */
    matricular(codigo: string, materia: string, creditos: number): void {
        console.log(`%cMatrícula de ${materia} para ${codigo}`, COLORS.blue);

        if (!this.financiera.estaAPazYSalvo(codigo)) {
            console.log('%c  ✗ Tiene deudas pendientes en Financiera\n', COLORS.red);
            return;
        }
        console.log('  ✓ A paz y salvo');

        if (!this.registro.cumplePrerrequisitos(codigo, materia)) {
            console.log('%c  ✗ No cumple los prerrequisitos\n', COLORS.red);
            return;
        }
        console.log('  ✓ Prerrequisitos aprobados');

        if (!this.programacion.reservarCupo(materia)) {
            console.log('%c  ✗ No hay cupos disponibles\n', COLORS.red);
            return;
        }
        console.log('  ✓ Cupo reservado');

        const recibo = this.financiera.generarRecibo(codigo, materia, creditos);
        console.log(`%c  ✓ Matrícula exitosa. ${recibo}\n`, COLORS.green);
    }

}

function main() {

    const matricula = new MatriculaFacade();

    // El cliente no sabe que hay tres subsistemas detrás
    matricula.matricular('230011', 'Cálculo II', 4);           // todo bien
    matricula.matricular('230099', 'Cálculo II', 4);           // tiene deuda
    matricula.matricular('230011', 'Estructuras de Datos', 3); // sin cupos

}

main();