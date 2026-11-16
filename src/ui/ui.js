export function texto(escena, x, y, contenido, tamano) {
  return escena.add.text(x, y, contenido, {
    fontFamily: 'system-ui, sans-serif',
    fontSize: tamano,
    color: '#ecfaff'
  }).setOrigin(0.5);
}

export function boton(escena, x, y, etiqueta, accion) {
  const fondo = escena.add.rectangle(x, y, 200, 44, 0x126481)
    .setStrokeStyle(1, 0x72d4e4)
    .setInteractive({ useHandCursor: true });

  const etiquetaTexto = texto(escena, x, y, etiqueta, 18);
  fondo.on('pointerover', () => fondo.setFillStyle(0x237d9a));
  fondo.on('pointerout', () => fondo.setFillStyle(0x126481));
  fondo.on('pointerup', accion);
  return etiquetaTexto;
}
