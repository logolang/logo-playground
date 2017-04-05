# The Color of the Pen

The turtle can draw in different 15 colors.

| Color number | Color name | Color                                                                              |
| ------------ | ---------- | ---------------------------------------------------------------------------------- |
| 0            | Black      | <div style="background-color: black; width: 50px; height: 20px;">&nbsp;</div>      |
| 1            | Blue       | <div style="background-color: blue; width: 50px; height: 20px;">&nbsp;</div>       |
| 2            | Lime       | <div style="background-color: lime; width: 50px; height: 20px;">&nbsp;</div>       |
| 3            | Cyan       | <div style="background-color: cyan; width: 50px; height: 20px;">&nbsp;</div>       |
| 4            | Red        | <div style="background-color: red; width: 50px; height: 20px;">&nbsp;</div>        |
| 5            | Magenta    | <div style="background-color: magenta; width: 50px; height: 20px;">&nbsp;</div>    |
| 6            | Yellow     | <div style="background-color: yellow; width: 50px; height: 20px;">&nbsp;</div>     |
| 7            | White      | <div style="background-color: white; width: 50px; height: 20px;">&nbsp;</div>      |
| 8            | Brown      | <div style="background-color: brown; width: 50px; height: 20px;">&nbsp;</div>      |
| 9            | Tan        | <div style="background-color: tan; width: 50px; height: 20px;">&nbsp;</div>        |
| 10           | Green      | <div style="background-color: green; width: 50px; height: 20px;">&nbsp;</div>      |
| 11           | Aquamarine | <div style="background-color: aquamarine; width: 50px; height: 20px;">&nbsp;</div> |
| 12           | Salmon     | <div style="background-color: salmon; width: 50px; height: 20px;">&nbsp;</div>     |
| 13           | Purple     | <div style="background-color: purple; width: 50px; height: 20px;">&nbsp;</div>     |
| 14           | Orange     | <div style="background-color: orange; width: 50px; height: 20px;">&nbsp;</div>     |
| 15           | Gray       | <div style="background-color: gray; width: 50px; height: 20px;">&nbsp;</div>       |

The command for changing the pen's color is `setcolor` followed by the color's number. For example: `setcolor 15`

Set the color to 2 and go forward 50 points.

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
setwidth 10
fd 60
setcolor 2
fd 50
```
