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
      resizeSupported: true,
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
      options = this.options,
      composeCSSForJXG = function (options) {
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
          txt += 'height:0; padding-bottom:' + (100 * h / w) + '%;'
        }

        return txt;
      };

    if (options.divId !== undefined && options.divId !== '') {
      // Take the supplied div Id.
      divId = options.divId;
    }
    else {
      // Choose random div Id.
      divId = 'jxg' + Math.random();
    }

    // Set class on container to identify it as a JSXGraph construction.
    if (!options.advanced.showFixedSize) {
      // Use the old aspect-ratio hack
      outerPre = '<div style="max-width:' + options.advanced.maxWidth + ';';
      outerPre += 'margin: 0 auto;';
      outerPre += '">'
      outerPost = '</div>';
    }
    else {
      outerPre = '';
      outerPost = '';
    }
    $container.addClass("h5p-jsxgraph");

    var headTxt = '<head><meta http-equiv="Content-Security-Policy" content="navigate-to \'none\'">';

    var path = "/sites/default/files/h5p/development/H5P.JSXGraph/"
    headTxt +=
      // '<script type="text/javascript" src="https://code.jquery.com/jquery-3.6.0.min.js"></script>' +
      // '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js"></script>' +
      // '<script type="text/javascript" src="/sites/default/files/h5p/libraries/H5P.MathDisplay-1.0/scripts/mathdisplay.js?r0sz7p"></script>' +
      '<script src="' + path + 'jsxgraphcore.js" type="text/javascript"></script>' +
      '<link rel="stylesheet" href="' + path + 'h5p-jsxgraph.css" type="text/css">' +
      '<link rel="stylesheet" href="' + path + 'jsxgraph.css" type="text/css">';

    var secureJS = '<script type="text/javascript">' +
      'XMLHttpRequest = {};' +
      'WebSocket = {};' +
      '</script>';

    headTxt += secureJS;
    headTxt += '</head>';

    var bodyTxt = '<body>' +
      '<div id="pre" class="h5p-jsxgraph-comment-post">' + options.commentPre + '</div>' +
      outerPre +
      '<div id="' + divId + '" class="jxgbox" ' +
      'style="' + composeCSSForJXG(options) + '"' +
      '></div>' +
      outerPost +
      '' +
      '<script type="text/javascript">' +
      depurify(options.code).replace(/BOARDID/g, "'" + divId + "'") +
      '</script>' +
      '<div id="post" class="h5p-jsxgraph-comment-post">'
      + options.commentPost +
      '</div>';

    bodyTxt += '</body>';

    //$container.append(headTxt + bodyTxt);

    $iframe = $('<iframe id="xxx" src="about:blank" scrolling="no" frameborder="0" sandbox="allow-same-origin allow-scripts" class="h5p-iframe-content h5p-iframe-wrapper" />');

    $container.html('');
    $container.append($iframe);
    var doc = $iframe.contents()[0];

    doc.open('text/html', 'replace');
    doc.write(headTxt);
    doc.write(bodyTxt);
    doc.close();

    $iframe.css({ width: '100%', height: this.options.advanced.height});
    // var node = document.getElementById('xxx'); //contentWindow.document.getElementsByTagName('body').item(0);
    // var h = node.contentWindow.document.body.scrollHeight;
    // console.log(node.contentWindow.document.body);

    //console.log(H5P.getLibraryConfig('H5P.JSXGraph'));
    //console.log(H5P.getContent());
    //console.log(H5P.getContentForInstance());
    // console.log(H5P);

  };

  return C;
})(H5P.jQuery);