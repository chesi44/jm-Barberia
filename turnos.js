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

const opcionesServicio = document.querySelectorAll(".opcion-servicio");
const pasoFecha = document.getElementById("pasoFecha");
const elegirServicio = document.getElementById("elegirServicio");
const fechaReserva = document.getElementById("fechaReserva");
const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1.).padStart(2,"0");
const dia = String(hoy.getDate()).padStart(2,"0");
fechaReserva.min = `${anio}-${mes}-${dia}`;
const pasoHorarios = document.getElementById("pasoHorarios");
const horariosReserva = document.getElementById("horariosReserva");
const pasoDatos = document.getElementById("pasoDatos");
const nombreCliente = document.getElementById("nombreCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const btnConfirmar = document.getElementById("btnConfirmar");
const resumenTurno = document.getElementById("resumenTurno");

fechaReserva.addEventListener("change", () => {

    const fechaElegida = new Date(fechaReserva.value + "T00:00:00");
    const hoyComparacion = new Date();
    hoyComparacion.setHours(0,0,0,0);
    if (fechaElegida < hoyComparacion){
        alert("No podés reservar una fecha pasada");
        fechaReserva.value = "";
        return;
    }
    if(fechaElegida.getDay() === 0){
        alert("Los domingos la barbería está cerrada");
        fechaReserva.value = "";
        return;
    }
    pasoHorarios.classList.add("visible");

    generarHorariosReserva(duracionReserva);

})
opcionesServicio.forEach((boton) => {

    boton.addEventListener("click", () => {

        const servicio = boton.dataset.servicio;
        const precio = boton.dataset.precio;
        const duracion = boton.dataset.duracion;

        servicioReserva = servicio;
        precioReserva = Number(precio);
        duracionReserva = Number(duracion);

        elegirServicio.style.display = "none"

        pasoFecha.classList.add("visible");

        console.log(servicio);
        console.log(precio);
        console.log(duracion);
    });
});
function generarHorariosReserva(duracion){

    horariosReserva.innerHTML = "";

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

    while (horaActual + duracion <= horaCierre){
        
        const horas = Math.floor(horaActual / 60);
        const minutos = horaActual % 60;
        const horaTexto =
        `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
        const botonHora = document.createElement("button");
        botonHora.type = "button";
        botonHora.textContent = horaTexto;
        botonHora.classList.add("boton-horario");
        
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
    const { error } = await supabaseCliente
    .from("turnos")
    .insert({
        nombre: nombre,
        telefono: telefono,
        servicio: servicioReserva,
        precio: precioReserva,
        fecha: fecha,
        horario: horariosSeleccionado,
        duracion: duracionReserva,
        estado: "confirmado"
    });
    if (error){
        console.error("Error al guardar el turno:", error);
        alert("Hubo un error al reservar el turno");
        return;
    }
    console.log("----TURNO----");
    console.log("Cliente:", nombre);
    console.log("Teléfono:", telefono);
    console.log("Servicio:", servicioReserva);
    console.log("Precio:", precioReserva);
    console.log("Fecha:", fecha);
    console.log("Horario", horariosSeleccionado)

    resumenTurno.innerHTML = `
    <h2>✅ Turno confirmado</h2>
    <p> ${servicioReserva}</p>
    <p>Fecha: ${fecha}</p>
    <p>Horario: ${horariosSeleccionado}</p>
    <p>Nombre: ${nombre}</p>
    <p>Telefono: ${telefono}</p>
    <strong>
    Total: $ ${precioReserva.toLocaleString("es-AR")}
    </strong>
    `;
    resumenTurno.classList.add("visible");
    console.log("mostrando confirmacion")
});