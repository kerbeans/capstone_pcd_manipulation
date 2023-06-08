import React from "react";
import * as THREE from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { PCDLoader } from '../../node_modules/three/examples/jsm/loaders/PCDLoader.js';
import { GUI } from '../../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { GLTFExporter } from '../../node_modules/three/examples/jsm/exporters/GLTFExporter.js';
import {DragControls} from '../../node_modules/three/examples/jsm/controls/DragControls.js';
import {TransformControls} from '../../node_modules/three/examples/jsm/controls/TransformControls.js';
import Delaunator from 'delaunator';
import { getTransitionName } from "antd/es/_util/motion.js";

const GRAPHQL_SERVER_URL = 'http://155.138.208.234:5000/graphql';


class Testpanel extends React.Component{
    con = true;
    pickedPoint = new THREE.Vector3(0,0,0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    x_camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 1000);
    y_camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 1000);
    z_camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    controls = new OrbitControls( this.camera, this.renderer.domElement );
    transformControls = new TransformControls( this.camera, this.renderer.domElement );
    pointIndex = -1; 
    modelName = ''; 
    loader = new PCDLoader();
    gui = new GUI();
    folder = this.gui.addFolder('Camera control');
    newPointFolder = this.gui.addFolder('Add and Delete');
    pointControlFoler =  this.gui.addFolder('Point control');
    rotationFolder = this.gui.addFolder("Rotation Control");
    translationFolder = this.gui.addFolder('Translation Control');
    materialFolder = this.gui.addFolder('Material Control');
    scaleFolder = this.gui.addFolder('Scale Control');

    guiControls = {
        x:0,
        y:0,
        z:0,
        addPoint: function () {
            this.addPoint(this.guiControls.x, this.guiControls.y, this.guiControls.z);
        },        
    };
    translationControl = {
        x: 0,
        y: 0,
        z: 0
      };      
    scaleControl = {
        scale: 1
    };
    rotationControl = { x: 0, y: 0, z: 0 };
    showPointPosition = {position_x:0,position_y:0,position_z:0};
    materialControl = {
        color: 0xffffff,
        size: 0.005,
      };
    pointInfor = {
        x:this.showPointPosition.position_x,
        y:this.showPointPosition.position_y,
        z:this.showPointPosition.position_z,
    }
    //坐标轴
    axesHelper = new THREE.AxesHelper(1e5);
    newPointCoordinate = new THREE.Vector3(0,0,0);
    newPoint = {
        point: new THREE.Points(),
        x: 0,
        y: 0,
        z: 0,
        flag: false,
        defaultp: new THREE.Vector3(0,0,0),
        create: function(scene) {
            let geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0], 3));
            let material = new THREE.PointsMaterial({color: new THREE.Vector3(1,1,1), size: 1});
            this.point.material = material;
            this.point.geometry = geometry;
            scene.add(this.point);
            this.point.visible = false;
        },
        addnew: function(add) {
            add(this.point.position.x, this.point.position.y, this.position.z);
        },
        update: function(x,y,z) {
            let position = this.point.geometry.getAttribute('position');
            position.array[0] = this.defaultp.x + x;
            position.array[1] = this.defaultp.y + y;
            position.array[2] = this.defaultp.z + z;
            position.needsUpdate = true;
        },
        show: function(x,y,z) {
            let position = this.point.geometry.getAttribute('position');
            position.array[0] = x;
            position.array[1] = y;
            position.array[2] = z;
        },
        hide: function() {
            this.point.visible = false;
        },
    };

    //鼠标点击拾取点
    ray = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    pointArray = [];
    exist = false;
    candelete = false;
    constructor(props){
        super();
        this.init= this.init.bind(this);
        this.loaderfun = this.loaderfun.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.reqFullScreen = this.reqFullScreen.bind(this);
        this.mouseClickGetPoints = this.mouseClickGetPoints.bind(this);
        this.updateCamera = this.updateCamera.bind(this);
        //this.addPoint = this.addPoint.bind(this);   
        this.selectPoint =this.selectPoint.bind(this);
        this.showInfaandmode =this.showInfaandmode.bind(this);
        this.transfertomesh = this.transfertomesh.bind(this);
        this.saveMeshAsGLTF = this.saveMeshAsGLTF.bind(this);
        this.ownrender = this.ownrender.bind(this);
        this.updatepanelrotationpanel = this.updatepanelrotationpanel.bind(this);
        this.updateTranslationPanel = this.updateTranslationPanel.bind(this);
        this.updateScalePanel = this.updateScalePanel.bind(this);
        this.switchNewmodel = this.switchNewmodel.bind(this);
        this.deleteModelbyName = this.deleteModelbyName.bind(this);
        this.addModel = this.addModel.bind(this);
        this.updateMaterialPanel = this.updateMaterialPanel.bind(this);
        this.saveAllmodel = this.saveAllmodel.bind(this);
        this.saveModelbyName = this.saveModelbyName.bind(this);
        this.saveAsimage = this.saveAsimage.bind(this);
        this.handleresize = this.handleresize.bind(this);
        this.loadmodel = this.loadmodel.bind(this);
        this.updatemodel = this.updatemodel.bind(this);
        this.showaxis = this.showaxis.bind(this);
        this.submittoserver = this.submittoserver.bind(this);
        this.updatemodelbypoints = this.updatemodelbypoints.bind(this);
        this.generatefilename = this.generatefilename.bind(this);
        this.loadlocalfile = this.loadlocalfile.bind(this);
        this.deleteworkingfile = this.deleteworkingfile.bind(this);
        this.addlocalpoint = this.addlocalpoint.bind(this);
        this.updatemodelbymesh = this.updatemodelbymesh.bind(this);
        this.removePoint = this.removePoint.bind(this);
        this.addPoint = this.addPoint.bind(this);
        this.addPointShow = this.addPointShow.bind(this);
        this.addPointFunc = this.addPointFunc.bind(this);
        this.getPan = this.getPan.bind(this);
        this.deletePoint = this.deletePoint.bind(this);
    }
    
    
    //初始化运行
    componentDidMount() {     
        console.log("asd")
        this.init();
    }

    init = () =>{ 
        this.pointControlFoler.domElement.style.display = 'none'
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.mount.appendChild( this.renderer.domElement );
        //this.camera.position.set( 5, 2, 8 );
        this.camera.lookAt( this.scene.position );
        this.camera.position.set( 0.9728517749133652, 1.1044765132727201, 0.7316689528482836 );
        this.controls.target.set( 0, 0 ,0 );
        this.controls.update();
        this.addPointShow();
        this.controls.enablePan = true;
        this.controls.enableDamping = true;
        this.controls.addEventListener( 'change', this.ownrender );
        this.scene.background = new THREE.Color( 0xa0a0a0 );
        const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
        hemiLight.position.set( 0, 20, 0 );
        this.scene.add( hemiLight );
        const dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 3, 10, 10 );
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 2;
        dirLight.shadow.camera.bottom = - 2;
        dirLight.shadow.camera.left = - 2;
        dirLight.shadow.camera.right = 2;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 40;
        this.scene.add( dirLight );
        this.folder.add(this.camera, 'fov', 1, 180).onChange(this.updateCamera);
        this.folder.add(this.camera, 'near', 1, 200).onChange(this.updateCamera);
        const name = 'horse'
        //this.loader.load( 'http://localhost:3000/horse.pcd', (points) => this.loaderfun(points, name))
        this.modelName = name;
        this.renderer.domElement.addEventListener("click",this.mouseClickGetPoints);
        this.scene.add(this.camera);
        this.scene.add(this.axesHelper);
        //this.newPointFolder.domElement.style.display = 'none';
        this.showInfaandmode();
        console.log(this.transformControls)
        //window.addEventListener('dblclick',this.reqFullScreen);
        window.addEventListener( 'resize', this.handleresize);
        this.gui.open();
        this.gui.domElement.style.display = 'none';
        this.renderer.setSize( window.innerWidth*0.80, window.innerHeight );
        this.scene.add(this.x_camera);
        this.scene.add(this.y_camera);
        this.scene.add(this.z_camera);
        this.x_camera.position.set( 0, 0 ,50 );
        this.z_camera.position.set( 50, 0 ,0 );
        this.y_camera.position.set( 0, 50 ,0 );
        this.x_camera.lookAt( 0,0,0 );
        this.z_camera.lookAt( 0,0,0 );
        this.y_camera.lookAt( 0,0,0 );
        this.ownrender();
    }
    
    deletePoint() {
        if(this.pointIndex != -1){
            const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
            const newPosition = new Float32Array(position.length - 3);
            newPosition.set(position.slice(0,this.pointIndex * 3));
            newPosition.set(position.slice((this.pointIndex + 1) * 3), this.pointIndex * 3);
            this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
            this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
            this.getModelbyName(this.modelName).geometry.computeBoundingBox();
            this.ownrender();
            this.pointIndex = -1;
        }
    }

    addPointFunc() {
        this.newPoint.point.visible = !this.newPoint.point.visible;
        this.ownrender();
    }

    getPan(view) {
        if(view == 'x') {
            this.renderer.render(this.scene, this.x_camera);
        }
        else if(view == 'y') {
            this.renderer.render(this.scene, this.y_camera);
        }
        else if(view == 'z') {
            this.renderer.render(this.scene, this.z_camera);
        }
        this.renderer.render(this.scene, this.x_camera);
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        //const blob = new Blob([dataURL], { type: 'image/png' });
        //const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = view + '_panview.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.renderer.render(this.scene, this.camera);
    }

    addPointShow() {
        this.newPoint.create(this.scene);
        this.newPointFolder.add(this, 'addPointFunc').name('Create Point');
        this.newPointFolder.add(this, 'addPoint').name('Add to Mesh');
        this.newPointFolder.add(this.newPoint, 'x', -10, 10).onChange(() => {
            this.newPoint.update(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            console.log(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            console.log(this.newPoint.point);
            this.ownrender();
          });
          
        this.newPointFolder.add(this.newPoint, 'y', -50, 50).onChange(() => {
            this.newPoint.update(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            console.log(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            this.ownrender();
          });
          
        this.newPointFolder.add(this.newPoint, 'z', -50, 50).onChange(() => {
            this.newPoint.update(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            console.log(this.newPoint.x, this.newPoint.y, this.newPoint.z);
            this.ownrender();
          });   
        this.newPointFolder.add(this, 'deletePoint').name('Delete Point');
    }

    async addlocalpoint (points, name){
        await this.updatemodelbymesh(points,name);
        //this.props.addModel(name,points);
    }

    handleresize = () =>{
        this.renderer.setSize( window.innerWidth*0.85, window.innerHeight );
        this.ownrender();
    }
    /*update model in the scene*/

    async loadlocalfile(bin){
        console.log("dasd",bin)
        this.loader.parse(bin, (points) => {
            const material = new THREE.PointsMaterial({
                size: 0.1, // 您可以根据需要调整点的大小
                color: 0xff0000, // 设置点的颜色为红色
              });
            points.name = "asdasd"
            points.material = material; 
            points.geometry.center(0,0,0);
            points.geometry.rotateX( Math.PI );
            console.log("asdqe")
            this.scene.add(points);
            console.log(this.scene);
            this.ownrender();
            // 更新Three.js渲染器以显示点云
          });
        //this.loader.load('C:\\Users\\ShaoxingWang\\Downloads\\Zaghetto.pcd', (points) => this.loaderfun(points, name));
    }

    //设置点的属性，并用gui控制模型的属性。
    loaderfun = (points,name) => {
        console.log(points)
        points.name = name
        points.geometry.center(0,0,0);
        points.geometry.rotateX( Math.PI );
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
        this.points = points;
        this.modelName = name;
        if(this.exist === false){
            this.updateMaterialPanel();
            this.updatepanelrotationpanel();
            this.updateTranslationPanel();
            this.updateScalePanel();
            this.exist = true;
        }
        else{
            this.switchNewmodel(name);
        }
        this.ownrender();
    }

    deleteworkingfile = () =>{
        const name = this.modelName;
            this.scene.remove(this.getModelbyName(this.modelName));
            this.modelName = this.pointArray[0].length === 0? '':this.pointArray[0]; 
            if(this.modelName !== ''){
                this.switchNewmodel(this.modelName);
            }
            this.pointArray = this.pointArray.filter(item => item !== name);
            if(this.pointArray.length === 0){
                this.gui.domElement.style.display = 'none';
            }
            this.props.setId(this.modelName);
            this.ownrender();
    }

    updatepanelrotationpanel(){
    const points = this.getModelbyName(this.modelName);
    this.rotationFolder
        .add(this.rotationControl, "x", -Math.PI, Math.PI, 0.01)
        .name("X Axis")
        .onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            if (points) {
            points.rotation.x = value;
            this.ownrender();
    }
    });
    this.rotationFolder
      .add(this.rotationControl, "y", -Math.PI, Math.PI, 0.01)
      .name("Y Axis")
      .onChange((value) => {
        const points = this.getModelbyName(this.modelName);
        if (points) {
          points.rotation.y = value;
          this.ownrender();
        }
    });
    this.rotationFolder
      .add(this.rotationControl, "z", -Math.PI, Math.PI, 0.01)
      .name("Z Axis")
      .onChange((value) => {
        const points = this.getModelbyName(this.modelName);
        if (points) {
          points.rotation.z = value;
          this.ownrender();
        }
      });
    }

    switchNewmodel = (newname) => {
        console.log(newname)
        const newmodel = this.getModelbyName(newname);
        const oldmodel = this.getModelbyName(this.modelName);
        console.log(newmodel,oldmodel)
        let colors = new Float32Array(oldmodel.geometry.getAttribute('position').count * 3);
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = 1;     // r
            colors[i + 1] = 1; // g
            colors[i + 2] = 1; // b
        }
        oldmodel.material = new THREE.PointsMaterial({ color: oldmodel.material.color, size: 5 , vertexColors: true})
        oldmodel.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        oldmodel.geometry.getAttribute('color').needsUpdate = true;
        this.pointIndex = -1;
        //判断points.material.color.r是否为0，为0，r=1，否则r=0
        if( newmodel !== undefined && newmodel !== null ){
            this.modelName = newname;
            this.translationControl.x = newmodel.position.x;
            this.translationControl.y = newmodel.position.y;
            this.translationControl.z = newmodel.position.z;
            this.rotationControl.x = newmodel.rotation.x;
            this.rotationControl.y = newmodel.rotation.y;
            this.rotationControl.z = newmodel.rotation.z;
            this.materialControl.color = newmodel.material.color;
            this.materialControl.size = newmodel.material.size;
            this.scaleControl.x = newmodel.scale.x;
            this.scaleControl.y = newmodel.scale.y;
            this.scaleControl.z = newmodel.scale.z;
        }
        else{
            //this.gui.domElement.style.display = 'none';
        }
    }

    updateModelname = (newname) => {
        this.modelName = newname;
    }

    deleteModelbyName = (name) => {
        this.scene.remove(this.getModelbyName(name));
    }

    addModel = (model) => {
        this.loader.load( 'http://localhost:3000/'+this.modelname+'.pcd', (points) => this.loaderfun(points, model))
    }


    updateMaterialPanel = () => {
        this.materialFolder.addColor(this.materialControl, 'color').name('Color').onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            points.material.color.set(value);
            this.ownrender();
        });
        this.materialFolder.add(this.materialControl, 'size', 0.001, 10, 0.001).name('Point Size').onChange((value) => {
          const points = this.getModelbyName(this.modelName);
          points.material.size = value;
          this.ownrender();
        });
    }

    updateScalePanel = () => {
        const points = this.getModelbyName(this.modelName);
        this.scaleFolder.add(this.scaleControl, 'scale', 0.1, 10, 0.1).name('X').onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            points.scale.set(value,value,value);
            this.ownrender();
          });
    }

    updateTranslationPanel = () => {
        const points = this.getModelbyName(this.modelName);
        this.translationFolder.add(this.translationControl, 'x', -100, 100, 0.1).name('X').onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            points.position.x = value;
            this.ownrender();
            console.log(points.position.x)
            console.log(value)
          });
        this.translationFolder.add(this.translationControl, 'y', -100, 100, 0.1).name('Y').onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            this.ownrender();
            points.position.y = value;
          });
          
          this.translationFolder.add(this.translationControl, 'z', -100, 100, 0.1).name('Z').onChange((value) => {
            const points = this.getModelbyName(this.modelName);
            this.ownrender();
            points.position.z = value;
          });
    }
    //gui控制相机，相机矩阵更新
    updateCamera=() =>{
        this.camera.updateProjectionMatrix();
        this.ownrender();
    } 
    
    /*get model by its name, return a model*/
    getModelbyName = (name) => {
        return this.scene.getObjectByName(name);
    }

    
    //控制相机展示范围和窗口大小
    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        this.renderer.setPixelRatio(window.devicePixelRatio)//这里设置成我们display窗口大小
        this.ownrender();
    }

    //双击全屏和退出全屏
    reqFullScreen =() =>{
        const fullScreenElement = document.fullscreenElement;
        if(!fullScreenElement){
            this.renderer.domElement.requestFullscreen();
        }else{
            document.exitFullscreen();
        }
   
    }

    saveAsimage = () =>{
        this.renderer.render(this.scene, this.camera);
        const imageDataUrl = this.renderer.domElement.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataUrl;
        downloadLink.download = 'rendered_scene.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    saveAllmodel = () =>{
        var vertices = []
        for(var i = 0; i < this.pointArray.length; i++){
            var points = this.getModelbyName(this.pointArray[i]).geometry.getAttribute('position').array;
            vertices = [...vertices, ...points];
        }
        if(vertices.length ===  0){
            alert('no model to save');
        }
        else{
            const numPoints = vertices.length/3;
            let pcdContent = `VERSION .7
                FIELDS x y z
                SIZE 4 4 4
                TYPE F F F
                COUNT 1 1 1
                WIDTH ${numPoints}
                HEIGHT 1
                VIEWPOINT 0 0 0 1 0 0 0
                POINTS ${numPoints}
                DATA ascii\n`;
            for (let i = 0; i < vertices.length; i += 3) {
                pcdContent += `${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`;
              }
            const blob = new Blob([pcdContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download =  this.generatefilename() + '.pcd';
            link.click();
            URL.revokeObjectURL(url);
        }
    }

    saveAsmesh = async (name) => {
        if(this.getModelbyName(name).visible===true){
            var vertices = this.getModelbyName(name).geometry.getAttribute('position').array;
            const mesh = await this.transfertomesh(vertices);
            mesh.name = name + 'mesh'
            this.scene.add(mesh);
            this.getModelbyName(name).visible = false;
            this.gui.domElement.style.display = 'none'
            this.ownrender();
        }
        else{
            this.scene.remove(this.getModelbyName(name+'mesh'))
            this.getModelbyName(name).visible=true;
            this.gui.domElement.style.display = 'block'
            this.ownrender();

        }
    }
    
    saveModelbyName = () => {
        const points = this.getModelbyName(this.modelName);
        if(points!==undefined){
            const geometry = points.geometry;
            const vertices = geometry.getAttribute('position').array;
            const numPoints = vertices.length / 3;
            
            let pcdContent = `VERSION .7
                FIELDS x y z
                SIZE 4 4 4
                TYPE F F F
                COUNT 1 1 1
                WIDTH ${numPoints}
                HEIGHT 1
                VIEWPOINT 0 0 0 1 0 0 0
                POINTS ${numPoints}
                DATA ascii\n`;
            
            for (let i = 0; i < vertices.length; i += 3) {
              pcdContent += `${vertices[i]} ${vertices[i + 1]} ${vertices[i + 2]}\n`;
            }
            const blob = new Blob([pcdContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.modelName + '.pcd';
            link.click();
            URL.revokeObjectURL(url);
        }
        else{
            alert("no model to save");
        }
    }
    

    //添加点
    /*
    addPoint = (x, y, z) => {
        const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
        const newPosition = new Float32Array(position.length + 3);

        newPosition.set(position);
        newPosition[position.length]=x;
        newPosition[position.length+1]=y;
        newPosition[position.length+2]=z;
        

        this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
        this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
        this.getModelbyName(this.modelName).geometry.computeBoundingBox();
        this.ownrender();
    };*/


    //鼠标点击拾取点
    mouseClickGetPoints = (event) => {
        let px = this.renderer.domElement.getBoundingClientRect().left;
        let py = this.renderer.domElement.getBoundingClientRect().top;
        this.mouse.x =((event.clientX - px) / this.renderer.domElement.offsetWidth) * 2 - 1;    
        this.mouse.y =-((event.clientY - py) / this.renderer.domElement.offsetHeight) * 2 + 1;    
        this.ray.setFromCamera(this.mouse, this.camera);
        this.intersects = this.ray.intersectObjects(this.scene.children, true);
        /*
        console.log("section",this.intersects)
        let arrowHelper = new THREE.ArrowHelper(
            this.ray.ray.direction,  // 使用Raycaster的方向
            this.ray.ray.origin,    // 使用Raycaster的原点
            10000,                      // 长度，你可以根据需要调整
            0xffff00                 // 颜色，你可以根据需要调整
          );
          
          // 添加ArrowHelper到场景中
        this.scene.add(arrowHelper);
        */
        //this.newPointFolder.domElement.style.display = 'none';
        if(this.intersects.length>0){
            for(var i = 0; i < this.intersects.length; i++){
                if(this.intersects[i].object.name === this.modelName){
                    this.pointPosition = this.intersects[i].point;
                    this.pointIndex = this.intersects[i].index;
                    this.pointGUI = this.intersects[i].point;
                    this.selectPoint();
                    window.updateGUI(this.pointGUI);
                    this.ownrender();
                    break;
                }
            }
            //window.updateGUI(this.pointGUI);           
        }else{
            
        }
        //this.removePoint();
    }

    findPointIndex = ()=>{
        for(var i = 0 ;i < this.getModelbyName(this.modelName).geometry.attributes.position.array.length;i++){
            if (this.pointPosition[0] === this.getModelbyName(this.modelName).geometry.attributes.position.array[i]&&
                this.pointPosition[1] === this.getModelbyName(this.modelName).geometry.attributes.position.array[i+1]&&
                this.pointPosition[2] === this.getModelbyName(this.modelName).geometry.attributes.position.array[i+2]){
                    this.index = i;
                    console.log(this.index)
 
                }
        }
    }
    

    //拾取点后显示点的信息
    showInfaandmode() {
        const pointInfo = { x: 0, y: 0, z: 0 };
        const deletePoint={
            pointDelete : function () {
                this.pointGUI = {x:0,y:0,z:0};
                window.updateGUI(this.pointGUI);
                console.log(this.pointGUI);
                window.removePoint();
            }
            
        };

        this.pointControlFoler.add(pointInfo, 'x').listen();
        this.pointControlFoler.add(pointInfo, 'y').listen();
        this.pointControlFoler.add(pointInfo, 'z').listen();
        this.pointControlFoler.add(deletePoint, 'pointDelete').name('delete this point');
        // this.pointControlFoler.add({ deleteMode: false }, 'deleteMode').onChange((value) => (deleteMode = value));
        window.updateGUI = (point) => {
            pointInfo.x = point.x;
            pointInfo.y = point.y;
            pointInfo.z = point.z;
        };

        //删除点
        window.removePoint=() =>{
            const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
            const newPosition = new Float32Array(position.length - 3);
    
            newPosition.set(position.slice(0,this.pointIndex * 3));
            newPosition.set(position.slice((this.pointIndex + 1) * 3), this.pointIndex * 3);
    
            this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
            this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
            this.getModelbyName(this.modelName).geometry.computeBoundingBox();
            this.ownrender();
        }
    }
    
    //选择点
    selectPoint=() =>{
        console.log("click")
        let points = this.getModelbyName(this.modelName);
        console.log(points)
        let colors = new Float32Array(points.geometry.getAttribute('position').count * 3);
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = 1;     // r
            colors[i + 1] = 1; // g
            colors[i + 2] = 1; // b
        }
        points.material = new THREE.PointsMaterial({ color: points.material.color, size: points.material.size , vertexColors: true})
        points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        //判断points.material.color.r是否为0，为0，r=1，否则r=0
        let r = points.material.color.r === 0?1:1/points.material.color.r;
        let g = points.material.color.g === 0?1:1/points.material.color.g;
        let b = points.material.color.b === 0?1:1/points.material.color.b;
        points.geometry.getAttribute('color').setXYZ(this.pointIndex,r,g, b);
        points.geometry.getAttribute('color').needsUpdate = true;

        if(this.newPoint.flag === false){
            this.newPointFolder.domElement.style.display = "block";
            this.newPoint.flag = true;
            this.newPointFolder.x = 0;
            this.newPointFolder.y = 0;
            this.newPointFolder.z = 0;
            let point = new THREE.Vector3();
            let a = points.geometry.getAttribute('position').array;
            let matrix = points.matrixWorld;
            point.fromBufferAttribute(points.geometry.attributes.position, this.pointIndex);
            point.applyMatrix4(matrix);
            //this.newPoint.show(point.x,point.y,point.z);
            this.pickedPoint = new THREE.Vector3(point.x,point.y,point.z);
            //this.newPoint.defaultp = new THREE.Vector3(point.x,point.y,point.z);
        }
        else{
            this.newPointFolder.domElement.style.display = "block";
            let point = new THREE.Vector3();
            console.log(this.newPointFolder)
            this.newPointFolder.x = 0;
            this.newPointFolder.y = 0;
            this.newPointFolder.z = 0;
            let a = points.geometry.getAttribute('position').array;
            let matrix = points.matrixWorld;
            point.fromBufferAttribute(points.geometry.attributes.position, this.pointIndex);
            point.applyMatrix4(matrix);
            //this.newPoint.show(point.x,point.y,point.z);
            this.pickedPoint = new THREE.Vector3(point.x,point.y,point.z);
            //this.newPoint.defaultp = new THREE.Vector3(point.x,point.y,point.z);
        }
        //this.ownrender();
        /*
        const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
        const newPosition = new Float32Array(position.length - 3);

        newPosition.set(position.slice(0,this.pointIndex * 3));
        newPosition.set(position.slice((this.pointIndex + 1) * 3), this.pointIndex * 3);

        this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
        this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
        this.getModelbyName(this.modelName).geometry.computeBoundingBox();
        this.ownrender();*/
    }

    removePoint=() =>{
        if(this.pointIndex != -1){
            const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
            const newPosition = new Float32Array(position.length - 3);
            newPosition.set(position.slice(0,this.pointIndex * 3));
            newPosition.set(position.slice((this.pointIndex + 1) * 3), this.pointIndex * 3);
            this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
            this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
            this.getModelbyName(this.modelName).geometry.computeBoundingBox();
            this.ownrender();
            this.pointIndex = -1;
        }
    }

    /*
    addPointFun=()=>{
        const pointAdd = {
            x:0,
            y:0,
            z:0,
            addPoint: function () {
                    window.addPoint(pointAdd.x,pointAdd.y,pointAdd.z)
                
            },        
        };
        this.pointControlFoler.add(pointAdd, 'x').name("x of add point");
        this.pointControlFoler.add(pointAdd, 'y').name("y of add point");
        this.pointControlFoler.add(pointAdd, 'z').name("z of add point");
        this.pointControlFoler.add(pointAdd, 'addPoint').name("adding this point");
        window.addPoint=(x,y,z) =>{
            const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
            const newPosition = new Float32Array(position.length + 3);
    
            newPosition.set(position);
            newPosition[position.length]=x;
            newPosition[position.length+1]=y;
            newPosition[position.length+2]=z;
            
    
            this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
            this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
            this.getModelbyName(this.modelName).geometry.computeBoundingBox();
            this.ownrender();
        }
    }*/

    async transfertomesh(cloudpoints){
        const points = [];
        for (let i = 0; i < cloudpoints.length; i += 3) {
            points.push([cloudpoints[i], cloudpoints[i + 1], cloudpoints[i + 2]]);
        }

        const delaunay = Delaunator.from(points);

        // 创建Three.js几何体
        const geometry = new THREE.BufferGeometry();
    
        // 设置顶点数据
        geometry.setAttribute('position', new THREE.BufferAttribute(cloudpoints, 3));
    
        // 设置索引数据
        const indices = new Uint32Array(delaunay.triangles);
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
        // 创建Three.js网格
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        console.log("mesh", mesh);
        return mesh;
    }

    saveMeshAsGLTF(mesh) {
        const exporter = new GLTFExporter();

        // 配置选项
        const options = {
          trs: false,
          onlyVisible: true,
          truncateDrawRange: true,
          binary: false,
        };
      
        exporter.parse(mesh, (gltf) => {
          const blob = new Blob([JSON.stringify(gltf)], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'mesh.gltf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }, 100);
        }, options);
    }    

    componentWillUnmount() {
        this.mount.removeChild(this.renderer.domElement);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.workingFiles !== this.props.workingFiles) {
            if(prevProps.workingFiles.length < this.props.workingFiles.length){
                this.gui.domElement.style.display = "block";
                for(var i = 0; i < this.props.workingFiles.length; i++){
                    var model = this.props.workingFiles[i].fileName.split(".")[0];
                    if(this.pointArray.includes(model)){
                        continue;
                    }
                    else{
                        const points = await this.loadmodel(model);
                        const pointsGeometry = new THREE.BufferGeometry();
                        const positions = new Float32Array(points.length * 3);
                        for (let i = 0; i < points.length; i++) {
                            const point = points[i];
                            positions[i * 3] = point.x;
                            positions[i * 3 + 1] = point.y;
                            positions[i * 3 + 2] = point.z;
                        }
                        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                        const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 5 });
                        const pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
                        console.log("change", pointCloud);
                        pointCloud.name = model;
                        pointCloud.geometry.center(0,0,0);
                        pointCloud.geometry.rotateX( Math.PI );
                        var middle = new THREE.Vector3();
                        pointCloud.geometry.computeBoundingBox();
                        console.log(pointCloud)
                        pointCloud.geometry.boundingBox.getCenter(middle);
                        pointCloud.applyMatrix4(
                            new THREE.Matrix4().makeTranslation(
                                -middle.x,
                                -middle.y,
                                -middle.z
                            )
                        );
                        // 比例
                        var largestDimension = Math.max(
                            pointCloud.geometry.boundingBox.max.x,
                            pointCloud.geometry.boundingBox.max.y,
                            pointCloud.geometry.boundingBox.max.z
                        );
                        this.camera.position.y = largestDimension * 1;
                        this.modelName = model;
                        if(this.exist === false){
                            this.scene.add(pointCloud);
                            this.updateMaterialPanel();
                            this.updatepanelrotationpanel();
                            this.updateTranslationPanel();
                            this.updateScalePanel();
                            this.exist = true;
                        }
                        else{
                            this.scene.add(pointCloud);
                            this.switchNewmodel(model);
                        }
                        this.pointArray.push(model);
                        this.ownrender();
                    }
                }
            }
            else{
                const removedmodel = prevProps.workingFiles.filter(item => !this.props.workingFiles.includes(item))[0];
                if(this.getModelbyName(removedmodel.fileName.split(".")[0])!==undefined){
                    await this.updatemodel(removedmodel.fileName.split(".")[0])
                    this.scene.remove(this.getModelbyName(removedmodel.fileName.split(".")[0]));
                    this.pointArray = this.pointArray.filter(item => item !== removedmodel.fileName.split(".")[0]);
                    this.modelName = this.pointArray.length > 0 ? this.pointArray[0] : undefined;
                    this.ownrender();
                    if(this.pointArray.length === 0){
                        this.gui.domElement.style.display = "none";
                        this.ownrender();
                    }
                }
            }
        }
        if (prevProps.checkFiles != this.props.checkFiles) {
            if(this.props.checkFiles != null){
                this.modelName = this.props.checkFiles.split(".")[0];
                this.props.setId(this.modelName);
                this.switchNewmodel(this.modelName);
                this.candelete = true
                //this.controls.target.copy(this.getModelbyName(this.modelName).position)
                //this.transformControls.attach(this.getModelbyName(this.modelName));
            }
            else{
                this.candelete = false
            }
        }
    };
    
    // Network
    async updatemodelbymesh(mesh,name){
        const mutation = `
        mutation UploadFileMutation($userid: Int!,$pdInput: PointDataInput!) {
          uploadFile(userid: $userid, pointd: $pdInput)
        }
        `;
        const model = mesh;
        console.log("upload",model)
        if(model !== undefined){
            const points = model.geometry.getAttribute('position').array
            const pointCloudData = []
            for (let i = 0; i < points.length; i += 3) {
                    const obj = {
                      x: points[i],
                      y: points[i + 1],
                      z: points[i + 2]
                    };
                    pointCloudData.push(obj);
            }
            console.log(pointCloudData)
            const pdInput = {
                fileName: name + ".pcd",
                header: {
                  NOTE: "openvision4",
                  VERSION: ".7",
                  FIELDS: "x y z",
                  TYPE: "F F F",
                  COUNT: "1 1 1",
                  WIDTH: "30",
                  HEIGHT: "30",
                  VIEWPOINT: "0 0 0 1 0 0 0",
                  POINTS: pointCloudData.length,
                  DATA: "ascii",
                },
                pointCloudData,
            };
            const requestOptions = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  query: mutation,
                  variables: {
                    userid:this.props.userid,
                    pdInput:pdInput,
                  },
                }),
            };
            console.log(pdInput)
            const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
            const data = await response.json();
        }
        else{
            alert("no model")
        }
    }

    async updatemodel(name){
        const mutation = `
        mutation UploadFileMutation($userid: Int!,$pdInput: PointDataInput!) {
          uploadFile(userid: $userid, pointd: $pdInput)
        }
        `;
        console.log("demodel",name)
        const model = this.getModelbyName(name);
        console.log(this.scene)
        console.log("demodel",model)
        if(model !== undefined){
            const geometry = model.geometry;
            geometry.applyMatrix4(model.matrix);
            model.position.set(0, 0, 0);
            model.rotation.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            model.updateMatrix();
            geometry.attributes.position.needsUpdate = true;
            const updatedmodel = this.getModelbyName(name);
            const points = updatedmodel.geometry.getAttribute('position').array
            const pointCloudData = []
            for (let i = 0; i < points.length; i += 3) {
                    const obj = {
                      x: points[i],
                      y: points[i + 1],
                      z: points[i + 2]
                    };
                    pointCloudData.push(obj);
            }
            console.log(pointCloudData)
            const pdInput = {
                fileName: name + ".pcd",
                header: {
                  NOTE: "openvision4",
                  VERSION: ".7",
                  FIELDS: "x y z",
                  TYPE: "F F F",
                  COUNT: "1 1 1",
                  WIDTH: "30",
                  HEIGHT: "30",
                  VIEWPOINT: "0 0 0 1 0 0 0",
                  POINTS: pointCloudData.length,
                  DATA: "ascii",
                },
                pointCloudData,
            };
            const requestOptions = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  query: mutation,
                  variables: {
                    userid:this.props.userid,
                    pdInput:pdInput,
                  },
                }),
            };
            console.log(pdInput)
            const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
            const data = await response.json();
        }
        else{
            alert("no model")
        }
    }


    async loadmodel(name){
        console.log("users",this.props.userid)
        const mutation = `
            mutation mutationdownloadfile($userid: Int!,$fileName: String!) {
                downloadFile(userid: $userid, fileName: $fileName) {
                    pointCloudData {
                        x,y,z
                    }
                }
            }
            `;
        const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              query: mutation,
              variables: {
                fileName: name + ".pcd",
                userid: this.props.userid
              },
            }),
        };
        const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
        const data = await response.json();
        return data.data.downloadFile.pointCloudData;
    }

    async updatemodelbypoints(points){
        const mutation = `
        mutation UploadFileMutation($userid: Int!, $pdInput: PointDataInput!) {
          uploadFile(userid:$userid, pointd: $pdInput)
        }
        `;
        const pointCloudData = []
        for (let i = 0; i < points.length; i += 3) {
            const obj = {
              x: points[i],
              y: points[i + 1],
              z: points[i + 2]
            };
            pointCloudData.push(obj);
          }
        const pdInput = {
            fileName: this.generatefilename() + ".pcd",
            header: {
                NOTE: "openvision4",
                VERSION: ".7",
                FIELDS: "x y z",
                TYPE: "F F F",
                COUNT: "1 1 1",
                WIDTH: "30",
                HEIGHT: "30",
                VIEWPOINT: "0 0 0 1 0 0 0",
                POINTS: pointCloudData.length,
                DATA: "ascii",
              },
            pointCloudData,
        };
        const requestOptions = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              query: mutation,
              variables: {
                pdInput:pdInput,
                userid:this.props.userid
              },
            }),
        };
        const response = await fetch(GRAPHQL_SERVER_URL, requestOptions);
        const data = await response.json();
        console.log(data)
    }

    async submittoserver(){
        var vertices = []
        for(var i = 0; i < this.pointArray.length; i++){
            const model = this.getModelbyName(this.pointArray[i])
            const geometry = model.geometry;
            geometry.applyMatrix4(model.matrix);
            model.position.set(0, 0, 0);
            model.rotation.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            model.updateMatrix();
            geometry.attributes.position.needsUpdate = true;
            var points = this.getModelbyName(this.pointArray[i]).geometry.getAttribute('position').array;
            vertices = [...vertices, ...points];
        }
        if(vertices.length > 0){
            await this.updatemodelbypoints(vertices)
            this.props.updateList();
        }
    }

    // Utils
    generatefilename(){
        const min = 10000000;
        const max = 99999999;
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
    }

    ownrender(){
        this.renderer.render(this.scene, this.camera); 
    }

    // For Parent Class

    setCurrentModel(name){
        this.modelName = name;
    }

    showaxis(){
        this.axesHelper.visible = !this.axesHelper.visible;
        this.ownrender();
    }

    addPoint(){
        console.log("add");
        let points = this.getModelbyName(this.modelName);
        let pointsArray = points.geometry.getAttribute('position').array
        let tmp_p = this.newPoint.point.geometry.getAttribute('position').array;
        var localPosition = new THREE.Vector3(tmp_p[0], tmp_p[1], tmp_p[2]);
        var worldPosition = localPosition.applyMatrix4(this.newPoint.point.matrixWorld);
        let v = new THREE.Vector3(worldPosition.x, worldPosition.y, worldPosition.z);
        var localPosition = points.worldToLocal(v.clone());
        let newp = new Float32Array([localPosition.x, localPosition.y, localPosition.z])
        var newPositions = new Float32Array(pointsArray.length + newp.length);
        newPositions.set(pointsArray);
        newPositions.set(newp, pointsArray.length);
        //pointsArray = [...pointsArray, [this.newPoint.x, this.newPoint.y, this.newPoint.z]]
        let newAttribute = new THREE.BufferAttribute(newPositions, 3);
        points.geometry.setAttribute('position', newAttribute);
        points.geometry.attributes.position.needsUpdate = true;
        this.ownrender();
    }

    render(){
        console.log("child",this.props.workingFiles);
        console.log("TestPanel render");
        return (
            <div style={{width: '400px', background:'#887', position:'relative' }}>
            <div
                id= "canvas"
                style={{width: '100%', background:'#887', position: 'absolute', height: '100%', top:0 , left: 0 }}
                ref={(mount) => { this.mount = mount }}
            >
            </div>
            </div>
        );
    }
}

export default Testpanel;