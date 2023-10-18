/*
* Función que contiene las rutas de los files de enrutamiento
*/

const rutasPages = () => {  
  return {
    
    index: {
      directionPage: "Front/Index/Index",
      title: `Gestión cesantías`,
    },
    ver_solicitud: {
      directionPage: "Front/VerSolicitud/VerSolicitud",
      title: `Detalle solicitud`,
    },
    clientes: {
      directionPage: "Front/Clientes/clientes",
      title: `Clientes`,
    },    
    404: {
      directionPage: "Frontend/Assets/Helpers/404",
      title: `- Pagina no encontrada`,
    },
  }  
}

/* 
* Función doGet que realiza la devolución del html
*/

const doGet = (parameter) => {
  let parameters = parameter.parameter; 
  return Route(parameters);
}

/* 
* Función que recibe los parámetros y realiza redireccionamiento web
*/

const Route = (parameter) => {

  let archivosRutas = rutasPages(); // Se obtienen valores retornados de la función
  let modulo = (parameter.hasOwnProperty('pag')) ? parameter.pag : null;  
  
  switch (modulo) { // Se valida la opción de redireccionamiento web
  
    case 'index':  
      return Render(archivosRutas.ventas.directionPage, archivosRutas.ventas.title);

    case 'ver_solicitud':  
      return Render(archivosRutas.ver_solicitud.directionPage, archivosRutas.ver_solicitud.title);    
 
    default:
      return Render(archivosRutas.index.directionPage, archivosRutas.index.title);

  } // Fin se valida la opción de redireccionamiento web

}

/* 
* Función que recibe el archivo html y titulo a mostrar cómo página
*/

const Render = (file,tittle) => {
    
  let html = HtmlService.createTemplateFromFile(file)
    .evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag(
    "viewport",
    'width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1"'
  )
  .setTitle(tittle)
  .setFaviconUrl('https://i.ibb.co/M2g5bft/Icono-Seguros-Bolivar.png');
  
  return html;
  
}

/**
* Desencripta un texto de base64 a UTF-8(Español).
*
* @param {string} file El texto encriptado.
* @return {string} texto desencriptado.
*/
const include_ = (file) => {
  return HtmlService.createHtmlOutputFromFile(file).getContent();
}

/**
* Funcion para obtener parametros generales de la web app
*/ 

const parametrosWeb = () => {

  return { 

    idHojaSolicitudes: "1STr4oRyjVsiG7EIZQhKGjYjCz-8poJkrPgeU0VeopeM", // Id hoja solicitudes de base solicitudes retiros de cesantias    
    hojaSolicitudes: "Datos solicitudes", // Hoja datos solicitudes de base solicitudes
    hojaCuerpoCorreo: "Cuerpos correos", // Hoja cuerpos correos de base solicitudes
    idCarpetaSolicitudes: "14EgCZr58i5zbrnh0f5jk5cguzhr4IThI" // Se obtiene id de carpeta de drive pára almacenar solicitudes de cesantías

  }

}

/**
* Funcion para obtener matriz de la base de cesantias
*/ 

const consultarDatosCesantias = () => {
  
  let parametro = parametrosWeb(); // Se obtienen valores retornados de la función

  // Se obtiene objeto de datos de la base solicitudes retiros de cesantias

  let abrirHojaCesantias = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de cesantías por id
  let obtenerHojaCesantias = abrirHojaCesantias.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de cálculo
  let objetoSolicitudes = _read(obtenerHojaCesantias); // Se obtiene objeto de datos de la base métrica

  return objetoSolicitudes;

}

/** 
* Función para obtener la url del aplicativo
*/

const obtenerUrlAplicativo = (objetoDatos) => {
  
  let modulo = objetoDatos.modulo; // Se obtiene módulo a redirigir
  let urlProyecto = `${ScriptApp.getService().getUrl()}`; // Se obtiene url actual del proyecto en producción
  // let urlProyecto = `https://script.google.com/a/macros/servinformacion.com/s/AKfycbyIP93Hs2xxp7k1TD7zJEwjEc4Pux6QQzJl9gT_hIE/dev`; // Se obtiene url web

  if (modulo !== undefined) { // Si el módulo es <> indefinido
    urlProyecto = `${urlProyecto}?pag=${modulo}`; // Se obtiene url a redirigir
  }  
  else { // Si el módulo es indefinido
    urlProyecto = `${urlProyecto}`; // Se obtiene url a redirigir 
  } 
  
  objetoDatos["urlWeb"] = urlProyecto;  // Se añade nueva propiedad urlWeb a objetoDatos 

  return objetoDatos;

}

