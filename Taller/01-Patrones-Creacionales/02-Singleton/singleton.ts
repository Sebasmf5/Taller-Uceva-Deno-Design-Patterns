/**
 * ! Patrón Singleton (Creacional)
 *
 * * ¿Qué hace el patrón?
 * Garantiza que una clase tenga una sola instancia en todo el programa y da un
 * punto de acceso global a ella (normalmente un método getInstance()).
 *
 * * ¿Qué problema resolvemos?
 * Una EPS tiene un turnero: cada paciente que llega recibe un número (A-001,
 * A-002...). En la sede hay varias pantallas y módulos que piden turnos: la
 * entrada, el módulo de citas y la app. Si cada uno creara su propio turnero
 * con "new", cada uno empezaría desde A-001 y dos pacientes podrían quedar con
 * el mismo número.
 *
 * * ¿Por qué el Singleton es adecuado?
 * - El constructor es privado, así que nadie puede crear un segundo turnero.
 * - Todos los módulos piden el turnero con getInstance() y reciben el mismo
 *   objeto, con el mismo contador.
 * - Los números nunca se repiten, sin importar desde dónde se pida el turno.
 *
 * https://refactoring.guru/es/design-patterns/singleton
 */

import { COLORS } from '../../../helpers/colors.ts';

class Turnero {

    // Aquí se guarda la única instancia que va a existir
    private static instance: Turnero;

    private ultimoTurno: number = 0;
    private historial: string[] = [];

    /**
     * Constructor privado: impide hacer "new Turnero()" desde afuera.
     */
    private constructor() {
        console.log('%cSe creó el turnero (esto debe salir una sola vez)', COLORS.gray);
    }

    /**
     * Punto de acceso global. La primera vez crea el turnero;
     * las siguientes devuelve el mismo.
     */
    public static getInstance(): Turnero {
        if (!Turnero.instance) {
            Turnero.instance = new Turnero();
        }
        return Turnero.instance;
    }

    /**
     * Entrega el siguiente turno con formato A-001.
     */
    siguienteTurno(modulo: string): string {
        this.ultimoTurno++;
        const turno = `A-${String(this.ultimoTurno).padStart(3, '0')}`;
        this.historial.push(`${turno} (${modulo})`);
        return turno;
    }

    verHistorial(): void {
        console.log('Turnos entregados:', this.historial.join(', '));
    }

}

function main() {

    // Tres módulos distintos piden el turnero por su cuenta
    const pantallaEntrada = Turnero.getInstance();
    const moduloCitas = Turnero.getInstance();
    const appMovil = Turnero.getInstance();

    console.log('%cEntrada:', COLORS.blue, pantallaEntrada.siguienteTurno('Entrada'));
    console.log('%cCitas:', COLORS.blue, moduloCitas.siguienteTurno('Citas'));
    console.log('%cApp:', COLORS.blue, appMovil.siguienteTurno('App'));
    console.log('%cEntrada:', COLORS.blue, pantallaEntrada.siguienteTurno('Entrada'));

    // Los números siguen una sola secuencia porque es el mismo objeto
    pantallaEntrada.verHistorial();

    console.log(
        '%c¿Los tres módulos usan el mismo turnero?',
        COLORS.green,
        pantallaEntrada === moduloCitas && moduloCitas === appMovil,
    );

    // new Turnero(); // Error de TypeScript: el constructor es privado

}

main();