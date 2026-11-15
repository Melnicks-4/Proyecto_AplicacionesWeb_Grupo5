import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // 1. Fondo del océano y variables de estado del jugador (Integrante 2)
        this.cameras.main.setBackgroundColor('#005b82');
        this.lives = 3;
        this.hasRapidFire = false;
        this.lastFired = 0;

        // 2. Generar texturas temporales para Jugador, Burbujas y Power-ups
        this.createTempTextures();

        // 3. Suelo marino estático con Arcade Physics
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // 4. Jugador (Pez con físicas y rebote)
        this.player = this.physics.add.image(150, 300, 'tempFish');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.physics.add.collider(this.player, this.platforms);

        // 5. Grupo de disparos (Burbujas)[cite: 3]
        this.bubbles = this.physics.add.group({
            defaultKey: 'tempBubble',
            maxSize: 30
        });

        // 6. Grupo de Power-ups (Estrellas/Burbujas especiales)[cite: 3]
        this.powerUps = this.physics.add.group();
        this.spawnPowerUp(500, 250);
        this.spawnPowerUp(680, 400);

        // Colisión de recolección (Overlap)[cite: 3]
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // 7. Controles de Teclado (Flechas/WASD + Z para disparar)[cite: 3]
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.input.keyboard.enabled = true; // Asegura el foco del teclado

        // 8. Controles Táctiles equivalentes para móvil/tablet[cite: 3]
        this.createTouchControls();

        // 9. Interfaz visual en pantalla para las pruebas del Integrante 2
        this.statusText = this.add.text(20, 20, `Vidas: ${this.lives} | Disparo: Normal`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        this.add.text(20, 48, 'Mover: Flechas | Disparar: Z | Nadar: Espacio', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#a0e7e5'
        });
    }

    update(time) {
        // Movimiento horizontal[cite: 3]
        if (this.cursors.left.isDown || this.touchState.left) {
            this.player.setVelocityX(-220);
            this.player.setFlipX(true); // Voltea el pez a la izquierda
        } else if (this.cursors.right.isDown || this.touchState.right) {
            this.player.setVelocityX(220);
            this.player.setFlipX(false); // Voltea el pez a la derecha
        } else {
            this.player.setVelocityX(0);
        }

        // Impulso de natación hacia arriba[cite: 3]
        if (this.cursors.up.isDown || this.cursors.space.isDown || this.touchState.up) {
            this.player.setVelocityY(-250);
        }

        // Sistema de disparos con cadencia[cite: 3]
        const fireCooldown = this.hasRapidFire ? 180 : 450;
        if ((this.fireKey.isDown || this.touchState.fire) && time > this.lastFired) {
            this.shootBubble();
            this.lastFired = time + fireCooldown;
        }

        // Reciclar burbujas que salen de la pantalla
        this.bubbles.getChildren().forEach((bubble) => {
            if (bubble.active && (bubble.x > 820 || bubble.x < -20)) {
                bubble.setActive(false).setVisible(false);
            }
        });
    }

    shootBubble() {
        const bubble = this.bubbles.get(this.player.x, this.player.y);
        if (bubble) {
            bubble.setActive(true).setVisible(true);
            bubble.body.setAllowGravity(false);
            const direction = this.player.flipX ? -1 : 1;
            bubble.setVelocityX(450 * direction);
            bubble.setVelocityY(-20);
        }
    }

    spawnPowerUp(x, y) {
        const powerUp = this.powerUps.create(x, y, 'tempPowerUp');
        powerUp.body.setAllowGravity(false);
        // Animación flotante
        this.tweens.add({
            targets: powerUp,
            y: y - 15,
            duration: 1200,
            yoyo: true,
            repeat: -1
        });
    }

    collectPowerUp(player, powerUp) {
        powerUp.destroy();
        this.hasRapidFire = true;
        this.statusText.setText(`Vidas: ${this.lives} | Disparo: RÁPIDO (Power-up activo)`);

        // Duración del power-up: 6 segundos
        this.time.delayedCall(6000, () => {
            this.hasRapidFire = false;
            this.statusText.setText(`Vidas: ${this.lives} | Disparo: Normal`);
        });
    }

    // Método para que el Integrante 3 reste vidas al chocar con enemigos[cite: 3]
    takeDamage() {
        this.lives = Math.max(0, this.lives - 1);
        const mode = this.hasRapidFire ? 'RÁPIDO' : 'Normal';
        this.statusText.setText(`Vidas: ${this.lives} | Disparo: ${mode}`);

        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
    }

    createTouchControls() {
        this.touchState = { left: false, right: false, up: false, fire: false };

        const makeButton = (x, y, label, key) => {
            const btn = this.add.circle(x, y, 28, 0xffffff, 0.25).setInteractive();
            this.add.text(x, y, label, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            btn.on('pointerdown', () => { this.touchState[key] = true; });
            btn.on('pointerup', () => { this.touchState[key] = false; });
            btn.on('pointerout', () => { this.touchState[key] = false; });
        };

        // Botones táctiles a los lados[cite: 3]
        makeButton(60, 500, '◀', 'left');
        makeButton(130, 500, '▶', 'right');
        makeButton(650, 500, '▲', 'up');
        makeButton(730, 500, '●', 'fire');
    }

    createTempTextures() {
        const g = this.make.graphics({ add: false });

        // Pez jugador
        g.fillStyle(0xff6f59, 1);
        g.fillCircle(18, 18, 18);
        g.generateTexture('tempFish', 36, 36);
        g.clear();

        // Burbuja de disparo
        g.fillStyle(0xa0e7e5, 0.9);
        g.fillCircle(8, 8, 8);
        g.generateTexture('tempBubble', 16, 16);
        g.clear();

        // Power-up
        g.fillStyle(0xf9ed69, 1);
        g.fillCircle(14, 14, 14);
        g.generateTexture('tempPowerUp', 28, 28);
        g.destroy();
    }
}
