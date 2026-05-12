/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 *
 * @author nath
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "atletas")
@Entity

@NoArgsConstructor
@AllArgsConstructor
public class AtletaDTO extends Persona{
    

    private String categoria;

    private String especialidad;

    private Boolean modalidadCross;
    
    private String foto;

    public AtletaDTO(String categoria, String especialidad, Boolean modalidadCross, String foto, Long id, String identificacion, String nombre, String genero, String correo, Integer edad, Boolean personaActiva) {
        super(id, identificacion, nombre, genero, correo, edad, personaActiva);
        this.categoria = categoria;
        this.especialidad = especialidad;
        this.modalidadCross = modalidadCross;
        this.foto = foto;
    }
    
    
    
}
