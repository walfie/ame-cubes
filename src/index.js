import * as THREE from "three";
import spritesheet from "../assets/ame-spritesheet.png";

const spriteData = {
  width: 650,
  height: 900,
  image: spritesheet,
  frameCount: 8,
  fps: 12,
};

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  2100
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
  constructor({ width, height, spritesheet, frameCount, fps }) {
    this.width = width;
    this.height = height;
    this.frameCount = frameCount;
    this.setFrameRate(fps);
    this.setRotationRate(-0.2);

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
    this.elapsed += delta;

    while (this.elapsed > this.frameDelay) {
      this.material.rotation += this.rotationRate;
      this.elapsed -= this.frameDelay;
      this.currentFrame = (this.currentFrame + 1) % this.frameCount;
      this.texture.offset.x = this.currentFrame / this.frameCount;
    }
  }
}

const sprite = new AnimatedSprite(spriteData);
scene.add(sprite.sprite);

let state = {};

const init = () => {};

const render = () => {};

const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  sprite.update(1000 * delta);

  renderer.clear();
  renderer.render(scene, camera);
};

init();
animate();
