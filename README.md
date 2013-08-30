
# logSlider.js #

LogSlider is a simple widget that extends the [original jQuery UI's slider](http://api.jqueryui.com/slider/)  in order to facilitate mapping the handle's position to a specific value based on **any** mathematical model function. Using logSlider, the implementor can very easily set up an exponential scale without having to worry about the [underlying mathematics](#underlying-mathematics). It is also very easy to create [custom model functions](#custom-model-functions) using logSlider's convenient API.

It is strongly recommended to familiarize oneself with the [original slider](http://api.jqueryui.com/slider/) before reading further or using logSlider.

## Usage: ##
### Basic usage: ###
```javascript
$('#slider').logSlider();
```

Alternatively, it is possible to initialize the widget using options. All methods, options and events are identical to those of the original slider widget; there are a few **exceptions and additions** unique to logSlider, though.

```javascript
$('#slider').logSlider({ // See
    slide: function (event, ui) {
        var value = ui.value;
        // OR
        value = $(this).logSlider('newValue'); // It's 'newValue', not 'value'

        console.log(value);
    }
});
```

**WARNING:** The UI's original slider uses the `value` method to calibrate its own position and therefore `$('#slider').logSlider('value')` is not to be used.

### Advanced usage: ###
To really make the slider non-linear, we need a mathematical function to turn the handle's position into useful numbers. Expressing it numerically, the number extracted from the handle's position is ![x](http://latex.codecogs.com/svg.latex?x) and the number we actually want is ![y](http://latex.codecogs.com/svg.latex?y). We modulate ![x](http://latex.codecogs.com/svg.latex?x) to obtain ![y](http://latex.codecogs.com/svg.latex?y). Theoretically, the UI's original slider also has such function: ![y=x](http://latex.codecogs.com/svg.latex?y%3Dx). But note that this particular function's domain is identical to its range, which renders both domain and range irrelevant. However, in case of other functions this does not apply and therefore with logSlider it is necessary to take these into account.

To amend the *domain'n'range*, the original slider uses two options: `min` and `max`. However, now that domain and range actually matter, these are ambiguous. Does `min` mean minimum ![x](http://latex.codecogs.com/svg.latex?x) or minimum ![y](http://latex.codecogs.com/svg.latex?y)? To settle this, logSlider uses these two options:

```javascript
$('#slider').logSlider({ // The values set in this example are also the default values.
    range: [0, 1], // The minimum and maximum y value. Use this instead of min: 0, max: 1
    domain: [0, 1] // Absolutely irrelevant in most cases. See the "Custom model functions" section below for further information
});
```

In most cases, the values of ![y](http://latex.codecogs.com/svg.latex?y) are decimals, that sometimes have rather large decimal expansion, something that javascript tends to struggle with. And since such precision is often unnecessary in the context of web, logSlider automatically rounds the output values. This can be also influenced by configuration:

```javascript
$('#slider').logSlider({ // The value set in this example is also the default value.
    maximumDecimals: 5 // Between 0 and 5 decimal points
});
```

### Custom model functions ###
By default, logSlider supports two basic model functions. `exponential` because it is likely to be used the most, and `linear` in order to ensure some compatibility with the original slider.

```javascript
$('#slider').logSlider({ // The value set in this example is also the default value.
    modelFunction: 'exponential' // See the "Underlying mathematics" section below for further information.
});
```

Quite obviously, in most cases the implementor will not have to worry about this particular setting. However, should he/she decide to create their own model function, it can be done rather easily.

```javascript
$('#slider').logSlider({
    modelFunction: function (options, x) {
        // The options object contains all the options the implementor set and the default values.
        // The x variable is any value within the domain, a multiple of value of the `step` option.
        var d1 = options.domain[0], // First, we need to obtain information about the domain
            d2 = options.domain[1],
            r1 = options.range[0], // and range.
            r2 = options.range[1];
        // We can then use some mathematical function and translate it using these variables.
        // Simply using something like return Math.asin(x) would not work.

        // This approach is better because it works for all domains and ranges.
        return ((r2 - r1) * Math.asin((2*x - d2 - d1) / (d2 - d1))) / Math.PI + (r1 + r2) / 2;
        // However, if you are unable to do all the math, you can always amend the domain, for instance.

        // Sometimes you may also consider the `passThrough` option.
        // See the "Changing the curvature" for further information.
    }
});
```

Alternatively, it is possible to call the global method `registerModelFunction`. Model functions registered this way are then available for use by all logSliders on the page.

```javascript
$.ui.logSlider.registerModelFunction('arcsin', function (options, x) {
    // The same magic as shown above.
});

$('#slider1').logSlider({
    modelFunction: 'arcsin'
});
$('#slider2').logSlider({
    modelFunction: 'arcsin'
});
```

### Changing the curvature ###
It is highly recommended to read the [underlying mathematics](#underlying-mathematics) section before this one.

Some model functions, such as the default, `exponential`, can take various forms within one setting of `domain` and `range`. In contrast, some other functions, such as `linear` or the `arcsin` example above, are entirely defined by `domain` and `range`. But for those model functions where it does make sense, logSlider supports the `passThrough` option.

```javascript
$('#slider').logSlider({
    modelFunction: 'exponential',
    range: [0, 1],
    domain: [0, 1], // Domain is now important.
    passThrough: [0.5, 0.25] // The coordinates must lie within the domain and the range.
});
```

In the example above we want the value to be **0.25** when the handle is in the middle of the slider – the value **0.5** is the average of the domain's two bounds.

This option is to be used wisely as some funny values might result in unexpected behavior. For instance, if we used `passThrough: [0, 1]` in the previous example, the model function could not possibly exist.

## Underlying mathematics ##
The default model function `exponential` implements a mathematical function of this form:
![function form](http://latex.codecogs.com/svg.latex?y%3Db%5Cfrac%7Be%5E%7B%5Cleft%28dx-c%5Cright%29%5Ef%7D-1%7D%7Be-1%7D%2Ba). But why?

First, we start with the basic exponential function: ![y=e^x](http://latex.codecogs.com/gif.latex?y%3De%5Ex). To facilitate the translations, we would like it to pass through the points `(0, 0)` and `(1, 1)`. To achieve this, we change the function to ![y=\frac{e^x-1}{e-1}](http://latex.codecogs.com/gif.latex?y%3D%5Cfrac%7Be%5Ex-1%7D%7Be-1%7D). The numerator is ![e^x-1](http://latex.codecogs.com/svg.latex?e%5Ex-1) because ![e^0-1=0](http://latex.codecogs.com/svg.latex?e%5E0-1%3D0), which ensures that the function passes through the origin. And the denominator is ![e-1](http://latex.codecogs.com/svg.latex?e-1) because ![e^1-1=e-1](http://latex.codecogs.com/svg.latex?e%5E1-1%3De-1), which causes the function to pass through `(1, 1)`.

Now we need to take care of the translation so that the function satisfies the domain and the range. Let us start with range as the vertical translations are simpler. We simply introduce ![a](http://latex.codecogs.com/svg.latex?a) and ![b](http://latex.codecogs.com/svg.latex?b) so that the function is now in this form: ![y=b\frac{e^x-1}{e-1}+a](http://latex.codecogs.com/svg.latex?y%3Db%5Cfrac%7Be%5Ex-1%7D%7Be-1%7D%2Ba). ![b](http://latex.codecogs.com/svg.latex?b) stretches the function vertically and ![a](http://latex.codecogs.com/svg.latex?a) shifts it in the same direction.

Now, to translate the function horizontally, we need to replace ![x](http://latex.codecogs.com/svg.latex?x) by a function of ![x](http://latex.codecogs.com/svg.latex?x), ![g\left(x\right)=dx-c](http://latex.codecogs.com/svg.latex?g%5Cleft%28x%5Cright%29%3Ddx-c). This simple polynomial allows us to perform the same translations but this time horizontally – ![d](http://latex.codecogs.com/svg.latex?d) stretches and ![c](http://latex.codecogs.com/svg.latex?c) shifts.

So now we have ![y=b\frac{e^{\left(dx-c\right)}-1}{e-1}+a](http://latex.codecogs.com/svg.latex?y%3Db%5Cfrac%7Be%5E%7B%5Cleft%28dx-c%5Cright%29%7D-1%7D%7Be-1%7D%2Ba). If we set the parameters right according to the domain and the range, we obtain a fairly usable exponential function. However, not only that it does not differ too much from ![y=x](http://latex.codecogs.com/gif.latex?y%3Dx) (only within the domain and the range, of course), but it also does not allow us to change the curvature. To solve this problem, we change the function ![g](http://latex.codecogs.com/svg.latex?g) so that ![g\left(x\right)=\left(dx-c\right)^f](http://latex.codecogs.com/svg.latex?g%5Cleft%28x%5Cright%29%3D%5Cleft%28dx-c%5Cright%29%5Ef). By introducing the variable ![f](http://latex.codecogs.com/svg.latex?f) we can change the curvature and support the `passThrough` feature.

The implementor does not get to directly set the value of ![f](http://latex.codecogs.com/svg.latex?f) by design. He/she can only use the `passThrough` option to affect it. However, if the value of the `passThrough` option is too odd, ![f](http://latex.codecogs.com/svg.latex?f) shall remain at the default setting – 1.5.