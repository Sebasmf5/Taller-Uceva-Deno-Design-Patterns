/**
 * ! Patrón Builder (Constructor):
 *
 * 1. ¿Qué hace el patrón?
 * Es un patrón de diseño creacional que permite construir objetos complejos
 * paso a paso. En lugar de invocar un constructor gigante con decenas de
 * parámetros, el patrón extrae la lógica de ensamblaje a un objeto constructor
 * (`EventoBuilder`) con métodos encadenables (interfaz fluida) que configuran
 * únicamente las partes necesarias antes de generar el producto final (`Evento`).
 *
 * 2. ¿Qué problema se está resolviendo?
 * En la gestión de eventos universitarios (conferencias, talleres, seminarios,
 * charlas abiertas), cada evento posee múltiples atributos donde casi todos son
 * opcionales: lugar definido o por definir, inscripción previa con límite de cupo
 * o entrada libre, lista de ponentes, transmisión en vivo con URL, entrega de
 * certificados de participación y distintos métodos de verificación de asistencia.
 * Intentar resolver esto con un único constructor provoca el antipatrón
 * "Telescoping Constructor" (constructores telescópicos), obligando al cliente a
 * recordar el orden exacto de muchos parámetros y pasar múltiples valores `null`,
 * `false` o arreglos vacíos `[]` que hacen el código difícil de leer y mantener.
 *
 * 3. ¿Por qué Builder es adecuado para ese problema?
 * - Permite construir distintas representaciones de un `Evento` (desde una charla
 *   básica hasta un congreso completo) utilizando el mismo proceso de construcción.
 * - Otorga legibilidad mediante métodos expresivos (`conNombre`, `enFecha`,
 *   `conInscripcion`, `conCertificadoParticipacion`, etc.).
 * - Centraliza las reglas de validación e invariantes de dominio en el método
 *   `build()` antes de instanciar el objeto final.
 * - Garantiza que el producto resultante (`Evento`) sea completamente inmutable
 *   (`readonly`) una vez construido.
 */

const COLORS = {
    blue: 'color: blue',
    green: 'color: green',
    red: 'color: red',
    yellow: 'color: yellow',
    purple: 'color: purple',
    cyan: 'color: cyan',
};

type MetodoVerificacion = 'ninguno' | 'firma digital' | 'reconocimiento facial';

//* Producto: Clase Evento (Inmutable con campos readonly)
class Evento {
    readonly nombre: string;
    readonly fecha: string;
    readonly lugar: string;
    readonly cupo: number | null;
    readonly requiereInscripcion: boolean;
    readonly ponentes: readonly string[];
    readonly transmisionEnVivo: boolean;
    readonly urlTransmision: string | null;
    readonly enviaCertificado: boolean;
    readonly metodoVerificacion: MetodoVerificacion;

    constructor(
        nombre: string,
        fecha: string,
        lugar: string,
        cupo: number | null,
        requiereInscripcion: boolean,
        ponentes: string[],
        transmisionEnVivo: boolean,
        urlTransmision: string | null,
        enviaCertificado: boolean,
        metodoVerificacion: MetodoVerificacion,
    ) {
        this.nombre = nombre;
        this.fecha = fecha;
        this.lugar = lugar;
        this.cupo = cupo;
        this.requiereInscripcion = requiereInscripcion;
        this.ponentes = [...ponentes];
        this.transmisionEnVivo = transmisionEnVivo;
        this.urlTransmision = urlTransmision;
        this.enviaCertificado = enviaCertificado;
        this.metodoVerificacion = metodoVerificacion;
    }

    resumen(): string {
        const infoCupo = this.cupo !== null ? `${this.cupo} personas` : 'Ilimitado';
        const infoInscripcion = this.requiereInscripcion ? 'Sí' : 'No (Entrada libre)';
        const infoPonentes = this.ponentes.length > 0
            ? this.ponentes.join(', ')
            : 'Sin ponentes registrados';
        const infoTransmision = this.transmisionEnVivo
            ? `Sí (${this.urlTransmision})`
            : 'No';
        const infoCertificado = this.enviaCertificado ? 'Sí' : 'No';

        return `Resumen del Evento Universitario:
            Nombre:                 ${this.nombre}
            Fecha:                  ${this.fecha}
            Lugar:                  ${this.lugar}
            Requiere inscripción:   ${infoInscripcion}
            Cupo máximo:            ${infoCupo}
            Ponentes:               ${infoPonentes}
            Transmisión en vivo:    ${infoTransmision}
            Envía certificado:      ${infoCertificado}
            Método de verificación: ${this.metodoVerificacion}
        `;
    }
}

