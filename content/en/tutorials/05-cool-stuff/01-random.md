Sometimes it is fun to have an unpredictable outcome of a computation. LOGO provides a `random` procedure to generate a random number.
It has one argument and produces an integer value chosen uniformly at random, which is greater than or equal to 0 and less than the value of its argument.
Thus, if you want a random angle between 0 and 359 degrees, you can use the command `random 360` to produce it.

### Example 1

The turtle moves forvard at random amount of steps from 0 to 80 and then turns right at 90 degrees. Then it repeats it for 100 times.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
repeat 100 [
  fd random 80
  rt 90
]
```

### Example 2

The turtle moves forvard at 10 steps and then turns right at random angle from 0 to 360. Then it repeats it for 1000 times.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
repeat 1000 [
  fd 10
  rt random 360
]
```
