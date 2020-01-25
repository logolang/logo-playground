With LOGO you have an ability to adjust screen scaling.
This is sometimes handy when you need to draw the same shape in different sizes
and you don't want to change your code to introduce scaling variable there.

The command is: `setscrunch <sx> <sy>` - sets the graphics scaling factors.

### Example 1

Sets the Y scale to factor 2, producing the effect of vertically stretched picture.

<!--logo {"width":"300px", "height":"300px", "code": true}-->

```
setscrunch 1 2
arc 360 50
```

### Example 2

Changing the scales and drawing the same figure

<!--logo {"width":"300px", "height":"300px", "code": true}-->

```
setscrunch 1 2
arc 360 50
setscrunch 2 1
arc 360 50
setscrunch 1 1
arc 360 50
setscrunch 0.5 0.5
arc 360 50
```

> Please note that scaling also affects a pen width.
