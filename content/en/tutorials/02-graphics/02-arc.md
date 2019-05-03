So far we have drawn only straight lines, but LOGO also has embedded functionality to draw circles and segments.

The command is `arc <angle> <radius>`.

It draws an arc of a circle, with the turtle at the center, with the specified radius, starting at the turtle's heading and extending clockwise through the specified angle. The turtle does not move.

For example the command `arc 90 50` will produce this result:

<!--logo {"width":"200px", "height":"150px"}-->

```
arc 90 50
```

If you want to draw a full circle then you can do that by setting the angle to 360 like this:

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
arc 360 50
```

As the turtle starts drawing the arc from it's heading direction then you need to rotate the turtle in case you want to draw a section of different part of the circle.

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
rt 180
arc 45 50
```

To change width and color of the line it is possible to use the same `setwidth` and `setcolor` functions to manipulate turtle's pen.

So, are you ready for a new challenge?
Please draw a 3-color "rainbow" of red, yellow and lime colors:

<!--logo {"width":"200px", "height":"150px"}-->

```
left 90
setwidth 10
setcolor 2
arc 180 50
setcolor 6
arc 180 60
setcolor 4
arc 180 70
```

<!--solution-->

```
left 90
setwidth 10
setcolor 2
arc 180 50
setcolor 6
arc 180 60
setcolor 4
arc 180 70
```
