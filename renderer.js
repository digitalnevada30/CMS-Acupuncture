console.log(process);
const {ipcRenderer} = require('electron')
const path = require('path');
const $ = require('jquery');

const Modelo = {
  obtenerInformacion: function(archivo, tipo){
    switch (tipo) {
      case 'c':
        ipcRenderer.send('obtenerInfo-request', archivo);
        break;
      case 'g':
        ipcRenderer.send('OI-grupos-req', archivo);
        break;
      case 'p':
        ipcRenderer.send('oi-puntos-canales-req', archivo);
        break;
      case 'pp':
        console.log('Archivo: ' + archivo);
        ipcRenderer.send('oi-puntos-puntos-req', archivo);
        break;
    }
  },
  guardarCanal: function(archivo, objeto){
    let tmp = [archivo, objeto];
    ipcRenderer.send('guardar-canal', tmp);
  },
  guardarGrupo: function(archivo, objeto){
    let tmp = [archivo, objeto];
    console.log('objeto Modelo:');
    console.log(objeto);
    ipcRenderer.send('guardar-grupo-req', tmp);
  }
};

const modulos = new Vue({
  el: '#modulos',
  data:{
    claseCanales: '',
    clasePuntos: '',
    claseReportes: '',
    claseGrupos: '',
    claseRuta: '',
    rutaProyecto: ''
  },
  methods:{
    cambiar: function(tipo){
      if(this.rutaProyecto === '' && tipo !== 'ruta')return;
      this.ocultar();
      switch(tipo){
        case 'canales':
          this.claseCanales = 'active';
          $('#modCanales').css('display', 'block');
          modCanales.mostrarCanales(this.rutaProyecto);
          break;
        case 'puntos':
          this.clasePuntos = 'active';
          $('#modPuntos').css('display', 'block');
          modPuntos.mostrarCanales(this.rutaProyecto);
          break;
        case 'reportes':
          this.claseReportes = 'active';
          $('#modReportes').css('display', 'block');
          break;
        case 'grupos':
          this.claseGrupos = 'active';
          $('#modGrupos').css('display', 'block');
          modGrupos.mostrarGrupos(this.rutaProyecto);
          break;
        case 'ruta':
          this.claseRuta = 'active';
          $('#modRuta').css('display', 'block');
          //modRuta.editar(this.rutaProyecto);
          break;
      }
    },
    ocultar: function(){
      this.claseCanales  = '';
      this.clasePuntos   = '';
      this.claseReportes = '';
      this.claseGrupos = '';
      this.claseRuta = '';
      $('#modCanales').css('display', 'none');
      $('#modPuntos').css('display', 'none');
      $('#modReportes').css('display', 'none');
      $('#modGrupos').css('display', 'none');
      $('#modRuta').css('display', 'none');
    }
  },
  created: function(){
    console.log(localStorage);
    this.rutaProyecto = localStorage.getItem('ruta') || '';
    this.cambiar('ruta');
  }
});

const VerificarCadenas = {
  patron: /^[A-Z]{1}[a-zA-Z0-9]*$/,
  patronMayus: /^[A-Z]{1}[A-Z0-9]*$/,
  verificar: function(cadena){
    return this.patron.test(cadena);
  },
  verificarMayus: function(cadena){
    return this.patronMayus.test(cadena);
  }
};

