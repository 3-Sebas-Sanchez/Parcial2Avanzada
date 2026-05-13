/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Repository;

import edu.udistrital.BackEnd.Model.AtletaDTO;
import edu.udistrital.BackEnd.Model.Persona;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 *
 * @author nath
 */
@Repository
public interface AtletaRepository extends JpaRepository<AtletaDTO, Long>{
    
    //Microservicio: Consultar triatleta por identificacion
    Optional<AtletaDTO> findById(String id);
    
    //Microservicio: Consultar grupos de triatletas por género
    List<AtletaDTO>findByGenero(String genero);
    //Microservicio: Consultar grupos de triatletas por categoría
    List <AtletaDTO>findByCategoria (String categoria);
    //Microservicio: Consultar grupos de triatletas por especialidad
    List<AtletaDTO>findByEspecialidad (String especialidad);
    //Microservicio: Consultar grupos de triatletas por modalidad cross
    List<AtletaDTO>findByModalidadCross (Boolean modalidadCross);
    
    //Microservicio: Eliminar un triatleta
    @Transactional
    void deleteByIdentificacion(String identificacion);
    
    
    //Microservicio:  Modificar nombre del triatleta
    @Modifying
    @Transactional
    @Query ("UPDATE AtletaDTO a SET a.nombre = :nuevoNombre WHERE a.identificacion =:identificacion")
    int actualizarNombre(@Param ("identificacion") String identificacion, @Param ("nuevoNombre") String nuevoNombre);
    
    //Microservicio:  Modificar id del triatleta
    @Modifying
    @Transactional
    @Query ("UPDATE AtletaDTO a SET a.identificacion = :nuevaIdentificacion WHERE a.identificacion =:identificacion")
    int actualizarIdentificacion(@Param ("identificacion") Long id, @Param("nuevaIdentificacion") String nuevaIdentififcacion);
    
    //Microservicio:  Modificar categoria del triatleta
    @Modifying
    @Transactional
    @Query ("UPDATE AtletaDTO a SET a.categoria =:nuevaCategoria WHERE a.identificacion =:identificacion")
    int actualizarCategoria(@Param ("identificacion") String identificacion, @Param ("nuevaCategoria") String nuevaCategoria);
    
    
    
}
