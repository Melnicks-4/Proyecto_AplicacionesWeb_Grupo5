# Angry Fins

Videojuego 2D de acción submarina del Grupo 5 para Aplicaciones Web. Elige un pez, elimina las oleadas de enemigos y derrota al pez globo antes de perder tus tres vidas.

## Ejecutar en local

Instala Node.js 20.19 o posterior dentro de la rama 20, o Node.js 22.12 en adelante. En la carpeta del repositorio, ejecuta:

```sh
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Si PowerShell bloquea `npm.ps1`, ejecuta `npm.cmd ci` y `npm.cmd run dev`.

## Cómo jugar

Pulsa **Jugar** y elige un pez. Recoge un potenciador para activar su habilidad especial durante seis segundos.

| Pez | Habilidad |
| --- | --- |
| Coral | Aumenta la frecuencia de disparo. |
| Marea | Lanza tres burbujas en abanico. |
| Musgo | Activa un escudo que lo protege de los golpes y le permite dañar enemigos al tocarlos. |
| Perla | Lanza burbujas gigantes que atraviesan enemigos. |

### Controles

| Acción | Teclado | Pantalla táctil |
| --- | --- | --- |
| Moverse | ← / → | Botones de dirección |
| Nadar hacia arriba | ↑ o Espacio | Botón de nado |
| Disparar | Z | Botón de disparo |
| Pausar | P o Esc | Botón de pausa |

Desde la pausa puedes continuar, reiniciar, cambiar de pez o volver al menú.

### Niveles y puntaje

1. **Marea.** Derrota a cinco enemigos mientras la marea alterna de dirección. Las burbujas y la flecha te avisan un segundo antes de que empuje al pez y cambie la velocidad horizontal de sus disparos.
2. **Tormenta.** El agua se oscurece. Enfrenta a siete enemigos más rápidos y sal de las franjas marcadas antes de que caiga el rayo. Cerca del fondo, el túnel opcional de coral guarda un potenciador. Su entrada queda a la derecha.
3. **Pez globo.** Cuando se infla, bloquea los disparos durante 1,1 segundos y apunta hacia donde estabas al iniciar la carga. Lanza cinco burbujas en abanico y queda vulnerable durante 2,6 segundos. Al llegar a la mitad de su vida, también se activan la marea y los rayos.

Cada nivel tiene una burbuja verde con un signo **+**. Recógela para recuperar una vida. Si tienes las tres, activa un escudo que absorbe el siguiente golpe. Puedes guardar un escudo a la vez. Un anillo marca el impacto y el pez parpadea durante la protección temporal.

Cada enemigo normal suma **100 puntos** y el jefe suma **1000**. Las pantallas **GAME WINNER** y **Game Over** muestran el puntaje final y el nivel alcanzado. El menú muestra el récord y el nivel máximo guardados en el navegador.

## Estructura del proyecto

El juego usa HTML, CSS y JavaScript con Phaser 4 y Arcade Physics. Vite sirve y compila el proyecto.

- `src/main.js` configura Phaser y registra las escenas.
- `src/scenes/` contiene el menú, la selección de pez, la partida, la pausa y las pantallas finales.
- `src/managers/` contiene la lógica de los poderes, la marea y la tormenta.
- `src/data/` define los peces y guarda el progreso local.
- `public/assets/` contiene los sprites y su licencia.

## Compilación

```sh
npm run build
npm run preview
```

El primer comando genera `dist/`. El segundo sirve esa compilación localmente. Una prueba visual inicial confirmó que se muestran la partida y los enemigos.

## Créditos

Proyecto del Grupo 5 para Aplicaciones Web. Los sprites pertenecen al paquete **Fish Pack** de Kenney. Consulta la [licencia de los sprites](public/assets/License.txt).

## Medallas

- **Intocable.** Derrota al jefe sin perder ninguna vida. Un golpe absorbido por el escudo no rompe la racha.
- **Explorador.** Recoge el potenciador del túnel de coral y derrota al jefe en esa misma partida.

Puedes conseguir ambas medallas en una partida. Aparecen en la pantalla **GAME WINNER**.
