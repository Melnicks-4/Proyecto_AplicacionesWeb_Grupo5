import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';
import { Inicio, Menu, Pausa, Victoria, Derrota } from './scenes/FlowScenes.js';

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    parent: 'app',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Inicio, Menu, GameScene, Pausa, Victoria, Derrota]
};

export default new Phaser.Game(config);
