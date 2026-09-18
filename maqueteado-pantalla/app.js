console.log("app.js cargado ✅");


const form = document.querySelector("#form-incidencia");



const NOMBRES_TURNO = {
    mañana: "Mañana",
    tarde: "Tarde",
    noche: "Noche"
};


function leerFormulario() {

    const incidencia = {
        codigoMaquina: document.querySelector("#codigo-maquina").value,
        descripcion: document.querySelector("#descripcion").value,
        turno: document.querySelector("#turno").value
    };

    return incidencia;
}


function renderizarPreview(incidencia) {

    const preview = document.querySelector("#preview-incidencia");

    const turnoLegible =
        NOMBRES_TURNO[incidencia.turno] ?? incidencia.turno;

    preview.textContent =
        "Incidencia registrada: " +
        incidencia.codigoMaquina +
        " · Turno " +
        turnoLegible +
        "\n" +
        incidencia.descripcion;

    preview.hidden = false;
}


form.addEventListener("submit", (event) => {

    event.preventDefault();

    const incidencia = leerFormulario();

    console.table(incidencia);

    renderizarPreview(incidencia);

    form.reset();

});


const descripcion = document.querySelector("#descripcion");
const contador = document.querySelector("#contador");

descripcion.addEventListener("input", () => {

    contador.textContent =
        descripcion.value.length + "/300";

});

