(function () {
	var root = this;

	/**
	 * Jalette, a step-by-step palette generator written in Javascript.
	 * @author emersion <contact@emersion.fr>
	 * @license https://github.com/emersion/jalette/raw/master/LICENSE The MIT license
	 * @version 0.1
	 */
	var jalette = {};

	// Export Jalette
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = jalette;
		}
		exports.jalette = jalette;
	} else {
		root.jalette = jalette;
	}

	/**
	 * Create a color from an array of values.
	 * @param  {String} colorName The color name.
	 * @param  {Array}  args      Arguments to pass to the color constructor.
	 * @return {jalette.Color}    A Jalette color.
	 */
	function fromValues(colorName, args) {
		args = args || [];

		var color = new jalette[colorName]();
		jalette[colorName].apply(color, args);

		return color;
	}
	/**
	 * Create a color from a string.
	 * @param  {String} colorName The color name.
	 * @param  {String} str       The string.
	 * @return {Object}           The color.
	 */
	function fromStringValues(colorName, str) {
		if (str) {
			var args = str.split(',');
			for (var i = 0; i < args.length; i++) {
				args[i] = parseFloat(args[i]);
			}

			return fromValues(colorName, args);
		}

		return new jalette[colorName]();
	}

	/**
	 * A list of available color spaces.
	 * @type {Array}
	 */
	jalette.colorSpaces = ['Rgb', 'Hsl', 'Hsv', 'Hsb', 'Xyz', 'Lab'];

	/**
	 * Convert an input to a specified color.
	 * @param  {String}              colorName The color name.
	 * @param  {Array|Object|String} input     The input.
	 * @return {Object}                        The color.
	 */
	jalette.to = function (colorName, input) {
		if (input && input instanceof Array) {
			return fromValues(colorName, input);
		} else if (input && typeof input == 'object') {
			if (typeof input['to'+colorName] == 'function') {
				return input['to'+colorName]();
			} else if (typeof input.toRgb == 'function' &&
				typeof jalette[colorName].fromRgb == 'function') {
				var rgb = input.toRgb();
				return jalette[colorName].fromRgb(rgb);
			}
		} else if (typeof input == 'string') {
			return fromStringValues(colorName, input);
		}
	};

	/**
	 * Convert an input to a color.
	 * @param  {Object|String} input The input.
	 * @return {Object}              The color.
	 */
	jalette.from = function (input) {
		if (input && typeof input == 'object') {
			return input;
		} else if (typeof input == 'string') {
			if (input[0] == '#') { // Hex color
				return jalette.Rgb.fromHex(input);
			} else { // Something like `rgb(56, 42, 107)`
				input = input.trim();
				var result = /^([a-zA-Z]+)\(([0-9,;\s]+)\)$/.exec(input);
				if (result) {
					var colorName = result[1].toLowerCase(), colorValues = result[2];

					for (var i = 0; i < jalette.colorSpaces.length; i++) {
						var name = jalette.colorSpaces[i];

						if (name.toLowerCase() == colorName) {
							return fromStringValues(name, colorValues);
						}
					}
				}
			}
		}
	};

	/**
	 * A RGB color. Values are between 0 and 255.
	 * @param {Number} r The red value.
	 * @param {Number} g The green value.
	 * @param {Number} b The blue value.
	 */
	jalette.Rgb = function (r, g, b) {
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
	};
	jalette.Rgb.prototype = {
		/**
		 * Convert this color to RGB.
		 * This seems not very useful since this is already an RGB color,
		 * but can help when you don't know if you have an RGB color and you want one.
		 * @return {jalette.Rgb} The RGB color.
		 */
		toRgb: function () {
			return this;
		},
		/**
		 * Convert this color to a string.
		 * Can be used in CSS for example.
		 * @return {String} The color string.
		 */
		toString: function () {
			var rounded = [Math.round(this.r),Math.round(this.g),Math.round(this.b)];
			return 'rgb('+rounded.join(',')+')';
		},
		/**
		 * Convert this color to an hexadecimal value (e.g. `#ffffff`).
		 * @return {String} The hex color.
		 * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
		 */
		toHex: function () {
			function toHex(c) {
				var hex = c.toString(16);
				return (hex.length == 1) ? '0' + hex : hex;
			}

			return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
		},
		/**
		 * Check if this RGB color is a valid one (values between 0 and 255).
		 * @return {Boolean} True if it is, false otherwise.
		 */
		isValid: function () {
			return (this.r>=0 && this.g>=0 && this.b>=0 && this.r<256 && this.g<256 && this.b<256);
		},
		/**
		 * Convert this color to a valid RGB color, if it's invalid.
		 * @return {jalette.Rgb} The valid RGB color.
		 * @see {isValid()}
		 */
		toValid: function () {
			function toRgb(n) {
				if (n < 0) {
					return 0;
				}
				if (n > 255) {
					return 255;
				}
				return n;
			}

			return new jalette.Rgb(
				toRgb(this.r),
				toRgb(this.g),
				toRgb(this.b)
			);
		},
		/**
		 * Get this color's complementary.
		 * @return {jalette.Rgb} The complementary RGB color.
		 */
		complementary: function () {
			return new jalette.Rgb(
				255 - this.r,
				255 - this.g,
				255 - this.b
			);
		}
	};
	/**
	 * Convert an hexadecimal value to an RGB color.
	 * @param {String} hex The hex value.
	 * @return {jalette.Rgb} The RGB color.
	 * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	 */
	jalette.Rgb.fromHex = function (hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		
		if (result) {
			return new jalette.Rgb(
				parseInt(result[1], 16),
				parseInt(result[2], 16),
				parseInt(result[3], 16)
			);
		}
	};

	/**
	 * An HSL color.
	 * @param {Number} h The hue (between 0 and 360).
	 * @param {Number} s The saturation (between 0 and 1).
	 * @param {Number} l The luminance (between 0 and 1).
	 * @see https://en.wikipedia.org/wiki/HSL_and_HSV
	 * @see http://codeitdown.com/hsl-hsb-hsv-color/
	 */
	jalette.Hsl = function (h, s, l) {
		this.h = h || 0;
		this.s = s || 0;
		this.l = l || 0;
	};
	jalette.Hsl.prototype = {
		/**
		 * Convert this color to a string.
		 * Can be used in CSS for example.
		 * @return {String} The color string.
		 */
		toString: function () {
			var cssVals = [
				Math.round(this.h),
				Math.round(this.s*100) + '%',
				Math.round(this.l*100) + '%'
			];
			return 'hsl('+cssVals.join(',')+')';
		}
	};
	/**
	 * Convert an RGB color to HSL.
	 * @param  {jalette.Rgb} rgb The RGB color.
	 * @return {jalette.Hsl}     The HSL color.
	 * @see https://github.com/mjackson/mjijackson.github.com/blob/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.txt
	 * @todo Check if it is working!
	 */
	jalette.Hsl.fromRgb = function (rgb) {
		var r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255;

		var max = Math.max(r, g, b),
			min = Math.min(r, g, b);

		var h, s, l = (max + min) / 2;

		if (max == min) {
			h = s = 0; // Achromatic
		} else {
			var d = max - min;
			s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return new jalette.Hsl(h * 360, s, l);
	};

	/**
	 * An HSV color.
	 * HSB is exactly the same as HSV.
	 * @param {Number} h The hue (between 0 and 360).
	 * @param {Number} s The saturation (between 0 and 1).
	 * @param {Number} v The value (between 0 and 1).
	 * @see http://codeitdown.com/hsl-hsb-hsv-color/
	 */
	jalette.Hsv = function (h, s, v) {
		this.h = h || 0;
		this.s = s || 0;
		this.v = v || 0;
	};
	jalette.Hsv.prototype = {
		/**
		 * Convert HSV to HSL.
		 * @return {jalette.Hsl} The HSL color.
		 * @see http://codeitdown.com/hsl-hsb-hsv-color/
		 */
		toHsl: function () {
			var hsb = this;

			var hsl = new jalette.Hsl();
			hsl.h = hsb.h;

			hsl.l = 1/2 * hsb.b * (2 - hsb.s);
			hsl.s = hsb.b*hsb.s / (1 - Math.abs(2*hsl.l - 1));

			return hsl;
		},
		/**
		 * Convert this HSV color to RGB.
		 * @return {jalette.Rgb} The RGB color.
		 * @see https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Conversions/HsvConverter.cs
		 */
		toRgb: function () {
			var hsb = this;

			var range = Math.floor(hsb.h / 60.0) % 6;
			var f = hsb.h / 60.0 - Math.floor(hsb.h / 60.0);

			var v = hsb.v * 255.0;
			var p = v * (1 - hsb.s);
			var q = v * (1 - f * hsb.s);
			var t = v * (1 - (1 - f) * hsb.s);

			switch (range) {
				case 0:
					return new jalette.Rgb(v, t, p);
				case 1:
					return new jalette.Rgb(q, v, p);
				case 2:
					return new jalette.Rgb(p, v, t);
				case 3:
					return new jalette.Rgb(p, q, v);
				case 4:
					return new jalette.Rgb(t, p, v);
			}
			return new jalette.Rgb(v, p, q);
		},
		/**
		 * Convert this color to a string.
		 * Can be used in CSS for example.
		 * @return {String} The color string.
		 */
		toString: function () {
			return this.toHsl().toString();
		}
	};
	/**
	 * Convert an RGB color to HSV.
	 * @param  {jalette.Rgb} rgb The RGB color.
	 * @return {jalette.Hsv}     The HSV color.
	 * @see https://github.com/mjackson/mjijackson.github.com/blob/master/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript.txt
	 */
	jalette.Hsv.fromRgb = function (rgb) {
		var r = rgb.r / 255.0,
			g = rgb.g / 255.0,
			b = rgb.b / 255.0;

		var max = Math.max(r, g, b),
			min = Math.min(r, g, b);
		var h, s, v = max;

		var d = max - min;
		s = (max == 0) ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		return new jalette.Hsv(h * 360, s, v);
	};

	/**
	 * An XYZ color.
	 * The XYZ tristimulus values are thus analogous to, but not equal to, the LMS cone responses of the human eye.
	 * @param {Number} x The X value.
	 * @param {Number} y The Y value.
	 * @param {Number} z The Z value.
	 * @see https://en.wikipedia.org/wiki/XYZ_color
	 * @see https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Conversions/XyzConverter.cs
	 */
	jalette.Xyz = function (x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	};
	jalette.Xyz.prototype = {
		/**
		 * Convert this color to RGB.
		 * @return {jalette.Rgb} The RGB color.
		 */
		toRgb: function () {
			// (Observer = 2°, Illuminant = D65)
			var x = this.x / 100.0;
			var y = this.y / 100.0;
			var z = this.z / 100.0;

			var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
			var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
			var b = x * 0.0557 + y * -0.2040 + z * 1.0570;

			r = (r > 0.0031308) ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
			g = (g > 0.0031308) ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
			b = (b > 0.0031308) ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

			return new jalette.Rgb(r * 255, g * 255, b * 255);
		},
		/**
		 * Check if this color would be a valid RGB one.
		 * @return {Boolean} True if it is, false otherwise.
		 */
		isValidRgb: function () {
			return this.toRgb().isValid();
		},
		/**
		 * Convert this color to a valid RGB one.
		 * @return {jalette.Rgb} The valid RGB color.
		 */
		toValidRgb: function () {
			return this.toRgb().toValid();
		}
	};
	// Constants for Xyz related spaces
	/**
	 * The white reference in the XYZ space.
	 * @type {jalette.Xyz}
	 */
	jalette.Xyz.whiteReference = new jalette.Xyz(95.047, 100.000, 108.883); // TODO: Hard-coded!
	jalette.Xyz.epsilon = 0.008856; // Intent is 216/24389
	jalette.Xyz.kappa = 903.3; // Intent is 24389/27
	/**
	 * Convert an RGB color to an XYZ one.
	 * @param  {jalette.RGB} rgb The RGB color.
	 * @return {jalette.Xyz}     The XYZ color.
	 */
	jalette.Xyz.fromRgb = function (rgb) {
		function pivotRgb(n) {
			return ((n > 0.04045) ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92) * 100.0;
		}

		var r = pivotRgb(rgb.r / 255.0);
		var g = pivotRgb(rgb.g / 255.0);
		var b = pivotRgb(rgb.b / 255.0);

		// Observer. = 2°, Illuminant = D65
		var xyz = new jalette.Xyz();
		xyz.x = r * 0.4124 + g * 0.3576 + b * 0.1805;
		xyz.y = r * 0.2126 + g * 0.7152 + b * 0.0722;
		xyz.z = r * 0.0193 + g * 0.1192 + b * 0.9505;
		return xyz;
	};

	/**
	 * A CIELAB color.
	 * @param {Number} l The lightness, between 0 and 100.
	 * @param {Number} a The red-green axis.
	 * @param {Number} b The yellow-blue axis.
	 * @see https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Conversions/LabConverter.cs
	 * @see https://fr.wikipedia.org/wiki/CIE_Lab
	 * @see http://cielab.dtpstudio.de/
	 */
	jalette.Lab = function (l, a, b) {
		this.l = l || 0;
		this.a = a || 0;
		this.b = b || 0;
	};
	jalette.Lab.prototype = {
		/**
		 * Convert this color to XYZ.
		 * @return {jalette.Xyz} The XYZ color.
		 */
		toXyz: function () {
			var lab = this;

			var y = (lab.l + 16.0) / 116.0;
			var x = lab.a / 500.0 + y;
			var z = y - lab.b / 200.0;

			var white = jalette.Xyz.whiteReference;
			var x3 = x * x * x;
			var z3 = z * z * z;
			var xyz = new jalette.Xyz(
				white.x * ((x3 > jalette.Xyz.epsilon) ? x3 : (x - 16.0 / 116.0) / 7.787),
				white.y * ((lab.l > (jalette.Xyz.kappa * jalette.Xyz.epsilon)) ? Math.pow(((lab.l + 16.0) / 116.0), 3) : lab.l / jalette.Xyz.kappa),
				white.z * ((z3 > jalette.Xyz.epsilon) ? z3 : (z - 16.0 / 116.0) / 7.787)
			);

			return xyz;
		},
		/**
		 * Convert this color to RGB.
		 * Note that this color is firstly converted to XYZ and then to RGB.
		 * @return {jalette.Rgb} The RGB color.
		 */
		toRgb: function () {
			return this.toXyz().toRgb();
		},
		/**
		 * Check if this color would be a valid RGB one.
		 * @return {Boolean} True if it is, false otherwise.
		 */
		isValidRgb: function () {
			return this.toXyz().isValidRgb();
		}
	};
	/**
	 * Convert an RGB color to LAB.
	 * @param  {jalette.Rgb} rgb The RGB color.
	 * @return {jalette.Lab}     The LAB color.
	 */
	jalette.Lab.fromRgb = function (rgb) {
		function cubicRoot(n) {
			return Math.pow(n, 1.0 / 3.0);
		}
		function pivotXyz(n) {
			return (n > jalette.Xyz.epsilon) ? cubicRoot(n) : (jalette.Xyz.kappa * n + 16) / 116;
		}

		var xyz = jalette.Xyz.fromRgb(rgb);

		var white = jalette.Xyz.whiteReference;
		var x = pivotXyz(xyz.x / white.x);
		var y = pivotXyz(xyz.y / white.y);
		var z = pivotXyz(xyz.z / white.z);

		var lab = new jalette.Lab();
		lab.l = Math.max(0, 116 * y - 16);
		lab.a = 500 * (x - y);
		lab.b = 200 * (y - z);
		return lab;
	};

	/**
	 * Compute the distance between two colors (delta E) with the CIE76 formula.
	 * @see http://en.wikipedia.org/wiki/Color_difference#CIE76
	 */
	jalette.Lab.CIE76 = function (a, b) {
		return Math.sqrt(Math.pow(a.l - b.l, 2) +
			Math.pow(a.a - b.a, 2) +
			Math.pow(a.b - b.b, 2));
	};
	/**
	 * Compute the distance between two colors (delta E) with the CIEDE2000 formula.
	 * @see http://en.wikipedia.org/wiki/Color_difference#CIEDE2000
	 * @see https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/CieDe2000Comparison.cs
	 */
	jalette.Lab.CIEDE2000 = function (lab1, lab2) {
		function degToRad(degrees) {
			return degrees * Math.PI / 180;
		}

		//Set weighting factors to 1
		var k_L = 1.0;
		var k_C = 1.0;
		var k_H = 1.0;

		//Calculate Cprime1, Cprime2, Cabbar
		var c_star_1_ab = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
		var c_star_2_ab = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
		var c_star_average_ab = (c_star_1_ab + c_star_2_ab) / 2;

		var c_star_average_ab_pot7 = c_star_average_ab * c_star_average_ab * c_star_average_ab;
		c_star_average_ab_pot7 *= c_star_average_ab_pot7 * c_star_average_ab;

		var G = 0.5 * (1 - Math.sqrt(c_star_average_ab_pot7 / (c_star_average_ab_pot7 + 6103515625))); //25^7
		var a1_prime = (1 + G) * lab1.a;
		var a2_prime = (1 + G) * lab2.a;

		var C_prime_1 = Math.sqrt(a1_prime * a1_prime + lab1.b * lab1.b);
		var C_prime_2 = Math.sqrt(a2_prime * a2_prime + lab2.b * lab2.b);
		//Angles in Degree.
		var h_prime_1 = ((Math.atan2(lab1.b, a1_prime) * 180 / Math.PI) + 360) % 360;
		var h_prime_2 = ((Math.atan2(lab2.b, a2_prime) * 180 / Math.PI) + 360) % 360;

		var delta_L_prime = lab2.l - lab1.l;
		var delta_C_prime = C_prime_2 - C_prime_1;

		var h_bar = Math.abs(h_prime_1 - h_prime_2);
		var delta_h_prime;
		if (C_prime_1 * C_prime_2 == 0) {
			delta_h_prime = 0;
		} else {
			if (h_bar <= 180) {
				delta_h_prime = h_prime_2 - h_prime_1;
			} else if (h_bar > 180 && h_prime_2 <= h_prime_1) {
				delta_h_prime = h_prime_2 - h_prime_1 + 360.0;
			} else {
				delta_h_prime = h_prime_2 - h_prime_1 - 360.0;
			}
		}
		var delta_H_prime = 2 * Math.sqrt(C_prime_1 * C_prime_2) * Math.sin(delta_h_prime * Math.PI / 360);

		// Calculate CIEDE2000
		var L_prime_average = (lab1.l + lab2.l) / 2;
		var C_prime_average = (C_prime_1 + C_prime_2) / 2;

		//Calculate h_prime_average

		var h_prime_average;
		if (C_prime_1 * C_prime_2 == 0) {
			h_prime_average = 0;
		} else {
			if (h_bar <= 180) {
				h_prime_average = (h_prime_1 + h_prime_2) / 2;
			} else if (h_bar > 180 && (h_prime_1 + h_prime_2) < 360) {
				h_prime_average = (h_prime_1 + h_prime_2 + 360) / 2;
			} else {
				h_prime_average = (h_prime_1 + h_prime_2 - 360) / 2;
			}
		}
		var L_prime_average_minus_50_square = (L_prime_average - 50);
		L_prime_average_minus_50_square *= L_prime_average_minus_50_square;

		var S_L = 1 + ((0.015 * L_prime_average_minus_50_square) / Math.sqrt(20 + L_prime_average_minus_50_square));
		var S_C = 1 + 0.045 * C_prime_average;
		var T = 1
			- 0.17 * Math.cos(degToRad(h_prime_average - 30))
			+ 0.24 * Math.cos(degToRad(h_prime_average * 2))
			+ 0.32 * Math.cos(degToRad(h_prime_average * 3 + 6))
			- 0.2 * Math.cos(degToRad(h_prime_average * 4 - 63));
		var S_H = 1 + 0.015 * T * C_prime_average;
		var h_prime_average_minus_275_div_25_square = (h_prime_average - 275) / (25);
		h_prime_average_minus_275_div_25_square *= h_prime_average_minus_275_div_25_square;
		var delta_theta = 30 * Math.exp(-h_prime_average_minus_275_div_25_square);

		var C_prime_average_pot_7 = C_prime_average * C_prime_average * C_prime_average;
		C_prime_average_pot_7 *= C_prime_average_pot_7 * C_prime_average;
		var R_C = 2 * Math.sqrt(C_prime_average_pot_7 / (C_prime_average_pot_7 + 6103515625));

		var R_T = -Math.sin(degToRad(2 * delta_theta)) * R_C;

		var delta_L_prime_div_k_L_S_L = delta_L_prime / (S_L * k_L);
		var delta_C_prime_div_k_C_S_C = delta_C_prime / (S_C * k_C);
		var delta_H_prime_div_k_H_S_H = delta_H_prime / (S_H * k_H);

		var CIEDE2000 = Math.sqrt(
			delta_L_prime_div_k_L_S_L * delta_L_prime_div_k_L_S_L
			+ delta_C_prime_div_k_C_S_C * delta_C_prime_div_k_C_S_C
			+ delta_H_prime_div_k_H_S_H * delta_H_prime_div_k_H_S_H
			+ R_T * delta_C_prime_div_k_C_S_C * delta_H_prime_div_k_H_S_H
			);

		return CIEDE2000;
	};
	/**
	 * Draw the CIELAB color space, given an L value.
	 * @param  {HTMLCanvasElement} canvas The canvas in which the color space will be rendered.
	 * @param  {Number}            L      The L value.
	 */
	jalette.Lab.drawSpaceForL = function (canvas, L) {
		var ctx = canvas.getContext('2d');

		function x(x) {
			return x + canvas.width/2;
		}
		function y(y) {
			return - y + canvas.height/2;
		}

		for (var i = -128; i < 128; i++) {
			for (var j = -128; j < 128; j++) {
				var lab = new jalette.Lab(L, i, j);
				var rgb = lab.toRgb();

				if (!rgb.isValid()) {
					continue;
				}

				ctx.fillStyle = rgb.toString();
				ctx.fillRect(x(i), y(j), 1, 1);
			}
		}
	};

	/**
	 * Generate a new color for an existing palette.
	 * @param  {Array} colors An array of colors composing the current palette.
	 * @return {jalette.Lab}  The newly generated color.
	 */
	jalette.generateColor = function (colors) {
		// Make sure all colors are in LAB
		colors = colors || [];
		for (var i = 0; i < colors.length; i++) {
			var color = colors[i];

			if (!(color instanceof jalette.Lab)) {
				colors[i] = jalette.to('Lab', color);
			}
		}

		var domainRadius = 128,
			regionsPerRow = 64,
			regionRadius = domainRadius*2 / regionsPerRow;

		/*function dstBetween(a, b) {
			return jalette.Lab.CIE76(a, b);
		}
		function dstToCenter(color) {
			var center = new jalette.Lab(50, 0, 0);

			return dstBetween(center, color);
		}*/

		// Browse the LAB space and find the color which have the greatest distance to the nearest color from the palette
		var greatestDst = 0, greatestColor = null;
		for (var L = 80; L > 20; L -= 5) {
			for (var i = 0; i < regionsPerRow; i++) {
				for (var j = 0; j < regionsPerRow; j++) {
					var xi = i * regionRadius - domainRadius,
						yj = j * regionRadius - domainRadius;

					var lab = new jalette.Lab(L, xi, yj),
						rgb = lab.toRgb();

					if (!rgb.isValid()) { // Not in domain - skip
						continue;
					}
					/*var rgb = lab.toRgb();
					ctx.fillStyle = rgb.toString();
					ctx.fillRect(x(xi) - regionRadius/2, y(yj) - regionRadius/2, regionRadius, regionRadius);*/

					var smallestColorDst = -1;
					for (var k = 0; k < colors.length; k++) {
						var color = colors[k],
							dst = jalette.Lab.CIEDE2000(lab, color);
							//dst = dstBetween(lab, color);

						if (smallestColorDst === -1 || dst < smallestColorDst) {
							smallestColorDst = dst;
						}
						if (dst < greatestDst) {
							break;
						}
					}

					if (smallestColorDst === -1 || greatestDst < smallestColorDst) {
						greatestDst = smallestColorDst;
						greatestColor = lab;
					}

					//var dstLvl = Math.round(smallestColorDst / domainRadius * 255 * 3); // Big distance -> white

					//ctx.fillStyle = 'rgb('+[dstLvl,dstLvl,dstLvl].join(',')+')';
					//ctx.fillRect(x(xi) - regionRadius/2, y(yj) - regionRadius/2, regionRadius, regionRadius);
				}
			}
		}

		return greatestColor;
	}

	/**
	 * Generate a palette with a given number of colors.
	 * @param  {Number} n The number of colors in the palette.
	 * @return {Array}    An array of colors.
	 */
	jalette.generate = function (n) {
		var palette = [];
		for (var i = 0; i < n; i++) {
			var lab = jalette.generateColor(palette);

			palette.push(lab);
		}

		return palette;
	}

	// Define Jalette if AMD is available
	if (typeof define === 'function' && define.amd) {
		define('jalette', [], function() {
			return jalette;
		});
	}
}).call(this);
