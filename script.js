// =================== PERSONALIZA AQUÍ ===================
// Fecha y hora local del evento. Las 18:00 son provisionales.
const EVENT_DATE = "2026-12-05T14:00:00";

// Reemplaza con el teléfono de WhatsApp con código de país, solo números.
// Ejemplo de México: 525512345678. Este número es solo un marcador.
const WHATSAPP_NUMBER = "527472546662";

// Sustituye estas direcciones por los nombres o direcciones reales de las sedes.
const CEREMONY_LOCATION = "Dirección de la ceremonia por confirmar";
const RECEPTION_LOCATION = "Dirección de la recepción por confirmar";
// =========================================================

const envelopeScreen = document.getElementById("envelopeScreen");
const openButton = document.getElementById("openInvitation");
const openLabel = document.getElementById("openLabel");
const invitation = document.getElementById("invitation");
const music = document.getElementById("invitationMusic");

let opened = false;

async function openInvitation() {
  if (opened) return;
  opened = true;

  // Empieza a solicitar la reproducción durante el toque del usuario.
  // Es la opción más compatible con las restricciones de autoplay móvil.
  try {
    music.volume = 0.42;
    await music.play();
  } catch (error) {
    // Si falta el MP3 o el navegador lo bloquea, la invitación sigue abriendo.
    console.info("Añade assets/piano-romantico.mp3 y prueba en un navegador móvil.", error);
  }

  envelopeScreen.classList.add("opening");
  window.setTimeout(() => {
    envelopeScreen.classList.add("is-opening");
    invitation.classList.remove("is-hidden");
    envelopeScreen.setAttribute("aria-hidden", "true");
    window.setTimeout(() => { envelopeScreen.hidden = true; }, 900);
  }, 1050);
}
openButton.addEventListener("click", openInvitation);
openLabel.addEventListener("click", openInvitation);

function updateCountdown() {
  const eventTime = new Date(EVENT_DATE);
  let remaining = eventTime.getTime() - Date.now();

  if (Number.isNaN(eventTime.getTime())) {
    document.getElementById("countdownMessage").textContent = "Pronto compartiremos la fecha del evento.";
    return;
  }
  if (remaining <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach(id => {
      document.getElementById(id).textContent = "00";
    });
    document.getElementById("countdownMessage").textContent = "¡Hoy celebramos! Gracias por acompañarnos.";
    return;
  }

  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}
updateCountdown();
window.setInterval(updateCountdown, 1000);



const rsvpMessage = "¡Hola! Me dará mucho gusto acompañar a Keyla♡ en la celebración de sus XV años este 5 de diciembre de 2026. Mi nombre es:  ";
document.getElementById("rsvpButton").href =
  "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(rsvpMessage);

// No se muestran controles de audio en la página.
// El navegador puede bloquear el sonido si no detecta interacción del usuario.


// Controles del reproductor MP3 personalizado
const playButton = document.getElementById("musicPlay");
const playIcon = document.getElementById("musicPlayIcon");
const progress = document.getElementById("musicProgress");
const currentTimeLabel = document.getElementById("musicCurrentTime");
const durationLabel = document.getElementById("musicDuration");
const musicStatus = document.getElementById("musicStatus");
function formatMusicTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return Math.floor(seconds / 60) + ":" + String(Math.floor(seconds % 60)).padStart(2, "0");
}
if (music && playButton && playIcon && progress) {
  playButton.addEventListener("click", async () => {
    if (music.paused) {
      try { await music.play(); }
      catch (error) { if (musicStatus) musicStatus.textContent = "No se pudo reproducir. Revisa que assets/music.mp3 esté en la carpeta correcta."; }
    } else music.pause();
  });
  music.addEventListener("play", () => { playIcon.textContent = "Ⅱ"; playButton.setAttribute("aria-label", "Pausar canción"); playButton.setAttribute("aria-pressed", "true"); if (musicStatus) musicStatus.textContent = "Reproduciendo nuestra canción ♡"; });
  music.addEventListener("pause", () => { playIcon.textContent = "▶"; playButton.setAttribute("aria-label", "Reproducir canción"); playButton.setAttribute("aria-pressed", "false"); if (musicStatus) musicStatus.textContent = "Toca el botón para escuchar la canción ♡"; });
  music.addEventListener("loadedmetadata", () => { if (durationLabel) durationLabel.textContent = formatMusicTime(music.duration); });
  music.addEventListener("timeupdate", () => {
    if (currentTimeLabel) currentTimeLabel.textContent = formatMusicTime(music.currentTime);
    if (durationLabel) durationLabel.textContent = formatMusicTime(music.duration);
    if (Number.isFinite(music.duration) && music.duration > 0) progress.value = String(music.currentTime / music.duration * 100);
  });
  progress.addEventListener("input", () => { if (Number.isFinite(music.duration) && music.duration > 0) music.currentTime = Number(progress.value) / 100 * music.duration; });
  music.addEventListener("ended", () => { progress.value = "0"; music.currentTime = 0; });
  music.addEventListener("error", () => { if (musicStatus) musicStatus.textContent = "No encontramos la música. Confirma que exista assets/music.mp3."; });
}


// === Formulario de confirmación (interfaz) ===
// El contador de esta versión es local a la página. Para que todos los invitados
// compartan el mismo total, después habrá que conectarlo a Google Sheets.
(() => {
  const form = document.getElementById("rsvpForm");
  if (!form) return;

  const countField = document.getElementById("guestCountField");
  const countInputs = [...form.querySelectorAll('input[name="guestCount"]')];
  const status = document.getElementById("rsvpStatus");
  const totalEl = document.getElementById("attendeeTotal");
  const labelEl = document.getElementById("attendeeLabel");
  const submit = document.getElementById("rsvpSubmit");
  let localTotal = 0;

  function attendance() {
    return form.querySelector('input[name="attending"]:checked')?.value || "";
  }

  function updateForm() {
    const yes = attendance() === "yes";
    countField.hidden = !yes;
    countInputs.forEach(input => {
      input.required = yes;
      if (!yes) input.checked = false;
    });
  }

  form.querySelectorAll('input[name="attending"]').forEach(input => {
    input.addEventListener("change", updateForm);
  });
  updateForm();

  form.addEventListener("submit", event => {
    event.preventDefault();
    const answer = attendance();
    const count = form.querySelector('input[name="guestCount"]:checked')?.value || "";

    if (!answer) {
      status.textContent = "Selecciona si asistirás o no, por favor.";
      return;
    }
    if (answer === "yes" && !count) {
      status.textContent = "Selecciona cuántas personas asistirán.";
      return;
    }

    if (answer === "yes") {
      localTotal += Number(count);
      totalEl.textContent = localTotal.toLocaleString("es-MX");
      labelEl.textContent = localTotal === 1 ? "asistente confirmado" : "asistentes confirmados";
      status.textContent = "¡Tu asistencia quedó registrada en esta vista! ♡";
    } else {
      status.textContent = "Gracias por avisarnos. ♡";
    }

    form.reset();
    updateForm();
    submit.blur();
  });
})();
