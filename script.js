  // ESTO VA A RESUCITAR LAS ZONAS SÍ O SÍ
  window.verZona = function(numero) {
      console.log("Cargando zona número:", numero);
      const contenedorCentro = document.getElementById('panel-cristal');
      const infoABuscar = document.getElementById('detalle-zona' + numero);
      
      if (contenedorCentro && infoABuscar) {
          contenedorCentro.innerHTML = ''; 
          const clon = infoABuscar.cloneNode(true);
          clon.classList.remove('oculto'); 
          clon.classList.add('visible'); 
          contenedorCentro.appendChild(clon);
          
          // Efecto de subida suave
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          console.error("Error: No encontré el panel-cristal o la zona " + numero);
      }
  };

// 1. EL BOTÓN DE FONDO (Declarado una sola vez)
const btnToggle = document.getElementById('toggle-bg');

if (btnToggle) {
    btnToggle.addEventListener('click', () => {
        document.body.classList.toggle('no-background');
        const icono = btnToggle.querySelector('.icono-bg');
        if (icono) {
            icono.innerText = document.body.classList.contains('no-background') ? '✨' : '🖼️';
        }
    });
}

// 3. OTRAS SECCIONES
window.abrirSeccion = function(seccion) {
    document.querySelectorAll('.detalle-zona').forEach(det => det.classList.remove('visible'));
    const guia = document.getElementById('mensaje-guia');
    if(guia) guia.innerHTML = "<h3>Cargando " + seccion.toUpperCase() + "...</h3>";
};

// 4. FUNCIÓN REGISTRARME (La que faltaba cerrar)
window.abrirRegistro = function() {
    console.log("Abriendo registro...");
    const extra = document.getElementById('seccionRegistroExtra');
    const mail = document.getElementById('emailManual');
    const btn = document.getElementById('btnVerificar');

    if (extra) extra.style.display = 'block';
    if (mail) mail.style.display = 'block';
    if (btn) btn.style.display = 'block';
};