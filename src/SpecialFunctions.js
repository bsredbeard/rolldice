const syntax = [
  'Supports standard dice notation, as well as some extended functionality.',
  'syntax: <roll>[<operator><roll><operator><roll>...][<operator><constant>]',
  'roll: [<number of dice>]d<number of sides>[<modifiers>]',
  '      default number of dice: 1',
  'number of sides: any integer, or f (for Fudge dice)',
  'operator: + or -',
  'constant: any integer',
  'modifiers:',
  '  ! - exploding dice, a maximum roll value causes recursive reroll and summation',
  '  d<number> - drop the lowest X rolls from this group',
  '  k<number> - keep the highest X rolls from this group',
  '  h - alter either d or k modifier to affect the highest rolls, e.g. dh3: drop the highest 3 rolls',
  '  l - alter either d or k modifier to affect the lowest rolls, e.g. kl2: keep the lowest 2 rolls',
  '  r - reroll based on certain rules',
  '    r4 - reroll all 4s',
  '    r<3 - reroll anything less than 3',
  '    r>=11 - reroll anything greater than or equal to 11',
  'modifiers can be combined, but d and k are mutually exclusive'
].join('\n');

const specialData = new Map();
specialData.set('barrel', 'Donkey Kong rolls a barrel down the ramp and crushes you. -1000pts');
specialData.set('rick', 'No.');
specialData.set('katamari', 'Na naaaaa, na na na na na na, na na Katamari Damacy....');
specialData.set('help', syntax);
specialData.set('syntax', syntax);

/**
 * Exposes an api to check for special responses
 */
class SpecialFunctions{
  /**
   * Check for a special response to a roll argument
   * @param {string} expression the roll expression to check against the special functions
   */
  getSpecial(expression){
    if(expression && specialData.has(expression)){
      return specialData.get(expression);
    }
    return null;
  }
}

module.exports = new SpecialFunctions();
