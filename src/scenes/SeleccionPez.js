import Phaser from 'phaser';

import { texto, boton } from '../ui/ui.js';
import { PECES, CLAVE_PEZ } from '../data/peces.js';

// Pantalla para escoger el pez antes de jugar.
// Se escoge con clic/toque, o con flechas ← → y Enter.
export class SeleccionPez extends Phaser.Scene {
    constructor() {
        super('SeleccionPez');
    }

    create() {
        texto(this, 480, 50, 'Escoge tu pez', 38);

        // Si ya había uno escogido antes, empieza marcado
        const anterior = PECES.findIndex((p) => p.id === this.registry.get(CLAVE_PEZ));
        this.indice = anterior >= 0 ? anterior : 0;
        this.tarjetas = [];

        PECES.forEach((pez, i) => {
            const x = 150 + i * 220;
            const y = 260;

            const fondo = this.add.rectangle(x, y, 196, 270, 0x126481)
                .setStrokeStyle(2, 0x72d4e4)
                .setInteractive({ useHandCursor: true });

            const imagen = this.add.image(x, y - 75, pez.textura).setScale(1.1);
            texto(this, x, y + 5, pez.nombre, 24);
            this.add.text(x, y + 40, pez.poderNombre, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '17px',
                color: '#f9ed69',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            this.add.text(x, y + 82, pez.descripcion, {
                fontFamily: 'system-ui, sans-serif',
                fontSize: '14px',
                color: '#bfefff',
                align: 'center'
            }).setOrigin(0.5);

            fondo.on('pointerup', () => this.seleccionar(i));
            this.tarjetas.push({ fondo, imagen });
        });

        boton(this, 480, 460, '¡A nadar!', () => this.empezar());
        texto(this, 480, 512, '← → para elegir · Enter para jugar', 14).setAlpha(0.7);

        this.input.keyboard.on('keydown-LEFT', () => this.seleccionar((this.indice + PECES.length - 1) % PECES.length));
        this.input.keyboard.on('keydown-RIGHT', () => this.seleccionar((this.indice + 1) % PECES.length));
        this.input.keyboard.on('keydown-ENTER', () => this.empezar());

        this.seleccionar(this.indice);
    }

    seleccionar(i) {
        this.indice = i;
        this.tarjetas.forEach(({ fondo, imagen }, j) => {
            const elegido = j === i;
            fondo.setFillStyle(elegido ? 0x237d9a : 0x126481);
            fondo.setStrokeStyle(elegido ? 4 : 2, elegido ? 0xf9ed69 : 0x72d4e4);
            this.tweens.killTweensOf(imagen);
            imagen.setAngle(0);
            if (elegido) {
                // El pez escogido se mueve un poquito
                this.tweens.add({ targets: imagen, angle: 8, duration: 300, yoyo: true, repeat: -1 });
            }
        });
    }

    empezar() {
        this.registry.set(CLAVE_PEZ, PECES[this.indice].id);
        this.scene.start('Game');
    }
}