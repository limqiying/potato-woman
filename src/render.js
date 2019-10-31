import * as THREE from 'three'
import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader';

let scene,
    renderer,
    camera,
    model, // Our character
    neck, // Reference to the neck bone in the skeleton
    waist, // Reference to the waist bone in the skeleton
    possibleAnims, // Animations found in our file
    mixer, // THREE.js animations mixer
    idle, // Idle, the default state our character returns to
    clock = new THREE.Clock(),
    leftOrRight = 0;
export {
    neck,
    waist,
    renderer
};

export function init() {
    const MODEL_PATH = './assets/models/gigiGLTF.glb';

    const canvas = document.querySelector('#c');
    const backgroundColor = 0xf1f1f1;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, 60, 100);

    // Init the renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.gammaFactor = 1.7;
    renderer.gammaOutput = true;
    document.body.appendChild(renderer.domElement);

    // Add a camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30
    camera.position.x = 0;
    camera.position.y = -3;

    // load the model
    const loader = new GLTFLoader();
    loader.load(
        MODEL_PATH,
        (gltf) => {
            model = gltf.scene;
            let fileAnimations = gltf.animations;
            model.traverse(o => {
                if (o.isMesh) {
                    o.castShadow = true;
                    o.receiveShadow = true;
                }
                // Reference the neck and waist bones
                if (o.isBone && o.name === 'mixamorigNeck') {
                    neck = o;
                }
                if (o.isBone && o.name === 'mixamorigSpine') {
                    waist = o;
                }
            });
            model.position.y = -11;
            model.scale.set(80, 80, 80);
            scene.add(model);

            mixer = new THREE.AnimationMixer(model);
            let idleAnim = fileAnimations[0];
            idleAnim.tracks.splice(3, 12);
            idle = mixer.clipAction(idleAnim);
            idle.play();
        },
        undefined, // We don't need this function
        function (error) {
            console.error(error);
        }
    );

    let geometry = new THREE.SphereGeometry(7, 32, 32);
    let material = new THREE.MeshBasicMaterial({
        color: "#3ffcc7"
    }); // 0xf2ce2e 
    let sphere = new THREE.Mesh(geometry, material);
    sphere.position.z = -15;
    sphere.position.y = 0;
    sphere.position.x = -0.25;
    scene.add(sphere);


    // Add lights
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene
    scene.add(hemiLight);

    let d = 50.0;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);

    // Floor
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
        color: 0xeeeeee,
        shininess: 0,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    scene.add(floor);
};

export function update() {

    if (mixer) {
        mixer.update(clock.getDelta());
    }
    walkGigi();
    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

export function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
    joint.rotation.x = THREE.Math.degToRad(degrees.y);
}

export function getMousePos(e) {
    return {
        x: e.clientX,
        y: e.clientY
    };
}

export function setLeftOrRight(x) {
    const w = window.innerWidth;
    let direction = "None";
    if (x < 0) {
        leftOrRight = 0;
    } else if (x <= w / 2) {
        direction = "left";
    } else if (x >= w / 2) {
        direction = "right";
    }
    leftOrRight = direction == "left" ? -1 : direction == "right" ? 1 : 0;
}

function walkGigi() {
    if (model) {
        model.position.x += leftOrRight * 0.1;
    }
}

function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = {
        x: window.innerWidth,
        y: window.innerHeight
    };

    // Left (Rotates neck left between 0 and -degreeLimit)

    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1;
    }
    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }

    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
    }
    return {
        x: dx,
        y: dy
    };
}