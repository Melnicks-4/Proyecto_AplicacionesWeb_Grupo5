import Phaser from 'phaser';

function texto(escena, x, y, contenido, tamano) {
  return escena.add.text(x, y, contenido, {
    fontFamily: 'system-ui, sans-serif',
    fontSize: tamano,
    color: '#ecfaff'
  }).setOrigin(0.5);
}

function boton(escena, x, y, etiqueta, accion) {
  const fondo = escena.add.rectangle(x, y, 200, 44, 0x126481)
    .setStrokeStyle(1, 0x72d4e4)
    .setInteractive({ useHandCursor: true });

  texto(escena, x, y, etiqueta, 18);
  fondo.on('pointerover', () => fondo.setFillStyle(0x237d9a));
  fondo.on('pointerout', () => fondo.setFillStyle(0x126481));
  fondo.on('pointerup', accion);
}

export class Inicio extends Phaser.Scene {
  constructor() {
    super('Inicio');
  }

  preload() {
    texto(this, 400, 225, 'Cargando recursos…', 26);
    const assets = import.meta.env.BASE_URL + 'assets/';
    this.load.image('pez', assets + 'fish_blue.png');
    this.load.image('fondo-marino', assets + 'background_terrain.png');
    this.load.image('alga', assets + 'background_seaweed_a.png');
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
    this.add.image(400, 118, 'pez').setScale(1.4);
    texto(this, 400, 218, 'Marea Azul', 52);
    boton(this, 400, 310, 'Jugar', () => this.scene.start('Partida'));
  }
}

export class Partida extends Phaser.Scene {
  constructor() {
    super('Partida');
  }

  create() {
    this.add.tileSprite(400, 450, 800, 80, 'fondo-marino').setOrigin(0.5, 1);
    this.add.image(90, 375, 'alga').setOrigin(0.5, 1);
    this.add.image(200, 215, 'pez');

    texto(this, 125, 36, 'Partida de prueba', 20);
    boton(this, 680, 36, 'Pausar', () => {
      this.scene.pause();
      this.scene.launch('Pausa');
    });

    boton(this, 285, 310, 'Probar victoria', () => this.terminar(true));
    boton(this, 515, 310, 'Probar derrota', () => this.terminar(false));
  }

  terminar(victoria) {
    this.scene.start(victoria ? 'Victoria' : 'Derrota');
  }
}

export class Pausa extends Phaser.Scene {
  constructor() {
    super('Pausa');
  }

  create() {
    this.add.rectangle(400, 225, 800, 450, 0x041727, 0.85)
      .setInteractive();
    texto(this, 400, 140, 'En pausa', 42);
    boton(this, 400, 220, 'Continuar', () => {
      this.scene.resume('Partida');
      this.scene.stop();
    });
    boton(this, 400, 277, 'Reiniciar', () => {
      this.scene.stop('Partida');
      this.scene.start('Partida');
    });
    boton(this, 400, 334, 'Menú principal', () => {
      this.scene.stop('Partida');
      this.scene.start('Menu');
    });
  }
}

class Resultado extends Phaser.Scene {
  constructor(clave, titulo) {
    super(clave);
    this.titulo = titulo;
  }

  create() {
    texto(this, 400, 154, this.titulo, 50);
    boton(this, 400, 246, 'Volver a jugar', () => this.scene.start('Partida'));
    boton(this, 400, 304, 'Menú principal', () => this.scene.start('Menu'));
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
