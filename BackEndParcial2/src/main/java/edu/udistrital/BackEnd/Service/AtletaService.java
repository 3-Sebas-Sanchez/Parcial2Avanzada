/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Service;

import edu.udistrital.BackEnd.Model.AtletaDTO;
import edu.udistrital.BackEnd.Model.AtletaResponse;
import edu.udistrital.BackEnd.Model.Persona;
import edu.udistrital.BackEnd.Repository.AtletaRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Servicio para la gestión de atletas.
 * 
 * Contiene la lógica de negocio para operaciones CRUD, validaciones de categorías,
 * especialidades y envío de notificaciones por correo.
 * Utiliza AtletaDTO como DTO de entrada, AtletaResponse para respuestas y 
 * internamente trabaja con Persona/AtletaDTO para persistencia.
 * 
 * @author nath
 */
@Service
@RequiredArgsConstructor
public class AtletaService {
    
    private final AtletaRepository atletaRepository;
    private final EmailService emailService;
    
    /**
     * Mapea una entidad Persona a AtletaResponse.
     * 
     * Extrae todos los campos relevantes de la entidad Persona
     * y los convierte en un DTO de respuesta.
     * 
     * @param persona Entidad Persona a mapear
     * @return AtletaResponse con los datos mapeados
     */
    private AtletaResponse mapToResponse(Persona persona) {
        AtletaResponse response = new AtletaResponse();
        
        // Mapeo de campos base de Persona
        response.setIdentificacion(persona.getIdentificacion());
        response.setNombre(persona.getNombre());
        response.setEdad(persona.getEdad());
        response.setGenero(persona.getGenero());
        response.setCorreo(persona.getCorreo());
        
        // Mapeo de campos específicos si es AtletaDTO
        if (persona instanceof AtletaDTO) {
            AtletaDTO atleta = (AtletaDTO) persona;
            response.setCategoria(atleta.getCategoria());
            response.setEspecialidad(atleta.getEspecialidad());
            response.setModalidadCross(atleta.getModalidadCross() != null && atleta.getModalidadCross());
            response.setFoto(atleta.getFoto());
        }
        
        return response;
    }
    
    /**
     * Calcula la categoría de un triatleta basado en su edad.
     * 
     * Rango de categorías:
     * - Pre-benjamín: 7 años
     * - Benjamín: 8-9 años
     * - Alevín: 10-11 años
     * - Infantil: 12-13 años
     * - Cadete: 14-15 años
     * - Juvenil: 16-17 años
     * - Junior: 18-19 años
     * - Sub23: 20-23 años
     * - Absoluta: 24-39 años
     * - Veterano 1: 40-49 años
     * - Veterano 2: 50-59 años
     * - Veterano 3: 60+ años
     * 
     * @param edad Edad del triatleta en años
     * @return String con la categoría calculada
     * @throws RuntimeException si la edad es menor a 7 años
     */
    private String calcularCategoria(int edad) {
        // Validar edad mínima
        if (edad < 7) {
            throw new RuntimeException("La edad mínima permitida para competir es de 7 años.");
        }
        
        // Categorías en Edad Escolar
        if (edad == 7) return "Pre-benjamín";
        if (edad >= 8 && edad <= 9) return "Benjamín";
        if (edad >= 10 && edad <= 11) return "Alevín";
        if (edad >= 12 && edad <= 13) return "Infantil";
        
        // Categorías Competitivas
        if (edad >= 14 && edad <= 15) return "Cadete";
        if (edad >= 16 && edad <= 17) return "Juvenil";
        if (edad >= 18 && edad <= 19) return "Junior";
        if (edad >= 20 && edad <= 23) return "Sub23";
        if (edad >= 24 && edad <= 39) return "Absoluta";
        if (edad >= 40 && edad <= 49) return "Veterano 1";
        if (edad >= 50 && edad <= 59) return "Veterano 2";
        
        // Categoría para 60 años o más
        return "Veterano 3";
    }
    
