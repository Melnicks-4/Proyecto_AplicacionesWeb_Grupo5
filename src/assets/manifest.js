export const MANIFEST_IMAGENES = [
    { clave: 'pez', archivo: 'fish_orange.png' },
    { clave: 'fondo-marino', archivo: 'background_terrain.png' },
    { clave: 'alga', archivo: 'background_seaweed_a.png' },
    { clave: 'fish_orange', archivo: 'fish_orange.png' },
    { clave: 'fish_blue', archivo: 'fish_blue.png' },
    { clave: 'fish_green', archivo: 'fish_green.png' },
    { clave: 'fish_pink', archivo: 'fish_pink.png' },
    { clave: 'arena_top', archivo: 'terrain_sand_top_e.png' },
    { clave: 'roca_a', archivo: 'rock_a.png' },
    { clave: 'roca_b', archivo: 'rock_b.png' },
    { clave: 'alga_verde', archivo: 'seaweed_green_a.png' },
    { clave: 'alga_rosa', archivo: 'seaweed_pink_a.png' },
    { clave: 'alga_naranja', archivo: 'seaweed_orange_a.png' },
    { clave: 'pufferBoss', archivo: 'fish_brown_outline.png' },
    { clave: 'fish_blue_skeleton_outline', archivo: 'fish_blue_skeleton_outline.png' },
    { clave: 'fish_green_skeleton_outline', archivo: 'fish_green_skeleton_outline.png' },
    { clave: 'fish_red_skeleton_outline', archivo: 'fish_red_skeleton_outline.png' },
    { clave: 'bubble_a', archivo: 'bubble_a.png' },
    { clave: 'bubble_b', archivo: 'bubble_b.png' },
    { clave: 'bubble_c', archivo: 'bubble_c.png' }
];

export function cargarImagenes(escena, soloFaltantes = false) {
    const rutaAssets = import.meta.env.BASE_URL + 'assets/images/';

    MANIFEST_IMAGENES.forEach(({ clave, archivo }) => {
        if (soloFaltantes && escena.textures.exists(clave)) return;
        escena.load.image(clave, rutaAssets + archivo);
    });
}
