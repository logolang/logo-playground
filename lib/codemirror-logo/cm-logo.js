/*global CodeMirror*/
var CodeMirror = require('codemirror');
// Really just a lexer
if (typeof CodeMirror !== 'undefined') {
    CodeMirror.defineMode('logo', function (config, parserConfig) {
        // states are 'normal', 'defn-name', 'defn-args', 'defn-body'

        // TODO: different highlighting inside list [] and array {} literals

        var regexQuoted = /^(["'](?:[^ \f\n\r\t\v[\](){}\\]|\\[^])*)/;
        var regexOwnWord = /^([\u2190-\u2193])/;
        var regexNumber = /^([0-9]*\.?[0-9]+(?:[eE]\s*[\-+]?\s*[0-9]+)?)/;
        var regexVariable = /^(:(:?[\u2190-\u2193]|[^ \f\n\r\t\v[\](){}+\-*/%^=<>]+))/;
        var regexWord = /^([\u2190-\u2193]|[^ \f\n\r\t\v[\](){}+\-*/%^=<>]+)/;
        var regexOperator = /^(>=|<=|<>|[+\-*/%^=<>[\]{}()])/;

        return {
            electricChars: "[]dD", // for enD

            startState: function () {
                return {
                    state: 'normal',
                    indent: 0
                };
            },

            indent: function (state, textAfter) {
                var size = 2;
                var indent = state.indent;
                if (/^\]/.test(textAfter))
                    --indent;
                switch (state.state) {
                    case 'defn-name':
                        return (indent + 1) * size;
                    case 'defn-vars':
                    case 'defn-body':
                        if (/^END\b/i.test(textAfter))
                            return indent * size;
                        return (indent + 1) * size;
                    default:
                        return indent * size;;
                }
            },

            token: function (stream, state) {
                var name, i;

                if (stream.eatSpace()) {
                    return null;
                }

                // Comment
                if (stream.match(/^;.*/, true)) {
                    return 'comment';
                }

                if (state.state === 'normal') {
                    if (stream.match(/^TO\b/i, true)) {
                        state.state = 'defn-name';
                        return 'keyword';
                    }
                    if (stream.match(/^END\b/i, true)) {
                        return 'error';
                    }
                }

                if (state.state === 'defn-name') {
                    if (stream.match(regexWord, true)) {

                        state.state = 'defn-vars';
                        return 'def';
                    }
                    stream.next();
                    state.state = 'normal';
                    return 'error';
                }

                if (state.state === 'defn-vars') {
                    if (stream.match(regexVariable, true)) {
                        return 'def';
                    }
                    state.state = 'defn-body';
                }

                if (state.state === 'defn-body') {

                    if (stream.match(/^END\b/i, true)) {
                        state.state = 'normal';
                        return 'keyword';
                    }
                }

                if (state.state === 'normal' || state.state === 'defn-body') {

                    // Number literal
                    if (stream.match(regexNumber, true)) {
                        return 'number';
                    }

                    // String literal
                    if (stream.match(regexQuoted, true)) {
                        return 'string';
                    }

                    if (stream.match(/^\[/, true)) {
                        ++state.indent;
                        return 'bracket';
                    }

                    if (stream.match(/^\]/, true)) {
                        if (state.indent > 0)--state.indent;
                        return 'bracket';
                    }

                    // Operator
                    if (stream.match(regexOperator, true)) {
                        return 'operator';
                    }

                    // Variable
                    if (stream.match(regexVariable, true)) {
                        return 'variable';
                    }

                    // Special Words
                    if (stream.match(/^(TRUE|FALSE|ELSE|REPEAT|IF|IFELSE|FOREVER)\b/i, true)) {
                        return 'keyword';
                    }

                    // Word
                    if (stream.match(regexOwnWord, true) || stream.match(regexWord, true)) {
                        return 'variable-2';
                    }

                    stream.next();
                    return 'error';
                }

                throw 'WTF?';
            }
        };
    });

    CodeMirror.defineMIME("text/x-logo", "logo");
}
