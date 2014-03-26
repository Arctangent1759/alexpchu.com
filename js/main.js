var NUMCUBES=20;

$(document).ready(function(){

/*

  var scene = new THREE.Scene(); 
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 
  var camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, 120 );
  var renderer = new THREE.CanvasRenderer({canvas: $("#header_cvs").get(0), alpha:true});
  renderer.setClearColor( 0xffffff, 0 );

  $(window).resize(function(){
    renderer.setSize(window.innerWidth, window.innerHeight); 
  })
  $(window).trigger('resize');

  var cube = getCube();

  scene.add(cube);

  setInterval(function () { 
    cube.rotation.x += 0.01; 
    cube.rotation.y += 0.01; 
    renderer.render(scene, camera);
  },50);
  */

})

function getCube(){
  var cube = new THREE.BoxHelper();
  cube.material.color.setRGB( 1, 0, 0 );
  cube.scale.set( 10, 10, 10 );
  return cube;
}
