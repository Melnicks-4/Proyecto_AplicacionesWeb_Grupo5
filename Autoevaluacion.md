# Autoevaluación — Angry Fins
**Asignatura:** Aplicaciones Web · EPN  
**Grupo:** 5  
**Módulo:** Jugador, controles y física  
**Proyecto:** Angry Fins (Phaser 4 + Vite, arquetipo Arcade Shooter)  

---

## 1. Rúbrica

| Criterio | Peso | Puntaje propuesto | Justificación |
| :--- | :---: | :---: | :--- |
| **Funcionalidad principal** | 20% | 18 | El juego se puede jugar de inicio a fin: menú, selección de pez, tres niveles, victoria y derrota. |
| **Mecánicas de juego** | 15% | 15 | Disparos, oleadas, power-ups por pez, vidas extra, escudo, marea, tormenta y jefe final, coherentes con un Arcade Shooter. |
| **Física y colisiones** | 10% | 10 | Arcade Physics con gravedad, rebote, overlaps entre burbujas, enemigos, poderes y jugador. |
| **Arquitectura y modularidad** | 15% | 12 | Carpetas por escenas, managers, física, audio, datos y UI. Limitación: `GameScene.js` sigue siendo muy largo. |
| **Rendimiento y optimización** | 10% | 9 | Se reutilizan las burbujas y el loader carga los recursos al inicio. FPS=144 |
| **UX/UI** | 10% | 8 | Menús claros, pausa, Game Over, instrucciones visibles y HUD con contraste. Se puede mejorar el diseño del HUD. |
| **Audio e inmersión** | 5% | 4 | Música de fondo, dos efectos y botón de mute que se recuerda. |
| **Responsividad y táctil** | 5% | 4 | Escala con `Phaser.Scale.FIT` y botones táctiles equivalentes. Falta probar en más dispositivos reales. |
| **Código limpio y documentación** | 5% | 4 | Comentarios y nombres descriptivos. |
| **README, video y presentación** | 5% | 5 | README con controles, estructura y créditos, capturas y presentación. Completar al tener el video. |
| **Bonus** | +10% | 9 | Jefe final y minimapa implementados. |

---

## 2. Fortalezas
- El juego está completo y tiene variedad: cuatro peces con poderes distintos y tres niveles con mecánicas propias.
- Los datos importantes (récord, nivel máximo y audio) se conservan entre sesiones.
- Funciona con teclado y con pantalla táctil.
- El trabajo en equipo quedó registrado en el historial de commits del repositorio.

## 3. Limitaciones
- La medición de FPS depende del equipo; faltan pruebas en más móviles.
- Los sonidos son pocos (música y dos efectos) y no hay ajuste de volumen.

## 4. Mejoras futuras
- Agregar más niveles y enemigos, y un ranking en línea.
- Convertir el juego en una PWA instalable en el celular.
- Comprimir la música y agregar control de volumen.
