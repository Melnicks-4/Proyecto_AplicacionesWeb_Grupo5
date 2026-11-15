import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        // Fondo del océano y estado inicial del jugador
        this.cameras.main.setBackgroundColor('#005b82');
        this.lives = 3;
        this.hasRapidFire = false;
        this.lastFired = 0;

        // Generar texturas temporales para Jugador, Burbujas (disparo) y Power-ups
        this.createTempTextures();

        // Suelo marino estático (Arcade Physics)
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // Jugador (Pez con físicas)
        this.player = this.physics.add.image(150, 350, 'tempFish');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.physics.add.collider(this.player, this.platforms);

        // Grupo de disparos (Burbujas con Arcade Physics)
        this.bubbles = this.physics.add.group({
            defaultKey: 'tempBubble',
            maxSize: 30
        });

        // Grupo de Power-ups (Estrellas marinas de disparo rápido)
        this.powerUps = this.physics.add.group();
        this.spawnPowerUp(500, 250);
        this.spawnPowerUp(680, 400);

        // Detección de recolección de Power-ups (overlap)[cite: 3]
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // Controles de teclado (Flechas + Tecla Z o X para disparar)[cite: 3]
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

        // Controles táctiles equivalentes (para móvil/tablet)[cite: 3]
        this.createTouchControls();

        // Indicadores visuales básicos para pruebas del Integrante 2
        this.statusText = this.add.text(20, 20, `Vidas: ${this.lives} | Disparo: Normal`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        this.add.text(20, 48, 'Teclado: Flechas (Mover/Nadar) + Z (Disparar) | Móvil: Botones en pantalla', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#a0e7e5'
        });
    }

    update(time) {
        // Movimiento horizontal
        if (this.cursors.left.isDown || this.touchState.left) {
            this.player.setVelocityX(-220);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown || this.touchState.right) {
            this.player.setVelocityX(220);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
        }

        // Impulso de natación hacia arriba
        if (this.cursors.up.isDown || this.cursors.space.isDown || this.touchState.up) {
            this.player.setVelocityY(-240);
        }

        // Disparo continuo con cadencia controlada
        const fireCooldown = this.hasRapidFire ? 180 : 450;
        if ((this.fireKey.isDown || this.touchState.fire) && time > this.lastFired) {
            this.shootBubble();
            this.lastFired = time + fireCooldown;
        }

        // Reciclar burbujas que salen de la pantalla
        this.bubbles.children.each((bubble) => {
            if (bubble.active && (bubble.x > 820 || bubble.x < -20)) {
                bubble.setActive(false).setVisible(false);
            }
        });
    }

    shootBubble() {
        const bubble = this.bubbles.get(this.player.x, this.player.y);
        if (bubble) {
            bubble.setActive(true).setVisible(true);
            bubble.body.setAllowGravity(false); // Las burbujas viajan rectas en el agua
            const direction = this.player.flipX ? -1 : 1;
            bubble.setVelocityX(450 * direction);
            bubble.setVelocityY(-20); // Ligera flotabilidad hacia arriba
        }
    }

    spawnPowerUp(x, y) {
        const powerUp = this.powerUps.create(x, y, 'tempPowerUp');
        powerUp.body.setAllowGravity(false);
        // Animación suave de flotación
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

        // El efecto dura 6 segundos
        this.time.delayedCall(6000, () => {
            this.hasRapidFire = false;
            this.statusText.setText(`Vidas: ${this.lives} | Disparo: Normal`);
        });
    }

    // Método público para que el Integrante 3 (Enemigos) reste vidas al jugador
    takeDamage() {
        this.lives = Math.max(0, this.lives - 1);
        const mode = this.hasRapidFire ? 'RÁPIDO' : 'Normal';
        this.statusText.setText(`Vidas: ${this.lives} | Disparo: ${mode}`);

        // Efecto visual de parpadeo al recibir impacto
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

        // Botones direccionales a la izquierda y acción a la derecha
        makeButton(60, 500, '◀', 'left');
        makeButton(130, 500, '▶', 'right');
        makeButton(650, 500, '▲', 'up');
        makeButton(730, 500, '●', 'fire');
    }

    createTempTextures() {
        const g = this.make.graphics({ add: false });

        // Pez jugador (naranja)
        g.fillStyle(0xff6f59, 1);
        g.fillCircle(18, 18, 18);
        g.generateTexture('tempFish', 36, 36);
        g.clear();

        // Burbuja de disparo (celeste)
        g.fillStyle(0xa0e7e5, 0.9);
        g.fillCircle(8, 8, 8);
        g.generateTexture('tempBubble', 16, 16);
        g.clear();

        // Power-up (amarillo dorado)
        g.fillStyle(0xf9ed69, 1);
        g.fillCircle(14, 14, 14);
        g.generateTexture('tempPowerUp', 28, 28);
        g.destroy();
    }
}