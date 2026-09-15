// ==========================================
// CREDENCIALES DE ACCESO AL PANEL ADMIN
// ==========================================
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'AfterVibes2026!';

// Verificación de sesión e ingreso de credenciales
(function checkAdminAccess() {
  const sessionAuth = sessionStorage.getItem('admin_authenticated');
  
  if (!sessionAuth) {
    const inputUser = prompt('👤 Usuario de Administrador:');
    const inputPass = prompt('🔑 Contraseña:');
    
    if (inputUser === ADMIN_USER && inputPass === ADMIN_PASS) {
      sessionStorage.setItem('admin_authenticated', 'true');
    } else {
      alert('❌ Credenciales incorrectas. Acceso denegado.');
      document.body.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100vh; color:#ff3366; font-family:'Orbitron', sans-serif; text-align:center;">
          <h1>ACCESO NO AUTORIZADO</h1>
        </div>
      `;
      throw new Error('Acceso no autorizado');
    }
  }
})();

// ==========================================
// CONFIGURACIÓN DE SUPABASE
// ==========================================
const SUPABASE_URL = 'https://twpyshiphbxsktqufcqr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__IP4v7u312QkdZpBujwZFg_7vYcXe1v';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// LÓGICA DE GESTIÓN DE SOLICITUDES
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const applicantsList = document.getElementById('applicantsList');

  // Función para obtener y renderizar la lista de postulantes
  async function fetchApplicants() {
    try {
      const { data: applicants, error } = await supabase
        .from('solicitudes')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;

      if (!applicants || applicants.length === 0) {
        applicantsList.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-dim);">No hay solicitudes registradas aún.</td></tr>`;
        return;
      }

      applicantsList.innerHTML = '';

      applicants.forEach((item) => {
        const row = document.createElement('tr');

        // Formato para usuario de TikTok
        const tiktokUser = item.tiktok.startsWith('@') ? item.tiktok : `@${item.tiktok}`;
        const tiktokClean = tiktokUser.replace('@', '');

        row.innerHTML = `
          <td><strong>${item.fullname}</strong></td>
          <td>${item.age}</td>
          <td><a href="https://tiktok.com/@${tiktokClean}" target="_blank" class="tiktok-link">${tiktokUser}</a></td>
          <td>${item.phone}</td>
          <td><span class="status ${getStatusClass(item.status)}">${item.status}</span></td>
          <td>
            <div class="actions">
              <button class="btn-action btn-approve" onclick="updateStatus(${item.id}, 'Aprobado')">Aprobar</button>
              <button class="btn-action btn-reject" onclick="updateStatus(${item.id}, 'Rechazado')">Rechazar</button>
            </div>
          </td>
        `;

        applicantsList.appendChild(row);
      });
    } catch (err) {
      console.error('Error al cargar datos desde Supabase:', err);
      applicantsList.innerHTML = `<tr><td colspan="6" style="text-align:center; color: #ff3366;">Error al conectar con la base de datos.</td></tr>`;
    }
  }

  // Función global para actualizar estado (Aprobado / Rechazado)
  window.updateStatus = async function(id, newStatus) {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Recargar la tabla con los estados actualizados
      fetchApplicants();
    } catch (err) {
      console.error('Error actualizando el estado:', err);
      alert('No se pudo actualizar el estado de la solicitud.');
    }
  };

  // Asignar clase de CSS según el estado de la solicitud
  function getStatusClass(status) {
    if (status === 'Aprobado') return 'approved';
    if (status === 'Rechazado') return 'rejected';
    return 'pending';
  }

  // Cargar datos al iniciar
  fetchApplicants();
});