//* Builder: Clase EventoBuilder para construir objetos Evento paso a paso
class EventoBuilder {
    private nombre: string = '';
    private fecha: string = '';
    private lugar: string = 'Por definir';
    private cupo: number | null = null;
    private requiereInscripcion: boolean = false;
    private ponentes: string[] = [];
    private transmisionEnVivo: boolean = false;
    private urlTransmision: string | null = null;
    private enviaCertificado: boolean = false;
    private metodoVerificacion: MetodoVerificacion = 'ninguno';

    conNombre(nombre: string): EventoBuilder {
        this.nombre = nombre;
        return this;
    }

    enFecha(fecha: string): EventoBuilder {
        this.fecha = fecha;
        return this;
    }

    enLugar(lugar: string): EventoBuilder {
        this.lugar = lugar;
        return this;
    }

    conInscripcion(cupo: number): EventoBuilder {
        this.requiereInscripcion = true;
        this.cupo = cupo;
        return this;
    }

    conPonente(ponente: string): EventoBuilder {
        this.ponentes.push(ponente);
        return this;
    }

    conTransmision(url: string): EventoBuilder {
        this.transmisionEnVivo = true;
        this.urlTransmision = url;
        return this;
    }

    conCertificadoParticipacion(): EventoBuilder {
        this.enviaCertificado = true;
        return this;
    }

    conMetodoVerificacion(metodo: MetodoVerificacion): EventoBuilder {
        this.metodoVerificacion = metodo;
        return this;
    }

    build(): Evento {
        if (!this.nombre.trim()) {
            throw new Error('El nombre del evento es obligatorio.');
        }

        if (!this.fecha.trim()) {
            throw new Error('La fecha del evento es obligatoria.');
        }

        if (this.requiereInscripcion && (this.cupo === null || this.cupo <= 0)) {
            throw new Error(
                `El evento "${this.nombre}" requiere inscripción, por lo que el cupo debe ser mayor a 0 (valor recibido: ${this.cupo}).`,
            );
        }

        if (this.transmisionEnVivo && (!this.urlTransmision || !this.urlTransmision.trim())) {
            throw new Error('Si el evento tiene transmisión en vivo, debe especificar una URL válida.');
        }

        return new Evento(
            this.nombre,
            this.fecha,
            this.lugar,
            this.cupo,
            this.requiereInscripcion,
            this.ponentes,
            this.transmisionEnVivo,
            this.urlTransmision,
            this.enviaCertificado,
            this.metodoVerificacion,
        );
    }
}

//* Código Cliente
function main() {
    // 1. Evento simple (solo nombre y fecha)
    const eventoSimple = new EventoBuilder()
        .conNombre('Bienvenida de Primíparos Facultad de Ingeniería')
        .enFecha('2026-08-10')
        .build();

    console.log('%c1. Evento Simple:', COLORS.blue);
    console.log(eventoSimple.resumen());

    // 2. Evento complejo (inscripción, ponentes, transmisión, certificado y firma digital)
    const eventoComplejo = new EventoBuilder()
        .conNombre('Congreso Internacional de Arquitectura de Software')
        .enFecha('2026-11-15')
        .enLugar('Auditorio Central UCEVA')
        .conInscripcion(150)
        .conPonente('Ing. Jesús David Mejía Vergara')
        .conPonente('Dra. Elena Gómez')
        .conTransmision('https://youtube.com/live/uceva-arquitectura-2026')
        .conCertificadoParticipacion()
        .conMetodoVerificacion('firma digital')
        .build();

    console.log('%c2. Evento Complejo:', COLORS.green);
    console.log(eventoComplejo.resumen());

    // 3. Evento con certificado y reconocimiento facial
    const eventoReconocimientoFacial = new EventoBuilder()
        .conNombre('Seminario de Inteligencia Artificial y Visión por Computador')
        .enFecha('2026-11-22')
        .enLugar('Laboratorio de Redes y Software')
        .conPonente('MSc. Carlos Andrés Ramírez')
        .conCertificadoParticipacion()
        .conMetodoVerificacion('reconocimiento facial')
        .build();

    console.log('%c3. Evento con Certificado y Reconocimiento Facial:', COLORS.purple);
    console.log(eventoReconocimientoFacial.resumen());

    // 4. Caso de error controlado con try/catch (inscripción con cupo 0)
    console.log('%c4. Caso de Error Controlado (Inscripción con cupo 0):', COLORS.yellow);
    try {
        const eventoInvalido = new EventoBuilder()
            .conNombre('Taller Práctico de Deno y TypeScript')
            .enFecha('2026-12-01')
            .conInscripcion(0)
            .build();

        console.log(eventoInvalido.resumen());
    } catch (error) {
        if (error instanceof Error) {
            console.log(`%c[Error de validación]: ${error.message}\n`, COLORS.red);
        }
    }
}

main();
