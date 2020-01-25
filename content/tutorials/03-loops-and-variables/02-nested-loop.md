Lets take a look at the the improved square example from previous step. Now each point of a square is decorated with a small circle:

<!--logo {"width":"300px", "height":"150px", "code": true}-->

```
repeat 4 [
  arc 360 10
  fd 50
  rt 90
]
```

Any command can be done inside a loop.
We can even use a loop within a loop.
A loop inside another loop is called a nested loop.
You can picture the nested loop as a loop that is sitting in a bird's nest of the mother loop.

Let's draw small squares instead of small circles. We need to replace the old code drawing a circle with a new code drawing a small square.
Here it is:

<!--logo {"width":"300px", "height":"150px", "code": true}-->

```
repeat 4 [
  repeat 4 [
    fd 10
    rt 90
  ]
  fd 50
  rt 90
]
```

Using loops we can easily draw lots of crazy symmetric shapes.

**Your task:** Please draw 12 triangles in a circle using a nested loop. In order to do that a little math is required. If the full circle takes 360 degrees, then in order to make 12 sections you need to turn each time to `360 / 12 = 30` degrees.

<!--logo {"width":"300px", "height":"300px", "code": false}-->

```
pu setxy -90 -20 pd
repeat 12 [
  fd 50
  rt 30
  repeat 3 [
    fd 25
    rt 120
  ]
]
```

<!--solution-->

```
repeat 12 [
  fd 50
  rt 30
  repeat 3 [
    fd 25
    rt 120
  ]
]
```
