/**
* Funcion para obtener respuesta del formulario de google solicitud de cesantías
*/ 

const obtenerRespuestasFormularioSolicitud = (e) => {
  
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

  // Se obtienen respuestas de las preguntas del formulario de google

  let fechaHoraActual = obtenerFechaHora(); // Se obtiene fecha y hora actual
  let numeroSolicitud = obtenerConsecutivo("Datos solicitudes"); // Se obtiene consecutivo    
  let tipoSolicitud = obtenerDatoPregunta(datosTitu, datosForm, 'TIPO DE SOLICITUD');  // Se obtiene tipo de solicitud
  let fondoPensionesCesantias = obtenerDatoPregunta(datosTitu, datosForm, 'FONDO DE PENSIONES Y CESANTIAS');  // Se obtiene fondo de pensiones y cesantías
  let formaPagoCesantias = obtenerDatoPregunta(datosTitu, datosForm, 'FORMA DE PAGO DE LAS CESANTIAS');  // Se obtiene forma de pago de las cesantías
  let tipoDocumento = obtenerDatoPregunta(datosTitu, datosForm, 'TIPO DE DOCUMENTO');  // Se obtiene tipo de documento
  let numeroIdentificacion = obtenerDatoPregunta(datosTitu, datosForm, 'NÚMERO DE IDENTIFICACIÓN');  // Se obtiene número de identificación
  let nombresApellidos = obtenerDatoPregunta(datosTitu, datosForm, 'NOMBRES Y APELLIDOS');  // Se obtiene nombres y apellidos
  let correoElectronico = obtenerDatoPregunta(datosTitu, datosForm, 'CORREO ELECTRÓNICO CORPORATIVO');  // Se obtiene correo electrónico corporativo
  let montoSolicitado = obtenerDatoPregunta(datosTitu, datosForm, 'MONTO A SOLICITAR');  // Se obtiene monto a solicitar
  let motivoRetiroCesantias = obtenerDatoPregunta(datosTitu, datosForm, 'MOTIVO DE RETIRO DE CESANTIAS');  // Se obtiene motivo de retiro de cesantías
  let observaciones = obtenerDatoPregunta(datosTitu, datosForm, 'Observaciones');  // Se obtiene motivo de retiro de cesantías

  // Se obtiene objeto de datos de la base métrica

  let abrirHojaMetrica = SpreadsheetApp.openById(parametro.idHojaMetrica); // Se abre libro de métrica por id
  let obtenerHojaMetrica = abrirHojaMetrica.getSheetByName(parametro.hojaMetricaQ2); // Se obtiene hoja de cálculo
  let baseMetrica = _read(obtenerHojaMetrica); // Se obtiene objeto de datos de la base métrica

  // Se busca cédula de identificación ingresada en el formulario en la base de la métrica

  let idPipol; // Variable para almacenar id de pipol
  let contratoSaghi; // Variable para almacenar contrato saghi
  let tipoNomina; // Variable para almacenar tipo de nómina
  let compania; // Variable para almacenar compañia

  let buscarIdentificacion = baseMetrica.find(registro => registro["ID"].trim() === numeroIdentificacion.trim()); // Se busca la cédula
      
  if (buscarIdentificacion) { // Si se encuentra la cédula    

    idPipol = buscarIdentificacion["ID PIPOL / NUMERO_CONTRATO"]; // Se obtiene id de pipol
    contratoSaghi =  buscarIdentificacion["CONTRATO SAGHI"]; // Se obtiene contrato saghi
    tipoNomina = buscarIdentificacion["DESC_TIPO_NOMINA"]; // Se obtiene tipo de nómina
    compania = buscarIdentificacion["COMPAÑÍA"]; // Se obtiene compañia

  } // Fin si se encuentra la cédula

  else { // Si no se encuentra la cédula 
     
    idPipol = ""; // Se asigna valor vacío a id de pipol
    contratoSaghi =  ""; // Se asigna valor vacío a contrato saghi
    tipoNomina = ""; // Se asigna valor vacío a tipo de nómina
    compania = ""; // Se asigna valor vacío a compañia

  } // Fin si no se encuentra la cédula      

  // Se crea carpeta de solicitud cesantias para cliente con el nombre: cédula 
  
  let obtenerCarpetaSolicitudes = DriveApp.getFolderById(parametro.idCarpetaSolicitudes); // Se obtiene la carpeta de drive para crear carpeta por solicitud
  let nombreCarpetaSolicitud =  `${numeroIdentificacion}`; // Se obtiene el nombre de la subcarpeta que irá dentro de la carpeta obtenerCarpetaSolicitudes  
  let buscarCarpetasSolicitudes = obtenerCarpetaSolicitudes.getFoldersByName(nombreCarpetaSolicitud); // Se busca carpeta por nombreCarpetaSolicitud
  let idCarpetaSolicitudCesantias = obtenerIdCarpetaCreadaDrive(buscarCarpetasSolicitudes, nombreCarpetaSolicitud, obtenerCarpetaSolicitudes); // Se obtiene id carpeta de la solicitud  

  // Se crea carpeta con el nombre: Id de solicitud dentro de la carpeta -> nombreCarpetaSolicitud
  
  let obtenerCarpetaIdSolicitud = DriveApp.getFolderById(idCarpetaSolicitudCesantias); // Se obtiene la carpeta de drive para crear carpeta por solicitud
  let nombreCarpetaIdSolicitud = `Solicitud # ${numeroSolicitud}`; // Se obtiene el nombre de la subcarpeta que irá dentro de la carpeta obtenerCarpetaSolicitudes  
  let buscarCarpetasIdSolicitud = obtenerCarpetaIdSolicitud.getFoldersByName(nombreCarpetaIdSolicitud); // Se busca carpeta por nombreCarpetaIdSolicitud
  let idCarpetaSolicitudIdCesantias = obtenerIdCarpetaCreadaDrive(buscarCarpetasIdSolicitud, nombreCarpetaIdSolicitud, obtenerCarpetaIdSolicitud); // Se obtiene id carpeta de la solicitud

  // Se crea carpeta con el nombre Adjuntos solicitud dentro de la carpeta -> nombreCarpetaSolicitud

  let obtenerSubcarpetaSolicitud = DriveApp.getFolderById(idCarpetaSolicitudIdCesantias); // Se obtiene la carpeta de drive para crear carpeta adjuntos solicitud
  let nombreAdjuntosSolicitud = "Adjuntos solicitud"; // Se declara nombre para subcarpeta que irá dentro de la carpeta nombreCarpetaSolicitud
  let buscarSubcarpetasSolicitudes = obtenerSubcarpetaSolicitud.getFoldersByName(nombreAdjuntosSolicitud); // Se busca carpeta por nombreAdjuntosSolicitud
  let idSubcarpetaSolicitudCesantias = obtenerIdCarpetaCreadaDrive(buscarSubcarpetasSolicitudes, nombreAdjuntosSolicitud, obtenerSubcarpetaSolicitud); // Se obtiene id de carpeta solicitud
  let obtenerCarpetaAdjuntosSolicitud = DriveApp.getFolderById(idSubcarpetaSolicitudCesantias); // Se obtiene la carpeta de drive -> Adjuntos solicitud
  let urlCarpetaAdjuntosSolicitud = obtenerCarpetaAdjuntosSolicitud.getUrl(); // Se obtiene url de la carpeta con los archivos adjuntos de la solicitud

  // Se crea carpeta con el nombre carpeta de soporte dentro de la carpeta -> nombreCarpetaSolicitud

  let nombreCarpetaSoporte = "Carpeta de soporte"; // Se declara nombre para subcarpeta que irá dentro de la carpeta nombreCarpetaSoporte
  let buscarSubcarpetasSoporte = obtenerSubcarpetaSolicitud.getFoldersByName(nombreCarpetaSoporte); // Se busca carpeta por nombreCarpetaSoporte
  let idSubcarpetaSoporte = obtenerIdCarpetaCreadaDrive(buscarSubcarpetasSoporte, nombreCarpetaSoporte, obtenerSubcarpetaSolicitud); // Se obtiene id de carpeta solicitud
  let obtenerCarpetaSoporte = DriveApp.getFolderById(idSubcarpetaSoporte); // Se obtiene la carpeta de drive -> Carpeta de soporte
  let urlCarpetaSoporte = obtenerCarpetaSoporte.getUrl(); // Se obtiene url de la carpeta con los archivos adjuntos de la solicitud
  
  respuestas.map((val,i,arr) => { // Se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud    
    let respuestaItem = val.getResponse().toString(); // Se obtiene la respuesta del item

    switch (val.getItem().getType()) {          
      case (FormApp.ItemType.FILE_UPLOAD): // Si el item es tipo cargar archivo -> Caso 1       
          
      let archivoDrive = DriveApp.getFileById(respuestaItem); // Se obtiene el archivo cargado en el formulario
      archivoDrive.makeCopy(archivoDrive.getName(), obtenerCarpetaAdjuntosSolicitud); // Se crea una copia del archivo cargado, en la carpeta -> obtenerCarpetaAdjuntosSolicitud

      default:
    }

  }); // Fin se iteran items del google form para crear una copia de los archivos adjuntos en carpeta Adjuntos solicitud
  
  // Se crea array para envíar a la hoja de solicitudes 
      
  datosHoja.push(
    numeroSolicitud,
    idPipol,
    contratoSaghi,
    tipoDocumento,
    numeroIdentificacion,
    nombresApellidos,
    tipoNomina,
    correoElectronico,
    compania,
    tipoSolicitud,
    "Pendiente por gestionar",
    fondoPensionesCesantias,
    motivoRetiroCesantias,
    montoSolicitado,
    formaPagoCesantias,
    "",
    "",
    fechaHoraActual,
    "",
    "",
    "",
    "",
    observaciones,
    "",
    "",
    "",
    urlCarpetaAdjuntosSolicitud,
    urlCarpetaSoporte       
  );
  
  // Se envía array de datos a la hoja -> Datos solicitudes

  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let hojaDatos = libroDatos.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de solicitudes

  hojaDatos.appendRow(datosHoja); // Se inserta array en base de datos

  // Se envía correo electrónico a la persona que realizó la solicitud de retiro de cesantías
  
  let hojaCuerposCorreos = libroDatos.getSheetByName(parametro.hojaCuerpoCorreo); // Se obtiene hoja de cuerpos correos

  let asuntoTramite = hojaCuerposCorreos.getRange(3,1).getDisplayValue(); // Se obtiene asunto para el email
      asuntoTramite = asuntoTramite.replace('<"#ID">', numeroSolicitud); // Se reemplaza etiqueta de id en texto
  
  let tituloTramite = hojaCuerposCorreos.getRange(3,2).getDisplayValue(); // Se obtiene titulo para el email
      tituloTramite = tituloTramite.replace('<"#ID">', numeroSolicitud); // Se reemplaza etiqueta de id en texto
  
  let textoTramite = hojaCuerposCorreos.getRange(3,3).getDisplayValue(); // Se obtiene texto para el email
      textoTramite = textoTramite.replace('<"#ID">', numeroSolicitud); // Se reemplaza etiqueta de id en texto  
      textoTramite = textoTramite.replace('<"#NOMBRE">', nombresApellidos); // Se reemplaza etiqueta de nombre en texto

  let cuerpoEmail = obtenerCuerpoEmail(tituloTramite,textoTramite); // Se obtiene cuerpo para email 
  
  enviarCorreoElectronico(correoElectronico,asuntoTramite,cuerpoEmail); // Se llama a función para realizar envío de correo electrónico

}