/** 
* Función para obtener objeto con datos de la solicitud actual
*/

const validarArchivosFolder = (idCarpeta) => { 
  let carpeta = DriveApp.getFolderById(idCarpeta); 
  let lista = [];
  let archivos = carpeta.getFiles();
  while (archivos.hasNext()){
    file = archivos.next();   
    lista.push(file.getId());
  }
  if (lista.length > 0) {
    return "true";  
  }
  else {
    return "false";  
  }  
}

/** 
* Función para guardar datos de la solicitud en la base
*/

const guardarDatosSolicitud = (objetoDatos) => {

  let parametro = parametros(); // Se obtienen parámetros de la función
  let objetoData = objetoDatos["dato"]; // Se obtiene objeto de datos para regresar actualizado al datatable  
  let keyDatos = objetoDatos["key"]; // Se obtiene key de la matriz en la base de datos  
  let objetoBase = objetoData[keyDatos]; // Se obtiene key de objeto seleccionada
  let esadoSolicitud = objetoBase["Estado"]; // Se obtiene estado de la solicitud actual

  // Se crea matriz de datos para enviar a la base

  let matrizDatos = [  
    objetoBase["Numero_solicitud"],
    objetoBase["Id_pipol"],
    objetoBase["Contrato_saghi"],
    objetoBase["Tipo_identificacion"],
    objetoBase["Número_de_identificacion"],
    objetoBase["Nombres_y_apellidos"],
    objetoBase["Tipo_de_nómina"],
    objetoBase["Correo_corporativo"],
    objetoBase["Compañia"],
    objetoBase["Tipo_solicitud"],
    esadoSolicitud,
    objetoBase["Fondo_de_cesantias"],
    objetoBase["Motivo_de_retiro_de_cesantias"],
    objetoBase["Monto_a_solicitar"],
    objetoBase["Forma_de_pago_de_las_cesantias"],
    objetoBase["Calendario"],
    objetoBase["Orden_de_pago"],
    objetoBase["Fecha_solicitud"],
    objetoBase["Fecha_devuelto"],
    objetoBase["Fecha_rechazo"],
    objetoBase["Fecha_cierre"],
    objetoBase["Fecha_gestionado"],
    objetoBase["Observaciones"],
    objetoBase["Motivo_devolución"],
    objetoBase["Motivo_rechazo"],
    objetoBase["Respuesta_Devolución"], 
    objetoBase["Documentacion_adjunta"],
    objetoBase["Carpeta_de_soporte"]
  ];  
  
  // Se envía array de datos a la hoja -> Datos solicitudes
  
  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let hojaDatos = libroDatos.getSheetByName(parametro.hojaSolicitudes); // Se obtiene hoja de solicitudes 
  hojaDatos.getRange(Number(keyDatos)+2,1,1,matrizDatos.length).setValues([matrizDatos]); // Se inserta matriz en la base de datos
    
  // Si el estado de la solicitud es -> Gestionado

  if (esadoSolicitud === "Gestionado") {
    enviarCorreoGestionado(objetoBase); // Se llama función para envíar email solicitud gestionada
  }

  // Si el estado de la solicitud es -> Devuelto

  if (esadoSolicitud === "Devuelto") {
    enviarCorreoDevuelto(objetoBase); // Se llama función para envíar email solicitud Devuelto
  }

  // Si el estado de la solicitud es -> Rechazado

  if (esadoSolicitud === "Rechazado") {
    enviarCorreoRechazado(objetoBase); // Se llama función para envíar email solicitud Rechazado
  }  

  return objetoDatos;

}

/** 
* Función envíar email para solicitud -> Gestionada
*/

