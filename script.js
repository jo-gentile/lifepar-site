window.verZona = function(numero) {
    // 1. Buscamos el DESTINO
    const contenedorCentro = document.getElementById('panel-cristal');
    
    // 2. Buscamos el ORIGEN
    const infoABuscar = document.getElementById('detalle-zona' + numero);
    
    if (contenedorCentro && infoABuscar) {
        // 3. Vaciamos el centro
        contenedorCentro.innerHTML = ''; 

        // 4. Clonamos la info
        const clon = infoABuscar.cloneNode(true);
        
        // 5. Visibilidad
        clon.style.display = 'flex'; 
        clon.classList.remove('oculto'); 
        
        // 6. ¡Al cristal!
        contenedorCentro.appendChild(clon);
        
        console.log("Éxito: Se cargó la info de la Zona " + numero);
    } else {
        if(!contenedorCentro) console.error("Error: No encontré el ID 'panel-cristal'");
        if(!infoABuscar) console.error("Error: No encontré el ID 'detalle-zona" + numero + "'");
    }
};

function abrirSeccion(seccion) {
  // Escondemos todo lo que haya en el centro
  document.querySelectorAll('.detalle-zona').forEach(det => {
    det.classList.remove('visible');
  });
  
  console.log("Abriendo sección: " + seccion);
  const guia = document.getElementById('mensaje-guia');
  if(guia) guia.innerHTML = "<h3>Cargando " + seccion.toUpperCase() + "...</h3>";
  }
};
// Control del fondo
const btn = document.getElementById('toggle-bg');
if (btn) {
    btn.addEventListener('click', () => {
        document.body.classList.toggle('no-background');
        const estado = document.body.classList.contains('no-background');
        localStorage.setItem('fondo-desactivado', estado);
    });
} // <--- Asegurate que acá también cierre bien.