"format global";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;

      if (typeof name == 'object') {
        for (var p in name)
          exports[p] = name[p];
      }
      else {
        exports[name] = value;
      }

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if ((typeof exports == 'object' || typeof exports == 'function') && exports !== global) {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    // node core modules
    if (name.substr(0, 6) == '@node/')
      return require(name.substr(6));

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['1'], [], function($__System) {

$__System.registerDynamic("2", [], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var syntax = ['Supports standard dice notation, as well as some extended functionality.', 'syntax: <roll>[<operator><roll><operator><roll>...][<operator><constant>]', 'roll: [<number of dice>]d<number of sides>[<modifiers>]', '      default number of dice: 1', 'operator: + or -', 'constant: any integer', 'modifiers:', '  d<number> - drop the lowest X rolls from this group', '  k<number> - keep the highest X rolls from this group', '  h - alter either d or k modifier to affect the highest rolls, e.g. dh3: drop the highest 3 rolls', '  l - alter either d or k modifier to affect the lowest rolls, e.g. kl2: keep the lowest 2 rolls', '  r - reroll based on certain rules', '    r4 - reroll all 4s', '    r<3 - reroll anything less than 3', '    r>=11 - reroll anything greater than or equal to 11', 'modifiers can be combined, but d and k are mutually exclusive'].join('\n');
  var specialData = {
    barrel: 'Donkey Kong rolls a barrel down the ramp and crushes you. -1000pts',
    rick: 'No.',
    katamari: 'Na naaaaa, na na na na na na, na na Katamari Damacy....',
    help: syntax,
    syntax: syntax
  };
  function SpecialFunctions() {
    this.getSpecial = function(expression) {
      if (expression && specialData.hasOwnProperty(expression)) {
        return specialData[expression];
      }
      return null;
    };
  }
  module.exports = new SpecialFunctions();
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("3", [], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function DiceConstant(val) {
    this.results = {total: 0};
    this.isValid = true;
    this.toString = function() {
      return '' + this.results.total;
    };
    var nval = parseInt(val, 10);
    if (isNaN(nval)) {
      this.isValid = false;
    } else {
      this.results.total = nval;
    }
  }
  module.exports = DiceConstant;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4", [], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function addition(left, right) {
    return left + right;
  }
  function subtraction(left, right) {
    var diff = left - right;
    return diff > 0 ? diff : 0;
  }
  function DiceOperator(op) {
    this.operator = op;
    this.isValid = (op === '-' || op === '+');
    this.toString = function() {
      return ' ' + op + ' ';
    };
    this.delegate = addition;
    if (this.isValid) {
      if (op === '-') {
        this.delegate = subtraction;
      }
    }
  }
  module.exports = DiceOperator;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("5", [], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  function createBasicReroll(val) {
    return function(diceValue) {
      return diceValue === val;
    };
  }
  function createLessThanReroll(val, lte) {
    return function(diceValue) {
      if (lte) {
        return diceValue <= val;
      }
      return diceValue < val;
    };
  }
  function createGreaterThanReroll(val, gte) {
    return function(diceValue) {
      if (gte) {
        return diceValue >= val;
      }
      return diceValue > val;
    };
  }
  function needReroll(num) {
    var rule;
    for (var jk in this.reroll) {
      rule = this.reroll[jk];
      if (rule(num)) {
        return true;
      }
    }
    return false;
  }
  function RollOptions(options) {
    this.keep = false;
    this.drop = false;
    this.highestRolls = false;
    this.lowestRolls = false;
    this.reroll = [];
    this.isValid = true;
    this.needReroll = needReroll.bind(this);
    var optString = options;
    var optionPattern = /^([rkd])([^rkd]+)/i;
    var parseKeepDrop = (function(kd, val, dfltHighest) {
      if (val) {
        val = val.toLowerCase();
        var kdPattern = /([hl]?)([0-9]+)/i;
        var match = kdPattern.exec(val);
        if (match) {
          if (!match[1] && dfltHighest) {
            this.highestRolls = true;
          } else if (match[1] === 'h') {
            this.highestRolls = true;
          } else {
            this.lowestRolls = true;
          }
          var amt = parseInt(match[2], 10);
          if (isNaN(amt) || !amt) {
            this.isValid = false;
          } else {
            this[kd] = amt;
          }
        } else {
          this.isValid = false;
        }
      } else {
        this.isValid = false;
      }
    }).bind(this);
    var parseReroll = (function(val) {
      var rerollPattern = /([<>]?)([=]?)([0-9]+)/;
      var match = rerollPattern.exec(val);
      if (match) {
        var rolledValue = parseInt(match[3], 10);
        if (isNaN(rolledValue) || !rolledValue) {
          this.isValid = false;
        } else {
          var thanEquals = false;
          if (match[2]) {
            thanEquals = true;
          }
          if (match[1] === '<') {
            this.reroll.push(createLessThanReroll(rolledValue, thanEquals));
          } else if (match[1] === '>') {
            this.reroll.push(createGreaterThanReroll(rolledValue, thanEquals));
          } else {
            this.reroll.push(createBasicReroll(rolledValue));
          }
        }
      } else {
        this.isValid = false;
      }
    }).bind(this);
    while (optString) {
      var match = optionPattern.exec(optString);
      if (match) {
        var optType = match[1].toLowerCase();
        var optValue = match[2];
        switch (optType) {
          case 'r':
            parseReroll(optValue);
            break;
          case 'k':
            if (this.keep || this.drop)
              this.isValid = false;
            this.keep = true;
            parseKeepDrop('keep', optValue, true);
            break;
          case 'd':
            if (this.keep || this.drop)
              this.isValid = false;
            this.drop = true;
            parseKeepDrop('drop', optValue, false);
            break;
        }
        optString = optString.length > match[0].length ? optString.substr(match[0].length) : null;
      } else {
        optString = null;
      }
    }
    parseKeepDrop = null;
    parseReroll = null;
    optionPattern = null;
    this.toString = function() {
      return options;
    };
  }
  module.exports = RollOptions;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("6", ["5"], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var RollOptions = req('5');
  function roll(numberOfFaces) {
    var primer = new Date().getTime() % 10;
    for (var jk = 0; jk < primer; jk++) {
      Math.random();
    }
    return Math.ceil(numberOfFaces * Math.random());
  }
  function execute() {
    var d,
        currentRolls = [];
    if (this.isValid) {
      while (currentRolls.length < this.numberOfDice) {
        d = roll(this.numberOfFaces);
        this.results.raw.push(d);
        if (!this.rollOptions.needReroll(d)) {
          currentRolls.push(d);
        }
      }
      if (this.rollOptions.keep) {
        currentRolls.sort();
        var desiredLength = this.rollOptions.keep;
        if (this.rollOptions.lowestRolls) {
          currentRolls = currentRolls.slice(0, desiredLength);
        } else {
          currentRolls = currentRolls.slice(currentRolls.length - desiredLength);
        }
      }
      if (this.rollOptions.drop) {
        currentRolls.sort();
        var amtToDrop = this.rollOptions.drop;
        if (this.rollOptions.lowestRolls) {
          currentRolls = currentRolls.slice(amtToDrop);
        } else {
          currentRolls = currentRolls.slice(0, currentRolls.length - amtToDrop);
        }
      }
      this.results.kept = currentRolls;
      this.results.total = currentRolls.reduce(function(a, b) {
        return a + b;
      }, 0);
    }
  }
  function toString() {
    var niceTryPartner = this.niceTry ? '(nice try)' : '';
    return niceTryPartner + this.numberOfDice + 'd' + this.numberOfFaces + this.rollOptions.toString() + '(' + this.results.total + '=' + this.results.kept.join('+') + ')';
  }
  function DiceRoll(numDice, numFaces, options) {
    if (!numDice)
      numDice = '1';
    this.numberOfDice = parseInt(numDice, 10);
    this.numberOfFaces = parseInt(numFaces, 10);
    this.rollOptions = new RollOptions(options);
    this.results = {
      raw: [],
      kept: [],
      total: 0
    };
    this.niceTry = false;
    if (this.numberOfDice > 1000) {
      this.numberOfDice = 1000;
      this.niceTry = true;
    }
    this.isValid = !isNaN(this.numberOfDice) && !isNaN(this.numberOfFaces) && this.rollOptions.isValid && this.numberOfFaces > 1 && this.numberOfDice > 0;
    this.execute = execute.bind(this);
    this.toString = toString.bind(this);
  }
  module.exports = DiceRoll;
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("7", ["6", "5", "4", "3", "2"], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  var DiceRoll = req('6');
  var RollOptions = req('5');
  var DiceOperator = req('4');
  var DiceConstant = req('3');
  var specialFunctions = req('2');
  function validate() {
    var isValid = false;
    if (this.operations && this.operations.length) {
      var hasRolls = false;
      var operationsValid = this.operations.reduce(function(agg, op) {
        if (op instanceof DiceRoll) {
          hasRolls = true;
        }
        return agg && op.isValid;
      }, true);
      var validStart = false;
      var validEnd = false;
      if (hasRolls) {
        validStart = !(this.operations[0] instanceof DiceOperator);
        validEnd = !(this.operations[this.operations.length - 1] instanceof DiceOperator);
      }
      isValid = hasRolls && operationsValid && validStart && validEnd;
    }
    return isValid;
  }
  function execute() {
    if (this.isValid) {
      var currentTotal = 0;
      var operatorBuffer = null;
      for (var opIndex in this.operations) {
        var operation = this.operations[opIndex];
        if (operation instanceof DiceRoll) {
          operation.execute();
        }
        if (operation instanceof DiceOperator) {
          if (operatorBuffer === null) {
            operatorBuffer = operation;
          } else {
            throw new Error('Pre-existing operator');
          }
        } else {
          if (operatorBuffer) {
            currentTotal = operatorBuffer.delegate(currentTotal, operation.results.total);
            operatorBuffer = null;
          } else {
            currentTotal = operation.results.total;
          }
        }
      }
      this.result = currentTotal;
      this.details = this.operations.reduce(function(descr, op) {
        return descr + op.toString();
      }, '');
    }
  }
  function toString() {
    if (this.special) {
      return this.special;
    } else {
      if (this.isValid) {
        return (this.label ? this.label + ': ' : '') + this.result + ' rolls: ' + this.details;
      } else {
        return 'invalid dice roll';
      }
    }
  }
  function DiceExpression(expr) {
    var operations = [];
    var diceNotation = /^\s*([+-])?\s*(\d*)d(\d+)([^\s+-]*)/i;
    var special = specialFunctions.getSpecial(expr);
    if (special) {
      this.special = special;
    } else {
      var srcString = expr;
      while (srcString) {
        var match = diceNotation.exec(srcString);
        if (match) {
          var operator = match[1];
          var numDice = match[2];
          var numFaces = match[3];
          var options = match[4];
          if (operator) {
            operations.push(new DiceOperator(operator));
          }
          if (numFaces) {
            operations.push(new DiceRoll(numDice, numFaces, options));
          }
          srcString = srcString.length > match[0].length ? srcString.substr(match[0].length) : null;
        } else {
          var tailExpression = /\s*([+-])\s*([0-9]+)/i;
          match = tailExpression.exec(srcString);
          if (match) {
            var operator = match[1];
            var cval = match[2];
            if (operator) {
              operations.push(new DiceOperator(operator));
            }
            if (cval) {
              operations.push(new DiceConstant(cval));
            }
          }
          var labelExpression = /for\s+(.*)/;
          match = labelExpression.exec(srcString);
          if (match) {
            this.label = match[1];
          }
          srcString = null;
        }
      }
    }
    this.operations = operations;
    this.toString = toString.bind(this);
    this.isValid = validate.apply(this);
    if (this.isValid) {
      execute.apply(this);
    }
  }
  module.exports = DiceExpression;
  global.define = __define;
  return module.exports;
});

$__System.register('1', ['7'], function (_export) {
  'use strict';

  var DiceExpression, theForm, theInput, theOutput;

  function doRoll(evt) {
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

    if (theOutput.children.length) {
      theOutput.insertBefore(container, theOutput.firstChild);
    } else {
      theOutput.appendChild(container);
    }
  }

  return {
    setters: [function (_) {
      DiceExpression = _['default'];
    }],
    execute: function () {
      theForm = document.getElementsByTagName('form')[0];
      theInput = document.getElementById('dice');
      theOutput = document.getElementById('output');
      theForm.addEventListener('submit', doRoll);

      _export('default', 'all set, guvnuh');
    }
  };
});
})
(function(factory) {
  factory();
});
//# sourceMappingURL=browser.sfx.js.map