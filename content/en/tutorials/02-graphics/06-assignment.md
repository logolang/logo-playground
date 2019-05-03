Now it is a good time to combine already learned material and practice drawing simple figures.

This is going to be a composition of several simple figures and a label.

Please draw a picture similar to this example:

<!--logo {"width":"200px", "height":"150px"}-->

```
filled 4 [
  fd 50 rt 90
  fd 50 rt 90
  fd 50 rt 90
  fd 50 rt 90
]

pu lt 90 fd 10 pd

filled 1 [
  arc 360 25
]

pu fd 10 pd

filled 14 [
  fd 50 rt 120
  fd 50 rt 120
  fd 50 rt 120
]

pu fd 70 lt 90 fd 50 lt 90 pd
setlabelheight 20
label "LOGO\ is\ awesome
```

As a hint this is a list of steps:

1. Draw a square
2. Move the turtle without drawing a line behind
3. Draw a circle
4. Move the turtle
5. Draw a triangle
6. Move a turtle
7. Draw a label

Good luck!

<!--solution-->

```
filled 4 [
  fd 50 rt 90
  fd 50 rt 90
  fd 50 rt 90
  fd 50 rt 90
]

pu lt 90 fd 10 pd

filled 1 [
  arc 360 25
]

pu fd 10 pd

filled 14 [
  fd 50 rt 120
  fd 50 rt 120
  fd 50 rt 120
]

pu lt 90 fd 50 lt 90 bk 70 pd
setlabelheight 20
label "LOGO\ is\ awesome
```
