Now, as our programs got a little bit more complex, it seems like a good time to introduce the concept of a procedure.

Procedures are the basic building blocks of programs. They are small sections of code that are used to perform a particular task, and they are used for two main reasons:

- Avoiding repetition of commands within the program. If you have operations that are performed in various different parts of the program, then it makes sense to remove the repeated code and create a separate procedure that can be called from those places instead.
- Defining a logical structure for your program by breaking it down into a number of smaller modules with obvious purposes.

Lets start from an example:

<!--logo {"width":"300px", "height":"150px", "code": true}-->

```
to square
  repeat 4 [fd 50 rt 90]
end

square
rt 45
square
```

What is happening in this example? First, we define our new procedure called `square`. We put the name of our procedure after keyword `to`, then we write our commands and then the keyword `end` declares the end of our procedure. Inside the procedure we can put so many commands as we want.

```
to <name>
  <... commands>
  <... commands>
end
```

After we have declared the procedure we can execute it the same way as any other LOGO command. In the example we call it once and the square is drawn. Then we turn the turtle right to 45 degrees and call our `square` procedure yet another time. The square is drawn again, but now in a different position.

Now you can try to create your own procedure for triangle. You need to produce a similar picture, which consists of 3 triangles:

<!--logo {"width":"300px", "height":"150px", "solution": true}-->

```
to triangle
  repeat 3 [fd 50 rt 120]
end

triangle
rt 120
triangle
rt 120
triangle
rt 120
```
