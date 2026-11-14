import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this.add.text(20, 20, 'Angry Fins funciona', { color: '#fff' });
  }
}