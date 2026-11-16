const DESCANSO = 3500;
const AVISO = 1000;
const DURACION = 3200;
const CICLO = DESCANSO + AVISO + DURACION;

export class CorrienteMarina {
    constructor(escena) {
        this.escena = escena;
        this.aviso = escena.add.text(480, 110, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            backgroundColor: '#07334c',
            color: '#ffffff',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setDepth(9).setVisible(false);

        this.burbujas = Array.from({ length: 8 }, (_, indice) =>
            escena.add.image(0, 142 + (indice % 4) * 72, 'bubble_b')
                .setScale(0.18).setAlpha(0.65).setDepth(2).setVisible(false)
        );
        this.detener();
    }

    detener() {
        this.transcurrido = 0;
        this.direccion = 1;
        this.aviso.setVisible(false);
        this.burbujas.forEach((burbuja) => burbuja.setVisible(false));
    }

    actualizar(delta) {
        this.transcurrido += delta;
        if (this.transcurrido >= CICLO) {
            this.transcurrido -= CICLO;
            this.direccion *= -1;
        }

        const tiempo = this.transcurrido - DESCANSO;
        const visible = tiempo >= 0;
        const activa = tiempo >= AVISO;
        this.aviso.setVisible(visible);

        if (visible) {
            const flecha = this.direccion === 1 ? '→' : '←';
            this.aviso.setText(activa ? `Corriente activa ${flecha}` : `Se acerca una corriente ${flecha}`);
        }

        const ancho = this.escena.scale.width;
        this.burbujas.forEach((burbuja, indice) => {
            burbuja.setVisible(visible);
            if (!visible) return;
            const recorrido = (indice * 173 + tiempo * 0.24) % (ancho + 60);
            burbuja.x = this.direccion === 1 ? recorrido - 30 : ancho + 30 - recorrido;
        });

        return activa ? this.direccion * 85 : 0;
    }
}