    /**
     * Consulta un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación del triatleta
     * @return AtletaResponse con los datos del triatleta encontrado
     * @throws RuntimeException si el triatleta no existe
     */
    public AtletaResponse consultarPorIdentificacion(String identificacion) {
        return atletaRepository.findByIdentificacion(identificacion)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));
    }
    
    /**
     * Lista todos los triatletas de un género específico.
     * 
     * @param genero Género a filtrar ('M' o 'F')
     * @return Lista de AtletaResponse filtrados por género
     */
    public List<AtletaResponse> listarPorGenero(String genero) {
        return atletaRepository.findByGenero(genero)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los triatletas de una categoría específica.
     * 
     * @param categoria Categoría a filtrar
     * @return Lista de AtletaResponse filtrados por categoría
     */
    public List<AtletaResponse> listarPorCategoria(String categoria) {
        return atletaRepository.findByCategoria(categoria)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los triatletas de una especialidad específica.
     * 
     * @param especialidad Especialidad a filtrar
     * @return Lista de AtletaResponse filtrados por especialidad
     */
    public List<AtletaResponse> listarPorEspecialidad(String especialidad) {
        return atletaRepository.findByEspecialidad(especialidad)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista triatletas por modalidad Cross.
     * 
     * @param modalidadCross true para triatletas con Cross, false para los que no
     * @return Lista de AtletaResponse filtrados por modalidad Cross
     */
    public List<AtletaResponse> listarPorModalidadCross(Boolean modalidadCross) {
        return atletaRepository.findByModalidadCross(modalidadCross)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lista todos los triatletas registrados en el sistema.
     * 
     * @return Lista de AtletaResponse con todos los triatletas
     */
    public List<AtletaResponse> listarTodos() {
        return atletaRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Actualiza el nombre de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevoNombre Nuevo nombre
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarNombre(String identificacion, String nuevoNombre) {
        int filasAfectadas = atletaRepository.actualizarNombre(identificacion, nuevoNombre);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar el nombre. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(identificacion);
    }

    /**
     * Actualiza el número de identificación de un triatleta.
     * 
     * @param identificacionActual Número de identificación actual
     * @param nuevaIdentificacion Nuevo número de identificación
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarIdentificacion(String identificacionActual, String nuevaIdentificacion) {
        int filasAfectadas = atletaRepository.actualizarIdentificacion(identificacionActual, nuevaIdentificacion);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar la identificación. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(nuevaIdentificacion);
    }

    /**
     * Actualiza la categoría de un triatleta.
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevaCategoria Nueva categoría
     * @return AtletaResponse actualizado
     * @throws RuntimeException si no se puede actualizar
     */
    @Transactional
    public AtletaResponse actualizarCategoria(String identificacion, String nuevaCategoria) {
        int filasAfectadas = atletaRepository.actualizarCategoria(identificacion, nuevaCategoria);
        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar la categoría. Triatleta no encontrado.");
        }
        return consultarPorIdentificacion(identificacion);
    }
    
    /**
     * Valida que la especialidad sea permitida para la categoría del triatleta.
     * 
     * Reglas de validación:
     * - Cadete solo puede participar en Sprint
     * - Junior puede participar en Sprint o Estándar
     * - Otras categorías pueden participar en cualquier especialidad
     * 
     * @param categoria Categoría del triatleta
     * @param especialidad Especialidad/distancia elegida
     * @throws RuntimeException si la especialidad no es válida para la categoría
     */
    private void validarEspecialidad(String categoria, String especialidad) {
        if ("Cadete".equalsIgnoreCase(categoria)) {
            if (!"Sprint".equalsIgnoreCase(especialidad)) {
                throw new RuntimeException("La categoría Cadete solo permite distancia Sprint.");
            }
        } else if ("Junior".equalsIgnoreCase(categoria)) {
            if (!"Sprint".equalsIgnoreCase(especialidad) && !"Estándar".equalsIgnoreCase(especialidad)) {
                throw new RuntimeException("La categoría Junior solo permite distancias Sprint y Estándar.");
            }
        }
    }
    
    /**
     * Elimina un triatleta del sistema.
     * 
     * @param identificacion Número de identificación del triatleta a eliminar
     */
    @Transactional
    public void eliminarAtleta(String identificacion) {
        atletaRepository.deleteByIdentificacion(identificacion);
    }
    
    /**
     * Registra un nuevo triatleta en el sistema.
     * 
     * @param dto Objeto AtletaDTO con los datos del nuevo triatleta
     * @return AtletaResponse con el triatleta registrado
     * @throws RuntimeException si hay error en validación o persistencia
     */
    @Transactional
    public AtletaResponse registrarAtleta(AtletaDTO dto) {
        // Calcular categoría basada en edad
        String categoriaCalculada = calcularCategoria(dto.getEdad());
        
        // Validar que la especialidad sea permitida para la categoría
        validarEspecialidad(categoriaCalculada, dto.getEspecialidad());
        
        // Crear y asignar datos al atleta
        AtletaDTO atleta = new AtletaDTO();
        atleta.setIdentificacion(dto.getIdentificacion());
        atleta.setNombre(dto.getNombre());
        atleta.setGenero(dto.getGenero());
        atleta.setCorreo(dto.getCorreo());
        atleta.setEdad(dto.getEdad());
        atleta.setCategoria(categoriaCalculada);
        atleta.setEspecialidad(dto.getEspecialidad());
        atleta.setModalidadCross(dto.getModalidadCross());
        atleta.setFoto(dto.getFoto());

        // Persistir en base de datos
        Persona guardado = atletaRepository.save(atleta);
        
        // Enviar correo de bienvenida
        emailService.enviarCorreoBienvenida(guardado.getCorreo(), guardado.getNombre());
        
        return mapToResponse(guardado);
    }
    
    /**
     * Actualiza COMPLETAMENTE todos los datos de un triatleta (PUT).

     * @param identificacion Número de identificación del triatleta a actualizar
     * @param dto Objeto AtletaDTO con todos los datos nuevos
     * @return AtletaResponse con el triatleta actualizado
     * @throws RuntimeException si el triatleta no existe o hay error en actualización
     */
    @Transactional
    public AtletaResponse actualizarAtletaCompleto(String identificacion, AtletaDTO dto) {
        // Verificar que el atleta existe
        AtletaDTO atletaExistente = atletaRepository.findByIdentificacion(identificacion)
            .orElseThrow(() -> new RuntimeException("Triatleta no encontrado"));

        // Validar que la especialidad sea permitida para la categoría
        validarEspecialidad(dto.getCategoria(), dto.getEspecialidad());

        // Ejecutar actualización con la identificación actual
        int filasAfectadas = atletaRepository.actualizarAtletaCompleto(
            identificacion,
            dto.getNombre(),
            dto.getIdentificacion(),
            dto.getGenero(),
            dto.getCorreo(),
            dto.getEdad(),
            dto.getCategoria(),
            dto.getEspecialidad(),
            dto.getModalidadCross(),
            dto.getFoto()
        );

        if (filasAfectadas == 0) {
            throw new RuntimeException("No se pudo actualizar el triatleta");
        }

        // Recuperar y retornar el triatleta actualizado (usar nueva identificación si cambió)
        return consultarPorIdentificacion(dto.getIdentificacion());
    }
}