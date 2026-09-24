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
        <button class="btn-cancelar-turno">
        Cancelar
        </button>
        `;
        listaTurnosHoy.appendChild(turnoHTML);
        const btnCancelar = turnoHTML.querySelector(".btn-cancelar-turno");

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