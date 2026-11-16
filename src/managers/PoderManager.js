// Maneja el poder especial del pez escogido.
// Cada pez tiene un poder distinto que se activa al recoger el power-up.

const DURACION_PODER = 6000; // ms

export class PoderManager {
    constructor(escena, pez) {
        this.escena = escena;
        this.pez = pez;
        this.activo = false;
        this.timer = null;
        this.escudo = null;
    }

    activar() {
        // Si ya había un poder activo, se reinicia el tiempo
        if (this.timer) this.timer.remove(false);
        if (!this.activo && this.pez.poder === 'escudo') this.crearEscudo();

        this.activo = true;
        this.timer = this.escena.time.delayedCall(DURACION_PODER, () => this.desactivar());
    }

    desactivar() {
        this.activo = false;
        this.timer = null;
        if (this.escudo) {
            this.escudo.destroy();
            this.escudo = null;
        }
        this.escena.events.emit('powerup-ended');
        this.escena.actualizarEstado();
    }

    // Tiempo entre disparos según el poder
    cadencia() {
        return this.activo && this.pez.poder === 'rapido' ? 160 : 450;
    }

    // Dispara una o varias burbujas según el poder
    disparar() {
        const escena = this.escena;
        if (!this.activo) {
            escena.crearBurbuja(-20);
            return;
        }
        switch (this.pez.poder) {
            case 'triple':
                [-150, -20, 110].forEach((vy) => escena.crearBurbuja(vy));
                break;
            case 'gigante':
                escena.crearBurbuja(-10, { escala: 1.2, perfora: true });
                break;
            default:
                escena.crearBurbuja(-20);
        }
    }

    tieneEscudo() {
        return this.activo && this.pez.poder === 'escudo';
    }

    crearEscudo() {
        const jugador = this.escena.player;
        this.escudo = this.escena.add.circle(jugador.x, jugador.y, 46, 0x9be7ff, 0.25)
            .setStrokeStyle(3, 0x9be7ff, 0.9)
            .setDepth(4);
        this.escena.tweens.add({
            targets: this.escudo,
            scale: 1.1,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    // Se llama en cada frame para que el escudo siga al pez
    update() {
        if (this.escudo) {
            this.escudo.setPosition(this.escena.player.x, this.escena.player.y);
        }
    }

    textoEstado() {
        return this.activo ? ${this.pez.poderNombre}! : 'Normal';
    }
}