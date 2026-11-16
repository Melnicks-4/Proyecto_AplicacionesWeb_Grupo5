export function registrarColisiones(escena) {
    escena.physics.add.collider(escena.player, escena.platforms);
    escena.physics.add.overlap(
        escena.player,
        escena.powerUps,
        escena.collectPowerUp,
        null,
        escena
    );
    escena.physics.add.overlap(
        escena.player,
        escena.vidasExtra,
        escena.collectExtraLife,
        null,
        escena
    );
    escena.physics.add.overlap(
        escena.bubbles,
        escena.enemies,
        escena.onBubbleHitEnemy,
        null,
        escena
    );
    escena.physics.add.overlap(
        escena.player,
        escena.enemies,
        escena.onPlayerHitEnemy,
        null,
        escena
    );
}

export function registrarColisionDisparosJefe(escena) {
    escena.physics.add.overlap(escena.player, escena.disparosJefe, (player, disparo) => {
        disparo.disableBody(true, true);
        escena.recibirGolpeAmbiental();
    });
}
