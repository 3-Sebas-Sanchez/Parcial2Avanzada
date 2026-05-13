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
 *
 * @author nath
 */
@Service
@RequiredArgsConstructor

/**
 * Servicio para la gestión de atletas.
 * Utiliza AtletaDTO y AtletaResponse para la lógica externa y Persona para la persistencia interna.
 */
public class AtletaService {
    
    private final AtletaRepository atletaRepository;
    private final EmailService emailService;
    
    private AtletaResponse mapToResponse(Persona persona) {
        AtletaResponse response = new AtletaResponse();
        
        // Mapeo de campos de Persona
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
    
    private String calcularCategoria(int edad) {
        // 1. Si es menor, arrojamos el error para que viaje al FrontEnd
        if (edad < 7) {
            throw new RuntimeException("La edad mínima permitida para competir es de 7 años.");
        }
        
        //// Categorías en Edad Escolar:
        if (edad == 7) return "Pre-benjamín";
        if (edad >= 8 && edad <= 9) return "Benjamín";
        if (edad >= 10 && edad <= 11) return "Alevín";
        if (edad >= 12 && edad <= 13) return "Infantil";
        
        /////Categorías:
        if (edad >= 14 && edad <= 15) return "Cadete";
        if (edad >= 16 && edad <= 17) return "Juvenil";
        if (edad >= 18 && edad <= 19) return "Junior";
        if (edad >= 20 && edad <= 23) return "Sub23";
        if (edad >= 24 && edad <= 39) return  "Absoluta";
        if (edad >= 40 && edad <= 49) return "Veterano 1";
        if (edad >= 50 && edad <= 59) return "Veterano 2";
        //  Si tiene 60 o más. 
        return "Veterano 3";
    }
    
    public AtletaResponse consultarPorIdentificacion(String identificacion) {
        return atletaRepository.findById(identificacion)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));
    }
    
    public List<AtletaResponse> listarPorGenero(String genero) {
        return atletaRepository.findByGenero(genero).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AtletaResponse> listarPorCategoria(String categoria) {
        return atletaRepository.findByCategoria(categoria).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AtletaResponse> listarPorEspecialidad(String especialidad) {
        return atletaRepository.findByEspecialidad(especialidad).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AtletaResponse> listarPorModalidadCross(Boolean modalidadCross) {
        return atletaRepository.findByModalidadCross(modalidadCross).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AtletaResponse> listarTodos() {
        return atletaRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public AtletaResponse actualizarNombre(String identificacion, String nuevoNombre) {
        int filasAfectadas = atletaRepository.actualizarNombre(identificacion, nuevoNombre);
        if (filasAfectadas == 0) throw new RuntimeException("No se pudo actualizar el nombre");
        return consultarPorIdentificacion(identificacion);
    }

    @Transactional
    public AtletaResponse actualizarIdentificacion(Long id, String nuevaIdentificacion) {
        int filasAfectadas = atletaRepository.actualizarIdentificacion(id, nuevaIdentificacion);
        if (filasAfectadas == 0) throw new RuntimeException("No se pudo actualizar la identificación");
        Persona persona = atletaRepository.findById(id).orElseThrow(() -> new RuntimeException("Atleta no encontrado"));
        return mapToResponse(persona);
    }

    @Transactional
    public AtletaResponse actualizarCategoria(String identificacion, String nuevaCategoria) {
        int filasAfectadas = atletaRepository.actualizarCategoria(identificacion, nuevaCategoria);
        if (filasAfectadas == 0) throw new RuntimeException("No se pudo actualizar la categoría");
        return consultarPorIdentificacion(identificacion);
    }
    
    /**
     * Valida que la especialidad (distancia) sea permitida para la categoría del atleta.
     * • Cadete - Distancia Sprint
     * • Junior - Distancias Sprint y Estándar
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
    
    @Transactional
    public void eliminarAtleta(String identificacion) {
        atletaRepository.deleteByIdentificacion(identificacion);
    }
    
    @Transactional
    public AtletaResponse registrarAtleta(AtletaDTO dto) {
        String categoriaCalculada = calcularCategoria(dto.getEdad());   
        
        validarEspecialidad(categoriaCalculada, dto.getEspecialidad());
        
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

        Persona guardado = atletaRepository.save(atleta);
        emailService.enviarCorreoBienvenida(guardado.getCorreo(), guardado.getNombre());
        
        return mapToResponse(guardado);
    }
    
    @Transactional
    public AtletaResponse actualizarAtletaCompleto(Long id, AtletaDTO dto) {
        // Validar que el atleta existe
        AtletaDTO atletaExistente = atletaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Atleta no encontrado"));

        // Validar especialidad con la nueva categoría
        validarEspecialidad(dto.getCategoria(), dto.getEspecialidad());

        // Ejecutar actualización
        int filasAfectadas = atletaRepository.actualizarAtletaCompleto(
            id,
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
            throw new RuntimeException("No se pudo actualizar el atleta");
        }

        // Recuperar y retornar el atleta actualizado
        return mapToResponse(atletaRepository.findById(id).get());
    }
}
