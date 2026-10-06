const SUPABASE_URL = "https://zccfkbfmwlmkukswwihv.supabase.co";
const SUPABASE_KEY = "sb_publishable_IzCUS3rfUgx3J2bIH2J4Eg_w7HuCLEC";
const supabaseCliente = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY,
);
let duracionReserva = 0;
let horariosSeleccionado = "";
let servicioReserva = "";
let precioReserva = 0;
let promocionReserva = null;
let cantidadTurnosReserva = 1;

const opcionesServicio = document.querySelectorAll(".opcion-servicio");
const promocionesReservables =
    document.querySelectorAll(".promo-reservable");

promocionesReservables.forEach((promo) => {

    promo.addEventListener("click", () => {

        const tipoPromo = promo.dataset.promo;

        promocionReserva = tipoPromo;

        // Todas las promos son sobre corte de pelo
        servicioReserva = "Corte de pelo";
        duracionReserva = 40;
        cantidadTurnosReserva = 1;

        if (tipoPromo === "lunes") {

            precioReserva = 11000;

        } else if (tipoPromo === "amigos") {

            precioReserva = 12000;

            // Tres cortes consecutivos
            cantidadTurnosReserva = 3;

        } else if (tipoPromo === "futsal") {

            precioReserva = 13000;
        }

        document
            .querySelectorAll(".promo-reservable")
            .forEach((card) => {
                card.classList.remove("seleccionada");
            });

        promo.classList.add("seleccionada");


        // Igual que cuando elegimos un servicio normal
        document
            .getElementById("pasoFecha")
            .style.display = "block";


        // Bajamos automáticamente hasta la fecha
        document
            .getElementById("pasoFecha")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

    });

});
const pasoFecha = document.getElementById("pasoFecha");
const elegirServicio = document.getElementById("elegirServicio");
const fechaReserva = document.getElementById("fechaReserva");
const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2,"0");
const dia = String(hoy.getDate()).padStart(2,"0");
fechaReserva.min = `${anio}-${mes}-${dia}`;
const pasoHorarios = document.getElementById("pasoHorarios");
const horariosReserva = document.getElementById("horariosReserva");
const pasoDatos = document.getElementById("pasoDatos");
const nombreCliente = document.getElementById("nombreCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const btnConfirmar = document.getElementById("btnConfirmar");
const resumenTurno = document.getElementById("resumenTurno");
const nombreAmigos = document.getElementById("nombresAmigos");
const duracionTotalReserva = 
    duracionReserva * cantidadTurnosReserva;
    fechaReserva.addEventListener("change", async () => {

    fechaReserva.classList.add("fecha-elegida");

    const placeholderFecha = document.querySelector(".fecha-placeholder");

    if (placeholderFecha) {
        placeholderFecha.style.display = "none";
    }
    const fechaElegida = new Date(fechaReserva.value + "T00:00:00");

    // ===== PROMO LUNES =====
    if (promocionReserva === "lunes") {

        const diaSemana = fechaElegida.getDay();

        // Domingo = 0
        // Lunes = 1
        if (diaSemana !== 1) {

            alert(
                "La promoción Lunes 20% OFF solamente está disponible los lunes."
            );

            fechaReserva.value = "";
            pasoHorarios.classList.remove("visible");

            return;
        }
    }

    // ===== NO PERMITIR FECHAS PASADAS =====
    const hoyComparacion = new Date();
    hoyComparacion.setHours(0,0,0,0);

    if (fechaElegida < hoyComparacion){
        alert("No podés reservar una fecha pasada");
        fechaReserva.value = "";
        return;
    }

    // ===== DOMINGOS CERRADO =====
    if(fechaElegida.getDay() === 0){
        alert("Los domingos la barbería está cerrada");
        fechaReserva.value = "";
        return;
    }

    // ===== MOSTRAR HORARIOS =====
    pasoHorarios.classList.add("visible");

    const ocupados = await obtenerHorariosOcupados(fechaReserva.value);

    console.log("Turnos ocupados recibidos:", ocupados);

    generarHorariosReserva(duracionReserva, ocupados);

});
function horaAMinutos(hora){
        const[horas, minutos] = hora.split(":").map(Number);
        return horas * 60 + minutos;
    }
opcionesServicio.forEach((boton) => {

    boton.addEventListener("click", () => {

        const servicio = boton.dataset.servicio;
        const precio = boton.dataset.precio;
        const duracion = boton.dataset.duracion;

        servicioReserva = servicio;
        precioReserva = Number(precio);
        duracionReserva = Number(duracion);

        elegirServicio.style.display = "none"
        document.querySelector(".promociones").style.display = "none";
        pasoFecha.classList.add("visible");

        console.log(servicio);
        console.log(precio);
        console.log(duracion);
    });
});
async function obtenerHorariosOcupados(fecha){
    const {data, error} = await supabaseCliente.rpc(
        "obtener_horarios_ocupados",
        {
            fecha_consulta: fecha
        }
    );
    if (error) {
        console.error("Error al obtener horarios ocupados:", error);
        return [];
    }
    console.log("Horarios ocupados:", data);
        return data;
}
function generarHorariosReserva(duracion, ocupados){

    horariosReserva.innerHTML = "";
    const duracionBloque =
    promocionReserva === "amigos"
    ?120
    :duracion;

    const ahora = new Date();
    const fechaElegida = new Date(fechaReserva.value + "T00:00:00");

    const esHoy = 
    fechaElegida.getFullYear() === ahora.getFullYear() &&
    fechaElegida.getMonth() === ahora.getMonth() &&
    fechaElegida.getDate() === ahora.getDate();
    console.log("la fecha elegida es hoy?", esHoy);
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    let horaActual = 9 * 60;
    let horaCierre = 20 * 60;

    while (horaActual + duracionBloque <= horaCierre){
        const horas = Math.floor(horaActual / 60);
        const minutos = horaActual % 60;
        const horaTexto =
        `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
        const botonHora = document.createElement("button");
        botonHora.type = "button";
        botonHora.textContent = horaTexto;
        botonHora.classList.add("boton-horario");
        const estaOcupado = ocupados.some((turno) => {
            const inicioOcupado = horaAMinutos(turno.horario);
            const finOcupado = inicioOcupado + Number(turno.duracion);

            const inicioNuevo = horaActual;
            const finNuevo = horaActual + duracionBloque;

            return inicioNuevo < finOcupado && finNuevo > inicioOcupado;

        });
        if (estaOcupado){
            botonHora.disabled = true;
            botonHora.classList.add("horario-ocupado");
        }
        
        if (esHoy && horaActual <= minutosAhora){
            botonHora.disabled = true;
            botonHora.classList.add("horario-pasado");
        }
        botonHora.addEventListener("click" , () => {
            horariosSeleccionado = horaTexto;

            const botonesHorarios = document.querySelectorAll(".boton-horario");

            botonesHorarios.forEach((boton)=> {
                boton.classList.remove("seleccionado");
        });
                botonHora.classList.add("seleccionado");

                pasoDatos.classList.add("visible");

                console.log("Horario seleccionado:", horariosSeleccionado);
            
        });

        horariosReserva.appendChild(botonHora);

        horaActual = horaActual + duracion;
    }
}
btnConfirmar.addEventListener("click", async () => {

    const nombre = nombreCliente.value;
    const telefono = telefonoCliente.value;
    const fecha = fechaReserva.value;

    if(nombre == "" || telefono == "" || horariosSeleccionado == ""){

        alert("Completá todos los datos del turno");

        return;
        }
        if(!telefonoCliente.checkValidity()){
            alert("Ingresá un telefono válido");
            return;
        }
        const {data, error} = await supabaseCliente.rpc(
        "crear_turno",
        {
        p_nombre: nombre,
        p_telefono: telefono,
        p_servicio: servicioReserva,
        p_precio: precioReserva,
        p_fecha: fecha,
        p_horario: horariosSeleccionado,
        p_duracion: duracionReserva,
        p_promocion: promocionReserva
        }
    );
    if (error){
        console.error("Error al guardar el turno:", error);
        console.log("MENSAJE:", error.message);
        console.log("CODIGO:", error.code);
        console.log("DETALLES:", error.details);
        console.log("HINT:", error.hint);

        alert("Hubo un error al reservar el turno");
        return;
    }
    if (data === false){
        alert("Ese horario acaba de ser reservado. Elegí otro horario.");
        return
    }

    resumenTurno.innerHTML = `
    <h2>✅ Turno confirmado</h2>
    <p> ${servicioReserva}</p>
    <p>Fecha: ${fecha}</p>
    <p>Horario: ${horariosSeleccionado}</p>
    <p>Nombre: ${nombre}</p>
    <p>WhatsApp: ${telefono}</p>
    <strong>
    Total: $ ${precioReserva.toLocaleString("es-AR")}
    </strong>
    `;
    resumenTurno.classList.add("visible");
    console.log("mostrando confirmacion")
});