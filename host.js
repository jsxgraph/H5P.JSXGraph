"use strict";

// Convert the PHP attribute array into a JavaScript object.
var attr = JSON.parse('<?php echo json_encode($attr);?>');

const uuid = attr.uuid;

const client_js = `
    const uuid = '${uuid}';

    // Handle messages from the parent window
    const handleMsg = function(msg) {
        var el;

        // Check UUID
        if (msg.uuid !== uuid) {
            console.log("[iframe] msg from parent discarded", msg);
            return;
        }

        // console.log("[iframe] receive", msg.cmd);
        switch (msg.cmd) {
            case 'move':
                // Move a point given by name
                el = board.select(msg.name);
                el.moveTo([el.X() + msg.dx, el.Y() + msg.dy], 500);
                board.triggerEventHandlers(['up'], []);
                break;
            case 'get':
                // Get coordinates of a point given by name
                el = board.select(msg.name);
                sendMessage({
                    cmd: 'send',
                    data: {
                        name: el.name,
                        x: el.X(),
                        y: el.Y(),
                        z: el.Z()
                    }
                });
                break;
            case 'getAllValues':
                let len = msg.values.length;
                for (let i = 0; i < len; i++) {
                    inputsFromHost['inp' + i].value = JSON.parse(msg.values['inp' + i].value);
                }
                // console.log("[iframe] inputsFromHost", inputsFromHost);
                break;

            case 'moveStack':
                // Move a point given by name
                // console.log("moveStack", msg.value, typeof msg.value);
                el = board.select(msg.pointId);
                el.moveTo(JSON.parse(msg.value));
                break;
        };
    };

    // Send messages to the parent window
    const sendMessage = function(msg_obj) {
        msg_obj.uuid = uuid;
        window.parent.postMessage(JSON.stringify(msg_obj), '*');
        delete msg_obj.uuid;
    };

    // Wait for messages from the parent window
    window.addEventListener("message", function (evt) {
        handleMsg(JSON.parse(evt.data));
        return false;
    }, false);

    // Send initial message to the parent window
    // informing about the size of the body element.
    window.addEventListener("load", function(evt){
        let html = document.documentElement;
        sendMessage({
            cmd: 'adapt',
            w: html.scrollWidth,
            h: html.scrollHeight
        });
    }, false);

    // --------------------------------------------
    // Formulas communication (sort of)

    const bindInput = function(inputNumber, valueFunction, board) {
        board.on('up', function() {
            sendMessage({
                cmd: 'bind',
                inputNumber: inputNumber,
                value: valueFunction()
            });
        });

        board.update();
        board.triggerEventHandlers(['up'], []);
    };

    const getAllValues = function() {
        var e, values = [];

        // Convert object to array
        for (let e in inputsFromHost) {
            if (inputsFromHost.hasOwnProperty(e)) {
                values.push(parseFloat(inputsFromHost[e].value));
            }
        }
        return values;
    };

    // --------------------------------------------
    // Stack communication (sort of)

    const bind_point = function(inputRef, point) {
        // This function takes a JXG point object and binds its coordinates to a given input.

        // The binding from graph to input.
        point.board.on('update', function() {
            var tmp = JSON.stringify([point.X(), point.Y()]);
            sendMessage({
                cmd: 'stackSetVal',
                inputRef: inputRef,
                value: tmp
            });
        });

        // Trigger the binding from input to graph.
        sendMessage({
            cmd: 'bindPoint',
            lastValue: JSON.stringify([point.X(), point.Y()]),
            inputRef: inputRef,
            pointId: point.id
        });
    };
`;

