// Disclaimer: This code is not well-written and there are magic literals used
// all over the place. It could use a lot of cleanup.

import * as THREE from "three";
import * as dat from "dat.gui";
import spritesheet from "../assets/ame-spritesheet.png";
import { cubeTextures, defaultCubeTexture } from "./cubes";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then(({ scope }) => {
      console.log("Registration successful, scope is:", scope);
    })
    .catch((error) => {
      console.error("Service worker registration failed, error:", error);
    });
}

const defaultCubeCount = 150;
const maxCubeCount = 2048;
const spriteData = {
  width: 650,
  height: 900,
  image: spritesheet,
  frameCount: 8,
  fps: 12,
  rotationRate: 0.05,
};

const params = {
  rotationRate: spriteData.rotationRate,
  spriteFps: spriteData.fps,
  backgroundColor: "#000000",
  lightColor: "#ffffff",
  lightIntensity: 1.0,
  ambientLightColor: "#001fff",
  ambientLightIntensity: 1.0,
  cubeCount: defaultCubeCount,
  ameVisible: true,
  cubeToggle: {},
  cubeSpeed: 50.0,
  cubeRotationSpeed: 0.1,
  fov: 75,
  cameraDistance: 1000,
};

let enabledCubes = [...cubeTextures];
cubeTextures.forEach(({ name }) => {
  params.cubeToggle[name] = true;
});

const randomCubeTexture = () => {
  if (enabledCubes.length === 0) {
    return null;
  } else {
    return enabledCubes[Math.floor(Math.random() * enabledCubes.length)]
      .texture;
  }
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  params.fov, // FOV
  window.innerWidth / window.innerHeight,
  0.1, // near
  3000 // far
);
camera.position.z = params.cameraDistance;

const clock = new THREE.Clock();

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

const onWindowResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

document.body.appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize, false);

class AnimatedSprite {
  constructor({ width, height, spritesheet, frameCount, fps, rotationRate }) {
    this.width = width;
    this.height = height;
    this.frameCount = frameCount;
    this.setFrameRate(fps);
    this.setRotationRate(rotationRate);

    this.texture = new THREE.TextureLoader().load(spriteData.image);
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.setScale(1.0);

    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
    this.texture.repeat.set(1 / frameCount, 1);

    this.elapsed = 0;
    this.currentFrame = 0;
  }

  setFrameRate(fps) {
    this.frameDelay = (1 / fps) * 1000;
  }

  setRotationRate(rate) {
    this.rotationRate = rate;
  }

  setScale(factor) {
    this.mesh.scale.set(this.width * factor, this.height * factor, 100);
  }

  update(delta) {
    this.mesh.rotation.z += this.rotationRate;
    this.elapsed += delta;

    while (this.elapsed > this.frameDelay) {
      this.elapsed -= this.frameDelay;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.texture.offset.x = this.currentFrame / this.frameCount;
    }
  }
}

const sprite = new AnimatedSprite(spriteData);
scene.add(sprite.mesh);

const choice = (a, b) => {
  return Math.random() > 0.5 ? a : b;
};

class Cube {
  constructor() {
    const geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    this.mesh = new THREE.Mesh(geometry, material);
    this.baseVelocity = new THREE.Vector3(0, 0, 0);
    this.baseRotationRate = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotationRate = new THREE.Vector3(0, 0, 0);
    this.randomizeMax = 2000;
    this.updateMax = 5000;
    this.randomize();
  }

  scaleVelocity(scale) {
    this.velocity = this.baseVelocity.clone().multiplyScalar(scale);
    this.velocity.z = this.baseVelocity.z;
  }

  scaleRotationRate(scale) {
    this.rotationRate = this.baseRotationRate.clone().multiplyScalar(scale);
  }

  randomize() {
    this.baseRotationRate.random().subScalar(0.5);

    const texture = randomCubeTexture();
    this.mesh.material = texture || defaultCubeTexture.texture;
    const scale = texture ? 1 + Math.random() * 3 : 0;
    this.mesh.scale.setScalar(scale);

    const [edgeAxis, otherAxis] = choice(["x", "y"], ["y", "x"]);

    const isMinEdge = choice(true, false);

    this.mesh.position[edgeAxis] = isMinEdge
      ? -this.randomizeMax
      : this.randomizeMax;
    this.mesh.position[otherAxis] =
      (Math.random() - 0.5) * 2 * this.randomizeMax;
    this.mesh.position.z = -Math.random() * 1000;

    this.baseVelocity.z = Math.random() - 0.5;
    this.baseVelocity[edgeAxis] = Math.random() * (isMinEdge ? 0.5 : -0.5);
    this.baseVelocity[otherAxis] = Math.random() - 0.5;

    this.scaleVelocity(params.cubeSpeed);
    this.scaleRotationRate(params.cubeRotationSpeed);
  }