var modCanales = new Vue({
  el: '#modCanales',
  data:{
    seleccionID: '',
    vista: '',
    clases: ['listaCanales', 'listaCanalesActivo'],
    baseTmp: path.sep + 'resources' + path.sep + 'app' + path.sep + 'Informacion' + path.sep + 'config.json',
    base: path.sep + 'Informacion' + path.sep + 'config.json',
    rutaConfig: '',
    infoCanales: {},
    _infoOriginal: {},
    canales: [],
    /*variables para el formulario de informacion*/
    iID: '',
    iNombre: '',
    iTitulo: '',
    iTipo: '',
    /*variables para el formulario nuevo y editar*/
    nID: '',
    nArchivo: '',
    nNombre: '',
    nTitulo: '',
    nTipo: ''
  },
  methods:{
    mostrarCanales: function(rutaBase){
      this.rutaConfig = rutaBase + this.base;
      Modelo.obtenerInformacion(this.rutaConfig, 'c');
    },
    setCanales: function(){
      let tmp = []
      this.canales = [];
      for(let element in this.infoCanales['canales']){
        tmp.push(element);
      }
      tmp.sort();
      for(let i=0 ; i < tmp.length ; i++){
        let cont = {};
        cont = this.infoCanales['canales'][tmp[i]];
        cont['id'] = tmp[i];
        this.canales.push(cont);
      }
      this.limpiar();

    },
    /*eliminar un registro*/
    eliminar: function(){
      swal('¡Cuidado!', '¿Estas seguro de eliminar el elemento?', 'warning', {
        buttons:true
      }).then((value) => {
        if(value){
          //this._infoOriginal['canales'][this.nID] = tmp;
          delete(this._infoOriginal['canales'][this.seleccionID]);
          Modelo.guardarCanal(this.rutaConfig, this._infoOriginal);
          swal('Aviso','El elemento ha sido eliminado', 'success');
        }
      })
    },
    /*funciones para editar*/
    setEditInfo: function(){
      this.nID = this.seleccionID;
      this.nArchivo = this.infoCanales['canales'][this.seleccionID]['archivo'];
      this.nNombre = this.infoCanales['canales'][this.seleccionID]['nombre'];
      this.nTitulo = this.infoCanales['canales'][this.seleccionID]['titulo'];
      this.nTipo = this.infoCanales['canales'][this.seleccionID]['tipo'];
    },
    editar: function(){
      this.limpiarFormularioNuevo();
      //llenar valores del canal
      this.setEditInfo();
      this.vista = 'e';
    },
    /*funciones para nuevo*/
    evaluarFormulario: function(){
      let resp = {
        error: ''
      };
      let pattern = /[^a-zA-Z0-9]/;
      /*evaluamos el id*/
      if(pattern.test(this.nID)){
        resp['error'] += 'ID: Solo acepta caracteres alfanuméricos\n';
      }
      if(this.nID.split(' ').length != 1){
        resp['error'] += 'ID: Solo puede tener una palabra\n';
      }
      /*Evaluamos el archivo*/
      if(this.nArchivo.split('.')[1] !== 'json'){
        resp['error'] += 'Archivo: No tiene extension .json\n';
      }
      if(pattern.test(this.nArchivo[0])){
        resp['error'] += 'Archivo: debe iniciar con alfanumérico\n';
      }
      return resp;
    },
    guardar: function(tipo){
      switch (tipo) {
        case 'n':
          if(this.nID === '' || this.nArchivo === '' || this.nNombre === '' || this.nTitulo === '' || this.nTipo === ''){
            swal('Aviso', 'Favor de llenar todos los campos', 'info');
          }else{
            let resp = this.evaluarFormulario();//object
            if(resp['error'] === ''){
              console.log(this._infoOriginal);
              let tmp = {
                archivo: this.nArchivo,
                nombre: this.nNombre,
                titulo: this.nTitulo,
                tipo: this.nTipo
              };
              this._infoOriginal['canales'][this.nID] = tmp;
              Modelo.guardarCanal(this.rutaConfig, this._infoOriginal);

            }else{
              swal('Error', resp['error'], 'error');
            }
          }
          break;
        case 'e':
          if(this.nID === '' || this.nArchivo === '' || this.nNombre === '' || this.nTitulo === '' || this.nTipo === ''){
            swal('Aviso', 'Favor de llenar todos los campos', 'info');
          }else{
            let resp = this.evaluarFormulario();
            if(resp['error'] === ''){
              console.log(this._infoOriginal);
              let tmp = {
                archivo: this.nArchivo,
                nombre: this.nNombre,
                titulo: this.nTitulo,
                tipo: this.nTipo
              };
              this._infoOriginal['canales'][this.nID] = tmp;
              Modelo.guardarCanal(this.rutaConfig, this._infoOriginal);

            }else{
              swal('Error', resp['error'], 'error');
            }
          }
          break;
      }
    },
    limpiar: function(){
      //limpiamos si hay alguna seleccion
      if(this.seleccionID !== ''){
        $('#'+this.seleccionID).addClass(this.clases[0]);
        $('#'+this.seleccionID).removeClass(this.clases[1]);
        this.seleccionID = '';

        this.vista = '';
      }
      //limpiamos Informacion
      this.iID = '';
      this.iNombre = '';
      this.iTitulo = '';
      this.iTipo =  '';
    },
    nuevo: function(){
      this.limpiarFormularioNuevo();
      this.quitarSeleccionBoton();
      this.vista = 'n';
    },
    limpiarFormularioNuevo: function(){
      this.nID = '';
      this.nArchivo = '';
      this.nNombre = '';
      this.nTitulo = '';
      this.nTipo = '';
    },
    /*Funciones generales*/
    quitarSeleccionBoton: function(){
      if(this.seleccionID !== ''){
        $('#'+this.seleccionID).toggleClass(this.clases[0]);
        $('#'+this.seleccionID).toggleClass(this.clases[1]);
        this.seleccionID = '';
      }
    },
    presionarBoton: function(id){
      if(this.seleccionID !== id && this.seleccionID !== ''){
        //nuevo elemento
        //toggle al primer elemento
        $('#'+this.seleccionID).toggleClass(this.clases[0]);
        $('#'+this.seleccionID).toggleClass(this.clases[1]);
        //toggle al segundo
        $('#'+id).toggleClass(this.clases[0]);
        $('#'+id).toggleClass(this.clases[1]);
      }else{
        $('#'+id).toggleClass(this.clases[0]);
        $('#'+id).toggleClass(this.clases[1]);
      }
      this.seleccionID = id;
    },
    mostrarInformacion: function(id){
      console.log(id + ' has been clicked');
      this.presionarBoton(id);

      //establecemos informacion
      console.log(this.infoCanales['canales'][id]['archivo']);
      this.setFormInformacion();
      //mostrar formulario de informacion
      this.vista = 'i';
    },
    mostrarTipo: function(){
      switch (this.iTipo) {
        case 'o':
          return('Órgano');
          break;
        case 'v':
          return('Víscera');
          break;
      }
    },
    setFormInformacion: function(){
      this.iID = this.seleccionID;
      this.iNombre = this.infoCanales['canales'][this.seleccionID]['nombre'];
      this.iTitulo = this.infoCanales['canales'][this.seleccionID]['titulo'];
      this.iTipo = this.infoCanales['canales'][this.seleccionID]['tipo'];
    },
    verBtnFormulario: function(){
      if(this.vista === 'e' || this.vista === 'i'){
        return true;
      }else{
        return false;
      }
    },
    verFormulario: function(letra){
      if(this.vista === letra){
        return true;
      }else{
        return false;
      }
    }
  }
});

