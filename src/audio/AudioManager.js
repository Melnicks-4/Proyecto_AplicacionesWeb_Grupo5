export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.soundEnabled = !scene.sound.mute;
    }

    play(key, config = {}) {
        if (!this.soundEnabled) return;
        if (!this.scene.cache.audio.exists(key)) {
            console.warn(`El sonido '${key}' no está cargado en la caché.`);
            return;
        }

        return this.scene.sound.play(key, config);
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.scene.sound.setMute(!this.soundEnabled);
        return this.soundEnabled;
    }
}
