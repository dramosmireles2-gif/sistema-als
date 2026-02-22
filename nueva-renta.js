// nueva-renta.js - VERSIÓN PRO (SWEETALERT2)

// 1. URL DE TU SCRIPT
const urlAPI = "https://script.google.com/macros/s/AKfycbygpPY8FKKFN_5OT0An4cESl_YDzPWVBYadKHbdU9jTRtL1lkRV3N-7WlCudfxqJDc_/exec"; 

document.addEventListener("DOMContentLoaded", () => {
    // Generar ID Renta único
    const idRenta = Math.random().toString(16).substr(2, 8);
    const inputIdRenta = document.getElementById('id_renta');
    if(inputIdRenta) inputIdRenta.value = idRenta;

    // Fechas iniciales
    const hoy = new Date().toISOString().split('T')[0];
    const inputEntrega = document.getElementById('fecha_entrega');
    
    if(inputEntrega) {
        inputEntrega.value = hoy;
        inputEntrega.addEventListener('change', calcularFechaRetorno);
    }
    calcularFechaRetorno();

    // Cargar Datos Iniciales
    cargarClientes();    
    cargarInventario();   
});

// --- FUNCIÓN A: CARGAR INVENTARIO ---
async function cargarInventario() {
    const listaContenedor = document.getElementById('lista-items');
    if(!listaContenedor) return;

    try {
        const resp = await fetch(`${urlAPI}?accion=obtener_inventario`);
        if (!resp.ok) throw new Error("Error en el servidor");
        
        const items = await resp.json();
        listaContenedor.innerHTML = ""; 
        
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = "flex items-center gap-4 p-3 hover:bg-[#3d3d3d] cursor-pointer border-b border-gray-700 last:border-0";
            
            const esUrl = item.foto && item.foto.startsWith('http');
            const fotoUrl = esUrl ? item.foto : "https://placehold.co/50x50?text=Vestido";

            div.innerHTML = `
                <img src="${fotoUrl}" 
                     class="w-12 h-12 rounded-lg object-cover bg-gray-700" 
                     onerror="this.onerror=null; this.src='https://placehold.co/50x50?text=Err';">
                <div class="flex-1">
                    <p class="text-sm font-bold text-white">${item.nombre || 'Sin nombre'}</p>
                    <p class="text-[10px] text-gray-400 uppercase">Talla: <span class="text-pink-400">${item.talla || 'N/A'}</span></p>
                </div>
                <div class="text-right">
                    <p class="text-xs font-bold text-green-400">$${item.precio || '0'}</p>
                </div>
            `;

            div.onclick = () => seleccionarVestido(item);
            listaContenedor.appendChild(div);
        });
    } catch (e) {
        console.error("Error crítico:", e);
        listaContenedor.innerHTML = "<p class='p-4 text-red-500 text-xs'>Error cargando inventario.</p>";
    }
}

// --- FUNCIÓN B: CONTROL DEL DROPDOWN ---
function toggleDropdown() {
    const lista = document.getElementById('dropdown-list');
    if(lista) lista.classList.toggle('hidden');
}

