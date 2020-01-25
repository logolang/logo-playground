So far we have learned some useful commands and can use them to produce nice graphic results.
But what is also might be useful is that each of those commands also has a short version. Using such short commands helps to make your programs more compact and save time during typing. On the negative side it makes your code more cryptic and hard to understand.
For example instead of `right` it's enought to write `rt` . In table below are shown full and short versions of commands that we already know.

| Full command | Short command |
| ------------ | ------------- |
| `forward`    | `fd`          |
| `back`       | `bk`          |
| `right`      | `rt`          |
| `left`       | `lt`          |
| `penup`      | `pu`          |
| `pendown`    | `pd`          |
| `setpensize` | `setwidth`    |
| `hideturtle` | `ht`          |
| `showturtle` | `st`          |

You can also use another technique to make your programs be more compact.
It's to have several commands in a sigle line of code. You dont need to use any special symbols, just separate your commands with whitespace. So the previous zig-zag example can be rewritten using short commands in a single line like this:

```
setwidth 5
setcolor 5
rt 45 fd 50 rt 90 fd 50 lt 90 fd 50
ht
```

<!--logo {"width":"200px", "height":"150px"}-->

```
pu setx -50 pd
setwidth 5
setcolor 5
rt 45 fd 50 rt 90 fd 50 lt 90 fd 50
ht
```

Now you can do your own experiments with short commands.

<!--solution-->

```
setwidth 5
setcolor 5
rt 45 fd 50 rt 90 fd 50 lt 90 fd 50
ht
```
