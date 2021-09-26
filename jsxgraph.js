var H5P = H5P || {};

H5P.JSXGraph = (function ($) {
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
        boardId: '',
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
    var boardId = 'jxg' + Math.random(),
      composeCSS = function (options) {
        var txt = '';
        if (options.advanced.showFixedSize) {
          txt += 'width:' + options.advanced.width + '; ';
          txt += 'height:' + options.advanced.height + '; ';
        }
        else {
          txt += 'max-width:' + options.advanced.maxWidth + '; ';
          txt += 'aspect-ratio:' + options.advanced.aspectRatio + '; ';
        }
        return txt;
      };

    if (this.options.boardId !== '') {
      boardId = this.options.boardId;
    }

    // Set class on container to identify it as a JSXGraph construction.
    $container.addClass("h5p-jsxgraph");
    $container.append('<div id="pre" class="h5p-jsxgraph-comment-post">' + this.options.commentPre + '</div>');
    composeCSS(this.options);
    $container.append('<div id="' + boardId + '" class="jxgbox" ' +
      'style="' + composeCSS(this.options) + '"' +
      '></div>' +
      '<script type="text/javascript">' +
      depurify(this.options.code).replace(/BOARDID/g, "'" + boardId + "'") +
      '</script>');
    $container.append('<div id="post" class="h5p-jsxgraph-comment-post">' + this.options.commentPost + '</div>');
  };

  return C;
})(H5P.jQuery);