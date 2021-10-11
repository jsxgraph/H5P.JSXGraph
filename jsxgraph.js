var H5P = H5P || {};

H5P.JSXGraph = (function ($) {
//   var $ = H5P.jQuery;
//   this.$ = $(this);

  var depurify = function (str) {
    return str.replace(/&#039;/g, "'").
      replace(/&quot;/g, '"').
      replace(/&lt;/g, '<').
      replace(/&gt;/g, '>').
      replace(/&amp;/g, '&');
  };

  /**
   * Constructor function.
   */
  function C(options, id) {
    // Extend defaults with provided options
    this.options = $.extend(true, {}, {
      commentPre: 'BEFORE',
      commentPost: 'AFTER',
      advanced: {
        divId: '',
        showFixedSize: true,
        width: '500px',
        height: '500px',
        maxWidth: '100%',
        aspectRatio: '1/1'
      },
      code: ''
    }, options);
    // Keep provided id.
    this.id = id;
  };

  /**
   * Attach function called by H5P framework to insert H5P content into
   * page
   *
   * @param {jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var outerPre, outerPost, divId,
      composeCSS = function (options) {
        var txt = '',
            res, w, h;
        if (options.advanced.showFixedSize) {
          txt += 'width:' + options.advanced.width + '; ';
          txt += 'height:' + options.advanced.height + '; ';
        }
        else {
          // Use the new CSS property aspect-ratio.
          //txt += 'max-width:' + options.advanced.maxWidth + '; ';
          // txt += 'aspect-ratio:' + options.advanced.aspectRatio + '; ';
          // txt += 'margin: 0 auto;';

          // Use the old aspect-ratio hack.
          res = options.advanced.aspectRatio.match(/\w*(\d+)\w*\/\w*(\d+)\w*/);
          w = parseFloat(res[1]);
          h = parseFloat(res[2]);
          txt += 'height:0; padding-bottom:' + (100*h/w) + '%;'
        }

        return txt;
      };

    if (this.options.divId !== undefined && this.options.divId !== '') {
      // Take the supplied div Id.
      divId = this.options.divId;
    }
    else {
      // Choose random div Id.
      divId = 'jxg' + Math.random();
    }

    // Set class on container to identify it as a JSXGraph construction.
    if (!this.options.advanced.showFixedSize) {
        // Use the old aspect-ratio hack
        outerPre = '<div style="max-width:' + this.options.advanced.maxWidth + ';';
        outerPre += 'margin: 0 auto;';
        outerPre += '">'
        outerPost = '</div>';
    }
    else {
        outerPre = '';
        outerPost = '';
    }
    $container.addClass("h5p-jsxgraph");

    var txt = '<div id="pre" class="h5p-jsxgraph-comment-post">' + this.options.commentPre + '</div>' +
        // '<script type="text/javascript" src="https://code.jquery.com/jquery-3.6.0.min.js"></script>' +
        // '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js"></script>' +
        // '<script src="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraphcore.js" type="text/javascript"></script>' +
      outerPre +
      '<div id="' + divId + '" class="jxgbox" ' +
        'style="' + composeCSS(this.options) + '"' +
      '></div>' +
      outerPost +
      '<script type="text/javascript">' +
        'XMLHttpRequest = {};' +
        'WebSocket = {};' +
        //'H5PIntegration = {};' +
        //'HTMLFormElement.prototype.onsubmit = function (){};' +
        depurify(this.options.code).replace(/BOARDID/g, "'" + divId + "'") +
      '</script>' +
      '<div id="post" class="h5p-jsxgraph-comment-post">'
        + this.options.commentPost +
      '</div>';

    $container.append(txt);

    // $iframe = $('<iframe/>', {
    //     src: 'about:blank',
    //     scrolling: 'no',
    //     frameBorder: 0,
    //     sandbox: 'allow-same-origin allow-scripts',
    //     'class': 'h5p-iframe-content h5p-iframe-wrapper',
    //     css: {width:'500px', height: '500px'}
    //   });

    //   console.log(composeCSS(this.options));
    // $container.html('');
    // $container.append($iframe);

    // var x = document.getElementsByTagName("iframe")[0];
    // x.contentWindow.document.open('text/html', 'replace');
    // x.contentWindow.document.write(txt);
    // x.contentWindow.document.close();

    // x.sandbox.toggle('allow-same-origin');
    //x.sandbox.toggle('allow-scripts');
    //x.contentWindow.location.href = "about:blank";
    //console.log(x.sandbox);
  };

  return C;
})(H5P.jQuery);