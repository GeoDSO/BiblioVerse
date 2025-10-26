package com.biblioverse.biblioverse.Dtos;
import com.biblioverse.biblioverse.Entidades.Usuario;
public class LoginResponse {
    private boolean success;
    private String message;
    private Usuario usuario;

    public LoginResponse(boolean success, String message, Usuario usuario) {
        this.success = success;
        this.message = message;
        this.usuario = usuario;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public Usuario getUsuario() {
        return usuario;
    }
}

