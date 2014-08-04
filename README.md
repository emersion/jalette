Jalette
=======

A step-by-step palette generator written in Javascript.

Some generators already exist, and this one is certainly not the best, but Jalette's goal is to provide dynamic palette generation : you have an existing palette and you want to add more colors to this palette. Newly generated colors are the farest as possible from the current palette's colors.

Jalette uses the [CIELAB](http://en.wikipedia.org/wiki/CIELAB) color space, which is intended to mimic the nonlinear response of the eye. Distances between colors are computed using the [CIEDE2000](http://en.wikipedia.org/wiki/Color_difference#CIEDE2000) formula.

You can find a live demo here: http://emersion.github.io/jalette/

Docs
====

Available classes:
* `new jalette.Rgb(r, g, b)`: an RGB color
  * `toString()`: converts to a string, e.g. `rgb(42, 42, 42)`. You can use it in CSS for instance.
  * `toHex()`: converts to the hexadecimal value, e.g. `#ffffff`.
  * `isValid()`: checks if the color exists in the RGB color space. Some colors in LAB for example doesn't exist in RGB.
  * `complementary()`: returns the complementary color
* `new jalette.Hsl(h, s, l)`: an HSL color
  * `toString()`: converts to a string, e.g. `hsl(42, 42, 42)`. You can use it in CSS for instance.
* `new jalette.Hsv(h, s, v)`: an HSV color
  * `toHsl()`: converts the color to HSL
  * `toRgb()`: converts the color to RGB
* `new jalette.Xyz(x, y, z)`: an XYZ color
  * `toRgb()`: converts the color to RGB
* `new jalette.Lab(l, a, b)`: a LAB color
  * `toRgb()`: converts the color to RGB

Static methods:
* `jalette.generateColor(palette)`: generate a new color for the given palette.
* `jalette.generate(n)`: generate a new palette conmtaining `n` colors.
* `jalette.from(input)`: convert anything to a color. Anything can be `#ffffff`, `rgb(42, 42, 42)` and so on.
* `jalette.to(colorName, input)`: convert anything to a specific color. Anything can be another color, strings described above and so on.
* `jalette.Lab.CIE76(a, b)`: computes the distance (delta E) between two LAB colors, using the [CIE76 formula](http://en.wikipedia.org/wiki/Color_difference#CIE76).
* `jalette.Lab.CIEDE2000(a, b)`: computes the distance (delta E) between two LAB colors, using the [CIEDE2000 formula](http://en.wikipedia.org/wiki/Color_difference#CIEDE2000).

License
=======

Jalette is an open-source software released under the MIT license.

References
==========

* CIELAB on Wikipedia - https://en.wikipedia.org/wiki/CIELAB
* I want hue - http://tools.medialab.sciences-po.fr/iwanthue/
* HSL, HSB and HSV - http://codeitdown.com/hsl-hsb-hsv-color/
* ColorMine - https://github.com/THEjoezack/ColorMine/
