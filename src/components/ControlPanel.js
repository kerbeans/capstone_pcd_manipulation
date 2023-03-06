import React from "react";
import * as THREE from 'three';

import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { PCDLoader } from '../../node_modules/three/examples/jsm/loaders/PCDLoader.js';
import { GUI } from '../../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';






class ControlPanel extends React.Component{
    constructor(){
        super();
        this.iframe=document.createElement('iframe');
        var html='<body></body>';
        this.iframe.src = 'data:text/html;charset=utf-8,';//+ encodeURI(html);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.loader = new PCDLoader();
        this.filePathName = './Zaghetto.pcd';
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.con = true;
        this.gui = new GUI();
        this.loaderfun=this.loaderfun.bind(this);
        this.handleControlNameLocal = this.handleControlNameLocal.bind(this);
        this.render = this.render.bind(this);
        this.init = this.init.bind(this);
      
        this.onWindowResize = this.onWindowResize.bind(this);
       
    }
   
    init(){
        //renderer init
        this.con =false;
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        // var iframe = document.getElementById("viewer").contentWindow.document;
        const a=document.createElement('h1');
        this.iframe.appendChild(a);
        document.body.appendChild(this.renderer.domElement);
        console.log(this.iframe,'render');

        
        //screen init
        // this.scene = new THREE.Scene();
 
        //camera init
        this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.01, 40 );
        this.camera.position.set( 0, 0, 1 );
        this.scene.add( this.camera );


        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.addEventListener( 'change', this.render  ); // use if there is no animation loop
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 10;

        // this.scene.add( new THREE.AxesHelper( 1 ) );
        this.loader = new PCDLoader();
        
		// this.loader.load( this.props.displayedItem.fileName, function ( points ) {
        this.loader.load( './Zaghetto.pcd', this.loaderfun);
        
		window.addEventListener( 'resize', this.onWindowResize() );
    
     }

     loaderfun(points){
        points.geometry.center();
            
        points.geometry.rotateX( Math.PI );
        // points.name =this.filePathName;
        console.log(1);
        this.scene.add(points);
     
        // Gui

       
        this.gui.add( points.material, 'size', 0.001, 0.01 ).onChange( this.render );
        this.gui.addColor( points.material, 'color' ).onChange( this.render );
        
        this.gui.open();
       
        this.render();
     }
//change the filepath to the filename
    handleControlNameLocal(event){
        const filePath = event.target.value; 
        var fileName=filePath.split('/');      
        this.filePathName=fileName[fileName.length-1];     
    }
   
    onWindowResize() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.render();

    }

    render(){
        console.log(4);
        if(this.con){
            console.log(5);
            this.init();
            
           
        }
        
       
       
        this.renderer.render( this.scene, this.camera );
        return 0;
    }
    
}
export default ControlPanel;
