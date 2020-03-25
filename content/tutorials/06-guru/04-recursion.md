## Recursion

Recursion is a programming technique when a command calls itself. Recursive commands all follow the same pattern: they do a little work, then call themselves with simpler inputs. This, in turn, will do a little more work and call itself with even simpler inputs. When the input is so simple that there's essentially nothing to be done, the command just stops without doing any work (and without calling itself). Don't worry if you don't see why recursion is useful, that will become clear when we go through a few activities.

Anything you can do with a `repeat` loop can also be done with recursion. For example, let's take a simple routine for drawing a square:

```
to square
  repeat 4 [ fd 100 rt 90 ]
end

square
```

Now let's write a recursive version of it:

```
to squareReq :sides
  ; check terminating condition
  if :sides = 0 [ stop ]

  ; recursive case - draw a side and call recursively
  fd 100
  rt 90
  squareReq :sides - 1
end

squareReq 4
```

Procedure `squareReq` expects one single parameter - the number of sides of the square to draw. This seems a bit silly, since all squares have four sides, but it's part of how the recursion works.

Observe that there are two parts to the recursive function: the "terminating case" and the "recursive case". As `squareReq` works, it uses the recursive case. The recursive case draws one side of the square, then calls `squareReq` with an input that is one smaller than what it received. It's one smaller because the input represents the number of sides to draw and the command just drew one of them.

The "terminating case" is used when `squareReq` should stop calling itself. This happens when there are no more sides left to be drawn, that is, when `sides` is 0. Without the terminating case, Logo would draw the sides of a square forever.

## Fractals

Fractals are pictures that, when you look at a small area of the picture, it looks similar to the overall picture (and other small areas, too). This property is called "self-similar". Many things in nature can be drawn better with fractals than with simple polygons. For example, think about a pine tree. The main branch (or trunk) has smaller branches coming off it. Those branches have smaller branches coming off of it. And so on, until you get to the pine needles. That is sort of self-similarity is exactly what fractals are.

Fractals are surprisingly easy to draw in Logo with the help of **recursion**.

### Our First Fractal: Embedded Squares

Now let's use recursion to draw a fractal. We'll start with a square. We'll draw a smaller square in every corner of this square. In each of these smaller squares, we'll draw even smaller squares. And so on.

<!--logo {"width":"300px", "height":"300px", "code": true}-->

```
to squareFractal :length :depth

  ; termination case: no more squares
  if :depth = 0 [ stop ]

  ; recursive case: draw a square such that each corner
  ; of the square has squareFractal in it.
  repeat 4 [
    fd :length
    rt 90
    squareFractal :length * 0.4 :depth - 1
  ]

end

pu setxy -100 -100 pd
squareFractal 200 4
```

### More samples

#### Triangle fractal

<!--logo {"width":"300px", "height":"250px", "code": true}-->

```
to triangleFractal :length :depth
  ; termination
  if :depth = 0 [
    fd :length
    stop
  ]

  ; recursive case
  repeat 3 [
    fd :length / 3
    triangleFractal :length / 3 :depth - 1
    fd :length / 3
    rt 120
  ]
end

pu setxy -50 -70 pd
triangleFractal 200 4
```

#### Curly fractal

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
to curlyFractal :size
  if :size < 0.5 [ stop ]
  repeat 360 [
    if repcount = 5 [
      left 90
      curlyFractal :size / 2
      right 90
    ]

    if repcount = 10 [
      left 90
      curlyFractal :size / 5
      right 90
    ]

    if repcount = 15 [
      left 90
      curlyFractal :size / 5
      right 90
    ]

    if repcount = 20 [
      left 90
      curlyFractal :size / 4
      right 90
    ]

    if repcount = 25 [
      left 90
      curlyFractal :size / 5
      right 90
    ]

    if repcount = 30 [
      left 90
      curlyFractal :size / 8
      right 90
    ]

    fd :size
    right repcount
  ]

  right 180
end

pu setxy -50 -50 pd
curlyFractal 10
```
