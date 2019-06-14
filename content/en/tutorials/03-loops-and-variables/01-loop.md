Very often you might feel that you want to repeat some commands several times. For example in order to draw a square you might write this program:

<!--logo {"width":"300px", "height":"150px", "code":true}-->

```
fd 50 rt 90
fd 50 rt 90
fd 50 rt 90
fd 50 rt 90
```

It is not very comfortable having to repeat the same commands over and over.
To make it more convenient LOGO offers the possibility of repeating a list of commands. The full syntax is this: `repeat <count> [ <commands> ]`. You need to specify count of repetition and the commands to repeat in the square brackets.

This example repeats 4 times commands `fd 50 rt 90` and draws exactly the same square:

```
repeat 4 [
  fd 50 rt 90
]
```

The whole usage of `repeat` command in general is called a loop. Loops are used in programming to repeat a specific block of code.

Please write the repeat loop to draw a hexagon:

<!--logo {"width":"300px", "height":"200px", "solution": true}-->

```
repeat 6 [
  fd 50 rt 60
]
```
