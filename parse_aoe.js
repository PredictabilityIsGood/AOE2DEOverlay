const fs = require("fs");
const zlib = require("zlib");
const FileType = require("file-type");
const struct = require('awestruct');

let buffer = fs.readFileSync("C:\\Program Files (x86)\\Steam\\steamapps\\common\\AoE2DE\\resources\\_common\\dat\\empires2_x2_p1.dat");
let inflatedBuffer = zlib.inflateRawSync(buffer);
let gameData = inflatedBuffer.toString("ascii");
fs.writeFileSync("test.txt",gameData);
