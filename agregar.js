// agregar.js - Lógica del Formulario de Alta

// --- CONFIGURACIÓN ---
// ¡PEGA AQUÍ TU URL LARGA DEL SCRIPT DE GOOGLE!
const urlAPI = "https://script.google.com/macros/s/AKfycbygpPY8FKKFN_5OT0An4cESl_YDzPWVBYadKHbdU9jTRtL1lkRV3N-7WlCudfxqJDc_/exec"; 

let fotoBase64 = "";

// --- 1. AL CARGAR LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    // Generamos un ID random inicial
    const randomID = Math.random().toString(16).substr(2, 8); 
    document.getElementById('id').value = randomID;
    
    // Configuramos las tallas correctas por defecto
    cambiarOpcionesTalla();
});

// --- 2. LÓGICA DINÁMICA DE TALLAS ---
function cambiarOpcionesTalla() {
    const tipo = document.getElementById('tipo').value;
    const selectTalla = document.getElementById('talla');
    const contenedorTalla = document.getElementById('contenedor-talla');

    // Limpiamos las opciones actuales
    selectTalla.innerHTML = "";
    
    if (tipo === "Vestido") {
        contenedorTalla.style.display = "block"; 
        const tallasRopa = ["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL"];
        tallasRopa.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t;
            opt.text = t;
            if(t === "M") opt.selected = true; 
            selectTalla.add(opt);
        });

    } else if (tipo === "Zapato") {
        contenedorTalla.style.display = "block";
        // Generamos tallas del 2 al 7 con medios puntos
        for (let i = 2; i <= 7; i += 0.5) {
            const opt = document.createElement("option");
            opt.value = i.toString(); 
            opt.text = i.toString() + " MX";
            if(i === 4) opt.selected = true; 
            selectTalla.add(opt);
        }

    } else {
        // BOLSA o ACCESORIOS -> Ocultamos Talla
        contenedorTalla.style.display = "none";
        
        // Opción oculta "UNI" para que no se rompa la base de datos
        const opt = document.createElement("option");
        opt.value = "UNI";
        opt.selected = true;
        selectTalla.add(opt);
    }

    // Actualizamos el código inmediatamente después de cambiar las tallas
    actualizarCodigo();
}

// --- 3. GENERADOR DE CÓDIGO (Talla + Suffix) ---
function actualizarCodigo() {
    const talla = document.getElementById('talla').value;
    // Genera 4 letras/números al azar (Ej: A8B9)
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    // Si es bolsa (UNI), el código será UNI-A8B9. Si es vestido, M-A8B9
    document.getElementById('codigo').value = `${talla}-${suffix}`;
}

// Eventos de cambio (Cuando el usuario mueve algo)
document.getElementById('tipo').addEventListener('change', cambiarOpcionesTalla);
document.getElementById('talla').addEventListener('change', actualizarCodigo);


// --- 4. PROCESAMIENTO DE FOTO ---
document.getElementById('input-foto').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Mostrar imagen previa
            const img = document.getElementById('preview-img');
            img.src = e.target.result;
            img.classList.remove('hidden');
            document.getElementById('preview-placeholder').classList.add('hidden');
            
            // Guardar Base64 limpio
            fotoBase64 = e.target.result.split(',')[1]; 
        }
        reader.readAsDataURL(file);
    }
});


// --- 5. ENVIAR FORMULARIO (Fetch) ---
document.getElementById('form-agregar').addEventListener('submit', function(e) {
    e.preventDefault();

    if(!fotoBase64) { 
        alert("⚠️ ¡Falta la foto! Es obligatoria."); 
        return; 
    }

    const btn = document.getElementById('btn-guardar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⏳ Subiendo...";
    btn.disabled = true;

    // Recopilar datos
    const formData = new FormData(document.getElementById('form-agregar'));
    const datos = Object.fromEntries(formData);
    
    // Agregar datos técnicos
    datos.accion = "crear";
    datos.fotoBase64 = fotoBase64;
    datos.mimeType = "image/jpeg";

    // Enviar a Google
    fetch(urlAPI, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(datos)
    })
    .then(r => r.text())
    .then(res => {
        alert("✅ ¡Artículo guardado correctamente!");
        window.location.href = "admin.html"; // Regresar al menú
    })
    .catch(err => {
        console.error(err);
        alert("❌ Error: " + err);
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    });
});