LOGO programming language has different loop types. All this loops have in common that they perform repetition of specified list of statements. Different is the way of declaring conditions for continuing/stopping the loop.
You can always terminate the loop from inside using this commands:

- `stop`: End the running procedure with no output value.
- `output`: End the running procedure and output the specified value.
- `bye`: Terminate the program.

## Forever

This is a simplest loop ever. It will just repeat your commands defined in the loop body forever.

```
forever [
  statements ...
]
```

## Repeat

Repeats statements N times.

```
repeat <N> [
  statements ...
]
```

For `repeat` and `forever` loops you can use command `repcount` which outputs the current iteration number of the loop.

```
repeat 10 [ print repcount ]
```

## While

Runs the specified statements only while the expression remains true.

```
while <expr> [
  statements ...
]
```

## Do while

Runs the specified statements at least once, and repeats while the expression is true.

```
do.while [
  statements ...
] <expr>
```

## Do until

Runs the specified statements at least once, and repeats while the expression is false.

```
do.until [
  statements ...
] <expr>
```
