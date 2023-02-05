var H5P = H5P || {};

"use strict";

H5P.JSXGraph = (function ($) {
    //   var $ = H5P.jQuery;
    //   this.$ = $(this);
    var useMathJax = true;

    var depurify = function (str) {
        return str.replace(/&#039;/g, "'").
            replace(/&quot;/g, '"').
            replace(/&lt;/g, '<').
            replace(/&gt;/g, '>').
            replace(/&amp;/g, '&');
    };

    /**
     * Remove unwanted code
     *
     * @param {String} str
     * @returns {String} purified string
     */
    var cleanupJS = function (str) {
        return str.
            replace(/document\.write/g, '').
            replace(/<script.*<\/script>/g, '').
            replace(/<link.*>/g, '').
            replace(/new Function\(/g, '').
            replace(/\s+eval\(/g, '');
    };

    const createUUID = function () {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    };

    /**
     * CSS properties for the style attribute of the JSXGraph div.
     * @param  {Object} options
     * @returns {String} String of CSS properties.
     */
    var getCSSForJXG = function (options) {
        var txt = '',
            res, w, h;

        if (false /*options.advanced.showFixedSize*/) {
            txt += 'width:' + options.advanced.width + '; ';
            txt += 'height:' + options.advanced.height + '; ';
        }
        else {
            // Use the new CSS property aspect-ratio.
            //txt += 'max-width:' + options.advanced.maxWidth + '; ';
            // txt += 'aspect-ratio:' + options.advanced.aspectRatio + '; ';
            // txt += 'margin: 0 auto;'
            // Use the old aspect-ratio hack.
            res = options.advanced.aspectRatio.match(/\w*(\d+)\w*\/\w*(\d+)\w*/);
            w = parseFloat(res[1]);
            h = parseFloat(res[2]);
            txt += 'height:0; padding-bottom:' + (100 * h / w) + '%;'
        }
        return txt;
    };

    /**
     * Compose the HTML head of the iframe
     * @param {String} libPath Path for JSXGraph js and CSS files
     * @param {String} csp String containing the content security policy
     * @param {String} secureJS Additional security
     * @returns {String} HTML text of the head part of the iframe
     */
    var getHead = function (libPath, csp, secureJS) {
        var headTxt = '<head><meta http-equiv="Content-Security-Policy" content="' + csp + '">';

        /**
         * Add JavaScript libraries and CSS files to the iFrame
         */
        if (useMathJax) {
            headTxt +=
                '<script src="' + libPath + '3rdparty/mathjax/es5/tex-chtml.js" type="text/javascript"></script>';
        }

        headTxt +=
            '<script src="' + libPath + 'jsxgraphcore.js" type="text/javascript"></script>' +
            '<link rel="stylesheet" href="' + libPath + 'h5p-jsxgraph.css" type="text/css">' +
            '<link rel="stylesheet" href="' + libPath + 'jsxgraph.css" type="text/css">';

        headTxt += secureJS;
        headTxt += '</head>';

        return headTxt;
    };

    /**
     * Build string consisting of the body of the iframe.
     * @param {String} divId
     * @param {Object} options
     * @returns
     */
    var getBody = function (divId, options) {
        var bodyTxt, outerPre, outerPost;

        // Set class on container to identify it as a JSXGraph construction.
        if (true /*!options.advanced.showFixedSize*/) {
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

        bodyTxt = '<body>' +
            // First text field
            '<div id="pre" class="h5p-jsxgraph-comment-post">' +
            options.commentPre +
            '</div>' +

            // JSXGraph div
            outerPre +
            '<div id="' + divId + '" class="jxgbox" ' +
            'style="' + getCSSForJXG(options) + '"' +
            '></div>' +
            outerPost +
            '' +

            // JavaScript code
            '<script type="text/javascript">' +
            cleanupJS(depurify(options.code).replace(/BOARDID/g, "'" + divId + "'")) +
            '</script>' +

            // Second text field
            '<div id="post" class="h5p-jsxgraph-comment-post">'
            + options.commentPost +
            '</div>';

        bodyTxt += '</body>';

        return bodyTxt;
    };

    var getHead2 = function (libPath, secureJS) {
        var headTxt = '<head>';

        /**
         * Add JavaScript libraries and CSS files to the iFrame
         */
        if (useMathJax) {
            headTxt +=
                '<script src="' + libPath + '3rdparty/mathjax/es5/tex-chtml.js" type="text/javascript"></script>';
        }

        headTxt +=
            '<script src="' + libPath + 'jsxgraphcore.js" type="text/javascript"></script>' +
            '<script src="' + libPath + 'jsxgraph_client.js" type="text/javascript"></script>' +
            '<link rel="stylesheet" href="' + libPath + 'h5p-jsxgraph.css" type="text/css">' +
            '<link rel="stylesheet" href="' + libPath + 'jsxgraph.css" type="text/css">';

        headTxt += secureJS;
        headTxt += '</head>';

        return headTxt;
    };

    var getBody2 = function (divId, options) {
        var bodyTxt, outerPre, outerPost;

        // Set class on container to identify it as a JSXGraph construction.
        if (true /*!options.advanced.showFixedSize*/) {
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

        bodyTxt = '<body>' +
            // First text field
            '<div id="pre" class="h5p-jsxgraph-comment-post">' +
            options.commentPre +
            '</div>' +

            // JSXGraph div
            outerPre +
            '<div id="' + divId + '" class="jxgbox" ' +
            'style="' + getCSSForJXG(options) + '"' +
            '></div>' +
            outerPost +
            '' +

            // JavaScript code
            '<script type="text/javascript">' +
            cleanupJS(depurify(options.code).replace(/BOARDID/g, "'" + divId + "'")) +
            '</script>' +

            // Second text field
            '<div id="post" class="h5p-jsxgraph-comment-post">'
            + options.commentPost +
            '</div>';

        bodyTxt += '</body>';

        return bodyTxt;
    };

    const writeIframe = function (libPath, secureJS, pre_text, code, post_text, attr) {
        var src = '', sandbox, allow, csp;

        // Generate HTML source
        src += '<!DOCTYPE html><html>';
        src += getHead2(libPath, secureJS);

        src += `<body class="${attr.body.class}" style="${attr.body.style}">`;
        src += pre_text;
        src += `<div id="${attr.jsxgraph.id}" class="jxgbox ${attr.jsxgraph.class}" style="${attr.jsxgraph.style}"></div>`;
        src += post_text;
        src += '<' + 'script' + '>';
        src += cleanCode(code);
        src += '<' + '/script' + '>';
        src += '</body></html>';

        // const uuid = '${uuid}';


        const iframe = document.createElement('iframe');
        iframe.setAttribute('name', attr.iframe.name);
        iframe.setAttribute('id', attr.iframe.id);
        iframe.setAttribute('class', attr.iframe.class);
        iframe.setAttribute('style', attr.iframe.style);
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('srcdoc', src);

        // Security
        sandbox = 'allow-scripts';
        allow = "fullscreen *;";
        csp = 'navigate-to \'none\'; ' +
            'connect-src \'none\'; ' +
            'worker-src \'none\'; ' +
            'script-src \'unsafe-inline\' \'self\';';

        iframe.setAttribute('sandbox', sandbox);
        iframe.setAttribute('allow', allow);
        iframe.setAttribute('csp', csp);

        // document.body.appendChild(iframe);
        return iframe;
    };

    /**
     * Constructor function.
     */
    function C(options, id) {
        // Extend defaults with provided options

        this.options = $.extend(true, {}, {
            resizeSupported: true, // Unused?
            commentPre: 'BEFORE',
            commentPost: 'AFTER',
            advanced: {
                divId: '',
                // showFixedSize: true,
                width: '500px',
                height: '900px',
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
        var divId, csp, libPath, secureJS,
            doc, sandbox,
            options = this.options;

        /**
         * divId is the Id of the JSXGraph div
         */
        if (options.divId !== undefined && options.divId !== '') {
            // Take the supplied Id for the JSXGraph div.
            divId = options.divId;
        }
        else {
            // Choose random Id for the JSXGraph div.
            divId = 'jxg' + Math.random();
        }

        // libPath = "/sites/default/files/h5p/development/H5P.JSXGraph/";
        libPath = H5P.getLibraryPath('H5P.JSXGraph').replace('libraries', 'development') + '/';

        /**
         * Security: Add Content-Security-Policy to the head of the iframe
         *
         * Iframe can only connect to the hosting server.
         *
         */
        csp = 'navigate-to \'none\'; ' +
            'connect-src \'none\'; ' +
            'worker-src \'none\'; ' +
            'script-src \'unsafe-inline\' \'self\';';

        /**
         * Additional security measure:
         * Block XHR and Websockets by disabling the objects
         * This should be redundant because of Content-Security-Policy.
         */
        secureJS = '<' + 'script type="text/javascript"' + '>' +
            'XMLHttpRequest = {};' +
            'WebSocket = {};' +
            'document.write = function() {};' + // It seems better to disable it instead of removing it from the code as above
            '</' + 'script' + '>';

        /**
         * Attribute sandbox for the iframe.
         * Allowed are:
         *   allow-same-origin:	Allows the iframe content to be treated as being from the same origin
         *   allow-scripts:	Allows to run scripts
         *
         * Blocked are:
         *   allow-forms:	Allows form submission
         *   allow-modals: Allows to open modal windows
         *   allow-orientation-lock:	Allows to lock the screen orientation
         *   allow-pointer-lock:	Allows to use the Pointer Lock API
         *   allow-popups: Allows popups
         *   allow-popups-to-escape-sandbox:	Allows popups to open new windows without inheriting the sandboxing
         *   allow-presentation:	Allows to start a presentation session
         *   allow-top-navigation:	Allows the iframe content to navigate its top-level browsing context
         *   allow-top-navigation-by-user-: Allows the iframeactivation content to navigate its top-level browsing context, but only if initiated by user
         */
        sandbox = ' sandbox="allow-same-origin allow-scripts" ';

        if (false) {
            // Use H5P iframe
            $container.append(getHead(libPath, csp, secureJS) + getBody(divId, options));
        } else if (false) {
            // Create iframe from scratch
            $iframe = $('<iframe src="about:blank" scrolling="auto" frameborder="0"' + sandbox + 'class="h5p-iframe-content h5p-iframe-wrapper" />');

            $container.html('');
            $container.append($iframe);
            doc = $iframe.contents()[0];

            doc.open('text/html', 'replace');
            doc.writeln(getHead(libPath, csp, secureJS));
            doc.writeln(getBody(divId, options));
            doc.close();

            $iframe.css({ width: '100%', height: this.options.advanced.height });
        } else {

            const attr = {
                uuid: createUUID(),
                url: {
                    js: './jsxgraphcore.js',
                    css: './jsxgraph.css'
                },
                iframe: {
                    name: 'jsxgraph_iframe',
                    id: 'jsxgraph_iframe',
                    class: 'jxg_iframe',
                    style: ''
                },
                body: {
                    class: '',
                    style: 'padding: 20px;'
                },
                jsxgraph: {
                    id: divId,
                    style: 'width: 600px; aspect-ratio: 1/1;',
                    class: ''
                }
            };

            $iframe = writeIframe(jsxgraph_code, jsxgraph_css, pre_text, code, post_text, attr);

        }
        $container.addClass("h5p-jsxgraph");
    };

    return C;
})(H5P.jQuery);