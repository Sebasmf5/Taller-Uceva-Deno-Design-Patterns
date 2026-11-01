# Taller de Patrones de Diseño en TypeScript (Deno)

**Universidad:** Unidad Central del Valle del Cauca (UCEVA)  
**Facultad:** Ingeniería  
**Asignatura:** Arquitectura de Software  
**Docente:** Ing. Jesús David Mejía Vergara  

---

## Integrantes del Grupo

- **Sebastián Morales** (`sebastian.morales01@uceva.edu.co`)
- **Camilo Suárez** (`juan.suarez04@uceva.edu.co`)
- *(Agregar aquí los demás integrantes del grupo si aplica)*

---

## Lista de Patrones Utilizados

### Patrones Obligatorios (`Taller/Obligatorios/`)
1. **Builder** (Creacional) — [`01-builder.ts`](./Obligatorios/01-builder.ts)
2. **Adapter** (Estructural) — [`04-adapter.ts`](./Obligatorios/04-adapter.ts)
3. **Flyweight** (Estructural) — [`05-flyweight.ts`](./Obligatorios/05-flyweight.ts)
4. **Observer** (Comportamiento) — [`07-observer.ts`](./Obligatorios/07-observer.ts)

### Patrones Adicionales
- **Creacionales (2):**
  5. **Singleton** — [`singleton.ts`](./01-Patrones-Creacionales/02-Singleton/singleton.ts)
  6. **Abstract Factory** — [`abstract-factory.ts`](./01-Patrones-Creacionales/03-Abstract-Factory/abstract-factory.ts)
- **Estructurales (1):**
  7. **Facade** — [`facade.ts`](./02-Patrones-Estructurales/03-Facade/facade.ts)
- **De Comportamiento (3):**
  - *(Pendiente por agregar)*
  - *(Pendiente por agregar)*
  - *(Pendiente por agregar)*

---

## Descripción de cada Ejercicio

### 1. Patrón Builder (`Obligatorios/01-builder.ts`)
- **Problema:** La creación de eventos universitarios (`Evento`) involucra múltiples atributos donde la mayoría son opcionales (lugar, cupo de inscripción, lista de ponentes, transmisión en vivo con URL, entrega de certificado y método de verificación de asistencia). Un constructor tradicional con todos estos parámetros sería difícil de leer y propenso a errores.
- **Solución:** Se implementó `EventoBuilder` con métodos encadenables (`conNombre`, `enFecha`, `enLugar`, `conInscripcion`, `conPonente`, `conTransmision`, `conCertificadoParticipacion`, `conMetodoVerificacion`) y validaciones en `build()` para producir instancias inmutables de `Evento`.

### 2. Patrón Adapter (`Obligatorios/04-adapter.ts`)
- **Problema:** El módulo de emisión de certificados necesita generar códigos QR a partir de la interfaz estándar `GeneradorQR` (`generar(texto)`), pero las librerías externas disponibles (`LibreriaQR` con `makeCode(data, opciones)` y `OtraLibreriaQR` con `render(contenido)`) tienen firmas incompatibles y no pueden modificarse.
- **Solución:** Se crearon los adaptadores `AdaptadorLibreriaQR` y `AdaptadorOtraLibreriaQR` que implementan `GeneradorQR` y traducen la llamada a cada librería externa sin modificar la función cliente `emitirCertificado`.

### 3. Patrón Flyweight (`Obligatorios/05-flyweight.ts`)
- **Problema:** Representar el mapa de los 20.000 asientos (100 filas × 200 asientos) de un coliseo universitario. Todos los asientos de una misma zona (`VIP`, `Preferencial` y `General`) repiten zona, precio, símbolo, servicios y descripción; almacenar copias individuales en cada asiento desperdicia memoria RAM.
- **Solución:** Se separó el estado intrínseco e inmutable en `TipoAsiento` (administrado y reutilizado por `FabricaTipoAsiento`, creando únicamente 3 instancias en memoria) del estado extrínseco en `Asiento` (fila, número y si está ocupado), logrando una reducción significativa en el consumo de memoria frente a la versión sin el patrón.

