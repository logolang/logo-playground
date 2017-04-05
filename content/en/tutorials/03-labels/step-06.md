# Using whitespace in your text

If you want to print something bigger than just one word you can notice that LOGO will give you an error.
In this example:
```
label "Happy Birthday!
```
Logo will say: 
```
Don't know how to BIRTHDAY!
```

That is because we have whitespace after word "Happy", so LOGO thinks that `Birthday!` is a next command to execute.
To make LOGO understand that whis words are connected we need to write symbol backslash `\` before whitespace like this:
```
label "Happy\ Birthday!
```

Change our example to print text: "Happy Birthday!"

```result
penup
fd 100
lt 90
fd 200
pendown
setcolor 4
setlabelheight 30
rt 180
label "Happy\ Birthday!
```