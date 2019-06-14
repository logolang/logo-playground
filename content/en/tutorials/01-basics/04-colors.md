Just using the black color is a little bit boring, so we are going to learn how to make our graphics to be more colorful.

The command for changing the pen's color is `setcolor` followed by the color's number. For example: `setcolor 11`

The turtle can draw in different 16 colors listed in this table:

|                                                                                        |                                                                                      |                                                                                               |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| <span style="background-color: black; color: white; padding: 4px;">0: Black</span>     | <span style="background-color: yellow; color: black; padding: 4px;">6: Yellow</span> | <span style="background-color: aquamarine; color: black; padding: 4px;">11: Aquamarine</span> |
| <span style="background-color: blue; color: white; padding: 4px;">1: Blue</span>       | <span style="background-color: white; color: black; padding: 4px;">7: White</span>   | <span style="background-color: salmon; color: black; padding: 4px;">12: Salmon</span>         |
| <span style="background-color: lime; color: black; padding: 4px;">2: Lime</span>       | <span style="background-color: brown; color: white; padding: 4px;">8: Brown</span>   | <span style="background-color: purple; color: white; padding: 4px;">13: Purple</span>         |
| <span style="background-color: cyan; color: black; padding: 4px;">3: Cyan</span>       | <span style="background-color: tan; color: black; padding: 4px;">9: Tan</span>       | <span style="background-color: orange; color: black; padding: 4px;">14: Orange</span>         |
| <span style="background-color: red; color: black; padding: 4px;">4: Red</span>         | <span style="background-color: green; color: white; padding: 4px;">10: Green</span>  | <span style="background-color: gray; color: white; padding: 4px;">15: Gray</span>             |
| <span style="background-color: magenta; color: black; padding: 4px;">5: Magenta</span> |                                                                                      |                                                                                               |

Now you can add some colors to your drawing, like this:

<!--logo {"width":"200px", "height":"150px"}-->

```
pu setx -50 pd
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
