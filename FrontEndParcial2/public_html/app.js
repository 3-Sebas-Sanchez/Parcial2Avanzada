/* =============================================
   TRIATLÓN — Sistema de Gestión
   Archivo: app.js
   ============================================= */

// =============================================
// ESTADO GLOBAL
// =============================================
let carouselIndex = 0;
let selectedSpec = '';
let modCurrentId = null;

// =============================================
// NAVEGACIÓN
// =============================================
function showPage(name) {
  const pages = {
    'dashboard': 'dashboard.html',
    'registro': 'registrar.html',
    'lista': 'lista.html',
    'consulta': 'consulta.html',
    'modificar': 'modificar.html',
    'grupos': 'grupos.html',
    'eliminar': 'eliminar.html'
  };

  if (pages[name]) {
    window.location.href = pages[name];
  }
}

// Al cargar cualquier página, inicializar datos
window.addEventListener('DOMContentLoaded', async () => {
  await updateSidebar();
  
  const path = window.location.pathname;
  if (path.includes('dashboard.html')) updateDashboard();
  if (path.includes('lista.html')) renderLista();
  if (path.includes('consulta.html')) {
    const viewId = localStorage.getItem('view_athlete_id');
    if (viewId) {
      document.getElementById('consulta-id').value = viewId;
      consultarPorId();
      localStorage.removeItem('view_athlete_id');
    }
  }
});

// =============================================
// CARRUSEL DE ESPECIALIDADES
// =============================================
function moveCarousel(dir) {
  const total = 4;
  carouselIndex = (carouselIndex + dir + total) % total;
  updateCarouselUI();
}

function goSlide(i) {
  carouselIndex = i;
  updateCarouselUI();
}

