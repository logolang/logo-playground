Until now you have been using a pen that draws a black line the width of 1 point. The width of the line means how thick the line is. If we want to draw more beautiful things, sometimes we'll want to use a wider or narrower line, or choose a different color. The command to change the pens width is `setwidth` followed by a number. The number will represent the new width of the line, counting it in points.

Set the pen width to 5 and move the turtle forward 50 points.

```result
fd 30
penup
fd 30
pendown
fd 30
hideturtle
lt 90 
fd 40
showturtle
setwidth 5
fd 50
```