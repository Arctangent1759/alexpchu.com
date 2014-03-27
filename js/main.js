var NUMCUBES=50;
var CUBE_DIMENSION=10;
var CLIP_PADDING=2*CUBE_DIMENSION;
var CLIP_PLANE=-100;

var CUBE_X_VELOCITY=-2
var CUBE_MAX_ROTATION=0.03


$(document).ready(function(){

    var cube_r=1;
    var cube_g=0;
    var cube_b=0;

    $("#link_about").mouseover(function(){
        cube_r=0;
        cube_g=1;
        cube_b=0;
    });
    $("#link_projects").mouseover(function(){
        cube_r=0;
        cube_g=0;
        cube_b=1;
    });
    $("#link_github").mouseover(function(){
        cube_r=1;
        cube_g=1;
        cube_b=0;
    });
    $("#link_resume").mouseover(function(){
        cube_r=1;
        cube_g=0;
        cube_b=1;
    });
    $("#link_contact").mouseover(function(){
        cube_r=0;
        cube_g=1;
        cube_b=1;
    });

    $("#title").mouseover(function(){
        cube_r=1;
        cube_g=0;
        cube_b=0;
    });


    $(document).mousemove(function(event) {
        camera.position.x=0.0000001*(event.pageX-window.innerWidth/2)*(event.pageX-window.innerWidth/2)*(event.pageX-window.innerWidth/2)
        camera.position.y=-0.000001*(event.pageY-window.innerHeight/2)*(event.pageY-window.innerHeight/2)*(event.pageY-window.innerHeight/2)
    });

    function rescale(){
        renderer.setSize(window.innerWidth, window.innerHeight); 
        camera = new THREE.OrthographicCamera( -window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, -10000, 10000 );
    }

    var scene = new THREE.Scene(); 
    var camera;
    var renderer = new THREE.CanvasRenderer({canvas: $("#header_cvs").get(0), alpha:true});
    renderer.setClearColor( 0x000000, 0);

    $(window).resize(rescale);
    rescale();

    var cubes = [];
    for (var i = 0; i < NUMCUBES; i++){
        cubes[i] = [makeCube(),-1.0+CUBE_X_VELOCITY*Math.random(),[CUBE_MAX_ROTATION*(2*Math.random()-1),CUBE_MAX_ROTATION*(2*Math.random()-1),CUBE_MAX_ROTATION*(2*Math.random()-1)], [(window.innerWidth*2)*Math.random()+window.innerWidth/2,window.innerHeight*0.61803398875*Math.random()-window.innerHeight*0.61803398875/2,-CLIP_PLANE/2]];
        cubes[i][0].position.x = cubes[i][3][0];
        cubes[i][0].position.y = cubes[i][3][1];
        cubes[i][0].position.z = cubes[i][3][2];
        scene.add(cubes[i][0]);
    }


    setInterval(function () { 
        renderer.render(scene, camera);
        for (var i = 0; i < NUMCUBES; i++){

            cubes[i][0].material.color.setRGB( cube_r, cube_g, cube_b );

            cubes[i][0].position.x += cubes[i][1];

            cubes[i][0].rotation.x += cubes[i][2][0];
            cubes[i][0].rotation.y += cubes[i][2][1];
            cubes[i][0].rotation.z += cubes[i][2][2];

            if (cubes[i][0].position.x < -window.innerWidth/2-CLIP_PADDING){
                cubes[i][0].position.x = cubes[i][3][0];
            }

        }
    },50);

    var SCROLLRATE = 1;

    $(window).scroll(function(){
        var perc = 25+75*(window.innerHeight-SCROLLRATE*$('body').scrollTop())/window.innerHeight;
        if (perc < 0){
            perc=0;
        }
        $("div#header").css({"height":perc +"%"});
    });

    $(function() {
        $('a[href*=#]:not([href=#])').click(function() {
            if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
            var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
                if (target.length) {
                    var scroll = target.offset().top;// - $("div#header").height()
                    $('html,body').animate({scrollTop: scroll}, 1000);
                    return false;
                }
            }
        });
        //f(x) = x - 2*(h-x/h) = 
    });
})

function makeCube(){
    var cube = new THREE.BoxHelper();
    cube.material.color.setRGB( 1, 0, 0 );
    cube.scale.set( CUBE_DIMENSION, CUBE_DIMENSION, CUBE_DIMENSION );
    return cube;
}
