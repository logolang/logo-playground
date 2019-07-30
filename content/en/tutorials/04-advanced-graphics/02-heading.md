In the previous lesson we have changed the turtle's location with `setxy` command.
But you might have noticed that turtle's rotation state was not affected.

Of course you can still use `right` or `left` commands, but you can also use `setheading <angle>` command. It will turn the turtle clockwise starting from default 12-o'clock position by the specified amount of degrees.

It might be useful when you want to set turtle to face some specific direction regardless of it's current position.

Example:

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
setheading 90
label "90\ degrees
setxy 0 50
setheading 270
label "270\ degrees
setheading 90
label "back\ to\ 90\ degrees
```
