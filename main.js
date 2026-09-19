//INDEX
const trabajos = [
    {
        tipo: "imagen",
        src: "img/corte1.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/corte5.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/corte3.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/video1.mp4"
    }
];
const contenedorTrabajo = document.getElementById("contenedorTrabajos");
trabajos.forEach((trabajo) => {
    const imagen = document.createElement("img");
    imagen.src = trabajo.src;
    imagen.alt = "Trabajo realizado en JM Barbería";
    imagen.classList.add("imagen-trabajo");

    contenedorTrabajo.appendChild(imagen);
});
const botonSiguiente = document.getElementById("siguiente");
const botonAnterior = document.getElementById("anterior");
botonSiguiente.addEventListener("click", () => {
    const imagen = document.querySelector(".imagen-trabajo");
    const distancia = imagen.offsetWidth + 20;
    contenedorTrabajo.scrollBy({
        left: distancia,
        behavior: "smooth"
    });
});
botonAnterior.addEventListener("click", () => {
    const imagen = document.querySelector(".imagen-trabajo");
    const distancia = imagen.offsetWidth + 20;    
    contenedorTrabajo.scrollBy({
        left: -distancia,
        behavior: "smooth"
    });
});
const horariosDisponibles = document.getElementById("horariosDisponibles");
let duracionSeleccionada = 0;
const botonesServicio = document.querySelectorAll(".boton-servicio");
botonesServicio.forEach((boton) => {
    boton.addEventListener("click", () => {
            window.location.href = "turnos.html"
        document.getElementById("turnos").scrollIntoView({
            behavior:"smooth"
        })
        const servicio = boton.dataset.servicio;
        const precio = boton.dataset.precio;
        const duracion = boton.dataset.duracion;
        duracionSeleccionada = Number(duracion);
        const textoServicio = document.getElementById("servicioSeleccionado");
        textoServicio.textContent = `${servicio} - $${precio}`;


        console.log(servicio);
console.log(precio);
console.log(duracion);
    });
});

const fechaTurno = document.getElementById("fechaTurno");
if (fechaTurno){

    fechaTurno.addEventListener("change", () => {

        console.log(fechaTurno.value);
        generarHorarios(duracionSeleccionada);
    })
}

function generarHorarios(duracion){

    horariosDisponibles.innerHTML = "";
    let horaActual = 9 * 60;
    const horaCierre = 20 * 60;

    while (horaActual + duracion <= horaCierre){
        const horaTexto = convertirAHora(horaActual);
        const botonHora = document.createElement("button");

        botonHora.textContent = horaTexto;
        botonHora.classList.add("boton-horario");

        horariosDisponibles.appendChild(botonHora);

        horaActual = horaActual + duracion;
    }
}

function convertirAHora(minutosTotales){
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales % 60;

    return `${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}`;
}
//TERMINA INDEX

