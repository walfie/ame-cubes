// Disclaimer: This code is not well-written and there are magic literals used
// all over the place. It could use a lot of cleanup.

import * as THREE from "three";
import * as dat from "dat.gui";
import spritesheet from "../assets/ame-spritesheet.png";
import { cubeTextures } from "./cubes";

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
  75, // FOV
  window.innerWidth / window.innerHeight,
  0.1, // near
  3000 // far
);
camera.position.z = 1000;

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
    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotationRate = { x: 0, y: 0, z: 0 };
    this.randomize();
  }

  randomize() {
    const texture = randomCubeTexture();

    if (!texture) {
      return;
    }

    this.rotationRate = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1,
    };

    const scale = 1 + Math.random() * 3;
    this.mesh.scale.x = scale;
    this.mesh.scale.y = scale;
    this.mesh.scale.z = scale;
    this.mesh.material = texture;

    const max = 2000;
    const [edgeAxis, otherAxis] = choice(["x", "y"], ["y", "x"]);

    const isMinEdge = choice(true, false);

    this.mesh.position[edgeAxis] = isMinEdge ? -max : max;
    this.mesh.position[otherAxis] = (Math.random() - 0.5) * 2 * max;
    this.mesh.position.z = -Math.random() * 1000;

    this.velocity.z = Math.random() - 0.5;
    this.velocity[edgeAxis] = Math.random() * 25 * (isMinEdge ? 1 : -1);
    this.velocity[otherAxis] = (Math.random() - 0.5) * 50;
  }

  update() {
    if (!this.mesh.visible) {
      return;
    }

    this.mesh.rotation.x += this.rotationRate.x;
    this.mesh.rotation.y += this.rotationRate.y;
    this.mesh.rotation.z += this.rotationRate.z;

    this.mesh.position.x += this.velocity.x;
    this.mesh.position.y += this.velocity.y;
    this.mesh.position.z += this.velocity.z;

    const pos = this.mesh.position;
    const max = 5000;
    if (
      pos.x < -max ||
      pos.x > max ||
      pos.y < -max ||
      pos.x > max ||
      pos.z < -max ||
      pos.z > max
    ) {
      this.randomize();
    }
  }
}

let cubes = [];
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
const sceneControls = gui.addFolder("Scene");
sceneControls.open();
sceneControls
  .addColor(params, "backgroundColor")
  .name("Background")
  .onChange(() => {
    renderer.setClearColor(params.backgroundColor);
  });
sceneControls
  .add(params, "cubeCount", 0, maxCubeCount)
  .name("Cubes")
  .onChange(() => {
    while (cubes.length < params.cubeCount) {
      addCube(false);
    }

    cubes.forEach((cube, index) => {
      cube.mesh.visible = index < params.cubeCount;
    });
  });

renderer.setClearColor(params.backgroundColor, 1);

const lightControls = gui.addFolder("Lighting");
lightControls.open();
lightControls
  .addColor(params, "lightColor")
  .name("Point lighting")
  .onChange(() => {
    light.color.set(params.lightColor);
  });
lightControls
  .add(params, "lightIntensity", 0.0, 5.0)
  .name("Light intensity")
  .onChange(() => {
    light.intensity = params.lightIntensity;
  });
lightControls
  .addColor(params, "ambientLightColor")
  .name("Ambient lighting")
  .onChange(() => {
    ambientLight.color.set(params.ambientLightColor);
  });
lightControls
  .add(params, "ambientLightIntensity", 0.0, 5.0)
  .name("Ambient light intensity")
  .onChange(() => {
    ambientLight.intensity = params.ambientLightIntensity;
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

const cubeControls = gui.addFolder("Textures");
let cubeControllers;
cubeControls
  .add(
    {
      enableAll: () => {
        cubeControllers.forEach((c) => c.setValue(true));
      },
    },
    "enableAll"
  )
  .name("Enable all");

cubeControls
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
  return cubeControls
    .add(params.cubeToggle, name)
    .name(name)
    .onChange(() => {
      enabledCubes = cubeTextures.filter(({ name }) => params.cubeToggle[name]);
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
