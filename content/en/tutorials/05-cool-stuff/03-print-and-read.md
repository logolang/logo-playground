## Readword

The `readword` command prompts the user for input. The result of the user input is returned back to LOGO program available for later computation.
Most commonly you want to store the result in some variable to use later.
This could be achieved with the `make "variable` command. Check the following example:

### Example

```
make "n readword
repeat :n [
  penup
  setxy random 100 random 100
  pendown
  arc 360 2
]
```

This program first asks the user to provide some value. Then the value is stored in a variable `n`. Then this value is used in a `repeat` loop to draw a randomly positioned circle `n` times.

## Print

Another useful procedure is a `print <value>`. It just prints provided value on the screen in a new line.
It is somewhat similar to typing machine, each call to the function `print` will make a new line of text, and there is no control how exactly this text will look like - it is just
printed on the screen.

## Cleartext

In order to clean the printed text you can use the command `cleartext`.

### Example

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
repeat 1000000 [
  print random 1000
  print random 1000
  print random 1000
  print random 1000
  wait 10
  cleartext
]
```

In this example we have a `repeat` loop which is set to perform one million iterations.
Each time it just repeats 4 random values from 0 to 1000, waits 1/6 of second and then clears the printed text.
As a result you can see the endless animation of 4 numbers on the screen.
