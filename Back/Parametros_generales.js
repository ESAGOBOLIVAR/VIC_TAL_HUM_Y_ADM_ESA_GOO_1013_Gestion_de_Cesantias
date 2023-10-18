/**
* Funcion para obtener parametros generales
*/ 

const parametros = () => {

  return { 

    idFormularioSolicitud: "1bOv77BATNv-JA5ZMTccWqwB0qOprX0vqtefGXorHK44", // Id de formulario de google solitudes retiros de cesantías
    idFormularioDevolucion: "1kTirR6wzQ0temn8tThfrBgKpQ302KYzqPm53ebPzqIo", // Id de formulario de devolución solitud retiros de cesantías
    idHojaSolicitudes: "1STr4oRyjVsiG7EIZQhKGjYjCz-8poJkrPgeU0VeopeM", // Id hoja solicitudes de base solicitudes retiros de cesantias
    idHojaMetrica: "16dY9vUCXD43lZ_axsIfq7kft2fUYsZxDuAkIKwJcFGw", // Id de base métrica
    hojaSolicitudes: "Datos solicitudes", // Hoja datos solicitudes de base solicitudes
    hojaCuerpoCorreo: "Cuerpos correos", // Hoja cuerpos correos de base solicitudes
    hojaParametros: "Parametros", // Hoja parámetros de base solicitudes
    hojaMetricaQ2: "Metrica Q2", // Hoja métrica q2 de base metrica
    idCarpetaSolicitudes: "14EgCZr58i5zbrnh0f5jk5cguzhr4IThI" // Se obtiene id de carpeta de drive pára almacenar solicitudes de cesantías

  }

}

/**
* Nota: 
* Se deben ejecutar las siguientes funciones de forma manual, una sola vez: 
* 1). crearTriggersFormularios() -> Para crear trigger al enviarse los formularios de google
* 2). crearTriggerTiempoDvolucion() -> Para crear trigger que valida solicitudes en devolución y que ya cumplieron el tiempo limite de espera y se deben cerrar.
*/ 