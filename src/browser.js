import DiceExpression from './DiceExpression';

var theForm = document.getElementsByTagName('form')[0];
var theInput = document.getElementById('dice');
var theOutput = document.getElementById('output');

function doRoll(evt){
  evt.preventDefault();
  var roll = new DiceExpression(theInput.value);
  
  var container = document.createElement('DIV');
  container.classList.add('roll-result');
  
  var title = document.createElement('DIV');
  title.classList.add('roll-title');
  title.textContent = theInput.value;
  
  var result = document.createElement('PRE');
  result.textContent = roll.toString();
  
  container.appendChild(title);
  container.appendChild(result);
  
  if(theOutput.children.length){
    theOutput.insertBefore(container, theOutput.firstChild);
  } else {
    theOutput.appendChild(container);
  }
}

theForm.addEventListener('submit', doRoll);

export default 'all set, guvnuh';