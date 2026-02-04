// notificaciones.js

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('lista-notificaciones');

    // Esperar a que el padre tenga el usuario cargado
    // Como esto corre en iframe, accedemos a window.parent
    // Necesitamos db y auth del padre.
    
    // Verificamos conexión cada 500ms hasta que el padre esté listo
    const checkParent = setInterval(() => {
        if (window.parent && window.parent.db && window.parent.auth && window.parent.auth.currentUser) {
            clearInterval(checkParent);
            iniciarNotificaciones(window.parent.auth.currentUser.uid);
        }
    }, 500);

    function iniciarNotificaciones(uid) {
        const db = window.parent.db;
        const notifRef = db.ref(`notificaciones`);
        // Usamos una query para filtrar o traer las del usuario. 
        // Suponemos estructura: notificaciones/{id} -> { destinatario: 'uid', ... } 
        // O mejor estructura: notificaciones/{uid}/{notifId}
        
        // Asumo estructura: notificaciones/{uid}/{pushId}
        const userNotifRef = db.ref(`notificaciones/${uid}`);

        userNotifRef.orderByChild('timestamp').limitToLast(20).on('value', snapshot => {
            const data = snapshot.val();
            contenedor.innerHTML = '';
            
            if (!data) {
                contenedor.innerHTML = '<div class="no-notif">No tienes notificaciones nuevas</div>';
                return;
            }

            // Convertir a array y ordenar descendente (más nuevo arriba)
            const list = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value
            })).sort((a, b) => b.timestamp - a.timestamp);

            list.forEach(notif => {
                const el = document.createElement('div');
                el.className = `notif-item ${notif.read ? '' : 'unread'}`;
                
                // Formatear fecha
                const date = new Date(notif.timestamp || Date.now());
                const fechaStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

                el.innerHTML = `
                    <div class="notif-header">
                        <span>${fechaStr}</span>
                        ${!notif.read ? '<span class="badge-new">NUEVA</span>' : ''}
                    </div>
                    <div class="notif-title">${notif.titulo || 'Notificación'}</div>
                    <div class="notif-body">${notif.mensaje || ''}</div>
                `;

                el.onclick = () => manejarClick(notif, uid);
                contenedor.appendChild(el);
            });
        });
    }

    function manejarClick(notif, uid) {
        // 1. Marcar como leída
        if (!notif.read) {
            window.parent.db.ref(`notificaciones/${uid}/${notif.id}`).update({ read: true });
        }

        // 2. Acción según tipo
        if (notif.tipo === 'link' && notif.url) {
            // Abrir en nueva pestaña o en la misma según configuración
            // Por defecto links externos suelen ir en nueva pestaña
            // El usuario pidió: "que abra drive publico o bien para que se abra en la misma web"
            
            // Si es un enlace interno (no empieza con http), intentar navegar en el padre?
            // Si es drive, _blank.
            
            if (notif.url.includes('drive.google.com') || notif.target === '_blank') {
                window.open(notif.url, '_blank');
            } else {
                // Navegación interna o mismo tab
                // Si queremos cambiar la página principal:
                 window.parent.location.href = notif.url; 
            }
        } else if (notif.tipo === 'texto') {
            // Solo lectura, ya se marcó como leído
        }
    }
});
