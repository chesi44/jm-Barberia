const SUPABASE_URL = "https://zccfkbfmwlmkukswwihv.supabase.co";
const SUPABASE_KEY = "sb_publishable_IzCUS3rfUgx3J2bIH2J4Eg_w7HuCLEC";

const supabaseCliente = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const btnLogin = document.getElementById("btnLogin");
const adminLogin = document.querySelector(".admin-login");
const adminPanel = document.getElementById("adminPanel");
const turnosHoyHTML = document.getElementById("turnosHoy");
const listaTurnosHoy = document.getElementById("listaTurnosHoy");
const ingresosHoyHTML = document.getElementById("ingresosHoy");
const ingresosMesHTML = document.getElementById("ingresosMes");
const totalCorteHTML = document.getElementById("totalCorte");
const totalCorteBarbaHTML = document.getElementById("totalCorteBarba");
const totalColorHTML = document.getElementById("totalColor");
const totalCanceladosHTML = document.getElementById("totalCancelados");
const listaHistorial = document.getElementById("listaHistorial");
const historialTurnos = document.getElementById("historialTurnos");
const historialCancelados = document.getElementById("historialCancelados");
const historialFacturacion = document.getElementById("historialFacturacion");
const fechaHistorial = document.getElementById("fechaHistorial");
const modalPrecio = document.getElementById("modalPrecio");
const modalCliente = document.getElementById("modalCliente");
const modalServicio = document.getElementById("modalServicio");
const modalPrecioActual = document.getElementById("modalPrecioActual");
const nuevoPrecio = document.getElementById("nuevoPrecio");

const guardarPrecio = document.getElementById("guardarPrecio");
const cancelarPrecio = document.getElementById("cancelarPrecio");
const cerrarModalPrecio = document.getElementById("cerrarModalPrecio");

const notificacionAdmin = document.getElementById("notificacionAdmin");

let turnoEditando = null;
const listaTurnosCancelados =
    document.getElementById("listaTurnosCancelados");

btnLogin.addEventListener("click", async () => {

    const email = adminEmail.value;
    const password = adminPassword.value;

    if (email === "" || password === ""){
        alert ("Completá el email y la contraseña");
        return;
    }
    const { data, error} = await supabaseCliente.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error){
        console.error("Error al iniciar sesión:", error);
        alert("Email o contraseña incorrectos");
        return;
    }

    console.log("Sesión iniciada:", data.user)
    adminLogin.style.display = "none";
    adminPanel.classList.add("visible");
    cargarTurnosHoy();
    //cargarTurnosCancelados();
    cargarResumenMes();
    cargarHistorial("hoy");
});
    async function cargarTurnosCancelados() {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");
        const fechaHoy = `${año}-${mes}-${dia}`;
        const{ data, error } = await supabaseCliente
        .from ("turnos")
        .select("*")
        .eq("fecha", fechaHoy)
        .eq("estado", "cancelado")
        .order("horario",{ ascending: true });
        
        if (error) {
        console.error("Error al cargar cancelados:", error);
        return;
    }
    listaTurnosCancelados.innerHTML = "";

    if (data.length === 0) {
        listaTurnosCancelados.innerHTML = `
            <p class="admin-vacio">
                No hay turnos cancelados hoy.
            </p>
        `;
        return;
    }

    data.forEach((turno) => {

        const turnoHTML = document.createElement("div");

        turnoHTML.classList.add(
            "admin-turno",
            "turno-cancelado"
        );

        turnoHTML.innerHTML = `
            <div class="admin-turno-hora">
                ${turno.horario.slice(0, 5)}
            </div>

            <div class="admin-turno-info">
                <strong>${turno.nombre}</strong>
                <span>${turno.servicio}</span>
            </div>

            <div class="estado-cancelado">
                CANCELADO
            </div>
        `;

        listaTurnosCancelados.appendChild(turnoHTML);
    });
};

