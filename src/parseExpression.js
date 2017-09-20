const StringInspector = require('./StringInspector');

const whitespace = ' \t\r\n';
const rollExpression = /^(\d*)d(\d+|[f])([kdhl!0-9]?)/;
const constantExpression = /^(\d+)/;
const operandExpression = /^([+*\/%^()-])/;

const parseExpression = (expression) => {

  const exp = new StringInspector(expression.trim());
  console.log('parsing:', exp.remainder);
  let match = [];
  const mathExpression = [];
  const values = [];

  const addVariable = (definition) => {
    definition.name = '$' + values.length;
    mathExpression.push(definition.name);
    values.push(definition);
  };

  while(exp.hasNext && match){
    exp.nextWhile(x => whitespace.indexOf(x)>=0);

    //check for dice rolls
    match = exp.nextWith(rollExpression);
    if(match){
      addVariable({
        type: 'roll',
        dice: match[1] || '1',
        faces: match[2],
        options: match[3]
      });
      continue;
    }

    //check for constants
    match = exp.nextWith(constantExpression);
    if(match){
      addVariable({
        type: 'const',
        value: parseInt(match[1], 10)
      });
      continue;
    }

    //check for operands
    match = exp.nextWith(operandExpression);
    if(match){
      mathExpression.push(match[1]);
    }
  }

  console.log('Number of values:', values.length);
  values.forEach((v, idx) => {
    if(v.type==='const'){
      console.log(`${v.name}: ${v.value}`);
    } else if(v.type==='roll'){
      console.log(`${v.name}: roll`);
    } else {
      console.log(`$${idx}: unknown`);
    }
  });
  console.log('Compiled expression:', mathExpression.join(' '));
  console.log('Leftovers:', exp.remainder);
};

parseExpression('d4+ 1d8 + (2 + 28d45k4 + -1) for great justice');