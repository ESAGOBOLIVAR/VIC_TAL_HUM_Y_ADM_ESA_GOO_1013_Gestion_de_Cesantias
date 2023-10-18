/**
* Funcion para obtener fecha y hora actual en formato dd/MM/yyyy HH:mm:ss
*/ 

const obtenerFechaHora = () => {
  let fechaHoraActual = Utilities.formatDate(new Date(),"America/Bogota", "dd/MM/yyyy");
  return fechaHoraActual;
}

/*
* Función que genera un código consecutivo
*/

const obtenerConsecutivo = (nombrePropiedad) => {
  let c = PropertiesService.getScriptProperties();
  let b = LockService.getScriptLock();
  b.waitLock(30000);
  let d = "", a = "";
  if (nombrePropiedad) {
    d = (c.getProperty(nombrePropiedad) || 1000);
    a = d; c.setProperty(nombrePropiedad, String(Number(d) + 1));
  } else {
    d = c.getProperty("Consecutivo");
    a = d; c.setProperty("Consecutivo", String(Number(d) + 1));
  }
  b.releaseLock();
  return a
}

/**
* Funcion para obtener matriz de una base de datos
*/ 

const obtenerMatrizBase = (idBase, nombreHoja) => {
  
  let abrirHoja = SpreadsheetApp.openById(idBase); // Se abre libro de métrica por id
  let obtenerHoja = abrirHoja.getSheetByName(nombreHoja); // Se obtiene hoja de cálculo
  let obtenerRango = obtenerHoja.getDataRange(); // Se obtiene rango de datos
  let obtenerDatos = obtenerRango.getDisplayValues(); // Se obtiene matriz del rango de datos

  return obtenerDatos;

}

/**
* Funcion para obtener objeto de una base de datos
*/ 

const _read = (sheet, id) => {
  let data = sheet.getDataRange().getDisplayValues();
  let header = data.shift();

  // Buscar todo
  let resultado = data.map(function (row, indx) {
    let reduced = header.reduce(function (
      accumulator,
      currentValue,
      currentIndex
    ) {
      accumulator[currentValue] = row[currentIndex];
      return accumulator;
    },
    {});

    reduced.row = indx + 2;
    return reduced;
  });

  // Filtrar si se pasa un id
  if (id) {
    let datoFiltrado = resultado.filter((dato) => {
      if (dato.id === id) {
        return true;
      } else {
        return false;
      }
    });

    return datoFiltrado.shift();
  }

  return resultado;
}

/**
* Funcion para obtener saludo para envío de email
*/ 

const obtenerSaludo = () => {

  let saludo; // Variable que almacenará el saludo
  let ahora = new Date(); // Se obtiene fecha y hora actual
  let hora = ahora.getHours(); // Se obtiene hora actual
    
  // Se valida y se define el saludo de acuerdo a la hora

  if (hora >= 6 && hora < 12) {
    saludo = "Buenos días";     
  }

  else if (hora >= 12 && hora < 18) { 
    saludo = "Buenas tardes";
  }

  else if (hora >= 18 && hora <= 24 || hora < 6) { 
    saludo = "Buenas noches";
  }

  return saludo;

}

/**
* Funcion para obtener cuerpo para envío de email
*/ 

const obtenerCuerpoEmail = (titulo, cuerpo) => {

  let cuerpoCorreo = 
    '<div class="row" style="width: 100%; background-color: #ffdd54; overflow: hidden; display: table">'+
      '<div style="float: left; display: table-cell; vertical-align: middle; margin-left: 5%;">'+
        '<a><img src="https://i.ibb.co/ZXXG6L6/logo.png" class="image" alt="logo" style="width: 12vw; height: 6vw;"></a>'+
      '</div>'+
      '<div style="float: center; display: table-cell; vertical-align: middle; text-align: left; margin-left: 30%;">'+
        '<font color="#016d38" style="font-size: calc(0.8em + 0.8vw)"> <b>' + titulo + '</b> </font>'+                  
      '</div>'+                  
    '</div>'+                
    '<div style="width: 95%; margin-left: 2%;">'+ 
    '<p style="font-size:1.1vw; text-align:justify; color:#000000; margin-bottom:7px;"><br>' + cuerpo + '</p><br>'+
    '</div>';

  return cuerpoCorreo;
  
}

