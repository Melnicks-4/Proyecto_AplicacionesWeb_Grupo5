# Angry Fins

Base del videojuego 2D del Grupo 5 para Aplicaciones Web. Usa HTML, CSS, JavaScript y Phaser con Arcade Physics.

## Ejecución local

Con Node.js 20.19+ o 22.12+ instalado, abre una terminal en el proyecto.

```sh
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Para compilar usa `npm run build` y para comprobar la compilación usa `npm run preview`.
En PowerShell de Windows, si la política de ejecución bloquea `npm.ps1`, usa `npm.cmd ci` y `npm.cmd run dev`.

## Flujo e integración

Pulsa **Jugar** en el menú y escoge un pez antes de comenzar. Desde la pausa puedes continuar, reiniciar, cambiar de pez o volver al menú. Usa las flechas para moverte, **Espacio** para nadar hacia arriba, **Z** para disparar y **P** o **Esc** para pausar.

- `src/main.js` configura Phaser y registra las escenas.
- `src/scenes/FlowScenes.js` carga recursos y conecta el menú, la pausa y los resultados.
- `src/scenes/GameScene.js` contiene la escena de partida.
- `public/assets/` contiene los sprites y su licencia.

La partida tiene tres oleadas de cinco enemigos. Los enemigos aparecen por la derecha y persiguen horizontalmente al jugador; cada oleada aumenta su velocidad. Cada enemigo eliminado suma 100 puntos. Se gana al completar las tres oleadas y se pierde al quedarse sin las tres vidas. Al recoger un power-up, se activa durante seis segundos la habilidad especial del pez escogido.

## Verificación

La compilación de producción pasa con `npm run build` (en PowerShell también se puede usar `npm.cmd run build`). Una prueba visual inicial confirma que se muestran la partida y los enemigos. El objetivo de 45 FPS o más sigue pendiente de medición en el navegador y dispositivo objetivo.

Sprites del paquete Fish Pack de Kenney. Consulta `public/assets/License.txt`.
