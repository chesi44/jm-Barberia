//INDEX
const trabajos = [
    {
        tipo: "video",
        src: "img/video2.mp4",
        poster: "img/portada-video2.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/corte5.jpeg",
        poster: "img/portada-corte5.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/corte3.jpeg",
        poster: "img/portada-corte3.jpeg"
    },
    {
        tipo: "video",
        src: "img/video6.MOV",
        poster: "img/portada-video6.jpeg"
    },
    {
        tipo: "imagen",
        src: "img/IMG_2114.jpeg",
        poster: "img/portada-IMG_2114.jpeg"
    },
    {
        tipo: "video",
        src: "img/video4.mov",
        poster: "img/portada-video4.jpeg"
    },
    {
        tipo: "video",
        src: "img/video3.mp4",
        poster: "img/portada-video3.jpeg"
    },
];
const contenedorTrabajo = document.getElementById("contenedorTrabajos");
trabajos.forEach((trabajo) => { 
    if (trabajo.tipo === "imagen"){
    const imagen = document.createElement("img");

    imagen.src = trabajo.src;
    imagen.alt = "Trabajo realizado en JM Barbería";
    imagen.classList.add("imagen-trabajo");

    contenedorTrabajo.appendChild(imagen);
} else if (trabajo.tipo === "video"){
    const video = document.createElement("video");
    video.src = trabajo.src;
    video.poster = trabajo.poster;
    video.controls = true;
    video.classList.add("imagen-trabajo");

    contenedorTrabajo.appendChild(video);
}
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

