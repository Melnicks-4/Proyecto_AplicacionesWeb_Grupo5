import Phaser from 'phaser';
import { CorrienteMarina } from '../managers/CorrienteMarina.js';
import { guardarResultado } from '../data/progreso.js';
import { AudioManager } from '../audio/AudioManager.js';
import { PoderManager } from '../managers/PoderManager.js';
import { CLAVE_PEZ, obtenerPez } from '../data/peces.js';
import { ALTO_SUELO, crearSuelo } from '../objects/suelo.js';
import bubbleAudioUrl from '../audio/bubble.mp3';
import oceanAudioUrl from '../audio/Ocean.mp3';
import powerUpAudioUrl from '../audio/power_up.mp3';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('Game'); // la clave 'Game' es la que usa el flujo de escenas de la persona 1
    }

    // Carga de respaldo: solo agrega los sprites si la escena de carga (persona 1)
    // todavía no los cargó. Si ya existen con ese nombre, Phaser los ignora.
    preload() {
        const assets = import.meta.env.BASE_URL + 'assets/images/'; // misma ruta que usa la persona 1
        ['fish_orange', 'fish_blue', 'fish_green', 'fish_pink'].forEach((key) => {
            if (!this.textures.exists(key)) this.load.image(key, assets + key + '.png');
        });
        [
            ['arena_top', 'terrain_sand_top_e.png'],
            ['roca_a', 'rock_a.png'],
            ['roca_b', 'rock_b.png'],
            ['alga_verde', 'seaweed_green_a.png'],
            ['alga_rosa', 'seaweed_pink_a.png'],
            ['alga_naranja', 'seaweed_orange_a.png']
        ].forEach(([key, file]) => {
            if (!this.textures.exists(key)) this.load.image(key, assets + file);
        });
        if (!this.textures.exists('pufferBoss')) {
            this.load.image('pufferBoss', assets + 'fish_brown_outline.png');
        }
        this.load.image('fish_blue_skeleton_outline', assets + 'fish_blue_skeleton_outline.png');
        this.load.image('fish_green_skeleton_outline', assets + 'fish_green_skeleton_outline.png');
        this.load.image('fish_red_skeleton_outline', assets + 'fish_red_skeleton_outline.png');
        this.load.image('bubble_a', assets + 'bubble_a.png');
        this.load.image('bubble_b', assets + 'bubble_b.png');
        this.load.image('bubble_c', assets + 'bubble_c.png');
        this.load.audio('bubble', bubbleAudioUrl);
        this.load.audio('ocean', oceanAudioUrl);
        this.load.audio('power_up', powerUpAudioUrl);
    }

    create() {
        // 1. Fondo del océano y variables de estado del jugador (Integrante 2)
        const W = this.scale.width;   // el tamaño lo define main.js (persona 1)
        const H = this.scale.height;
        this.cameras.main.setBackgroundColor('#005b82');
        if (this.textures.exists('fondo-marino')) {
            this.add.tileSprite(0, 0, W, H, 'fondo-marino').setOrigin(0).setDepth(0);
        }

        if (this.textures.exists('alga')) {
            [80, 330, 600, 860].forEach((x) => {
                this.add.image(x, H - ALTO_SUELO, 'alga').setOrigin(0.5, 1).setDepth(2);
            });
        }
        this.lives = 3;
        this.lastFired = 0;
        this.invulnerable = false;   // evita perder varias vidas de golpe
        this.totalWaves = 3;
        this.enemiesPerWave = 5;
        this.enemiesInCurrentWave = 0;
        this.pointsPerEnemy = 100;
        this.currentWave = 0;
        this.boss = null;
        this.score = 0;
        this.resultadoPendiente = false;
        this.spawnedThisWave = 0;
        this.isRoundTransitioning = false;
        this.pez = obtenerPez(this.registry.get(CLAVE_PEZ));
        this.audioManager = new AudioManager(this);

        const oceanMusic = this.sound.add('ocean', { loop: true, volume: 0.35 });
        this.oceanMusic = oceanMusic;
        const pauseMusic = () => oceanMusic.pause();
        const resumeMusic = () => oceanMusic.resume();
        this.events.on('pause', pauseMusic);
        this.events.on('resume', resumeMusic);
        this.events.once('shutdown', () => {
            this.events.off('pause', pauseMusic);
            this.events.off('resume', resumeMusic);
            oceanMusic.stop();
            oceanMusic.destroy();
        });
        oceanMusic.play();

        // 2. Texturas temporales (se usan solo si el sprite real no está cargado)
        this.createTempTextures();

        // 3. Suelo marino con arena, decoración y físicas
        this.platforms = crearSuelo(this);

        // 4. Jugador (pez con físicas y rebote)
        // *** AQUÍ VA EL NOMBRE DEL SPRITE DEL PEZ ***
        // Si 'fish_orange' fue cargado por la persona 1, se usa; si no, la bola temporal
        const fishKey = this.textures.exists(this.pez.textura) ? this.pez.textura : 'tempFish';
        this.player = this.physics.add.image(W * 0.3, 300, fishKey).setDepth(3);
        if (fishKey !== 'tempFish') {
            this.player.setScale(0.8);
            this.player.body.setSize(80, 44).setOffset(24, 42);
        }
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        this.physics.add.collider(this.player, this.platforms);
        this.poderManager = new PoderManager(this, this.pez);

        // 5. Grupo de disparos (burbujas)
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
            .setDepth(10)
            .setInteractive()
            .on('pointerdown', () => this.pauseGame());
        this.add.text(W - 40, 40, '||', {
            fontSize: '18px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(10);
        this.add.circle(W - 95, 40, 20, 0xffffff, 0.25)
            .setDepth(10)
            .setInteractive()
            .on('pointerdown', () => {
                const soundEnabled = this.audioManager.toggleSound();
                this.soundButtonText.setText(soundEnabled ? '🔊' : '🔇');
            });
        this.soundButtonText = this.add.text(
            W - 95,
            40,
            this.audioManager.soundEnabled ? '🔊' : '🔇',
            {
                fontSize: '18px',
                color: '#000000',
                stroke: '#ffffff',
                strokeThickness: 2
            }
        ).setOrigin(0.5).setDepth(10);

        // 10. Interfaz de pruebas (la persona 4 hará el HUD final)
        this.statusText = this.add.text(20, 20, `Vidas: ${this.lives} | Poder: Normal`, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setDepth(10);
        this.waveText = this.add.text(W / 2, 20, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
        this.scoreText = this.add.text(20, 72, `Puntaje: ${this.score}`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setDepth(10);

        this.add.text(20, 48, 'Mover: Flechas | Disparar: Z | Nadar: Espacio | Pausa: P', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2
        }).setDepth(10);

        this.createMinimap();
        this.actualizarEstado();
        this.corriente = new CorrienteMarina(this);
        this.startWave();
    }

    update(time, delta) {
        if (this.lives <= 0) return;

        if (time >= this.nextMinimapUpdate) {
            this.drawMinimap();
            this.nextMinimapUpdate = time + 100;
        }

        if (this.boss?.active) this.actualizarDisparosJefe();

        const empuje = this.currentWave === 2 && !this.isRoundTransitioning
            ? this.corriente.actualizar(delta) : 0;

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.touchState.left) {
            this.player.setVelocityX(-this.pez.velocidad + empuje);
            this.player.setFlipX(true); // voltea el pez a la izquierda
        } else if (this.cursors.right.isDown || this.touchState.right) {
            this.player.setVelocityX(this.pez.velocidad + empuje);
            this.player.setFlipX(false); // voltea el pez a la derecha
        } else {
            this.player.setVelocityX(empuje);
        }

        // Impulso de natación hacia arriba
        if (this.cursors.up.isDown || this.cursors.space.isDown || this.touchState.up) {
            this.player.setVelocityY(-this.pez.nado);
        }

        // Sistema de disparos con cadencia
        const fireCooldown = this.poderManager.cadencia();
        if ((this.fireKey.isDown || this.touchState.fire) && time > this.lastFired) {
            this.poderManager.disparar();
            this.lastFired = time + fireCooldown;
        }
        this.poderManager.update();

        // Reciclar burbujas que salen de la pantalla
        this.bubbles.getChildren().forEach((bubble) => {
            if (bubble.active && bubble.body.enable) {
                bubble.setVelocityX(bubble.velocidadBaseX + empuje);
            }
            if (bubble.active && (
                bubble.x > this.scale.width + 40 ||
                bubble.x < -40 ||
                bubble.y < -40
            )) {
                this.tweens.killTweensOf(bubble);
                bubble.disableBody(true, true);
            }
        });

        this.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;
            const direction = this.player.x < enemy.x ? -1 : 1;
            const cargando = enemy.isBoss && enemy.inflado;
            enemy.setVelocityX(cargando ? 0 : direction * enemy.moveSpeed);
            if (enemy.isBoss) enemy.setVelocityY(cargando ? 0 : Math.sin(time / 450) * 45);
            enemy.setFlipX(direction < 0);
        });

        if (!this.isRoundTransitioning &&
            this.spawnedThisWave === this.enemiesInCurrentWave &&
            this.enemies.countActive() === 0) {
            this.finishWave();
        }
    }

    createMinimap() {
        const panel = {
            x: this.scale.width - 190,
            y: 72,
            width: 176,
            height: 108
        };
        const map = {
            x: panel.x + 8,
            y: panel.y + 24,
            width: panel.width - 16,
            height: panel.height - 32
        };

        this.minimapPanel = panel;
        this.minimapArea = map;
        this.nextMinimapUpdate = 0;

        this.add.graphics()
            .setScrollFactor(0)
            .setDepth(11)
            .fillStyle(0x062b3c, 0.88)
            .fillRect(panel.x, panel.y, panel.width, panel.height)
            .lineStyle(2, 0x82dced, 0.95)
            .strokeRect(panel.x, panel.y, panel.width, panel.height)
            .fillStyle(0x0d5368, 0.55)
            .fillRect(map.x, map.y, map.width, map.height);

        this.add.text(panel.x + 8, panel.y + 4, 'MINIMAPA', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(12);

        this.minimapMarkers = this.add.graphics()
            .setScrollFactor(0)
            .setDepth(12);
    }

    drawMinimap() {
        const graphics = this.minimapMarkers;
        const map = this.minimapArea;
        graphics.clear();

        const drawPoint = (entity, color, radius) => {
            if (!entity?.active) return;

            const x = map.x + Phaser.Math.Clamp(entity.x / this.scale.width, 0, 1) * map.width;
            const y = map.y + Phaser.Math.Clamp(entity.y / this.scale.height, 0, 1) * map.height;
            graphics.fillStyle(color, 1);
            graphics.fillCircle(x, y, radius);
        };

        drawPoint(this.player, 0x45e6ff, 4);
        this.enemies.getChildren().forEach((enemy) => {
            drawPoint(enemy, enemy.isBoss ? 0xff4b4b : 0xffa0a0, enemy.isBoss ? 5 : 3);
        });
        this.powerUps.getChildren().forEach((powerUp) => {
            drawPoint(powerUp, 0xffdf4d, 3);
        });
    }

    startWave() {
        this.currentWave += 1;
        this.spawnedThisWave = 0;
        this.waveText.setText(`Nivel: ${this.currentWave}/${this.totalWaves}`);
        this.events.emit('wave-changed', this.currentWave, this.totalWaves);

        if (this.currentWave > 1) {
            this.spawnPowerUp(Phaser.Math.Between(250, 700), Phaser.Math.Between(150, 350));
        }

        if (this.currentWave === this.totalWaves) {
            this.enemiesInCurrentWave = 1;
            this.spawnBoss();
            return;
        }

        this.enemiesInCurrentWave = this.enemiesPerWave + (this.currentWave - 1) * 2;
        const spawnDelay = Math.max(500, 1100 - (this.currentWave - 1) * 250);
        this.waveSpawnTimer = this.time.addEvent({
            delay: spawnDelay,
            repeat: this.enemiesInCurrentWave - 1,
            callback: () => this.spawnEnemy()
        });
    }

    spawnBoss() {
        const boss = this.enemies.create(this.scale.width - 130, this.scale.height / 2, 'pufferBoss');
        boss.setScale(2).setDepth(3);
        boss.body.setSize(72, 68).setOffset(28, 30);
        boss.body.setAllowGravity(false);
        boss.setCollideWorldBounds(true);
        boss.isBoss = true;
        boss.health = 12;
        boss.maxHealth = boss.health;
        boss.moveSpeed = 65;
        boss.inflado = false;
        this.boss = boss;
        this.spawnedThisWave = 1;

        const centerX = this.scale.width / 2;
        const barWidth = 320;
        this.bossHealthText = this.add.text(centerX, 92, 'Jefe: Pez globo', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 2,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);
        this.bossHealthBackground = this.add.rectangle(centerX, 118, barWidth, 16, 0x3b1d1d)
            .setDepth(10);
        this.bossHealthBar = this.add.rectangle(centerX - barWidth / 2, 118, barWidth, 12, 0xe63946)
            .setOrigin(0, 0.5)
            .setDepth(11);
        this.updateBossHealth();

        this.estadoJefe = this.add.text(centerX, 148, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            backgroundColor: '#07334c',
            color: '#ffffff',
            padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(10);
        this.disparosJefe = this.physics.add.group({ defaultKey: 'bubble_b', maxSize: 15 });
        this.physics.add.overlap(this.player, this.disparosJefe, (player, disparo) => {
            disparo.disableBody(true, true);
            if (!this.invulnerable && !this.poderManager.tieneEscudo()) {
                this.invulnerable = true;
                this.takeDamage();
                this.time.delayedCall(1000, () => { this.invulnerable = false; });
            }
        });
        this.abrirVentanaJefe(boss);
    }

    abrirVentanaJefe(boss) {
        boss.inflado = false;
        boss.setScale(2).clearTint();
        this.estadoJefe.setText('Vulnerable · ¡Dispara!');
        this.time.delayedCall(2600, () => {
            if (!boss.active || this.lives <= 0) return;

            boss.inflado = true;
            boss.setScale(2.35).setTint(0xffc66e);
            boss.setVelocity(0, 0);
            this.estadoJefe.setText('Inflado · ¡Esquiva la ráfaga!');
            const angulo = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);

            this.time.delayedCall(1100, () => {
                if (!boss.active || this.lives <= 0) return;
                this.lanzarRafagaJefe(boss, angulo);
                this.abrirVentanaJefe(boss);
            });
        });
    }

    lanzarRafagaJefe(boss, angulo) {
        for (const apertura of [-0.52, -0.26, 0, 0.26, 0.52]) {
            const direccion = angulo + apertura;
            const x = boss.x + Math.cos(direccion) * 55;
            const y = boss.y + Math.sin(direccion) * 55;
            const disparo = this.disparosJefe.get(x, y);
            if (!disparo) break;
            disparo.enableBody(true, x, y, true, true);
            disparo.setScale(0.3).setTint(0xff8b77).setDepth(4);
            disparo.body.setCircle(disparo.width * 0.27, disparo.width * 0.23, disparo.height * 0.23);
            disparo.body.setAllowGravity(false);
            disparo.setVelocity(Math.cos(direccion) * 260, Math.sin(direccion) * 260);
        }
    }

    actualizarDisparosJefe() {
        for (const disparo of this.disparosJefe.getChildren()) {
            if (disparo.active && (
                disparo.x < -40 || disparo.x > this.scale.width + 40 ||
                disparo.y < -40 || disparo.y > this.scale.height + 40
            )) {
                disparo.disableBody(true, true);
            }
        }
    }

    updateBossHealth() {
        if (!this.boss || !this.bossHealthBar) return;
        const ratio = Phaser.Math.Clamp(this.boss.health / this.boss.maxHealth, 0, 1);
        this.bossHealthBar.setScale(ratio, 1);
        this.bossHealthText.setText(`Jefe: Pez globo (${this.boss.health}/${this.boss.maxHealth})`);
    }

    spawnEnemy() {
        const textures = ['fish_blue_skeleton_outline', 'fish_green_skeleton_outline', 'fish_red_skeleton_outline'];
        const texture = textures[(this.spawnedThisWave + this.currentWave - 1) % textures.length];
        const x = this.scale.width - 45;
        const y = Phaser.Math.Between(90, this.scale.height - 150);
        const enemy = this.enemies.create(x, y, texture);

        enemy.setScale(0.75).setDepth(3);
        enemy.body.setSize(84, 44).setOffset(22, 42);
        enemy.body.setAllowGravity(false);
        enemy.setCollideWorldBounds(true);
        enemy.moveSpeed = 75 + (this.currentWave - 1) * 35;
        this.spawnedThisWave += 1;
    }

    finishWave() {
        this.corriente.detener();
        this.isRoundTransitioning = true;

        if (this.currentWave === this.totalWaves) {
            this.events.emit('player-won', this.score);
            this.mostrarResultado('Victoria', 1000);
            return;
        }

        this.time.delayedCall(1200, () => {
            this.isRoundTransitioning = false;
            this.startWave();
        });
    }

    shootBubble(velocidadY = -20, opciones = {}) {
        const bubble = this.bubbles.get(this.player.x, this.player.y);
        if (!bubble) return; // ya hay 30 burbujas en pantalla

        // Reactiva el cuerpo físico y lo coloca en el pez
        this.tweens.killTweensOf(bubble);
        bubble.enableBody(true, this.player.x, this.player.y, true, true);
        bubble.body.setAllowGravity(false);
        bubble.setScale(opciones.escala ?? 0.5).setDepth(3);
        bubble.perfora = Boolean(opciones.perfora);
        bubble.didGrowOnHit = false;
        bubble.hitEnemies = new Set();
        if (bubble.perfora) bubble.setTint(0xffb3f0);
        else bubble.clearTint();

        // El aro de bubble_a mide 128x128; ajusta su círculo de colisión.
        if (bubble.texture.key === 'bubble_a') {
            bubble.body.setCircle(20, 44, 44);
        }

        const direction = this.player.flipX ? -1 : 1;
        bubble.velocidadBaseX = 450 * direction;
        bubble.setVelocity(bubble.velocidadBaseX, velocidadY);

        this.audioManager.play('bubble');
        this.events.emit('player-shoot'); // la persona 4 conecta el sonido
    }

    spawnPowerUp(x, y) {
        // *** AQUÍ VA EL NOMBRE DEL SPRITE DEL POWER-UP ***
        // El pack no trae un ítem de power-up: usamos el aro grande bubble_c, teñido de amarillo
        const powerUpKey = this.textures.exists('bubble_c') ? 'bubble_c' : 'tempPowerUp';
        const powerUp = this.powerUps.create(x, y, powerUpKey);
        powerUp.body.setAllowGravity(false);
        powerUp.setDepth(3);
        if (powerUpKey === 'bubble_c') {
            powerUp.setTint(0xf9ed69);
            powerUp.setScale(1.2);
            powerUp.body.setCircle(24, 40, 40);
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
        this.poderManager.activar();
        this.audioManager.play('power_up');
        this.events.emit('powerup-collected', this.pez.poder); // sonido (persona 4) y efectos (persona 3)
    }

    onBubbleHitEnemy(bubble, enemy) {
        if (!enemy.active || !bubble.body.enable || bubble.hitEnemies.has(enemy)) return;
        if (enemy.isBoss && enemy.inflado) {
            this.tweens.killTweensOf(bubble);
            bubble.disableBody(true, true);
            return;
        }
        bubble.hitEnemies.add(enemy);
        if (!bubble.didGrowOnHit) {
            bubble.didGrowOnHit = true;
            if (!bubble.perfora) {
                bubble.body.enable = false;
                bubble.setVelocity(0, 0);
            }
            this.tweens.add({
                targets: bubble,
                scaleX: 2,
                scaleY: 2,
                duration: 250,
                ease: 'Quad.Out',
                onComplete: () => {
                    if (!bubble.perfora) bubble.disableBody(true, true);
                }
            });
        }
        this.damageEnemy(enemy);
    }

    damageEnemy(enemy) {
        if (enemy.isBoss) {
            if (enemy.inflado) return;
            enemy.health -= 1;
            this.updateBossHealth();
            if (enemy.health > 0) {
                enemy.setTint(0xff7777);
                this.time.delayedCall(100, () => {
                    if (enemy.active && !enemy.inflado) enemy.clearTint();
                });
                return;
            }
        }
        this.derrotarEnemigo(enemy);
    }

    derrotarEnemigo(enemy) {
        if (!enemy || !enemy.active) return;
        if (enemy.isBoss) {
            this.tweens.killTweensOf(enemy);
            this.estadoJefe.setVisible(false);
            this.disparosJefe.clear(true, true);
            this.bossHealthText.setVisible(false);
            this.bossHealthBackground.setVisible(false);
            this.bossHealthBar.setVisible(false);
        }
        enemy.destroy();
        this.score += enemy.isBoss ? 1000 : this.pointsPerEnemy;
        this.scoreText.setText(`Puntaje: ${this.score}`);
        this.events.emit('score-changed', this.score);
        this.events.emit('enemy-hit', enemy);
    }

    // Choque con enemigo: pierde una vida y queda protegido 1 segundo
    onPlayerHitEnemy(player, enemy) {
        if (this.poderManager.tieneEscudo()) {
            if (enemy.isBoss) {
                if (this.time.now < (enemy.nextShieldHit || 0)) return;
                enemy.nextShieldHit = this.time.now + 500;
            }
            this.damageEnemy(enemy);
            return;
        }
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

        this.actualizarEstado();

        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 3
        });

        if (this.lives === 0) {
            this.corriente.detener();
            this.player.setVelocityX(0);
            this.events.emit('player-dead');
            // Flujo: sin vidas → pantalla de Game Over (escena 'Derrota' de la persona 1)
            this.mostrarResultado('Derrota', 800);
        }

    }

    mostrarResultado(escena, espera) {
        if (this.resultadoPendiente) return;
        this.resultadoPendiente = true;
        const resultado = guardarResultado(this.score, this.currentWave);
        this.time.delayedCall(espera, () => this.scene.start(escena, resultado));
    }

    actualizarEstado() {
        this.statusText.setText(`Vidas: ${this.lives} | ${this.pez.nombre} | Poder: ${this.poderManager.textoEstado()}`);
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
                .setDepth(10)
                .setInteractive(new Phaser.Geom.Circle(32, 32, 44), Phaser.Geom.Circle.Contains);
            this.add.text(x, y, label, {
                fontSize: '22px',
                color: '#000000',
                stroke: '#ffffff',
                strokeThickness: 2,
                fontStyle: 'bold'
            })
                .setOrigin(0.5)
                .setDepth(10);

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