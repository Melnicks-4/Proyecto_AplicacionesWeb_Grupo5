import Phaser from 'phaser';
import { Inicio, Menu, Partida, Pausa, Victoria, Derrota } from './scenes.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: 800,
  height: 450,
  backgroundColor: '#082b43',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 } }
  },
  scene: [Inicio, Menu, Partida, Pausa, Victoria, Derrota]
});