function updateCarouselUI() {
  const track = document.getElementById('spec-track');
  if (track) track.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function selectSpec(i, name, icon) {
  selectedSpec = name;
  const specInput = document.getElementById('reg-spec');
  if (specInput) specInput.value = name;
  document.querySelectorAll('.specialty-card').forEach((c, j) => c.classList.toggle('selected', j === i));
  showToast('success', `${icon} Especialidad seleccionada: ${name}`);
}

// =============================================
// TOGGLE MODALIDAD CROSS
// =============================================
function toggleCrossLabel() {
  const yesEl = document.getElementById('cross-yes');
  if (!yesEl) return;
  const yes = yesEl.checked;
  const yesLabel = document.getElementById('cross-yes-label');
  const noLabel  = document.getElementById('cross-no-label');

  yesLabel.style.borderColor = yes  ? 'var(--accent)'  : 'var(--border)';
  yesLabel.style.color       = yes  ? 'var(--accent)'  : '';
  noLabel.style.borderColor  = !yes ? 'var(--accent2)' : 'var(--border)';
  noLabel.style.color        = !yes ? 'var(--accent2)' : '';
}

// =============================================
// REGISTRAR TRIATLETA
// =============================================
async function registrarTriatleta() {
  const nombre  = document.getElementById('reg-nombre').value.trim();
  const id      = document.getElementById('reg-id').value.trim();
  const correo  = document.getElementById('reg-correo').value.trim();
  const edad    = document.getElementById('reg-edad').value;
  const genero  = document.getElementById('reg-genero').value;
  const spec    = selectedSpec;
  const crossEl = document.querySelector('input[name="cross"]:checked');
  const fotoEl  = document.getElementById('reg-foto');

  if (!nombre || !id || !correo || !edad || !genero || !spec || !crossEl) {
    showToast('error', '⚠ Completa todos los campos obligatorios');
    return;
  }

  let fotoBase64 = '';
  if (fotoEl.files && fotoEl.files[0]) {
    try {
      fotoBase64 = await fileToBase64(fotoEl.files[0]);
    } catch (e) {
      showToast('error', '⚠ Error al procesar la imagen');
      return;
    }
  }

  const nuevo = {
    nombre,
    identificacion: id,
    correo,
    edad: parseInt(edad),
    genero,
    especialidad: spec,
    modalidadCross: crossEl.value === 'si',
    foto: fotoBase64
  };

  try {
    await API.registrar(nuevo);
    resetRegistroForm();
    showToast('success', `✓ ${nuevo.nombre} registrado exitosamente`);
    updateSidebar();
  } catch (err) {
    showToast('error', `⚠ ${err.message}`);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function resetRegistroForm() {
  ['reg-nombre', 'reg-id', 'reg-correo', 'reg-edad', 'reg-cat', 'reg-spec', 'reg-foto'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const genEl = document.getElementById('reg-genero');
  if (genEl) genEl.value = '';
  selectedSpec = '';
  document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('input[name="cross"]').forEach(r => r.checked = false);
  toggleCrossLabel();
  goSlide(0);
}

// =============================================
// LISTA DE TRIATLETAS
// =============================================
async function renderLista() {
  try {
    const athletes = await API.listarTodos();
    const search = (document.getElementById('lista-search')?.value || '').toLowerCase();
    const gen    = document.getElementById('lista-filter-gen')?.value  || '';
    const spec   = document.getElementById('lista-filter-spec')?.value || '';

    const filtered = athletes.filter(a => {
      const matchSearch = !search || a.nombre.toLowerCase().includes(search) || a.identificacion.includes(search);
      const matchGen    = !gen  || a.genero      === gen;
      const matchSpec   = !spec || a.especialidad === spec;
      return matchSearch && matchGen && matchSpec;
    });

    const tbody    = document.getElementById('lista-tbody');
    const empty    = document.getElementById('lista-empty');
    const tableWrap = document.querySelector('#page-lista .table-wrap');

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      if (tableWrap) tableWrap.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    if (tableWrap) tableWrap.style.display = 'block';

    tbody.innerHTML = filtered.map(a => `
      <tr>
        <td>
          <div class="athlete-cell">
            ${a.foto ? `<img src="${a.foto}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">` : `<div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>`}
            <div style="display:flex;flex-direction:column">
              <strong>${a.nombre}</strong>
              <span style="font-size:11px;color:var(--text-muted)">${a.correo || ''}</span>
            </div>
          </div>
        </td>
        <td><span style="font-family:'Space Mono',monospace;font-size:12px">${a.identificacion}</span></td>
        <td>${a.edad}</td>
        <td><span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masc' : 'Fem'}</span></td>
        <td>${a.categoria}</td>
        <td><span class="badge ${getSpecBadge(a.especialidad)}">${a.especialidad}</span></td>
        <td>${a.modalidadCross
          ? '<span class="badge badge-cross">✓ Cross</span>'
          : '<span style="color:var(--text-muted);font-size:13px">—</span>'}</td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-ghost btn-sm" onclick="verAtleta('${a.identificacion}')">
              <span class="material-icons-round" style="font-size:14px">visibility</span>
            </button>
            <button class="btn btn-danger btn-sm" onclick="iniciarEliminacion('${a.identificacion}')">
              <span class="material-icons-round" style="font-size:14px">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('error', 'Error al cargar la lista');
  }
}

function getAvatarClass(gen) {
  return gen === 'M' ? 'avatar-blue' : 'avatar-red';
}

function getSpecBadge(spec) {
  const map = {
    'Sprint':         'badge-bike',
    'Olímpico':       'badge-swim',
    'Estándar':       'badge-swim',
    'Media Distancia':'badge-run',
    'Ironman':        'badge-full'
  };
  return map[spec] || '';
}

// =============================================
// CONSULTA POR ID
// =============================================
async function consultarPorId() {
  const id  = document.getElementById('consulta-id').value.trim();
  const res = document.getElementById('consulta-result');

  if (!id) { showToast('error', 'Ingresa un ID'); return; }

  try {
    const a = await API.obtenerPorId(id);
    res.style.display = 'block';
    res.innerHTML = buildAthleteDetail(a);
  } catch (err) {
    res.style.display = 'block';
    res.innerHTML = `
      <div class="card" style="border-color:var(--accent2);max-width:400px">
        <div style="color:var(--accent2);display:flex;align-items:center;gap:8px">
          <span class="material-icons-round">search_off</span>
          No se encontró ningún triatleta con ID <strong>${id}</strong>
        </div>
      </div>`;
  }
}

function verAtleta(id) {
  localStorage.setItem('view_athlete_id', id);
  showPage('consulta');
}

function buildAthleteDetail(a) {
  const specIcon = { Sprint: '🏃', 'Olímpico': '🏊', 'Estándar': '🏊', 'Media Distancia': '🚴', Ironman: '🔥' };
  const icon = specIcon[a.especialidad] || '🏅';

  return `
    <div class="detail-card">
      ${a.foto ? `<img src="${a.foto}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--accent)">` : `<div class="detail-avatar">${a.nombre[0]}</div>`}
      <div class="detail-info">
        <div class="detail-name">${a.nombre}</div>
        <div class="detail-id">ID: ${a.identificacion} | ${a.correo || 'Sin correo'}</div>
        <div class="detail-badges">
          <span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
          <span class="badge badge-swim">${a.categoria}</span>
          <span class="badge ${getSpecBadge(a.especialidad)}">${icon} ${a.especialidad}</span>
          ${a.modalidadCross ? '<span class="badge badge-cross">Cross</span>' : ''}
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-item-label">Edad</div>
            <div class="info-item-value">${a.edad} años</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Género</div>
            <div class="info-item-value">${a.genero === 'M' ? 'Masculino' : 'Femenino'}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Categoría</div>
            <div class="info-item-value">${a.categoria}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Especialidad</div>
            <div class="info-item-value">${a.especialidad}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Modalidad Cross</div>
            <div class="info-item-value" style="color:${a.modalidadCross ? 'var(--accent3)' : 'var(--text-muted)'}">
              ${a.modalidadCross ? 'Sí' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// =============================================
// MODIFICAR DATOS
// =============================================
let currentEditPhoto = '';

async function buscarParaModificar() {
  const id       = document.getElementById('mod-search-id').value.trim();
  const notFound = document.getElementById('mod-not-found');
  const formCard = document.getElementById('mod-form-card');

  try {
    const a = await API.obtenerPorId(id);
    notFound.style.display = 'none';
    modCurrentId = a.identificacion;
    currentEditPhoto = a.foto || ''; // Guardar foto actual
    formCard.style.display = 'block';
    
    document.getElementById('mod-tipo').value = 'campo';
    toggleModTipo();
    document.getElementById('mod-campo').value = '';
    document.getElementById('mod-field-wrap').style.display = 'none';

    document.getElementById('edit-nombre').value = a.nombre;
    document.getElementById('edit-correo').value = a.correo || '';
    document.getElementById('edit-edad').value = a.edad;
    document.getElementById('edit-genero').value = a.genero;
    document.getElementById('edit-spec').value = a.especialidad;
    document.getElementById('edit-cross').value = a.modalidadCross ? 'si' : 'no';

    document.getElementById('mod-athlete-preview').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">
        ${a.foto ? `<img src="${a.foto}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>`}
        <div>
          <div style="font-weight:600">${a.nombre}</div>
          <div style="font-size:12px;color:var(--text-muted);font-family:'Space Mono',monospace">${a.identificacion}</div>
        </div>
      </div>`;
  } catch (err) {
    notFound.style.display = 'block';
    formCard.style.display = 'none';
    modCurrentId = null;
  }
}

function toggleModTipo() {
  const tipo = document.getElementById('mod-tipo').value;
  document.getElementById('mod-campo-wrap').style.display = tipo === 'campo' ? 'block' : 'none';
  document.getElementById('mod-completo-wrap').style.display = tipo === 'completo' ? 'block' : 'none';
}

async function aplicarModificacionCompleta() {
  const nombre = document.getElementById('edit-nombre').value.trim();
  const correo = document.getElementById('edit-correo').value.trim();
  const edad = document.getElementById('edit-edad').value;
  const genero = document.getElementById('edit-genero').value;
  const spec = document.getElementById('edit-spec').value;
  const cross = document.getElementById('edit-cross').value;
  const fotoEl = document.getElementById('edit-foto');

  if (!nombre || !correo || !edad || !genero || !spec || !cross) {
    showToast('error', '⚠ Completa todos los campos');
    return;
  }

  let fotoBase64 = currentEditPhoto; // Mantener la foto actual si no se sube una nueva
  if (fotoEl.files && fotoEl.files[0]) {
    fotoBase64 = await fileToBase64(fotoEl.files[0]);
  }

  const dto = {
    nombre,
    identificacion: modCurrentId,
    correo,
    edad: parseInt(edad),
    genero,
    especialidad: spec,
    modalidadCross: cross === 'si',
    foto: fotoBase64
  };

  try {
    // El back usa Long id para el PUT, pero nosotros usamos la identificación como identificador
    await API.actualizarCompleto(modCurrentId, dto);
    showToast('success', '✓ Perfil actualizado correctamente');
    buscarParaModificar();
  } catch (err) {
    showToast('error', `⚠ ${err.message}`);
  }
}

function showModField() {
  const campo     = document.getElementById('mod-campo').value;
  const wrap      = document.getElementById('mod-field-wrap');
  const label     = document.getElementById('mod-field-label');
  const inputArea = document.getElementById('mod-field-input');

  if (!campo) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  if (campo === 'nombre') {
    label.textContent = 'Nuevo Nombre';
    inputArea.innerHTML = `<input type="text" class="form-control" id="mod-new-val" placeholder="Nombre completo">`;
  } else if (campo === 'id') {
    label.textContent = 'Nueva Identificación';
    inputArea.innerHTML = `<input type="text" class="form-control" id="mod-new-val" placeholder="Nuevo número">`;
  } else if (campo === 'correo') {
    label.textContent = 'Nuevo Correo';
    inputArea.innerHTML = `<input type="email" class="form-control" id="mod-new-val" placeholder="atleta@ejemplo.com">`;
  } else if (campo === 'categoria') {
    label.textContent = 'Nueva Categoría';
    inputArea.innerHTML = `
      <select class="form-control" id="mod-new-val">
        <option value="">Seleccionar</option>
        <option value="Junior">Junior</option>
        <option value="Sub23">Sub23</option>
        <option value="Absoluta">Absoluta</option>
        <option value="Veterano 1">Veterano 1</option>
        <option value="Veterano 2">Veterano 2</option>
        <option value="Veterano 3">Veterano 3</option>
      </select>`;
  }
}

async function aplicarModificacion() {
  const campo = document.getElementById('mod-campo').value;
  const val   = document.getElementById('mod-new-val')?.value.trim();

  if (!val) { showToast('error', 'Ingresa el nuevo valor'); return; }

  try {
    if (campo === 'nombre') await API.actualizarNombre(modCurrentId, val);
    if (campo === 'id') await API.actualizarIdentificacion(modCurrentId, val);
    if (campo === 'categoria') await API.actualizarCategoria(modCurrentId, val);
    if (campo === 'correo') {
      // El back no tiene PATCH para correo, usamos el PUT completo o ignoramos por ahora
      showToast('info', 'El backend no soporta actualización individual de correo');
      return;
    }
    
    if (campo === 'id') modCurrentId = val;
    save(); // Esto ya no es necesario con el back, pero lo dejamos por si acaso
    buscarParaModificar();
    showToast('success', `✓ Actualizado correctamente`);
  } catch (err) {
    showToast('error', err.message);
  }
}

// =============================================
// CONSULTAR GRUPOS
// =============================================
async function consultarGrupo() {
  const gen   = document.getElementById('grp-gen').value;
  const cat   = document.getElementById('grp-cat').value;
  const spec  = document.getElementById('grp-spec').value;
  const cross = document.getElementById('grp-cross').value;
  const res   = document.getElementById('grupos-result');

  if (!gen && !cat && !spec && !cross) {
    res.innerHTML = `<div class="card" style="max-width:400px"><div style="color:var(--text-muted)">Selecciona un filtro.</div></div>`;
    return;
  }

  try {
    let filtered = [];
    if (gen) filtered = await API.filtrarPorGenero(gen);
    else if (cat) filtered = await API.filtrarPorCategoria(cat);
    else if (spec) filtered = await API.filtrarPorEspecialidad(spec);
    else if (cross) filtered = await API.filtrarPorCross(cross === 'si');

    if (filtered.length === 0) {
      res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2)">No se encontraron resultados</div></div>`;
      return;
    }

    res.innerHTML = `
      <div style="margin-bottom:14px;color:var(--text-muted);font-size:13px">${filtered.length} resultados</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Triatleta</th><th>ID</th><th>Edad</th><th>Género</th><th>Categoría</th><th>Especialidad</th><th>Cross</th></tr></thead>
          <tbody>
            ${filtered.map(a => `
              <tr>
                <td><div class="athlete-cell">${a.foto ? `<img src="${a.foto}" style="width:34px;height:34px;border-radius:50%">` : `<div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>`}<strong>${a.nombre}</strong></div></td>
                <td>${a.identificacion}</td><td>${a.edad}</td><td>${a.genero}</td><td>${a.categoria}</td><td>${a.especialidad}</td><td>${a.modalidadCross ? '✓' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    showToast('error', 'Error al consultar grupos');
  }
}

// =============================================
// ELIMINAR TRIATLETA
// =============================================
async function buscarParaEliminar() {
  const id  = document.getElementById('del-id').value.trim();
  const res = document.getElementById('del-result');
  
  try {
    const a = await API.obtenerPorId(id);
    res.innerHTML = `
      ${buildAthleteDetail(a)}
      <div style="margin-top:16px;display:flex;gap:12px">
        <button class="btn btn-ghost" onclick="limpiarEliminar()">Cancelar</button>
        <button class="btn btn-eliminar" onclick="iniciarEliminacion('${a.identificacion}')">
          <span class="material-icons-round">delete_forever</span> Eliminar Triatleta
        </button>
      </div>`;
  } catch (err) {
    res.innerHTML = `<div class="card" style="border-color:var(--accent2);max-width:400px"><div style="color:var(--accent2)">No encontrado</div></div>`;
  }
}

function iniciarEliminacion(id) {
  document.getElementById('del-confirm-msg').innerHTML = `¿Eliminar atleta con ID <strong>${id}</strong>?`;
  document.getElementById('del-confirm-btn').onclick = () => confirmarEliminacion(id);
  document.getElementById('modal-delete').classList.add('open');
}

async function confirmarEliminacion(id) {
  try {
    await API.eliminar(id);
    closeModal('modal-delete');
    limpiarEliminar();
    if (window.location.pathname.includes('lista.html')) renderLista();
    showToast('success', `Atleta eliminado`);
    updateSidebar();
  } catch (err) {
    showToast('error', 'No se pudo eliminar');
  }
}

function limpiarEliminar() {
  const res = document.getElementById('del-result');
  if (res) res.innerHTML = '';
  const delId = document.getElementById('del-id');
  if (delId) delId.value = '';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// =============================================
// TOAST
// =============================================
function showToast(type, msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast     = document.createElement('div');
  const iconMap   = { success: 'check_circle', error: 'error', info: 'info' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="material-icons-round" style="font-size:18px">${iconMap[type] || 'info'}</span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// =============================================
// DASHBOARD & SIDEBAR
// =============================================
async function updateDashboard() {
  try {
    const athletes = await API.listarTodos();
    document.getElementById('dash-total').textContent = athletes.length;
    document.getElementById('dash-fem').textContent   = athletes.filter(a => a.genero === 'F').length;
    document.getElementById('dash-masc').textContent  = athletes.filter(a => a.genero === 'M').length;
    document.getElementById('dash-cross').textContent = athletes.filter(a => a.modalidadCross).length;

    const specs      = ['Sprint', 'Olímpico', 'Estándar', 'Media Distancia', 'Ironman'];
    const specColors = ['var(--gold)', 'var(--accent)', 'var(--accent)', 'var(--accent3)', 'var(--accent2)'];
    const specsEl    = document.getElementById('dash-specs');

    specsEl.innerHTML = specs.map((s, i) => {
      const cnt = athletes.filter(a => a.especialidad === s).length;
      const pct = athletes.length ? Math.round((cnt / athletes.length) * 100) : 0;
      return `<div><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px"><span>${s}</span><span style="color:${specColors[i]};font-weight:700">${cnt}</span></div><div style="background:var(--border);border-radius:4px;height:5px"><div style="width:${pct}%;background:${specColors[i]};height:5px;border-radius:4px"></div></div></div>`;
    }).join('');

    const cats   = ['Pre-benjamín', 'Benjamín', 'Alevín', 'Infantil', 'Cadete', 'Juvenil', 'Junior', 'Sub23', 'Absoluta', 'Veterano 1', 'Veterano 2', 'Veterano 3'];
    const catsEl = document.getElementById('dash-cats');

    catsEl.innerHTML = cats.map(c => {
      const cnt = athletes.filter(a => a.categoria === c).length;
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)"><span style="font-size:13px">${c}</span><span style="font-family:'Bebas Neue';font-size:20px;color:var(--accent)">${cnt}</span></div>`;
    }).join('');
  } catch (err) {}
}

async function updateSidebar() {
  try {
    const athletes = await API.listarTodos();
    const countEl = document.getElementById('sidebar-count');
    if (countEl) countEl.textContent = athletes.length;
  } catch (err) {}
}
