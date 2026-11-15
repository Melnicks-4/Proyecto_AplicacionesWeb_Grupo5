import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo azul marino del océano
        this.cameras.main.setBackgroundColor('#005b82');

        // Título visible para confirmar que la escena está corriendo
        this.add.text(400, 50, 'Angry Fins', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Suelo marino (rectángulo inferior con físicas)
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Texto descriptivo del suelo
        this.add.text(400, 565, 'Suelo Marino (Arcade Physics)', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#a0e7e5'
        }).setOrigin(0.5);

        // Jugador temporal (Círculo naranja con físicas)
        this.player = this.physics.add.image(150, 300, null).setCircle(18);
        this.player.setDisplaySize(36, 36);
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xff6f59, 1);
        graphics.fillCircle(18, 18, 18);
        graphics.generateTexture('tempFish', 36, 36);
        this.player.setTexture('tempFish');

        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.3);
        this.physics.add.collider(this.player, this.platforms);

        // Controles de teclado
        this.cursors = this.input.keyboard.createCursorKeys();

        // Instrucciones en pantalla
        this.add.text(400, 100, 'Usa las Flechas / WASD para moverte y la barra espaciadora para nadar', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#f9ed69'
        }).setOrigin(0.5);
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown || this.cursors.space.isDown) {
            this.player.setVelocityY(-250);
        }
    }
}
