// login.js - VERSIÓN FINAL CORREGIDA ✅

// ⚠️ ASEGÚRATE QUE ESTA URL SEA LA DE TU DEPLOY MÁS RECIENTE
const urlAPI = "https://script.google.com/macros/s/AKfycbygpPY8FKKFN_5OT0An4cESl_YDzPWVBYadKHbdU9jTRtL1lkRV3N-7WlCudfxqJDc_/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('form-login');

    if (loginForm) {
        // CORRECCIÓN CRÍTICA AQUÍ ABAJO: 👇
        // Agregamos la palabra 'async' antes de (e)
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita que la página se recargue

            // 1. Obtenemos los datos y quitamos espacios en blanco por si acaso
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('pass').value.trim();

            // 2. Feedback visual para el usuario
            Swal.fire({
                title: 'Verificando...',
                text: 'Conectando con la base de datos...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            try {
                // 3. Petición al servidor (Apps Script)
                const response = await fetch(`${urlAPI}?accion=login&email=${encodeURIComponent(email)}&pass=${encodeURIComponent(pass)}`);
                const data = await response.json();

                if (data.success) {
                    // --- LOGIN EXITOSO ---
                    localStorage.setItem('als_sesion', 'activa');
                    
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Ingresando al sistema...',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.href = 'admin.html';
                    });
                } else {
                    // --- DATOS INCORRECTOS ---
                    Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'Correo o contraseña incorrectos. Verifica mayúsculas y espacios.'
                    });
                }
            } catch (error) {
                // --- ERROR DE CONEXIÓN ---
                console.error(error);
                Swal.fire({
                    icon: 'warning',
                    title: 'Error de Conexión',
                    text: 'No se pudo conectar. Revisa tu internet o la URL del script.'
                });
            }
        });
    }
});