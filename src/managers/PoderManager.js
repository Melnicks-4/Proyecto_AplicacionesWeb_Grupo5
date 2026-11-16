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
        if (this.timer) this.timer.remove(false);
        if (!this.activo && this.pez.poder === 'escudo') this.crearEscudo();

        this.activo = true;
        this.timer = this.escena.time.delayedCall(DURACION_PODER, () => this.desactivar());
        this.escena.actualizarEstado();
    }

    desactivar() {
        if (!this.activo) return;
        this.activo = false;
        this.timer = null;
        if (this.escudo) {
            this.escena.tweens.killTweensOf(this.escudo);
            this.escudo.destroy();
            this.escudo = null;
        }
        this.escena.events.emit('powerup-ended');
        this.escena.actualizarEstado();
    }

    cadencia() {
        return this.activo && this.pez.poder === 'rapido' ? 160 : 450;
    }

    disparar() {
        if (!this.activo) {
            this.escena.shootBubble();
            return;
        }
        switch (this.pez.poder) {
            case 'triple':
                [-150, -20, 110].forEach((vy) => this.escena.shootBubble(vy));
                break;
            case 'gigante':
                this.escena.shootBubble(-10, { escala: 1.2, perfora: true });
                break;
            default:
                this.escena.shootBubble();
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

    update() {
        if (this.escudo && this.escena.player.active) {
            this.escudo.setPosition(this.escena.player.x, this.escena.player.y);
        }
    }

    textoEstado() {
        return this.activo ? `${this.pez.poderNombre}!` : 'Normal';
    }
}