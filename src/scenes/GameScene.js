import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        
    }

    create() {
        // 1. Fondo del océano
        this.cameras.main.setBackgroundColor('#005b82');

        // 2. Título de la escena
        this.add.text(400, 40, 'Angry Fins: Módulo 2 (Jugador y Física)', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 3. Suelo marino estático (Arcade Physics)
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // 4. Creación del Jugador (Pez con físicas y rebote)
        // Usamos temporalmente un círculo naranja brillante en lugar de la imagen del pez
        this.player = this.physics.add.image(150, 400, null).setCircle(18);
        this.player.setDisplaySize(36, 36);
        
        // Dibujamos un gráfico temporal para que se vea un pececito básico si no hay sprite cargado
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xff6f59, 1);
        graphics.fillCircle(18, 18, 18);
        graphics.generateTexture('tempFish', 36, 36);
        this.player.setTexture('tempFish');

        // Propiedades físicas del jugador (Integrante 2)
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.3); // Pequeño rebote al chocar

        // Colisión entre el jugador y el suelo marino
        this.physics.add.collider(this.player, this.platforms);

        // 5. Controles por teclado (Flechas o WASD para mover/impulsar al pez)
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Instrucciones en pantalla
        this.add.text(400, 90, 'Usa las Flechas / WASD para moverte y la barra espaciadora para nadar hacia arriba', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#a0e7e5'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        // Lógica de movimiento y controles del Integrante 2
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0); // Freno horizontal natural en el agua
        }

        // Impulso hacia arriba simulando natación al presionar la flecha Arriba o Espacio
        if (this.cursors.up.isDown || this.cursors.space.isDown) {
            this.player.setVelocityY(-250);
        }
    }
}
