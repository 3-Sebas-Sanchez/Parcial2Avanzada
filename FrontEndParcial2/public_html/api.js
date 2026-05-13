/* =============================================
   TRIATLÓN — Cliente API
   Archivo: api.js
   ============================================= */

const API_BASE = '/api/atletas';

const API = {
    // Listar todos
    async listarTodos() {
        const resp = await fetch(API_BASE);
        return resp.ok ? await resp.json() : [];
    },

    // Obtener por identificación
    async obtenerPorId(identificacion) {
        const resp = await fetch(`${API_BASE}/${identificacion}`);
        if (!resp.ok) throw new Error('Atleta no encontrado');
        return await resp.json();
    },

    // Registrar nuevo atleta
    async registrar(atleta) {
        const resp = await fetch(`${API_BASE}/atleta`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atleta)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.message || 'Error al registrar');
        return data;
    },

    // Eliminar atleta
    async eliminar(identificacion) {
        const resp = await fetch(`${API_BASE}/delete/${identificacion}`, {
            method: 'DELETE'
        });
        if (!resp.ok) throw new Error('Error al eliminar');
    },

    // Actualizar nombre (PATCH)
    async actualizarNombre(identificacion, nuevoNombre) {
        const resp = await fetch(`${API_BASE}/${identificacion}/nombre?nuevoNombre=${encodeURIComponent(nuevoNombre)}`, {
            method: 'PATCH'
        });
        if (!resp.ok) throw new Error('Error al actualizar nombre');
        return await resp.json();
    },

    // Actualizar identificación (PATCH) 
    async actualizarIdentificacion(id, nuevaIdentificacion) {
        const resp = await fetch(`${API_BASE}/${id}/identificacion?nuevaIdentificacion=${encodeURIComponent(nuevaIdentificacion)}`, {
            method: 'PATCH'
        });
        if (!resp.ok) throw new Error('Error al actualizar identificación');
        return await resp.json();
    },

    // Actualizar categoría (PATCH)
    async actualizarCategoria(identificacion, nuevaCategoria) {
        const resp = await fetch(`${API_BASE}/${identificacion}/categoria?nuevaCategoria=${encodeURIComponent(nuevaCategoria)}`, {
            method: 'PATCH'
        });
        if (!resp.ok) throw new Error('Error al actualizar categoría');
        return await resp.json();
    },

    // Actualización completa (PUT)
    async actualizarCompleto(identificacion, atleta) {
        const resp = await fetch(`${API_BASE}/${identificacion}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(atleta)
        });
        if (!resp.ok) throw new Error('Error al actualizar perfil');
        return await resp.json();
    },

    // Filtros
    async filtrarPorGenero(genero) {
        const resp = await fetch(`${API_BASE}/genero?genero=${encodeURIComponent(genero)}`);
        return resp.ok ? await resp.json() : [];
    },

    async filtrarPorCategoria(categoria) {
        const resp = await fetch(`${API_BASE}/categoria?categoria=${encodeURIComponent(categoria)}`);
        return resp.ok ? await resp.json() : [];
    },

    async filtrarPorEspecialidad(especialidad) {
        const resp = await fetch(`${API_BASE}/especialidad?especialidad=${encodeURIComponent(especialidad)}`);
        return resp.ok ? await resp.json() : [];
    },

    async filtrarPorCross(modalidadCross) {
        const resp = await fetch(`${API_BASE}/cross?modalidadCross=${modalidadCross}`);
        return resp.ok ? await resp.json() : [];
    }
};
