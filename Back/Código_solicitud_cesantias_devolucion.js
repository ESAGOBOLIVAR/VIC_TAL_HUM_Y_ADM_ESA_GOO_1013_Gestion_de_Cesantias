/**
* Funcion para obtener respuesta del formulario de google devolución solicitud de cesantías
*/ 

const obtenerRespuestasFormularioDevolucion = (e) => {

  let parametro = parametros(); // Se obtienen parámetros de la función
  let respuestaEnviada = e.response; // Se obtienen las respuestas del formulario
  let respuestas = respuestaEnviada.getItemResponses(); // Se obtienen item de las respuestas en array
  let datosTitu = []; // Se define array que contendrá matriz para insertar titulos en la base 
  let datosForm = []; // Se define array que contendrá matriz para insertar datos en la base
  let datosHoja = []; // Se define array que contendrá matriz para insertar datos en la base 

  respuestas.map((val,i,arr) => { // Se iteran items del google form      
      
    let tituloItem = val.getItem().getTitle(); // Se obtiene el titulo del item
    let respuestaItem = val.getResponse().toString(); // Se obtiene la respuesta del item   

    datosTitu.push(tituloItem); // Se inserta titulo en la matriz    
    datosForm.push(respuestaItem); // Se inserta respuesta a la matriz

  }); // Fin se iteran items del google form
  
  let aclaracionSoliDevue = datosForm[1].toString(); // Se obtiene aclaración de la solitud devuelta
  let idSolicitudDevuelta = datosForm[2].toString(); // Se obtiene id de la solitud devuelta

  // Se obtiene objeto de datos de la base métrica

  let abrirHojaSolicitudes = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let obtenerHojaSolicitudes = abrirHojaSolicitudes.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de cálculo
  let baseSolicitudes = _read(obtenerHojaSolicitudes); // Se obtiene objeto de datos de la base solicitudes

  // Se busca id de la solicitud devuelta en la base de las solicitudes

  let buscarIdSolicitud = baseSolicitudes.find(registro => registro["Numero_solicitud"].trim() === idSolicitudDevuelta.trim()); // Se busca el id de la solicitud
  let indexRegistro; // Variable para almacenar la posición del registro encontrado en la base de solicitudes

  if (buscarIdSolicitud) { // Si se encuentra el id de la solicitud    
    
    let urlCarpetaAdjuntos = buscarIdSolicitud["Documentacion_adjunta"]; // Se obtiene url de la carpeta con los documentos adjuntos

    // Se crea array para envíar a la hoja de solicitudes 
      
    datosHoja.push(
      buscarIdSolicitud["Numero_solicitud"],
      buscarIdSolicitud["Id_pipol"],
      buscarIdSolicitud["Contrato_saghi"],
      buscarIdSolicitud["Tipo_identificacion"],
      buscarIdSolicitud["Número_de_identificacion"],
      buscarIdSolicitud["Nombres_y_apellidos"],
      buscarIdSolicitud["Tipo_de_nómina"],
      buscarIdSolicitud["Correo_corporativo"],
      buscarIdSolicitud["Compañia"],
      buscarIdSolicitud["Tipo_solicitud"],
      "Respuesta devolución", // -> Se cambia solicitud a estado: Respuesta devolución
      buscarIdSolicitud["Fondo_de_cesantias"],
      buscarIdSolicitud["Motivo_de_retiro_de_cesantias"],
      buscarIdSolicitud["Monto_a_solicitar"],
      buscarIdSolicitud["Forma_de_pago_de_las_cesantias"],
      buscarIdSolicitud["Calendario"],
      buscarIdSolicitud["Orden_de_pago"],
      buscarIdSolicitud["Fecha_solicitud"],
      buscarIdSolicitud["Fecha_devuelto"],
      buscarIdSolicitud["Fecha_rechazo"],
      buscarIdSolicitud["Fecha_cierre"],
      buscarIdSolicitud["Fecha_gestionado"],
      buscarIdSolicitud["Observaciones"],
      buscarIdSolicitud["Motivo_devolución"],
      buscarIdSolicitud["Motivo_rechazo"],
      aclaracionSoliDevue,
      urlCarpetaAdjuntos,
      buscarIdSolicitud["Carpeta_de_soporte"],       
    );

    indexRegistro = buscarIdSolicitud["row"]; // Se obtiene el index del registro en la base de solicitudes

    // Se envía array de datos a la hoja -> Datos solicitudes
  
    let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
    let hojaDatos = libroDatos.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de solicitudes 
    hojaDatos.getRange(Number(indexRegistro),1,1,datosHoja.length).setValues([datosHoja]); // Se inserta matriz en la base de datos
    
    let idCarpetaSolicitud = urlCarpetaAdjuntos.replace(/^.+\//, ''); // Se obtiene id de la carpeta de la solicitud

    let obtenerCarpetaAdjuntosSolicitud = DriveApp.getFolderById(idCarpetaSolicitud); // Se obtiene la carpeta de drive -> Adjuntos solicitud
    
    respuestas.map((val,i,arr) => { // Se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud    
      let respuestaItem = val.getResponse(); // Se obtiene la respuesta del item

      switch (val.getItem().getType()) {          
        case (FormApp.ItemType.FILE_UPLOAD): // Si el item es tipo cargar archivo -> Caso 1       

        respuestaItem.map((archivo) => { // Se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud
        
          let archivoDrive = DriveApp.getFileById(archivo); // Se obtiene el archivo cargado en el formulario
          archivoDrive.makeCopy(archivoDrive.getName(), obtenerCarpetaAdjuntosSolicitud); // Se crea una copia del archivo cargado, en la carpeta -> obtenerCarpetaAdjuntosSolicitud

        }); // Fin se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud      

        default:
      }

    }); // Fin se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud

  } // Fin si se encuentra el id de la solicitud    
  
}

/**
* Función para validar que solicitudes de retiro de cesantás ya sobrepasaron el tiempo parámetrizado en sheet
*/ 

const validarTiempoDevolucion = () => {

  let parametro = parametros(); // Se obtienen parámetros de la función

  // Se obtiene objeto de datos de la base métrica

  let abrirHojaSolicitudes = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let obtenerHojaSolicitudes = abrirHojaSolicitudes.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de cálculo
  let obtenerHojaParametros = abrirHojaSolicitudes.getSheetByName(parametro.hojaParametros); // Se obtiene hoja de cálculo parámetros
  let baseSolicitudes = _read(obtenerHojaSolicitudes); // Se obtiene objeto de datos de la hoja Datos solicitudes de la base de solicitudes
  let datosParametros = _read(obtenerHojaParametros); // Se obtiene objeto de datos de la hoja Parametros de la base de solicitudes
  let datosHoja = []; // Se define array que contendrá matriz para insertar datos en la base 
  let tiempoRespuestaDevolucion = Number(datosParametros[0]["Tiempo Respuesta Devolución"]); // Se obtiene el tiempo de respuesta para las devoluciones   
  let formatos = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD", "DD/MM/YYYY hh:mm:ss", "DD/MM/YYYY hh:mm:ss A", "MM/DD/YYYY hh:mm:ss A", "YYYY/MM/DD hh:mm:ss A"];  // Formatos para fechas
  let fechaHoy = Utilities.formatDate(new Date(), "America/Bogota", "dd/MM/yyyy"); // Se obtiene fecha actual en formato dd/mm/yyyy
  
  baseSolicitudes.map((value,key,array) => { // Se itera objeto baseSolicitudes
    
    let keyDatos = Number(value["row"]); // Se obtiene valor de posición actual del registro en la base
    let estado = value["Estado"]; // Se obtiene valor de estado

    if (estado === "Devuelto" && validarFecha(value["Fecha_devuelto"]) === true) { // Si estado es igual a devuelto  y fecha devuelto tiene formato dd/mm/yyyy    
      
      let fechaActual = convertirFecha(fechaHoy, formatos); // Se obtiene fecha actual
      let fechaDevolucion = convertirFecha(value["Fecha_devuelto"], formatos); // Se obtiene fecha de la devolución
      let tiempoDevolucion = Number(calcularDiasEntreFechas(fechaActual, fechaDevolucion)); // Se calcula tiempo devolución     

      if (tiempoDevolucion > tiempoRespuestaDevolucion) { // Si el tiempo devolución en la base es mayor al iempo de respuesta de la devolucion
       
        // Se crea array para envíar a la hoja de solicitudes 
        
        datosHoja.push(
          value["Numero_solicitud"],
          value["Id_pipol"],
          value["Contrato_saghi"],
          value["Tipo_identificacion"],
          value["Número_de_identificacion"],
          value["Nombres_y_apellidos"],
          value["Tipo_de_nómina"],
          value["Correo_corporativo"],
          value["Compañia"],
          value["Tipo_solicitud"],
          "Cerrado",
          value["Fondo_de_cesantias"],
          value["Motivo_de_retiro_de_cesantias"],
          value["Monto_a_solicitar"],
          value["Forma_de_pago_de_las_cesantias"],
          value["Calendario"],
          value["Orden_de_pago"],
          value["Fecha_solicitud"],
          value["Fecha_devuelto"],
          value["Fecha_rechazo"],
          fechaHoy,
          value["Fecha_gestionado"],
          value["Observaciones"],
          value["Motivo_devolución"],
          value["Motivo_rechazo"],
          value["Respuesta_Devolución"],
          value["Documentacion_adjunta"],
          value["Carpeta_de_soporte"]       
        );        

        // Se envía array de datos a la hoja -> Datos solicitudes  
        
        obtenerHojaSolicitudes.getRange(keyDatos,1,1,datosHoja.length).setValues([datosHoja]); // Se inserta matriz en la base de datos
        datosHoja = []; // Se limpia array de datos

        enviarCorreoCerrado(value); // Se llama funciòn para envìar correo electrònico para solicitud estado cerrado

      } // Fin si el tiempo devolución en la base es mayor al iempo de respuesta de la devolucion

    } // Fin si estado es igual a devuelto  y fecha devuelto tiene formato dd/mm/yyyy 
       
  }); // Fin se itera objeto baseSolicitudes
  
}

/** 
* Función envíar email para solicitud -> Cerrado
*/

const enviarCorreoCerrado = (objetoBase)=> {
  
  let parametro = parametros(); // Se obtienen parámetros de la función
  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let idSolicitud = objetoBase["Numero_solicitud"]; // Se obtiene id de la solicitud
  let nombresApellidos = objetoBase["Nombres_y_apellidos"]; // Se obtiene nombres y apellidos de la solicitud
  let correoElectronico = objetoBase["Correo_corporativo"]; // Se obtiene correo corporativo

  let hojaCuerposCorreos = libroDatos.getSheetByName(parametro.hojaCuerpoCorreo); // Se obtiene hoja de cuerpos correos

  let asuntoCerrado = hojaCuerposCorreos.getRange(14,1).getDisplayValue(); // Se obtiene asunto para el email
      asuntoCerrado = asuntoCerrado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let tituloCerrado = hojaCuerposCorreos.getRange(14,2).getDisplayValue(); // Se obtiene titulo para el email
      tituloCerrado = tituloCerrado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto 
    
  let textoCerrado = hojaCuerposCorreos.getRange(14,3).getDisplayValue(); // Se obtiene texto para el email
      textoCerrado = textoCerrado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto  
      textoCerrado = textoCerrado.replace('<"#NOMBRE">', nombresApellidos); // Se reemplaza etiqueta de nombre en texto 
      
  let cuerpoEmail = obtenerCuerpoEmail(tituloCerrado,textoCerrado); // Se obtiene cuerpo para email 
  enviarCorreoElectronico(correoElectronico,asuntoCerrado,cuerpoEmail); // Se llama a función para realizar envío de correo electrónico

}

/**
* Funcion para crear el trigger para enviar el formulario (ejecutar una sola vez)  
*/ 

const crearTriggerTiempoDvolucion = () => {
  ScriptApp.newTrigger("validarTiempoDevolucion")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
}