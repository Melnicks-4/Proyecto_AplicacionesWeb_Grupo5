import Phaser from 'phaser';
import { texto, boton } from './ui.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  create() {
    this.add.tileSprite(480, 540, 960, 80, 'fondo-marino').setOrigin(0.5, 1);
    this.add.image(90, 465, 'alga').setOrigin(0.5, 1);
    this.add.image(240, 255, 'pez');

    texto(this, 125, 36, 'Partida de prueba', 20);
    boton(this, 840, 36, 'Pausar', () => {
      this.scene.pause();
      this.scene.launch('Pausa');
    });

    boton(this, 365, 370, 'Probar victoria', () => this.terminar(true));
    boton(this, 595, 370, 'Probar derrota', () => this.terminar(false));
  }

  terminar(victoria) {
    this.scene.start(victoria ? 'Victoria' : 'Derrota');
  }
}
