
### Basic Commands

```
forward X, fd X
```
Moves the turtle `X` points forward

```
back X, bk X
```
The turtle goes back `X` points

```
left X, lt X
```
Rotate the turtle left `X` degrees

```
right X, rt X
```
Rotate the turtle right `X` degrees

```
clearscreen, cs
```
Will clear the screen and return the turtle home


### Colors

```
setcolor X
```
Will set the turtle color accroding to the following table

|     |                                                                 |                          |     |                                                                   |
| --- | --------------------------------------------------------------- | ------------------------ | --- | ----------------------------------------------------------------- |
| 0   | <div style="background-color: black; color: white;">Black</div> | &nbsp;&nbsp;&nbsp;&nbsp; | 8   | <div style="background-color: brown; color: white;">Brown</div>   |
| 1   | <div style="background-color: blue; color: white;">Blue</div>   |                          | 9   | <div style="background-color: tan;">Tan</div>                     |
| 2   | <div style="background-color: lime;">Lime</div>                 |                          | 10  | <div style="background-color: green; color: white;">Green</div>   |
| 3   | <div style="background-color: cyan;">Cyan</div>                 |                          | 11  | <div style="background-color: aquamarine;">Aquamarine</div>       |
| 4   | <div style="background-color: red; ">Red</div>                  |                          | 12  | <div style="background-color: salmon;">Salmon</div>               |
| 5   | <div style="background-color: magenta;">Magenta</div>           |                          | 13  | <div style="background-color: purple; color: white;">Purple</div> |
| 6   | <div style="background-color: yellow;">Yellow</div>             |                          | 14  | <div style="background-color: orange;">Orange</div>               |
| 7   | <div style="background-color: white;">White</div>               |                          | 15  | <div style="background-color: gray; color: white;">Gray</div>     |


```
setcolor [R,G,B]
```    
Will set the turtle color accroding to the amount of red, green and blue for example `setcolor [50 100 50]`

```
fill
```
Does a paint bucket flood fill at the turtle's position

```
filled fillcolor [ statements ... ]
```
Execute statements without drawing but keeping track of turtle movements. 
When complete, fill the region traced by the turtle with fillcolor and outline the region with the current pen style

#
### Controlling the Pen

```
penup, pu
```
Turtle stops leaving a trail

```
pendown, pd
```
The turtle will leave a trail
            
```
setwaittime X, swt X
```
Will set the waiting time to `X` milliseconds

```
wait
```
Will cause the turtle to wait before executing the command

```
setwidth X
```
Will set the pen width to `X`

```
hideturtle, ht
```
Hide the turtle

```
showturtle, st
```
Show the turtle

```
home
```
Moves the turtle to center, pointing upwards

```
setx X, sety Y
```
Moves turtle to specified coordinate on X or Y axis

```
setxy X Y
```
Move turtle to the specified location at coordinates (`X`, `Y`)

```
setheading X , seth X
```
Rotate the turtle to the specified heading
            
```
arc ANGLE, RADIUS
```
Will create an arc at distance `RADIUS` covering `ANGLE` angle

```
ellipse W H
```
Turtle draws an ellipse width `W` and height `H`

```
pos, xcor, ycor
```
Outputs the current turtle position as [X Y], X or Y respectively

```
heading
```
Outputs the current turtle heading

```
towards
```
Outputs the heading towards the specified [X Y] coordinates
          

#
### Loops and procedure

```
repeat X [ statements ... ]
```
Repeat statements in the square brackets X times

```
repcount
```
Outputs the current iteration number of the current repeat or forever

```
for controllist [ statements ...]
```
Typical for loop. The controllist specifies three or four members: the local varname, start value, limit value, and optional step size

```
to PROCNAME inputs ... statements ... end
```
Define a new named procedure with optional inputs

```
make varname expr
```
Update a variable or define a new global variable. The variable name must be quoted, e.g. ```make 'foo 5```
                
```
:VARNAME
```
Access the content of `VARNAME`


### Math

```
sum X Y
```
Returns the sum of `X` and `Y`

```
minus x y
```
Returns the distance between `X` and `Y`
            
```
random X
```
Will choose a random number between 0 and (X-1)

```
modulo expr expr
```
Outputs the remainder (modulus). For remainder and % the result has the same sign as the first input.
For modulo the result has the same sign as a the second input.
  

### Lists

```
list thing1 thing2 ...
```
Create a new list from the inputs


```
first listname
```
Outputs the first item from the list

```
butfirst listname, bf listname
```
Outputs all the items of `listname` except for the first item

```
last listname
```
Outputs the last item from the list

```
butlast listname
```
Outputs all the items of listname except for the last item

```
item index list
```
Outputs the indexlist item of the list or array

```
pick listname
```
Outputs one item from a list, at random
