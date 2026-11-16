// Suelo marino: arena de los assets + rocas y algas de decoración.
// Devuelve el grupo estático con el que choca el jugador.

export const ALTO_SUELO = 70;      // alto de la zona de arena (en píxeles del juego)
const ESCALA_ARENA = 0.6;          // los tiles miden 128x128 → 76.8 px en pantalla
const BORDE_TRANSPARENTE = 6;      // la ola de arriba del tile tiene un poco de transparencia

export function crearSuelo(escena) {
    const W = escena.scale.width;
    const H = escena.scale.height;
    const topeSuelo = H - ALTO_SUELO; // altura donde empieza la arena

    // 1. Tiles de arena, uno al lado del otro en toda la pantalla
    if (escena.textures.exists('arena_top')) {
        const anchoTile = 128 * ESCALA_ARENA;
        for (let x = 0; x < W; x += anchoTile) {
            escena.add.image(x, topeSuelo - BORDE_TRANSPARENTE, 'arena_top')
                .setOrigin(0, 0)
                .setScale(ESCALA_ARENA)
                .setDepth(1);
        }
    } else {
        // Respaldo si la imagen no cargó
        escena.add.rectangle(W / 2, H - ALTO_SUELO / 2, W, ALTO_SUELO, 0xe8d9a8).setDepth(1);
    }

    // 2. Rocas y algas de colores apoyadas en la arena
    const decoraciones = [
        { x: 230, clave: 'roca_a', escala: 0.55 },
        { x: 470, clave: 'alga_verde', escala: 0.6 },
        { x: 520, clave: 'alga_rosa', escala: 0.5 },
        { x: 760, clave: 'roca_b', escala: 0.5 },
        { x: 690, clave: 'alga_naranja', escala: 0.55 }
    ];
    decoraciones.forEach(({ x, clave, escala }) => {
        if (escena.textures.exists(clave)) {
            escena.add.image(x, topeSuelo + 14, clave)
                .setOrigin(0.5, 1)
                .setScale(escala)
                .setCrop(0, 4, 128, 124) // quita una línea suelta del borde superior de la imagen
                .setDepth(2);
        }
    });

    // 3. Cuerpo físico invisible: es lo que realmente choca con el pez
    const plataformas = escena.physics.add.staticGroup();
    const piso = escena.add.rectangle(W / 2, H - ALTO_SUELO / 2, W, ALTO_SUELO);
    piso.setVisible(false);
    escena.physics.add.existing(piso, true);
    plataformas.add(piso);

    return plataformas;
}