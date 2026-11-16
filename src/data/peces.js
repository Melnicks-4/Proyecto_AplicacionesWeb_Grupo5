// Peces que el jugador puede escoger.
// Cada pez tiene su sprite, su velocidad y el poder que gana al tomar el power-up.
export const PECES = [
    {
        id: 'coral',
        nombre: 'Coral',
        textura: 'fish_orange',
        velocidad: 220,
        nado: 250,
        poder: 'rapido',
        poderNombre: 'Disparo rápido',
        descripcion: 'Dispara burbujas\nmuy seguido'
    },
    {
        id: 'marea',
        nombre: 'Marea',
        textura: 'fish_blue',
        velocidad: 200,
        nado: 240,
        poder: 'triple',
        poderNombre: 'Disparo triple',
        descripcion: 'Lanza 3 burbujas\nen abanico'
    },
    {
        id: 'musgo',
        nombre: 'Musgo',
        textura: 'fish_green',
        velocidad: 190,
        nado: 230,
        poder: 'escudo',
        poderNombre: 'Escudo',
        descripcion: 'Una burbuja lo protege\ny elimina enemigos'
    },
    {
        id: 'perla',
        nombre: 'Perla',
        textura: 'fish_pink',
        velocidad: 250,
        nado: 270,
        poder: 'gigante',
        poderNombre: 'Burbuja gigante',
        descripcion: 'Burbujas enormes que\natraviesan enemigos'
    }
];

// Clave del registry de Phaser donde se guarda el pez escogido
export const CLAVE_PEZ = 'pezElegido';

export function obtenerPez(id) {
    return PECES.find((pez) => pez.id === id) ?? PECES[0];
}