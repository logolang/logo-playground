List is a group of elements. It could be the list of students in the class, list of phone numbers or list of vehicles.

To create a list in LOGO we should have a variable containing the list values (we have learned before how to define a variable).

The definition of the list is : `(list item1 item2 ...)` where the list items are separated by space.
For example `(list "hello "world)` will contain 2 elements: `hello` and `world`.

In order to define a variable to hold the list we can use the `make` command like this:

```
make "listOfColors (list "red "green "yellow "white)
```

What we can do with the list in LOGO?

#### Print the list

The command `print` will print all the list items like in this example:

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "listOfColors (list "red "green "yellow "white)
print :listOfColors
```

#### Obtain the items from the list

Commands `first <list>` and `last <list>` will return the first and last items accordingly from the specified list. The command `item <number> <list>` will return the item by provided index number.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "listOfColors (list "red "green "yellow "white)
print first :listOfColors
print last :listOfColors
print item 3 :listOfColors
```

Command `pick <list>` will return the item from random position from provided list.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "listOfColors (list "red "green "yellow "white)
repeat 100000 [
  print pick :listOfColors
  wait 10
  cleartext
]
```

#### Reverse the list

Command `reverse <list>` will return a new list which contains the same items from specified array but in reverse order.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "listOfColors (list "red "green "yellow "white)
print :listOfColors
print reverse :listOfColors
```

#### Combine the list with a new item

Command `fput <thing> <list>` will produce a new list starting from new item `thing` and all the items from provided list. Similar command `lput` will make the same but the new item will be placed to last position of a new list.

<!--logo {"width":"300px", "height":"200px", "code": true}-->

```
make "listOfLight (list "lime "yellow "white)
print fput "aqua :listOfLight
print lput "aqua :listOfLight
```

#### Getting the list without first or last item

Commands `butfirst <list>` and `butlast <list>` will produce the copy of the specified list but without the first or last item respectively.

<!--logo {"width":"300px", "height":"200px", "code": true, "solution": true}-->

```
make "listOfLight (list "lime "yellow "white)
print butfirst :listOfLight
print butlast :listOfLight
```
