interface IncidenciaProps {
    //en la interface se definen las propiedades que va a recibir el componente, en este caso maquina y descripcion
  maquina: string
  descripcion: string
  
}

function Incidencia({ maquina, descripcion }: IncidenciaProps) {
  return (
    <div className="incidencia">
      <h3>Maquina: {maquina}</h3>
      <p>Descripcion: {descripcion}</p>
    </div>
  )
}

export default Incidencia