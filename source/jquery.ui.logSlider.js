/**
 * A jQuery UI widget extending the UI's default slider to facilitate mapping
 * the handle's position to a specific value based on a non-linear function.
 * 
 * @copyright Copyright (c) 2013 Jirka Vebr (Lopata)
 * @license MIT
 * @version 0.8
 * @link http://github.com/Lopata/logSlider
 */
(function ($) {
	var parent = $.ui.slider,
		globalModelFunctions = {
			linear: function (options, x) {
				var d1 = options.domain[0],
					d2 = options.domain[1],
					r1 = options.range[0],
					r2 = options.range[1];
				return ((r2 - r1)/(d2 - d1)) * (x - d1);
			},
			exponential: function (options, x) {
				var a = options.range[0], // vertical shift
					b = options.range[1] - a, // vertical stretch
					c = -1 * options.domain[0], // horizontal shift
					d = 1/(options.domain[1]+c), // horizontal stretch
					f = 1.5; // the default curvature
				if ($.isArray(options.passThrough)) {
					var x2 = options.passThrough[0],
						y = options.passThrough[1],
						newF = Math.log(Math.log(((y - a)*(Math.E - 1) + b)/b)) /
								Math.log(d*x2 + c);
					f = newF > 0 ? newF : f; // A negative exponent would edge the function out of range.
				}
				return b * ((Math.exp(Math.pow(d*x + c, f)) - 1)/(Math.E - 1)) + a;
			}
		};

	$.widget('ui.logSlider', parent, {

		options: {
			domain: [0, 1],
			range: [0, 1],
			step: 0.001, // not to be set too high or low

			modelFunction: 'exponential',
			passThrough: null,
			maximumDecimals: 3
		},

		_create: function () {
			if (!$.isArray(this.options.domain)) {
				this.options.domain = [0, 1];
			}
			this.options.min = this.options.domain[0];
			this.options.max = this.options.domain[1];

			if (!$.isArray(this.options.range)) {
				this.options.range = [0, 1];
			}
			if ($.isArray(this.options.passThrough)) {
				this.options.passThrough[0] = 
					Math.max(Math.min(this.options.passThrough[0], this.options.domain[1]), this.options.domain[0]);
				this.options.passThrough[1] = 
					Math.max(Math.min(this.options.passThrough[1], this.options.range[1]), this.options.range[0]);
			}
			this.options.maximumDecimals = Math.max(0, this.options.maximumDecimals);

			this._parent()._create.call(this);
		},

		_parent: function () {
			return parent.prototype;
		},

		_getModelFunction: function () {
			var modelFunction = this.options.modelFunction;
			if (typeof modelFunction === 'string' && typeof globalModelFunctions[modelFunction] !== 'undefined') {
				return globalModelFunctions[modelFunction];
			} else if (typeof modelFunction === 'function') { // Implementor defined function
				return this.options.modelFunction;
			}
			return globalModelFunctions['exponential']; // The default option
		},


		_newValue: function (linearValue) {
			var newValue = this._getModelFunction()(this.options, linearValue);
			return parseFloat(newValue.toFixed(this.options.maximumDecimals));
		},

		_trigger: function (type, event, data) {
			if (typeof data === 'object') { // Some events do not pass this argument.
				data.value = this._newValue(data.value);
			}
			return this._parent()._trigger.call(this, type, event, data);
		},

		newValue: function () {
			return this._newValue(this.value());
		}
	});

	$.extend($.ui.logSlider, { // global API
		registerModelFunction: function (name, callback) {
			if (typeof callback === 'function') {
				globalModelFunctions[new String(name)] = callback;
			}
		}
	});
})(window.jQuery);