/**
* Funcion para obtener respuesta del formulario de google
*/ 

const obtenerDatoPregunta = (datosTitu, datosForm, tituloPregunta) => {

  let buscarPregunta = datosTitu.findIndex(elemento => elemento === tituloPregunta);   

  if (buscarPregunta !== -1) {
    return datosForm[buscarPregunta];
  }

  else {
   return "";
  }        

}

/**
* Función para obtener el id de la carpeta buscada en drive
*/

const obtenerIdCarpetaCreadaDrive = (buscarCarpeta, nombreSubcarpeta, carpetaPrincipal, idCarpetaDrive) => {    

  if (!buscarCarpeta.hasNext()) { // Si no existe la carpeta buscada en drive se crea  

    let carpetaAnio = carpetaPrincipal.createFolder(nombreSubcarpeta); // Se crea carpeta de año
    idCarpetaDrive = carpetaAnio.getId(); // Se obtiene id de la carpeta creada

  } // Fin si no existe la carpeta buscada en drive se crea

  else { // Si existe la carpeta buscada

    while (buscarCarpeta.hasNext()) { // Se iteran los elementos encontrados

      let folder = buscarCarpeta.next();
      idCarpetaDrive = folder.getId(); // Se obtiene id de la carpeta encontrada      

    } // Fin se iteran los elementos encontrados

  }  // Fin si existe la carpeta buscada

  return idCarpetaDrive;

}

/**
* Funcion para crear el trigger para enviar el formulario (ejecutar una sola vez)  
*/ 

const crearTriggersFormularios = () => {
  
  let parametro = parametros(); // Se obtienen parámetros de la función

  let idFormularioSolicitud = parametro.idFormularioSolicitud; // Se obtiene id del formulario de google para solicitud de retiro de cesantias
  let idDevolucionSolicitud = parametro.idFormularioDevolucion; // Se obtiene id del formulario de google para devolución solicitud de retiro de cesantias

  // Se crea trigger para formulario de solicitud de retiro de cesantías

  let formularioSolicitud = FormApp.openById(idFormularioSolicitud);
  ScriptApp.newTrigger("obtenerRespuestasFormularioSolicitud")
    .forForm(formularioSolicitud)
    .onFormSubmit()
    .create()
    .getUniqueId();

  // Se crea trigger para formulario de devolución solicitud de retiro de cesantías

  let formularioDevolucion = FormApp.openById(idDevolucionSolicitud);
  ScriptApp.newTrigger("obtenerRespuestasFormularioDevolucion")
    .forForm(formularioDevolucion)
    .onFormSubmit()
    .create()
    .getUniqueId();
    
}