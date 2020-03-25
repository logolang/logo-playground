Related to computer programming the comments are blocks of explanation text embedded to your program.
They are added with the purpose of making the source code easier for humans to understand.
Comments are completely ignored by computer when the program is executed, their only purpose is to help a reader to comprehend original intention of program's author.

In LOGO you can make a comment with `;` semicolon before the comment block. This will mark the rest of the current line as a comment and will be completely ignored by LOGO interpreter while executing your program.

Example:

<!--logo {"width":"220px", "height":"220px", "code": true}-->

```
; This program is written by Joe on 5/09/2019
; Draws a big orange star

setpencolor 14; Orange color
filled 14 [repeat 5 [fd 50 rt 144]]; Drawing a star

```
