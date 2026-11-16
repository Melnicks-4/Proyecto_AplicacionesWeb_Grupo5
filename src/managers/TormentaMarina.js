const ANCHO_RAYO = 100;
const ESPERA = 4900;
const AVISO = 1400;
const DURACION = 300;

export class TormentaMarina {
    constructor(escena) {
        this.escena = escena;
        this.zona = escena.add.rectangle(0, 0, ANCHO_RAYO, escena.scale.height, 0xffcf70, 0.25)
            .setOrigin(0.5, 0).setDepth(2.75);
        this.rayo = escena.add.graphics().setDepth(8);
        this.aviso = escena.add.text(480, 166, '¡Sal de la zona marcada!', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#513b27',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setDepth(9);
        this.detener();
    }

    detener() {
        this.tiempo = 0;
        this.zona.setVisible(false);
        this.rayo.clear();
        this.aviso.setVisible(false);
    }

    dibujarRayo() {
        const x = this.zona.x;
        const alto = this.escena.scale.height;
        const puntos = [0, -23, 14, -32, 28, -12, 20, 0].map((desvio, indice) => ({
            x: x + desvio,
            y: alto * indice / 7
        }));

        this.rayo.lineStyle(22, 0x79c8ff, 0.25).strokePoints(puntos);
        this.rayo.lineStyle(11, 0x9edcff, 0.85).strokePoints(puntos);
        this.rayo.lineStyle(5, 0xfffaf0).strokePoints(puntos);
    }

    actualizar(delta) {
        const anterior = this.tiempo;
        this.tiempo += delta;
        if (this.tiempo >= ESPERA + AVISO + DURACION) {
            this.detener();
            return false;
        }

        if (anterior < ESPERA && this.tiempo >= ESPERA) {
            const mitad = ANCHO_RAYO / 2;
            this.zona.x = Math.max(mitad, Math.min(this.escena.scale.width - mitad, this.escena.player.x));
            this.zona.setFillStyle(0xffcf70, 0.25).setStrokeStyle(2, 0xffcf70).setVisible(true);
            this.aviso.setVisible(true);
        }

        if (anterior < ESPERA + AVISO && this.tiempo >= ESPERA + AVISO) {
            this.zona.setVisible(false);
            this.dibujarRayo();
            this.aviso.setVisible(false);
            const cuerpo = this.escena.player.body;
            const mitad = ANCHO_RAYO / 2;
            return cuerpo.right > this.zona.x - mitad && cuerpo.left < this.zona.x + mitad;
        }
        return false;
    }
}
