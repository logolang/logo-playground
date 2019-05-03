In this lesson we will learn how to work with labels. By the end of this lesson you will be able to print your name everywhere on the screen.

The label command is `label` followed by text. In order to define the text it is required to start the text with an open quotation mark.

This example should print a hello message:

```
label "hello
```

As you may notice the text is printed in the direction of turtle's head. So, in order to print the text horizontally we need first to turn the turtle right.

We can control the font size of our label with `setlabelheight <number>` command. Number should represent a size of the font.

This will set label size to 40:

```
setlabelheight 40
```

Text is printed using the pen color, so if you want to change the color of the text you can use `setcolor` command

Now you need to use all this commands together to print big "Hello" text in horizontal direction with size of 100 and color of 5.

<!--solution-->

```
rt 90
setcolor 5
setlabelheight 100
label "Hello
```
