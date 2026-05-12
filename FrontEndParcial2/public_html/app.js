/* =============================================
   TRIATLÓN — Sistema de Gestión
   Archivo: app.js
   ============================================= */

// =============================================
// ESTADO GLOBAL
// =============================================
let athletes = JSON.parse(localStorage.getItem('triatlon_athletes') || '[]');
let carouselIndex = 0;
let selectedSpec = '';
let modCurrentId = null;

// =============================================
// PERSISTENCIA
// =============================================
function save() {
  localStorage.setItem('triatlon_athletes', JSON.stringify(athletes));
  updateSidebar();
  updateDashboard();
}

// =============================================
// NAVEGACIÓN
// =============================================
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (el) el.classList.add('active');

  if (name === 'lista') renderLista();
  if (name === 'dashboard') updateDashboard();
}

// =============================================
// CATEGORÍA POR EDAD
// =============================================
function getCategoria(edad) {
  const e = parseInt(edad);
  if (e < 18)  return 'Junior';
  if (e <= 22) return 'Sub-23';
  if (e <= 39) return 'Elite';
  if (e <= 49) return 'Master A';
  if (e <= 59) return 'Master B';
  return 'Master C';
}

// Listener: actualizar categoría al escribir edad
document.getElementById('reg-edad').addEventListener('input', function () {
  document.getElementById('reg-cat').value = this.value ? getCategoria(this.value) : '';
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
  document.getElementById('spec-track').style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function selectSpec(i, name, icon) {
  selectedSpec = name;
  document.getElementById('reg-spec').value = name;
  document.querySelectorAll('.specialty-card').forEach((c, j) => c.classList.toggle('selected', j === i));
  showToast('success', `${icon} Especialidad seleccionada: ${name}`);
}

// =============================================
// TOGGLE MODALIDAD CROSS
// =============================================
function toggleCrossLabel() {
  const yes = document.getElementById('cross-yes').checked;
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
function registrarTriatleta() {
  const nombre  = document.getElementById('reg-nombre').value.trim();
  const id      = document.getElementById('reg-id').value.trim();
  const edad    = document.getElementById('reg-edad').value;
  const genero  = document.getElementById('reg-genero').value;
  const spec    = selectedSpec;
  const crossEl = document.querySelector('input[name="cross"]:checked');

  // Validación
  if (!nombre || !id || !edad || !genero || !spec || !crossEl) {
    showToast('error', '⚠ Completa todos los campos');
    return;
  }

  if (athletes.find(a => a.id === id)) {
    showToast('error', '⚠ Ya existe un triatleta con ese ID');
    return;
  }

  // Crear objeto triatleta
  const nuevo = {
    nombre,
    id,
    edad: parseInt(edad),
    genero,
    categoria: getCategoria(edad),
    especialidad: spec,
    cross: crossEl.value
  };

  athletes.push(nuevo);
  save();
  resetRegistroForm();
  showToast('success', `✓ ${nuevo.nombre} registrado exitosamente`);
}

function resetRegistroForm() {
  ['reg-nombre', 'reg-id', 'reg-edad', 'reg-cat', 'reg-spec'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('reg-genero').value = '';
  selectedSpec = '';
  document.querySelectorAll('.specialty-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('input[name="cross"]').forEach(r => r.checked = false);
  toggleCrossLabel();
  goSlide(0);
}

// =============================================
// LISTA DE TRIATLETAS
// =============================================
function renderLista() {
  const search = (document.getElementById('lista-search')?.value || '').toLowerCase();
  const gen    = document.getElementById('lista-filter-gen')?.value  || '';
  const spec   = document.getElementById('lista-filter-spec')?.value || '';

  const filtered = athletes.filter(a => {
    const matchSearch = !search || a.nombre.toLowerCase().includes(search) || a.id.includes(search);
    const matchGen    = !gen  || a.genero      === gen;
    const matchSpec   = !spec || a.especialidad === spec;
    return matchSearch && matchGen && matchSpec;
  });

  const tbody    = document.getElementById('lista-tbody');
  const empty    = document.getElementById('lista-empty');
  const tableWrap = document.querySelector('#page-lista .table-wrap');

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
          <div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>
          <strong>${a.nombre}</strong>
        </div>
      </td>
      <td><span style="font-family:'Space Mono',monospace;font-size:12px">${a.id}</span></td>
      <td>${a.edad}</td>
      <td><span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masc' : 'Fem'}</span></td>
      <td>${a.categoria}</td>
      <td><span class="badge ${getSpecBadge(a.especialidad)}">${a.especialidad}</span></td>
      <td>${a.cross === 'si'
        ? '<span class="badge badge-cross">✓ Cross</span>'
        : '<span style="color:var(--text-muted);font-size:13px">—</span>'}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="verAtleta('${a.id}')">
            <span class="material-icons-round" style="font-size:14px">visibility</span>
          </button>
          <button class="btn btn-danger btn-sm" onclick="iniciarEliminacion('${a.id}')">
            <span class="material-icons-round" style="font-size:14px">delete</span>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ---- Helpers de estilo ----
function getAvatarClass(gen) {
  return gen === 'M' ? 'avatar-blue' : 'avatar-red';
}

function getSpecBadge(spec) {
  const map = {
    'Sprint':         'badge-bike',
    'Olímpico':       'badge-swim',
    'Media Distancia':'badge-run',
    'Ironman':        'badge-full'
  };
  return map[spec] || '';
}

// =============================================
// CONSULTA POR ID
// =============================================
function consultarPorId() {
  const id  = document.getElementById('consulta-id').value.trim();
  const res = document.getElementById('consulta-result');

  if (!id) { showToast('error', 'Ingresa un ID'); return; }

  const a = athletes.find(x => x.id === id);
  res.style.display = 'block';

  if (!a) {
    res.innerHTML = `
      <div class="card" style="border-color:var(--accent2);max-width:400px">
        <div style="color:var(--accent2);display:flex;align-items:center;gap:8px">
          <span class="material-icons-round">search_off</span>
          No se encontró ningún triatleta con ID <strong>${id}</strong>
        </div>
      </div>`;
    return;
  }

  res.innerHTML = buildAthleteDetail(a);
}

function verAtleta(id) {
  const a = athletes.find(x => x.id === id);
  if (!a) return;
  document.getElementById('consulta-id').value = id;
  const res = document.getElementById('consulta-result');
  res.style.display = 'block';
  res.innerHTML = buildAthleteDetail(a);
  showPage('consulta', document.querySelectorAll('.nav-item')[3]);
}

// ---- Construir tarjeta de detalle ----
function buildAthleteDetail(a) {
  const specIcon = { Sprint: '🏃', 'Olímpico': '🏊', 'Media Distancia': '🚴', Ironman: '🔥' };
  const icon = specIcon[a.especialidad] || '🏅';

  return `
    <div class="detail-card">
      <div class="detail-avatar">${a.nombre[0]}</div>
      <div class="detail-info">
        <div class="detail-name">${a.nombre}</div>
        <div class="detail-id">ID: ${a.id}</div>
        <div class="detail-badges">
          <span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
          <span class="badge badge-swim">${a.categoria}</span>
          <span class="badge ${getSpecBadge(a.especialidad)}">${icon} ${a.especialidad}</span>
          ${a.cross === 'si' ? '<span class="badge badge-cross">Cross</span>' : ''}
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
            <div class="info-item-value" style="color:${a.cross === 'si' ? 'var(--accent3)' : 'var(--text-muted)'}">
              ${a.cross === 'si' ? 'Sí' : 'No'}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

// =============================================
// MODIFICAR DATOS
// =============================================
function buscarParaModificar() {
  const id       = document.getElementById('mod-search-id').value.trim();
  const a        = athletes.find(x => x.id === id);
  const notFound = document.getElementById('mod-not-found');
  const formCard = document.getElementById('mod-form-card');

  if (!a) {
    notFound.style.display = 'block';
    formCard.style.display = 'none';
    modCurrentId = null;
    return;
  }

  notFound.style.display = 'none';
  modCurrentId = a.id;
  formCard.style.display = 'block';
  document.getElementById('mod-campo').value = '';
  document.getElementById('mod-field-wrap').style.display = 'none';

  document.getElementById('mod-athlete-preview').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px">
      <div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>
      <div>
        <div style="font-weight:600">${a.nombre}</div>
        <div style="font-size:12px;color:var(--text-muted);font-family:'Space Mono',monospace">${a.id}</div>
      </div>
    </div>`;
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
  } else if (campo === 'categoria') {
    label.textContent = 'Nueva Categoría';
    inputArea.innerHTML = `
      <select class="form-control" id="mod-new-val">
        <option value="">Seleccionar</option>
        <option value="Junior">Junior (10-17)</option>
        <option value="Sub-23">Sub-23 (18-22)</option>
        <option value="Elite">Elite (23-39)</option>
        <option value="Master A">Master A (40-49)</option>
        <option value="Master B">Master B (50-59)</option>
        <option value="Master C">Master C (60+)</option>
      </select>`;
  }
}

function aplicarModificacion() {
  const campo = document.getElementById('mod-campo').value;
  const val   = document.getElementById('mod-new-val')?.value.trim();

  if (!val) { showToast('error', 'Ingresa el nuevo valor'); return; }

  const idx = athletes.findIndex(a => a.id === modCurrentId);
  if (idx === -1) return;

  if (campo === 'id' && athletes.find((a, i) => a.id === val && i !== idx)) {
    showToast('error', '⚠ Ya existe un triatleta con ese ID');
    return;
  }

  athletes[idx][campo] = val;
  if (campo === 'id') modCurrentId = val;

  save();
  buscarParaModificar();
  showToast('success', `✓ ${campo.charAt(0).toUpperCase() + campo.slice(1)} actualizado`);
}

// =============================================
// CONSULTAR GRUPOS
// =============================================
function consultarGrupo() {
  const gen   = document.getElementById('grp-gen').value;
  const cat   = document.getElementById('grp-cat').value;
  const spec  = document.getElementById('grp-spec').value;
  const cross = document.getElementById('grp-cross').value;
  const res   = document.getElementById('grupos-result');

  if (!gen && !cat && !spec && !cross) {
    res.innerHTML = `
      <div class="card" style="max-width:400px">
        <div style="color:var(--text-muted)">Selecciona al menos un filtro para consultar.</div>
      </div>`;
    return;
  }

  const filtered = athletes.filter(a =>
    (!gen   || a.genero      === gen)  &&
    (!cat   || a.categoria   === cat)  &&
    (!spec  || a.especialidad === spec) &&
    (!cross || a.cross        === cross)
  );

  if (filtered.length === 0) {
    res.innerHTML = `
      <div class="card" style="border-color:var(--accent2);max-width:400px">
        <div style="color:var(--accent2);display:flex;align-items:center;gap:8px">
          <span class="material-icons-round">group_off</span>
          No se encontraron triatletas con esos criterios
        </div>
      </div>`;
    return;
  }

  res.innerHTML = `
    <div style="margin-bottom:14px;color:var(--text-muted);font-size:13px;font-family:'Space Mono',monospace">
      ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>
          <th>Triatleta</th><th>ID</th><th>Edad</th><th>Género</th>
          <th>Categoría</th><th>Especialidad</th><th>Cross</th>
        </tr></thead>
        <tbody>
          ${filtered.map(a => `
            <tr>
              <td>
                <div class="athlete-cell">
                  <div class="avatar ${getAvatarClass(a.genero)}">${a.nombre[0]}</div>
                  <strong>${a.nombre}</strong>
                </div>
              </td>
              <td><span style="font-family:'Space Mono',monospace;font-size:12px">${a.id}</span></td>
              <td>${a.edad}</td>
              <td><span class="badge ${a.genero === 'M' ? 'badge-m' : 'badge-f'}">${a.genero === 'M' ? 'Masc' : 'Fem'}</span></td>
              <td>${a.categoria}</td>
              <td><span class="badge ${getSpecBadge(a.especialidad)}">${a.especialidad}</span></td>
              <td>${a.cross === 'si'
                ? '<span class="badge badge-cross">✓ Cross</span>'
                : '<span style="color:var(--text-muted)">—</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

// =============================================
// ELIMINAR TRIATLETA
// =============================================
function buscarParaEliminar() {
  const id  = document.getElementById('del-id').value.trim();
  const res = document.getElementById('del-result');
  const a   = athletes.find(x => x.id === id);

  if (!a) {
    res.innerHTML = `
      <div class="card" style="border-color:var(--accent2);max-width:400px">
        <div style="color:var(--accent2);display:flex;align-items:center;gap:8px">
          <span class="material-icons-round">search_off</span>
          No se encontró ningún triatleta con ese ID
        </div>
      </div>`;
    return;
  }

  res.innerHTML = `
    ${buildAthleteDetail(a)}
    <div style="margin-top:16px;display:flex;gap:12px">
      <button class="btn btn-ghost" onclick="limpiarEliminar()">Cancelar</button>
      <button class="btn btn-eliminar" onclick="iniciarEliminacion('${a.id}')">
        <span class="material-icons-round">delete_forever</span> Eliminar Triatleta
      </button>
    </div>`;
}

function limpiarEliminar() {
  document.getElementById('del-result').innerHTML = '';
  document.getElementById('del-id').value = '';
}

function iniciarEliminacion(id) {
  const a = athletes.find(x => x.id === id);
  if (!a) return;

  document.getElementById('del-confirm-msg').innerHTML = `
    ¿Estás seguro de que deseas eliminar a <strong>${a.nombre}</strong> (ID: ${a.id}) del sistema?<br><br>
    <span style="color:var(--accent2);font-size:12px">Esta acción no se puede deshacer.</span>`;

  document.getElementById('del-confirm-btn').onclick = () => confirmarEliminacion(id);
  document.getElementById('modal-delete').classList.add('open');
}

function confirmarEliminacion(id) {
  const a = athletes.find(x => x.id === id);
  athletes = athletes.filter(x => x.id !== id);
  save();
  closeModal('modal-delete');
  limpiarEliminar();
  renderLista();
  showToast('success', `✓ ${a.nombre} eliminado del sistema`);
}

// =============================================
// MODAL
// =============================================
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Cerrar modal al hacer clic fuera
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('open');
  });
});

// =============================================
// TOAST
// =============================================
function showToast(type, msg) {
  const container = document.getElementById('toast-container');
  const toast     = document.createElement('div');
  const iconMap   = { success: 'check_circle', error: 'error', info: 'info' };

  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="material-icons-round" style="font-size:18px">${iconMap[type] || 'info'}</span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// =============================================
// DASHBOARD
// =============================================
function updateDashboard() {
  document.getElementById('dash-total').textContent = athletes.length;
  document.getElementById('dash-fem').textContent   = athletes.filter(a => a.genero === 'F').length;
  document.getElementById('dash-masc').textContent  = athletes.filter(a => a.genero === 'M').length;
  document.getElementById('dash-cross').textContent = athletes.filter(a => a.cross === 'si').length;

  // Especialidades
  const specs      = ['Sprint', 'Olímpico', 'Media Distancia', 'Ironman'];
  const specColors = ['var(--gold)', 'var(--accent)', 'var(--accent3)', 'var(--accent2)'];
  const specsEl    = document.getElementById('dash-specs');

  specsEl.innerHTML = specs.map((s, i) => {
    const cnt = athletes.filter(a => a.especialidad === s).length;
    const pct = athletes.length ? Math.round((cnt / athletes.length) * 100) : 0;
    return `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
          <span>${s}</span>
          <span style="color:${specColors[i]};font-weight:700">${cnt}</span>
        </div>
        <div style="background:var(--border);border-radius:4px;height:5px">
          <div style="width:${pct}%;background:${specColors[i]};height:5px;border-radius:4px;transition:width .4s"></div>
        </div>
      </div>`;
  }).join('');

  // Categorías
  const cats   = ['Junior', 'Sub-23', 'Elite', 'Master A', 'Master B', 'Master C'];
  const catsEl = document.getElementById('dash-cats');

  catsEl.innerHTML = cats.map(c => {
    const cnt = athletes.filter(a => a.categoria === c).length;
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:6px;border:1px solid var(--border)">
        <span style="font-size:13px">${c}</span>
        <span style="font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--accent)">${cnt}</span>
      </div>`;
  }).join('');
}

function updateSidebar() {
  document.getElementById('sidebar-count').textContent = athletes.length;
}

// =============================================
// INICIALIZACIÓN
// =============================================
updateSidebar();
updateDashboard();
