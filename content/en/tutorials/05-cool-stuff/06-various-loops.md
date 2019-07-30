Here, for example, is a framework for drawing a spiral. It has a while loop, a variation on the repetition shown earlier and the body of the loop is for us to fill in.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "n 1
   while [:n < 100] [
      make "n :n + 5
      fd :n rt 90
   ]
```
