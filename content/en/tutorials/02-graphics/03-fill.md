So far we have learned how to create a lot of amazing shapes using the Logo's turtle, but sometimes in order to make the shape more vivid we would like to add some background color for it. In this lesson we will study how to fill the shape background with colors using the `fill` command.

Fill command will create a background around the turtle current position. If the turtle is fully surrounded by a shape than only the shape background will be filled. In order to show the fill command we will do it in few steps:

- First we will create a shape - circle
- We will fill the background with `fill` command

Write down the commands and execute your program:

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
arc 360 50
fill
```

As you can see the turtle fill the circle with black color. In order to change fill color you can change color of the pen with `setcolor` command.

Quite important is to ensure that figure to fill has boundaries from every side. If not then the paint will spread outside and can cover entire screen like in this example:

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
arc 270 50
setcolor 14
fill
```

Excercise:

- Draw a triangle with `fd 100 rt 120 fd 100 rt 120 fd 100 rt 120` commands
- Lift pen up, go inside the triangle and set pen down: `rt 30 pu fd 50 pd`
- Set pen color to red with `setcolor 4`
- Execute `fill` command

<!--solution-->

```
fd 100 rt 120 fd 100 rt 120 fd 100 rt 120
rt 30 pu fd 50 pd
setcolor 4
fill
```
