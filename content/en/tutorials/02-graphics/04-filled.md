Another way to get figures with background is to use `filled` command.
It is a little bit more complicated and syntax goes as:

```
filled <color> [ <commands> ]
```

Here you need to specify the paint color and also in square braces provide the list of commands which will draw a figure.

The main difference from `fill` command is that there you draw the figure first and next you perform the fill. With `filled` command you declare your filling intention **before** actual drawing. Notice the filled command will fill only area created by the sequence of commands specified in it's commands block in square braces.

Example from previous step:

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
filled 4 [
  fd 50 rt 120 fd 50 rt 120 fd 50 rt 120
]
```

Another difference is that you do not need to go **inside** the figure in order to fill it. Also if you draw the figure without all the boundaries then missing boundary will be drawn automatically:

<!--logo {"width":"200px", "height":"150px", "code":true}-->

```
filled 14 [
  fd 50 rt 90 fd 50
]
```

Excercise: Draw a filled circle using arc command with radius 100 and color 13.

<!--solution-->

```
filled 13 [
  arc 360 100
]
```