async function cargarTurnosHoy(){

    const hoy = new Date();

    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    const fechaHoy = `${año}-${mes}-${dia}`;

    const{ data, error } = await supabaseCliente
    .from("turnos")
    .select("*")
    .eq("fecha", fechaHoy)
    .eq("estado", "confirmado")
    .order("horario", { ascending: true });

    if (error){
        console.error("Error al cargar turnos:", error);
        return;
    }

    console.log("Turnos de hoy:", data);

    turnosHoyHTML.textContent = data.length;

    let totalHoy = 0;
    data.forEach((turno) => {
        totalHoy = totalHoy + Number(turno.precio);
    });
    ingresosHoyHTML.textContent = 
    `$${totalHoy.toLocaleString("es-Ar")}`;
    
    listaTurnosHoy.innerHTML = "";
    
    if(data.length === 0){
        listaTurnosHoy.innerHTML = `
        <p class="admin-vacio">
        No hay turnos para hoy.
        </p>
        `;
        return;
    }
    data.forEach((turno) =>{
        const turnoHTML = document.createElement("div");
        turnoHTML.classList.add("admin-turno");

        turnoHTML.innerHTML = `
        <div class="admin-turno-hora">
        ${turno.horario.slice(0,5)}
        </div>
        <div class="admin-turno-info">
            <strong>${turno.nombre}</strong>
            <span>${turno.servicio}</span>
        </div>
            <div class="admin-turno-precio">
                $${Number(turno.precio).toLocaleString("es-AR")}
        </div>

        <button class="btn-editar-precio">
                Editar precio
        </button>

        <button class="btn-cancelar-turno">
                Cancelar
        </button>
        
        
        `;
        listaTurnosHoy.appendChild(turnoHTML);
        const btnCancelar = turnoHTML.querySelector(".btn-cancelar-turno");
        const btnEditarPrecio = turnoHTML.querySelector(".btn-editar-precio");

        btnEditarPrecio.addEventListener("click", () => {

    turnoEditando = turno;

    modalCliente.textContent = turno.nombre;
    modalServicio.textContent = turno.servicio;

    modalPrecioActual.textContent =
        `$${Number(turno.precio).toLocaleString("es-AR")}`;

    nuevoPrecio.value = turno.precio;

    modalPrecio.classList.add("activo");
});

        btnCancelar.addEventListener("click", async() => {
            const confirmar = confirm(
                    `¿Querés cancelar el turno de ${turno.nombre}?`
            );
            if(!confirmar){
                return;
            }
            const { error } = await supabaseCliente
            .from("turnos")
            .update({
                estado: "cancelado"
            })
            .eq("id", turno.id);
            
            if (error){
                console.error("Error al cancelar turno:", error);
                alert("No se pudo cancelar el turno");
                return;
            }
            alert("Turno cancelado");
            cargarTurnosHoy();
            cargarTurnosCancelados();
        })
    });
}
guardarPrecio.addEventListener("click", async () => {

    if (!turnoEditando) return;

    const precioNumero = Number(nuevoPrecio.value);

    if (precioNumero <= 0 || isNaN(precioNumero)) {
        mostrarNotificacion("Ingresá un precio válido");
        return;
    }

    const { error } = await supabaseCliente
        .from("turnos")
        .update({
            precio: precioNumero
        })
        .eq("id", turnoEditando.id);

    if (error) {
        console.error("Error al editar precio:", error);
        mostrarNotificacion("No se pudo actualizar el precio");
        return;
    }

    modalPrecio.classList.remove("activo");

    mostrarNotificacion(
        `✓ Precio actualizado a $${precioNumero.toLocaleString("es-AR")}`
    );

    turnoEditando = null;

    cargarTurnosHoy();
    cargarResumenMes();
    cargarHistorial("hoy");
});
function cerrarVentanaPrecio() {
    modalPrecio.classList.remove("activo");
    turnoEditando = null;
}

cancelarPrecio.addEventListener("click", cerrarVentanaPrecio);
cerrarModalPrecio.addEventListener("click", cerrarVentanaPrecio);

function mostrarNotificacion(mensaje) {
    notificacionAdmin.textContent = mensaje;
    notificacionAdmin.classList.add("mostrar");

    setTimeout(() => {
        notificacionAdmin.classList.remove("mostrar");
    }, 2500);
}

