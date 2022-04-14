import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

let mixer;
let trooper;

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xABCBFF);
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);


document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);


const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xB50000});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const box2Geometry = new THREE.BoxGeometry(4,4,4);
const box2Material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
const box2 = new THREE.Mesh(box2Geometry, box2Material);
scene.add(box2);
box2.position.set(0, 15, 10);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({color: 0xC7F5FF,
side: THREE.DoubleSide});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({color: 0xFFC7D2, wireframe: false});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);

sphere.castShadow  = true; 

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight);
// scene.add(dLightHelper, 5);

const spotlight = new THREE.SpotLight(0xFFFFFF);
scene.add(spotlight);
spotlight.position.set(-100, 100, 0);
spotlight.castShadow = true;
spotlight.angle = 0.2;

const spotLightHelper = new THREE.SpotLightHelper(spotlight);
scene.add(spotLightHelper);

// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);

scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

const assetLoader = new GLTFLoader();

// assetLoader.load('./eve.fbx', (fbx) => {

//   fbx.scale.setScalar(0.1);
//   scene.add(fbx);

// });


assetLoader.load('./dancing_stormtrooper/scene.gltf', (loadedAsset) => {

  trooper = loadedAsset;
  const model = loadedAsset.scene;
  const animations = loadedAsset.animations;

  console.log(loadedAsset.animations);
  mixer = new THREE.AnimationMixer( model );
  
  // mixer.clipAction( animations[0] ).play();

  const clip = THREE.AnimationClip.findByName( animations, 'mixamo.com');
  const action = mixer.clipAction( clip );
  action.play();

  // animations.forEach( (clip) => {

  //   mixer.clipAction( clip ).play();

  // })

  scene.add(model);
  console.log(animations);
  model.position.set(-12, 4, 10);

}, undefined, (error) => {
  console.error(error);
});

const gui = new dat.GUI();
const options = {
    sphereColor: '#ffffff',
    wireframe: false,
    speed: 0.01,
    angle: 0.2,
    penumbra: 0,
    intensity: 1
};

gui.addColor(options, 'sphereColor').onChange((e) => {
  sphere.material.color.set(e);
});

gui.add(options, 'wireframe').onChange((e) => {
    sphere.material.wireframe = e;
});

gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0,  1);

let step = 0;
let robot_step = 0;

const mousePosition = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {

  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = (e.clientY / window.innerHeight) * 2 + 1;

});

const rayCaster = new THREE.Raycaster();

const sphereId = sphere.id;
box2.name = 'theBox';

function animate(time) {

  const delta = new THREE.Clock().getDelta();

  if ( mixer ) mixer.update( delta );

  box.rotation.x = time / 1000;
  box.rotation.y = time / 1000;

  step += options.speed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));

  robot_step += 0.01;


  spotlight.angle = options.angle;
  spotlight.penumbra = options.penumbra;
  spotlight.intensity = options.intensity;
  spotLightHelper.update();

  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);

  // intersects.forEach((current) => {

  
  //   if(current.object.id === sphereId) {
  //     console.log('found' + intersects[i].object.id === sphereId);

  //     intersects[i].object.material.color.set(0xFFFFFF); 

  //   }

  //   if(current.object.name === 'theBox') {

  //     intersects[i].object.rotation.x = time / 1000;
  //     intersects[i].object.rotation.y = time / 1000;

  //   }
  // });

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

