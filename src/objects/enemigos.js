import Phaser from 'phaser';
import { registrarColisionDisparosJefe } from '../physics/colisiones.js';

export function spawnBoss(escena) {
    const boss = escena.enemies.create(escena.scale.width - 130, escena.scale.height / 2, 'pufferBoss');
    boss.setScale(2).setDepth(3);
    boss.body.setSize(72, 68).setOffset(28, 30);
    boss.body.setAllowGravity(false);
    boss.setCollideWorldBounds(true);
    boss.isBoss = true;
    boss.health = 12;
    boss.maxHealth = boss.health;
    boss.moveSpeed = 65;
    boss.inflado = false;
    escena.boss = boss;
    escena.spawnedThisWave = 1;

    const centerX = escena.scale.width / 2;
    const barWidth = 320;
    escena.bossHealthText = escena.add.text(centerX, 92, 'Jefe: Pez globo', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 2,
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
    escena.bossHealthBackground = escena.add.rectangle(centerX, 118, barWidth, 16, 0x3b1d1d)
        .setDepth(10);
    escena.bossHealthBar = escena.add.rectangle(centerX - barWidth / 2, 118, barWidth, 12, 0xe63946)
        .setOrigin(0, 0.5)
        .setDepth(11);
    updateBossHealth(escena);

    escena.estadoJefe = escena.add.text(centerX, 148, '', {
        fontFamily: 'Arial',
        fontSize: '18px',
        backgroundColor: '#07334c',
        color: '#ffffff',
        padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setDepth(10);
    escena.disparosJefe = escena.physics.add.group({ defaultKey: 'bubble_b', maxSize: 15 });
    registrarColisionDisparosJefe(escena);
    abrirVentanaJefe(escena, boss);
}

export function abrirVentanaJefe(escena, boss) {
    boss.inflado = false;
    boss.setScale(2).clearTint();
    escena.estadoJefe.setText('Vulnerable · ¡Dispara!');
    escena.time.delayedCall(2600, () => {
        if (!boss.active || escena.lives <= 0) return;

        boss.inflado = true;
        boss.setScale(2.35).setTint(0xffc66e);
        boss.setVelocity(0, 0);
        escena.estadoJefe.setText('Inflado · ¡Esquiva la ráfaga!');
        const angulo = Phaser.Math.Angle.Between(boss.x, boss.y, escena.player.x, escena.player.y);

        escena.time.delayedCall(1100, () => {
            if (!boss.active || escena.lives <= 0) return;
            lanzarRafagaJefe(escena, boss, angulo);
            abrirVentanaJefe(escena, boss);
        });
    });
}

function lanzarRafagaJefe(escena, boss, angulo) {
    for (const apertura of [-0.52, -0.26, 0, 0.26, 0.52]) {
        const direccion = angulo + apertura;
        const x = boss.x + Math.cos(direccion) * 55;
        const y = boss.y + Math.sin(direccion) * 55;
        const disparo = escena.disparosJefe.get(x, y);
        if (!disparo) break;
        disparo.enableBody(true, x, y, true, true);
        disparo.setScale(0.3).setTint(0xff8b77).setDepth(4);
        disparo.body.setCircle(disparo.width * 0.27, disparo.width * 0.23, disparo.height * 0.23);
        disparo.body.setAllowGravity(false);
        disparo.setVelocity(Math.cos(direccion) * 260, Math.sin(direccion) * 260);
    }
}

export function actualizarDisparosJefe(escena) {
    for (const disparo of escena.disparosJefe.getChildren()) {
        if (disparo.active && (
            disparo.x < -40 || disparo.x > escena.scale.width + 40 ||
            disparo.y < -40 || disparo.y > escena.scale.height + 40
        )) {
            disparo.disableBody(true, true);
        }
    }
}

export function updateBossHealth(escena) {
    if (!escena.boss || !escena.bossHealthBar) return;
    const ratio = Phaser.Math.Clamp(escena.boss.health / escena.boss.maxHealth, 0, 1);
    escena.bossHealthBar.setScale(ratio, 1);
    escena.bossHealthText.setText(`Jefe: Pez globo (${escena.boss.health}/${escena.boss.maxHealth})`);
}

export function spawnEnemy(escena) {
    const textures = ['fish_blue_skeleton_outline', 'fish_green_skeleton_outline', 'fish_red_skeleton_outline'];
    const texture = textures[(escena.spawnedThisWave + escena.currentWave - 1) % textures.length];
    const x = escena.scale.width - 45;
    const y = Phaser.Math.Between(90, escena.scale.height - 150);
    const enemy = escena.enemies.create(x, y, texture);

    enemy.setScale(0.75).setDepth(3);
    enemy.body.setSize(84, 44).setOffset(22, 42);
    enemy.body.setAllowGravity(false);
    enemy.setCollideWorldBounds(true);
    enemy.moveSpeed = 75 + (escena.currentWave - 1) * 35;
    enemy.patron = ['patrulla', 'zigzag', 'persecucion'][escena.spawnedThisWave % 3];
    enemy.direccion = -1;
    enemy.tiempoNado = Phaser.Math.Between(0, 1000);
    escena.spawnedThisWave += 1;
}

export function moverEnemigo(escena, enemy, delta) {
    enemy.tiempoNado += delta;
    const margen = 45;
    const fondo = escena.scale.height - 120;
    if (enemy.x <= margen) enemy.direccion = 1;
    if (enemy.x >= escena.scale.width - margen) enemy.direccion = -1;

    let velocidadY = 0;
    if (enemy.patron === 'zigzag') {
        velocidadY = Math.sin(enemy.tiempoNado / 260) * 95;
    }

    const buscando = enemy.patron === 'persecucion' && enemy.tiempoNado % 3200 < 1250;
    let velocidadX = enemy.direccion * enemy.moveSpeed;
    if (buscando && Phaser.Math.Distance.Between(enemy.x, enemy.y, escena.player.x, escena.player.y) < 260) {
        velocidadX = Phaser.Math.Clamp(escena.player.x - enemy.x, -enemy.moveSpeed, enemy.moveSpeed);
        velocidadY = Phaser.Math.Clamp(escena.player.y - enemy.y, -70, 70);
    }

    if ((enemy.y <= 95 && velocidadY < 0) || (enemy.y >= fondo && velocidadY > 0)) {
        velocidadY = 0;
    }
    enemy.setVelocity(velocidadX, velocidadY);
    if (velocidadX !== 0) enemy.setFlipX(velocidadX < 0);
}

export function actualizarEnemigos(escena, time, delta) {
    escena.enemies.getChildren().forEach((enemy) => {
        if (!enemy.active) return;
        if (!enemy.isBoss) {
            moverEnemigo(escena, enemy, delta);
            return;
        }
        const direction = escena.player.x < enemy.x ? -1 : 1;
        const cargando = enemy.inflado;
        enemy.setVelocityX(cargando ? 0 : direction * enemy.moveSpeed);
        enemy.setVelocityY(cargando ? 0 : Math.sin(time / 450) * 45);
        enemy.setFlipX(direction < 0);
    });
}

export function damageEnemy(escena, enemy) {
    if (enemy.isBoss) {
        if (enemy.inflado) return;
        enemy.health -= 1;
        updateBossHealth(escena);
        if (enemy.health > 0) {
            enemy.setTint(0xff7777);
            escena.time.delayedCall(100, () => {
                if (enemy.active && !enemy.inflado) enemy.clearTint();
            });
            return;
        }
    }
    derrotarEnemigo(escena, enemy);
}

export function derrotarEnemigo(escena, enemy) {
    if (!enemy || !enemy.active) return;
    if (enemy.isBoss) {
        escena.tweens.killTweensOf(enemy);
        escena.estadoJefe.setVisible(false);
        escena.disparosJefe.clear(true, true);
        escena.bossHealthText.setVisible(false);
        escena.bossHealthBackground.setVisible(false);
        escena.bossHealthBar.setVisible(false);
    }
    enemy.destroy();
    escena.score += enemy.isBoss ? 1000 : escena.pointsPerEnemy;
    escena.scoreText.setText(`Puntaje: ${escena.score}`);
    escena.events.emit('score-changed', escena.score);
    escena.events.emit('enemy-hit', enemy);
}
