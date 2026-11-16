import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('Game'); // la clave 'Game' es la que usa el flujo de escenas de la persona 1
    }

    // Carga de respaldo: solo agrega los sprites si la escena de carga (persona 1)
    // todavía no los cargó. Si ya existen con ese nombre, Phaser los ignora.
    preload() {
        const assets = import.meta.env.BASE_URL + 'assets/images/'; // misma ruta que usa la persona 1
        this.load.image('fish_orange', assets + 'fish_orange.png');
        this.load.image('fish_blue', assets + 'fish_blue.png');
        this.load.image('fish_green', assets + 'fish_green.png');
        this.load.image('fish_red', assets + 'fish_red.png');
        this.load.image('bubble_a', assets + 'bubble_a.png');
        this.load.image('bubble_c', assets + 'bubble_c.png');
    }

    create() {
        // 1. Fondo del océano y variables de estado del jugador (Integrante 2)
        const W = this.scale.width;   // el tamaño lo define main.js (persona 1)
        const H = this.scale.height;
        this.cameras.main.setBackgroundColor('#005b82');
        // Fondo de agua: el tile mide 64x64, se REPITE para cubrir toda la pantalla
        if (this.textures.exists('fondo-marino')) {
            this.add.tileSprite(0, 0, W, H, 'fondo-marino').setOrigin(0x7aa9c4);
        }

        // Algas decorativas apoyadas en el suelo
        if (this.textures.exists('alga')) {
            [80, 330, 600, 860].forEach((x) => {
                this.add.image(x, H - 70, 'alga').setOrigin(0.5, 1);
            });
        }
        this.lives = 3;
        this.hasRapidFire = false;
        this.lastFired = 0;
        this.invulnerable = false;   // evita perder varias vidas de golpe
        this.powerUpTimer = null;    // temporizador del power-up activo
        this.totalWaves = 3;
        this.enemiesPerWave = 5;
        this.pointsPerEnemy = 100;
        this.currentWave = 0;
        this.score = 0;
        this.spawnedThisWave = 0;
        this.isRoundTransitioning = false;

        // 2. Texturas temporales (se usan solo si el sprite real no está cargado)
        this.createTempTextures();

        // 3. Suelo marino estático con Arcade Physics
        this.platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(W / 2, H - 35, W, 70, 0x143d59);
        this.physics.add.existing(ground, true);
        this.platforms.add(ground);

        // 4. Jugador (pez con físicas y rebote)
        // *** AQUÍ VA EL NOMBRE DEL SPRITE DEL PEZ ***
        // Si 'fish_orange' fue cargado por la persona 1, se usa; si no, la bola temporal
        const fishKey = this.textures.exists('fish_orange') ? 'fish_orange' : 'tempFish';
        this.player = this.physics.add.image(W * 0.3, 300, fishKey);
        if (fishKey === 'fish_orange') {
            this.player.setScale(0.8); // el sprite mide 64x64; ajusta 0.8 si se ve grande/pequeño
            this.player.body.setSize(46, 28).setOffset(9, 17); // caja de colisión ajustada al pez
        }
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.physics.add.collider(this.player, this.platforms);

        // 5. Grupo de disparos (burbujas)
        // *** AQUÍ VA EL NOMBRE DEL SPRITE DE LA BURBUJA ***
        const bubbleKey = this.textures.exists('bubble_a') ? 'bubble_a' : 'tempBubble';
        this.bubbles = this.physics.add.group({
            defaultKey: bubbleKey,
            maxSize: 30
        });

        // 6. Grupo de power-ups
        this.powerUps = this.physics.add.group();
        this.spawnPowerUp(500, 250);
        this.spawnPowerUp(680, 400);

        // Colisión de recolección (overlap)
        this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);

        // 7. Enemigos y colisiones
        this.enemies = this.physics.add.group();
        this.physics.add.overlap(this.bubbles, this.enemies, this.onBubbleHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);

        // 8. Controles de teclado (flechas + Z para disparar)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.input.keyboard.enabled = true; // asegura el foco del teclado

        // 9. Controles táctiles equivalentes para móvil/tablet
        this.input.addPointer(2); // permite hasta 3 dedos a la vez (mover + disparar)
        this.createTouchControls();

        // Pausa: tecla P o Esc, y botón ⏸ para pantallas táctiles
        this.input.keyboard.on('keydown-P', this.pauseGame, this);
        this.input.keyboard.on('keydown-ESC', this.pauseGame, this);
        this.add.circle(W - 40, 40, 20, 0xffffff, 0.25)
            .setInteractive()
            .on('pointerdown', () => this.pauseGame());
        this.add.text(W - 40, 40, '||', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

        // 10. Interfaz de pruebas (la persona 4 hará el HUD final)
        this.statusText = this.add.text(20, 20, `Vidas: ${this.lives} | Disparo: Normal`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.waveText = this.add.text(W / 2, 20, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.scoreText = this.add.text(20, 72, `Puntaje: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        });

        this.add.text(20, 48, 'Mover: Flechas | Disparar: Z | Nadar: Espacio | Pausa: P', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#a0e7e5'
        });

        this.startWave();
    }

    update(time) {
        if (this.lives <= 0 || this.isRoundTransitioning) return;

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.touchState.left) {
            this.player.setVelocityX(-220);
            this.player.setFlipX(true); // voltea el pez a la izquierda
        } else if (this.cursors.right.isDown || this.touchState.right) {
            this.player.setVelocityX(220);
            this.player.setFlipX(false); // voltea el pez a la derecha
        } else {
            this.player.setVelocityX(0);
        }

        // Impulso de natación hacia arriba
        if (this.cursors.up.isDown || this.cursors.space.isDown || this.touchState.up) {
            this.player.setVelocityY(-250);
        }

        // Sistema de disparos con cadencia
        const fireCooldown = this.hasRapidFire ? 180 : 450;
        if ((this.fireKey.isDown || this.touchState.fire) && time > this.lastFired) {
            this.shootBubble();
            this.lastFired = time + fireCooldown;
        }

        // Reciclar burbujas que salen de la pantalla
        this.bubbles.getChildren().forEach((bubble) => {
            if (bubble.active && (bubble.x > this.scale.width + 20 || bubble.x < -20)) {
                bubble.disableBody(true, true);
            }
        });

        this.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;
            const direction = this.player.x < enemy.x ? -1 : 1;
            enemy.setVelocityX(direction * enemy.moveSpeed);
            enemy.setFlipX(direction < 0);
        });

        if (this.spawnedThisWave === this.enemiesPerWave && this.enemies.countActive() === 0) {
            this.finishWave();
        }
    }

    startWave() {
        this.currentWave += 1;
        this.spawnedThisWave = 0;
        this.waveText.setText(`Oleada: ${this.currentWave}/${this.totalWaves}`);
        this.events.emit('wave-changed', this.currentWave, this.totalWaves);

        const spawnDelay = Math.max(500, 1100 - (this.currentWave - 1) * 250);
        this.waveSpawnTimer = this.time.addEvent({
            delay: spawnDelay,
            repeat: this.enemiesPerWave - 1,
            callback: () => this.spawnEnemy()
        });
    }

    spawnEnemy() {
        const textures = ['fish_blue', 'fish_green', 'fish_red'];
        const texture = textures[(this.spawnedThisWave + this.currentWave - 1) % textures.length];
        const x = this.scale.width - 45;
        const y = Phaser.Math.Between(90, this.scale.height - 150);
        const enemy = this.enemies.create(x, y, texture);

        enemy.setScale(0.75);
        enemy.body.setSize(42, 30).setOffset(11, 17);
        enemy.body.setAllowGravity(false);
        enemy.setCollideWorldBounds(true);
        enemy.moveSpeed = 75 + (this.currentWave - 1) * 35;
        this.spawnedThisWave += 1;
    }

    finishWave() {
        this.isRoundTransitioning = true;

        if (this.currentWave === this.totalWaves) {
            this.events.emit('player-won', this.score);
            this.time.delayedCall(1000, () => this.scene.start('Victoria'));
            return;
        }

        this.time.delayedCall(1200, () => {
            this.isRoundTransitioning = false;
            this.startWave();
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
        // *** AQUÍ VA EL NOMBRE DEL SPRITE DEL POWER-UP ***
        // El pack no trae un ítem de power-up: usamos el aro grande bubble_c, teñido de amarillo
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

    onBubbleHitEnemy(bubble, enemy) {
        if (!enemy.active) return;
        bubble.disableBody(true, true);
        enemy.destroy();
        this.score += this.pointsPerEnemy;
        this.scoreText.setText(`Puntaje: ${this.score}`);
        this.events.emit('score-changed', this.score);
        this.events.emit('enemy-hit', enemy);
    }

    // Choque con enemigo: pierde una vida y queda protegido 1 segundo
    onPlayerHitEnemy() {
        if (this.invulnerable) return;
        this.invulnerable = true;
        this.takeDamage();
        this.time.delayedCall(1000, () => { this.invulnerable = false; });
    }

    // Resta una vida y avisa a los demás módulos
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
            this.player.setVelocityX(0);
            this.events.emit('player-dead');
            // Flujo: sin vidas → pantalla de Game Over (escena 'Derrota' de la persona 1)
            this.time.delayedCall(800, () => this.scene.start('Derrota'));
        }
    }

    // Abre la escena de pausa; 'Pausa' se encarga de reanudar esta escena
    pauseGame() {
        if (this.lives <= 0) return;
        // Si la escena 'Pausa' no está registrada en main.js, no pausamos (el juego quedaría congelado)
        if (!this.scene.manager.keys['Pausa']) {
            console.warn("Falta registrar la escena 'Pausa' en main.js (persona 1)");
            return;
        }
        // Suelta los botones táctiles para que el pez no siga moviéndose al volver
        Object.keys(this.touchState).forEach((k) => { this.touchState[k] = false; });
        this.scene.launch('Pausa');
        this.scene.pause();
    }

    createTouchControls() {
        this.touchState = { left: false, right: false, up: false, fire: false };

        const makeButton = (x, y, label, key) => {
            // Zona táctil más grande que el dibujo (radio 44 vs 32) para que sea fácil tocar con el dedo
            const btn = this.add.circle(x, y, 32, 0xffffff, 0.25)
                .setInteractive(new Phaser.Geom.Circle(32, 32, 44), Phaser.Geom.Circle.Contains);
            this.add.text(x, y, label, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

            let releaseTimer = null;

            const press = () => {
                if (releaseTimer) releaseTimer.remove(false); // si vuelve a tocar, cancela el apagado
                this.touchState[key] = true;
                btn.setFillStyle(0xffffff, 0.5);              // feedback visual al presionar
            };

            const release = () => {
                btn.setFillStyle(0xffffff, 0.25);
                // Mantiene el botón activo 120 ms más: así un toque rápido también se registra
                releaseTimer = this.time.delayedCall(120, () => { this.touchState[key] = false; });
            };

            btn.on('pointerdown', press);
            btn.on('pointerup', release);
            btn.on('pointerout', release);
            btn.on('pointerupoutside', release);
        };

        // Botones táctiles a los lados (posición según el tamaño del juego)
        const W = this.scale.width;
        const y = this.scale.height - 130; // por encima del suelo marino
        makeButton(60, y, '◀', 'left');
        makeButton(150, y, '▶', 'right');
        makeButton(W - 150, y, '▲', 'up');
        makeButton(W - 60, y, '●', 'fire');
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