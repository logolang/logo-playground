Procedures are great, but what makes them even better is the ability to pass down parameters. Lets have a look to the `square` example from previous step:

```
to square
  repeat 4 [
    fd 50
    rt 90
  ]
end
```

What makes it not very useful? Surely it draws a square but only of 50 size. Do we need to declare the same procedure but with the name `small_square` or `big_square` in order to draw different size? That would be one possible approach, but better to use a procedure with parameters. Like LOGO's standard `forward` command expects us to define number of steps or `arc` command wants to have 2 parameters: angle and radius.

Lets define our `square` procedure with a parameter:

```
to square :size
  repeat 4 [
    fd :size
    rt 90
  ]
end
```

What is different now? We have added a parameter called `size`, and now it's value used for `fd` command instead of value of 50.
Now when we call our procedure we need to specify a size as well:

```
square 25
```

It is important to use the colon symbol `:` as a prefix for your parameter's names. It helps LOGO to understand that this is a parameter declaration and not just a command to include into your procedure.
You can specify as many parameters as you want, you just need to keep the correct order when you call the procedure.

Lets extend our example to accept 2 parameters:

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
to square :size :fillcolor
  filled :fillcolor [
    repeat 4 [ fd :size rt 90 ]
  ]
end

square 50 4
rt 120
square 30 6
rt 120
square 90 2
```

And we can make it even more flexible and write a procedure to draw a polygon of specified number of edges, size and color:

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
to polygon :edges :size :fillcolor
  filled :fillcolor [
    repeat :edges [
      fd :size
      rt 360 / :edges
    ]
  ]
end

polygon 6 60 2
polygon 4 50 6
polygon 3 40 4
```

Now it's you turn to write the similar procedure and to experiment with polygons of different shape, size and color.

<!--solution-->

```
to polygon :edges :size :fillcolor
  filled :fillcolor [
    repeat :edges [
      fd :size
      rt 360 / :edges
    ]
  ]
end

polygon 360 2 5
polygon 5 50 3
```
