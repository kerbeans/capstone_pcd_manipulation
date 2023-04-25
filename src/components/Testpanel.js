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
class Testpanel extends React.Component{
    con = true;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    controls = new OrbitControls( this.camera, this.renderer.domElement );
    transformControls = new TransformControls( this.camera, this.renderer.domElement );
    pointIndex = 0; 
    modelName = ''; 
    loader = new PCDLoader();
    gui = new GUI();
    folder = this.gui.addFolder('Camera control');
    pointControlFoler =  this.gui.addFolder('Point control');
    rotationFolder = this.gui.addFolder("Rotation Control");
    translationFolder = this.gui.addFolder('Translation Control');
    materialFolder = this.gui.addFolder('Material Control');
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
    axesHelper = new THREE.AxesHelper(5);
    //鼠标点击拾取点
    ray = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    pointArray = [];
    exist = false;

    constructor(props){
        super();
        this.init= this.init.bind(this);
        this.loaderfun = this.loaderfun.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.reqFullScreen = this.reqFullScreen.bind(this);
        this.mouseClickGetPoints = this.mouseClickGetPoints.bind(this);
        this.updateCamera = this.updateCamera.bind(this);
        this.addPoint = this.addPoint.bind(this);   
        this.removePoint =this.removePoint.bind(this);
        this.showInfaandmode =this.showInfaandmode.bind(this);
        this.transfertomesh = this.transfertomesh.bind(this);
        this.saveMeshAsGLTF = this.saveMeshAsGLTF.bind(this);
        this.updateModel = this.updateModel.bind(this);
        this.ownrender = this.ownrender.bind(this);
        this.updatepanelrotationpanel = this.updatepanelrotationpanel.bind(this);
        this.updateTranslationPanel = this.updateTranslationPanel.bind(this);
        this.switchNewmodel = this.switchNewmodel.bind(this);
        this.deleteModelbyName = this.deleteModelbyName.bind(this);
        this.addModel = this.addModel.bind(this);
        this.updateMaterialPanel = this.updateMaterialPanel.bind(this);
        this.saveAllmodel = this.saveAllmodel.bind(this);
        this.saveModelbyName = this.saveModelbyName.bind(this);
    }
    
    
    //初始化运行
    componentDidMount() {     
        console.log("asd")
        this.init();
    }

    init = () =>{ 
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.mount.appendChild( this.renderer.domElement );
        //this.camera.position.set( 5, 2, 8 );
        this.camera.lookAt( this.scene.position );
        this.camera.position.set( 0.9728517749133652, 1.1044765132727201, 0.7316689528482836 );
        this.controls.target.set( 0, 0.5, 0 );
        this.controls.update();
        this.controls.enablePan = true;
        this.controls.enableDamping = true;
        this.controls.addEventListener( 'change', this.ownrender );
        this.folder.add(this.camera, 'fov', 1, 180).onChange(this.updateCamera);
        this.folder.add(this.camera, 'near', 1, 200).onChange(this.updateCamera);
        this.folder.add(this.camera, 'far', 1, 200).onChange(this.updateCamera);
        const name = 'horse'
        //this.loader.load( 'http://localhost:3000/horse.pcd', (points) => this.loaderfun(points, name))
        this.modelName = name;
        //this.renderer.domElement.addEventListener("click",this.mouseClickGetPoints);
        this.scene.background = new THREE.Color( 0x000000 );
        this.scene.add(this.camera);
        this.scene.add(this.axesHelper);
        this.showInfaandmode();
        this.addPointFun();
        console.log(this.transformControls)
        //window.addEventListener('dblclick',this.reqFullScreen);
        //window.addEventListener( 'resize', this.onWindowResize);
        this.gui.open();
        this.renderer.setSize( window.innerWidth*0.8, window.innerHeight );
        this.ownrender();
    }
    
    /*update model in the scene*/
    updateModel = (modelname) => {
        this.scene.remove(this.getModelbyName(this.modelName));
        this.modelName = modelname;
        this.loader.load( 'http://localhost:3000/'+modelname+'.pcd', (points) => this.loaderfun(points, modelname))
    } 

    //设置点的属性，并用gui控制模型的属性。
    loaderfun = (points,name) => {
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
            this.exist = true;
        }
        else{
            this.switchNewmodel(name);
        }
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
        const newmodel = this.getModelbyName(newname);

