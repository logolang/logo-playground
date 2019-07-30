Congratulations, you have completed the **Graphic primitives** tutorial.
What you have learned:

- Drawing labels of different color size and position
- How to draw the circle and segment
- Using the fill and filled command to create solid backgrounds
- Combining different commands to achieve desired result

Keep going forward, there are lots of fun ahead!

<!--logo {"width":"300px", "height":"250px"}-->

```
setbg 0
to firework :size :colors
  repeat 50 [
    setcolor pick :colors
    fd :size
    bk :size
    rt 16
  ]
end

pu setxy 50 0 pd
firework 75 [2 4 14]
pu setxy -50 -50 pd
firework 50 [3 5 9]
pu setxy -70 40 pd
firework 60 [6]
```
