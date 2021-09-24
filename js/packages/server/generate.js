const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const { layers, width, height } = require("./assets/config.js");
const canvas = createCanvas(width, height);
const ctx = canvas.getContext("2d");
const canvas_pog = createCanvas(width, height);
const ctx_pog = canvas_pog.getContext("2d");
ctx.fillStyle = 'transparent';
ctx.fillRect(0, 0, width, height);
let data = {};

const saveLayer = async (_canvas, _edition, _canvas_pog) => {
  await fs.writeFileSync(`./assets/temp/${_edition}_pog.png`, _canvas_pog.toBuffer("image/png"));
  await fs.writeFileSync(`./assets/temp/${_edition}.png`, _canvas.toBuffer("image/png"));
};

// const saveData = async (data, _edition) => {
//   await fs.writeFileSync(`./assets/temp/data/${_edition}.json`, JSON.stringify(data));
// };

const drawLayer = async (_layer, _edition, data, aura, type, symbol, variety) => {
  let parent = _layer;
  let rarity = 1;
  while(parent.hasAura || parent.hasType || parent.hasSymbol || parent.hasVariety){
    if(parent.hasAura){
      parent = parent[aura];
      rarity *= aura === 'has' ? 0.2 : 0.8;
    }
    if(parent.hasType){
      parent = parent[type];
      rarity *= type === 'pog' ? 0.9 : 0.1;
    }
    if(parent.hasSymbol){
      parent = parent[symbol];
      rarity *= symbol === 'has' ? 0.9 : 0.1;
    }
    if(parent.hasVariety){
      parent = parent[variety];
      rarity *= 0.625;
    }
  }
  let elements = parent.elements;
  let number = Math.random();
  let index = 0;
  while(number > elements[index].rarity){
    number -= elements[index].rarity;
    index++;
  }

  data.attributes.push({ trait_type: _layer.name, value: elements[index].label });
  data.rarity *= rarity * elements[index].rarity;
  const image = await loadImage(`${parent.location}${elements[index].name}.png`);
  ctx.drawImage(
    image,
    _layer.position.x,
    _layer.position.y,
    _layer.size.width,
    _layer.size.height
  );
  if (_layer.id !== 1) 
    ctx_pog.drawImage(
      image,
      _layer.position.x,
      _layer.position.y,
      _layer.size.width,
      _layer.size.height
    );
  else ctx_pog.clearRect(0, 0, canvas.width, canvas.height);
  saveLayer(canvas, _edition, canvas_pog);
};

const generateArt = () => {
  // for (let i = 1; i <= edition; i++) {
    const timestamp = (new Date()).getTime();
    console.log("Creating edition " + timestamp);// + i);
    let aura = Math.random() > 0.8 ? 'has' : 'none';
    let symbol = Math.random() > 0.1 ? 'has' : 'none';
    let type = Math.random() > 0.9 ? 'slammer': 'pog';
    let variety = Math.floor(Math.random() * 16);
    data = {
      name: type.toUpperCase(),//i.toString(),
      attributes: [
        { trait_type: "AuraState", value: aura == 'has' ? 'Present' : 'None' },
        { trait_type: "TypeState", value: type == 'slammer' ? 'Slammer' : 'Pog' },
        { trait_type: "SymbolState", value: symbol == 'has' ? 'Present' : 'None' },
      ],
      image: timestamp+'.png' ,
      rarity: 1
    };
    layers.forEach(layer => {
      drawLayer(layer, timestamp, data, aura, type, symbol, variety);
    });
  
    // saveData(data, timestamp);//i);
  // }
  return data;
}

module.exports = { generateArt }