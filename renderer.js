console.log(process);

const app = new Vue({
  el:'#app',
  data:{
    nodeVersion: '',
    electronVersion: ''
  },
  created: function(){
    this.nodeVersion = process.versions.node;
    this.electronVersion = process.versions.electron;
  }
});

//<script>document.write( )</script>
//<script>document.write(  )</script>