        if( newmodel ){
            this.modelName = newname;
            this.translationControl.x = newmodel.position.x;
            this.translationControl.y = newmodel.position.y;
            this.translationControl.z = newmodel.position.z;
            this.rotationControl.x = newmodel.rotation.x;
            this.rotationControl.y = newmodel.rotation.y;
            this.rotationControl.z = newmodel.rotation.z;
            this.materialControl.color = newmodel.material.color;
            this.materialControl.size = newmodel.material.size;
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
    saveAllmodel = () =>{
        var vertices = []
        for(var i = 0; i < this.pointArray.length; i++){
            var points = this.getModelbyName(this.pointArray[i]).geometry.getAttribute('position').array;
            vertices = [...vertices, ...points];
        }
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
        const fileName = new Date();
        link.download =  fileName.toString() + '.pcd';
        link.click();
        URL.revokeObjectURL(url);
    }

    saveAsmesh = () => {
        var vertices = []
        for(var i = 0; i < this.pointArray.length; i++){
            var points = this.getModelbyName(this.pointArray[i]).geometry.getAttribute('position').array;
            vertices = [...vertices, ...points];
        }
        console.log(vertices)

    }
    
    saveModelbyName = () => {
        const points = this.getModelbyName(this.modelName);
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
    

    //添加点
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
    };


    //鼠标点击拾取点
    mouseClickGetPoints = (event) => {
        let px = this.renderer.domElement.getBoundingClientRect().left;
        let py = this.renderer.domElement.getBoundingClientRect().top;
        this.mouse.x =((event.clientX - px) / this.renderer.domElement.offsetWidth) * 2 - 1;    
        this.mouse.y =-((event.clientY - py) / this.renderer.domElement.offsetHeight) * 2 + 1;    
        this.ray.setFromCamera(this.mouse, this.camera);
        this.intersects = this.ray.intersectObjects(this.scene.children, true);
        
        if(this.intersects.length>0){
            this.pointIndex = this.intersects[0].index;
            this.pointGUI = this.intersects[0].point;
            window.updateGUI(this.pointGUI);           
        }else{
            this.pointGUI = {x:0,y:0,z:0};
            window.updateGUI(this.pointGUI);
        }
        
        this.removePoint();
        //console.log(this.scene.children[5].geometry.attributes.position.array);  
        //console.log(this.scene.children[5].geometry.attributes.position);
        //this.saveMeshAsGLTF(this.transfertomesh(this.array))
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
    
    //删除点
    removePoint=() =>{
        const position = this.getModelbyName(this.modelName).geometry.attributes.position.array;
        const newPosition = new Float32Array(position.length - 3);

        newPosition.set(position.slice(0,this.pointIndex * 3));
        newPosition.set(position.slice((this.pointIndex + 1) * 3), this.pointIndex * 3);

        this.getModelbyName(this.modelName).geometry.setAttribute('position', new THREE.BufferAttribute(newPosition, 3));
        this.getModelbyName(this.modelName).geometry.setDrawRange(0, newPosition.length / 3);
        this.getModelbyName(this.modelName).geometry.computeBoundingBox();
        this.ownrender();
    }

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
    }

    transfertomesh(points){
        const delaunay = Delaunator.from(points);

        // 创建Three.js几何体
        const geometry = new THREE.BufferGeometry();

        // 设置顶点数据
        const vertices = new Float32Array(points);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // 设置索引数据
        const indices = new Uint32Array(delaunay.triangles);
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        // 创建Three.js网格
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    saveMeshAsGLTF(mesh) {
        console.log("asdasd")
        const exporter = new GLTFExporter();
        exporter.parse(mesh, (gltf) => {
          const blob = new Blob([JSON.stringify(gltf)], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'mesh.gltf';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    }

    componentWillUnmount() {
        this.mount.removeChild(this.renderer.domElement);
    }
    
    //渲染更新
    ownrender(){
        this.renderer.render(this.scene, this.camera); 
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("TestPanel componentDidUpdate");
        console.log("Previous props:", prevProps);
        console.log("Current props:", this.props);
        console.log("Previous state:", prevState);
        console.log("Current state:", this.state);
        if (prevProps.workingFiles !== this.props.workingFiles) {
            for(var i = 0; i < this.props.workingFiles.length; i++){
                //字符串遇到. 分割
                var model = this.props.workingFiles[i].fileName.split(".")[0];
                if(this.pointArray.includes(model)){
                    continue;
                }
                else{
                    this.loader.load( 'http://localhost:3000/'+model+'.pcd', (points) => this.loaderfun(points, model))
                    this.pointArray.push(model);
                    console.log(this.scene.children)
                }
            }
        }
        if (prevProps.checkFiles != this.props.checkFiles) {
            if(this.props.checkFiles != null){
                this.modelName = this.props.checkFiles.fileName.split(".")[0];
                this.switchNewmodel(this.modelName);
                this.controls.target.copy(this.getModelbyName(this.modelName).position)
                this.transformControls.attach(this.getModelbyName(this.modelName));
            }
        }
    };
    
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