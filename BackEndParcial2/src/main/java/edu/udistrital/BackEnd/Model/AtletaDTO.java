/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 *
 * @author nath
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "atletas")
@Entity
public class AtletaDTO extends Persona{
    

    private String categoria;

    private String especialidad;

    private Boolean modalidadCross;
    
    private String foto;
    
}
