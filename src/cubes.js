import * as THREE from "three";
const loader = new THREE.TextureLoader();

const loadOne = (path) => {
  const texture = loader.load(path);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  return new THREE.MeshStandardMaterial({ map: texture });
};

const load = (name, base, opts) => {
  const texture =
    opts === undefined
      ? loadOne(base)
      : [
          opts.front || base,
          opts.back || base,
          opts.top || base,
          opts.bottom || base,
          opts.leftSide || base,
          opts.rightSide || base,
        ].map(loadOne);

  return { name, texture };
};

const defaultCubeTexture = load(
  "grass",
  require("../assets/blocks/grass_side.png"),
  {
    top: require("../assets/blocks/grass_top.png"),
    bottom: require("../assets/blocks/dirt.png"),
  }
);

const cubeTextures = [
  defaultCubeTexture,
  load("snow", require("../assets/blocks/grass_side_snowed.png"), {
    top: require("../assets/blocks/snow.png"),
    bottom: require("../assets/blocks/dirt.png"),
  }),
  load("bookshelf", require("../assets/blocks/bookshelf.png"), {
    top: require("../assets/blocks/planks_oak.png"),
    bottom: require("../assets/blocks/planks_oak.png"),
  }),
  load("crafting table", require("../assets/blocks/crafting_table_side.png"), {
    front: require("../assets/blocks/crafting_table_front.png"),
    top: require("../assets/blocks/crafting_table_top.png"),
    bottom: require("../assets/blocks/planks_oak.png"),
  }),
  load("furnace", require("../assets/blocks/furnace_side.png"), {
    front: require("../assets/blocks/furnace_front_off.png"),
    top: require("../assets/blocks/furnace_top.png"),
    bottom: require("../assets/blocks/furnace_top.png"),
  }),
  load("log (acacia)", require("../assets/blocks/log_acacia.png"), {
    top: require("../assets/blocks/log_acacia_top.png"),
    bottom: require("../assets/blocks/log_acacia_top.png"),
  }),
  load("log (big oak)", require("../assets/blocks/log_big_oak.png"), {
    top: require("../assets/blocks/log_big_oak_top.png"),
    bottom: require("../assets/blocks/log_big_oak_top.png"),
  }),
  load("log (birch)", require("../assets/blocks/log_birch.png"), {
    top: require("../assets/blocks/log_birch_top.png"),
    bottom: require("../assets/blocks/log_birch_top.png"),
  }),
  load("log (oak)", require("../assets/blocks/log_oak.png"), {
    top: require("../assets/blocks/log_oak_top.png"),
    bottom: require("../assets/blocks/log_oak_top.png"),
  }),
  load("log (spruce)", require("../assets/blocks/log_spruce.png"), {
    top: require("../assets/blocks/log_spruce_top.png"),
    bottom: require("../assets/blocks/log_spruce_top.png"),
  }),
  load("TNT", require("../assets/blocks/tnt_side.png"), {
    top: require("../assets/blocks/tnt_top.png"),
    bottom: require("../assets/blocks/tnt_bottom.png"),
  }),
  load("brick", require("../assets/blocks/brick.png")),
  load("coal ore", require("../assets/blocks/coal_ore.png")),
  load("coarse dirt", require("../assets/blocks/coarse_dirt.png")),
  load("cobblestone", require("../assets/blocks/cobblestone.png")),
  load("mossy cobblestone", require("../assets/blocks/cobblestone_mossy.png")),
  load("diamond ore", require("../assets/blocks/diamond_ore.png")),
  load("dirt", require("../assets/blocks/dirt.png")),
  load("gold block", require("../assets/blocks/gold_block.png")),
  load("gold ore", require("../assets/blocks/gold_ore.png")),
  load("gravel", require("../assets/blocks/gravel.png")),
  load("iron ore", require("../assets/blocks/iron_ore.png")),
  load("lapis ore", require("../assets/blocks/lapis_ore.png")),
  load("planks (acacia)", require("../assets/blocks/planks_acacia.png")),
  load("planks (big oak)", require("../assets/blocks/planks_big_oak.png")),
  load("planks (birch)", require("../assets/blocks/planks_birch.png")),
  load("planks (jungle)", require("../assets/blocks/planks_jungle.png")),
  load("planks (oak)", require("../assets/blocks/planks_oak.png")),
  load("planks (spruce)", require("../assets/blocks/planks_spruce.png")),
  load("redstone lamp", require("../assets/blocks/redstone_lamp_off.png")),
  load("redstone ore", require("../assets/blocks/redstone_ore.png")),
  load("sand", require("../assets/blocks/sand.png")),
  load("stone", require("../assets/blocks/stone.png")),
  load("stone brick", require("../assets/blocks/stonebrick.png")),
].sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1));

export { cubeTextures, defaultCubeTexture };
