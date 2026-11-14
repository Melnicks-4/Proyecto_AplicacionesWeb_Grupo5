import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import { Inicio, Menu, Pausa, Victoria, Derrota } from './scenes/FlowScenes.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 600 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [Inicio, Menu, GameScene, Pausa, Victoria, Derrota]
};

new Phaser.Game(config);
