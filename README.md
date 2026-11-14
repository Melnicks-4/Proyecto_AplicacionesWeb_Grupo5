# Angry Fins

Base del videojuego 2D del Grupo 5 para Aplicaciones Web. Usa HTML, CSS, JavaScript y Phaser con Arcade Physics.

## Ejecución local

Con Node.js 20.19+ o 22.12+ instalado, abre una terminal en el proyecto.

```sh
npm ci
npm run dev
```

Abre la dirección que muestra Vite. Para compilar usa `npm run build` y para comprobar la compilación usa `npm run preview`.

## Flujo e integración

Pulsa **Jugar** en el menú. En la partida puedes pausar, continuar, reiniciar y volver al menú. Los botones temporales **Probar victoria** y **Probar derrota** permiten verificar ambos finales.

- `src/main.js` configura Phaser y registra las escenas.
- `src/scenes/FlowScenes.js` carga recursos y conecta el menú, la pausa y los resultados.
- `src/scenes/GameScene.js` contiene la escena de partida.
- `public/assets/` contiene los sprites y su licencia.

Las mecánicas del jugador y las oleadas se integran en `GameScene`. Las reglas definitivas pueden llamar a `terminar(true)` para victoria o `terminar(false)` para derrota.

Sprites del paquete Fish Pack de Kenney. Consulta `public/assets/License.txt`.
