// ==========================================
// CREDENCIALES DE ACCESO AL PANEL ADMIN
// ==========================================
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'AfterVibes2026!';

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
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3cHlzaGlwaGJ4c2t0cXVmY3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjMxMjYsImV4cCI6MjEwNDk5OTEyNn0.-2JxpF-iHJHkyT786o53XfABBT6TACptgfr-kWVOd6k'; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// CARGAR REGISTROS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const applicantsList = document.getElementById('applicantsList');

  async function fetchApplicants() {
    try {
      applicantsList.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: var(--text-dim);">Cargando solicitudes...</td>
        </tr>`;

      const { data: applicants, error } = await supabase
        .from('solicitudes')
        .select('*');

      if (error) throw error;

      if (!applicants || applicants.length === 0) {
        applicantsList.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; color: var(--text-dim);">No hay registros en la tabla "solicitudes".</td>
          </tr>`;
        return;
      }

      // Ordenar manualmente por ID descendente
      applicants.sort((a, b) => b.id - a.id);

      applicantsList.innerHTML = '';
      applicants.forEach((item) => {
        const row = document.createElement('tr');
        const rawTiktok = item.tiktok || '';
        const tiktokUser = rawTiktok.startsWith('@') ? rawTiktok : `@${rawTiktok}`;
        const tiktokClean = rawTiktok.replace('@', '');

        row.innerHTML = `
          <td><strong>${item.fullname || item.nombre || 'Sin nombre'}</strong></td>
          <td>${item.age || item.edad || '-'}</td>
          <td><a href="https://tiktok.com/@${tiktokClean}" target="_blank" class="tiktok-link">${tiktokUser}</a></td>
          <td>${item.phone || item.telefono || '-'}</td>
          <td><span class="status ${getStatusClass(item.status)}">${item.status || 'Pendiente'}</span></td>
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
      console.error('Error detallado:', err);
      applicantsList.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: #ff3366; padding: 20px;">
            ⚠️ <strong>Error de lectura:</strong> ${err.message || 'No se pudo conectar a Supabase'}
          </td>
        </tr>`;
    }
  }

  window.updateStatus = async function(id, newStatus) {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchApplicants();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  function getStatusClass(status) {
    if (status === 'Aprobado') return 'approved';
    if (status === 'Rechazado') return 'rejected';
    return 'pending';
  }

  fetchApplicants();
});