  update() {
    if (!this.mesh.visible) {
      return;
    }

    this.mesh.rotation.x += this.rotationRate.x;
    this.mesh.rotation.y += this.rotationRate.y;
    this.mesh.rotation.z += this.rotationRate.z;

    this.mesh.position.add(this.velocity);

    const pos = this.mesh.position;
    if (
      pos.x < -this.updateMax ||
      pos.x > this.updateMax ||
      pos.y < -this.updateMax ||
      pos.x > this.updateMax ||
      pos.z < -this.updateMax ||
      pos.z > this.updateMax
    ) {
      this.randomize();
    }
  }
}

let cubes = [];

const resetCubes = () => {
  cubes.forEach((cube) => cube.randomize());
};

const addCube = (visible) => {
  const cube = new Cube();
  cube.mesh.visible = visible;
  scene.add(cube.mesh);
  cubes.push(cube);
};

[...Array(defaultCubeCount)].forEach((_) => addCube(true));

const light = new THREE.PointLight(params.lightColor, 1.0, 0);
light.position.z = camera.position.z;
scene.add(light);

const ambientLight = new THREE.PointLight(params.ambientLightColor, 1.0, 0);
scene.add(ambientLight);

const gui = new dat.GUI();
gui.close();

renderer.setClearColor(params.backgroundColor, 1);

const sceneControls = gui.addFolder("Scene");
sceneControls.open();
sceneControls
  .addColor(params, "backgroundColor")
  .name("Background")
  .onChange(() => {
    renderer.setClearColor(params.backgroundColor);
  });
sceneControls
  .addColor(params, "lightColor")
  .name("Point lighting")
  .onChange(() => {
    light.color.set(params.lightColor);
  });
sceneControls
  .add(params, "lightIntensity", 0.0, 5.0)
  .name("Light intensity")
  .onChange(() => {
    light.intensity = params.lightIntensity;
  });
sceneControls
  .addColor(params, "ambientLightColor")
  .name("Ambient lighting")
  .onChange(() => {
    ambientLight.color.set(params.ambientLightColor);
  });
sceneControls
  .add(params, "ambientLightIntensity", 0.0, 5.0)
  .name("Ambient light intensity")
  .onChange(() => {
    ambientLight.intensity = params.ambientLightIntensity;
  });
sceneControls
  .add(params, "cameraDistance", 30.0, 3000.0)
  .name("Camera distance")
  .onChange(() => {
    camera.position.z = params.cameraDistance;
    camera.far = Math.max(params.cameraDistance * 3, 3000); // TODO: Less magic numbers
    camera.updateProjectionMatrix();
  });

sceneControls
  .add(params, "fov", 30.0, 150.0)
  .name("FOV")
  .onChange(() => {
    camera.fov = params.fov;
    camera.updateProjectionMatrix();
  });

const ameControls = gui.addFolder("Ame");
ameControls.open();

ameControls
  .add(params, "rotationRate", -0.3, 0.3)
  .name("Rotation rate")
  .onChange(() => {
    sprite.setRotationRate(params.rotationRate);
  });

ameControls
  .add(params, "spriteFps", 1, 60)
  .name("Sprite FPS")
  .onChange(() => {
    sprite.setFrameRate(params.spriteFps);
  });

ameControls
  .add(params, "ameVisible")
  .name("Visible")
  .onChange(() => {
    sprite.mesh.visible = params.ameVisible;
  });

const cubeControls = gui.addFolder("Cubes");
cubeControls.open();
cubeControls
  .add(params, "cubeCount", 0, maxCubeCount)
  .name("Count")
  .onChange(() => {
    while (cubes.length < params.cubeCount) {
      addCube(false);
    }

    cubes.forEach((cube, index) => {
      cube.mesh.visible = index < params.cubeCount;
    });
  });

cubeControls
  .add(params, "cubeSpeed", 0.0, 250.0)
  .name("Speed")
  .onChange(() => {
    cubes.forEach((cube) => cube.scaleVelocity(params.cubeSpeed));
  });

cubeControls
  .add(params, "cubeRotationSpeed", 0.0, 1.0)
  .name("Rotation speed")
  .onChange(() => {
    cubes.forEach((cube) => cube.scaleRotationRate(params.cubeRotationSpeed));
  });

cubeControls.add({ reset: resetCubes }, "reset").name("Reset");

const textureControls = cubeControls.addFolder("Textures");
let cubeControllers;
textureControls
  .add(
    {
      enableAll: () => {
        cubeControllers.forEach((c) => c.setValue(true));
        resetCubes();
      },
    },
    "enableAll"
  )
  .name("Enable all");

textureControls
  .add(
    {
      disableAll: () => {
        cubeControllers.forEach((c) => c.setValue(false));
      },
    },
    "disableAll"
  )
  .name("Disable all");

cubeControllers = cubeTextures.map(({ name, texture }) => {
  return textureControls
    .add(params.cubeToggle, name)
    .name(name)
    .onChange(() => {
      const previousCount = enabledCubes.length;
      enabledCubes = cubeTextures.filter(({ name }) => params.cubeToggle[name]);

      if (enabledCubes.length === 0 || previousCount === 0) {
        resetCubes();
      }
    });
});

const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sprite.update(1000 * delta);
  cubes.forEach((cube) => cube.update());

  renderer.clear();
  renderer.render(scene, camera);
};

animate();
