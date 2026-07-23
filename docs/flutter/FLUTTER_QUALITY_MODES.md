# Flutter Quality Modes

| Mode     |             Aurora | Artwork motion          | Trails | Parallax        | Blur |
| -------- | -----------------: | ----------------------- | -----: | --------------- | ---: |
| high     | 4 layers, animated | Ken Burns + drift       |      2 | precise pointer |   42 |
| balanced | 3 layers, animated | light Ken Burns + drift |      1 | precise pointer |   28 |
| reduced  |    2 static layers | static                  |      0 | off             |    8 |
| static   |    2 static layers | static                  |      0 | off             |    0 |

Explicit/test override wins. Accessibility preferences then remove effects. No startup benchmark guesses device power; future app policy may select a mode deterministically.
