Now that we know how to control the label appereance we can write a label wherever we want in the turtle's world. How will we do it? In previous lessons we learned how to set turtle position using `forward`, `right` and `left`, and use `penup` and `pendown` when we don't want to draw anything. We will now lift the pen up, move our turtle, put the pen down and then write the label.

Write red label “victory” in the left top corner.

```result
penup
fd 100
lt 90
fd 200
pendown
setcolor 4
setlabelheight 30
rt 180
label "victory
```
