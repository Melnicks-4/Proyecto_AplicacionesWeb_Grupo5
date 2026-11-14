import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    // debug: true deja ver los cuerpos
    arcade: { gravity: { y: 600 }, debug: true } 
  },
  scale: {
    // se adapta a móvil y escritorio
    mode: Phaser.Scale.FIT,            
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene]
};

new Phaser.Game(config);