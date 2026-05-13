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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

/**
 *
 * @author nath
 */

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/atletas")

/**
 * Controlador REST para la gestión de atletas.
 * Expone endpoints para operaciones CRUD y consultas filtradas.
 */
public class AtletaRestController {
    
    private  AtletaService atletaService;

    public AtletaRestController(AtletaService atletaService) {
        this.atletaService = atletaService;
    }
    
    
    
        @RequestMapping(value = "/atleta", method = RequestMethod.POST)
        public ResponseEntity<AtletaResponse> registrar(@Valid @RequestBody AtletaDTO dto) {
            return new ResponseEntity<>(atletaService.registrarAtleta(dto), HttpStatus.CREATED);
        }

        @RequestMapping( value="/{identificacion}" ,method = RequestMethod.GET)
        public ResponseEntity<AtletaResponse> obtenerPorIdentificacion(@PathVariable String identificacion) {
            return ResponseEntity.ok(atletaService.consultarPorIdentificacion(identificacion));
        }

        @RequestMapping( method = RequestMethod.GET)
        public List<AtletaResponse> listarTodos() {
            return atletaService.listarTodos();
        }

        @RequestMapping(value="/delete/{identificacion}" ,method = RequestMethod.DELETE)
        public ResponseEntity<Void> eliminar(@PathVariable String identificacion) {
        atletaService.eliminarAtleta(identificacion);
            return ResponseEntity.noContent().build();
        }

        @RequestMapping(value = "/{identificacion}/nombre", method = RequestMethod.PATCH)
        public ResponseEntity<AtletaResponse> actualizarNombre( @PathVariable String identificacion, @RequestParam String nuevoNombre) {
            return ResponseEntity.ok(atletaService.actualizarNombre(identificacion, nuevoNombre));
        }

        @RequestMapping(value = "/{identificacion}/identificacion", method = RequestMethod.PATCH)
        public ResponseEntity<AtletaResponse> actualizarIdentificacion( @PathVariable Long id, @RequestParam String nuevaIdentificacion) {
            return ResponseEntity.ok(atletaService.actualizarIdentificacion(id, nuevaIdentificacion));
        }


        @RequestMapping(value = "/{identificacion}/categoria", method = RequestMethod.PATCH)
        public ResponseEntity<AtletaResponse> actualizarCategoria(@PathVariable String identificacion, @RequestParam String nuevaCategoria) {
            return ResponseEntity.ok(atletaService.actualizarCategoria(identificacion, nuevaCategoria));
        }

    @GetMapping("/filtro/genero")    @RequestMapping( value= "/genero",method = RequestMethod.GET)
    public List<AtletaResponse> listarPorGenero(@RequestParam String genero) {
        return atletaService.listarPorGenero(genero);
    }

    @RequestMapping( value= "/categoria",method = RequestMethod.GET)
    public List<AtletaResponse> listarPorCategoria(@RequestParam String categoria) {
        return atletaService.listarPorCategoria(categoria);
    }

    @RequestMapping( value= "/especialidad",method = RequestMethod.GET)
    public List<AtletaResponse> listarPorEspecialidad(@RequestParam String especialidad) {
        return atletaService.listarPorEspecialidad(especialidad);
    }


    @RequestMapping( value= "/cross",method = RequestMethod.GET)
    public List<AtletaResponse> listarPorModalidadCross(@RequestParam Boolean modalidadCross) {
        return atletaService.listarPorModalidadCross(modalidadCross);
    }
    
}
