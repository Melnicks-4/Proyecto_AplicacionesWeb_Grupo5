import Phaser from 'phaser';

export function createTouchControls(escena) {
    const touchState = { left: false, right: false, up: false, fire: false };

    const makeButton = (x, y, label, key) => {
        const btn = escena.add.circle(x, y, 32, 0xffffff, 0.25)
            .setDepth(10)
            .setInteractive(new Phaser.Geom.Circle(32, 32, 44), Phaser.Geom.Circle.Contains);
        escena.add.text(x, y, label, {
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
            if (releaseTimer) releaseTimer.remove(false);
            touchState[key] = true;
            btn.setFillStyle(0xffffff, 0.5);
        };

        const release = () => {
            btn.setFillStyle(0xffffff, 0.25);
            releaseTimer = escena.time.delayedCall(120, () => { touchState[key] = false; });
        };

        btn.on('pointerdown', press);
        btn.on('pointerup', release);
        btn.on('pointerout', release);
        btn.on('pointerupoutside', release);
    };

    const width = escena.scale.width;
    const y = escena.scale.height - 130;
    makeButton(60, y, '◀', 'left');
    makeButton(150, y, '▶', 'right');
    makeButton(width - 150, y, '▲', 'up');
    makeButton(width - 60, y, '●', 'fire');

    return touchState;
}

export function releaseTouchControls(touchState) {
    Object.keys(touchState).forEach((key) => { touchState[key] = false; });
}
