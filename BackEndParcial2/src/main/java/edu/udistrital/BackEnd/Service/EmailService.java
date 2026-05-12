/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package edu.udistrital.BackEnd.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 *
 * @author nath
 */

@Service
@RequiredArgsConstructor
        
/**
 * Servicio para el envío de correos electrónicos.
 */
class EmailService {
        
         private final JavaMailSender mailSender;
    
          /**
         * Envía un correo de bienvenida al atleta registrado.
         * @param destinatario Correo del atleta.
         * @param nombre Nombre del atleta.
         */
        public void enviarCorreoBienvenida(String destinatario, String nombre) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(destinatario);
                message.setSubject("Registro Exitoso - Sistema de Triatlón");
                message.setText("Hola " + nombre + ",\n\nTu registro en el sistema de Triatlón ha sido exitoso.\n¡Bienvenido!");
                mailSender.send(message);
            } catch (Exception e) {
            }
        }
    
}
