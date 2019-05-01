Imagine that Logo's turtle, the one we have gotten to know in the past lesson, is holding a pen in his hand while he's walking. He is using the pen to draw a line of his movement whenever he receives a command such as to go forward.

Now you can discover new commands allowing to manipulate the pen.

`penup` - lifts the pen up, so turtle will not draw anymore. This is very useful when you want to move turtle in another place, but without leaving a trail behind.

`pendown` - sets the pen down, so it is ready to draw.

`setpensize {number}` - sets the width of line (in pixels). You can experiment with it, by default line has width of 1, if you make it 2 then in will be twice wider.

To try out new commands you can modify zig-zag excercise from previous step to skip the middle section and also use wide line.

![](./zig-zag-skip.svg)

<!--solution-->

```
setpensize 5
right 45
forward 50
penup
right 90
forward 50
left 90
pendown
forward 50
```
