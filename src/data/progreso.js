let progreso = { puntaje: 0, nivel: 0 };

export function leerProgreso() {
    try {
        const guardado = JSON.parse(localStorage.getItem('angry-fins.progreso'));
        progreso = {
            puntaje: Math.max(progreso.puntaje, valorGuardado(guardado?.puntaje)),
            nivel: Math.max(progreso.nivel, valorGuardado(guardado?.nivel))
        };
    } catch {
        return progreso;
    }
    return progreso;
}

function valorGuardado(valor) {
    return Number.isSafeInteger(valor) && valor >= 0 ? valor : 0;
}

export function guardarResultado(puntaje, nivel) {
    const anterior = leerProgreso();
    const nuevoRecord = puntaje > anterior.puntaje;
    progreso = {
        puntaje: Math.max(puntaje, anterior.puntaje),
        nivel: Math.max(nivel, anterior.nivel)
    };

    try {
        localStorage.setItem('angry-fins.progreso', JSON.stringify(progreso));
    } catch {
        // El progreso sigue disponible durante esta sesión.
    }

    return { puntaje, nivel, record: progreso.puntaje, nuevoRecord };
}

const CLAVE_AUDIO = 'angry-fins.audio';
let audioSilenciado = false;
let audioActualizadoEnMemoria = false;

export function leerConfigAudio() {
    if (audioActualizadoEnMemoria) {
        return { silenciado: audioSilenciado };
    }

    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_AUDIO));
        audioSilenciado = guardado?.silenciado === true;
    } catch {
        return { silenciado: audioSilenciado };
    }
    return { silenciado: audioSilenciado };
}

export function guardarConfigAudio(silenciado) {
    audioSilenciado = silenciado === true;
    audioActualizadoEnMemoria = true;
    try {
        localStorage.setItem(CLAVE_AUDIO, JSON.stringify({ silenciado: audioSilenciado }));
        audioActualizadoEnMemoria = false;
    } catch {
        // Si no se puede guardar, la configuración dura solo esta sesión.
    }
}
