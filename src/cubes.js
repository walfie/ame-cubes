import * as THREE from "three";

const loader = new THREE.TextureLoader();

const loadOne = (path, transparent) => {
  const texture = loader.load(path);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return new THREE.MeshStandardMaterial({ map: texture, transparent });
};

const load = (base, opts) => {
  if (opts === undefined) {
    return loadOne(base);
  }

  const texture = [
    opts.front || base,
    opts.back || base,
    opts.top || base,
    opts.bottom || base,
    opts.leftSide || base,
    opts.rightSide || base,
  ].map(loadOne);

  return texture;
};

const cubeTextures = [
  load(require("../assets/blocks/grass_side.png"), {
    top: require("../assets/blocks/grass_top.png"),
    bottom: require("../assets/blocks/dirt.png"),
  }),
  load(require("../assets/blocks/grass_side_snowed.png"), {
    top: require("../assets/blocks/snow.png"),
    bottom: require("../assets/blocks/dirt.png"),
  }),
  load(require("../assets/blocks/bookshelf.png"), {
    top: require("../assets/blocks/planks_oak.png"),
    bottom: require("../assets/blocks/planks_oak.png"),
  }),
  load(require("../assets/blocks/crafting_table_side.png"), {
    front: require("../assets/blocks/crafting_table_front.png"),
    top: require("../assets/blocks/crafting_table_top.png"),
    bottom: require("../assets/blocks/planks_oak.png"),
  }),
  load(require("../assets/blocks/furnace_side.png"), {
    front: require("../assets/blocks/furnace_front_off.png"),
    top: require("../assets/blocks/furnace_top.png"),
    bottom: require("../assets/blocks/furnace_top.png"),
  }),
  load(require("../assets/blocks/log_acacia.png"), {
    top: require("../assets/blocks/log_acacia_top.png"),
    bottom: require("../assets/blocks/log_acacia_top.png"),
  }),
  load(require("../assets/blocks/log_big_oak.png"), {
    top: require("../assets/blocks/log_big_oak_top.png"),
    bottom: require("../assets/blocks/log_big_oak_top.png"),
  }),
  load(require("../assets/blocks/log_birch.png"), {
    top: require("../assets/blocks/log_birch_top.png"),
    bottom: require("../assets/blocks/log_birch_top.png"),
  }),
  load(require("../assets/blocks/log_oak.png"), {
    top: require("../assets/blocks/log_oak_top.png"),
    bottom: require("../assets/blocks/log_oak_top.png"),
  }),
  load(require("../assets/blocks/log_spruce.png"), {
    top: require("../assets/blocks/log_spruce_top.png"),
    bottom: require("../assets/blocks/log_spruce_top.png"),
  }),
  load(require("../assets/blocks/tnt_side.png"), {
    top: require("../assets/blocks/tnt_top.png"),
    bottom: require("../assets/blocks/tnt_bottom.png"),
  }),
  load(require("../assets/blocks/sand.png")),
  load(require("../assets/blocks/gold_block.png")),
  load(require("../assets/blocks/gold_ore.png")),
  load(require("../assets/blocks/coal_ore.png")),
  load(require("../assets/blocks/diamond_ore.png")),
  load(require("../assets/blocks/dirt.png")),
  load(require("../assets/blocks/coarse_dirt.png")),
  load(require("../assets/blocks/brick.png")),
  load(require("../assets/blocks/cobblestone.png")),
  load(require("../assets/blocks/cobblestone_mossy.png")),
  load(require("../assets/blocks/cobblestone.png")),
  load(require("../assets/blocks/gravel.png")),
  load(require("../assets/blocks/iron_ore.png")),
  load(require("../assets/blocks/lapis_ore.png")),
  load(require("../assets/blocks/planks_acacia.png")),
  load(require("../assets/blocks/planks_big_oak.png")),
  load(require("../assets/blocks/planks_birch.png")),
  load(require("../assets/blocks/planks_jungle.png")),
  load(require("../assets/blocks/planks_oak.png")),
  load(require("../assets/blocks/planks_spruce.png")),
  load(require("../assets/blocks/redstone_lamp_off.png")),
  load(require("../assets/blocks/redstone_ore.png")),
  load(require("../assets/blocks/sand.png")),
  load(require("../assets/blocks/stone.png")),
  load(require("../assets/blocks/stonebrick.png")),
];

const randomCubeTexture = () => {
  return cubeTextures[Math.floor(Math.random() * cubeTextures.length)];
};

export { cubeTextures, randomCubeTexture };
