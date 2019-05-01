The command for changing the pen's color is `setcolor` followed by the color's number. For example: `setcolor 11`

The turtle can draw in different 16 colors listed in this table:

|                                                                          |                                                                        |                                                                                 |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| <span style="background-color: black; color: white;">0: Black</span>     | <span style="background-color: yellow; color: black;">6: Yellow</span> | <span style="background-color: aquamarine; color: black;">11: Aquamarine</span> |
| <span style="background-color: blue; color: white;">1: Blue</span>       | <span style="background-color: white; color: black;">7: White</span>   | <span style="background-color: salmon; color: black;">12: Salmon</span>         |
| <span style="background-color: lime; color: black;">2: Lime</span>       | <span style="background-color: brown; color: white;">8: Brown</span>   | <span style="background-color: purple; color: white;">13: Purple</span>         |
| <span style="background-color: cyan; color: black;">3: Cyan</span>       | <span style="background-color: tan; color: black;">9: Tan</span>       | <span style="background-color: orange; color: black;">14: Orange</span>         |
| <span style="background-color: red; color: black;">4: Red</span>         | <span style="background-color: green; color: white;">10: Green</span>  | <span style="background-color: gray; color: white;">15: Gray</span>             |
| <span style="background-color: magenta; color: black;">5: Magenta</span> |                                                                        |                                                                                 |

Now you can add some colors to your drawing, like this:

![](./zig-zag-colors.svg)

<!--solution-->

```
setpensize 5
setcolor 4
right 45
forward 50
penup
right 90
forward 50
left 90
pendown
setcolor 2
forward 50
```
