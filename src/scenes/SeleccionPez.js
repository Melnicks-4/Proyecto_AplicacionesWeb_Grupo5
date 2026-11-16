import Phaser from 'phaser';

export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
    }

    create() {
        this.add.text(this.scale.width / 2, 80, 'ELIGE TU PEZ', {
            fontSize: '32px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const fishes = [
            { id: 'fish_blue', name: 'Azul Veloz', power: 'Velocidad x2', color: '#00f' },
            { id: 'fish_orange', name: 'Naranja Explosivo', power: 'Super Rebote', color: '#f80' },
            { id: 'fish_pink', name: 'Rosa Ligero', power: 'Gravedad Baja', color: '#f0f' }
        ];

        let startX = this.scale.width / 2 - 200;

        fishes.forEach((fish, index) => {
            let container = this.add.container(startX + (index * 200), 300);

            let bg = this.add.rectangle(0, 0, 150, 200, 0x222222)
                .setInteractive()
                .setStrokeStyle(2, 0xffffff);

            let sprite = this.add.sprite(0, -30, fish.id);
            let nameText = this.add.text(0, 40, fish.name, { fontSize: '14px', color: '#fff' }).setOrigin(0.5);
            let powerText = this.add.text(0, 70, `Poder: ${fish.power}`, { fontSize: '10px', color: '#ff0' }).setOrigin(0.5);

            container.add([bg, sprite, nameText, powerText]);

            // Al hacer clic, guardamos el pez seleccionado y comenzamos el juego
            bg.on('pointerdown', () => {
                this.registry.set('selectedFish', fish);
                this.scene.start('GameScene');
            });
        });
    }
}