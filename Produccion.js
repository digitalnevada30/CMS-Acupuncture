const PRODUCCION = {
  estado: false,
  evaluar: function(rutaTMP){
    console.log('ruta que recibimos: ' + rutaTMP);
    if(rutaTMP !== ''){
      if(this.estado && rutaTMP.indexOf(PATH.sep + 'resources' + PATH.sep + 'app') === -1){
          console.log('No tenemos ruta de produccion');
          localStorage.setItem('ruta', rutaTMP + PATH.sep + 'resources' + PATH.sep + 'app');
      }else if(!this.estado && rutaTMP.indexOf(PATH.sep + 'resources' + PATH.sep + 'app') !== -1){
        console.log('Tenemos que quitar ruta de produccion');
        localStorage.setItem('ruta', rutaTMP.split(PATH.sep + 'resources' + PATH.sep + 'app')[0]);
      }else if(localStorage.getItem('ruta') !== rutaTMP){
        if(this.estado){
          localStorage.setItem('ruta', rutaTMP + PATH.sep + 'resources' + PATH.sep + 'app');
        }else{
          localStorage.setItem('ruta', rutaTMP);
        }
      }
      console.log('ruta que entregamos: ' + localStorage.getItem('ruta'));
    }
  }
};

module.exports = PRODUCCION;
