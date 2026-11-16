export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.soundEnabled = true;
    }

    preload() {
        // Carga tus archivos de audio aquí (asegúrate de tenerlos en assets/audio/)
        this.scene.load.audio('pop', 'assets/audio/bubble.mp3');
        this.scene.load.audio('powerup', 'assets/audio/powerup.mp3');
        this.scene.load.audio('bgm', 'assets/audio/Ocean.ogg');
    }

    play(key, config = {}) {
        if (!this.soundEnabled) return;
        try {
            this.scene.sound.play(key, config);
        } catch (e) {
            console.warn(`No se pudo reproducir el sonido: ${key}`, e);
        }
    }
}
