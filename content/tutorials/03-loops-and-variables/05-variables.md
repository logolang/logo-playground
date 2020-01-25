In computer programming, a **variable** is the most simple form of storage.
A variable has the ability to remember a value that was set into it.
It's a named area of computer memory that stores one item of data, such as a number, character or a text.
If you're familiar with spreadsheets already, you can think of variables as being like the cells, which you can then use in formulae regardless of the values they contain.

To create a new variable we will use the following command:

```
make "<name> <value>
```

For example: the command `make "x 3` will set the value `3` in the variable `x`.

### Variables and parameters

In fact you have already used a special type of variables - procedure parameters. The difference is that procedure parameters are declared with a colon `:` prefix and the value is set when the procedure is called. But if you want to create a **variable** with `make` command you need to specify variable name as text, and the text in LOGO should be prefixed with a quote `"` symbol. Once the variable is created in order to use the value you should prefix the name with a colon `:` the same way as with procedure parameters.

Another example, lets declare a variable with some text value in it and then print a label using that variable.

<!--logo {"width":"300px", "height":"80px", "code": true}-->

```
make "greeting "Hello
setlabelheight 32
rt 90
label :greeting
```

In this very simple example we have created a variable with name `greeting` and the value `Hello` stored in it.
Then we successfully used that value as input for `label` command.

For another example are going to create a variable named `fillcolor` and will use it several times:

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
rt 90 pu bk 100 pd
make "fillcolor 5
filled :fillcolor [arc 360 50]
pu fd 100 pd
filled :fillcolor [arc 360 40]
pu fd 80 pd
filled :fillcolor [arc 360 30]
```

Here it is clearly illustrated the benefits of using a variable - we have defined the value for our filling color only once and later we have used it 3 times.

Now you also can create your own variables. Please define a variable with name `radius` and value `20`. Then use that variable to draw 6 circles in a repeat loop aligned like this:

<!--logo {"width":"300px", "height":"200px", "solution": true}-->

```
make "radius 20
repeat 6 [
  arc 360 :radius
  fd :radius
  fd :radius
  rt 60
]
```

If you change the value of the `radius` variable to 30 or 50 the whole picture would be scaled accordingly.
