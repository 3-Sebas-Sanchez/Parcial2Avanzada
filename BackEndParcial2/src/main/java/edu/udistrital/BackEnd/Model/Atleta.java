/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

/**
 *
 * @author nath
 */
@Entity
@EqualsAndHashCode(callSuper = true)
@Table(name = "atletas")
@Data
public class Atleta {
    
    
    private Integer edad;

    private String categoria;

    private String especialidad;

    private Boolean modalidadCross;
    
    private String foto;
    
}
