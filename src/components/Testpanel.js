import React from "react";
import * as THREE from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { PCDLoader } from '../../node_modules/three/examples/jsm/loaders/PCDLoader.js';
import { GUI } from '../../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';

class Testpanel extends React.Component{

    constructor(){
        super();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.renderer = new THREE.WebGLRenderer();
        this.loader = new PCDLoader();
        this.gui = new GUI();
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.ownrender = this.ownrender.bind(this);
        this.loaderfun = this.loaderfun.bind(this);
    }
    componentDidMount() {
        this.init()
    }

    init = () =>{
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.mount.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
        //this.camera.position.set( 0, 10, 20 );
        //this.camera.lookAt(0, 0, 0);
        this.scene.add( this.camera );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.controls.addEventListener( 'change', this.ownrender );
        this.controls.minDistance = 0.5;
        this.controls.maxDistance = 100;

        this.loader.load( 'http://localhost:3000/horse.pcd', this.loaderfun);
        console.log(this.loader)
        window.addEventListener( 'resize', this.onWindowResize() );
        console.log("asd1q2we12")
    }

    loaderfun = (points) => {
        points.geometry.center(0,0,0);
        points.geometry.rotateX( Math.PI );
        console.log(points);
        // points.name =this.filePathName;
        console.log("asdasd")
        this.scene.add(points);
        var middle = new THREE.Vector3();
        points.geometry.computeBoundingBox();
        points.geometry.boundingBox.getCenter(middle);
        points.applyMatrix4(
            new THREE.Matrix4().makeTranslation(
                -middle.x,
                -middle.y,
                -middle.z
            )
        );
        // 比例
        var largestDimension = Math.max(
            points.geometry.boundingBox.max.x,
            points.geometry.boundingBox.max.y,
            points.geometry.boundingBox.max.z
        );
        this.camera.position.y = largestDimension * 1;
        this.ownrender();
        this.gui.add( points.material, 'size', 0.001, 100 ).onChange( this.ownrender );
        this.gui.addColor( points.material, 'color' ).onChange( this.ownrender );
        this.gui.open();

    }

    /*
    init = () => {
        //const scene =  new THREE.Scene()
        const camera = new THREE.PerspectiveCamera( 75, this.mount.clientWidth / this.mount.clientHeight, 0.1, 1000 );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        const loader = new PCDLoader(new THREE.LoadingManager())
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        scene.add( camera );
        const controls = new OrbitControls( camera, renderer.domElement );
        controls.minDistance = 0.5;
        controls.maxDistance = 10;
        controls.addEventListener( 'change', this.ownrender );
        loader.load( 'Zaghetto.pcd', function ( points ) {
            scene.add( points );
            this.ownrender();
        } );


        renderer.setSize(this.mount.clientWidth, this.mount.clientHeight );
        this.mount.appendChild( renderer.domElement );
        camera.position.z = 5;
        //this.createCube();
        //this.animate();
        this.renderer.render(this.scene, this.camera);
    }
    createCube = () => {
      const geometry = new THREE.BoxGeometry( 1, 2, 1, 4 );
      const material = new THREE.MeshBasicMaterial( { color: 0x00ff02 } );
      const cube = new THREE.Mesh( geometry, material );
      this.cube = cube
      this.scene.add( cube );
    }

    /*
    animate =() => {
        requestAnimationFrame( this.animate );
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.renderer.render( this.scene, this.camera );
    }*/

    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.ownrender();
    }

    componentWillUnmount() {
        this.mount.removeChild(this.renderer.domElement)
    }

    ownrender(){
        //console.log(this.renderer)
        console.log(this.camera.position);
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <div style={{width: '400px', background:'#887' }}>
            <div
                id= "canvas"
                style={{width: '100%', background:'#887' }}
                ref={(mount) => { this.mount = mount }}
            >
            </div>
            </div>
        );
    }
}

export default Testpanel;