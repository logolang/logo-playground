So far you have learned how to declare your variables and to use assigned values afterwards.
Another important thing that you can do is to update the value inside the variable. This might be useful in a various sets of scenarios. You can imagine the counter which increments with each loop iteration or a text variable storing different values based on some conditions.

Lets have an example with an increment:

<!--logo {"width":"300px", "height":"40px", "code": true}-->

```
rt 90 pu
make "x 1
repeat 5 [
  label :x
  fd 20
  make "x :x+1
]
```

Here the variable `x` is declared again in each iteration of repeat loop. And the value to assign to new `x` variable is a result of evaluated expresion which is a simple calculation of adding `1` to the old value of `x`. This allows as to increment value at the end of each loop iteration.

We can easily change this example in order to print only odd numbers. Just update this line:

```
make "x :x+2
```

<!--logo {"width":"300px", "height":"40px"}-->

```
rt 90 pu
make "x 1
repeat 5 [
  label :x
  fd 20
  make "x :x+2
]
```

Your task: draw a clock dial like this:

<!--logo {"width":"300px", "height":"300px", "solution": true}-->

```
make "x 1
arc 360 120
penup
repeat 12 [
  rt 30
  fd 100
  rt 90
  label :x
  lt 90
  bk 100
  make "x :x+1
]
```
