
(async function () {
  const statusEl = document.getElementById('supabase-status');
  const form = document.getElementById('contact-form');
  const okEl = document.getElementById('contact-ok');
  const errEl = document.getElementById('contact-error');

  if (!form) return;

  const url = window.SUPABASE_URL || "";
  const key = window.SUPABASE_ANON_KEY || "";

  if (!url || !key) {
    if (statusEl) statusEl.textContent = "Supabase not configured.";
    return;
  }

  if (statusEl) statusEl.textContent = "Supabase configured.";

  // Load Supabase JS
  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
  script.onload = () => {
    const supabase = window.supabase.createClient(url, key);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      okEl.textContent = "";
      errEl.textContent = "";

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('contact_submissions').insert(payload);
      if (error) {
        errEl.textContent = error.message || "Submission failed.";
      } else {
        okEl.textContent = "Submitted. Thank you!";
        form.reset();
      }
    });
  };
  document.body.appendChild(script);
})();
