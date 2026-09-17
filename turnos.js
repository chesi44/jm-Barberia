let duracionReserva = 0;
let horariosSeleccionado = "";
let servicioReserva = "";
let precioReserva = 0;

const opcionesServicio = document.querySelectorAll(".opcion-servicio");
const pasoFecha = document.getElementById("pasoFecha");
const elegirServicio = document.getElementById("elegirServicio");
const fechaReserva = document.getElementById("fechaReserva");
const pasoHorarios = document.getElementById("pasoHorarios");
const horariosReserva = document.getElementById("horariosReserva");
const pasoDatos = document.getElementById("pasoDatos");
const nombreCliente = document.getElementById("nombreCliente");
const telefonoCliente = document.getElementById("telefonoCliente");
const btnConfirmar = document.getElementById("btnConfirmar");
const resumenTurno = document.getElementById("resumenTurno");
fechaReserva.addEventListener("change", () => {

    pasoHorarios.classList.add("visible");

    generarHorariosReserva(duracionReserva);

    console.log("fecha elegida:", fechaReserva.value);
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
        
        botonHora.addEventListener("click" , () => {
            horariosSeleccionado = horaTexto;

            const botonesHorarios = document.querySelectorAll(".boton-horario");

            botonesHorarios.forEach((boton)=> {
                boton.classList.remove("seleccionado");
        });
                botonHora.classList.add("sleccionado");

                pasoDatos.classList.add("visible");

                console.log("Horario seleccionado:", horariosSeleccionado);
            
        });

        horariosReserva.appendChild(botonHora);

        horaActual = horaActual + duracion;
    }
}
btnConfirmar.addEventListener("click", () => {

    const nombre = nombreCliente.value;
    const telefono = telefonoCliente.value;
    const fecha = fechaReserva.value;

    if(nombre == "" || telefono == ""){

        alert("Completá tu nombre y teléfono");

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
    <p>✂️ ${servicioReserva}</p>
    <p>📅${fecha}</p>
    <p>🕐${horariosSeleccionado}</p>
    <p>🧑${nombre}</p>
    <p>📱${telefono}</p>
    <strong>
    Total: $${precioReserva.toLocaleString("AR")}
    </strong>
    `;
});