import Phaser from 'phaser';

import { leerProgreso } from '../data/progreso.js';
import { AudioManager } from '../audio/AudioManager.js';
import { cargarImagenes } from '../assets/manifest.js';
import { texto, boton } from '../ui/ui.js';

export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  preload() {
    texto(this, 480, 270, 'Cargando recursos…', 26);
    cargarImagenes(this);
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
    this.audioManager = new AudioManager(this);
    this.add.image(480, 118, 'pez').setScale(1.4);
    texto(this, 480, 218, 'Angry Fins', 52);
    const progreso = leerProgreso();
    if (progreso.nivel > 0) {
      texto(this, 480, 270, `Récord: ${progreso.puntaje}  |  Nivel máximo: ${progreso.nivel}`, 20);
    }
    boton(this, 480, 335, 'Jugar', () => this.scene.start('SeleccionPez'));
    const etiquetaSonido = this.audioManager.soundEnabled ? 'Sonido: activado' : 'Sonido: silenciado';
    this.botonSonido = boton(this, 480, 405, etiquetaSonido, () => {
      const soundEnabled = this.audioManager.toggleSound();
      this.botonSonido.setText(soundEnabled ? 'Sonido: activado' : 'Sonido: silenciado');
    });
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
    if (resultado.medallas?.length) {
      texto(this, 480, 244, `Medallas: ${resultado.medallas.join(' · ')}`, 19).setColor('#ffe19a');
    }
    boton(this, 480, 300, 'Volver a jugar', () => this.scene.start('Game'));
    boton(this, 480, 358, 'Cambiar pez', () => this.scene.start('SeleccionPez'));
    boton(this, 480, 416, 'Menú principal', () => this.scene.start('Menu'));
  }
}

export class Victoria extends Resultado {
  constructor() {
    super('Victoria', 'GAME WINNER');
  }
}

export class Derrota extends Resultado {
  constructor() {
    super('Derrota', 'Game Over');
  }
}
