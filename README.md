Jalette
=======

A step-by-step palette generator written in Javascript.

Some generators already exist, and this one is certainly not the best, but Jalette's goal is to provide dynamic palette generation : you have an existing palette and you want to add more colors to this palette. Newly generated colors are the farest as possible from the current palette's colors.

Jalette uses the [CIELAB](http://en.wikipedia.org/wiki/CIELAB) color space, which is intended to mimic the nonlinear response of the eye. Distances between colors are computed using the [CIEDE2000](http://en.wikipedia.org/wiki/Color_difference#CIEDE2000) formula.

You can find a live demo here: http://emersion.github.io/jalette/

License
=======

Jalette is an open-source software released under the MIT license.

References
==========

* CIELAB on Wikipedia - https://en.wikipedia.org/wiki/CIELAB
* I want hue - http://tools.medialab.sciences-po.fr/iwanthue/
* HSL, HSB and HSV - http://codeitdown.com/hsl-hsb-hsv-color/
* ColorMine - https://github.com/THEjoezack/ColorMine/