function seleccionarVestido(item) {
    document.getElementById('id_articulo').value = item.id;
    document.getElementById('nombre_articulo').value = item.nombre;
    
    document.getElementById('selected-text').innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-pink-500 font-bold">[${item.talla}]</span> ${item.nombre}
        </div>
    `;
    
    const inputTotal = document.getElementById('total');
    if(inputTotal) inputTotal.value = item.precio;
    
    calcularSaldos();
    toggleDropdown();
}

window.onclick = function(event) {
    if (!event.target.closest('#dropdown-btn')) {
        const dd = document.getElementById('dropdown-list');
        if(dd) dd.classList.add('hidden');
    }
    if (!event.target.closest('#cliente-btn')) {
        const ddC = document.getElementById('cliente-dropdown');
        if(ddC && event.target.id !== 'input-busqueda-cliente') ddC.classList.add('hidden');
    }
}

// --- CÁLCULOS MATEMÁTICOS ---
function calcularSaldos() {
    const elTotal = document.getElementById('total');
    const elDesc = document.getElementById('descuento');
    const elAbono = document.getElementById('abono');
    const elSaldo = document.getElementById('saldo');

    if(elTotal && elDesc && elAbono && elSaldo) {
        const total = parseFloat(elTotal.value) || 0;
        const desc = parseFloat(elDesc.value) || 0;
        const abono = parseFloat(elAbono.value) || 0;
        elSaldo.value = total - desc - abono;
    }
}

['total', 'descuento', 'abono'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', calcularSaldos);
});

function calcularFechaRetorno() {
    const entregaInput = document.getElementById('fecha_entrega');
    const retornoInput = document.getElementById('fecha_retorno');

    if (entregaInput && entregaInput.value && retornoInput) {
        const fecha = new Date(entregaInput.value);
        fecha.setDate(fecha.getDate() + 4); 
        retornoInput.value = fecha.toISOString().split('T')[0];
    }
}

// --- ENVÍO DEL FORMULARIO (CON SWEETALERT2) 🚀 ---
const formRenta = document.getElementById('form-renta');
if(formRenta) {
    formRenta.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 1. VALIDACIÓN
        const elIdCliente = document.getElementById('id_cliente');
        const elIdArticulo = document.getElementById('id_articulo');
        const elFechaEvento = document.getElementById('fecha_evento');
        
        if (!elIdCliente.value) { return Swal.fire('Falta Cliente', 'Por favor selecciona un cliente.', 'warning'); }
        if (!elIdArticulo.value) { return Swal.fire('Falta Vestido', 'Por favor selecciona un artículo.', 'warning'); }
        if (!elFechaEvento.value) { return Swal.fire('Falta Fecha', 'Indica la fecha del evento.', 'warning'); }

        const elGarantia = document.querySelector('input[name="garantia"]:checked');
        const elTotal = document.getElementById('total');
        const elIdRenta = document.getElementById('id_renta');
        const elAjustes = document.getElementById('ajustes');

        // 2. LOADING STATE
        Swal.fire({
            title: 'Guardando Renta...',
            html: 'Por favor espera un momento',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading() }
        });

        // 3. EMPAQUETADO
        const datos = {
            accion: "crear_renta",
            id_renta: elIdRenta.value,
            id_cliente: elIdCliente.value,
            id_articulo: elIdArticulo.value,
            fecha_evento: elFechaEvento.value,
            ajustes: elAjustes.value,
            fecha_entrega: document.getElementById('fecha_entrega').value,
            fecha_retorno: document.getElementById('fecha_retorno').value,
            precio_total: elTotal.value,
            abono: document.getElementById('abono').value,
            descuento: document.getElementById('descuento').value,
            garantia: elGarantia ? elGarantia.value : ""
        };

        // 4. ENVÍO
        fetch(urlAPI, {
            method: "POST",
            body: new URLSearchParams(datos)
        })
        .then(res => {
            // ÉXITO
            Swal.fire({
                icon: 'success',
                title: '¡Renta Guardada!',
                text: 'El inventario ha sido actualizado.',
                confirmButtonText: 'Volver al Admin',
                confirmButtonColor: '#3085d6'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "admin.html";
                }
            });
        })
        .catch(err => {
            Swal.fire('Error', 'No se pudo conectar con el servidor: ' + err, 'error');
        });
    });
}

// --- GESTIÓN DE CLIENTES ---
let clientesData = []; 

async function cargarClientes() {
    try {
        const resp = await fetch(`${urlAPI}?accion=obtener_clientes`);
        clientesData = await resp.json();
        renderizarListaClientes([]); 
    } catch (e) { console.error("Error al cargar clientes:", e); }
}

function filtrarClientes() {
    const input = document.getElementById('input-busqueda-cliente');
    if(!input) return;
    const busqueda = input.value.toLowerCase();
    
    if(busqueda.length > 0) {
        const filtrados = clientesData.filter(c => c.nombre.toLowerCase().includes(busqueda));
        renderizarListaClientes(filtrados);
    } else {
        renderizarListaClientes([]); 
    }
}

function renderizarListaClientes(lista) {
    const contenedor = document.getElementById('lista-clientes-sugerencias');
    if(!contenedor) return;
    contenedor.innerHTML = "";
    
    lista.forEach(c => {
        const div = document.createElement('div');
        div.className = "p-3 hover:bg-[#3d3d3d] cursor-pointer text-sm border-b border-gray-700 text-white flex justify-between";
        div.innerHTML = `<span>${c.nombre}</span> <span class="text-gray-500 text-[10px]">${c.id}</span>`;
        
        div.onclick = () => {
            document.getElementById('id_cliente').value = c.id;
            document.getElementById('nombre_cliente').value = c.nombre;
            document.getElementById('cliente-seleccionado').innerText = c.nombre;
            const dd = document.getElementById('cliente-dropdown');
            if(dd) dd.classList.add('hidden');
        };
        contenedor.appendChild(div);
    });
}

function toggleClienteDropdown() {
    const dd = document.getElementById('cliente-dropdown');
    if(dd) {
        dd.classList.toggle('hidden');
        if(!dd.classList.contains('hidden')) {
            const input = document.getElementById('input-busqueda-cliente');
            if(input) input.focus();
            renderizarListaClientes(clientesData);
        }
    }
}

// --- MODAL NUEVO CLIENTE (SWEETALERT) ---
function abrirModalCliente() { 
    const modal = document.getElementById('modal-nuevo-cliente');
    if(modal) modal.classList.remove('hidden'); 
}
function cerrarModalCliente() { 
    const modal = document.getElementById('modal-nuevo-cliente');
    if(modal) modal.classList.add('hidden'); 
}

async function guardarNuevoCliente() {
    const nombre = document.getElementById('nuevo-cliente-nombre').value;
    const tel = document.getElementById('nuevo-cliente-tel').value;

    if(!nombre || !tel) return Swal.fire('Ups', 'Falta nombre o teléfono', 'warning');

    Swal.fire({
        title: 'Registrando...',
        didOpen: () => { Swal.showLoading() }
    });

    try {
        const resp = await fetch(`${urlAPI}?accion=crear_cliente&nombre=${encodeURIComponent(nombre)}&telefono=${encodeURIComponent(tel)}`, {
            method: "POST"
        });
        const nuevoCliente = await resp.json();
        
        clientesData.push(nuevoCliente);
        
        document.getElementById('id_cliente').value = nuevoCliente.id;
        document.getElementById('nombre_cliente').value = nuevoCliente.nombre;
        document.getElementById('cliente-seleccionado').innerText = nuevoCliente.nombre;
        
        cerrarModalCliente();
        
        Swal.fire({
            icon: 'success',
            title: 'Cliente Registrado',
            text: 'Se ha seleccionado automáticamente',
            timer: 1500,
            showConfirmButton: false
        });
        
        document.getElementById('nuevo-cliente-nombre').value = "";
        document.getElementById('nuevo-cliente-tel').value = "";

    } catch (e) {
        Swal.fire('Error', 'No se pudo guardar el cliente', 'error');
    }
}