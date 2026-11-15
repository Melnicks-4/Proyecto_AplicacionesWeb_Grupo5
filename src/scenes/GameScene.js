import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('fish_blue', 'assets/images/fish_blue.png');
        this.load.image('bubble_a', 'assets/images/bubble_a.png');
        this.load.image('bubble_c', 'assets/images/bubble_c.png');
    }

    create() {
        // 1. Fondo del océano y variables de estado del jugador (Integrante 2)
        this.cameras.main.setBackgroundColor('#005b82');
        this.lives = 3;
        this.hasRapidFire = false;
        this.lastFired = 0;
        this.invulnerable = false;   // evita perder varias vidas de golpe
        this.powerUpTimer = null;

        // 2. Generar texturas temporales para Jugador, Burbujas y Power-ups
        this.createTempTextures();

        // 3. Suelo marino estático con Arcade Physics
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(400, 565, 800, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // 4. Jugador (Pez con físicas y rebote)
        const fishKey = this.textures.exists('fish_blue') ? 'fish_blue' : 'tempFish';
        this.player = this.physics.add.image(150, 300, fishKey);
        if (fishKey === 'fish_blue') {
            this.player.setScale(0.8); 
            this.player.body.setSize(46, 28).setOffset(9, 17); 
        }
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.physics.add.collider(this.player, this.platforms);

        // 5. Grupo de disparos (Burbujas)[cite: 3]
        const bubbleKey = this.textures.exists('bubble_a') ? 'bubble_a' : 'tempBubble';
        this.bubbles = this.physics.add.group({
            defaultKey: bubbleKey,
            maxSize: 30
        });

        // 6. Grupo de Power-ups (Estrellas/Burbujas especiales)[cite: 3]
        this.powerUps = this.physics.add.group();
        this.spawnPowerUp(500, 250);
        this.spawnPowerUp(680, 400);

        // Colisión de recolección (Overlap)[cite: 3]
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // 7. Controles de Teclado (Flechas/WASD + Z para disparar)[cite: 3]
        this.enemies = this.physics.add.group();
        this.physics.add.overlap(this.bubbles, this.enemies, this.onBubbleHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);

        // 8. Controles Táctiles equivalentes para móvil/tablet[cite: 3]
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.input.keyboard.enabled = true;

        // 9. Interfaz visual en pantalla para las pruebas del Integrante 2
        this.input.addPointer(2); // permite hasta 3 dedos a la vez (mover + disparar)
        this.createTouchControls();

        // 10. Interfaz de pruebas
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
                bubble.disableBody(true, true);
            }
        });
    }

    shootBubble() {
        const bubble = this.bubbles.get(this.player.x, this.player.y);
        if (!bubble) return; // ya hay 30 burbujas en pantalla

        // Reactiva el cuerpo físico y lo coloca en el pez
        bubble.enableBody(true, this.player.x, this.player.y, true, true);
        bubble.body.setAllowGravity(false);

        // El aro de bubble_a es pequeño: se agranda y su colisión se ajusta al aro
        if (bubble.texture.key === 'bubble_a') {
            bubble.setScale(2);
            bubble.body.setCircle(8, 24, 24);
        }

        const direction = this.player.flipX ? -1 : 1;
        bubble.setVelocity(450 * direction, -20);

        this.events.emit('player-shoot'); // la persona 4 conecta el sonido
    }

    spawnPowerUp(x, y) {
        const powerUpKey = this.textures.exists('bubble_c') ? 'bubble_c' : 'tempPowerUp';
        const powerUp = this.powerUps.create(x, y, powerUpKey);
        powerUp.body.setAllowGravity(false);
        if (powerUpKey === 'bubble_c') {
            powerUp.setTint(0xf9ed69);
            powerUp.setScale(1.2);
            powerUp.body.setCircle(14, 18, 18);
        }
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
        this.events.emit('powerup-collected'); // sonido (persona 4) y efectos (persona 3)
        this.statusText.setText(`Vidas: ${this.lives} | Disparo: RÁPIDO (Power-up activo)`);

        // Si ya había un temporizador, lo cancelamos y empezamos de nuevo
        if (this.powerUpTimer) this.powerUpTimer.remove(false);
        this.powerUpTimer = this.time.delayedCall(6000, () => {
            this.hasRapidFire = false;
            this.statusText.setText(`Vidas: ${this.lives} | Disparo: Normal`);
        });
    }

    // La burbuja desaparece; la persona 3 decide qué le pasa al enemigo y el puntaje
    onBubbleHitEnemy(bubble, enemy) {
        bubble.disableBody(true, true);
        this.events.emit('enemy-hit', enemy);
    }

    // Choque con enemigo: pierde una vida y queda protegido 1 segundo
    onPlayerHitEnemy() {
        if (this.invulnerable) return;
        this.invulnerable = true;
        this.takeDamage();
        this.time.delayedCall(1000, () => { this.invulnerable = false; });
    }

    // Método para que el Integrante 3 reste vidas al chocar con enemigos[cite: 3]
    takeDamage() {
        if (this.lives <= 0) return;
        this.lives -= 1;
        this.events.emit('lives-changed', this.lives); // para el HUD (persona 4)

        const mode = this.hasRapidFire ? 'RÁPIDO' : 'Normal';
        this.statusText.setText(`Vidas: ${this.lives} | Disparo: ${mode}`);

        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });

        if (this.lives === 0) {
            this.events.emit('player-dead'); // la persona 1 muestra Game Over
        }
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
