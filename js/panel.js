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
const SUPABASE_ANON_KEY = 'sb_publishable__IP4v7u312QkdZpBujwZFg_7vYcXe1v'; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// CARGAR REGISTROS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const applicantsList = document.getElementById('applicantsList');

  async function fetchApplicants() {
    try {
      // 1. Mensaje inicial mientras responde
      applicantsList.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: var(--text-dim);">Conectando con Supabase...</td>
        </tr>`;

      // 2. Intentar consulta con Timeout de 8 segundos
      const fetchPromise = supabase
        .from('solicitudes')
        .select('*')
        .order('id', { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera agotado. Revisa las políticas RLS o la API Key en Supabase.')), 8000)
      );

      const { data: applicants, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) throw error;

      // 3. Si la tabla está vacía
      if (!applicants || applicants.length === 0) {
        applicantsList.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; color: var(--text-dim);">No hay solicitudes registradas aún en la tabla 'solicitudes'.</td>
          </tr>`;
        return;
      }

      // 4. Renderizar registros
      applicantsList.innerHTML = '';
      applicants.forEach((item) => {
        const row = document.createElement('tr');
        const tiktokUser = (item.tiktok || '').startsWith('@') ? item.tiktok : `@${item.tiktok || ''}`;
        const tiktokClean = tiktokUser.replace('@', '');

        row.innerHTML = `
          <td><strong>${item.fullname || 'Sin nombre'}</strong></td>
          <td>${item.age || '-'}</td>
          <td><a href="https://tiktok.com/@${tiktokClean}" target="_blank" class="tiktok-link">${tiktokUser}</a></td>
          <td>${item.phone || '-'}</td>
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
      console.error('Error:', err);
      applicantsList.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: #ff3366; padding: 20px;">
            ⚠️ <strong>Error al cargar la información:</strong><br>
            <small>${err.message}</small>
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
      alert('Error actualizando estado: ' + err.message);
    }
  };

  function getStatusClass(status) {
    if (status === 'Aprobado') return 'approved';
    if (status === 'Rechazado') return 'rejected';
    return 'pending';
  }

  fetchApplicants();
});
