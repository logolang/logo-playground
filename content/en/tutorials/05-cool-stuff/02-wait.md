LOGO's turtle could be very fast and draw lots of things almost in an instant.
Sometimes it is required to make a small delay to have an animation effect.
In order to achieve that you can use `wait <number>` command. It expects one argument which specifies the delay time. The waiting time is measured in `1/60` fractions of a second, so that `wait 60` will make a delay of exactly 1 second, `wait 120` will wait 2 seconds and so on.

Take a look at this example:

<!--logo {"width":"300px", "height":"200px", "code": true, "solution": true}-->

```
repeat 10000 [
  fd 1
  rt 1 + random 2
  wait 1
]
```

Here the turtle waits for 1/60 fraction of a second on each loop iteration while drawing a sligtly randomized circle.
