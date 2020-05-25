console.log(process);
const {ipcRenderer} = require('electron')
const path = require('path');
const $ = require('jquery');
const Chart = require('chart.js');

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
        ipcRenderer.send('oi-puntos-puntos-req', archivo);
        break;
      case 'r':
        ipcRenderer.send('oi-reportes-grupos-req', archivo);
        break;
    }
  },
  guardarCanal: function(archivo, objeto){
    let tmp = [archivo, objeto];
    ipcRenderer.send('guardar-canal', tmp);
  },
  guardarGrupo: function(archivo, objeto){
    let tmp = [archivo, objeto];
    ipcRenderer.send('guardar-grupo-req', tmp);
  },
  guardarPunto: function(archivo, objeto){
    let tmp = [archivo, objeto];
    ipcRenderer.send('guardar-punto-req', tmp);
  }
};

const VerificarCadenas = {
  patron: /^[A-Z]{1}[a-zA-Z0-9_]*$/,
  patronMayus: /^[A-Z]{1}[A-Z0-9]*$/,
  verificar: function(cadena){
    return this.patron.test(cadena);
  },
  verificarMayus: function(cadena){
    return this.patronMayus.test(cadena);
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
    claseAudio: '',
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
          modReportes.mostrarGrupos(this.rutaProyecto);
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
        case 'audio':
          this.claseAudio = 'active';
          $('#modAudio').css('display', 'block');

      }
    },
    ocultar: function(){
      this.claseCanales  = '';
      this.clasePuntos   = '';
      this.claseReportes = '';
      this.claseGrupos = '';
      this.claseRuta = '';
      this.claseAudio = '';
      $('#modCanales').css('display', 'none');
      $('#modPuntos').css('display', 'none');
      $('#modReportes').css('display', 'none');
      $('#modGrupos').css('display', 'none');
      $('#modRuta').css('display', 'none');
      $('#modAudio').css('display', 'none');
    }
  },
  created: function(){
    console.log(localStorage);
    this.rutaProyecto = localStorage.getItem('ruta') || '';
    this.cambiar('ruta');
  }
});

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
      this.presionarBoton(id);

      //establecemos informacion
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
      /*this.limpiar();*/
    },
    cambiarCanal: function(){
      switch (this.canalSeleccionado) {
        case '-':
          this.limpiarPuntos();
          break;
        default:
          Modelo.obtenerInformacion(this.rutaConfig + this.canalSeleccionado, 'pp')
          break;

      }
    },
    ocultar: function(id){
      $('#'+id).toggleClass('ocultarPuntos');
    },
    restablecerInformacion: function(){
      this.limpiarPuntos();
      this.limpiarCampos();
      //this.canalSeleccionado =  '-';
      this.puntoSeleccionado = '';
      this.tipoNuevo = '-';
      this.base = path.sep + 'Informacion' + path.sep;
      this.rutaConfig = '';
      this.infoCanales = {};
      this.infoPuntos = {};
      this.__infoPuntosOriginal = {};
      this.canales = [];
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
          this.elemento = this.listaElemento[index]['tipo'];
          this.nombre = this.listaElemento[index]['valor'];
          break;
        case 'a':
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
      this.tipo = 'nuevo-' + this.tipoNuevo;
      $('#divNuevo').addClass('ocultarFormularios');
      $('#divEditar').removeClass('ocultarFormularios');
      //this.tipoNuevo = '-';
    },
    editar: function(){
      if(this.tipo.length === 1){
        this.tipo = 'edit-' + this.tipo;
        this.tipoNuevo = '-';
      }
    },
    eliminar: async function(){
      let tipoTMP = this.tipo;
      let resp = 0;
      if(tipoTMP.length > 1){
        tipoTMP = this.tipo.split('-')[1];
      }
      switch (tipoTMP) {
        case 'p':
          resp = await swal('¡Atención!', '¿Seguro que desea eliminar el punto: '+ this.listaPuntos[this.indice] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            return new Promise(resolve => {
              if(val){
                delete this.infoPuntos['puntos'][this.listaPuntos[this.indice]];
                resolve(1);
              }else{
                resolve(0);
              }
            });
          });
          break;
        case 'e':
          resp = await swal('¡Atención!', '¿Seguro que desea eliminar el punto elemento: '+ this.listaElemento[this.indice]['valor'] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            return new Promise(resolve => {
              if(val){
                this.eliminarElemento(this.listaElemento[this.indice]['tipo'], this.listaElemento[this.indice]['valor']);
                resolve(1);
              }else{
                resolve(0);
              }
            });
          });
          break;
        case 'a':
          resp = await swal('¡Atención!', '¿Seguro que desea eliminar el elemento: '+ this.listaAfuera[this.indice]['valor'] +'?',{
            buttons: true,
            dangerMode:true
          }).then((val) => {
            return new Promise(resolve => {
              if(val){
                delete this.infoPuntos['afuera'][this.listaAfuera[this.indice]['tipo']];
                resolve(1);
              }else{
                resolve(0);
              }
            });
          });
          break;
      }
      if(resp === 0)return;
      else{
        console.log('....::::::...... BorrarInfo ....::::::......');
        Modelo.guardarPunto(this.rutaConfig + this.canalSeleccionado, this.infoPuntos);
      }
    },
    guardar: async function(){
      let tipoTMP = this.tipo.split('-')[1];
      let respuesta = false;
      this.clave = this.clave.replace(/\ /g, '_');
      console.log(this.clave);
      if(this.tipoNuevo !== '-'){
        if(this.canalSeleccionado === ''){
          swal('Advertencia', 'Favor de elegir un canal', 'warning');
          return
        }
        switch (tipoTMP) {
          case 'p':
            respuesta = VerificarCadenas.verificar(this.clave);
            if(!respuesta){
              await swal('Error', 'El nombre clave debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y puede tener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                })
              });
              return;
            }
            if(this.nombre === ''){
              await swal('Error', 'El nombre traducido no puede quedar vacío', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                })
              });
              return;
            }
            //checar si el nombre se ha repetido
            if(this.listaPuntos.indexOf(this.clave) === -1){
              //agregar el registro
              let tmp = {
                importancia: 1,
                observaciones: '',
                indicaciones: '',
                funcion: '',
                posicion: parseInt(this.posicion),
                localizacion: '',
                nombre: this.nombre
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
              this.infoPuntos['elementos'][this.elemento].push(this.nombre);
            }
            break;
          case 'a':
            respuesta = VerificarCadenas.verificar(this.nombre);
            if(!respuesta){
              await swal('Error', 'El nombre debe contener solamente caracteres alfanuméricos, iniciar con una letra mayúscula y no contener espacios.', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }
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
                this.infoPuntos['afuera'][this.clave] = this.nombre;
              }
            }
            break;
        }
      }else{
        switch (tipoTMP) {
          case 'p':
          console.log('punto EDITADO');
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
            if(this.listaPuntos[this.indice] === this.clave){
              //guardamos los cambios del nombre y posicion
              this.infoPuntos['puntos'][this.listaPuntos[this.indice]]['nombre'] = this.nombre;
              this.infoPuntos['puntos'][this.listaPuntos[this.indice]]['posicion'] = parseInt(this.posicion);
            }else if(this.listaPuntos.indexOf(this.clave) !== -1 && this.listaPuntos[this.indice] !== this.clave){
              await swal('Error', 'El nombre clave ya existe', 'error').then((value) => {
                return new Promise(resolve => {
                  resolve();
                });
              });
              return;
            }else{
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
            if(this.listaAfuera[this.indice]['valor'] === this.nombre && this.listaAfuera[this.indice]['tipo'] === this.clave){
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
      console.log('....::::::...... guardarInfo ....::::::......');
      Modelo.guardarPunto(this.rutaConfig + this.canalSeleccionado, this.infoPuntos);
    },
    eliminarElemento: function(tipo, nombre){
      let indice = this.infoPuntos['elementos'][tipo].indexOf(nombre);
      this.infoPuntos['elementos'][tipo].splice(indice,1);
      return;
    },
    buscarElemento: function(lista, nombre, id){
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
    temporal: [],
    ruta: '',
    misReportes: {},
    nombreMeses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    grupos: [],
    tipos: [],

    reportes: [],
    meses: {},

    numReporte: {},
    grupo: '-',

    reporte: '-',
    mes: '-',

    tipo: '-',
    chart: null,
    dataSet: [],
    repGrupo:{
      calificacion: 0,
      total: 0,
      aprobadas: 0,
      reprobadas: 0,
      porcentaje: 0,
      mejor: [],
      peor: []
    }
  },
  methods:{
    mostrarGrupos: function(rutaProyecto){
      this.ruta  = rutaProyecto + path.sep + 'Informacion' + path.sep + 'reportes.json';
      Modelo.obtenerInformacion(this.ruta, 'r');
    },
    seleccionarGrupo: function(){
      this.tipos = [];
      this.reportes = [];
      this.meses = {};
      this.tipo = '-';
      this.reporte = '-';
      this.mes = '-';
      for(let tipo in this.misReportes[this.grupo]){
        this.tipos.push(tipo);
      }
      this.limpiarReporteGrupo();
      this.generarReporteGrupo();
      this.generarGrafica();
    },
    generarGrafica: function(){
      let ctx = null;
      let periodo = 'month';
      let diff = 0;
      //limpiar Datos
      this.dataSet = [];
      //Quitar grafica
      if(this.chart !== null){
        console.log('grafica eliminada');
        this.chart.destroy();
      }
      //obtener todos los reportes con atributos porcentaje,fecha
      for(let tipo in this.misReportes[this.grupo]){
        if(this.tipo !== '-' && this.tipo !== tipo){
          console.log('Saliendo!!!!');
          continue;
        }
        for(let i=0 ; i < this.misReportes[this.grupo][tipo].length ; i++){
          let tmp = {};
          let porcentaje = this.getPorcentaje(this.misReportes[this.grupo][tipo][i]);
          tmp['y'] = porcentaje;
          tmp['x'] = this.misReportes[this.grupo][tipo][i]['fecha'];
          this.colocarElementoGrupo(tmp);
        }
      }
      console.log('...:::... Conjunto ...:::...');
      console.log(this.dataSet);
      //obtenemos diferencia de tiempo
      if(this.dataSet.length !== 0){
        diff = (this.dataSet[this.dataSet.length-1]['x'] - this.dataSet[0]['x'])/1000;
      }
      /*
      1 hour = 3600
      1 day = 86400
      1 month = 2592000
      */
      if(diff < 3600){
        periodo = 'minute';
      }else if(diff < 86400){
        periodo = 'hour';
      }else if(diff < 2592000){
        periodo = 'day';
      }else{
        periodo = 'week';
      }
      //crear la grafica
      ctx = document.getElementById('grafica').getContext('2d');

      this.chart = new Chart(ctx, {
        type: 'line',
        data:{
          datasets: [{
            label: '% de calificacion',
            data: modReportes.dataSet,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            lineTension: 0.1
          }]
        },
        options:{
          responsive: true,
          title: {
            display: true,
            text: 'Progreso en la calificación con respecto al tiempo'
          },
          scales:{
            xAxes:[{
              type: 'time',
              time: {
                displayFormats:{
                  second: 'h:mm:ss a',
                  minute: 'h:mm: a',
                  hour: 'h:mm: a',
                  day: 'MMM D',
                  week: 'll',
                  month: 'll'
                },
                unit: periodo
              },
              scaleLabel: {
                display:true,
                labelString: periodo
              }
            }],
            yAxes:[{
              scaleLabel:{
                display: true,
                labelString: 'Porcentaje - %'
              },
              ticks:{
                max:100,
                beginAtZero: true
              }
            }]
          }
        }
      });

    },
    generarGraficaIndividual: function(){
      let ctx = null;
      let etiquetas = [];
      let dataset = [];
      let bg = [];
      let bc = [];
      let titulo = '';
      let backgroundColor = [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ];
      let borderColor = [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ];
      //Quitar grafica
      if(this.chart !== null){
        console.log('grafica eliminada');
        this.chart.destroy();
      }
      console.log('...:::... Conjunto ...:::...');
      //crear la grafica
      ctx = document.getElementById('grafica').getContext('2d');
      //definimos registros por tipo
      if(this.tipo === 'tipo1'){
        titulo = '% de calificacion de elementos';
        for(let i=0 ; i < this.repGrupo['porcentaje'].length ; i++){
          etiquetas.push(this.repGrupo['porcentaje'][i]['clave']);
          dataset.push(this.repGrupo['porcentaje'][i]['valor']);
          bg.push(backgroundColor[i]);
          bc.push(borderColor[i]);
        }

      }else if(this.tipo === 'tipo2'){
        titulo = '% de calificacion del canal';
        etiquetas.push(this.repGrupo['porcentaje'][0]['clave']);
        dataset.push(this.repGrupo['porcentaje'][0]['valor']);
        bg.push(backgroundColor[3]);
        bc.push(borderColor[3]);
      }
      this.chart = new Chart(ctx, {
        type: 'bar',
        data:{
          labels: etiquetas,
          datasets: [{
            label: 'Porcentajes',
            data: dataset,
            backgroundColor: bg,
            borderColor: bc,
            borderWidth: 1,
            lineTension: 0.1
          }]
        },
        options:{
          responsive: true,
          title: {
            display: true,
            text: titulo
          },
          scales:{
            yAxes:[{
              scaleLabel:{
                display: true,
                labelString: 'Porcentaje - %'
              },
              ticks:{
                max:100,
                beginAtZero: true
              }
            }]
          }
        }
      });

    },
    colocarElementoGrupo: function(tmp){
      //splice(posicion, 0sinelementos, elementoInsertar)
      for(let i=0 ; i < this.dataSet.length ; i++){
        if(this.dataSet[i]['x'] > tmp['x']){
          this.dataSet.splice(i,0,tmp);
          return;
        }
      }
      this.dataSet.push(tmp);
      return;

    },
    limpiarReporteGrupo: function(){
      this.repGrupo['calificacion'] = 0;
      this.repGrupo['total'] = 0;
      this.repGrupo['aprobadas'] = 0;
      this.repGrupo['reprobadas'] = 0;
      this.repGrupo['porcentaje'] = 0;
      this.repGrupo['mejor'] = [0,'Sin Datos'];
      this.repGrupo['peor'] = [0,'Sin Datos'];
    },
    generarReporteGrupo: function(){
      let mejorTMP = [0,'sin datos'];
      let peorTMP = [0,'sin datos'];
      let califTotal = 0.0;
      //obtener numero de pruebas
      for(let tipo in this.misReportes[this.grupo]){
        if(this.tipo !== '-' && this.tipo !== tipo){
          console.log('Saliendo!!!!');
          continue;
        }
        this.repGrupo['total'] += this.misReportes[this.grupo][tipo].length;
        for(let i=0 ; i < this.misReportes[this.grupo][tipo].length ; i++){
          let porcentaje = parseFloat(this.getPorcentaje(this.misReportes[this.grupo][tipo][i]));
          califTotal += porcentaje;
          //aprobados y reprobados
          if(porcentaje >= 60.0){
            this.repGrupo['aprobadas'] += 1;
          }else{
            this.repGrupo['reprobadas'] += 1;
          }
          //mejor y peor
          if(mejorTMP[0] < porcentaje){
            //comparamos si el mejor que sale no es el menor tambien
            if(peorTMP[1] === 'sin datos'){
              peorTMP[0] = mejorTMP[0];
              peorTMP[1] = mejorTMP[1];
            }else if(peorTMP[0] > mejorTMP[0]){
              peorTMP[0] = mejorTMP[0];
              peorTMP[1] = mejorTMP[1];
            }
            mejorTMP[0] = porcentaje;
            mejorTMP[1] = this.misReportes[this.grupo][tipo][i]['canal'];

          }else if(peorTMP[1] === 'sin datos'){
            peorTMP[0] = porcentaje;
            peorTMP[1] = this.misReportes[this.grupo][tipo][i]['canal'];
          }else if(peorTMP[0] > porcentaje){
            peorTMP[0] = porcentaje;
            peorTMP[1] = this.misReportes[this.grupo][tipo][i]['canal'];
          }else if(peorTMP[0] == porcentaje){
            peorTMP[0] = porcentaje;
            peorTMP[1] = this.misReportes[this.grupo][tipo][i]['canal'];
          }
        }

        this.repGrupo['mejor'][0] = mejorTMP[0];
        this.repGrupo['mejor'][1] = mejorTMP[1];
        this.repGrupo['peor'][0] = peorTMP[0];
        this.repGrupo['peor'][1] = peorTMP[1];
      }
      if(this.repGrupo['total'] != 0.0){
        califTotal = parseFloat(califTotal/this.repGrupo['total']);
        this.repGrupo['porcentaje'] = califTotal.toFixed(2);
      }else{
        this.repGrupo['porcentaje'] = 0.0;
      }
    },
    generarReporteIndividual: function(){
      let mejorTMP = [0,'sin datos'];
      let peorTMP = [0,'sin datos'];
      let califTotal = 0.0;
      let tmp = ['fuego','tierra','agua','metal','madera','afuera'];
      console.log(this.misReportes[this.grupo][this.tipo][this.reporte]);
      //hacemos una distincion por tipos de reportes:
      if(this.tipo === 'tipo1'){
        //reporte de puntos
        //calificacion
        califTotal = this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'] * 10 / this.misReportes[this.grupo][this.tipo][this.reporte]['total'];
        califTotal = parseFloat(califTotal.toFixed(2));
        this.repGrupo['calificacion'] = califTotal;
        //aciertos
        this.repGrupo['aprobadas'] = this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'];
        //errores
        this.repGrupo['reprobadas'] = this.misReportes[this.grupo][this.tipo][this.reporte]['total'] - this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'];
        //total
        this.repGrupo['total'] = this.misReportes[this.grupo][this.tipo][this.reporte]['total'];
        //obtener porcentajes de resultados
        this.repGrupo['porcentaje'] = [];
        //porcentajes
        for(let i=0 ; i < tmp.length ; i++){
          califTotal = this.misReportes[this.grupo][this.tipo][this.reporte][tmp[i]][0] * 100 / this.misReportes[this.grupo][this.tipo][this.reporte][tmp[i]][1];
          califTotal = parseFloat(califTotal.toFixed(2));
          this.repGrupo['porcentaje'].push({clave:tmp[i],valor:califTotal});
        }

        //Mejor y peor
        for(let i=0 ; i < this.repGrupo['porcentaje'].length ; i++){
          if(mejorTMP[0] < this.repGrupo['porcentaje'][i]['valor']){
            //comparamos si el mejor que sale no es el menor tambien
            if(peorTMP[1] === 'sin datos'){
              peorTMP[0] = mejorTMP[0];
              peorTMP[1] = mejorTMP[1];
            }else if(peorTMP[0] > mejorTMP[0]){
              peorTMP[0] = mejorTMP[0];
              peorTMP[1] = mejorTMP[1];
            }
            mejorTMP[0] = this.repGrupo['porcentaje'][i]['valor'];
            mejorTMP[1] = this.repGrupo['porcentaje'][i]['clave'];

          }else if(peorTMP[1] === 'sin datos'){
            peorTMP[0] = this.repGrupo['porcentaje'][i]['valor'];
            peorTMP[1] = this.repGrupo['porcentaje'][i]['clave'];
          }else if(peorTMP[0] > this.repGrupo['porcentaje'][i]['valor']){
            peorTMP[0] = this.repGrupo['porcentaje'][i]['valor'];
            peorTMP[1] = this.repGrupo['porcentaje'][i]['clave'];
          }else if(peorTMP[0] == this.repGrupo['porcentaje'][i]['valor']){
            peorTMP[0] = this.repGrupo['porcentaje'][i]['valor'];
            peorTMP[1] = this.repGrupo['porcentaje'][i]['clave'];
          }
        }

        this.repGrupo['mejor'][0] = mejorTMP[0];
        this.repGrupo['mejor'][1] = mejorTMP[1];
        this.repGrupo['peor'][0] = peorTMP[0];
        this.repGrupo['peor'][1] = peorTMP[1];



      }else if(this.tipo === 'tipo2'){
        //reporte del modelo
        //calificacion
        califTotal = this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'] * 10 / this.misReportes[this.grupo][this.tipo][this.reporte]['total'];
        califTotal = parseFloat(califTotal.toFixed(2));
        this.repGrupo['calificacion'] = califTotal;
        //aciertos
        this.repGrupo['aprobadas'] = this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'];
        //errores
        this.repGrupo['reprobadas'] = this.misReportes[this.grupo][this.tipo][this.reporte]['total'] - this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'];
        //total
        this.repGrupo['total'] = this.misReportes[this.grupo][this.tipo][this.reporte]['total'];
        //porcentaje
        califTotal = this.misReportes[this.grupo][this.tipo][this.reporte]['sumaCorrectas'] * 100 / this.misReportes[this.grupo][this.tipo][this.reporte]['total'];
        califTotal = parseFloat(califTotal.toFixed(2));
        this.repGrupo['porcentaje'] = [{clave: this.misReportes[this.grupo][this.tipo][this.reporte]['canal'],valor:califTotal}];
      }
    },
    getPorcentaje: function(reporte){
      let total = parseFloat(reporte['total']);
      let correctas = parseFloat(reporte['sumaCorrectas']);
      let porcentaje = correctas * 100.0 / total;
      return(porcentaje.toFixed(2));
    },
    misTipos: function(tipo){
      if(tipo === 'tipo1'){
        return 'Puntos';
      }else if(tipo === 'tipo2'){
        return 'Modelo';
      }
    },
    desplegarRepIndividual: function(t){
      if(this.reporte !== '-' && t === this.tipo){
        return true;
      }else{
        return false;
      }
    },
    seleccionarTipo: function(){
      this.reportes = [];
      this.reporte = '-';
      //establecemos la informacion de los reportes individuales
      for(let i in this.misReportes[this.grupo][this.tipo]){
        let fecha = new Date(this.misReportes[this.grupo][this.tipo][i]['fecha']);
        let valor = this.misReportes[this.grupo][this.tipo][i]['canal'] + ' - ' + this.nombreMeses[fecha.getMonth()] + ' ' + fecha.getDate();
        valor += ' - ' + fecha.getHours() + ':' + fecha.getMinutes();
        let elemento = {
          clave: i,
          valor: valor
        };
        this.reportes.push(elemento);
      }
      this.limpiarReporteGrupo();
      this.generarReporteGrupo();
      this.generarGrafica();
    },
    seleccionarReporte:function(){
      this.limpiarReporteGrupo();
      this.generarReporteIndividual();
      this.generarGraficaIndividual();
    }
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

var modAudio = new Vue({
  el: '#modAudio',
  data:{
    ruta: '',
    audio: ''
  },
  methods:{
    seleccionarArchivo: function(){
      console.log('archivo nuevo');
      console.log(this.ruta);
      let miRuta = this.ruta;
      ipcRenderer.send('channelAudio',miRuta);
    }
  },
  created: function(){
    this.ruta = modulos.rutaProyecto;
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

ipcRenderer.on('channelAudio-res', (e,args) => {
  if(args['error']){
    swal('Error','No se ha podido subir el archivo', 'error');
  }else{
    if(args['ok'] !== ''){
      swal('Aviso','Se ha cargado el archivo en el proyecto.', 'success');
    }
  }
});

ipcRenderer.on('channel1-response', (e,args) => {
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

ipcRenderer.on('guardar-punto-res', (e,args) => {
  modPuntos.restablecerInformacion();
  modPuntos.mostrarCanales(modulos.rutaProyecto);
  modPuntos.cambiarCanal();
});

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
  modPuntos.limpiarPuntos();
  //establecer el arreglo
  for(let el in modPuntos.infoPuntos['puntos']){
    modPuntos.listaPuntos.push(el);
  }
  for(let tipo in modPuntos.infoPuntos['elementos']){
    for(let i=0 ; i <  modPuntos.infoPuntos['elementos'][tipo].length ; i++){
      let tmp = {
        tipo: tipo,
        valor: modPuntos.infoPuntos['elementos'][tipo][i]
      };
      modPuntos.listaElemento.push(tmp);
    }
  }
  for(let tipo in modPuntos.infoPuntos['afuera']){
    let tmp = {
      tipo: tipo,
      valor: modPuntos.infoPuntos['afuera'][tipo]
    };
    modPuntos.listaAfuera.push(tmp);
  }
})

ipcRenderer.on('oi-reportes-grupos-res', (e,args) => {
  modReportes.misReportes = JSON.parse(args);
  console.log(modReportes.misReportes);
})
