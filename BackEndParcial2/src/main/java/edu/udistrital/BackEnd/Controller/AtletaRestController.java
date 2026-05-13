/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Controller;

import org.springframework.web.bind.annotation.RequestMethod;
import edu.udistrital.BackEnd.Model.AtletaDTO;
import edu.udistrital.BackEnd.Model.AtletaResponse;
import edu.udistrital.BackEnd.Service.AtletaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

/**
 * Controlador REST para la gestión de atletas.
 * 
 * Expone endpoints para operaciones CRUD completas y consultas filtradas.
 * 
 * @author nath
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/atletas")
public class AtletaRestController {
    
    private final AtletaService atletaService;

    /**
     * Registra un nuevo triatleta en el sistema.
     * 
     * @param dto Objeto AtletaDTO con los datos del triatleta
     * @return ResponseEntity con AtletaResponse y código HTTP 201 (CREATED)
     * @throws RuntimeException si hay error en la validación de datos
     */
    @RequestMapping(value = "/atleta", method = RequestMethod.POST)
    public ResponseEntity<AtletaResponse> registrar(@Valid @RequestBody AtletaDTO dto) {
        return new ResponseEntity<>(atletaService.registrarAtleta(dto), HttpStatus.CREATED);
    }
    
    

    /**
     * Obtiene un triatleta por su número de identificación.
     * 
     * @param identificacion Número de identificación único del triatleta (cédula)
     * @return ResponseEntity con AtletaResponse encontrado
     * @throws RuntimeException si el triatleta no existe
     */
    @RequestMapping(value = "/{identificacion}", method = RequestMethod.GET)
    public ResponseEntity<AtletaResponse> obtenerPorIdentificacion(@PathVariable String identificacion) {
        return ResponseEntity.ok(atletaService.consultarPorIdentificacion(identificacion));
    }
    

    /**
     * Lista todos los triatletas registrados en el sistema.
     * 
     * @return Lista de AtletaResponse con todos los triatletas
     */
        @RequestMapping(method = RequestMethod.GET)
        public List<AtletaResponse> listarTodos(
                @RequestParam(required = false) String genero,
                @RequestParam(required = false) String categoria,
                @RequestParam(required = false) String especialidad,
                @RequestParam(required = false) Boolean modalidadCross) {

            // Si hay filtro de genero
            if (genero != null && !genero.isEmpty()) {
                return atletaService.listarPorGenero(genero);
            }
            // Si hay filtro de categoria
            if (categoria != null && !categoria.isEmpty()) {
                return atletaService.listarPorCategoria(categoria);
            }
            // Si hay filtro de especialidad
            if (especialidad != null && !especialidad.isEmpty()) {
                return atletaService.listarPorEspecialidad(especialidad);
            }
            // Si hay filtro de modalidad cross
            if (modalidadCross != null) {
                return atletaService.listarPorModalidadCross(modalidadCross);
            }

            // Sin filtros, retorna todos
            return atletaService.listarTodos();
        }

    /**
     * Elimina un triatleta del sistema por su identificación.
     * 
     * @param identificacion Número de identificación del triatleta a eliminar
     * @return ResponseEntity vacío con código 204 (NO CONTENT)
     */
    @RequestMapping(value = "/delete/{identificacion}", method = RequestMethod.DELETE)
    public ResponseEntity<Void> eliminar(@PathVariable String identificacion) {
        atletaService.eliminarAtleta(identificacion);
        return ResponseEntity.noContent().build();
    }
    
    

    /**
     * Actualiza el nombre de un triatleta (PATCH - actualización parcial).
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevoNombre Nuevo nombre del triatleta
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/nombre", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarNombre(
            @PathVariable String identificacion, 
            @RequestParam String nuevoNombre) {
        return ResponseEntity.ok(atletaService.actualizarNombre(identificacion, nuevoNombre));
    }
    
    

    /**
     * Actualiza el número de identificación de un triatleta (PATCH - actualización parcial).
     * 
     * @param identificacion Número de identificación actual del triatleta
     * @param nuevaIdentificacion Nuevo número de identificación
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/identificacion", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarIdentificacion(
            @PathVariable String identificacion, 
            @RequestParam String nuevaIdentificacion) {
        return ResponseEntity.ok(atletaService.actualizarIdentificacion(identificacion, nuevaIdentificacion));
    }
    
    

    /**
     * Actualiza la categoría de un triatleta (PATCH - actualización parcial).
     * 
     * @param identificacion Número de identificación del triatleta
     * @param nuevaCategoria Nueva categoría asignada
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}/categoria", method = RequestMethod.PATCH)
    public ResponseEntity<AtletaResponse> actualizarCategoria(
            @PathVariable String identificacion, 
            @RequestParam String nuevaCategoria) {
        return ResponseEntity.ok(atletaService.actualizarCategoria(identificacion, nuevaCategoria));
    }
    
    

    /**
     * Filtra triatletas por género.
     * 
     * @param genero Género a filtrar ('M' o 'F')
     * @return Lista de AtletaResponse con el género especificado
     */
    @RequestMapping(value = "/genero", method = RequestMethod.GET)
    public List<AtletaResponse> listarPorGenero(@RequestParam String genero) {
        return atletaService.listarPorGenero(genero);
    }

    /**
     * Filtra triatletas por categoría.
     * 
     * @param categoria Categoría a filtrar
     * @return Lista de AtletaResponse de la categoría especificada
     */
    @RequestMapping(value = "/categoria", method = RequestMethod.GET)
    public List<AtletaResponse> listarPorCategoria(@RequestParam String categoria) {
        return atletaService.listarPorCategoria(categoria);
    }

    /**
     * Filtra triatletas por especialidad/distancia.
     * 
     * @param especialidad Especialidad a filtrar (Sprint, Olímpico, etc.)
     * @return Lista de AtletaResponse de la especialidad especificada
     */
    @RequestMapping(value = "/especialidad", method = RequestMethod.GET)
    public List<AtletaResponse> listarPorEspecialidad(@RequestParam String especialidad) {
        return atletaService.listarPorEspecialidad(especialidad);
    }

    /**
     * Filtra triatletas por modalidad Cross.
     * 
     * @param modalidadCross true para triatletas con modalidad Cross, false para los que no
     * @return Lista de AtletaResponse con la modalidad Cross especificada
     */
    @RequestMapping(value = "/cross", method = RequestMethod.GET)
    public List<AtletaResponse> listarPorModalidadCross(@RequestParam Boolean modalidadCross) {
        return atletaService.listarPorModalidadCross(modalidadCross);
    }
    
    /**
     * Actualización completa de un triatleta (PUT - reemplaza todos los campos).
     * 
     * Utiliza la identificación del triatleta como identificador único.
     * Todos los campos del DTO serán reemplazados.
     * 
     * @param identificacion Número de identificación del triatleta a actualizar
     * @param dto Objeto AtletaDTO con todos los datos nuevos
     * @return ResponseEntity con AtletaResponse actualizado
     */
    @RequestMapping(value = "/{identificacion}", method = RequestMethod.PUT)
    public ResponseEntity<AtletaResponse> actualizarAtletaCompleto(
            @PathVariable String identificacion, 
            @Valid @RequestBody AtletaDTO dto) {
        return ResponseEntity.ok(atletaService.actualizarAtletaCompleto(identificacion, dto));
    }
    
    
}
