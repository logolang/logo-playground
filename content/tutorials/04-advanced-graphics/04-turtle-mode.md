When the LOGO's turtle is walking on the screen it could happen that he meets the screen boundary.
In this case there are 3 different scenarios how to handle this situation. Handling behaviour depends on active turtle mode which could be activated by these commands:
`wrap` (enabled by default), `window` and `fence`.

Lets use a simple example of zig-zag pattern to visually illustrate each screen mode.

### Wrap (default)

If the turtle moves off the edge of the screen it will continue on the other side. (default)

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
wrap
setxy 125 0
repeat 5 [
  rt 80
  fd 50
  lt 160
  fd 50
  rt 80
]
```

### Window

The turtle can move past the edges of the screen, unbounded.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
window
setxy 125 0
repeat 5 [
  rt 80
  fd 50
  lt 160
  fd 50
  rt 80
]
```

### Fence

If the turtle attempts to move past the edge of the screen it will stop.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
fence
setxy 125 0
repeat 5 [
  rt 80
  fd 50
  lt 160
  fd 50
  rt 80
]
```