async function cargarResumenMes(){
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const primerDia = `${año}-${mes}-01`;
    const ultimoDiaNumero = new Date(
        hoy.getFullYear(),
        hoy.getMonth() + 1,
        0
    ).getDate();
    const ultimoDia =
    `${año}-${mes}-${String(ultimoDiaNumero).padStart(2, "0")}`;

    const { data, error } = await supabaseCliente
    .from("turnos")
    .select("servicio, precio, estado")
    .gte("fecha", primerDia)
    .lte("fecha", ultimoDia);

    if (error){
        console.error("Error al cargar resumen mensual:", error);
        return;
    }
    console.log("TURNOS DEL MES:", data);
    let totalCorte = 0;
    let totalCorteBarba = 0;
    let totalColor = 0;
    let cancelados = 0;

    data.forEach((turno) => {
        
        if(turno.estado === "cancelado"){
            cancelados++;
            return;
        }
        if(turno.servicio === "Corte de pelo"){
            totalCorte += Number(turno.precio);
        }
        if(turno.servicio === "Corte + Barba"){
            totalCorteBarba += Number(turno.precio);
        }
        if(turno.servicio === "Color / Claritos"){
            totalColor += Number(turno.precio);
        }
    });
    const totalMes =
    totalCorte +
    totalCorteBarba +
    totalColor;

    totalCorteHTML.textContent =
    `$${totalCorte.toLocaleString("es-AR")}`;

    totalCorteBarbaHTML.textContent =
    `$${totalCorteBarba.toLocaleString("es-AR")}`;

    totalColorHTML.textContent = 
    `$${totalColor.toLocaleString("es-AR")}`;

    totalCanceladosHTML.textContent = cancelados;

    ingresosMesHTML.textContent = 
    `$${totalMes.toLocaleString("es-AR")}`;
    
    const graficoServicios =
    document.getElementById("graficoServicios");

    new Chart(graficoServicios, {
        type: "doughnut",

        data: {
            labels: [
                "Corte de pelo",
                "Corte + Barba",
                "Color / Claritos"
            ],
            datasets: [{
                data:[
                    totalCorte,
                    totalCorteBarba,
                    totalColor
                ],
                backgroundColor: [
                    "#12d3ff",
                    "#ff0a0a",
                    "#fbff18"
                ],
                borderColor:"#171717",
                borderWidth: 3
            }]
        }
        
    });
}
async function cargarHistorial(filtro = "hoy") {
    const hoy = new Date();

    let desde;
    let hasta;

    if (/^\d{4}-\d{2}-\d{2}$/.test(filtro)) {
    const [anio, mes, dia] = filtro.split("-");

    desde = new Date(anio, mes - 1, dia);
    hasta = new Date(anio, mes - 1, dia);
}
    if (filtro === "hoy") {
        desde = new Date(hoy);
        hasta = new Date(hoy);
    }

    if (filtro === "ayer") {
        desde = new Date(hoy);
        desde.setDate(hoy.getDate() - 1);

        hasta = new Date(desde);
    }

    if (filtro === "mes") {
        desde = new Date(
            hoy.getFullYear(),
            hoy.getMonth(),
            1
        );

        hasta = new Date(
            hoy.getFullYear(),
            hoy.getMonth() + 1,
            0
        );
    }

    if (filtro === "anio") {
        desde = new Date(
            hoy.getFullYear(),
            0,
            1
        );

        hasta = new Date(
            hoy.getFullYear(),
            11,
            31
        );
    }

    const formatearFecha = (fecha) => {
        return (
            `${fecha.getFullYear()}-` +
            `${String(fecha.getMonth() + 1).padStart(2, "0")}-` +
            `${String(fecha.getDate()).padStart(2, "0")}`
        );
    };

    const fechaDesde = formatearFecha(desde);
    const fechaHasta = formatearFecha(hasta);

    const { data, error } = await supabaseCliente
        .from("turnos")
        .select("*")
        .gte("fecha", fechaDesde)
        .lte("fecha", fechaHasta)
        .order("fecha", { ascending: false })
        .order("horario", { ascending: true });

    if (error) {
        console.error("Error al cargar historial:", error);
        return;
    }

    listaHistorial.innerHTML = "";
    historialCelular.innerHTML= ""
    let cancelados = 0;
    let facturacion = 0;
    let confirmados = 0;

        data.forEach((turno) => {
        if (turno.estado === "cancelado") {
            cancelados++;
        } else {
            confirmados ++;
            facturacion += Number(turno.precio);
        }

        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${turno.fecha}</td>
            <td>${turno.horario.slice(0, 5)}</td>
            <td>${turno.nombre}</td>
            <td>${turno.servicio}</td>
            <td>$${Number(turno.precio).toLocaleString("es-AR")}</td>
            <td>
            <span class="estado-turno ${turno.estado.toLowerCase()}">
            ${turno.estado}
            </span>
            </td>
        `;

        listaHistorial.appendChild(fila);
        const tarjeta = document.createElement("div");
tarjeta.classList.add("historial-card");

tarjeta.innerHTML = `
    <div class="historial-card-top">
        <strong>${turno.horario.slice(0, 5)}</strong>

        <span class="estado-turno ${turno.estado.toLowerCase()}">
            ${turno.estado}
        </span>
    </div>

    <h3>${turno.nombre}</h3>

    <div class="historial-card-info">
        <span>${turno.fecha}</span>
        <span>${turno.servicio}</span>
    </div>

    <strong class="historial-card-precio">
        $${Number(turno.precio).toLocaleString("es-AR")}
    </strong>
`;

historialCelular.appendChild(tarjeta);
    });

    historialTurnos.textContent = confirmados;
    historialCancelados.textContent = cancelados;
    historialFacturacion.textContent =
        `$${facturacion.toLocaleString("es-AR")}`;
}   
const botonesHistorial = document.querySelectorAll(".filtro-historial");

botonesHistorial.forEach((boton) => {
    boton.addEventListener("click", () => {

        botonesHistorial.forEach((btn) => {
            btn.classList.remove("activo");
        });
        boton.classList.add("activo");
        const filtro = boton.dataset.filtro;
        cargarHistorial(filtro);
    });
});
fechaHistorial.addEventListener("change", () => {
    const fechaElegida = fechaHistorial.value;

    cargarHistorial(fechaElegida);
});

const mostrarPassword = document.getElementById("mostrarPassword");

mostrarPassword.addEventListener("click", () => {
    if (adminPassword.type === "password"){
        adminPassword.type = "text";
    } else {
        adminPassword.type = "password";
    }
})
const btnCerrarSesion = document.getElementById("btnCerrarSesion");

btnCerrarSesion.addEventListener("click", async() => {
    const { error } = await supabaseCliente.auth.signOut();

    if (error){
        console.error("Error al cerrar sesión:", error);
        return;
    }
    location.reload();
});
const canalTurnos = supabaseCliente
    .channel("cambios-turnos")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "turnos"
        },
        (payload) => {
            console.log("Cambio en turnos:", payload);

            cargarTurnosHoy();
            cargarResumenMes();
            cargarHistorial("hoy");
        }
    )
    .subscribe((estado) => {
        console.log("Realtime:", estado);
    });