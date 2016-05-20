Roll some dice
---

A simple hubot script that listens for the following strings in chat

    !roll
    !roll 2d6

The script understands basic dice notation, currently with one modifier.

    d6
    d6 + 2
    4d6k3 - 1
    d4 + 2d12 + 3d3
    
The modifier supported is 'k' for 'keep', e.g. 6d6k4, roll 6 d6, keep highest 4 and reroll rest.

## Issues/contributing

I won't claim the code is pretty, but it seems to be pretty functional. Issues can be logged in my github, but I won't promise that this project takes priority in my life. Issues with pull requests will be considered a much higher priority than those without.

## License

I've licensed this script under the MIT license.