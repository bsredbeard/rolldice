
const primer = () => {
  var primer = new Date().getTime() % 10;
  for(var jk = 0; jk < primer; jk++){
    Math.random();
  }
};

const roller = (numFaces) => {
  primer();
  return Math.ceil(numFaces * Math.random());
};

module.exports = roller;