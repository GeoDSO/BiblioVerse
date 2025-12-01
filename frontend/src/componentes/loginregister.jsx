import React, { useState } from "react";
import "./login.css";

export default function LoginRegister({ onLogin, onRegister, setIsSignUp, isSignUpGlobal }) {
  //const [isSignUp, setIsSignUp] = useState(false);
  const isSignUp = isSignUpGlobal; // Renombrar para usar el nombre que tenías antes
  // Estados para LOGIN
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para REGISTRO
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert('Por favor completa todos los campos');
      return;
    }
    onLogin(loginEmail, loginPassword);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    if (!registerUsername || !registerEmail || !registerPassword || !registerConfirm) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (registerPassword !== registerConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }

    onRegister(registerEmail, registerUsername, registerPassword);
    
    // Limpiar campos y cambiar a login después del registro
    setRegisterUsername('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirm('');
    setIsSignUp(false);
  };

  return (
    <div className={`login-wrapper ${isSignUp ? "night" : "day"}`}>
      
      <div className={`auth-card ${isSignUp ? "night" : "day"}`}>

        {/* Login */}
        <div className={`fade-container ${isSignUp ? "hidden" : ""}`}>
          <h2>Inicia Sesión</h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn">Entrar</button>
          </form>

          <div className="form-link">
            <p>
              ¿No tienes cuenta?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); }}>
                Regístrate
              </a>
            </p>
          </div>
        </div>

        {/* Register */}
        <div className={`fade-container ${!isSignUp ? "hidden" : ""}`}>
          <h2>Crear Cuenta</h2>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirmar</label>
              <input 
                type="password" 
                value={registerConfirm}
                onChange={(e) => setRegisterConfirm(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn">Registrarse</button>
          </form>

          <div className="form-link">
            <p>
              ¿Ya tienes cuenta?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); }}>
                Inicia sesión
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}