const enviarCorreoGestionado = (objetoBase)=> {
  
  let parametro = parametros(); // Se obtienen parámetros de la función
  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let idSolicitud = objetoBase["Numero_solicitud"]; // Se obtiene id de la solicitud
  let nombresApellidos = objetoBase["Nombres_y_apellidos"]; // Se obtiene nombres y apellidos de la solicitud
  let correoElectronico = objetoBase["Correo_corporativo"]; // Se obtiene correo corporativo
  let idCarpetaSoporte = objetoBase["Carpeta_de_soporte"].replace(/^.+\//, ''); // Se obtiene id de carpeta soporte en drive 
  let tipoSolicitud = objetoBase["Tipo_solicitud"]; // Se obtiene tipo de solicitud

  let hojaCuerposCorreos = libroDatos.getSheetByName(parametro.hojaCuerpoCorreo); // Se obtiene hoja de cuerpos correos

  let asuntoGestionado = hojaCuerposCorreos.getRange(7,1).getDisplayValue(); // Se obtiene asunto para el email
      asuntoGestionado = asuntoGestionado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let tituloGestionado = hojaCuerposCorreos.getRange(7,2).getDisplayValue(); // Se obtiene titulo para el email
      tituloGestionado = tituloGestionado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let textoGestionado = hojaCuerposCorreos.getRange(7,3).getDisplayValue(); // Se obtiene texto para el email
      textoGestionado = textoGestionado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto  
      textoGestionado = textoGestionado.replace('<"#NOMBRE">', nombresApellidos); // Se reemplaza etiqueta de nombre en texto 

  let cuerpoEmail = obtenerCuerpoEmail(tituloGestionado,textoGestionado); // Se obtiene cuerpo para email
  
  // Se valida si el tipo de envío es -> Retiro Cesantías fondo ó Retiro Cesantías Compañia

  if (tipoSolicitud.toUpperCase().trim() === "RETIRO CESANTIAS FONDO") { // Si tipo solicitud es igual a RETIRO CESANTIAS FONDO
    let archivosDrive = obteneraArchivosDrive(idCarpetaSoporte); // Se obtienen archivos de carpeta soporte en google drive
    enviarCorreoElectronico(correoElectronico,asuntoGestionado,cuerpoEmail,archivosDrive); // Se llama a función para realizar envío de correo electrónico
  }  
  else if (tipoSolicitud.toUpperCase().trim() === "RETIRO CESANTIAS COMPAÑIA") { // Si tipo solicitud es igual a RETIRO CESANTIAS COMPAÑIA
    enviarCorreoElectronico(correoElectronico,asuntoGestionado,cuerpoEmail); // Se llama a función para realizar envío de correo electrónico 
  }

}

/**
* Función para url de prellenado del formulario de devolución de solicitudes cesantías
*/ 

const obtenerUrlPrellenadoFormularioDevolucion = (idSolicitud) => {  

  let parametro = parametros(); // Se pasan valores de función
  let idFormularioDevolucion = parametro.idFormularioDevolucion; // Se obtiene id del formulario de devolución solicitud de cesantías
  let abrirFormDevol = FormApp.openById(idFormularioDevolucion); // Se abre formulario de devolución solicitud de cesantías
  let urlFormDevoluc = abrirFormDevol.getPublishedUrl(); // Se obtiene url de formulario devolución solicitud de cesantías
  let datosDevolucion = getPreFillEntriesMap_(idFormularioDevolucion); // Se obtiene propiedades del formulario devolución solicitud de cesantías
  let itemFormularioId = datosDevolucion[1].entry; // Item id solicitud devuelta  
  let urlPrellenado = urlFormDevoluc+"?usp=pp_url&entry."+itemFormularioId+"="+idSolicitud; // Url precargada para formulario devolución solicitud de cesantías

  return urlPrellenado; 

}

/** 
* Función envíar email para solicitud -> Devuelto
*/

const enviarCorreoDevuelto = (objetoBase)=> {
  
  let parametro = parametros(); // Se obtienen parámetros de la función
  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let idSolicitud = objetoBase["Numero_solicitud"]; // Se obtiene id de la solicitud
  let nombresApellidos = objetoBase["Nombres_y_apellidos"]; // Se obtiene nombres y apellidos de la solicitud
  let correoElectronico = objetoBase["Correo_corporativo"]; // Se obtiene correo corporativo
  let motivosDevolucion = objetoBase["Motivo_devolución"].replace(/^.+\//, ''); // Se obtiene motivo de devolución  

  let hojaCuerposCorreos = libroDatos.getSheetByName(parametro.hojaCuerpoCorreo); // Se obtiene hoja de cuerpos correos

  let asuntoDevuelto = hojaCuerposCorreos.getRange(11,1).getDisplayValue(); // Se obtiene asunto para el email
      asuntoDevuelto = asuntoDevuelto.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let tituloDevuelto = hojaCuerposCorreos.getRange(11,2).getDisplayValue(); // Se obtiene titulo para el email
      tituloDevuelto = tituloDevuelto.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let urlFormulario = obtenerUrlPrellenadoFormularioDevolucion(idSolicitud); // Se obtiene url de prellenado del formulario de devolución
  let botonArchivo = `<a href=${urlFormulario} style="text-decoration: none; padding: 6px; font-weight: bold; font-size: 1.05vw; color: #016d38; background-color: #ffdd54; border-radius: 4px; border: 2px solid #2e4e66;"> Enviar soportes </a>`;
    
  let textoDevuelto = hojaCuerposCorreos.getRange(11,3).getDisplayValue(); // Se obtiene texto para el email
      textoDevuelto = textoDevuelto.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto  
      textoDevuelto = textoDevuelto.replace('<"#NOMBRE">', nombresApellidos); // Se reemplaza etiqueta de nombre en texto 
      textoDevuelto = textoDevuelto.replace('<"#MOTIVOS_DEVOLUCION">', motivosDevolucion); // Se reemplaza etiqueta de motivos devolucion en texto       
      textoDevuelto = textoDevuelto.replace('<"#BOTON_SOPORTES">', botonArchivo); // Se reemplaza etiqueta de botón -> enviar soportes en el texto 

  let cuerpoEmail = obtenerCuerpoEmail(tituloDevuelto,textoDevuelto); // Se obtiene cuerpo para email 
  enviarCorreoElectronico(correoElectronico,asuntoDevuelto,cuerpoEmail); // Se llama a función para realizar envío de correo electrónico

}

/** 
* Función envíar email para solicitud -> Rechazado
*/

const enviarCorreoRechazado = (objetoBase)=> {
  
  let parametro = parametros(); // Se obtienen parámetros de la función
  let libroDatos = SpreadsheetApp.openById(parametro.idHojaSolicitudes); // Se abre libro de solicitudes por id
  let idSolicitud = objetoBase["Numero_solicitud"]; // Se obtiene id de la solicitud
  let nombresApellidos = objetoBase["Nombres_y_apellidos"]; // Se obtiene nombres y apellidos de la solicitud
  let correoElectronico = objetoBase["Correo_corporativo"]; // Se obtiene correo corporativo
  let motivosDeRechazo = objetoBase["Motivo_rechazo"].replace(/^.+\//, ''); // Se obtiene motivo de rechazo  

  let hojaCuerposCorreos = libroDatos.getSheetByName(parametro.hojaCuerpoCorreo); // Se obtiene hoja de cuerpos correos

  let asuntoRechazado = hojaCuerposCorreos.getRange(17,1).getDisplayValue(); // Se obtiene asunto para el email
      asuntoRechazado = asuntoRechazado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
  
  let tituloRechazado = hojaCuerposCorreos.getRange(17,2).getDisplayValue(); // Se obtiene titulo para el email
      tituloRechazado = tituloRechazado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto
     
  let textoRechazado = hojaCuerposCorreos.getRange(17,3).getDisplayValue(); // Se obtiene texto para el email
      textoRechazado = textoRechazado.replace('<"#ID">', idSolicitud); // Se reemplaza etiqueta de id en texto  
      textoRechazado = textoRechazado.replace('<"#NOMBRE">', nombresApellidos); // Se reemplaza etiqueta de nombre en texto 
      textoRechazado = textoRechazado.replace('<"#MOTIVOS_RECHAZO">', motivosDeRechazo); // Se reemplaza etiqueta de motivos rechazo en texto       

  let cuerpoEmail = obtenerCuerpoEmail(tituloRechazado,textoRechazado); // Se obtiene cuerpo para email 
  enviarCorreoElectronico(correoElectronico,asuntoRechazado,cuerpoEmail); // Se llama a función para realizar envío de correo electrónico

}