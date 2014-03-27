var NUMCUBES=50;
var CUBE_DIMENSION=10;
var CLIP_PADDING=2*CUBE_DIMENSION;
var CLIP_PLANE=-100;

var CUBE_X_VELOCITY=-2
var CUBE_MAX_ROTATION=0.03


$(document).ready(function(){


    var scene = new THREE.Scene(); 
    var camera;
    var renderer = new THREE.CanvasRenderer({canvas: $("#header_cvs").get(0), alpha:true});
    renderer.setClearColor( 0x000000, 0);

    $(window).resize(function(){
        renderer.setSize(window.innerWidth, window.innerHeight); 
        camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, CLIP_PADDING, CLIP_PLANE-CLIP_PADDING );
    })
    $(window).trigger('resize');

    var cubes = [];
    for (var i = 0; i < NUMCUBES; i++){
        cubes[i] = [makeCube(),-1.0+CUBE_X_VELOCITY*Math.random(),[CUBE_MAX_ROTATION*(2*Math.random()-1),CUBE_MAX_ROTATION*(2*Math.random()-1),CUBE_MAX_ROTATION*(2*Math.random()-1)], [(window.innerWidth*2)*Math.random()+window.innerWidth/2,window.innerHeight*Math.random()-window.innerHeight/2,-CLIP_PLANE/2]];
        cubes[i][0].position.x = cubes[i][3][0];
        cubes[i][0].position.y = cubes[i][3][1];
        cubes[i][0].position.z = cubes[i][3][2];
        scene.add(cubes[i][0]);
    }


    setInterval(function () { 
        renderer.render(scene, camera);
        for (var i = 0; i < NUMCUBES; i++){

            cubes[i][0].position.x += cubes[i][1];

            cubes[i][0].rotation.x += cubes[i][2][0];
            cubes[i][0].rotation.y += cubes[i][2][1];
            cubes[i][0].rotation.z += cubes[i][2][2];

            if (cubes[i][0].position.x < -window.innerWidth/2-CLIP_PADDING){
                cubes[i][0].position.x = cubes[i][3][0];
            }

        }
    },50);

})

function makeCube(){
    var cube = new THREE.BoxHelper();
    cube.material.color.setRGB( 1, 0, 0 );
    cube.scale.set( CUBE_DIMENSION, CUBE_DIMENSION, CUBE_DIMENSION );
    return cube;
}
