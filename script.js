const zonas = document.querySelectorAll('.zona-card');
const detalles = document.querySelectorAll('.detalle-zona');

zonas.forEach((zona, index) => {
  zona.addEventListener('click', () => {
    const id = `#detalle-zona${index + 1}`;
    const detalleActual = document.querySelector(id);

    // Si ya está visible, la ocultamos
    if (!detalleActual.classList.contains('oculto')) {
      detalleActual.classList.add('oculto');
      detalleActual.classList.remove('efecto-zona');
      return;
    }

    // Ocultamos todas primero
    detalles.forEach(det => {
      det.classList.add('oculto');
      det.classList.remove('efecto-zona');
    });

    // Mostramos solo la seleccionada y le agregamos la animación
    detalleActual.classList.remove('oculto');
    detalleActual.classList.add('efecto-zona');
  });
});