// Additional, hand-made security
const cleanCode = function (str) {
    return str.
        replace(/document\.write/g, '').
        replace(/<script.*<\/script>/g, '').
        replace(/<link.*>/g, '').
        replace(/new Function\(/g, '').
        replace(/\s+eval\(/g, '');
};

/**
 * Generate a string that contains the inputs of all
 * input tags of the question.
 * Only needed for Formulas
 *
 * @returns String;
 */
const initAllValues = function(inputIds) {
    var len = inputIds.length,
        i, id,
        values = {},
        txt = 'var inputsFromHost = ';

    for (i = 0; i <len; i++) {
        id = inputIds[i];
        values[id] = {
            id: id,
            value: document.getElementById(id).value
        };
    }
    // console.log(values);
    return txt + JSON.stringify(values) + ';\n';
};

const writeIframe = function (jsxgraph_src, jsxgraph_css, pre_text, code, post_text, attr) {
    var src = '', sandbox, allow, csp;

    // Generate HTML source
    src += '<html><head>';
    src += '<style>body {background-color: #ffffff; padding:0; margin: 0;}</style>';
    src += '<style>' + jsxgraph_css + '</style>';
    src += '<' + 'script' + '>';
    src += jsxgraph_src + '\n';
    src += client_js + '\n';

    src += initAllValues(['inp0', 'inp1']);

    src += '<' + '/script' + '>';
    src += '</head>'
    src += `<body class="${attr.body.class}" style="${attr.body.style}">`;
    src += `<div id="${attr.div.id}" class="${attr.div.class}" style="${attr.div.style}">`;
    src += pre_text;
    src += `<div id="${attr.jsxgraph.id}" class="jxgbox ${attr.jsxgraph.class}" style="${attr.jsxgraph.style}"></div>`;
    src += post_text;
    src += '<' + 'script' + '>';
    src += cleanCode(code);
    src += '<' + '/script' + '>';
    src += '</div>';
    src += '</body></html>';

    const iframe = document.createElement('iframe');
    iframe.setAttribute('name', attr.iframe.name);
    iframe.setAttribute('id', attr.iframe.id);
    iframe.setAttribute('class', attr.iframe.class);
    iframe.setAttribute('style', attr.iframe.style);
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('srcdoc', src);

    // Security
    sandbox = "allow-scripts";
    allow = "fullscreen *;";
    csp = "navigate-to \'none\'; " +
        "connect-src \'none\'; " +
        "worker-src \'none\'; " +
        "script-src \'unsafe-inline\' \'self\';";

    iframe.setAttribute('sandbox', sandbox);
    iframe.setAttribute('allow', allow);
    iframe.setAttribute('csp', csp);
    document.body.appendChild(iframe);
};

const createJSXGraphFrame = async function (pre_text, code, post_text, attr) {
    var jsxgraph_code, jsxgraph_css;

    await fetch(attr.url.js)
        .then(response => response.text())
        .then(data => { jsxgraph_code = data });
    await fetch(attr.url.css)
        .then(response => response.text())
        .then(data => { jsxgraph_css = data });

    writeIframe(jsxgraph_code, jsxgraph_css, pre_text, code, post_text, attr);
};

// Event handler for messages from iframe
window.addEventListener("message", (e) => {
    var msg = JSON.parse(e.data),
        node, theInput;

    if (msg.uuid !== uuid) {
        console.log("msg from iframe discarded", msg);
        return;
    }

    // console.log("[host] receive:", msg.cmd);
    switch (msg.cmd) {
        case 'bind':
            // Formulas style
            // console.log("[host] bind:", msg);
            let decimalPrecision = 2,
                prec = Math.pow(10, decimalPrecision);
            node = document.getElementById('inp' + msg.inputNumber);
            if (node) {
                node.value = Math.round(msg.value * prec) / prec;
            }
            break;
        case 'adapt':
            // Set the iframe size
            var w = msg.w,
                h = msg.h,
                node = document.getElementById(attr.iframe.name);

            node.style.width = w + 'px';
            node.style.height = h + 'px';
            break;
        case 'data':
        case 'send':
            console.log("[host]", msg.cmd, msg.data);
            break;

        // Handle Stack events
        case 'stackSetVal':
            theInput = document.getElementById(msg.inputRef),
                tmp = msg.value;

            // console.log("[host] stackSetVal", tmp, typeof tmp)
            if (theInput.value !== tmp) {
                // Avoid resetting this, as some event models might trigger
                // change events even when no change actually happens.
                theInput.value = tmp;
                // As we set the inputs value programmatically no events
                // will be fired. But for two way binding we want to fire them...
                // However we do not need this in the preview where it annoys people.
                if (window.location.pathname.indexOf('preview.php') === -1) {
                    var e = new Event('change');
                    theInput.dispatchEvent(e);
                }
            } else{
                // console.log("Ignore stackSetVal");
            }
            break;
        case 'bindPoint':
            theInput = document.getElementById(msg.inputRef);
            (function() {
                var lastValue = msg.lastValue;    // String

                theInput.addEventListener('input', function(e) {
                    // console.log("[host] onInput");
                    if (theInput.value !== lastValue) {
                        // Only when something changed.
                        try {
                            var tmp = JSON.parse(theInput.value);
                            if (typeof tmp[0] == 'number' && typeof tmp[1] == 'number') {
                                msg2iframe({
                                    uuid: uuid,
                                    cmd: 'moveStack',
                                    pointId: msg.pointId,
                                    value: JSON.stringify(tmp)
                                });
                            }
                        } catch (err) {
                            // We do not care about this.
                            // console.log("Ignore input");
                        }
                        lastValue = theInput.value;
                    }
                });
                theInput.addEventListener('change', function(e) {
                    var tmp = JSON.parse(theInput.value);

                    if (JSON.stringify(tmp) !== lastValue) {
                        // Only when something changed.
                        try {
                            if (typeof tmp[0] == 'number' && typeof tmp[1] == 'number') {
                                msg2iframe({
                                    uuid: uuid,
                                    cmd: 'moveStack',
                                    pointId: msg.pointId,
                                    value: JSON.stringify(tmp)
                                });
                            }
                        } catch (err) {
                            // We do not care about this.
                            // console.log("Ignore change");
                        }
                        lastValue = theInput.value;
                    }
                });
                var e = new Event('change');
                    theInput.dispatchEvent(e);
            })();

    }
});

// Formulas style, host part
// Not sure if this is needed at all
var sendAllValues = function() {
    var len = 2,
        values = {};

    for (let i = 0; i < len; i++) {
        values['inp' + i] = {
            id: 'inp' + i,
            value: JSON.stringify(document.getElementById('inp' + i).value)
        }
    }
    msg2iframe({
        uuid: uuid,
        cmd: 'getAllValues',
        values: values
    });
}

// -------------------------------------------------
// Handle messages to and from the iframe
function msg2iframe(msg) {
    var win = window.frames[attr.iframe.name];
    win.postMessage(JSON.stringify(msg), '*');
}

