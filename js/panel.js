// 1. Configuración del cliente Supabase
// (Reemplaza con tu URL y Tu Anon Key del Dashboard de Supabase)
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_KEY = 'TU_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Control de Acceso: Verificar sesión al cargar
document.addEventListener('DOMContentLoaded', () => {
  const isAuth = sessionStorage.getItem('admin_authenticated');
  if (isAuth !== 'true') {
    // Redirige al login si no ha iniciado sesión
    window.location.href = 'index.html';
    return;
  }
  
  loadApplicants();
});

// 3. Función para obtener y renderizar los postulantes
async function loadApplicants() {
  const tbody = document.getElementById('applicantsList');
  
  try {
    const { data: applicants, error } = await supabase
      .from('postulaciones') // Nombre de tu tabla en Supabase
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!applicants || applicants.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; color: var(--text-dim);">No hay postulaciones registradas aún.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = applicants.map(app => `
      <tr>
        <td><strong>${app.nombre}</strong></td>
        <td>${app.edad}</td>
        <td>
          <a href="${app.tiktok}" target="_blank" class="tiktok-link">
            ${app.tiktok_user || 'Ver Perfil'}
          </a>
        </td>
        <td>
          <a href="https://wa.me/${app.whatsapp.replace(/\D/g, '')}" target="_blank" style="color: #fff; text-decoration: none;">
            ${app.whatsapp}
          </a>
        </td>
        <td>
          <span class="status ${app.estado}">${app.estado}</span>
        </td>
        <td class="actions">
          ${app.estado === 'pending' ? `
            <button class="btn-action btn-approve" onclick="updateStatus('${app.id}', 'approved')">Aprobar</button>
            <button class="btn-action btn-reject" onclick="updateStatus('${app.id}', 'rejected')">Rechazar</button>
          ` : `
            <span style="color: var(--text-dim); font-size: 0.8rem;">Procesado</span>
          `}
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error('Error al cargar postulaciones:', err.message);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color: var(--red-alert);">
          Error al conectar con la base de datos.
        </td>
      </tr>`;
  }
}

// 4. Función para cambiar el estado (Aprobar / Rechazar)
async function updateStatus(id, newStatus) {
  try {
    const { error } = await supabase
      .from('postulaciones')
      .update({ estado: newStatus })
      .eq('id', id);

    if (error) throw error;

    // Recargar la tabla tras actualizar
    loadApplicants();

  } catch (err) {
    alert('No se pudo actualizar el estado: ' + err.message);
  }
}
