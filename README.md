# Entrenador de tiempos verbales

App para practicar gramática inglesa en el móvil: unidades encadenadas, lecciones de tres minutos, corazones, racha diaria y repaso espaciado de lo que se falla.

## Ponerla en marcha

Hace falta [Node.js](https://nodejs.org) (versión 18 o superior). Una vez instalado, desde esta carpeta:

```bash
npm install     # solo la primera vez
npm run dev     # abre la app en el navegador
```

## Repartirla a los alumnos

```bash
npm run build
```

Deja una carpeta `dist/` que ya es la app entera. Se sube tal cual a GitHub Pages, Netlify, Vercel o un aula virtual y funciona desde cualquier móvil, sin instalar nada y sin cuentas.

El progreso de cada alumno se guarda en su propio navegador. No hay servidor: eso significa que nadie ve los datos de nadie, pero también que **el profesor no recibe los resultados**. Si un alumno quiere enseñar cómo va, la pantalla de perfil (el 🔥 o el 💎 de arriba) muestra su precisión y las reglas que peor lleva.

## En qué pantallas funciona

La misma app se adapta a cuatro situaciones, y cada corte tiene un motivo:

- **Móvil pequeño** (menos de 380px): espaciado apretado y tipografía algo menor.
- **Móvil y tableta**: navegación en la barra inferior, al alcance del pulgar.
- **Escritorio** (desde 1024px): la navegación pasa a columna lateral, porque una barra inferior encogida en mitad de un monitor no la busca nadie. El contenido se queda en una columna de lectura en lugar de estirarse de lado a lado.
- **Apaisado**: se recortan los aires verticales para que el botón de comprobar no obligue a hacer scroll.

Dentro de la lección la navegación desaparece en todos los tamaños: es una pantalla de una sola tarea, y para salir está la equis.

## Cambiar el contenido

Todo lo editable está en `src/data/`:

- **`banco.json`** — los ejercicios. Cada uno lleva su tipo, la unidad a la que pertenece, la regla que mide, la respuesta y la explicación que se le enseña al alumno al responder.
- **`unidades.json`** — las unidades, su nivel (A1, A2 o B1), en qué orden se desbloquean, la metáfora que abre cada una y los nombres legibles de las reglas. Al final del fichero, `niveles` guarda los textos con los que el alumno se reconoce al elegir por dónde empieza.
- **`teoria.json`** — la pestaña Guía: usos, marcadores y estructuras (afirmativa, negativa y preguntas) de cada tiempo. Se filtra sola según las unidades que existan, así que al quitar unidades no hace falta tocarla.

Tras cualquier cambio, comprueba que no se ha colado un ejercicio irresoluble. Son dos revisiones distintas y merece la pena pasar las dos:

```bash
python3 validar_banco.py src/data/banco.json   # ¿está bien escrito?
npm run comprobar                              # ¿se puede acertar?
```

La primera revisa el fichero: que la respuesta esté entre las opciones, que las fichas formen la frase, que el error señalado sea el que es. La segunda intenta resolver cada ejercicio como lo haría un alumno que lo sabe todo, y avisa si alguno no se deja acertar.

## Comprobar que nada se ha roto

```bash
npm run prueba
```

93 comprobaciones del motor: validación de respuestas, repaso espaciado, progreso, selección de ejercicios y niveles. Si tocas algo dentro de `src/motor/`, pasa esto antes de dárselo a nadie.

## Qué hay dentro

```
src/
├── data/          contenido: ejercicios y unidades   ← lo que se edita
├── motor/         validación, repaso espaciado, progreso, selección
├── ejercicios/    un componente por tipo de ejercicio
└── componentes/   mapa, lección, feedback, resumen, perfil
```
