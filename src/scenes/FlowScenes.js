import Phaser from 'phaser';

import { leerProgreso } from '../data/progreso.js';
import { texto, boton } from './ui.js';

export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  preload() {
    texto(this, 480, 270, 'Cargando recursos…', 26);
    const assets = import.meta.env.BASE_URL + 'assets/images/';
    this.load.image('pez', assets + 'fish_orange.png');
    this.load.image('fondo-marino', assets + 'background_terrain.png');
    this.load.image('alga', assets + 'background_seaweed_a.png');

    ['fish_orange', 'fish_blue', 'fish_green', 'fish_pink'].forEach((clave) => {
      this.load.image(clave, assets + clave + '.png');
    });

    this.load.image('arena_top', assets + 'terrain_sand_top_e.png');
    this.load.image('roca_a', assets + 'rock_a.png');
    this.load.image('roca_b', assets + 'rock_b.png');
    this.load.image('alga_verde', assets + 'seaweed_green_a.png');
    this.load.image('alga_rosa', assets + 'seaweed_pink_a.png');
    this.load.image('alga_naranja', assets + 'seaweed_orange_a.png');
  }

  create() {
    this.scene.start('Menu');
  }
}

export class Menu extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    this.add.image(480, 118, 'pez').setScale(1.4);
    texto(this, 480, 218, 'Angry Fins', 52);
    const progreso = leerProgreso();
    if (progreso.nivel > 0) {
      texto(this, 480, 270, `Récord: ${progreso.puntaje}  |  Nivel máximo: ${progreso.nivel}`, 20);
    }
    boton(this, 480, 335, 'Jugar', () => this.scene.start('SeleccionPez'));
  }
}

export class Pausa extends Phaser.Scene {
  constructor() {
    super('Pausa');
    
  }

  create() {
    this.add.rectangle(480, 270, 960, 540, 0x041727, 0.85)
      .setInteractive();
    texto(this, 480, 140, 'En pausa', 42);
    boton(this, 480, 220, 'Continuar', () => {
      this.scene.resume('Game');
      this.scene.stop();
    });
    boton(this, 480, 277, 'Reiniciar', () => {
      this.scene.stop('Game');
      this.scene.start('Game');
    });
    boton(this, 480, 334, 'Cambiar pez', () => {
      this.scene.stop('Game');
      this.scene.start('SeleccionPez');
    });
    boton(this, 480, 391, 'Menú principal', () => {
      this.scene.stop('Game');
      this.scene.start('Menu');
    });
  }
}

class Resultado extends Phaser.Scene {
  constructor(clave, titulo) {
    super(clave);
    this.titulo = titulo;
  }

  create(resultado) {
    texto(this, 480, 105, this.titulo, 50);
    texto(this, 480, 170, `Puntaje final: ${resultado.puntaje}  |  Nivel alcanzado: ${resultado.nivel}`, 22);
    const etiqueta = resultado.nuevoRecord ? '¡Nuevo récord!' : 'Récord:';
    texto(this, 480, 208, `${etiqueta} ${resultado.record}`, 20);
    boton(this, 480, 278, 'Volver a jugar', () => this.scene.start('Game'));
    boton(this, 480, 336, 'Cambiar pez', () => this.scene.start('SeleccionPez'));
    boton(this, 480, 394, 'Menú principal', () => this.scene.start('Menu'));
  }
}

export class Victoria extends Resultado {
  constructor() {
    super('Victoria', '¡Victoria!');
  }
}

export class Derrota extends Resultado {
  constructor() {
    super('Derrota', 'Game Over');
  }
}