var modPuntos = new Vue({
  el: '#modPuntos',
  data:{
    canalSeleccionado: '-',
    puntoSeleccionado: '',
    idSeleccionado: '',
    tipo: '',
    tipoNuevo: '-',
    indice: -1,
    clases: ['listaCanales', 'listaCanalesActivo'],
    base: path.sep + 'Informacion' + path.sep,
    rutaConfig: '',
    infoCanales:{},
    infoPuntos:{},
    __infoPuntosOriginal: {},
    listaPuntos: [],
    listaElemento:[],
    listaAfuera: [],
    canales: [],
    importancia: '',
    observaciones: '',
    indicaciones: '',
    funcion: '',
    posicion: 0,
    localizacion:'',
    nombre: '',
    clave: '',
    elemento: ''
  },
  methods:{
    mostrarCanales: function(rutaBase){
      this.rutaConfig = rutaBase + this.base;
      Modelo.obtenerInformacion(this.rutaConfig + 'config.json', 'p');
    },
    setCanales: function(){
      let tmp = []
      this.canales = [];
      for(let element in this.infoCanales){
        tmp.push(element);
      }
      tmp.sort();
      for(let i=0 ; i < tmp.length ; i++){
        let cont = {};
        cont = this.infoCanales[tmp[i]];
        cont['id'] = tmp[i];
        this.canales.push(cont);
      }
      console.log(this.canales);
      /*this.limpiar();*/
    },
    cambiarCanal: function(){
      switch (this.canalSeleccionado) {
        case '-':
          console.log('borrar todo');
          this.limpiarPuntos();
          break;
        default:
          console.log('colocar informacion');
          Modelo.obtenerInformacion(this.rutaConfig + this.canalSeleccionado, 'pp')
          break;

      }
    },
    ocultar: function(id){
      $('#'+id).toggleClass('ocultarPuntos');
    },
    limpiarPuntos: function(){
      this.listaPuntos = [];
      this.listaElemento = [];
      this.listaAfuera = [];
      //limpiar seleccion de canal
      this.idSeleccionado = '';
      this.tipo = '';
      this.indice = -1;
    },
    limpiarCampos: function(){
      this.importancia = '';
      this.observaciones = '';
      this.indicaciones = '';
      this.funcion = '';
      this.posicion = 0;
      this.localizacion = '';
      this.nombre = '';
      this.clave = '';
      this.elemento = '';
    },
    presionarBoton: function(identificador, tipo, indice){
      $('#divNuevo').addClass('ocultarFormularios');
      $('#divEditar').removeClass('ocultarFormularios');
      if(this.tipo.length > 1){
        let tipoTMP = this.tipo;
        tipoTMP = tipoTMP.split('-')[1];
        if( (this.idSeleccionado+tipoTMP)!==(identificador+tipo) ){
          //cambiar anterior boton
          $('#'+this.idSeleccionado + tipoTMP).toggleClass(this.clases[0]);
          $('#'+this.idSeleccionado + tipoTMP).toggleClass(this.clases[1]);
          //cambiar boton nuevo
          $('#'+identificador + tipo).toggleClass(this.clases[0]);
          $('#'+identificador + tipo).toggleClass(this.clases[1]);
        }else{
          return;
        }
      }else if(this.idSeleccionado !== '' && (this.idSeleccionado+this.tipo) !== (identificador+tipo)){
        //cambiar anterior boton
        $('#'+this.idSeleccionado + this.tipo).toggleClass(this.clases[0]);
        $('#'+this.idSeleccionado + this.tipo).toggleClass(this.clases[1]);
        //cambiar boton nuevo
        $('#'+identificador + tipo).toggleClass(this.clases[0]);
        $('#'+identificador + tipo).toggleClass(this.clases[1]);
      }else if((this.idSeleccionado+this.tipo) === (identificador+tipo)){
        return;
      }else{
        $('#'+identificador + tipo).toggleClass(this.clases[0]);
        $('#'+identificador + tipo).toggleClass(this.clases[1]);
      }
      this.idSeleccionado = identificador;
      this.tipo = tipo;
      this.indice = indice;
    },
    mostrarInformacion: function(id, tipo, index){
      this.presionarBoton(id, tipo, index);
      //limpiar campos
      this.limpiarCampos();
      //cargamos la Informacion
      switch (tipo) {
        case 'p':
          console.log('Puntos:');
          console.log(this.listaPuntos[index]);
          this.importancia = this.infoPuntos['puntos'][this.listaPuntos[index]]['importancia'];
          this.observaciones = this.infoPuntos['puntos'][this.listaPuntos[index]]['observaciones'];
          this.indicaciones = this.infoPuntos['puntos'][this.listaPuntos[index]]['indicaciones'];
          this.funcion = this.infoPuntos['puntos'][this.listaPuntos[index]]['funcion'];
          this.posicion = this.infoPuntos['puntos'][this.listaPuntos[index]]['posicion'];
          this.localizacion = this.infoPuntos['puntos'][this.listaPuntos[index]]['localizacion'];
          this.nombre = this.infoPuntos['puntos'][this.listaPuntos[index]]['nombre'];
          this.clave = id;
          break;
        case 'e':
          console.log('Elementos:');
          console.log(this.listaElemento[index]);
          this.elemento = this.listaElemento[index]['tipo'];
          this.nombre = this.listaElemento[index]['valor'];
          break;
        case 'a':
          console.log('Afuera:');
          console.log(this.listaAfuera[index]);
          this.clave = this.listaAfuera[index]['tipo'];
          this.nombre = this.listaAfuera[index]['valor'];
          break;
        default:

      }
    },
    mostrarBoton: function(btn){
      if(this.tipo === '')return false;
      else if(this.indice === -1) return false;
      else return true;
    },
    verFormulario: function(tipo){
      if(this.tipo.length >= 1 && tipo.length > 1){
        let tipoTMP = this.tipo.split('-')[1];
        tipo = tipo.split('-')[1];
        if(tipoTMP === tipo) return true;
        else return false;
      }else if(tipo === this.tipo)return true;
      else return false;
    },
    nuevo: function(){
      $('#divEditar').addClass('ocultarFormularios');
      $('#divNuevo').removeClass('ocultarFormularios');
      let tipoTMP = this.tipo;
      if(this.tipo.length > 1){
        tipoTMP = tipoTMP.split('-')[1];
      }
      if(this.idSeleccionado !== ''){
        $('#'+this.idSeleccionado + tipoTMP).toggleClass(this.clases[0]);
        $('#'+this.idSeleccionado + tipoTMP).toggleClass(this.clases[1]);
        this.idSeleccionado = '';
        this.tipo = '';
        this.tipoNuevo = '-';
        this.indice = -1;
      }
      this.limpiarCampos();
    },
    seleccionarForm: function(){
      console.log(this.tipoNuevo);
      this.tipo = 'nuevo-' + this.tipoNuevo;
      $('#divNuevo').addClass('ocultarFormularios');
      $('#divEditar').removeClass('ocultarFormularios');
      //this.tipoNuevo = '-';
    },
    editar: function(){
      if(this.tipo.length === 1){
        console.log('mostrar Editar');
        this.tipo = 'edit-' + this.tipo;
        this.tipoNuevo = '-';
      }else{
        console.log('editar mostrado');
      }
    },
    eliminar: function(){
      let tipoTMP = this.tipo;
      if(tipoTMP.length > 1){
        tipoTMP = this.tipo.split('-')[1];
      }
      console.log(this.infoPuntos);
      console.log(this.tipo);
      console.log(this.tipoNuevo);
      switch (tipoTMP) {
        case 'p':
          swal('¡Atención!', '¿Seguro que desea eliminar el punto: '+ this.listaPuntos[this.indice] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            if(val){
              delete this.infoPuntos['puntos'][this.listaPuntos[this.indice]];
            }else{
              return;
            }
          });
          break;
        case 'e':
          swal('¡Atención!', '¿Seguro que desea eliminar el punto elemento: '+ this.listaElemento[this.indice]['valor'] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            if(val){
              this.eliminarElemento(this.listaElemento[this.indice]['tipo'], this.listaElemento[this.indice]['valor']);
            }else{
              return;
            }
          });
          break;
        case 'a':
          swal('¡Atención!', '¿Seguro que desea eliminar el elemento: '+ this.listaAfuera[this.indice]['valor'] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            if(val){
              delete this.infoPuntos['afuera'][this.listaAfuera[this.indice]['tipo']];
            }else{
              return;
            }
          });
          break;
      }
    },
    guardar: async function(){
      let tipoTMP = this.tipo.split('-')[1];
      let respuesta = false;
      console.log(this.infoPuntos);
      if(this.tipoNuevo !== '-'){
        console.log('Elemento Nuevo');
        if(this.canalSeleccionado === ''){
          swal('Advertencia', 'Favor de elegir un canal', 'warning');
          return
        }
        switch (tipoTMP) {
          case 'p':
            console.log('evaluando: ' + this.clave);
            respuesta = VerificarCadenas.verificar(this.clave);
            if(!respuesta){
              await swal('Error', 'El nombre clave debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                })
              });
              return;
            }
            //checar si el nombre se ha repetido
            if(this.listaPuntos.indexOf(this.clave) === -1){
              //agregar el registro
              console.log('agregando punto: ' + this.clave);
              let tmp = {
                importancia: 1,
                observaciones: '',
                indicaciones: '',
                funcion: '',
                posicion: -1,
                localizacion: '',
                nombre: ''
              };
              this.infoPuntos['puntos'][this.clave] = tmp;
              //enviar A modificar info
            }else{
              //ya esta repetido
              await swal('Error', 'Ya se encuentra ese nombre de punto', 'error').then((val) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            break;
          case 'e':
            console.log('evaluando: ' + this.nombre);
            respuesta = VerificarCadenas.verificar(this.nombre);
            if(!respuesta){
              await swal('Error', 'El nombre debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //revisamos si el elemento se encuentra vacio
            if(this.elemento === '-' || this.elemento === ''){
              await swal('Error', 'No se ha elegido un Elemento', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            if(this.buscarElemento(this.listaElemento, this.nombre, 'valor')){
              //ya se encuentra el elemento
              await swal('error', 'El punto elemento ya existe', 'error').then((val) => {
                return new Promise(resolve => {
                  resolve();
                });
              })
              return;
            }else{
              //insertamos nuevo elemento
              console.log('agregando elemento:' + this.nombre);
              this.infoPuntos['elementos'][this.elemento].push(this.nombre);
            }
            break;
          case 'a':
            console.log('evaluando: ' + this.nombre);
            respuesta = VerificarCadenas.verificar(this.nombre);
            if(!respuesta){
              await swal('Error', 'El nombre debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            console.log('evaluando: ' + this.clave);
            respuesta = VerificarCadenas.verificarMayus(this.clave);
            if(!respuesta){
              await swal('Error', 'La clave debe contener solamente caracteres alfanuméricos, letras mayúsculas y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            if(this.buscarElemento(this.listaAfuera, this.nombre, 'valor')){
              //error
              await swal('error', 'El nombre ya existe', 'error').then((val) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }else{
              if(this.buscarElemento(this.listaAfuera, this.clave, 'tipo')){
                //error
                await swal('error', 'La clave ya existe', 'error').then((val) => {
                  return new Promise(resolve => {
                    resolve();
                  })
                })
                return;
              }else{
                console.log('agregando afuera: ' + this.nombre);
                this.infoPuntos['afuera'][this.clave] = this.nombre;
              }
            }
            break;
        }
      }else{
        console.log('Elemento Editar');
        switch (tipoTMP) {
          case 'p':
            //evaluar cadena
            respuesta = VerificarCadenas.verificar(this.clave);
            if(!respuesta){
              await swal('Error', 'El nombre clave debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //checar si el nombre es el mismo o ha cambiado
            console.log(this.listaPuntos[this.indice]);
            if(this.listaPuntos[this.indice] === this.clave){
              return;
            }else if(this.listaPuntos.indexOf(this.clave) !== -1 && this.listaPuntos[this.indice] !== this.clave){
              await swal('Error', 'El nombre clave ya existe', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }else{
              console.log('Guardar el nombre nuevo y eliminar el anterior');
              let tmp = this.infoPuntos['puntos'][this.listaPuntos[this.indice]];
              this.infoPuntos['puntos'][this.clave] = tmp;
              delete this.infoPuntos['puntos'][this.listaPuntos[this.indice]];

            }
            break;
          case 'e':
            respuesta = VerificarCadenas.verificar(this.nombre);
            if(!respuesta){
              await swal('Error', 'El nombre debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //revisamos si el elemento se encuentra vacio
            if(this.elemento === '-' || this.elemento === ''){
              await swal('Error', 'No se ha elegido un Elemento', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //revisar si no hubo cambios
            if(this.listaElemento[this.indice]['valor'] === this.nombre && this.listaElemento[this.indice]['tipo'] === this.elemento){
              console.log('sin cambios');
              return;
            }
            //revisar si el nombre ya se encuentra en existencia
            if(this.buscarElemento(this.listaElemento, this.nombre,'valor') && this.listaElemento[this.indice]['valor'] !== this.nombre){
              await swal('Error', 'El nombre ya existe', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //crear el nuevo elemento
            this.infoPuntos['elementos'][this.elemento].push(this.nombre);
            //eliminar el anterior
            this.eliminarElemento(this.listaElemento[this.indice]['tipo'], this.listaElemento[this.indice]['valor']);
            break;
          case 'a':
            //evaluamos contenido de la clave
            respuesta = VerificarCadenas.verificarMayus(this.clave);
            if(!respuesta){
              await swal('Error', 'La clave debe contener solamente caracteres alfanuméricos, letras mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //evaluamos contenido del valor
            respuesta = VerificarCadenas.verificar(this.nombre);
            if(!respuesta){
              await swal('Error', 'El nombre debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
            //evaluamos si no hubo cambios
            console.log(this.indice);
            if(this.listaAfuera[this.indice]['valor'] === this.nombre && this.listaAfuera[this.indice]['tipo'] === this.clave){
              console.log('sin cambios');
              return;
            }else{
              //verificamos si la clave ya existe
              if(this.infoPuntos['afuera'][this.clave] && this.listaAfuera[this.indice]['tipo'] !== this.clave){
                await swal('Error', 'La clave ya existe', 'error').then((value) => {
                  return new Promise(resolve => {
                    resolve();
                  });
                });
                return;
              }
              //verificamos si el nombre existe
              if(this.buscarElemento(this.listaAfuera, this.nombre, 'valor') && this.listaAfuera[this.indice]['valor'] !== this.nombre){
                await swal('Error', 'El nombre ya existe', 'error').then((value) => {
                  return new Promise(resolve => {
                    resolve();
                  });
                });
                return;
              }
              delete this.infoPuntos['afuera'][this.listaAfuera[this.indice]['tipo']];
              this.infoPuntos['afuera'][this.clave] = this.nombre;
            }
            break;
        }
      }
    },
    eliminarElemento: function(tipo, nombre){
      let indice = this.infoPuntos['elementos'][tipo].indexOf(nombre);
      this.infoPuntos['elementos'][tipo].splice(indice,1);
      return;
    },
    buscarElemento: function(lista, nombre, id){
      console.log('entrando a funcion');
      for(let i=0 ; i < lista.length ; i++){
        if(lista[i][id] === nombre){
          return true;
        }
      }
      return false;
    }
  }
});

var modReportes = new Vue({
  el: '#modReportes',
  data:{
  }
});

var modGrupos = new Vue({
  el: '#modGrupos',
  data:{
    seleccionID: '',
    vista: '',
    clases: ['listaCanales', 'listaCanalesActivo'],
    baseTmp: path.sep + 'resources' + path.sep + 'app' + path.sep + 'Informacion' + path.sep + 'config.json',
    base: path.sep + 'Informacion' + path.sep + 'config.json',
    rutaConfig: '',
    infoConfig: {},
    _infoOriginal: {},
    grupos: [],
    posicion: -1,
    /*variables del formulario*/
    iNombre: '',
    iSemestre: '',
    iyear: 0
  },
  methods:{
    mostrarGrupos: function(rutaBase){
      this.rutaConfig = rutaBase + this.base;
      Modelo.obtenerInformacion(this.rutaConfig, 'g');
    },
    setGrupos: function(){
      let tmp = [];
      this.grupos = [];
      for(let i=0 ; i < this.infoConfig['grupos'].length ; i++){
        this.grupos.push(this.infoConfig['grupos'][i]);
      }
      for(let element in this.infoConfig['grupos']){
        console.log(element);
        tmp.push(element);
      }
      this.limpiar();
    },
    limpiar: function(){
      //limpiamos si hay alguna seleccion
      if(this.seleccionID !== ''){
        $('#' + this.seleccionID).addClass(this.clases[0]);
        $('#' + this.seleccionID).removeClass(this.clases[1]);
        this.seleccionID = '';
        this.vista = '';
      }
      //limpiamos informacion
      this.iNombre = '';
      this.iSemestre = 0;
      this.iyear = 0;
      this.posicion = -1;
    },
    nuevo: function(){
      this.limpiarFormularioNuevo();
      this.quitarSeleccionBoton();
      this.vista = 'n';
    },
    limpiarFormularioNuevo: function(){
      this.iNombre = '';
      this.iSemestre = '';
      this.iYear = 0;
      this.posicion = -1;
    },
    quitarSeleccionBoton: function(){
      if(this.seleccionID !== ''){
        $('#'+this.seleccionID).toggleClass(this.clases[0]);
        $('#'+this.seleccionID).toggleClass(this.clases[1]);
        this.seleccionID = '';
        this.posicion = -1;
      }
    },
    mostrarInformacion: function(id, posicion){
      console.log(id + ' has been clicked');
      this.posicion = posicion;
      this.presionarBoton(id);
      //establecemos informacion en formulario
      this.setFromInformacion(posicion);
      this.vista = 'i';
    },
    setFromInformacion: function(pos){
      this.iNombre = this.grupos[pos]['nombre'];
      this.iSemestre = this.grupos[pos]['semestre'];
      this.iyear = this.grupos[pos]['year'];
    },
    presionarBoton: function(id){
      if(this.seleccionID !== id && this.seleccionID !== ''){
        //nuevo elemento
        //toggle al primer elemento
        $('#'+this.seleccionID).toggleClass(this.clases[0]);
        $('#'+this.seleccionID).toggleClass(this.clases[1]);
        //toggle al segundo
        $('#'+id).toggleClass(this.clases[0]);
        $('#'+id).toggleClass(this.clases[1]);
      }else{
        $('#'+id).toggleClass(this.clases[0]);
        $('#'+id).toggleClass(this.clases[1]);
      }
      this.seleccionID = id;
    },
    verFormulario: function(letra){
      if(this.vista === letra){
        return true;
      }else{
        return false;
      }
    },
    guardar: function(letra){
      switch (letra) {
        case 'n':
          if(this.iNombre == '' || this.iSemestre == '' || this.iyear == 0){
            swal('Aviso', 'Favor de llenar todos los campos', 'info');
          }else{
            let resp = this.evaluarFormulario();
            if(resp.error === ''){
              let tmp = {
                nombre: this.iNombre,
                semestre: this.iSemestre,
                year: this.iyear
              };
              this._infoOriginal['grupos'].push(tmp);
              Modelo.guardarGrupo(this.rutaConfig, this._infoOriginal);
            }else{
              swal('Error', resp.error, 'error');
            }

          }
          break;
        case 'e':
        if(this.iNombre == '' || this.iSemestre == '' || this.iyear == 0){
          swal('Aviso', 'Favor de llenar todos los campos', 'info');
        }else{
          let resp = this.evaluarFormulario();
          if(resp.error === ''){
            let tmp = {
              nombre: this.iNombre,
              semestre: this.iSemestre,
              year: this.iyear
            };
            console.log(this._infoOriginal['grupos'][this.posicion]);
            this._infoOriginal['grupos'][this.posicion] = tmp;
            Modelo.guardarGrupo(this.rutaConfig, this._infoOriginal);
          }else{
            swal('Error', resp.error, 'error');
          }
        }
          break;

      }
    },
    evaluarFormulario: function(){
      let resp = {error: ''};
      let patternText = /[^a-zA-Z0-9]/;

      if(patternText.test(this.iNombre)){
        resp['error'] += 'Nombre: debe ser alfanumérico';
      }

      return resp;
    },
    verBtnFormulario: function(){
      if(this.vista === 'e' || this.vista === 'i'){
        return true;
      }else{
        return false;
      }
    },
    editar: function(){
      this.vista = 'e';
    },
    eliminar: function(){},
    despliegaSemestre: function(){
      console.log('year: ' + this.iyear);
      switch (this.iSemestre) {
        case '1':
          return('enero - julio');
          break;
        case '2':
          return('agosto - diciembre');
          break;
      }
    }
  }
});

var modRuta = new Vue({
  el: '#modRuta',
  data:{
    ruta: ''
  },
  methods:{
    setRuta: function(ruta){
      modulos.rutaProyecto = ruta;
      this.ruta = ruta;
    },
    seleccionarCarpeta: function(){
      ipcRenderer.send('channel1', 'Hello from main window');
    }
  },
  created: function(){
    this.ruta = modulos.rutaProyecto;
  }
});

ipcRenderer.on('channel1-response', (e,args) => {
  console.log(args);
  if(args['err']){
    console.log('Ocurrió un error inesperado');
  }else{
    if(!(args['ok'] === '' && this.ruta !== '')){
      localStorage.setItem('ruta', args['ok']);
      modRuta.setRuta(args['ok']);
    }else{
      console.log('');
    }
  }
})

ipcRenderer.on('obtenerInfo-response', (e,args) => {
  modCanales.infoCanales = JSON.parse(args);
  modCanales._infoOriginal = JSON.parse(args);

  modCanales.setCanales();
})

ipcRenderer.on('guardar-grupo-res', (e, args) => {
  modGrupos.limpiarFormularioNuevo();
  modulos.cambiar('grupos');
});

ipcRenderer.on('guardar-canal-response', (e,args) => {
  modCanales.limpiarFormularioNuevo();
  modulos.cambiar('canales');
})

ipcRenderer.on('OI-grupos-res', (e, args) => {
  modGrupos.infoConfig = JSON.parse(args);
  modGrupos._infoOriginal = JSON.parse(args);
  modGrupos.setGrupos();
})

ipcRenderer.on('oi-puntos-canales-res', (e, args) => {
  modPuntos.infoCanales = (JSON.parse(args))['canales'];
  modPuntos.setCanales();
})

ipcRenderer.on('oi-puntos-puntos-res', (e,args) => {
  modPuntos.infoPuntos = JSON.parse(args);
  modPuntos.__infoPuntosOriginal = JSON.parse(args);
  //console.log(modPuntos.infoPuntos);
  modPuntos.limpiarPuntos();
  //establecer el arreglo
  console.log(modPuntos.infoPuntos['puntos']);
  for(let el in modPuntos.infoPuntos['puntos']){
    modPuntos.listaPuntos.push(el);
  }
  console.log(modPuntos.infoPuntos['elementos']);
  for(let tipo in modPuntos.infoPuntos['elementos']){
    for(let i=0 ; i <  modPuntos.infoPuntos['elementos'][tipo].length ; i++){
      let tmp = {
        tipo: tipo,
        valor: modPuntos.infoPuntos['elementos'][tipo][i]
      };
      modPuntos.listaElemento.push(tmp);
    }
  }
  console.log(modPuntos.infoPuntos['afuera']);
  for(let tipo in modPuntos.infoPuntos['afuera']){
    let tmp = {
      tipo: tipo,
      valor: modPuntos.infoPuntos['afuera'][tipo]
    };
    modPuntos.listaAfuera.push(tmp);
  }
})