/** 
* Función para obtener archivos de google drive
*/

const obteneraArchivosDrive = (idCarpetaDrive) => {
  
  let carpeta = DriveApp.getFolderById(idCarpetaDrive); // Se obtiene carpeta drive -> carpeta de soporte por id
  let archivos = []; // Se declara array vacío que almacenará los archivos adjuntos
  let limiteAdjuntos = 26214400; // Limite de adjuntos en bytes -> 25mb
  let contadorAdjuntos = 0; // Contador de archivos que se van adjuntando
  let archivo = carpeta.getFiles(); // Se obtiene archivos de carpeta de drive

  while (archivo.hasNext()){ // Se itera archivos de drive
    let file = archivo.next();
    let tamanioArchivo = file.getSize(); // Se obtiene tamaño del archivo 
     
    if (contadorAdjuntos <= limiteAdjuntos) { // Si contador de adjuntos es menor ó igual a limiteAdjuntos
      archivos.push(file); // Se inserta archivo en array -> archivos
    } 
    
    contadorAdjuntos = contadorAdjuntos + tamanioArchivo; // Se suma peso actual con el siguiente a cargar
  }
  
  return archivos;

}

/** 
* Funciones para extraer propiedades de cada uno de los campos de un google form
*/

const getPreFillEntriesMap_ = (id) => {
  var form = FormApp.openById(id);
  var items = form.getItems();
  var newFormResponse = form.createResponse();
  var itms = [];
  for(var i = 0; i < items.length; i++){
    var response = getDefaultItemResponse_(items[i]);
    if(response){
      newFormResponse.withItemResponse(response);
      itms.push({
        id: items[i].getId(),
        entry: null,
        title: items[i].getTitle(),
        type: "" + items[i].getType()
      });
    }
  } 

  var ens = newFormResponse.toPrefilledUrl().split("&entry.").map(function(s){
    return s.split("=")[0];
  });
  ens.shift();

  return itms.map(function(r, i){
    r.entry = this[i];
    return r;
  }, ens);
}

const getDefaultItemResponse_ = (item) => {
  switch(item.getType()){
    case FormApp.ItemType.TEXT:
      return item.asTextItem().createResponse("1");
      break;
    case FormApp.ItemType.PARAGRAPH_TEXT:
      return item.asParagraphTextItem().createResponse("1");
      break;
    case FormApp.ItemType.MULTIPLE_CHOICE:
      return item.asMultipleChoiceItem()
        .createResponse(item.asMultipleChoiceItem().getChoices()[0].getValue());
      break;      
    default:
      return undefined; 
  } 
}

/**
* Función para validar fecha
*/ 

const validarFecha = (valorFecha) => {
  
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js').getContentText());
  let validarFecha1 = moment(valorFecha, 'DD/MM/YYYY',true).isValid();
  let validarFecha2 = moment(valorFecha, 'D/MM/YYYY',true).isValid();
  let validarFecha3 = moment(valorFecha, 'DD/M/YYYY',true).isValid();
   
  if (validarFecha1 === true || validarFecha2 === true || validarFecha3 === true) { // Si alguno de los formatos de la fecha es verdadera
    return true;
  }

}

/**
* Función para convertir fecha a otro formato
*/ 

const convertirFecha = (date, formatos) => {
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js').getContentText());
  let dateMomentObject = moment(date, formatos);
  let dateObject = dateMomentObject.toDate();
  let dateStr = moment(dateObject).format('YYYY-MM-DD');
  return dateStr;
}

/**
* Función para calcular días entre dos fechas
*/ 

const calcularDiasEntreFechas = (fechaMayor, fechaMenor) => {
  eval(UrlFetchApp.fetch('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js').getContentText());
  fechaMayor = moment(fechaMayor);
  fechaMenor = moment(fechaMenor);  
  let dias = fechaMayor.diff(fechaMenor, 'days');
  return dias;
}

/**
* Funcion para envíar correo electrónico  
*/ 

const enviarCorreoElectronico = (emailDestinatario, asuntoEmail, cuerpoEmail, archivos) => {

  GmailApp.sendEmail(
    emailDestinatario, 
    asuntoEmail, 
    '', 
    { htmlBody: cuerpoEmail, 
      noReply: true,
      attachments: archivos
    }
  );

}