Decision-making and variables often go together. In some cases a program needs to be able to change course depending on the situation, especially handling external inputs.

So, how to check conditions in LOGO? First you need to have some logical expression to check. Such an expression typically is evaluated based on some variables or function calls.

Here are examples of some logical expressions:

`1 > 0` - result is `true`

`1 = 2` - result is `false`

`:count > 10` - result depends on a value of variable `count`

As an example lets assume you want to write a program where LOGO's turtle randomly jumps and draws 1 of 4 randomly chosen figures: star, circle, triangle or square. Then your logic could be described in human language like this:

1. Make a random jump
2. Get a random number from 1 to 4
3. If you have a 1 then draw a star
4. If you have a 2 then draw a circle
5. If you have a 3 then draw a triangle
6. If you have a 4 then draw a square
7. Repeat from 1st step

How we do achieve such conditional behavior in LOGO?

```
if <expr> [
  statements ...
]
```

Here the `if` is a LOGO's syntax keyword which allows to execute some statements based on a provided logical expression.

Another useful LOGO keyword is `ifelse`:

```
ifelse <expr> [
  statements ...
] [
  statements ...
]
```

It executes first set of statements if the expression is true, otherwise executes the second set.

### Example program

We can write our program with turtle's random jumping and drawing like this:

<!--logo {"width":"220px", "height":"220px", "code": true}-->

```
hideturtle

repeat 10000 [
  make "die 1 + random 4

  if :die = 1 [ ;draw a star
    setpencolor 14
    filled 14 [repeat 5 [fd 30 rt 144] ]
  ]
  if :die = 2 [ ;draw a circle
    setpencolor 4
    filled 4 [arc 360 15]
  ]
  if :die = 3 [ ;draw a triangle
    setpencolor 2
    filled 2 [repeat 3 [fd 30 rt 120] ]
  ]
  if :die = 4 [ ;draw a square
    setpencolor 6
    filled 6 [repeat 4 [fd 25 rt 90] ]
  ]

  wait 60
  clearscreen
  penup
  ;random jump
  setxy (random 200)-100 (random 200)-100
  pendown
]
```

### Exercise

Please write a "Dice Roller" program which generates a random number from 1 to 6 and then draws a dice of that number.

<!--logo {"width":"300px", "height":"200px", "solution": true}-->

```
to jump :fw :side
  penup
  forward :fw
  rt 90
  forward :side
  lt 90
  pendown
end

to drawdot
  filled 0 [ arc 360 10 ]
end

to dice :value
  repeat 4 [ fd 100 rt 90 ]

  if :value = 1 [
    jump 50 50 drawdot
    jump -50 -50
  ]

  if :value = 2 [
    jump 30 30 drawdot
    jump 40 40 drawdot
    jump -70 -70
  ]

  if :value = 3 [
    jump 25 25 drawdot
    jump 25 25 drawdot
    jump 25 25 drawdot
    jump -75 -75
  ]

  if :value = 4 [
    jump 30 30 drawdot
    jump 0 40 drawdot
    jump 40 0 drawdot
    jump 0 -40 drawdot
    jump -70 -30
  ]

  if :value = 5 [
    jump 25 25 drawdot
    jump 0 50 drawdot
    jump 50 0 drawdot
    jump 0 -50 drawdot
    jump -25 25 drawdot
    jump -50 -50
  ]

  if :value = 6 [
    jump 30 25 drawdot
    jump 0 25 drawdot
    jump 0 25 drawdot
    jump 40 0 drawdot
    jump 0 -25 drawdot
    jump 0 -25 drawdot
    jump -70 -25
  ]
end

setpencolor 7
fill
setpencolor 0
make "v1 1 + random 6
jump -50 20
dice :v1
make "v2 1 + random 6
jump 0 -140
dice :v2
```
