import * as THREE from "three";
import * as dat from "dat.gui";
import spritesheet from "../assets/ame-spritesheet.png";

const spriteData = {
  width: 650,
  height: 900,
  image: spritesheet,
  frameCount: 8,
  fps: 12,
  rotationRate: 0.05,
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
renderer.setClearColor(0xffffff, 1);
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
    this.material = new THREE.SpriteMaterial({
      map: this.texture,
      color: 0xffffff,
    });
    this.sprite = new THREE.Sprite(this.material);
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
    this.sprite.scale.set(this.width * factor, this.height * factor, 100);
  }

  update(delta) {
    this.material.rotation += this.rotationRate;
    this.elapsed += delta;

    while (this.elapsed > this.frameDelay) {
      this.elapsed -= this.frameDelay;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.texture.offset.x = this.currentFrame / this.frameCount;
    }
  }
}

const sprite = new AnimatedSprite(spriteData);
scene.add(sprite.sprite);

let choice = (a, b) => {
  return Math.random() > 0.5 ? a : b;
};

class Cube {
  constructor() {
    const geometry = new THREE.BoxBufferGeometry(100, 100, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xff00ff });

    this.mesh = new THREE.Mesh(geometry, material);
    this.velocity = { x: 0, y: 0, z: 0 };
    this.randomize();
  }

  randomize() {
    this.rotationRate = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1,
    };

    const scale = 1 + Math.random() * 3;
    this.mesh.scale.x = scale;
    this.mesh.scale.y = scale;
    this.mesh.scale.z = scale;
    this.mesh.material.color.set(Math.random() * 16777215); // TODO

    const max = 3000;
    const [edgeAxis, otherAxis] = choice(["x", "y"], ["y", "x"]);

    const isMinEdge = choice(true, false);

    this.mesh.position[edgeAxis] = isMinEdge ? -max : max;
    this.mesh.position[otherAxis] = (Math.random() - 0.5) * 2 * max;
    this.mesh.position.z = -Math.random() * 1000;

    this.velocity.z = Math.random() - 0.5;
    this.velocity[edgeAxis] = Math.random() * 50 * (isMinEdge ? 1 : -1);
    this.velocity[otherAxis] = (Math.random() - 0.5) * 100;
  }

  update() {
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

const cubes = [...Array(100)].map((_) => {
  const cube = new Cube();
  scene.add(cube.mesh);
  return cube;
});

const params = {
  rotationRate: sprite.rotationRate,
  spriteFps: spriteData.fps,
  backgroundColor: "#ffffff",
  lightColor: "#ffffff",
  lightIntensity: 1.0,
};

const light = new THREE.PointLight(params.lightColor, 1.0, 0);
light.position.z = camera.position.z;
scene.add(light);

const gui = new dat.GUI();
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
  .name("Lighting")
  .onChange(() => {
    light.color.set(params.lightColor);
  });
sceneControls
  .add(params, "lightIntensity", 0.0, 5.0)
  .name("Light Intensity")
  .onChange(() => {
    light.intensity = params.lightIntensity;
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

let state = {};

const init = () => {};

const render = () => {};

const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sprite.update(1000 * delta);
  cubes.forEach((cube) => cube.update());

  renderer.clear();
  renderer.render(scene, camera);
};

init();
animate();
