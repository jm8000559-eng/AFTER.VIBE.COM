// Configuración de Supabase
const SUPABASE_URL = 'https://twpyshiphbxsktqufcqr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__IP4v7u312QkdZpBujwZFg_7vYcXe1v';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const joinForm = document.getElementById('joinForm');

  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnSubmit = joinForm.querySelector('button[type="submit"]');
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'ENVIANDO...';

      const applicantData = {
        fullname: document.getElementById('fullname').value.trim(),
        age: parseInt(document.getElementById('age').value.trim()),
        tiktok: document.getElementById('tiktok').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        status: 'Pendiente'
      };

      try {
        const { data, error } = await supabase
          .from('solicitudes')
          .insert([applicantData]);

        if (error) throw error;

        alert('🔥 ¡Solicitud enviada con éxito! El equipo de After Vibes te contactará pronto.');
        joinForm.reset();
      } catch (err) {
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al enviar la solicitud. Inténtalo de nuevo.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = 'ENVIAR SOLICITUD';
      }
    });
  }
});