### 4. Patrón Observer (`Obligatorios/07-observer.ts`)
- **Problema:** Cuando un docente publica una nota en un `CursoVirtual`, varios módulos independientes deben reaccionar automáticamente (notificar al estudiante, alertar a bienestar universitario si la nota es menor a 3.0 y guardar el registro en auditoría) sin acoplar la clase del curso a cada módulo concreto.
- **Solución:** `CursoVirtual` actúa como sujeto manteniendo una lista de suscriptores bajo la interfaz `Observer` (`actualizar(nota)`). Los observadores concretos (`NotificadorEstudiante`, `AlertaBienestar` y `RegistroAuditoria`) pueden suscribirse o cancelar su suscripción dinámicamente sin modificar el curso.

### 5. Patrón Singleton (`01-Patrones-Creacionales/02-Singleton/singleton.ts`)
- **Problema:** En una sede de una EPS existen varios puntos que solicitan turnos para los pacientes (pantalla de entrada, módulo de citas y aplicación móvil). Si cada punto creara su propio objeto turnero con `new`, cada uno reiniciaría su contador desde `A-001` y se entregarían turnos repetidos.
- **Solución:** La clase `Turnero` define un constructor privado y expone el método estático `getInstance()`, garantizando que todos los módulos compartan una única instancia en memoria y mantengan una secuencia global continua de turnos (`A-001`, `A-002`, `A-003`...) con un historial centralizado.

### 6. Patrón Abstract Factory (`01-Patrones-Creacionales/03-Abstract-Factory/abstract-factory.ts`)
- **Problema:** Una tienda en línea despacha pedidos trabajando con distintas transportadoras (`EnvíaYa` y `RápidoExpress`). Para cada envío se requiere crear dos objetos compatibles de la misma empresa: un `Cotizador` y una `Guia`. Si se instanciaran clases concretas por separado, podrían mezclarse objetos de distintas transportadoras o acoplar el código cliente a cada proveedor.
- **Solución:** Se definió la fábrica abstracta `TransportadoraFactory` (`crearCotizador()` y `crearGuia()`) implementada por `EnviaYaFactory` y `RapidoExpressFactory`. La función `despacharPedido` recibe únicamente la interfaz de la fábrica, asegurando que el cotizador y la guía correspondan siempre a la misma transportadora.

### 7. Patrón Facade (`02-Patrones-Estructurales/03-Facade/facade.ts`)
- **Problema:** Para matricular una asignatura en la universidad es necesario interactuar en un orden estricto con tres subsistemas distintos: verificar paz y salvo y generar recibo en `Financiera`, comprobar prerrequisitos en `RegistroAcademico` y descontar el cupo en `ProgramacionAcademica`. Que cada cliente coordine estos pasos por su cuenta duplica lógica y facilita errores en el flujo.
- **Solución:** Se implementó la fachada `MatriculaFacade` con un único método `matricular(codigo, materia, creditos)` que encapsula y coordina las llamadas a los tres subsistemas en el orden correcto.

---

## Ejecución de los Ejercicios

Desde la raíz del repositorio puedes ejecutar cada ejercicio con Deno:

```bash
# Patrones Obligatorios
deno run Taller/Obligatorios/01-builder.ts
deno run Taller/Obligatorios/04-adapter.ts
deno run Taller/Obligatorios/05-flyweight.ts
deno run Taller/Obligatorios/07-observer.ts

# Patrones Adicionales (Creacionales y Estructural)
deno run Taller/01-Patrones-Creacionales/02-Singleton/singleton.ts
deno run Taller/01-Patrones-Creacionales/03-Abstract-Factory/abstract-factory.ts
deno run Taller/02-Patrones-Estructurales/03-Facade/facade.ts
```
