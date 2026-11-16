export function crearTunelCoral(escena) {
    const techo = escena.add.rectangle(175, 323, 350, 26, 0x694461)
        .setStrokeStyle(2, 0xba7391).setDepth(2);
    escena.physics.add.existing(techo, true);
    escena.platforms.add(techo);

    const corales = [42, 128, 216, 308].map((x, indice) =>
        escena.add.image(x, 318, indice % 2 === 0 ? 'alga_rosa' : 'alga_naranja')
            .setOrigin(0.5, 1).setScale(0.42).setDepth(2)
    );
    const entrada = escena.add.text(367, 342, '← Túnel de coral', {
        fontFamily: 'Arial',
        fontSize: '16px',
        backgroundColor: '#07334c',
        color: '#ffffff',
        padding: { x: 8, y: 4 }
    }).setDepth(8);

    const premio = escena.spawnPowerUp(80, 414);
    premio.esPremioDelTunel = true;
    return () => {
        if (premio.active) {
            escena.tweens.killTweensOf(premio);
            premio.destroy();
        }
        techo.destroy();
        corales.forEach((coral) => coral.destroy());
        entrada.destroy();
    };
}
