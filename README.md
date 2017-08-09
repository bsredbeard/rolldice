Roll some dice
---

[![Build Status](https://travis-ci.org/mentalspike/rolldice.svg?branch=library)](https://travis-ci.org/mentalspike/rolldice)

## Installation

The RollDice library should run under pretty much any version of node. Note: this package is from the "library" branch of the repository, and has been isolated from any specific bot's plugin libraries.

1. `npm install rolldice --save`
2. Require and use the dice in your application

``` javascript
const RollDice = require('rolldice');

// create and evaluate a dice rolling expression
let dice = new RollDice('d4 + 2d12 + 3d3 for great justice');

// get the boolean value of the expression's validity check
let syntaxIsValid = dice.isValid;
// > true

// get the numerical value of the expression
let rollTotal = dice.result;
// > 18

// get a string description of each roll result within the specified expression
let rollDetails = dice.details;
// > '1d4(2=2) + 2d12(11=8+3) + 3d3(5=2+1+2)'

// get a string representation of the roll total and roll details
console.log('For', dice.toString());
// > For great justice: 18 rolls: 1d4(2=2) + 2d12(11=8+3) + 3d3(5=2+1+2)

// display a readout of all the syntax supported by the dice rolling parser
console.log(new RollDice('help').toString());
```

## Supported syntax

``` plaintext
Supports standard dice notation, as well as some extended functionality.
syntax: <roll>[<operator><roll><operator><roll>...][<operator><constant>]
roll: [<number of dice>]d<number of sides>[<modifiers>]
      default number of dice: 1
number of sides: any integer, or f (for Fudge dice)
operator: + or -
constant: any integer
modifiers:
  d<number> - drop the lowest X rolls from this group
  k<number> - keep the highest X rolls from this group
  h - alter either d or k modifier to affect the highest rolls, e.g. dh3: drop the highest 3 rolls
  l - alter either d or k modifier to affect the lowest rolls, e.g. kl2: keep the lowest 2 rolls
  r - reroll based on certain rules
    r4 - reroll all 4s
    r<3 - reroll anything less than 3
    r>=11 - reroll anything greater than or equal to 11
modifiers can be combined, but d and k are mutually exclusive
```

## Issues/contributing

I'm open to contributions with pull requests. This is not a primary project for me in any way, so don't expect a lot of expedience on issues.

## License

This script has been released under the [MIT license](./LICENSE).
