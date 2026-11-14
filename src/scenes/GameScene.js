import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Aquí cargaremos los sprites de Kenney cuando los tengas listos en la carpeta assets
        // Ejemplo:
        // this.load.image('fish', 'assets/fishRed.png');
        // this.load.image('obstacle', 'assets/boxWood.png');
    }

    create() {
        // 1. Fondo de color océano profundo
        this.cameras.main.setBackgroundColor('#005b82');

        // 2. Título del juego en la parte superior
        this.add.text(400, 50, 'Angry Fins: Edición Marina', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 3. Suelo marino (una barra sólida abajo)
        // Creamos un grupo estático de físicas para las plataformas/suelo
        this.platforms = this.physics.add.staticGroup();

        // Dibujamos un rectángulo verde mar / arena en la parte inferior (Y: 530 a 600)
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true); // true = estático (no se cae)
        this.platforms.add(ground);

        // Texto informativo sobre el suelo
        this.add.text(400, 565, 'Suelo Marino (Zona de impacto)', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#4e89ae'
        }).setOrigin(0.5);

        // 4. Indicador visual para la zona de lanzamiento (resortera a la izquierda)
        this.add.circle(150, 430, 15, 0xf9ed69);
        this.add.text(150, 460, 'Zona de Lanzamiento', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#f9ed69'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        // Lógica por frame (aquí pondremos la física de arrastre del pez más adelante)
    }
}
