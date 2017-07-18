(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _string = require("../../scripts/components/string");

var _string2 = _interopRequireDefault(_string);

var _regex = require("../../scripts/components/regex");

var _regex2 = _interopRequireDefault(_regex);

var _reflection = require("../../scripts/components/reflection");

var _reflection2 = _interopRequireDefault(_reflection);

var _exceptions = require("../../scripts/exceptions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Normalizes a sort by condition.
 */
function normalizeOrder(props) {
  var l = props.length;
  for (var i = 0; i < l; i++) {
    var p = props[i],
        name = p[0],
        order = p[1];
    if (!_utils2.default.isNumber(order) && !/^asc|^desc/i.test(order)) {
      (0, _exceptions.ArgumentException)("The sort order '" + order + "' for '" + name + "' is not valid (it must be /^asc|^desc/i).");
    }
    p[1] = _utils2.default.isNumber(order) ? order : /^asc/i.test(order) ? 1 : -1;
  }
  return props;
}

/**
 * Parses a string, possibly represented with thousands separators,
 * decimal separators different than JS default.
 */
/**
 * Array utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function parseAnyNumber(s) {
  var parts = s.split(/([\.\,]\d+)$/);
  var integralPart = parts[0],
      decimalPart = parts[1],
      a = 0;
  if (integralPart) {
    a = parseInt(integralPart.replace(/\D/g, ""));
  }
  if (decimalPart) {
    a += parseFloat(decimalPart.replace(/\,/g, "."));
  }
  return (/^\s?-/.test(s) ? -a : a
  );
}

/**
 * Returns a value indicating whether the given string looks sortable as a number.
 * If true, returns a parsed number.
 */
function lookSortableAsNumber(s) {
  if (!_utils2.default.isString(s)) {
    (0, _exceptions.TypeException)("s", "string");
  }
  var m = s.match(/[-+~]?([0-9]{1,3}(?:[,\s\.]{1}[0-9]{3})*(?:[\.|\,]{1}[0-9]+)?)/g);
  if (m && m.length == 1) {
    if (/(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})$/.test(s)) {
      // hexadecimal string: alphabetical order is fine
      return false;
    }
    // Numbers are checked only if there is a single match in the string.
    // how many digits compared to other letters?
    var nonNumbers = s.match(/[^0-9\.\,\s]/g).length;
    if (nonNumbers > 6) {
      // there are too many characters that are not numbers or separators;
      // the string must be most probably sorted in alphabetical order
      return false;
    }
    var numericPart = m[0];
    var numVal = parseAnyNumber(numericPart);
    return numVal;
  }
  return false;
}

var options = {
  autoParseNumbers: true,
  ci: true
};

exports.default = {

  normalizeOrder: normalizeOrder,

  lookSortableAsNumber: lookSortableAsNumber,

  options: options,

  /**
   * Parses a sort by string, converting it into an array of arrays.
   * 
   * @param {string} s, string to sort
   */
  parseSortBy: function parseSortBy(s) {
    if (!s) return;
    var parts = s.split(/\s*,\s*/g);
    return _utils2.default.map(parts, function (part) {
      var a = part.split(/\s/),
          name = a[0],
          order = a[1] || "asc";
      return [name, _string2.default.startsWith(order, "asc", true) ? 1 : -1];
    });
  },
  humanSortBy: function humanSortBy(a, verbose) {
    if (!a || !a.length) return "";
    return _utils2.default.map(a, function (part) {
      var name = part[0],
          order = part[1];
      if (order === 1) {
        return verbose ? name + " asc" : name;
      }
      return name + " desc";
    }).join(", ");
  },


  /**
   * Gets sort criteria from given arguments.
   */
  getSortCriteria: function getSortCriteria(args) {
    var _this = this;

    var al = args.length,
        props;

    if (args.length == 1) {
      var firstParameter = args[0];
      if (_utils2.default.isString(firstParameter) && firstParameter.search(/,|\s/) > -1) return this.parseSortBy(firstParameter);
    }

    if (al > 1) {
      // passing multiple property names sortBy(a, "aa", "bb", "cc");
      var a = _utils2.default.toArray(args);
      props = _utils2.default.map(a, function (x) {
        return _this.normalizeSortByValue(x, true);
      });
    } else {
      // expect a single string; or an object
      props = this.normalizeSortByValue(args[0]);
    }
    return props;
  },


  /**
   * Normalizes a sort by condition.
   */
  normalizeSortByValue: function normalizeSortByValue(a, multi) {
    var _this2 = this;

    if (_utils2.default.isString(a)) {
      return multi ? [a, "asc"] : [[a, "asc"]];
    }
    if (_utils2.default.isArray(a)) {
      if (_utils2.default.isArray(a[0])) return a; // Hej, here we can expect the user of the function is passing a proper parameter.
      return _utils2.default.map(a, function (c) {
        return _this2.normalizeSortByValue(c, true);
      });
    }
    if (_utils2.default.isPlainObject(a)) {
      var x,
          b = [];
      for (x in a) {
        b.push([x, a[x]]);
      }
      return b;
    }
    (0, _exceptions.TypeException)("sort", "string | [] | {}");
  },


  /**
   * Compares two strings, but also checking if they look like numbers.
   * In this case, they are compared as numbers.
   */
  compareStrings: function compareStrings(a, b, order) {
    if (this.options.autoParseNumbers) {
      //
      // check if the strings contain numbers
      //
      var aVal = lookSortableAsNumber(a),
          bVal = lookSortableAsNumber(b);
      // numbers win
      if (aVal !== false || bVal !== false) {
        // sort as numbers: this is most probably what the programmer desires
        if (aVal === bVal) return 0;
        if (aVal !== false && b === false) return order;
        if (aVal === false && b !== false) return -order;
        if (aVal < bVal) return -order;
        if (aVal > bVal) return order;
      }
    }
    return _string2.default.compare(a, b, order, this.options);
  },


  /**
   * Sorts an array of items by one or more properties.
   *
   * @param ar: array to sort
   * @param {(string|string[]|objects)} sort: object describing
   * @param order: ascending / descending
   */
  sortBy: function sortBy(ar) {
    if (!_utils2.default.isArray(ar)) (0, _exceptions.TypeException)("ar", "array");

    var al = arguments.length,
        args = _utils2.default.toArray(arguments).slice(1, al),
        props = this.getSortCriteria(args);
    props = normalizeOrder(props);
    var l = props.length;
    // Obtain sort by in this shape:
    // [["a", "asc"], ["b", "asc"]]
    // since EcmaScript objects are not guaranteed by standard to be ordered dictionaries
    var isString = _utils2.default.isString;
    var compareStrings = this.compareStrings.bind(this);
    var und = undefined,
        nu = null;
    ar.sort(function (a, b) {
      if (a === b) return 0;
      if (a !== und && b === und) return -1;
      if (a === und && b !== und) return 1;
      if (a !== nu && b === nu) return -1;
      if (a === nu && b !== nu) return 1;
      // NB: by design, the order by properties are expected to be in order of importance
      //
      for (var i = 0; i < l; i++) {
        var p = props[i],
            name = p[0],
            order = p[1];
        var c = a[name],
            d = b[name];
        if (c === d) continue; // property is identical, continue to next
        if (c !== und && d === und) return -order;
        if (c === und && d !== und) return order;
        if (c !== nu && d === nu) return -order;
        if (c === nu && d !== nu) return order;
        if (c && !d) return order;
        if (!c && d) return -order;
        if (isString(c) && isString(d))
          //sort, supporting special characters
          return compareStrings(c, d, order);
        if (c < d) return -order;
        if (c > d) return order;
      }
      return 0;
    });
    return ar;
  },


  /**
   * Sorts an array of items by a single property.
   *
   * @param arr: array to sort
   * @param property: name of the sort property
   * @param order: ascending / descending
   */
  sortByProperty: function sortByProperty(arr, property, order) {
    if (!_utils2.default.isArray(arr)) (0, _exceptions.TypeException)("arr", "array");
    if (!_utils2.default.isString(property)) (0, _exceptions.TypeException)("property", "string");
    if (!_utils2.default.isUnd(order)) order = "asc";
    order = _utils2.default.isNumber(order) ? order : /^asc/i.test(order) ? 1 : -1;
    var o = {};
    o[property] = order;
    return this.sortBy(arr, o);
  },


  /**
   * Searches inside a collection of items by a string property, using the given pattern,
   * sorting the results by number of matches, first index and number of recourrences
  */
  searchByStringProperty: function searchByStringProperty(options) {
    _utils2.default.require(options, ["pattern", "collection", "property"]);
    return this.searchByStringProperties(_utils2.default.extend(options, {
      properties: [options.property]
    }));
  },


  /**
   * Searches inside a collection of items by all string properties.
   */
  search: function search(a) {
    if (!a || !a.length) return a;
    var l = arguments.length;
    if (l < 2) return a;
    var args = _utils2.default.toArray(arguments).slice(1, l);
    var props = [],
        x,
        item,
        isString = _utils2.default.isString;
    for (var i = 0, l = a.length; i < l; i++) {
      item = a[i];
      for (x in item) {
        if (isString(item[x]) && props.indexOf(x) == -1) {
          props.push(x);
        }
      }
    }
    _utils2.default.each(args, function (x) {
      if (!_utils2.default.isString(x)) {
        (0, _exceptions.ArgumentException)("Unexpected parameter " + x);
      }
    });
    return this.searchByStringProperties({
      collection: a,
      pattern: _regex2.default.getPatternFromStrings(args),
      properties: props,
      normalize: true
    });
  },


  /**
   * Searches inside a collection of items by certains string properties, using the given pattern,
   * sorting the results by number of matches, first index and number of recourrences.
   */
  searchByStringProperties: function searchByStringProperties(options) {
    var defaults = {
      order: "asc",
      limit: null,
      keepSearchDetails: false,
      getResults: function getResults(a) {
        if (this.decorate) {
          // add information about which property 
          for (var i = 0, l = a.length; i < l; i++) {
            var item = a[i];
            var matches = _utils2.default.where(item.matches, function (m) {
              return m != null;
            });
            a[i].obj.__search_matches__ = matches.length ? _utils2.default.map(matches, function (x) {
              return x.matchedProperty;
            }) : [];
          }
        }
        if (this.keepSearchDetails) {
          return a;
        }
        var b = [];
        for (var i = 0, l = a.length; i < l; i++) {
          b.push(a[i].obj);
        }
        return b;
      },
      normalize: true,
      decorate: false // whether to decorate source objects with list of properties that 
    };
    var o = _utils2.default.extend({}, defaults, options);
    if (!o.order || !o.order.match(/asc|ascending|desc|descending/i)) o.order = "asc";
    var matches = [],
        rx = o.pattern;
    if (!(rx instanceof RegExp)) {
      if (_utils2.default.isString(rx)) {
        rx = _regex2.default.getSearchPattern(rx);
      } else {
        throw new Error("the pattern must be a string or a regular expression");
      }
    }
    var properties = o.properties,
        len = "length",
        normalize = o.normalize;
    var collection = o.collection;
    var isArray = _utils2.default.isArray,
        isNumber = _utils2.default.isNumber,
        flatten = _utils2.default.flatten,
        map = _utils2.default.map;
    for (var i = 0, l = collection[len]; i < l; i++) {
      var obj = collection[i],
          objmatches = [],
          totalMatches = 0;

      for (var k = 0, t = properties[len]; k < t; k++) {
        var prop = properties[k],
            val = _reflection2.default.getPropertyValue(obj, prop);

        if (!val) continue;
        if (!val.match) val = val.toString();

        if (isArray(val)) {
          if (!val[len]) {
            continue;
          }
          val = flatten(val);
          var mm = [],
              firstIndex;
          for (var a = 0, l = val[len]; a < l; a++) {
            var match = val[a].match(rx);
            if (match) {
              if (!isNumber(firstIndex)) {
                firstIndex = a;
              }
              mm.push(match);
            }
          }
          if (mm[len]) {
            objmatches[k] = {
              matchedProperty: prop,
              indexes: [firstIndex],
              recourrences: flatten(mm)[len]
            };
          }
          continue;
        }

        // normalize value
        if (normalize) {
          val = _string2.default.normalize(val);
        }
        var match = val.match(rx);
        if (match) {
          // clone rx
          var rxClone = new RegExp(rx.source, "gi"),
              m,
              indexes = [];
          while (m = rxClone.exec(val)) {
            indexes.push(m.index);
          }
          totalMatches += match[len];
          objmatches[k] = {
            matchValue: val,
            matchedProperty: prop,
            indexes: indexes,
            recourrences: match[len]
          };
        }
      }

      if (objmatches[len]) {
        matches.push({
          obj: obj,
          matches: objmatches,
          totalMatches: totalMatches
        });
      }
    }
    var order = o.order.match(/asc|ascending/i) ? 1 : -1,
        lower = "toLowerCase",
        str = "toString",
        mat = "matches",
        matp = "matchedProperty",
        iof = "indexOf",
        hasp = "hasOwnProperty",
        rec = "recourrences",
        obj = "obj",
        ixs = "indexes",
        total = "totalMatches";
    //sort the entire collection of matches
    matches.sort(function (a, b) {

      // if one item has more matches than the other, it comes first
      if (a[total] > b[total]) return -order;
      if (a[total] < b[total]) return order;

      for (var k = 0, l = properties[len]; k < l; k++) {
        var am = a[mat][k],
            bm = b[mat][k];

        // if both objects lack matches in this property, continue
        if (!am && !bm) continue;

        // properties are in order of importance,
        // so if one object has matches in this property and the other does not,
        // it comes first by definition
        if (am && !bm) return -order;
        if (!am && bm) return order;

        // sort by indexes, applies the following rules only if one word started with the search
        var minA = _utils2.default.min(am[ixs]),
            minB = _utils2.default.min(bm[ixs]);
        if (minA < minB) return -order;
        if (minA > minB) return order;
        if (am[ixs][iof](minA) < bm[ixs][iof](minB)) return -order;
        if (am[ixs][iof](minA) > bm[ixs][iof](minB)) return order;

        var ao = a[obj],
            bo = b[obj];
        //check if objects have matched property because we are supporting search inside arrays and objects subproperties
        if (ao[hasp](am[matp]) && bo[hasp](bm[matp])) {
          //sort by alphabetical order
          if (ao[am[matp]][str]()[lower]() < bo[bm[matp]][str]()[lower]()) return -order;
          if (ao[am[matp]][str]()[lower]() > bo[bm[matp]][str]()[lower]()) return order;
        }

        //order by the number of recourrences
        if (am[rec] > bm[rec]) return -order;
        if (am[rec] < bm[rec]) return order;
      }
      return 0;
    });
    var limit = o.limit;
    if (limit) matches = matches.slice(0, _utils2.default.min(limit, matches[len]));
    return o.getResults(matches);
  }
};

},{"../../scripts/components/reflection":5,"../../scripts/components/regex":6,"../../scripts/components/string":7,"../../scripts/exceptions":20,"../../scripts/utils":34}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils.js");

var _utils2 = _interopRequireDefault(_utils);

var _exceptions = require("../../scripts/exceptions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Date utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function zeroFill(s, l) {
  if ("string" != typeof s) s = s.toString();
  while (s.length < l) {
    s = "0" + s;
  }return s;
};

// Freely inspired by .NET methods
// https://msdn.microsoft.com/en-us/library/8kb3ddd4%28v=vs.110%29.aspx
var parts = {
  year: {
    rx: /Y{1,4}/,
    fn: function fn(date, format) {
      var re = date.getFullYear().toString();
      while (re.length > format.length) {
        re = re.substr(1, re.length);
      }return re;
    }
  },
  month: {
    rx: /M{1,4}/,
    fn: function fn(date, format, fullFormat, regional) {
      var re = (date.getMonth() + 1).toString();
      switch (format.length) {
        case 1:
          return re;
        case 2:
          return zeroFill(re, 2);
        case 3:
          // short name
          re = date.getMonth();
          return regional.monthShort[re];
        case 4:
          // long name
          re = date.getMonth();
          return regional.month[re];
      }
    }
  },
  day: {
    rx: /D{1,4}/,
    fn: function fn(date, format, fullFormat, regional) {
      var re = date.getDate().toString();
      switch (format.length) {
        case 1:
          return re;
        case 2:
          return zeroFill(re.toString(), 2);
        case 3:
          //short name
          re = date.getDay();
          return regional.weekShort[re];
        case 4:
          //long name
          re = date.getDay();
          return regional.week[re];
      }
    }
  },
  hour: {
    rx: /h{1,2}/i,
    fn: function fn(date, format, fullformat) {
      var re = date.getHours(),
          ampm = /t{1,2}/i.test(fullformat);
      if (ampm && re > 12) re = re % 12;
      re = re.toString();
      while (re.length < format.length) {
        re = "0" + re;
      }return re;
    }
  },
  minute: {
    rx: /m{1,2}/,
    fn: function fn(date, format) {
      var re = date.getMinutes().toString();
      while (re.length < format.length) {
        re = "0" + re;
      }return re;
    }
  },
  second: {
    rx: /s{1,2}/,
    fn: function fn(date, format) {
      var re = date.getSeconds().toString();
      while (re.length < format.length) {
        re = "0" + re;
      }return re;
    }
  },
  millisecond: {
    rx: /f{1,4}/,
    fn: function fn(date, format) {
      var l = format.length;
      var re = date.getMilliseconds().toString();
      while (re.length < l) {
        re = "0" + re;
      }if (re.length > l) {
        return re.substr(0, l);
      }
      return re;
    }
  },
  hoursoffset: {
    rx: /z{1,3}/i,
    fn: function fn(date, format, fullformat) {
      var re = -(date.getTimezoneOffset() / 60),
          sign = re > 0 ? "+" : "";
      switch (format.length) {
        case 1:
          return sign + re;
        case 2:
          return sign + zeroFill(re, 2);
        case 3:
          //with minutes
          return sign + zeroFill(re, 2) + ":00";
      }
    }
  },
  ampm: {
    rx: /t{1,2}/i,
    fn: function fn(date, format) {
      var h = date.getHours(),
          capitals = /T{1,2}/.test(format),
          re;
      switch (format.length) {
        case 1:
          re = h > 12 ? "p" : "a";
          break;
        case 2:
          re = h > 12 ? "pm" : "am";
          break;
      }
      return capitals ? re.toUpperCase() : re;
    }
  },
  weekday: {
    rx: /w{1,2}/i,
    fn: function fn(date, format, fullFormat, regional) {
      var weekDay = date.getDay();
      var key = format.length > 1 ? "week" : "weekShort",
          reg = regional[key];
      if (reg && reg[weekDay] !== undefined) return reg[weekDay];
      return weekDay;
    }
  }
};

var isodaterx = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z?$|^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\sUTC)?$/;
var daterx = /^(\d{4})\D(\d{1,2})\D(\d{1,2})(?:\s(\d{1,2})(?:\D(\d{1,2}))?(?:\D(\d{1,2}))?)?$/;

exports.default = {

  /**
   * Returns a value indicating whether the given value looks like a date.
   */
  looksLikeDate: function looksLikeDate(s) {
    if (!s) return false;
    if (s instanceof Date) return true;
    if (typeof s != "string") return false;
    if (!!daterx.exec(s)) return true;
    if (!!isodaterx.exec(s)) return true;
    return false;
  },

  defaults: {
    "format": {
      "short": "DD.MM.YYYY",
      "long": "DD.MM.YYYY HH:mm:ss"
    },
    "week": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "weekShort": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "month": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "monthShort": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },

  /**
   * Parses a string representing a date into an instance of Date.
   *
   * @param {string} s: string to parse
   */
  parse: function parse(s) {
    if (!_utils2.default.isString(s)) {
      (0, _exceptions.TypeException)("s", "string");
    }
    var m = daterx.exec(s);
    if (m) {
      // The date is not in standard format.
      // this means that *some* browsers will make assumptions about the timezone of the date
      var hour = m[4];
      if (hour) {
        var a = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), parseInt(hour), parseInt(m[5] || 0), parseInt(m[6] || 0));
        return a;
      }
      return new Date(m[1], m[2] - 1, m[3]);
    }
    // does the date look like a date in ISO format?
    if (!!isodaterx.exec(s)) {
      // this is the ideal scenario: the server is returning dates in ISO format,
      // so they can be passed safely to Date constructor
      if (!/Z$/.test(s) && s.indexOf("UTC") == -1) s = s + "Z"; // NB: this fix is necessary to have dates that work in Firefox like in Chrome
      // We can do it, because the server is storing and returning dates in UTC
      // The Z suffix is going to be deprecated
      return new Date(s);
    }
    return;
  },


  /**
   * Returns a string representation of a date without time,
   * optionally using a given regional object.
   *
   * @param {date} d: date to format;
   * @param {object} [regional] - regional object
   */
  format: function format(date, _format, regional) {
    if (!_format) _format = this.defaults.format.short;
    if (!regional) regional = this.defaults;
    var re = _format;
    for (var x in parts) {
      var part = parts[x],
          m = _format.match(part.rx);
      if (!m) continue;
      re = re.replace(part.rx, part.fn(date, m[0], _format, regional));
    }
    return re;
  },


  /**
   * Returns a string representation of a date and time,
   * optionally using a given regional object.
   *
   * @param {date} d: date to format;
   * @param {object} [regional] - regional object
   */
  formatWithTime: function formatWithTime(d, regional) {
    return this.format(d, this.defaults.format.long, regional);
  },


  /**
   * Returns a value indicating whether the given argument is a valid date.
   *
   * @param {any} v: value to check.
   */
  isValid: function isValid(v) {
    return v instanceof Date && isFinite(v);
  },


  /**
   * Returns a value indicating whether two dates are in the same day.
   *
   * @param {date} a: date to check;
   * @param {date} b: date to check;
   */
  sameDay: function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  },


  /**
   * Returns a value indicating whether a date is today.
   *
   * @param {date} a: date to check;
   */
  isToday: function isToday(a) {
    return this.sameDay(a, new Date());
  },


  /**
   * Returns a value indicating whether a date has a time component.
   *
   * @param {date} a: date to check;
   */
  hasTime: function hasTime(a) {
    var hours = a.getHours(),
        minutes = a.getMinutes(),
        seconds = a.getSeconds();
    return !!(hours || minutes || seconds);
  },


  /**
   * Returns a standardized ISO 8601 formatted string.
   * 2011-06-29T16:52:48.000Z
   */
  toIso8601: function toIso8601(a) {
    return this.format(a, "YYYY-MM-DD") + "T" + this.format(a, "hh:mm:ss") + "." + this.format(a, "fff") + "Z";
  },


  /**
   * Returns a value representing a date in Excel-style.
   * Excel stores dates as sequential serial numbers so that they can be used in calculations. 
   * By default, January 1, 1900 is serial number 1, and January 1, 2008 is serial number 39448 because it is 39,447 days after January 1, 1900.
   */
  toExcelDateValue: function toExcelDateValue(v) {
    var a = 25569.0 + (v.getTime() - v.getTimezoneOffset() * 60 * 1000) / (1000 * 60 * 60 * 24);
    return a.toString().substr(0, 5);
  }
};

},{"../../scripts/exceptions":20,"../../scripts/utils.js":34}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * Events.
                                                                                                                                                                                                                                                                               * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                               * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Licensed under the MIT license:
                                                                                                                                                                                                                                                                               * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                               */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var array = [];
var push = array.push;
var slice = array.slice;
var splice = array.splice;

// Regular expression used to split event strings.
var eventSplitter = /\s+/;

var eventsApi = function eventsApi(obj, action, name, rest) {
  if (!name) return true;

  // Handle event maps.
  if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") {
    for (var key in name) {
      obj[action].apply(obj, [key, name[key]].concat(rest));
    }
    return false;
  }

  // Handle space separated event names.
  if (eventSplitter.test(name)) {
    var names = name.split(eventSplitter);
    for (var i = 0, l = names.length; i < l; i++) {
      obj[action].apply(obj, [names[i]].concat(rest));
    }
    return false;
  }

  return true;
};

var triggerEvents = function triggerEvents(events, args) {
  var ev,
      i = -1,
      l = events.length,
      a1 = args[0],
      a2 = args[1],
      a3 = args[2];
  switch (args.length) {
    case 0:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx);
      }return;
    case 1:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1);
      }return;
    case 2:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2);
      }return;
    case 3:
      while (++i < l) {
        (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
      }return;
    default:
      while (++i < l) {
        (ev = events[i]).callback.apply(ev.ctx, args);
      }}
};

//
// Base class for events emitters
//

var EventsEmitter = function () {
  function EventsEmitter() {
    _classCallCheck(this, EventsEmitter);
  }

  _createClass(EventsEmitter, [{
    key: "on",


    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    value: function on(name, callback, context) {
      if (!eventsApi(this, "on", name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({ callback: callback, context: context, ctx: context || this });
      return this;
    }

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.

  }, {
    key: "once",
    value: function once(name, callback, context) {
      if (!eventsApi(this, "once", name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _utils2.default.once(function () {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    }

    // Remove one or many callbacks.

  }, {
    key: "off",
    value: function off(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, "off", name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _utils2.default.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if (callback && callback !== ev.callback && callback !== ev.callback._callback || context && context !== ev.context) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    }

    // Trigger one or many events, firing all bound callbacks.

  }, {
    key: "trigger",
    value: function trigger(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, "trigger", name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    }

    // Trigger one or many events, firing all bound callbacks.

  }, {
    key: "emit",
    value: function emit(name) {
      return this.trigger(name);
    }

    // Tell this object to stop listening to either specific events, or
    // to every object it's currently listening to.

  }, {
    key: "stopListening",
    value: function stopListening(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return this;
      var deleteListener = !name && !callback;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      if (obj) (listeners = {})[obj._listenerId] = obj;
      for (var id in listeners) {
        listeners[id].off(name, callback, this);
        if (deleteListener) delete this._listeners[id];
      }
      return this;
    }
  }, {
    key: "listenTo",
    value: function listenTo(obj, name, callback) {
      // support calling the method with an object as second parameter
      if (arguments.length == 2 && (typeof name === "undefined" ? "undefined" : _typeof(name)) == "object") {
        var x;
        for (x in name) {
          this.listenTo(obj, x, name[x]);
        }
        return this;
      }

      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _utils2.default.uniqueId("l"));
      listeners[id] = obj;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      obj.on(name, callback, this);
      return this;
    }
  }, {
    key: "listenToOnce",
    value: function listenToOnce(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _utils2.default.uniqueId("l"));
      listeners[id] = obj;
      if ((typeof name === "undefined" ? "undefined" : _typeof(name)) === "object") callback = this;
      obj.once(name, callback, this);
      return this;
    }
  }]);

  return EventsEmitter;
}();

exports.default = EventsEmitter;
;

},{"../../scripts/utils":34}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Number utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

exports.default = {
  format: function format(v, options) {
    if (!options) options = {};
    //return v.toString();
    //
    // TODO: if available, use the Intl.NumberFormat class!!
    // if not, ask for a Polyfill! But in console.info.
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
    if (typeof Intl !== "undefined") {
      return Intl.NumberFormat(options.locale || "en-GB").format(v);
    }
    return (v || "").toString();
    //
    // console.log(new Intl.NumberFormat('pl', { minimumFractionDigits: 2 }).format(123123.000));
  }
};

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  // gets value or values of a given object, from a name or namespace (example: "dog.name")
  getPropertyValue: function getPropertyValue(o, name) {
    var a = name.split("."),
        x = o,
        p;
    while (p = a.shift()) {
      if (_utils2.default.has(x, p)) {
        x = x[p];
      }
      if (_utils2.default.isArray(x)) {
        break;
      }
    }
    if (_utils2.default.isArray(x)) {
      if (!a.length) {
        return x;
      }
      return this.getCollectionPropertiesValue(x, a.join("."));
    }
    return x;
  },


  // gets properties values from a given collection
  getCollectionPropertiesValue: function getCollectionPropertiesValue(collection, name, includeEmptyValues) {
    if (!name) {
      return collection;
    }
    if (typeof includeEmptyValues != "boolean") {
      includeEmptyValues = false;
    }
    var a = name.split("."),
        values = [];
    for (var i = 0, l = collection.length; i < l; i++) {
      var o = collection[i];

      if (!_utils2.default.has(o, a[0])) {
        if (includeEmptyValues) {
          values.push(null);
        }
        continue;
      }
      if (_utils2.default.isArray(o)) {
        var foundColl = this.getCollectionPropertiesValue(o, name);
        if (includeEmptyValues || foundColl.length) {
          values.push(foundColl);
        }
      } else if (_utils2.default.isPlainObject(o)) {
        var foundVal = this.getPropertyValue(o, name);
        if (includeEmptyValues || this.validateValue(foundVal)) {
          values.push(foundVal);
        }
      } else {
        if (includeEmptyValues || this.validateValue(o)) {
          values.push(o);
        }
      }
    }
    return values;
  },


  // returns true if the object has a significant value, false otherwise
  validateValue: function validateValue(o) {
    if (!o) return false;
    if (_utils2.default.isArray(o)) {
      return !!o.length;
    }
    return true;
  }
}; /**
    * Reflection utilities.
    * https://github.com/RobertoPrevato/KingTable
    *
    * Copyright 2017, Roberto Prevato
    * https://robertoprevato.github.io
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */

},{"../../scripts/utils":34}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils.js");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

  /**
   * Gets a search pattern from a list of strings.
   */
  getPatternFromStrings: function getPatternFromStrings(a) {
    var _this = this;

    if (!a || !a.length) throw new Error("invalid parameter");
    var s = _utils2.default.map(a, function (x) {
      return _this.escapeCharsForRegex(x);
    }).join("|");
    return new RegExp("(" + s + ")", "mgi");
  },


  /**
   * Prepares a string to use it to declare a regular expression.
   */
  escapeCharsForRegex: function escapeCharsForRegex(s) {
    if (typeof s != "string") {
      return "";
    }
    //characters to escape in regular expressions
    return s.replace(/([\^\$\.\(\)\[\]\?\!\*\+\{\}\|\/\\])/g, "\\$1").replace(/\s/g, "\\s");
  },


  /**
   * Gets a regular expression for a search pattern,
   * returns undefined if the regular expression is not valid.
   */
  getSearchPattern: function getSearchPattern(s, options) {
    if (!s) return (/.+/mgi
    );
    options = _utils2.default.extend({ searchMode: "fullstring" }, options || {});
    switch (options.searchMode.toLowerCase()) {
      case "splitwords":
        throw new Error("Not implemented");

      case "fullstring":
        //escape characters
        s = this.escapeCharsForRegex(s);
        try {
          return new RegExp("(" + s + ")", "mgi");
        } catch (ex) {
          //this should not happen
          return;
        }
        break;
      default:
        throw "invalid searchMode";
    }
  },


  /**
   * Gets a regular expression for a search match pattern.
   */
  getMatchPattern: function getMatchPattern(s) {
    if (!s) {
      return (/.+/mg
      );
    }
    s = this.escapeCharsForRegex(s);
    return new RegExp(s, "i");
  }
}; /**
    * Regex utilities.
    * https://github.com/RobertoPrevato/KingTable
    *
    * Copyright 2017, Roberto Prevato
    * https://robertoprevato.github.io
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */

},{"../../scripts/utils.js":34}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _exceptions = require("../../scripts/exceptions");

var _utils = require("../../scripts/utils.js");

var _utils2 = _interopRequireDefault(_utils);

var _string = require("../../scripts/components/string.normalize");

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * String utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var REP = "replace";
var INVALID_FILLER = "invalid filler (must be as single character)";
var LENGTH_MUST_POSITIVE = "length must be > 0";

var isString = _utils2.default.isString;

function toLower(s) {
  return s.toLowerCase();
}

function toUpper(s) {
  return s.toUpperCase();
}

exports.default = {

  normalize: _string2.default,

  replaceAt: function replaceAt(s, index, replacement) {
    if (!s) return s;
    return s.substr(0, index) + replacement + s.substr(index + replacement.length);
  },
  findDiacritics: function findDiacritics(s) {
    if (!s) return s;

    var rx = /[\u0300-\u036F]|[\u1AB0–\u1AFF]/gm;
    var a = [],
        m;
    while (m = rx.exec(s)) {
      a.push({
        i: m.index,
        v: m[0]
      });
    }
    return a;
  },


  /**
   * Restore diacritics in normalized strings.
   */
  restoreDiacritics: function restoreDiacritics(s, diacritics, offset) {
    if (!s) return s;
    var l = diacritics.length;
    if (!l) return s;
    if (offset === undefined) offset = 0;
    var endIndex = offset + s.length - 1; // NB: we only restore diacritics that appears in the string portion
    var d;
    for (var i = 0; i < l; i++) {
      d = diacritics[i];
      if (d.i > endIndex) break;
      s = this.replaceAt(s, d.i - offset, d.v);
    }
    return s;
  },


  /**
   * Returns a new string in snake_case, from the given string.
   */
  snakeCase: function snakeCase(s) {
    if (!s) return s;
    return this.removeMultipleSpaces(s.trim())[REP](/[^a-zA-Z0-9]/g, "_")[REP](/([a-z])[\s\-]?([A-Z])/g, function (a, b, c) {
      return b + "_" + toLower(c);
    })[REP](/([A-Z]+)/g, function (a, b) {
      return toLower(b);
    })[REP](/_{2,}/g, "_");
  },


  /**
   * Returns a new string in kebab-case, from the given string.
   */
  kebabCase: function kebabCase(s) {
    if (!s) return "";
    return this.removeMultipleSpaces(s.trim())[REP](/[^a-zA-Z0-9]/g, "-")[REP](/([a-z])[\s\-]?([A-Z])/g, function (a, b, c) {
      return b + "-" + toLower(c);
    })[REP](/([A-Z]+)/g, function (a, b) {
      return toLower(b);
    })[REP](/-{2,}/g, "-");
  },


  /**
   * Returns a new string in camelCase, from the given string.
   */
  camelCase: function camelCase(s) {
    if (!s) return s;
    return this.removeMultipleSpaces(s.trim())[REP](/[^a-zA-Z0-9]+([a-zA-Z])?/g, function (a, b) {
      return toUpper(b);
    })[REP](/([a-z])[\s\-]?([A-Z])/g, function (a, b, c) {
      return b + toUpper(c);
    })[REP](/^([A-Z]+)/g, function (a, b) {
      return toLower(b);
    });
  },
  format: function format(s) {
    var args = Array.prototype.slice.call(arguments, 1);
    return s[REP](/{(\d+)}/g, function (match, i) {
      return typeof args[i] != "undefined" ? args[i] : match;
    });
  },


  /**
   * Returns a string from the given value, in any case.
   */
  getString: function getString(val) {
    if (typeof val == "string") return val;
    if (val.toString) return val.toString();
    return "";
  },


  /**
   * A string compare function that supports sorting of special characters.
   *
   * @param a the first string to compare
   * @param b the second string to compare
   * @param order ascending or descending
   * @param options (caseSensitive; characters option)
   * @returns {*}
   */
  compare: function compare(a, b, order, options) {
    order = _utils2.default.isNumber(order) ? order : /^asc/i.test(order) ? 1 : -1;
    var o = _utils2.default.extend({
      ci: true // case insensitive
    }, options);
    if (a && !b) return order;
    if (!a && b) return -order;
    if (!a && !b) return 0;
    if (a == b) return 0;
    if (!_utils2.default.isString(a)) a = a.toString();
    if (!_utils2.default.isString(b)) b = b.toString();
    if (o.ci) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return (0, _string2.default)(a) < (0, _string2.default)(b) ? -order : order;
  },
  ofLength: function ofLength(c, l) {
    return new Array(l + 1).join(c);
  },


  /**
   * Python-like center function: returns a new string of the given length, centering the given string.
   *
   * @param s: string to center
   * @param length: output string length
   * @param filler: filler character
   * @returns {String}
   */
  center: function center(s, length, filler) {
    if (length <= 0) throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s) return this.ofLength(filler, length);
    if (filler.length != 1) throw new Error(INVALID_FILLER);
    var halfLength = Math.floor((length - s.length) / 2);
    var startHalf = this.ofLength(filler, halfLength);
    var left = false;
    var output = startHalf + s + startHalf;
    while (output.length < length) {
      if (left) {
        output = fillter + output;
      } else {
        output = output + filler;
      }
      left = !left;
    }
    return output;
  },


  /**
   * Returns a value indicating whether the given string starts with the second
   * given string.
   *
   * @param {string} String to check
   * @param {string} Start value
   * @param {boolean} Case insensitive?
   */
  startsWith: function startsWith(a, b, ci) {
    if (!a || !b) return false;
    if (ci) {
      return a.toLowerCase().indexOf(b) == 0;
    }
    return a.indexOf(b) == 0;
  },


  /**
   * Returns a new string of the given length, right filled with the given
   * filler character.
   */
  ljust: function ljust(s, length, filler) {
    if (length <= 0) throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s) return this.ofLength(filler, length);
    if (filler.length != 1) throw new Error(INVALID_FILLER);
    while (s.length < length) {
      s = s + filler;
    }return s;
  },


  /**
   * Returns a new string of the given length, left filled with the given
   * filler character.
   */
  rjust: function rjust(s, length, filler) {
    if (length <= 0) throw new Error(LENGTH_MUST_POSITIVE);
    if (!filler) filler = " ";
    if (!s) return this.ofLength(filler, length);
    if (filler.length != 1) throw new Error(INVALID_FILLER);
    while (s.length < length) {
      s = filler + s;
    }return s;
  },
  removeMultipleSpaces: function removeMultipleSpaces(s) {
    return s[REP](/\s{2,}/g, " ");
  },
  removeLeadingSpaces: function removeLeadingSpaces(s) {
    return s[REP](/^\s+|\s+$/, "");
  },


  /**
   * Fixes the width of all lines inside the given text, using the given filler.
   *
   * @param {string} s - text of which lines should be normalized
   * @param {string} [filler= ] - filler to use
   */
  fixWidth: function fixWidth(s, filler) {
    if (!s) return s;
    if (!filler) filler = " ";
    var lines, wasString;
    if (_utils2.default.isString(s)) {
      lines = s.split(/\n/g);
      wasString = true;
    } else if (_utils2.default.isArray(s)) {
      lines = _utils2.default.clone(s);
      wasString = false;
    } else {
      (0, _exceptions.ArgumentException)("s", "expected string or string[]");
    }
    var line,
        l = lines.length,
        a = [];
    // obtain the lines max length
    var maxLength = _utils2.default.max(lines, function (x) {
      return x.length;
    });
    for (var i = 0; i < l; i++) {
      line = lines[i];
      while (line.length < maxLength) {
        line += filler;
      }
      lines[i] = line;
    }
    return wasString ? lines.join("\n") : lines;
  },
  repeat: function repeat(s, l) {
    return new Array(l + 1).join(s);
  },


  /**
   * Returns the width of all lines inside the given string.
   */
  linesWidths: function linesWidths(s) {
    if (!s) return 0;
    var lines;
    if (_utils2.default.isString(s)) {
      lines = s.split(/\n/g);
    } else if (_utils2.default.isArray(s)) {
      lines = _utils2.default.clone(s);
    } else {
      (0, _exceptions.ArgumentException)("s", "expected string or string[]");
    }
    return _utils2.default.map(lines, function (x) {
      return x.length;
    });
  }
};

},{"../../scripts/components/string.normalize":8,"../../scripts/exceptions":20,"../../scripts/utils.js":34}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

// 
// Note from Roberto Prevato: the original code was obtained here:
// http://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
// 
// it has been rewritten in ES6 and readapted for use (no alert).
//

var defaultDiacriticsRemovalMap = [{ "base": "A", "letters": "A\u24B6\uFF21\xC0\xC1\xC2\u1EA6\u1EA4\u1EAA\u1EA8\xC3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\xC4\u01DE\u1EA2\xC5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F" }, { "base": "AA", "letters": "\uA732" }, { "base": "AE", "letters": "\xC6\u01FC\u01E2" }, { "base": "AO", "letters": "\uA734" }, { "base": "AU", "letters": "\uA736" }, { "base": "AV", "letters": "\uA738\uA73A" }, { "base": "AY", "letters": "\uA73C" }, { "base": "B", "letters": "B\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181" }, { "base": "C", "letters": "C\u24B8\uFF23\u0106\u0108\u010A\u010C\xC7\u1E08\u0187\u023B\uA73E" }, { "base": "D", "letters": "D\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\xD0" }, { "base": "DZ", "letters": "\u01F1\u01C4" }, { "base": "Dz", "letters": "\u01F2\u01C5" }, { "base": "E", "letters": "E\u24BA\uFF25\xC8\xC9\xCA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\xCB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E" }, { "base": "F", "letters": "F\u24BB\uFF26\u1E1E\u0191\uA77B" }, { "base": "G", "letters": "G\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E" }, { "base": "H", "letters": "H\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D" }, { "base": "I", "letters": "I\u24BE\uFF29\xCC\xCD\xCE\u0128\u012A\u012C\u0130\xCF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197" }, { "base": "J", "letters": "J\u24BF\uFF2A\u0134\u0248" }, { "base": "K", "letters": "K\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2" }, { "base": "L", "letters": "L\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780" }, { "base": "LJ", "letters": "\u01C7" }, { "base": "Lj", "letters": "\u01C8" }, { "base": "M", "letters": "M\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C" }, { "base": "N", "letters": "N\u24C3\uFF2E\u01F8\u0143\xD1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4" }, { "base": "NJ", "letters": "\u01CA" }, { "base": "Nj", "letters": "\u01CB" }, { "base": "O", "letters": "O\u24C4\uFF2F\xD2\xD3\xD4\u1ED2\u1ED0\u1ED6\u1ED4\xD5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\xD6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\xD8\u01FE\u0186\u019F\uA74A\uA74C" }, { "base": "OI", "letters": "\u01A2" }, { "base": "OO", "letters": "\uA74E" }, { "base": "OU", "letters": "\u0222" }, { "base": "OE", "letters": "\x8C\u0152" }, { "base": "oe", "letters": "\x9C\u0153" }, { "base": "P", "letters": "P\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754" }, { "base": "Q", "letters": "Q\u24C6\uFF31\uA756\uA758\u024A" }, { "base": "R", "letters": "R\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782" }, { "base": "S", "letters": "S\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784" }, { "base": "T", "letters": "T\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786" }, { "base": "TZ", "letters": "\uA728" }, { "base": "U", "letters": "U\u24CA\uFF35\xD9\xDA\xDB\u0168\u1E78\u016A\u1E7A\u016C\xDC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244" }, { "base": "V", "letters": "V\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245" }, { "base": "VY", "letters": "\uA760" }, { "base": "W", "letters": "W\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72" }, { "base": "X", "letters": "X\u24CD\uFF38\u1E8A\u1E8C" }, { "base": "Y", "letters": "Y\u24CE\uFF39\u1EF2\xDD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE" }, { "base": "Z", "letters": "Z\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762" }, { "base": "a", "letters": "a\u24D0\uFF41\u1E9A\xE0\xE1\xE2\u1EA7\u1EA5\u1EAB\u1EA9\xE3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\xE4\u01DF\u1EA3\xE5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250" }, { "base": "aa", "letters": "\uA733" }, { "base": "ae", "letters": "\xE6\u01FD\u01E3" }, { "base": "ao", "letters": "\uA735" }, { "base": "au", "letters": "\uA737" }, { "base": "av", "letters": "\uA739\uA73B" }, { "base": "ay", "letters": "\uA73D" }, { "base": "b", "letters": "b\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253" }, { "base": "c", "letters": "c\u24D2\uFF43\u0107\u0109\u010B\u010D\xE7\u1E09\u0188\u023C\uA73F\u2184" }, { "base": "d", "letters": "d\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A" }, { "base": "dz", "letters": "\u01F3\u01C6" }, { "base": "e", "letters": "e\u24D4\uFF45\xE8\xE9\xEA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\xEB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD" }, { "base": "f", "letters": "f\u24D5\uFF46\u1E1F\u0192\uA77C" }, { "base": "g", "letters": "g\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F" }, { "base": "h", "letters": "h\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265" }, { "base": "hv", "letters": "\u0195" }, { "base": "i", "letters": "i\u24D8\uFF49\xEC\xED\xEE\u0129\u012B\u012D\xEF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131" }, { "base": "j", "letters": "j\u24D9\uFF4A\u0135\u01F0\u0249" }, { "base": "k", "letters": "k\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3" }, { "base": "l", "letters": "l\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747" }, { "base": "lj", "letters": "\u01C9" }, { "base": "m", "letters": "m\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F" }, { "base": "n", "letters": "n\u24DD\uFF4E\u01F9\u0144\xF1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5" }, { "base": "nj", "letters": "\u01CC" }, { "base": "o", "letters": "o\u24DE\uFF4F\xF2\xF3\xF4\u1ED3\u1ED1\u1ED7\u1ED5\xF5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\xF6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\xF8\u01FF\u0254\uA74B\uA74D\u0275" }, { "base": "oi", "letters": "\u01A3" }, { "base": "ou", "letters": "\u0223" }, { "base": "oo", "letters": "\uA74F" }, { "base": "p", "letters": "p\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755" }, { "base": "q", "letters": "q\u24E0\uFF51\u024B\uA757\uA759" }, { "base": "r", "letters": "r\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783" }, { "base": "s", "letters": "s\u24E2\uFF53\xDF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B" }, { "base": "t", "letters": "t\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787" }, { "base": "tz", "letters": "\uA729" }, { "base": "u", "letters": "u\u24E4\uFF55\xF9\xFA\xFB\u0169\u1E79\u016B\u1E7B\u016D\xFC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289" }, { "base": "v", "letters": "v\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C" }, { "base": "vy", "letters": "\uA761" }, { "base": "w", "letters": "w\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73" }, { "base": "x", "letters": "x\u24E7\uFF58\u1E8B\u1E8D" }, { "base": "y", "letters": "y\u24E8\uFF59\u1EF3\xFD\u0177\u1EF9\u0233\u1E8F\xFF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF" }, { "base": "z", "letters": "z\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763" }];

var diacriticsMap = {};
for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
  var letters = defaultDiacriticsRemovalMap[i].letters;
  for (var j = 0; j < letters.length; j++) {
    diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
  }
}

function removeDiacritics(str) {
  return str.replace(/[^\u0000-\u007E]/g, function (a) {
    return diacriticsMap[a] || a;
  });
}

exports.default = removeDiacritics;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _json = require("../../scripts/data/json");

var _json2 = _interopRequireDefault(_json);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Vanilla AJAX helper using Promise.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var FORM_DATA = "application/x-www-form-urlencoded; charset=UTF-8";
var JSON_MIME = "application/json";
var CONTENT_TYPE = "Content-Type";

var defaults = {
  type: "POST",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": JSON_MIME // deleted for GET requests, as values are placed in query string
  },
  json: {
    parseDates: true
  }
};

function sanitizeContentType(contentType) {
  // just to be sure... since in many cases standard JSON mime type is not used
  if (contentType.indexOf("json") > -1 && contentType != JSON_MIME) {
    return JSON_MIME;
  }
  return contentType;
}

exports.default = {

  defaults: defaults,

  /**
   * Extensibility point.
   * Allows to define global logic before sending any request.
   */
  requestBeforeSend: function requestBeforeSend(xhr, options, originalOptions) {},


  /**
   * Extensibility point.
   * Allows to override global defaults for AJAX requests.
   */
  setup: function setup(o) {
    if (!_utils2.default.isPlainObject(o)) throw new Error("Invalid options for AJAX setup.");
    _utils2.default.extend(this.defaults, o);
    return this;
  },


  converters: {
    "application/json": function applicationJson(response, req, options) {
      return _json2.default.parse(response, options.json);
    }
  },

  /**
   * Creates a query string
   * 
   * @param {object} data: data to represent in query string.
   */
  createQs: function createQs(data) {
    if (!data) return "";

    var x,
        qs = [],
        v;
    for (x in data) {
      v = data[x];
      if (!_utils2.default.isNullOrEmptyString(v)) {
        qs.push([x, v]);
      }
    }
    // sort by name
    qs.sort(function (a, b) {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    });
    // return mapped string
    return _utils2.default.map(qs, function (o) {
      return encodeURIComponent(o[0]) + "=" + encodeURIComponent(o[1]);
    }).join("&");
  },
  shot: function shot(options) {
    if (!options) options = {};
    if (options.headers) {
      var extraHeaders = options.headers;
    }
    var o = _utils2.default.extend({}, _utils2.default.clone(this.defaults), options);
    if (options.headers) {
      // keep default headers, even if the user is adding more
      o.headers = _utils2.default.extend({}, this.defaults.headers, options.headers);
    }
    var url = o.url;
    if (!url) throw new Error("missing `url` for XMLHttpRequest");

    var self = this,
        converters = self.converters;

    var method = o.type;
    if (!method) throw new Error("missing `type` for XMLHttpRequest");

    // if the request if of GET method and there is data to send,
    // convert automatically data to query string and append it to url
    var isGet = method == "GET",
        inputData = o.data;
    if (isGet && inputData) {
      var qs = this.createQs(inputData);
      var hasQueryString = url.indexOf("?") != -1;
      url += (hasQueryString ? "&" : "?") + qs;
      delete o.headers[CONTENT_TYPE]; // since data is placed in query string
    }

    // Return a new promise.
    return new Promise(function (resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open(method, url);

      var headers = o.headers;
      if (headers) {
        var x;
        for (x in headers) {
          req.setRequestHeader(x, headers[x]);
        }
      }

      req.onload = function () {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          // parse automatically the response
          var data = req.response;

          // NB: if the server does not return a content-type header, this function does no conversion
          // this function is kept intentionally simple and does not do content-type sniffing whatsoever
          var contentType = sanitizeContentType(req.getResponseHeader(CONTENT_TYPE) || "");

          var converter = converters[contentType];
          if (_utils2.default.isFunction(converter)) {
            data = converter(data, req, o);
          }
          resolve(data, req.status, req);
        } else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };

      // Handle network errors
      req.onerror = function () {
        reject(req, null, Error("Network Error"));
      };

      var data = o.data;
      if (data && !isGet) {
        var contentType = o.headers[CONTENT_TYPE];
        // does data require to be serialized in JSON?
        if (contentType.indexOf("/json") > -1) {
          data = _json2.default.compose(data);
        } else if (contentType == FORM_DATA) {
          // TODO: support x-www-form-urlencoded POST data
          throw "Not implemented";
        } else {
          throw "invalid or not implemented content type: " + contentType;
        }
        self.requestBeforeSend(req, o, options);
        req.send(data);
      } else {
        // Make the request
        self.requestBeforeSend(req, o, options);
        req.send();
      }
    });
  },
  get: function get(url, options) {
    options = options || {};
    options.url = url;
    options.type = "GET";
    return this.shot(options);
  },
  post: function post(url, options) {
    options = options || {};
    options.url = url;
    options.type = "POST";
    return this.shot(options);
  }
};

},{"../../scripts/data/json":13,"../../scripts/utils":34}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeHandling = {
  allStrings: 1, // all values are treated as allStrings
  keepType: 2 // types are kept
}; /**
    * Csv format functions.
    * https://github.com/RobertoPrevato/KingTable
    *
    * Copyright 2017, Roberto Prevato
    * https://robertoprevato.github.io
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */
exports.default = {

  default: {
    /**
     * Whether to add BOM
     */
    addBom: true,
    /**
     * Separator to use
     */
    separator: ",",
    /**
     * Whether to add a separator line at the beginning of the file, or not.
     * (May be useful for excel)
     */
    addSeparatorLine: false,
    /**
     * How the types should be handled: allStrings to manage all properties as strings (all will be quoted)
     */
    typeHandling: TypeHandling.keepType
  },

  /**
   * Serializes the given collection in csv format.
   * Assumes that the collection is optimized (the first row contains properties, the other only values)
   * 
   * @param data collection
   * @param options
   */
  serialize: function serialize(data, options) {
    var o = _utils2.default.extend({}, this.default, options);

    var re = [],
        push = "push",
        toString = "toString",
        len = "length",
        rep = "replace",
        test = "test",
        sep = o.separator,
        dobquote = "\"",
        typeHandling = o.typeHandling,
        mark = o.addBom ? "\uFEFF" : "";
    //if (o.addSeparatorLine) {
    //  re[push]("sep=" + sep);
    //}
    for (var i = 0, l = data[len]; i < l; i++) {
      var a = [],
          row = data[i];
      //assume that the first row contains the columns
      for (var k = 0, j = row[len]; k < j; k++) {
        var v = row[k];
        if (v instanceof Date) {
          // TODO: use date utilities.
          // if the value has time, include time; otherwise use only date
          v = v.toLocaleString();
        } else {
          if (typeof v != "string") {
            v = v && v[toString] ? v[toString]() : "";
          }
        }
        //escape quotes - RFC-4180, paragraph "If double-quotes are used to enclose fields, then a double-quote
        //appearing inside a field must be escaped by preceding it with another double quote."
        if (/"/[test](v)) v = v[rep](/"/g, "\"\"");
        //https://en.wikipedia.org/wiki/Comma-separated_values
        //Fields with embedded commas or double-quote characters must be quoted. (by standard, so even if CsvTypeHandling is different than "AllStrings")
        //1997, Ford, E350, "Super, ""luxurious"" truck"
        //1997, Ford, E350, "Super, luxurious truck"
        if (typeHandling == TypeHandling.allStrings || /"|\n/[test](v) || v.indexOf(sep) > -1) v = dobquote + v + dobquote;
        a[push](v);
      }
      re[push](a.join(sep));
    }
    // the only way to make MS Excel work with UTF-8 and specific separator,
    // is to put at the end a tab + separator; and a BOM mark at the beginning
    if (o.addSeparatorLine) {
      re[push]("\t" + sep);
    }
    return mark + re.join("\n");
  }
};

},{"../../scripts/utils":34}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * File utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

exports.default = {
  /**
   * Returns a value indicating whether the client side export is supported
   * by the client, or not.
   */
  supportsCsExport: function supportsCsExport() {
    return navigator.msSaveBlob || function () {
      var link = document.createElement("a");
      return link.download !== undefined;
    }();
  },

  /**
   * Exports a file; prompting the user for download.
   * 
   * @param filename
   * @param lines
   */
  exportfile: function exportfile(filename, text, type) {
    var setAttribute = "setAttribute",
        msSaveBlob = "msSaveBlob";
    var blob = new Blob([text], { type: type });
    if (navigator[msSaveBlob]) {
      // IE 10+
      navigator[msSaveBlob](blob, filename);
    } else {
      var link = document.createElement("a");
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob);
        link[setAttribute]("href", url);
        link[setAttribute]("download", filename);
        var style = {
          visibility: "hidden",
          position: "absolute",
          left: "-9999px"
        };
        for (var x in style) {
          link.style[x] = style[x];
        } //inject
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
};

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * XML and HTML utilities to build HTML strings.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

function isNum(x) {
  return typeof x == "number";
}

/**
 * A virtual XML element.
 */

var VXmlElement = function () {
  function VXmlElement(tagName, attributes, children) {
    _classCallCheck(this, VXmlElement);

    this.tagName = tagName;
    this.attributes = attributes || {};
    if (children && children instanceof Array == false) {
      // NB: children can be anything implementing a toString method (duck typing)
      children = [children];
    }
    this.children = children || [];
    this.hidden = false;
    this.empty = false;
  }

  _createClass(VXmlElement, [{
    key: "appendChild",
    value: function appendChild(child) {
      this.children.push(child);
    }

    /**
     * Converts this VXmlElement into an XML fragment.
     */

  }, {
    key: "toString",
    value: function toString(indent, indentChar, level) {
      var self = this,
          empty = self.empty,
          tagName = self.tagName,
          attrs = self.attributes,
          indent = isNum(indent) ? indent : 0,
          level = isNum(level) ? level : 0,
          indentString = indent > 0 ? new Array(indent * level + 1).join(indentChar || " ") : "",
          s = "<" + tagName,
          x;
      for (x in attrs) {
        if (attrs[x] !== undefined) {
          if (BOOLEAN_PROPERTIES.indexOf(x) > -1) {
            s += " " + x;
          } else {
            s += " " + x + "=\"" + attrs[x] + "\"";
          }
        }
      }
      if (empty) {
        s += " />";
        if (indent > 0) {
          // add the indent at the beginning of the string
          s = indentString + s + "\n";
        }
        return s;
      }
      s += ">";
      var children = self.children;
      if (indent > 0 && children.length) {
        s += "\n";
      }
      for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        if (!child) continue;
        // support HTML fragments
        if (typeof child == "string") {
          s += indentString + child + "\n";
        } else {
          if (!child.hidden) {
            s += child.toString(indent, indentChar, level + 1);
          }
        }
      }
      if (children && children.length) {
        s += indentString + ("</" + tagName + ">");
      } else {
        s += "</" + tagName + ">";
      }
      if (indent > 0) {
        // add the indent at the beginning of the string
        s = indentString + s + "\n";
      }
      return s;
    }
  }, {
    key: "tagName",
    get: function get() {
      return this._tagName;
    },
    set: function set(val) {
      if (typeof val != "string") throw new Error("tagName must be a string");
      if (!val.trim()) throw new Error("tagName must have a length");
      if (val.indexOf(" ") > -1) throw new Error("tagName cannot contain spaces");
      this._tagName = val;
    }
  }]);

  return VXmlElement;
}();

var EMPTY_ELEMENTS = "area base basefont br col frame hr img input isindex link meta param".split(" ");
var BOOLEAN_PROPERTIES = "checked selected disabled readonly multiple ismap isMap defer noresize noResize nowrap noWrap noshade noShade compact".split(" ");

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/**
 * A virtual HTML element.
 */

var VHtmlElement = function (_VXmlElement) {
  _inherits(VHtmlElement, _VXmlElement);

  function VHtmlElement(tagName, attributes, children) {
    _classCallCheck(this, VHtmlElement);

    var _this = _possibleConstructorReturn(this, (VHtmlElement.__proto__ || Object.getPrototypeOf(VHtmlElement)).call(this, tagName, attributes, children));

    _this.empty = EMPTY_ELEMENTS.indexOf(tagName.toLowerCase()) > -1;
    return _this;
  }

  _createClass(VHtmlElement, [{
    key: "id",
    get: function get() {
      return this.attributes.id;
    },
    set: function set(val) {
      this.attributes.id = val;
    }
  }]);

  return VHtmlElement;
}(VXmlElement);

/**
 * A virtual text element.
 */


var VTextElement = function () {
  function VTextElement(text) {
    _classCallCheck(this, VTextElement);

    this.text = text;
  }

  _createClass(VTextElement, [{
    key: "toString",
    value: function toString(indent, indentChar, level) {
      var indent = isNum(indent) ? indent : 0,
          level = isNum(level) ? level : 0,
          indentString = indent > 0 ? new Array(indent * level + 1).join(indentChar || " ") : "";
      return indentString + this.text + (indentString ? "\n" : "");
    }
  }, {
    key: "text",
    get: function get() {
      return this._text;
    },
    set: function set(val) {
      // escape characters that need to be escaped
      if (!val) val = "";
      if (typeof val != "string") val = val.toString();
      this._text = escapeHtml(val);
    }
  }]);

  return VTextElement;
}();

/**
 * A piece of HTML fragment that should be rendered without escaping.
 */


var VHtmlFragment = function () {
  function VHtmlFragment(html) {
    _classCallCheck(this, VHtmlFragment);

    this.html = html;
  }

  _createClass(VHtmlFragment, [{
    key: "toString",
    value: function toString(indent, indentChar, level) {
      var indent = isNum(indent) ? indent : 0,
          level = isNum(level) ? level : 0,
          indentString = indent > 0 ? new Array(indent * level + 1).join(indentChar || " ") : "";
      return indentString + this.html + (indentString ? "\n" : "");
    }
  }]);

  return VHtmlFragment;
}();

/**
 * A virtual comment element.
 */


var VCommentElement = function () {
  function VCommentElement(text) {
    _classCallCheck(this, VCommentElement);

    this.text = text;
  }

  _createClass(VCommentElement, [{
    key: "toString",
    value: function toString(indent, indentChar, level) {
      var indent = isNum(indent) ? indent : 0,
          level = isNum(level) ? level : 0,
          indentString = indent > 0 ? new Array(indent * level + 1).join(indentChar || " ") : "";
      return indentString + "<!--" + this.text + "-->" + (indentString ? "\n" : "");
    }
  }, {
    key: "text",
    get: function get() {
      return this._text;
    },
    set: function set(val) {
      if (!val) val = "";
      if (typeof val != "string") val = val.toString();
      // disallows <!-- and --> inside the comment text
      val = val.replace(/<!--/g, "").replace(/-->/g, "");
      this._text = val;
    }
  }]);

  return VCommentElement;
}();

/**
 * Virtual wrapper element for multiple elements without single root.
 */


var VWrapperElement = function () {
  function VWrapperElement(children) {
    _classCallCheck(this, VWrapperElement);

    this.children = children;
    this.hidden = false;
  }

  _createClass(VWrapperElement, [{
    key: "toString",
    value: function toString(indent, indentChar, level) {
      var s = "",
          children = this.children;
      if (!children || this.hidden) return s;

      for (var i = 0, l = children.length; i < l; i++) {
        var child = children[i];
        if (!child) continue;
        if (!child.hidden) {
          s += child.toString(indent, indentChar, level);
        }
      }
      return s;
    }
  }]);

  return VWrapperElement;
}();

exports.VXmlElement = VXmlElement;
exports.VHtmlElement = VHtmlElement;
exports.VHtmlFragment = VHtmlFragment;
exports.VTextElement = VTextElement;
exports.VCommentElement = VCommentElement;
exports.VWrapperElement = VWrapperElement;
exports.escapeHtml = escapeHtml;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _date = require("../../scripts/components/date");

var _date2 = _interopRequireDefault(_date);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Proxy functions for built-in JSON API.
 * Proxy functions are used, for example, to remove the asymmetry between
 * -  JSON stringify (creating string representations of dates) and
 * -  JSON parse (NOT parsing dates in ISO format - losing dates).
 *
 * Besides, I HATE the word "stringify"!!!
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
exports.default = {
  /**
   * Serializes an object into JSON format.
   */
  compose: function compose(o, indentation) {
    return JSON.stringify(o, function (k, v) {
      if (v === undefined) {
        return null;
      }
      return v;
    }, indentation);
  },

  /**
   * Parses an object represented in JSON format.
   */
  parse: function parse(s, options) {
    var o = _utils2.default.extend({
      parseDates: true
    }, options);

    if (!o.parseDates) {
      return JSON.parse(s);
    }

    return JSON.parse(s, function (k, v) {
      if (_utils2.default.isString(v) && _date2.default.looksLikeDate(v)) {
        // check if the value looks like a date and can be parsed
        var a = _date2.default.parse(v);
        if (a && _date2.default.isValid(a)) {
          return a;
        }
      }
      return v;
    });
  },

  /**
   * Clones an object using JSON.
   * Unlike the normal JSON API, Dates are kept as dates;
   * however, strings that looks like dates becomes dates.
   */
  clone: function clone(o) {
    return this.parse(this.compose(o));
  }
};

},{"../../scripts/components/date":2,"../../scripts/utils":34}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _json = require("../../scripts/data/json");

var _json2 = _interopRequireDefault(_json);

var _exceptions = require("../../scripts/exceptions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getStorage(type) {
  if (_utils2.default.isObject(type)) return type;
  switch (type) {
    case 1:
      return localStorage;
    case 2:
      return sessionStorage;
    default:
      return sessionStorage;
  }
} /**
   * LRU cache.
   * https://github.com/RobertoPrevato/KingTable
   *
   * Copyright 2017, Roberto Prevato
   * https://robertoprevato.github.io
   *
   * Licensed under the MIT license:
   * http://www.opensource.org/licenses/MIT
   */
exports.default = {

  get: function get(name, condition, type, details) {
    if (condition === true) {
      details = true;
      condition = undefined;
    }
    if (type === true) {
      details = true;
      type = undefined;
    }
    var storage = getStorage(type);
    var i,
        o = storage.getItem(name);
    if (o) {
      try {
        o = _json2.default.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return;
      }
      // set timestamp in each item data
      if (!condition) return _utils2.default.map(o, function (x) {
        return details ? x : x.data;
      });
      var toRemove = [],
          toReturn;
      var l = o.length;
      for (i = 0; i < l; i++) {
        var ca = o[i];
        if (!ca) continue;
        var data = ca.data,
            expiration = data.expiration;
        if (_utils2.default.isNumber(expiration) && expiration > 0) {
          // is the data expired?
          if (new Date().getTime() > expiration) {
            // the item expired, it should be removed
            toRemove.push(ca);
            // skip
            continue;
          }
        }
        if (condition(data)) {
          toReturn = details ? ca : data;
        }
      }
      if (toRemove.length) {
        this.remove(name, function (x) {
          return toRemove.indexOf(x) > -1;
        });
      }
      return toReturn;
    }
  },

  /**
   * Removes an item from the cache, eventually using a condition.
   */
  remove: function remove(name, condition, type) {
    var storage = getStorage(type);
    if (!condition) {
      storage.removeItem(name);
      return;
    }
    var i,
        o = storage.getItem(name);

    if (o) {
      try {
        o = _json2.default.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return;
      }
      var l = o.length;
      var toKeep = [];
      for (i = 0; i < l; i++) {
        var ca = o[i];
        if (!ca) continue;
        var data = ca.data;
        if (!condition(data)) {
          // keep this item
          toKeep.push(ca);
        }
      }
      return storage.setItem(name, _json2.default.compose(toKeep));
    }
  },

  set: function set(name, value, maxSize, maxAge, type) {
    if (!_utils2.default.isNumber(maxSize)) maxSize = 10;
    if (!_utils2.default.isNumber(maxAge)) maxAge = -1;
    var storage = getStorage(type);
    var ts = new Date().getTime(),
        exp = maxAge > 0 ? ts + maxAge : -1;
    var data = {
      ts: ts,
      expiration: exp,
      data: value
    };
    var o = storage.getItem(name);
    if (o) {
      try {
        o = _json2.default.parse(o);
      } catch (ex) {
        storage.removeItem(name);
        return this.set(name, value, maxSize);
      }
      if (o.length >= maxSize) {
        // remove oldest item
        o.shift();
      }
      o.push(data);
    } else {
      // new object
      o = [{
        ts: ts,
        expiration: exp,
        data: value
      }];
    }
    return storage.setItem(name, _json2.default.compose(o));
  }
};

},{"../../scripts/data/json":13,"../../scripts/exceptions":20,"../../scripts/utils":34}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Memory storage. Allows to replace use of localStorage and sessionStorage
 * with an in-memory storage that implements the same interface.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

var CACHE = {};

exports.default = {
  items: function items() {
    return CACHE;
  },
  length: function length() {
    var x,
        i = 0;
    for (x in CACHE) {
      i++;
    }
    return i;
  },
  getItem: function getItem(name) {
    return CACHE[name];
  },
  setItem: function setItem(name, value) {
    CACHE[name] = value;
  },
  removeItem: function removeItem(name) {
    delete CACHE[name];
  },
  clear: function clear() {
    var x;
    for (x in CACHE) {
      delete CACHE[x];
    }
  }
};

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Object analyzer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Analyzer = function () {
  function Analyzer() {
    _classCallCheck(this, Analyzer);
  }

  _createClass(Analyzer, [{
    key: "describe",


    /**
     * Returns an object describing the properties of a given item.
     * @return {object}
     */
    value: function describe(o, options) {
      if (_utils2.default.isArray(o)) return this.describeList(o, options);
      var schema = {},
          x;
      for (x in o) {
        schema[x] = this.getType(o[x]);
      }
      return schema;
    }

    /**
     * Returns an object describing the properties of the items contained by a list.
     * @return {object}
     */

  }, {
    key: "describeList",
    value: function describeList(a, options) {
      var schema = {};
      options = options || {};
      function typ(o) {
        return o; // TODO: refactor to return object with "nullable" info?
      }
      var l = _utils2.default.isNumber(options.limit) ? options.limit : a.length;
      for (var i = 0; i < l; i++) {
        var o = this.describe(a[i]);
        for (var x in o) {
          if (_utils2.default.has(schema, x)) {
            //compare
            if (typ(o[x]) != undefined && typ(schema[x]) != typ(o[x])) {
              if (!typ(schema[x])) {
                schema[x] = typ(o[x]);
              } else {
                //force string type
                schema[x] = "string";
              }
            }
          } else {
            // add new  property
            _utils2.default.extend(schema, o);
          }
        }
        if (options.lazy && !_utils2.default.any(schema, function (k, v) {
          return v === undefined;
        })) {
          break;
        }
      }
      return schema;
    }

    /**
     * Returns a string representing a type, in greater detail than normal JS.
     * @return {string}
     */

  }, {
    key: "getType",
    value: function getType(o) {
      if (o == null || o == undefined) return;
      if (o instanceof Array) return "array";
      if (o instanceof Date) return "date";
      if (o instanceof RegExp) return "regex";
      return typeof o === "undefined" ? "undefined" : _typeof(o);
    }
  }]);

  return Analyzer;
}();

exports.default = Analyzer;

},{"../../scripts/utils":34}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Strings sanitizer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sanitizer = function () {
  function Sanitizer() {
    _classCallCheck(this, Sanitizer);
  }

  _createClass(Sanitizer, [{
    key: "sanitize",
    value: function sanitize(o) {
      var x;
      for (x in o) {
        if (_utils2.default.isString(o[x])) {
          o[x] = this.escape(o[x]);
        } else if (_utils2.default.isObject(o[x])) {
          if (_utils2.default.isArray(o[x])) {
            for (var i = 0, l = o[x].length; i < l; i++) {
              o[x][i] = this.sanitize(o[x][i]);
            }
          } else {
            o[x] = this.sanitize(o[x]);
          }
        }
      }
      return o;
    }
  }, {
    key: "escapeHtml",
    value: function escapeHtml(s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  }, {
    key: "escape",
    value: function escape(s) {
      return s ? this.escapeHtml(s) : "";
    }
  }]);

  return Sanitizer;
}();

exports.default = Sanitizer;

},{"../../scripts/utils":34}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  normal: function normal(xml) {
    return "<?xml version=\"1.0\"?>" + xml.replace(/\sxmlns="http:\/\/www\.w3\.org\/\d+\/xhtml"/, "");
  },

  pretty: function pretty(xml, indentation) {
    xml = this.normal(xml);
    if (typeof indentation != "number") indentation = 2;
    var reg = /(>)(<)(\/*)/g,
        a = [];
    xml = xml.replace(reg, "$1\r\n$2$3");
    var pad = 0,
        parts = xml.split('\r\n'),
        l = parts.length;

    for (var i = 0; i < l; i++) {
      var node = parts[i];
      var indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad != 0) {
          pad -= 1;
        }
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }
      var padding = new Array(pad * indentation).join(" ");
      a.push(padding + node + "\r\n");
      pad += indent;
    }
    return a.join("");
  }
}; /**
    * XML format functions.
    * https://github.com/RobertoPrevato/KingTable
    *
    * Copyright 2017, Roberto Prevato
    * https://robertoprevato.github.io
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */

},{"../../scripts/utils":34}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _utils = require("../scripts/utils.js");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DOM utilities.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var OBJECT = "object",
    STRING = "string",
    NUMBER = "number",
    FUNCTION = "function",
    LEN = "length",
    REP = "replace";

var any = _utils2.default.any;
var each = _utils2.default.each;

function modClass(el, n, add) {
  if (n.search(/\s/) > -1) {
    n = n.split(/\s/g);
    for (var i = 0, l = n[LEN]; i < l; i++) {
      modClass(el, n[i], add);
    }
  } else if ((typeof n === "undefined" ? "undefined" : _typeof(n)) == STRING) {
    el.classList[add ? "add" : "remove"](n);
  }
  return el;
}
function addClass(el, n) {
  return modClass(el, n, 1);
}
function removeClass(el, n) {
  return modClass(el, n, 0);
}
function hasClass(el, n) {
  return el && el.classList.contains(n);
}
function attr(el, n) {
  return el.getAttribute(n);
}
function attrName(el) {
  return attr(el, "name");
}
function nameSelector(el) {
  return "[name='" + attrName(el) + "']";
}
function isPassword(o) {
  return isInput(o) && attr(o, "type") == "password";
}
function setValue(el, v) {
  if (el.type == "checkbox") {
    el.checked = v == true || /1|true/.test(v);
    el.dispatchEvent(new Event("change"), { forced: true });
    return;
  }
  if (el.value != v) {
    el.value = v;
    el.dispatchEvent(new Event("change"), { forced: true });
  }
}
function getValue(el) {
  var isInput = /input/i.test(el.tagName);
  if (isInput) {
    switch (attr(el, "type")) {
      case "radio":
      case "checkbox":
        return el.checked;
    }
  }
  return el.value;
}
function isRadioButton(el) {
  return el && /^input$/i.test(el.tagName) && /^(radio)$/i.test(el.type);
}
function isSelectable(el) {
  return el && (/^select$/i.test(el.tagName) || isRadioButton(el));
}
function next(el) {
  return el.nextElementSibling;
}
function nextWithClass(el, n) {
  var a = el.nextElementSibling;
  return hasClass(a, n) ? a : undefined;
}
function prev(el) {
  return el.previousElementSibling;
}
function find(el, selector) {
  return el.querySelectorAll(selector);
}
function findFirst(el, selector) {
  return el.querySelectorAll(selector)[0];
}
function findFirstByClass(el, name) {
  return el.getElementsByClassName(name)[0];
}
function isHidden(el) {
  var style = window.getComputedStyle(el);
  return style.display == "none" || style.visibility == "hidden";
}
function createElement(tag) {
  return document.createElement(tag);
}
function after(a, b) {
  a.parentNode.insertBefore(b, a.nextSibling);
}
function append(a, b) {
  a.appendChild(b);
}
function isElement(o) {
  return (typeof HTMLElement === "undefined" ? "undefined" : _typeof(HTMLElement)) === OBJECT ? o instanceof HTMLElement : //DOM2
  o && (typeof o === "undefined" ? "undefined" : _typeof(o)) === OBJECT && o !== null && o.nodeType === 1 && _typeof(o.nodeName) === STRING;
}
function isAnyInput(o) {
  // TODO: add support for divs transformed into rich input
  return o && isElement(o) && /input|button|textarea|select/i.test(o.tagName);
}
function isInput(o) {
  return o && isElement(o) && /input/i.test(o.tagName);
}
function expectParent(el) {
  if (!isElement(el)) throw new Error("expected HTML Element");
  var parent = el.parentNode;
  if (!isElement(parent)) throw new Error("expected HTML element with parentNode");
  return parent;
}
var DOT = ".";

/**
 * Splits an event name into its event name and namespace.
 */
function splitNamespace(eventName) {
  var i = eventName.indexOf(DOT);
  if (i > -1) {
    var name = eventName.substr(0, i);
    return [eventName.substr(0, i), eventName.substr(i + 1)];
  }
  return [eventName, ""];
}

var HANDLERS = [];

exports.default = {

  splitNamespace: splitNamespace,

  /**
   * Empties an element, removing all its children elements and event handlers.
   */
  empty: function empty(node) {
    while (node.hasChildNodes()) {
      // remove event handlers on the child, about to be removed:
      this.off(node.lastChild);
      node.removeChild(node.lastChild);
    }
  },


  /**
   * Removes an element, with all event handlers.
   */
  remove: function remove(a) {
    if (!a) return;
    this.off(a);
    var parent = a.parentElement || a.parentNode;
    if (parent) {
      // in stupid IE, text nodes and comments don't have a parentElement
      parent.removeChild(a);
    }
  },


  /**
   * Gets the closest ancestor of the given element having the given tagName.
   *
   * @param el: element from which to find the ancestor
   * @param predicate: predicate to use for lookup.
   * @param excludeItself: whether to include the element itself.
   */
  closest: function closest(el, predicate, excludeItself) {
    if (!el || !predicate) return;
    if (!excludeItself) {
      if (predicate(el)) return el;
    }
    var o,
        parent = el;
    while (parent = parent.parentElement) {
      if (predicate(parent)) {
        return parent;
      }
    }
  },


  /**
   * Gets the closest ancestor of the given element having the given tagName.
   *
   * @param el: element from which to find the ancestor
   * @param tagName: tagName to look for.
   * @param excludeItself: whether to include the element itself.
   */
  closestWithTag: function closestWithTag(el, tagName, excludeItself) {
    if (!tagName) return;
    tagName = tagName.toUpperCase();
    return this.closest(el, function (el) {
      return el.tagName == tagName;
    }, excludeItself);
  },


  /**
   * Gets the closest ancestor of the given element having the given class.
   *
   * @param el: element from which to find the ancestor
   * @param tagName: tagName to look for.
   * @param excludeItself: whether to include the element itself.
   */
  closestWithClass: function closestWithClass(el, className, excludeItself) {
    if (!className) return;
    return this.closest(el, function (el) {
      return hasClass(el, className);
    }, excludeItself);
  },


  /**
   * Returns a value indicating whether the a node contains another node.
   *
   * @param a: containing node
   * @param b: node to be checked for containment
   */
  contains: function contains(a, b) {
    if (!a || !b) return false;
    if (!a.hasChildNodes()) return false;
    var children = a.childNodes,
        l = children.length;
    for (var i = 0; i < l; i++) {
      var child = children[i];
      if (child === b) return true;
      if (this.contains(child, b)) {
        return true;
      }
    }
    return false;
  },


  /**
   * Sets a delegate event listener.
   *
   * @param element
   * @param eventName
   * @param selector
   * @param method
   * @returns {this}
   */
  on: function on(element, type, selector, callback) {
    if (!isElement(element))
      // element could be a text element or a comment
      throw new Error("argument is not a DOM element.");
    if (_utils2.default.isFunction(selector) && !callback) {
      callback = selector;
      selector = null;
    }
    var $ = this;
    var parts = splitNamespace(type);
    var eventName = parts[0],
        ns = parts[1];
    var listener = function listener(e) {
      var m = e.target;
      if (selector) {
        var targets = find(element, selector);
        if (any(targets, function (o) {
          return e.target === o || $.contains(o, e.target);
        })) {
          var re = callback(e, e.detail);
          if (re === false) {
            e.preventDefault();
          }
          return true;
        }
      } else {
        var re = callback(e, e.detail);
        if (re === false) {
          e.preventDefault();
        }
        return true;
      }
      return true;
    };
    HANDLERS.push({
      type: type,
      ev: eventName,
      ns: ns,
      fn: listener,
      el: element
    });
    element.addEventListener(eventName, listener, true);
    return this;
  },


  /**
   * Removes all event handlers set by DOM helper on a given element.
   * @returns {this}
   */
  off: function off(element, type) {
    if (!isElement(element))
      // element could be a text element or a comment
      return;
    if (type) {
      if (type[0] === DOT) {
        // unset event listeners by namespace
        var ns = type.substr(1);
        each(HANDLERS, function (o) {
          if (o.el === element && o.ns == ns) {
            o.el.removeEventListener(o.ev, o.fn, true);
          }
        });
      } else {
        // check namespace
        var parts = splitNamespace(type);
        var eventName = parts[0],
            ns = parts[1];
        each(HANDLERS, function (o) {
          if (o.el === element && o.ev == eventName && (!ns || o.ns == ns)) {
            o.el.removeEventListener(o.ev, o.fn, true);
          }
        });
      }
    } else {
      each(HANDLERS, function (o) {
        if (o.el === element) {
          o.el.removeEventListener(o.ev, o.fn, true);
        }
      });
    }
  },


  /**
   * Removes all event handlers set by DOM helper.
   * @returns {this}
   */
  offAll: function offAll() {
    var self = this,
        element;
    each(HANDLERS, function (o) {
      element = o.el;
      element.removeEventListener(o.ev, o.fn, true);
    });
    return self;
  },


  /**
   * Fires an event on a given element.
   *
   * @param el: element on which to fire an event.
   * @param eventName: name of the event to fire.
   * @param data: event data.
   */
  fire: function fire(el, eventName, data) {
    if (eventName == "focus") {
      el.focus();
      return;
    }
    var event;
    if (window.CustomEvent) {
      event = new CustomEvent(eventName, { detail: data });
    } else if (document.createEvent) {
      event = document.createEvent("CustomEvent");
      event.initCustomEvent(eventName, true, true, data);
    }
    el.dispatchEvent(event);
  },


  /**
   * Returns the siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  siblings: function siblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"];
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el) {
        a.push(child);
      }
    }
    return a;
  },


  /**
   * Returns the next siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  nextSiblings: function nextSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"],
        include = false;
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el && include) {
        a.push(child);
      } else {
        include = true;
      }
    }
    return a;
  },


  /**
   * Returns the previous siblings of the given element.
   *
   * @param el: element of which to get the siblings.
   */
  prevSiblings: function prevSiblings(el, allNodes) {
    var parent = expectParent(el);
    var a = [],
        children = parent[allNodes ? "childNodes" : "children"];
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      if (child !== el) {
        a.push(child);
      } else {
        break;
      }
    }
    return a;
  },


  /**
   * Finds elements by class name.
   */
  findByClass: function findByClass(el, name) {
    return el.getElementsByClassName(name);
  },


  /**
   * Return a value indicating whether the given element is focused.
   *
   * @param el: element to check for focus
   */
  isFocused: function isFocused(el) {
    if (!el) return false;
    return el === this.getFocusedElement();
  },


  /**
   * Returns the currently active element, in the DOM.
   */
  getFocusedElement: function getFocusedElement() {
    return document.querySelector(":focus");
  },


  /**
   * Returns a value indicating whether there is any input element currently focused.
   */
  anyInputFocused: function anyInputFocused() {
    var a = this.getFocusedElement();
    return a && /input|select|textarea/i.test(a.tagName);
  },


  prev: prev,

  next: next,

  append: append,

  addClass: addClass,

  removeClass: removeClass,

  modClass: modClass,

  attr: attr,

  hasClass: hasClass,

  after: after,

  createElement: createElement,

  isElement: isElement,

  isInput: isInput,

  isAnyInput: isAnyInput,

  isSelectable: isSelectable,

  isRadioButton: isRadioButton,

  isPassword: isPassword,

  attrName: attrName,

  isHidden: isHidden,

  find: find,

  findFirst: findFirst,

  findFirstByClass: findFirstByClass,

  getValue: getValue,

  setValue: setValue
};

},{"../scripts/utils.js":34}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Proxy functions to raise exceptions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function isNumber(x) {
  return typeof x == "number";
}
var NO_PARAM = "???";

function ArgumentNullException(name) {
  throw new Error("The parameter cannot be null: " + (name || NO_PARAM));
}

function ArgumentException(details) {
  throw new Error("Invalid argument: " + (details || NO_PARAM));
}

function TypeException(name, expectedType) {
  throw new Error("Expected parameter: " + (name || NO_PARAM) + " of type: " + (type || NO_PARAM));
}

function OperationException(desc) {
  throw new Error("Invalid operation: " + desc);
}

function OutOfRangeException(name, min, max) {
  var message = "Out of range. Expected parameter: " + (name || NO_PARAM);
  if (!isNumber(max) && min === 0) {
    message = " to be positive.";
  } else {
    if (isNumber(min)) message = " >=" + min;
    if (isNumber(max)) message = " <=" + max;
  }
  throw new Error(message);
}

exports.ArgumentException = ArgumentException;
exports.ArgumentNullException = ArgumentNullException;
exports.TypeException = TypeException;
exports.OutOfRangeException = OutOfRangeException;
exports.OperationException = OperationException;

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("../../scripts/components/events");

var _events2 = _interopRequireDefault(_events);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

var _regex = require("../../scripts/components/regex");

var _regex2 = _interopRequireDefault(_regex);

var _array = require("../../scripts/components/array");

var _array2 = _interopRequireDefault(_array);

var _string = require("../../scripts/components/string");

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Filters manager.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Provides methods to handle client side filtering logic for arrays.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var FiltersManager = function (_EventsEmitter) {
  _inherits(FiltersManager, _EventsEmitter);

  function FiltersManager(options, staticProperties) {
    var _ret;

    _classCallCheck(this, FiltersManager);

    var _this = _possibleConstructorReturn(this, (FiltersManager.__proto__ || Object.getPrototypeOf(FiltersManager)).call(this));

    _this.rules = [];
    _this.searchDisabled = false;
    _this.init(options, staticProperties);
    return _ret = _this, _possibleConstructorReturn(_this, _ret);
  }

  _createClass(FiltersManager, [{
    key: "init",
    value: function init(options, staticProperties) {
      if (staticProperties) _utils2.default.extend(this, staticProperties);
      this.options = _utils2.default.extend({}, this.defaults, options);
    }
  }, {
    key: "set",
    value: function set(filter, options) {
      options = _utils2.default.extend({
        silent: false
      }, options || {});
      if (!filter) return this;
      if (filter.id && !filter.key) filter.key = filter.id;
      if (filter.key) {
        this.rules = _utils2.default.reject(this.rules, function (r) {
          return r.key === filter.key;
        });
      }
      if (filter.fromLiveFilters) return this.setLiveFilter(filter);
      this.rules.push(filter);
      if (!options.silent) {
        this.onRulesChange(filter);
      }
      return this;
    }
  }, {
    key: "setLiveFilter",
    value: function setLiveFilter(filter) {
      (0, _raise2.default)(12, "LiveFilter feature not implemented.");
    }
  }, {
    key: "getRuleByKey",


    /**
     * Gets a rule by key.
     */
    value: function getRuleByKey(key) {
      return _utils2.default.find(this.rules, function (rule) {
        return rule.key == key;
      });
    }

    /**
     * Get all rules by type.
     */

  }, {
    key: "getRulesByType",
    value: function getRulesByType(type) {
      return _utils2.default.where(this.rules, function (rule) {
        return rule.type == type;
      });
    }

    /**
     * Removes a single rule by key.
     */

  }, {
    key: "removeRuleByKey",
    value: function removeRuleByKey(key, options) {
      options = _utils2.default.extend({
        silent: false
      }, options || {});
      var self = this,
          rules = self.rules;
      var ruleToRemove = _utils2.default.find(rules, function (r) {
        return r.key == key;
      });
      if (ruleToRemove) {
        self.rules = _utils2.default.reject(rules, function (r) {
          return r === ruleToRemove;
        });
        if (!options.silent) {
          self.onRulesChange();
        }
      }
      return self;
    }

    /**
     * Function to fire when rules change.
     * Extensibility point.
     */

  }, {
    key: "onRulesChange",
    value: function onRulesChange() {}

    /**
     * Searches inside a collection for all items that respect a given search string.
     */

  }, {
    key: "search",
    value: function search(collection, s, options) {
      if (!s || !collection || this.searchDisabled) return collection;
      var rx = s instanceof RegExp ? s : _regex2.default.getSearchPattern(_string2.default.getString(s), options);
      if (!rx) return false;
      if (!options.searchProperties)
        // try to get search properties from the context
        options.searchProperties = this.context.getSearchProperties();
      if (!options.searchProperties) (0, _raise2.default)(11, "missing search properties");
      return _array2.default.searchByStringProperties({
        pattern: rx,
        properties: options.searchProperties,
        collection: collection,
        keepSearchDetails: false
      });
    }

    /**
     * Skims an array, applying all configured filters.
     */

  }, {
    key: "skim",
    value: function skim(arr) {
      var self = this,
          rules = self.rules,
          l = rules.length;
      if (!l) return arr;
      var a = arr;
      for (var i = 0; i < l; i++) {
        var filter = self.rules[i];
        if (filter.disabled) continue;
        a = self.applyFilter(a, filter);
      }
      return a;
    }

    /**
     * Applies a given filter to an array.
     */

  }, {
    key: "applyFilter",
    value: function applyFilter(arr, filter) {
      switch (filter.type) {
        case "search":
          return this.search(arr, filter.value, filter);
        case "fn":
        case "function":
          return _utils2.default.where(arr, _utils2.default.partial(filter.fn.bind(filter.context || this), filter));
      }
      return arr;
    }

    /**
     * Resets this FiltersManager, removing all filter rules in it.
     */

  }, {
    key: "reset",
    value: function reset() {
      var rule;
      while (rule = this.rules.shift()) {
        if (rule.onReset) {
          rule.onReset.call(this);
        }
      }
      return this;
    }
  }], [{
    key: "defaults",
    get: function get() {
      return {};
    }
  }]);

  return FiltersManager;
}(_events2.default);

exports.default = FiltersManager;

},{"../../scripts/components/array":1,"../../scripts/components/events":3,"../../scripts/components/regex":6,"../../scripts/components/string":7,"../../scripts/raise":26,"../../scripts/utils":34}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Paginator class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Offers methods to handle pagination of items and page number.s
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function checkNumber() {
  var i,
      l = arguments.length,
      a;
  for (i = 0; i < l; i++) {
    a = arguments[i];
    if (!_utils2.default.isNumber(a)) throw new Error("invalid type");
  }
}
function checkNullableNumber() {
  var i,
      l = arguments.length,
      a;
  for (i = 0; i < l; i++) {
    a = arguments[i];
    if (!_utils2.default.isUnd(a) && !_utils2.default.isNumber(a)) throw new Error("invalid type");
  }
}

var Paginator = function () {
  function Paginator(options) {
    _classCallCheck(this, Paginator);

    options = options || {};
    checkNullableNumber(options.page, options.totalItemsCount, options.resultsPerPage);
    this.page = options.page || 0;
    this.resultsPerPage = options.resultsPerPage || 30;
    this.totalItemsCount = options.totalItemsCount || Infinity;
    this.totalPageCount = Infinity;
    this.firstObjectNumber = undefined;
    this.lastObjectNumber = undefined;
    if (!_utils2.default.isUnd(options.totalItemsCount)) {
      this.setTotalItemsCount(options.totalItemsCount, true);
    }
    if (_utils2.default.isFunction(options.onPageChange)) {
      // override
      this.onPageChange = options.onPageChange;
    }
  }

  _createClass(Paginator, [{
    key: "data",


    /**
     * Returns a summary of this paginator.
     */
    value: function data() {
      var data = this;
      return {
        page: data._page,
        totalPageCount: data.totalPageCount,
        resultsPerPage: data.resultsPerPage,
        firstObjectNumber: data.firstObjectNumber,
        lastObjectNumber: data.lastObjectNumber,
        totalItemsCount: data.totalItemsCount
      };
    }

    /**
     * Goes to previous page.
     */

  }, {
    key: "prev",
    value: function prev() {
      var self = this,
          a = self.page - 1;
      if (self.validPage(a)) {
        self.page = a;
      }
      return self;
    }

    /**
     * Goes to next page.
     */

  }, {
    key: "next",
    value: function next() {
      var self = this,
          a = self.page + 1;
      if (self.validPage(a)) {
        self.page = a;
      }
      return self;
    }

    /**
     * Goes to the first page.
     */

  }, {
    key: "first",
    value: function first() {
      this.page = 1;
      return this;
    }

    /**
     * Goes to the last page.
     */

  }, {
    key: "last",
    value: function last() {
      this.page = this.totalPageCount;
      return this;
    }

    /**
     * Updates the objects numbers in memory.
     */

  }, {
    key: "updateItemsNumber",
    value: function updateItemsNumber() {
      var self = this,
          totalItemsCount = self.totalItemsCount;
      self.firstObjectNumber = self.page * self.resultsPerPage - self.resultsPerPage + 1;
      self.lastObjectNumber = Math.min(_utils2.default.isNumber(totalItemsCount) ? totalItemsCount : Infinity, self.page * self.resultsPerPage);
    }

    /**
     * Sets the total items count of this paginator.
     */

  }, {
    key: "setTotalItemsCount",
    value: function setTotalItemsCount(itemsCount, uponInitialization) {
      checkNumber(itemsCount);
      var self = this;
      self.totalItemsCount = itemsCount;
      var totalPages = self.getPageCount(itemsCount, self.resultsPerPage);
      self.totalPageCount = totalPages;
      //if the current page is greater than the total pages count; set automatically the page to 1
      // NB: the following does not make sense upon initialization!!
      if (!uponInitialization && totalPages < self.page) {
        self.page = 1;
      }
      self.updateItemsNumber();
      return self;
    }

    /**
     * Returns a value indicating whether the given value is a valid page number for this paginator.
     *
     * @param val: page number
     */

  }, {
    key: "validPage",
    value: function validPage(val) {
      var p = this;
      return !(isNaN(val) || val < 1 || val > p.totalPageCount || val === p.page);
    }

    /**
     * Function fired when changing page.
     */

  }, {
    key: "onPageChange",
    value: function onPageChange() {}

    /**
     * Gets the total page count to display n objects, given the number of objects per page.
     *
     * @param objectsCount: total items count
     * @param objectsPerPage: page size, number of items per page
     */

  }, {
    key: "getPageCount",
    value: function getPageCount(objectsCount, objectsPerPage) {
      checkNumber(objectsCount, objectsPerPage);
      if (objectsCount === Infinity) return Infinity;
      if (objectsCount === -Infinity) return 0;
      if (objectsCount < 1) return 0;
      if (objectsCount > objectsPerPage) {
        if (objectsCount % objectsPerPage == 0) {
          return objectsCount / objectsPerPage;
        }
        return Math.ceil(objectsCount / objectsPerPage);
      }
      return 1;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      delete this.onPageChange;
    }
  }, {
    key: "resultsPerPage",
    get: function get() {
      return this._resultsPerPage;
    },
    set: function set(value) {
      if (!value) value = 0;
      checkNumber(value);
      var self = this,
          totalItemsCount = self.totalItemsCount;
      // is total items count known?
      if (totalItemsCount) {
        var totalPages = self.getPageCount(totalItemsCount, value);
        self.totalPageCount = totalPages;
        if (totalPages <= self._page) {
          // go to last page
          self.page = totalPages;
        }
      }
      self._resultsPerPage = value;
      self.updateItemsNumber();
    }

    /**
     * Gets the current page of this paginator.
     */

  }, {
    key: "page",
    get: function get() {
      return this._page;
    }

    /**
     * Sets the current page of this paginator.
     */
    ,
    set: function set(value) {
      checkNumber(value);
      if (value != this.page) {
        this._page = value;
        this.updateItemsNumber();
        this.onPageChange();
      }
    }
  }]);

  return Paginator;
}();

exports.default = Paginator;

},{"../../scripts/utils":34}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextSlider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Text slider.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _exceptions = require("../../scripts/exceptions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextSlider = function () {
  function TextSlider(text, filler) {
    _classCallCheck(this, TextSlider);

    if (!text) (0, _exceptions.ArgumentNullException)("text");
    this.length = text.length;
    this.i = 0;
    this.j = this.length;
    this.text = text;
    this.filler = filler || " ";
    this.right = true;
  }

  /**
   * Resets this TextSlider at its initial statte.
   */


  _createClass(TextSlider, [{
    key: "reset",
    value: function reset() {
      this.i = 0;
      this.j = this.length;
      this.right = true;
    }
  }, {
    key: "next",
    value: function next() {
      var self = this,
          s = self.text,
          filler = self.filler,
          length = self.length,
          i = self.i,
          j = self.j,
          right = self.right;
      var a = s.substr(i, j);
      var change = false;
      if (right) {
        if (j == 1) {
          j = s.length;
          i = j;
          change = true;
        } else {
          j--;
        }
      } else {
        if (i == 0) {
          j--;
          change = true;
        } else {
          i--;
        }
      }

      if (right && s.length != a.length) {
        a = new Array(s.length - a.length + 1).join(filler) + a;
      } else {
        a = a + new Array(s.length - a.length + 1).join(filler);
      }
      if (change) {
        right = !right;
        self.right = right;
      }
      self.i = i;
      self.j = j;
      return a;
    }
  }]);

  return TextSlider;
}();

exports.TextSlider = TextSlider;

},{"../../scripts/exceptions":20,"../../scripts/utils":34}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.menuItemBuilder = exports.menuBuilder = undefined;

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _dom = require("../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

var _exceptions = require("../../scripts/exceptions");

var _html = require("../../scripts/data/html");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * KingTable menu builder function.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function buildMenuItemCaret() {
  return new _html.VHtmlElement("span", {
    "class": "oi",
    "data-glyph": "caret-right"
  });
}

function menuBuilder(menus) {
  if (!menus) throw "missing menus";
  if (_utils2.default.isPlainObject(menus)) return menuBuilder([menus]);
  if (!_utils2.default.isArray(menus) || !menus.length) throw "missing menus";
  //normalize schema, if needed
  var first = menus[0];
  if (!first.items && first.menu) {
    menus = [{ items: menus }];
  }
  var a = _utils2.default.map(menus, function (menu) {
    var items = menu.items;
    return new _html.VHtmlElement("ul", {
      "id": menu.id,
      "class": "ug-menu"
    }, items ? _utils2.default.map(items, function (x) {
      if (!x) return;
      return menuItemBuilder(x);
    }) : null);
  });
  return new _html.VWrapperElement(a);
}

function menuItemCaret() {
  return new _html.VHtmlElement("span", {
    "class": "oi",
    "data-glyph": "caret-right"
  });
}

function menuItemBuilder(options) {
  var o = options || {};
  var type = o.type,
      href = o.href,
      classes = [],
      name = o.name,
      submenu = o.menu,
      attr = o.attr,
      caret = submenu ? buildMenuItemCaret() : null,
      children = [],
      el,
      nameTextEl = new _html.VTextElement(name || "");
  if (attr && attr.css && !attr["class"]) {
    // allow to use attribute css for class
    attr["class"] = attr.css;
    delete attr.css;
  }
  switch (type) {
    case "checkbox":
      var cid = _utils2.default.uniqueId("mnck-");
      var checked = o.checked ? true : undefined;
      el = new _html.VWrapperElement([new _html.VHtmlElement("input", _utils2.default.extend({}, attr, {
        "id": cid,
        "type": "checkbox",
        "checked": checked
      })), new _html.VHtmlElement("label", {
        "for": cid
      }, nameTextEl)]);
      break;
    case "radio":
      var value = o.value;
      if (!value) throw new Error("missing 'value' for radio menu item");
      var cid = _utils2.default.uniqueId("mnrd-");
      var checked = o.checked ? true : undefined;
      el = new _html.VWrapperElement([new _html.VHtmlElement("input", _utils2.default.extend({}, attr, {
        "id": cid,
        "type": "radio",
        "checked": checked,
        "value": value
      })), new _html.VHtmlElement("label", {
        "for": cid
      }, nameTextEl)]);
      break;
    default:
      if (href) {
        el = new _html.VHtmlElement("a", _utils2.default.extend({
          "href": href
        }, attr), [nameTextEl, caret]);
      } else {
        el = new _html.VHtmlElement("span", _utils2.default.extend({
          "tabindex": "0"
        }, attr), [nameTextEl, caret]);
      }
      break;
  }
  // name element
  children.push(el);

  if (submenu) {
    children.push(menuBuilder(submenu));
  }

  return new _html.VHtmlElement("li", {
    "id": o.id,
    "class": submenu ? "ug-submenu" : undefined
  }, children);
}

exports.menuBuilder = menuBuilder;
exports.menuItemBuilder = menuItemBuilder;

},{"../../scripts/data/html":12,"../../scripts/dom":19,"../../scripts/exceptions":20,"../../scripts/utils":34}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dom = require("../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * KingTable menu core functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function eventToIgnore(e) {
  return (/input|select|textarea|label|^a$/i.test(e.target.tagName)
  );
}

var menufunctions = {

  closeMenus: function closeMenus(e) {
    var self = this;
    if (e && e.which === 3) return;
    _utils2.default.each(["ug-menu", "ug-submenu"], function (className) {
      var elements = document.body.getElementsByClassName(className);

      _utils2.default.each(elements, function (el) {
        if (_dom2.default.contains(el, e.target)) return;

        var parent = el.parentNode;
        if (!_dom2.default.hasClass(parent, "open")) return;

        if (/input|textarea/i.test(e.target.tagName) && _dom2.default.contains(parent, e.target)) return;

        _dom2.default.removeClass(parent, "open");
      });
    });
  },

  expandMenu: function expandMenu(e) {
    if (eventToIgnore(e)) return true;
    var self = this,
        el = e.target,
        disabled = "disabled";
    if (_dom2.default.hasClass(el, disabled) || el.hasAttribute(disabled)) {
      return false;
    }
    var parent = el.parentElement,
        open = "open";
    if (_dom2.default.hasClass(parent, open)) {
      _dom2.default.removeClass(parent, open);
    } else {
      _dom2.default.addClass(parent, open);
    }
    e.preventDefault();
    return false;
  },

  expandSubMenu: function expandSubMenu(e) {
    if (eventToIgnore(e)) return true;
    var open = "open",
        el = _dom2.default.closestWithTag(e.target, "li"),
        siblings = _dom2.default.siblings(el);
    _utils2.default.each(siblings, function (sib) {
      _dom2.default.removeClass(sib, open);
      var allOpen = sib.getElementsByClassName(open);
      _utils2.default.each(allOpen, function (a) {
        _dom2.default.removeClass(a, open);
      });
    });
    _dom2.default.addClass(el, open);
    return false;
  }
};

exports.default = {
  setup: function setup() {
    if (this.initialized) {
      return false;
    }
    this.initialized = true;
    var click = "click.menus",
        keydown = "keydown.menus",
        bo = document.body;
    _dom2.default.off(bo, click);
    _dom2.default.on(bo, click, menufunctions.closeMenus); // order is important
    _dom2.default.on(bo, click, ".ug-expander", menufunctions.expandMenu);
    _dom2.default.on(bo, click, ".ug-submenu", menufunctions.expandSubMenu);
  }
};

},{"../../scripts/dom":19,"../../scripts/utils":34}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = raise;
/**
 * KingTable raise function.
 * This function is used to raise exceptions that include a link to the GitHub wiki,
 * providing further information and details.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/**
 * Raises an exception, offering a link to the GitHub wiki.
 */
function raise(err, detail) {
  var message = (detail ? detail : "Error") + ". For further details: https://github.com/RobertoPrevato/KingTable/wiki/Errors#" + err;
  if (typeof console != "undefined") {
    console.error(message);
  }
  throw new Error(message);
}

/*
----------------------------------------------------
Errors
----------------------------------------------------
1. Missing Promise implementation.
2. Missing dependency.
3. KingTable initialization: Data is not an array.
4. KingTable: cannot determine id property of displayed objects.
5. KingTable: an AJAX request is required, but url is not configured.
6. KingTable: the returned object is not a catalog.
7. KingTable: missing total items count in response object.
8. KingTable: missing view configuration.
9. KingTable: missing views configuration.
10. KingTable: missing handler for view.
11. FiltersManager: missing search properties.
12. Feature not implemented.
13. getTableData is not returning a promise object.
14. getFetchPromise did not return a value when resolving.
15. Missing regional.
16. Invalid columns option.
17. Missing property name in column option.
18. Column name defined in options, not found inside data items.
19. Column does not exist.
20. Missing columns information (properties not initialized).
21. Missing view configuration for Rich HTML builder.
22. Missing view resolver for Rich HTML builder.
23. Invalid resolver for Rich HTML builder view.
24. Invalid `html` option for column (property).
25. Cannot display a built table, because the table is not bound to an element.
26. Cannot update without root element.
27. Invalid method definition (must be string or function).
28. Invalid sort mode for RHTML builder.
29. Missing format in export element.
30. Missing format information.
31. Invalid getItemTemplate function in extra view.
32. Missing property for template.
33. Missing resolver in view configuration.
34. Invalid extra views configuration (null or falsy value).
35. Missing 'name' property in extra view configuration.
36. Cannot retrieve an item by event data. Make sure that HTML elements generated for table items have 'kt-item' class.
37. Cannot retrieve an item by element data. Make sure that HTML elements generated for table items have 'data-ix' attribute.
38. Cannot obtain HTML from parameter.
39. KingTable is not defined in global namespace.
40. Tools is not an array or a function returning an array.
41. Invalid HTTP Method configuration.
*/

},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("../../scripts/components/events");

var _events2 = _interopRequireDefault(_events);

var _kingtable = require("../../scripts/tables/kingtable");

var _kingtable2 = _interopRequireDefault(_kingtable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * KingTable base builder class.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Base class for all builders.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var KingTableBuilder = function (_EventsEmitter) {
  _inherits(KingTableBuilder, _EventsEmitter);

  function KingTableBuilder(table) {
    _classCallCheck(this, KingTableBuilder);

    var _this = _possibleConstructorReturn(this, (KingTableBuilder.__proto__ || Object.getPrototypeOf(KingTableBuilder)).call(this));

    _this.table = table;
    return _this;
  }

  /**
   * Returns the translations for the current language configuration.
   */


  _createClass(KingTableBuilder, [{
    key: "getReg",
    value: function getReg() {
      var table = this.table;
      return table ? table.getReg() : _kingtable2.default.regional.en;
    }
  }]);

  return KingTableBuilder;
}(_events2.default);

exports.default = KingTableBuilder;

},{"../../scripts/components/events":3,"../../scripts/tables/kingtable":30}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _string = require("../../scripts/components/string");

var _string2 = _interopRequireDefault(_string);

var _html = require("../../scripts/data/html");

var _kingtable = require("../../scripts/tables/kingtable.builder");

var _kingtable2 = _interopRequireDefault(_kingtable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * KingTable base HTML builder.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Base class for all HTML builders.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var KingTableBaseHtmlBuilder = function (_KingTableBuilder) {
  _inherits(KingTableBaseHtmlBuilder, _KingTableBuilder);

  function KingTableBaseHtmlBuilder() {
    _classCallCheck(this, KingTableBaseHtmlBuilder);

    return _possibleConstructorReturn(this, (KingTableBaseHtmlBuilder.__proto__ || Object.getPrototypeOf(KingTableBaseHtmlBuilder)).apply(this, arguments));
  }

  _createClass(KingTableBaseHtmlBuilder, [{
    key: "getItemAttrObject",


    /**
     * Returns an attribute object for an HTML element related to an item.
     * 
     * @param {int} ix 
     */
    value: function getItemAttrObject(ix, item) {
      var o = this.options,
          deco = o && o.itemDecorator;
      var attr = {
        "class": "kt-item",
        "data-item-ix": ix // item index among currently displayed items
      };
      if (deco) {
        var re = deco.call(this, item);
        // TODO: merge class or css option
        return _utils2.default.extend(attr, re);
      }
      return attr;
    }

    /**
     * Produces a fragment of HTML to highligh a pattern inside a text.
     *
     * @param {string} text: text from which to produce an HTML fragment.
     * @param {RegExp} pattern: search pattern.
     */

  }, {
    key: "highlight",
    value: function highlight(text, pattern) {
      if (!text) return "";
      if (!(pattern instanceof RegExp)) {
        // obtain from table
        var table = this.table;
        var pattern = table.searchText ? table.filters.getRuleByKey("search").value : null;
        if (!pattern) return text;
      }

      var diacritics = _string2.default.findDiacritics(text);
      var hasDiacritics = diacritics.length,
          textWithoutDiacritics;

      if (hasDiacritics) {
        // remove diacritics before finding matches
        textWithoutDiacritics = _string2.default.normalize(text);
      } else {
        textWithoutDiacritics = text;
      }
      // find all matches at their index, this is required to properly escape html characters
      var matches = [];
      textWithoutDiacritics.replace(pattern, function (value) {
        var index = arguments[arguments.length - 2];
        // NB: if the string contained diacritics, we need to restore
        // only those that appeared in the same place of the original string
        matches.push({
          i: index,
          val: hasDiacritics ? _string2.default.restoreDiacritics(value, diacritics, index) : value // put back diacritics where they were
        });
      });

      var s = "",
          j = 0,
          m,
          val;
      for (var i = 0, l = matches.length; i < l; i++) {
        m = matches[i];
        val = m.val;
        var portion = text.substring(j, m.i);
        s += (0, _html.escapeHtml)(portion); // escape the portion that is outside of the highlight
        j = m.i + val.length;
        s += "<span class=\"kt-search-highlight\">" + (0, _html.escapeHtml)(val) + "</span>";
      }
      if (j < text.length) {
        s += (0, _html.escapeHtml)(text.substr(j));
      }
      return s;
    }
  }]);

  return KingTableBaseHtmlBuilder;
}(_kingtable2.default);

exports.default = KingTableBaseHtmlBuilder;

},{"../../scripts/components/string":7,"../../scripts/data/html":12,"../../scripts/tables/kingtable.builder":27,"../../scripts/utils":34}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _html = require("../../scripts/data/html");

var _kingtableHtmlBase = require("../../scripts/tables/kingtable.html.base.builder");

var _kingtableHtmlBase2 = _interopRequireDefault(_kingtableHtmlBase);

var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _dom = require("../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * KingTable bare HTML builder.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Renders tabular data in HTML format, without event handlers.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Suitable for web pages and emails.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SPACE = " ";

var KingTableHtmlBuilder = function (_KingTableBaseHtmlBui) {
  _inherits(KingTableHtmlBuilder, _KingTableBaseHtmlBui);

  /**
   * Creates a new instance of KingTableHtmlBuilder associated with the given table.
   */
  function KingTableHtmlBuilder(table) {
    _classCallCheck(this, KingTableHtmlBuilder);

    var _this = _possibleConstructorReturn(this, (KingTableHtmlBuilder.__proto__ || Object.getPrototypeOf(KingTableHtmlBuilder)).call(this, table));

    _this.options = _utils2.default.extend({}, table ? table.options : null);
    _this.setListeners();
    return _this;
  }

  /**
   * Global options for every KingTableHtmlBuilder.
   */


  _createClass(KingTableHtmlBuilder, [{
    key: "setListeners",


    /**
     * Sets listeners for the given table.
     */
    value: function setListeners() {
      var self = this;
      var table = self.table;
      if (!table || !table.element) return self;

      self.listenTo(table, {
        "fetching:data": function fetchingData() {
          self.loadingHandler();
        },
        "fetched:data": function fetchedData() {
          self.unsetLoadingHandler();
        },
        "fetch:fail": function fetchFail() {
          self.unsetLoadingHandler().display(self.errorView());
        },
        "no-results": function noResults() {
          self.unsetLoadingHandler().display(self.emptyView());
        }
      });
    }

    /**
     * Gets auto-generated fields by options.
     */

  }, {
    key: "getGeneratedFields",
    value: function getGeneratedFields() {
      var o = this.options,
          reg = this.getReg(),
          detailRoute = o.detailRoute,
          a = [],
          goToDetails = reg.goToDetails;

      if (detailRoute) {
        if (!/\/$/.test(detailRoute)) {
          detailRoute = o.detailRoute = detailRoute + "/";
        }
        // Following could cause exception if id property cannot be determined automatically
        var idProperty = this.table.getIdProperty();

        a.push({
          name: "details-link",
          html: function html(item) {
            var itemDetailRoute = detailRoute + item[idProperty];
            return "<a class='kt-details-link' href='" + itemDetailRoute + "'>" + goToDetails + "</a>";
          }
        });
      }
      return a;
    }

    /**
     * Gets the fields to be displayed.
     * Fields comprises objects properties and extra information for every item.
     */

  }, {
    key: "getFields",
    value: function getFields() {
      var table = this.table;
      var fields = _utils2.default.clone(table.columns),
          o = this.options,
          itemCount = o.itemCount,
          generatedFields = this.getGeneratedFields(),
          countField = itemCount ? {
        name: "ε_row",
        displayName: "#"
      } : null;

      if (countField) {
        fields.unshift(countField);
      }

      // allow extending the table with extra fields
      var extraFields = o.fields;
      if (extraFields) {
        if (_utils2.default.isFunction(extraFields)) {
          extraFields = extraFields.call(this, fields);
        }
        fields = generatedFields.concat(extraFields.concat(fields));
      } else {
        fields = generatedFields.concat(fields);
      }
      return fields;
    }

    /**
     * Builds the given instance of KingTable in HTML.
     */

  }, {
    key: "build",
    value: function build() {
      var self = this;
      var table = self.table;
      var data = table.getData({
        format: true,
        hide: false
      });
      if (!data || !data.length) {
        return self.display(self.emptyView());
      }
      var fields = self.getFields();
      var caption = self.buildCaption();
      var view = self.buildView(fields, data);
      var root = self.buildRoot(caption, view);
      self.display(root);
    }

    /**
     * Builds a root virtual element for the given table, with given
     * table children.
     */

  }, {
    key: "buildRoot",
    value: function buildRoot(caption, view) {
      var table = this.table;
      var rootAttr = {
        "class": "king-table-region"
      };
      if (table.id) {
        rootAttr.id = table.id;
      }
      return new _html.VHtmlElement("div", rootAttr, [caption, view]);
    }

    /**
     * Builds a default view.
     */

  }, {
    key: "buildView",
    value: function buildView(fields, data) {
      var table = this.table;
      return new _html.VHtmlElement("table", {
        "class": "king-table"
      }, [this.buildHead(fields), this.buildBody(fields, data)]);
    }

    /**
     * Builds a header.
     */

  }, {
    key: "buildHead",
    value: function buildHead(fields) {
      var table = this.table;
      var row = new _html.VHtmlElement("tr", {}, _utils2.default.map(_utils2.default.values(fields), function (prop) {
        if (prop.hidden || prop.secret) {
          return; // skip
        }
        return new _html.VHtmlElement("th", { "class": prop.css }, new _html.VTextElement(prop.displayName));
      }));
      return new _html.VHtmlElement("thead", { "class": "king-table-head" }, row);
    }

    /**
     * Builds a table body in HTML from given table and data.
     */

  }, {
    key: "buildBody",
    value: function buildBody(fields, data) {
      var _this2 = this;

      var table = this.table,
          builder = table.builder,
          formattedSuffix = table.options.formattedSuffix,
          searchPattern = table.searchText ? table.filters.getRuleByKey("search").value : null,
          autoHighlight = table.options.autoHighlightSearchProperties;
      // at every table build, assign an id to the represented item
      var ix = -1;
      var rows = _utils2.default.map(data, function (item) {
        ix += 1;
        item.__ix__ = ix;
        var cells = [],
            x,
            col;
        for (var i = 0, l = fields.length; i < l; i++) {
          col = fields[i];
          x = col.name;
          if (col.hidden || col.secret) {
            continue;
          }
          var formattedProp = x + formattedSuffix;

          var valueEl,
              value = _utils2.default.has(item, formattedProp) ? item[formattedProp] : item[x];

          // does the column define an html resolver?
          if (col.html) {
            if (!_utils2.default.isFunction(col.html)) {
              (0, _raise2.default)(24, "Invalid 'html' option for property, it must be a function.");
            }
            // NB: it is responsibility of the user of the library to escape HTML characters that need to be escaped
            var html = col.html.call(builder, item, value);
            valueEl = new _html.VHtmlFragment(html || "");
          } else {
            if (value === null || value === undefined || value === "") {
              valueEl = new _html.VTextElement("");
            } else {
              // is a search active?
              if (searchPattern && autoHighlight && _utils2.default.isString(value)) {
                // an html fragment is required to display an highlighted value
                valueEl = new _html.VHtmlFragment(builder.highlight(value, searchPattern));
              } else {
                valueEl = new _html.VTextElement(value);
              }
            }
          }

          cells.push(new _html.VHtmlElement("td", col ? {
            "class": col.css || col.name
          } : {}, valueEl));
        }
        return new _html.VHtmlElement("tr", _this2.getItemAttrObject(ix, item), cells);
      });
      return new _html.VHtmlElement("tbody", { "class": "king-table-body" }, rows);
    }

    /**
     * Returns a caption element for the given table.
     */

  }, {
    key: "buildCaption",
    value: function buildCaption() {
      var table = this.table;
      var caption = table.options.caption;
      var paginationInfo = KingTableHtmlBuilder.options.paginationInfo ? this.buildPaginationInfo() : null;
      return caption || paginationInfo ? new _html.VHtmlElement("div", {
        "class": "king-table-caption"
      }, [caption ? new _html.VHtmlElement("span", {}, new _html.VTextElement(caption)) : null, paginationInfo ? caption ? new _html.VHtmlElement("br") : null : null, paginationInfo]) : null;
    }

    /**
     * Returns pagination information about the given table.
     */

  }, {
    key: "buildPaginationInfo",
    value: function buildPaginationInfo() {
      var table = this.table;
      var data = table.pagination,
          reg = this.getReg(),
          page = data.page,
          totalPageCount = data.totalPageCount,
          resultsPerPage = data.resultsPerPage,
          firstObjectNumber = data.firstObjectNumber,
          lastObjectNumber = data.lastObjectNumber,
          totalItemsCount = data.totalItemsCount,
          dataAnchorTime = table.getFormattedAnchorTime(),
          isNum = _utils2.default.isNumber;
      // render simply pagination information,
      // since event handlers are out of the scope of this class
      var s = "",
          sep = " - ";
      if (isNum(page)) {
        s += reg.page + SPACE + page;

        if (isNum(totalPageCount) && totalPageCount > 0) {
          s += SPACE + reg.of + SPACE + totalPageCount;
        }

        if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
          s += sep + reg.results + (" " + firstObjectNumber + " - " + lastObjectNumber);
          if (isNum(totalItemsCount)) {
            s += " " + reg.of + " - " + totalItemsCount;
          }
        }
      }
      if (dataAnchorTime && table.options.showAnchorTimestamp) {
        s += sep + (reg.anchorTime + " " + dataAnchorTime);
      }
      var paginationInfo = new _html.VHtmlElement("span", {
        "class": "pagination-info"
      }, new _html.VTextElement(s));
      return paginationInfo;
    }
  }, {
    key: "emptyView",
    value: function emptyView(bare) {
      var reg = this.getReg();
      var el = new _html.VHtmlElement("div", { "class": "king-table-empty" }, new _html.VHtmlElement("span", 0, new _html.VTextElement(reg.noData)));
      return bare ? el : this.singleLine(this.table, el);
    }
  }, {
    key: "errorView",
    value: function errorView(message) {
      if (!message) {
        message = this.getReg().errorFetchingData;
      }
      return this.singleLine(this.table, new _html.VHtmlFragment("<div class=\"king-table-error\">\n      <span class=\"message\">\n        <span>" + message + "</span>\n        <span class=\"oi\" data-glyph=\"warning\" aria-hidden=\"true\"></span>\n      </span>\n    </div>"));
    }
  }, {
    key: "loadingView",
    value: function loadingView() {
      var table = this.table;
      var reg = this.getReg();
      var caption = this.buildCaption();
      caption.children.push(new _html.VHtmlElement("div", {
        "class": "loading-info"
      }, [new _html.VHtmlElement("span", {
        "class": "loading-text"
      }, new _html.VTextElement(reg.loading)), new _html.VHtmlElement("span", {
        "class": "mini-loader"
      })]));
      return this.buildRoot([caption]);
    }

    /**
     * Displays a built table.
     */

  }, {
    key: "display",
    value: function display(built) {
      var table = this.table;
      // If a table has an element, assume that is a DOM element;
      if (!_utils2.default.isString(built)) built = built.toString();
      //
      // NB: aside from this piece of code, this class is abstracted
      // from DOM manipulation;
      // If a table has an element, assume that is a DOM element;
      //
      var element = table.element;
      if (element) {
        //
        // NB: this class does not set any event handler,
        // hence does not try to unset any event handler when removing an element.
        //
        // a custom event is fired, so the user of the library can unset any event added
        // by other means (e.g. vanilla JavaScript or jQuery)
        //
        element.classList.add("king-table");
        table.emit("empty:element", element);
        while (element.hasChildNodes()) {
          element.removeChild(element.lastChild);
        }
        element.innerHTML = built;
      }
    }

    /**
     * Returns an information for the table in a single line, including
     * table caption and pagination information, if available.
     */

  }, {
    key: "singleLine",
    value: function singleLine(line) {
      var table = this.table;
      var caption = this.buildCaption();
      caption.children.push(new _html.VHtmlElement("br"), new _html.VHtmlElement("div", {
        "class": "loading-info"
      }, _utils2.default.isString(line) ? new _html.VTextElement(line) : line));
      return this.buildRoot([caption]);
    }
  }, {
    key: "loadingHandler",
    value: function loadingHandler() {
      var self = this,
          table = self.table;
      self.unsetLoadingHandler();

      var delayInfo = table.hasData() ? KingTableHtmlBuilder.options.loadInfoDelay : 0;
      // display a loading information, but only if waiting for more than n milliseconds
      self.showLoadingTimeout = setTimeout(function () {
        if (!table.loading) {
          return self.unsetLoadingHandler();
        }
        self.display(self.loadingView());
      }, delayInfo);
    }
  }, {
    key: "unsetLoadingHandler",
    value: function unsetLoadingHandler() {
      clearTimeout(this.showLoadingTimeout);
      this.showLoadingTimeout = null;
      return this;
    }

    /**
     * Disposes of this KingTableHtmlBuilder.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      var table = this.table;
      var element = table.element;
      if (element) {
        _dom2.default.empty(element);
      }
      this.stopListening(this.table);
      this.table = null;
      delete this.options;
    }
  }], [{
    key: "options",
    get: function get() {
      return {
        handleLoadingInfo: true, // whether to display loading information (suitable for console applications)
        loadInfoDelay: 500, // how many milliseconds should wait, before displaying the "Loading..." information
        paginationInfo: true // whether to show pagination info or not
      };
    }
  }]);

  return KingTableHtmlBuilder;
}(_kingtableHtmlBase2.default);

exports.default = KingTableHtmlBuilder;

},{"../../scripts/data/html":12,"../../scripts/dom":19,"../../scripts/raise":26,"../../scripts/tables/kingtable.html.base.builder":28,"../../scripts/utils":34}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * KingTable core class.
                                                                                                                                                                                                                                                                               * This class is responsible of fetching data, handling responses,
                                                                                                                                                                                                                                                                               * configuring columns.
                                                                                                                                                                                                                                                                               * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                               * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Licensed under the MIT license:
                                                                                                                                                                                                                                                                               * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                               */


var _kingtableText = require("../../scripts/tables/kingtable.text.builder");

var _kingtableText2 = _interopRequireDefault(_kingtableText);

var _kingtableHtml = require("../../scripts/tables/kingtable.html.builder");

var _kingtableHtml2 = _interopRequireDefault(_kingtableHtml);

var _kingtableHtmlBase = require("../../scripts/tables/kingtable.html.base.builder");

var _kingtableHtmlBase2 = _interopRequireDefault(_kingtableHtmlBase);

var _kingtableRhtml = require("../../scripts/tables/kingtable.rhtml.builder");

var _kingtableRhtml2 = _interopRequireDefault(_kingtableRhtml);

var _kingtable = require("../../scripts/tables/kingtable.regional");

var _kingtable2 = _interopRequireDefault(_kingtable);

var _events = require("../../scripts/components/events");

var _events2 = _interopRequireDefault(_events);

var _objectAnalyzer = require("../../scripts/data/object-analyzer");

var _objectAnalyzer2 = _interopRequireDefault(_objectAnalyzer);

var _sanitizer = require("../../scripts/data/sanitizer");

var _sanitizer2 = _interopRequireDefault(_sanitizer);

var _filtersManager = require("../../scripts/filters/filters-manager");

var _filtersManager2 = _interopRequireDefault(_filtersManager);

var _paginator = require("../../scripts/filters/paginator");

var _paginator2 = _interopRequireDefault(_paginator);

var _ajax = require("../../scripts/data/ajax");

var _ajax2 = _interopRequireDefault(_ajax);

var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _string = require("../../scripts/components/string");

var _string2 = _interopRequireDefault(_string);

var _regex = require("../../scripts/components/regex");

var _regex2 = _interopRequireDefault(_regex);

var _number = require("../../scripts/components/number");

var _number2 = _interopRequireDefault(_number);

var _date = require("../../scripts/components/date");

var _date2 = _interopRequireDefault(_date);

var _array = require("../../scripts/components/array");

var _array2 = _interopRequireDefault(_array);

var _csv = require("../../scripts/data/csv");

var _csv2 = _interopRequireDefault(_csv);

var _json = require("../../scripts/data/json");

var _json2 = _interopRequireDefault(_json);

var _xml = require("../../scripts/data/xml");

var _xml2 = _interopRequireDefault(_xml);

var _file = require("../../scripts/data/file");

var _file2 = _interopRequireDefault(_file);

var _lru = require("../../scripts/data/lru");

var _lru2 = _interopRequireDefault(_lru);

var _memstore = require("../../scripts/data/memstore");

var _memstore2 = _interopRequireDefault(_memstore);

var _exceptions = require("../../scripts/exceptions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VERSION = "2.0.0";

var DEFAULTS = {

  // Table language.
  lang: "en",

  // Table caption.
  caption: null,

  // Whether to display the item number or not.
  itemCount: true,

  // Default schema for each table column.
  columnDefault: {
    name: "",
    type: "text",
    sortable: true,
    allowSearch: true,
    hidden: false
    // secret: undefined
    // format: undefined (allows to define formatting function) 
  },

  httpMethod: "GET", // method to use to fetch data, when using AJAX requests

  // Whether to allow search, or not.
  allowSearch: true,

  // Minimum number of characters inside the search field to trigger a search.
  minSearchChars: 3,

  // Default first page.
  page: 1,

  // Default page size
  resultsPerPage: 30,

  // Suffix to use for formatted properties
  formattedSuffix: "_(formatted)",

  // Permits to specify whether the collection is fixed or not
  // default changes if the table is instantiated passing a collection
  fixed: undefined,

  // Permits to specify an initial search when generating the table for the first time
  search: "",

  // Permits to specify how sort by information must be transmitted
  sortByFormatter: _array2.default.humanSortBy,

  // Permits to specify the search mode to use during live search
  // FullString, SplitWords or SplitSentences
  searchMode: "FullString",

  // Default export formats.
  exportFormats: [{
    name: "Csv",
    format: "csv",
    type: "text/csv",
    cs: true // client side
  }, {
    name: "Json",
    format: "json",
    type: "application/json",
    cs: true // client side
  }, {
    name: "Xml",
    format: "xml",
    type: "text/xml",
    cs: true // client side
  }],

  // Whether to prettify xml when exporting, or not.
  prettyXml: true,

  // Allows to specify csv serialization options
  csvOptions: {},

  // Whether to include hidden properties in the export; or not.
  exportHiddenProperties: false,

  // Kind of builder.
  builder: "rhtml",

  // Whether to store data returned by `getTableData` function, or not.
  // If true, data is stored in memory and in data storage for later use.
  storeTableData: true,

  // The LRU cache size (how many items per key can be stored).
  lruCacheSize: 10,

  // The LRU cache max age in milliseconds - default 15 minutes; (<= 0 for no expiration).
  lruCacheMaxAge: 60 * 1e3 * 15,

  // Whether the anchor timestamp should be shown or not
  showAnchorTimestamp: true,

  collectionName: "data",

  // When text search is used, its sort logic takes precedence over the sort criteria defined clicking on columns.
  searchSortingRules: true,

  // The name of the property that should be used as id.
  idProperty: null,

  // Whether searched values should be automatically highlighted
  autoHighlightSearchProperties: true,

  // Value to use for represent null or empty values.
  emptyValue: ""
};

var BUILDERS = {
  "text": _kingtableText2.default,
  "html": _kingtableHtml2.default,
  "rhtml": _kingtableRhtml2.default
};

var UNDEFINED = "undefined";

if ((typeof Promise === "undefined" ? "undefined" : _typeof(Promise)) == UNDEFINED) {
  var fixed = false;
  // check if ES6Promise was loaded
  if ((typeof ES6Promise === "undefined" ? "undefined" : _typeof(ES6Promise)) != UNDEFINED && ES6Promise.polyfill) {
    try {
      ES6Promise.polyfill();
      fixed = (typeof Promise === "undefined" ? "undefined" : _typeof(Promise)) != UNDEFINED;
    } catch (ex) {
      // ignore
    }
  }
  if (!fixed) {
    (0, _raise2.default)(1, "Missing implementation of Promise (missing dependency)");
  }
}

var KingTable = function (_EventsEmitter) {
  _inherits(KingTable, _EventsEmitter);

  /**
   * Creates a new instance of KingTable with the given options and static properties.
   *
   * @param options: options to use for this instance of KingTable.
   * @param staticProperties: properties to override in the instance of KingTable.
   */
  function KingTable(options, staticProperties) {
    _classCallCheck(this, KingTable);

    var _this = _possibleConstructorReturn(this, (KingTable.__proto__ || Object.getPrototypeOf(KingTable)).call(this));

    options = options || {};
    var self = _this;
    //
    // The second argument allows to override properties of the KingTable instance.
    //
    if (staticProperties) {
      _utils2.default.extend(self, staticProperties);
    }
    //
    // Base properties are automatically set from the first argument into the instance
    //
    _utils2.default.each(self.baseProperties(), function (x) {
      if (_utils2.default.has(options, x)) {
        self[x] = options[x];
        delete options[x];
      }
    });
    var sortBy = options.sortBy;
    if (_utils2.default.isString(sortBy)) {
      self.sortCriteria = _array2.default.getSortCriteria(sortBy);
    }

    // Set options
    options = self.options = _utils2.default.extend({}, KingTable.defaults, options);
    self.loading = false;
    self.init(options, staticProperties);
    return _this;
  }

  /**
   * An array of property names, that can be overridden using the first argument (options) of KingTable constructor,
   * instead of using the second argument, which allows to override any property in an instance of KingTable.
   * Properties outside of this array and passed as first argument, are instead put in the "options" property of a KingTable.
   */


  _createClass(KingTable, [{
    key: "baseProperties",
    value: function baseProperties() {
      return ["id", // allows to set an id to the kingtable
      "onInit", // function to execute after initialization
      "element", // allows to specify the table element
      "context", // table context
      "fixed", //
      "prepareData", //
      "getExtraFilters", //
      "getTableData", // function to get required data to render the table
      "afterRender", // function to execute after render
      "beforeRender", // function to execute before render
      "numberFilterFormatter", // function to format numbers for filters
      "dateFilterFormatter" // function to format dates for filters
      ];
    }
  }, {
    key: "init",


    /**
     * Initializes an instance of KingTable.
     */
    value: function init(options) {
      var self = this;
      self.cache = {};
      self.disposables = [];
      self.analyst = new _objectAnalyzer2.default();
      self.sanitizer = new _sanitizer2.default();
      self.filters = new _filtersManager2.default({}, {
        context: self
      });

      var data = options.data;
      if (data) {
        if (!_utils2.default.isArray(data)) (0, _raise2.default)(3, "Data is not an array");
        // KingTable initialized passing an array of items,
        // unless specified otherwise, assume that it is a fixed table
        // (i.e. a table that doesn't require server side pagination)

        // Apply the same logic that would be applied if data was coming from
        // server side (e.g. parsing of dates)
        data = _json2.default.clone(data);
        self.setFixedData(data);
      }
      // NB: it is important to load settings after setting data;
      // because if client side search is used, search filter requires search properties
      self.loadSettings(); // load settings from storage, if applicable
      self.setPagination();

      if (!self.fixed) {
        // if the table collection is not fixed;
        // then there is no need to perform search operations on the client side;
        self.filters.searchDisabled = true;
      }

      // initialize the current builder
      // this is required to allow displaying loading information
      self.setBuilder(options.builder).onInit();
      return self;
    }

    /**
     * Returns the translations for the current language configuration.
     */

  }, {
    key: "getReg",
    value: function getReg() {
      var lang = this.options.lang;
      if (!lang) (0, _raise2.default)(15, "Missing language option (cannot be null or falsy)");
      var o = KingTable.regional[lang];
      if (!o) (0, _raise2.default)(15, "Missing regional for language " + lang);
      return o;
    }

    /**
     * Sets the builder handler.
     *
     * @param {string} name: builder type.
     */

  }, {
    key: "setBuilder",
    value: function setBuilder(name) {
      if (!name) (0, _raise2.default)(8, "name cannot be null or empty");
      var self = this,
          o = self.options,
          builders = KingTable.builders;
      if (self.builder) {
        self.disposeOf(self.builder);
      }
      var builderType = builders[name];
      if (!builderType) {
        (0, _raise2.default)(10, "Missing handler for builder: " + name);
      }
      var builder = new builderType(self);
      self.builder = builder;
      self.disposables.push(builder);
      return self;
    }

    /**
     * Applies client side pagination to an array, on the basis of current configuration.
     */

  }, {
    key: "getSubSet",
    value: function getSubSet(a) {
      var pagination = this.pagination;
      var from = (pagination.page - 1) * pagination.resultsPerPage,
          to = pagination.resultsPerPage + from;
      return a.slice(from, to);
    }

    /**
     * Sets the pagination data inside the instance of KingTable.
     *
     * @returns {KingTable}
     */

  }, {
    key: "setPagination",
    value: function setPagination() {
      var self = this,
          data = self.data,
          options = self.options,
          page = options.page,
          resultsPerPage = options.resultsPerPage,
          totalItemsCount = options.totalItemsCount || (data ? data.length : 0);
      if (self.pagination) {
        self.disposeOf(self.pagination);
      }
      var pagination = self.pagination = new _paginator2.default({
        page: page,
        resultsPerPage: resultsPerPage,
        totalItemsCount: totalItemsCount,
        onPageChange: function onPageChange() {
          self.render();
        }
      });
      self.disposables.push(pagination);
      return self;
    }

    /**
     * Updates the pagination, according to the total count of items
     * that satisfy the current filters.
     *
     * @param totalItemsCount: the total count of items that satisfy the current filters (except page number)
     * @returns {KingTable}
     */

  }, {
    key: "updatePagination",
    value: function updatePagination(totalItemsCount) {
      var self = this;
      if (!self.pagination) self.setPagination();
      if (!_utils2.default.isNumber(totalItemsCount)) throw "invalid type";
      var pagination = self.pagination;
      pagination.setTotalItemsCount(totalItemsCount);
      // results count change
      _utils2.default.ifcall(self.onResultsCountChange, self);
      self.trigger("change:pagination");
      return self;
    }

    /**
     * Function called when initialization is completed.
     * Extensibility point.
     */

  }, {
    key: "onInit",
    value: function onInit() {}

    /**
     * Returns a value indicating whether this instance of KingTable has data or
     * not.
     */

  }, {
    key: "hasData",
    value: function hasData() {
      var data = this.data;
      return !!(data && data.length);
    }

    /**
     * Returns the structure of the collection items.
     * By default, it is assumed that all items inside the collection have the
     * same structure.
     */

  }, {
    key: "getItemStructure",
    value: function getItemStructure() {
      // analyze whole collection, if necessary, only the first item if possible
      // if necessary == if any property is nullable and it's necessary to check
      // multiple items until a certain value is found (e.g. nullable numbers, dates)
      return this.analyst.describe(this.data, { lazy: true });
    }

    /**
     * Initializes the columns information for this KingTable.
     */

  }, {
    key: "initColumns",
    value: function initColumns() {
      var n = "columnsInitialized",
          self = this;
      if (self[n] || !self.hasData()) return self;
      self[n] = true;
      var columns = [];

      // gets the first object of the table as starting point
      var objSchema = self.getItemStructure();
      var x,
          properties = [];
      for (x in objSchema) {
        objSchema[x] = { name: x, type: objSchema[x] };
        properties.push(x);
      }
      var optionsColumns = self.options.columns;

      // does the user specified columns in constructor options?
      if (optionsColumns) {
        var i = 0,
            name;
        for (x in optionsColumns) {
          var col = optionsColumns[x];
          if (_utils2.default.isPlainObject(optionsColumns)) {
            name = x;
          } else if (_utils2.default.isArray(optionsColumns)) {
            if (_utils2.default.isString(col)) {
              (0, _raise2.default)(16, "invalid columns option " + col);
            }
            name = col.name;
            if (!name) {
              (0, _raise2.default)(17, "missing name in column option");
            }
          } else {
            (0, _raise2.default)(16, "invalid columns option");
          }
          // is the name inside the object schema?
          if (_utils2.default.indexOf(properties, name) == -1) {
            (0, _raise2.default)(18, "A column is defined with name \"" + name + "\", but this property was not found among object properties. Items properties are: " + properties.join(', '));
          }

          // support defining only the columns by their display name (to save programmers's time)
          if (_utils2.default.isString(col)) {
            // normalize
            col = optionsColumns[x] = { displayName: col };
          }
          if (_utils2.default.isString(col.name)) {
            // if a name property is defined, replace it with the key `displayName`,
            // since the KingTable requires the name to be equal to the actual property name.
            col.displayName = col.name;
            delete col.name;
          }
          objSchema[name] = _utils2.default.extend(objSchema[name], col);

          var colPos = col.position;
          if (_utils2.default.isNumber(colPos)) {
            objSchema[name].position = colPos;
          } else {
            objSchema[name].position = i;
          }
          i++;
        }
      }

      for (x in objSchema) {
        var base = { name: x },
            schema = objSchema[x],
            type = schema.type;
        if (!type) schema.type = type = "string";
        // extend with table column default options
        var col = _utils2.default.extend({}, self.options.columnDefault, base, schema);
        // assign a unique id to this column object:
        col.cid = _utils2.default.uniqueId("col");
        type = _utils2.default.lower(type);
        //set default properties by field type
        var a = KingTable.Schemas.DefaultByType;
        if (_utils2.default.has(a, type)) {
          //default schema by type
          var def = a[type];
          if (_utils2.default.isFunction(def)) def = def.call(self, schema, objSchema);
          _utils2.default.extend(base, def);
        }
        //set default properties by name
        a = KingTable.Schemas.DefaultByName;
        if (_utils2.default.has(a, x)) {
          //default schema by name
          _utils2.default.extend(base, a[x]);
        }

        _utils2.default.extend(col, base);

        if (optionsColumns) {
          //the user esplicitly defined some column options
          //columns are defined in the options, so take their defaults, supporting both arrays or plain objects
          var definedSchema = _utils2.default.isArray(optionsColumns) ? _utils2.default.find(optionsColumns, function (o) {
            return o.name == x;
          }) : optionsColumns[x];
          if (definedSchema) {
            //some options are explicitly defined for a field: extend existing schema with column defaults
            _utils2.default.extend(col, definedSchema);
          }
        }
        // set css name for column
        n = "css";
        if (!_utils2.default.isString(col[n])) {
          col[n] = _string2.default.kebabCase(col.name);
        }

        if (!_utils2.default.isString(col.displayName)) col.displayName = col.name;
        columns.push(col);
      }

      // if the user defined the columns inside the options;
      // automatically set their position on the basis of their index
      var p = "position";
      if (optionsColumns) {
        var i = 0;
        for (var x in optionsColumns) {
          var col = _utils2.default.find(columns, function (o) {
            return o.name == x;
          });
          if (col && !_utils2.default.has(col, p)) col[p] = i;
          i++;
        }
      }

      // restore columns information from cache
      //
      var columnsData = self.getCachedColumnsData();
      var h = "hidden";
      if (columnsData) {
        _utils2.default.each(columnsData, function (c) {
          var col = _utils2.default.find(columns, function (o) {
            return o.name == c.name;
          });
          if (col) {
            col[p] = c[p]; // position
            col[h] = c[h]; // hidden
          }
        });
      }
      self.columns = columns;
      // Now columns information is initialized:
      // it may be necessary to set a search filter, for fixed tables
      if (self.fixed && self.searchText) {
        self.setSearchFilter(self.searchText, true);
      }
      return self;
    }
  }, {
    key: "storePreference",
    value: function storePreference(plainKey, value) {
      var store = this.getFiltersStore();
      if (!store) return false;
      var key = this.getMemoryKey(plainKey);
      store.setItem(key, value);
    }
  }, {
    key: "getPreference",
    value: function getPreference(plainKey) {
      var store = this.getFiltersStore();
      if (!store) return;
      var key = this.getMemoryKey(plainKey);
      return store.getItem(key);
    }

    /**
     * Returns the storage used to store filters settings.
     */

  }, {
    key: "getFiltersStore",
    value: function getFiltersStore() {
      return localStorage;
    }

    /**
     * Returns the storage used to store data.
     */

  }, {
    key: "getDataStore",
    value: function getDataStore() {
      return sessionStorage;
    }

    /**
     * Loads settings from configured storage.
     */

  }, {
    key: "loadSettings",
    value: function loadSettings() {
      if (this.getTableData) {
        // table requires data: try to restore from cache
        this.restoreTableData();
      }
      return this.restoreFilters();
    }

    /**
     * Restore filters from cache.
     */

  }, {
    key: "restoreFilters",
    value: function restoreFilters() {
      var self = this,
          options = self.options;

      // restore filters from storage
      var filtersStore = self.getFiltersStore();
      if (!filtersStore) return self;

      var key = self.getMemoryKey("filters");
      var filtersCache = filtersStore.getItem(key);
      if (!filtersCache) return self;

      try {
        var filters = _json2.default.parse(filtersCache);
        var basicFilters = "page size sortBy search timestamp".split(" ");
        self.trigger("restore:filters", filters);
        // restore table inner filters
        _utils2.default.each(basicFilters, function (x) {
          // size maps to results per page! (because table 'size' would be unclear)
          if (x == "search") {
            if (self.validateForSeach(filters[x])) {
              self.setSearchFilter(filters[x], true);
            }
          } else if (x == "sortBy") {
            self.sortCriteria = filters[x];
          } else if (x == "size") {
            options.resultsPerPage = filters[x];
          } else {
            options[x] = filters[x];
          }
        });
        // call a function and fire an event, so the user of the library can restore
        // custom, table specific filters.
        var extraFilters = _utils2.default.minus(filters, basicFilters);
        if (!_utils2.default.isEmpty(extraFilters)) {
          self.restoreExtraFilters(filters);
        }
      } catch (ex) {
        // deserialization failed: remove item from cache
        filtersStore.removeItem(key);
      }
      return self;
    }

    /**
     * Returns the current filters of this KingTable.
     * Filters include page number, page size, order by (property name); sort criteria,
     * free text search, timestamp of the first time the table was rendered (this timestamp is updated when the user clicks on the refresh button).
     */

  }, {
    key: "getFilters",
    value: function getFilters() {
      var self = this,
          pagination = self.pagination;
      // NB: this function disallow overriding basic filters (page number, size, sortBy, search, timestamp);
      // using the following order of elements:
      var anchorTime = "anchorTime";
      if (_utils2.default.isUnd(self[anchorTime])) {
        // set anchor time: it can be used for fast growing tables.
        // this must be fetched before caching filters
        self[anchorTime] = new Date();
      }
      return _utils2.default.extend({}, self.getExtraFilters(), {
        page: pagination.page, // page number
        size: pagination.resultsPerPage, // page size; i.e. results per page
        sortBy: self.sortCriteria || null, // sort criteria (one or more properties)
        search: self.searchText || null,
        timestamp: self.anchorTime || null // the timestamp of the first time the table was rendered
      });
    }

    /**
     * Returns the current filters of this KingTable, including a caching mechanism (set only).
     */

  }, {
    key: "getFiltersSetCache",
    value: function getFiltersSetCache() {
      var self = this,
          filters = self.getFilters(),
          store = self.getFiltersStore();
      if (store) {
        // store current filters set; this is used to restore
        // filters upon reload or page refresh
        var key = self.getMemoryKey("filters");
        self.trigger("store:filters", filters);
        store.setItem(key, _json2.default.compose(filters));
      }
      return filters;
    }

    /**
     * Function that allows to return extra filters for a specific instance of KingtTable.
     * This function is used to collect filters that relates to a specific context, and merge them with
     * table basic filters (page number, page size, sort order).
     * Extensibility point.
     *
     * @return {object}
     */

  }, {
    key: "getExtraFilters",
    value: function getExtraFilters() {}

    /**
     * Function that allows to restore extra filters from cache, for a specific instance of KingtTable.
     * This function is used restore cached filters in the table context, so they can be read when fetching a collection of items.
     * Extensibility point.
     *
     * @return {object}
     */

  }, {
    key: "restoreExtraFilters",
    value: function restoreExtraFilters(filters) {}

    /**
     * Function to run before rendering.
     * Extensibility point.
     */

  }, {
    key: "beforeRender",
    value: function beforeRender() {}

    /**
     * Function to run after rendering.
     * Extensibility point.
     */

  }, {
    key: "afterRender",
    value: function afterRender() {}

    /**
     * Function to run when an AJAX request starts.
     * Extensibility point.
     */

  }, {
    key: "onFetchStart",
    value: function onFetchStart() {}

    /**
     * Function to run when an AJAX request ends positively.
     * Extensibility point.
     */

  }, {
    key: "onFetchDone",
    value: function onFetchDone() {}

    /**
     * Function to run when an AJAX request ends negatively.
     * Extensibility point.
     */

  }, {
    key: "onFetchFail",
    value: function onFetchFail() {}

    /**
     * Function to run when an AJAX request ends (in any case).
     * Extensibility point.
     */

  }, {
    key: "onFetchEnd",
    value: function onFetchEnd() {}

    /**
     * Function to run when search filter is empty.
     * Extensibility point.
     */

  }, {
    key: "onSearchEmpty",
    value: function onSearchEmpty() {}

    /**
     * Function to run when search starts.
     * Extensibility point.
     */

  }, {
    key: "onSearchStart",
    value: function onSearchStart(val) {}

    /**
     * Define a function that allows to preprocess data upon fetching.
     * Extensibility point.
     */

  }, {
    key: "prepareData",
    value: function prepareData(data) {
      // handle this.data (e.g. parsing dates, etc.)
      // data === this.data
      return this;
    }

    /**
     * Formats the values inside the items (requires columns information).
     */

  }, {
    key: "formatValues",
    value: function formatValues(data) {
      // first use the function that is designed to be overridable by programmers
      var self = this,
          o = self.options;
      if (!data) data = self.data;
      // apply formatting by column
      var formattedSuffix = self.options.formattedSuffix,
          n,
          v;
      var formattedProperties = _utils2.default.where(self.columns, function (x) {
        return _utils2.default.isFunction(x.format);
      });
      _utils2.default.each(data, function (x) {
        _utils2.default.each(formattedProperties, function (c) {
          n = c.name + formattedSuffix;
          v = x[c.name];
          x[n] = _utils2.default.isUnd(v) || v === null || v === "" ? o.emptyValue : c.format(v, x) || o.emptyValue;
        });
      });
      return self;
    }

    /**
     * Sets the columns order by property name.
     */

  }, {
    key: "setColumnsOrder",
    value: function setColumnsOrder() {
      var args = _utils2.default.stringArgs(arguments);
      var l = args.length;
      if (!l) return false;
      var cols = this.columns,
          found = [];
      for (var i = 0; i < l; i++) {
        var n = args[i];
        var col = _utils2.default.find(cols, function (x) {
          return x.name == n;
        });
        if (!col) (0, _raise2.default)(19, "missing column with name \"" + n + "\"");
        col.position = i;
        found.push(col);
      }
      var notFound = _utils2.default.where(cols, function (x) {
        return found.indexOf(x) == -1;
      });
      _utils2.default.each(notFound, function (x) {
        l++;
        x.position = l;
      });
      _array2.default.sortBy(cols, "position");
      // store in memory
      this.storeColumnsData().render();
      return this;
    }

    /**
     * Shows or hides columns, depending on parameter.
     */

  }, {
    key: "toggleColumns",
    value: function toggleColumns(param) {
      var cols = this.columns;
      _utils2.default.each(param, function (x) {
        if (_utils2.default.isArray(x)) {
          var name = x[0],
              visible = x[1];
        } else {
          var name = x.name,
              visible = x.visible;
        }

        var col = _utils2.default.find(cols, function (col) {
          return col.name == name;
        });
        if (!col) {
          (0, _raise2.default)(19, "missing column with name \"" + name + "\"");
        }
        if (visible) {
          col.hidden = col.secret ? true : false;
        } else {
          col.hidden = true;
        }
      });
      this.storeColumnsData().render();
      return this;
    }

    /**
     * Hides one or more columns by name.
     */

  }, {
    key: "hideColumns",
    value: function hideColumns() {
      return this.columnsVisibility(_utils2.default.stringArgs(arguments), false);
    }

    /**
     * Shows one or more columns by name.
     */

  }, {
    key: "showColumns",
    value: function showColumns() {
      return this.columnsVisibility(_utils2.default.stringArgs(arguments), true);
    }

    /**
     * Sets columns visibility.
     */

  }, {
    key: "columnsVisibility",
    value: function columnsVisibility(args, visible) {
      var _this2 = this;

      if (args.length == 1 && args[0] == "*") {
        _utils2.default.each(this.columns, function (x) {
          if (visible) {
            x.hidden = x.secret ? true : false;
          } else {
            x.hidden = true;
          }
        });
      } else {
        _utils2.default.each(args, function (x) {
          _this2.colAttr(x, "hidden", !visible);
        });
      }
      this.storeColumnsData().render();
      return this;
    }

    /**
     * Sets a column property by names and value.
     *
     * @param {string} name: column name
     * @param {string} attr: attribute name
     * @param {any} value: attribute value
     */

  }, {
    key: "colAttr",
    value: function colAttr(name, attr, value) {
      if (!name) (0, _exceptions.ArgumentNullException)("name");
      var cols = this.columns;
      if (!cols) (0, _raise2.default)(20, "missing columns information (properties not initialized)");
      var col = _utils2.default.find(cols, function (x) {
        return x.name == name;
      });
      if (!col) (0, _raise2.default)(19, "missing column with name \"" + name + "\"");
      col[attr] = value;
      return col;
    }

    /**
     * Stores columns data in cache.
     * NB: this is used only to store columns position, hidden data.
     * Objects structure still controls the columns data.
     */

  }, {
    key: "storeColumnsData",
    value: function storeColumnsData() {
      var store = this.getDataStore(),
          key = this.getMemoryKey("columns:data"),
          options = this.options,
          data = this.columns;
      if (store && options.storeTableData) {
        store.setItem(key, _json2.default.compose(data));
      }
      return this;
    }

    /**
     * Gets columns data from storage.
     * NB: this is used only to store columns position, hidden data.
     * Objects structure still controls the columns data.
     */

  }, {
    key: "getCachedColumnsData",
    value: function getCachedColumnsData() {
      var store = this.getDataStore(),
          key = this.getMemoryKey("columns:data"),
          options = this.options;
      if (store && options.storeTableData) {
        var data = store.getItem(key);
        if (data) {
          try {
            return _json2.default.parse(data);
          } catch (ex) {
            store.removeItem(key);
          }
        }
      }
      return null;
    }

    /**
     * Sorts columns, according to their current position setting.
     */

  }, {
    key: "sortColumns",
    value: function sortColumns() {
      if (arguments.length) {
        return this.setColumnsOrder.apply(this, arguments);
      }
      // default function to sort columns: they are sorted
      // by position first, then display name
      var isNumber = _utils2.default.isNumber,
          columns = this.columns;
      columns.sort(function (a, b) {
        var p = "position";
        if (isNumber(a[p]) && !isNumber(b[p])) return -1;
        if (!isNumber(a[p]) && isNumber(b[p])) return 1;
        if (a[p] > b[p]) return 1;
        if (a[p] < b[p]) return -1;
        // compare display name
        p = "displayName";
        return _string2.default.compare(a[p], b[p], 1);
      });
      for (var i = 0, l = columns.length; i < l; i++) {
        columns[i].position = i;
      }return this;
    }
  }, {
    key: "setTools",
    value: function setTools() {
      // TODO: keep this class abstracted from DOM
      return this;
    }

    /**
     * Allows to define a function that returns data required to render the table itself.
     * This is commonly necessary, for example, when an AJAX request is required to fetch filters information
     * (e.g. an array of possible types for a select)
     * Extensibility point.
     */
    // getTableData() { }

    /**
     * Handles data returned by the 'getTableData' promise, if any.
     * By default, this function simply stores the table data in a property called 'tableData'
     * Extensibility point.
     *
     * @param {object} data: data returned by getTableData promise (if any).
     */

  }, {
    key: "handleTableData",
    value: function handleTableData(data) {
      this.tableData = data;
    }

    /*
     * Refreshes the KingTable, clearing its data cache and
     * performing a new rendering.
     */

  }, {
    key: "refresh",
    value: function refresh() {
      delete this.anchorTime;
      // clear data cache

      return this.render({
        clearDataCache: true
      });
    }

    /**
     * Performs an hard refresh on the KingTable; clearing all its cached data
     * and performing a new rendering.
     */

  }, {
    key: "hardRefresh",
    value: function hardRefresh() {
      this.trigger("hard:refresh").clearTableData();
      return this.render({
        clearDataCache: true
      });
    }

    /**
     * Renders the KingTable, using its current view and view builder.
     * If necessary, it also fetches data required by the table itself
     * (e.g. information to render the filters view).
     */

  }, {
    key: "render",
    value: function render(options) {
      var self = this;

      return new Promise(function (resolve, reject) {
        function handle() {
          self.beforeRender();

          self.initColumns().sortColumns().setTools().build();
          self.afterRender();
          resolve();
        }

        function callback() {
          // TODO: the `hasData` check is not specific enough. (maybe?)
          if (self.fixed && self.hasData()) {
            //
            // resolve automatically: the data is already available and not changing
            // however, filters need to be stored for consistency with paginated sets.
            self.getFiltersSetCache();
            handle();
          } else {
            // it is necessary to fetch data
            var timestamp = self.lastFetchTimestamp = new Date().getTime();
            self.getList(options, timestamp).then(function success(data) {
              if (!data || !data.length && !self.columnsInitialized) {
                // there is no data: this may happen if the server is not returning any
                // object
                return self.emit("no-results");
              }
              handle();
            }, function fail() {
              self.emit("get-list:failed");
              reject("get-list:failed");
            });
          }
        }

        //
        // if necessary, fetch list data (e.g. filters data, or anything else that need to be fetched
        // from the server side before displaying a rendered table)
        //
        if (self.getTableData && !self.cache.tableDataFetched) {
          // was the data already fetched?

          var tableDataPromise = self.getTableData();
          // NB: here duck typing is used.
          if (!_utils2.default.quacksLikePromise(tableDataPromise)) {
            (0, _raise2.default)(13, "getTableData must return a Promise or Promise-like object.");
          }

          tableDataPromise.then(function (data) {
            if (self.options.storeTableData) {
              self.cache.tableDataFetched = true;
              // store table data in store
              self.storeTableData(data);
            }
            self.handleTableData(data);
            callback();
          }, function () {
            // fetching table data failed
            self.emit("get-table-data:failed");
            reject();
          });
        } else {
          // table requires no data
          callback();
        }
      });
    }

    /**
     * Allows to clear stored table data.
     */

  }, {
    key: "clearTableData",
    value: function clearTableData() {
      var self = this,
          store = self.getDataStore(),
          key = self.getMemoryKey("table:data"),
          options = self.options;
      if (store && options.storeTableData) {
        store.removeItem(key);
      }
      self.cache.tableDataFetched = false;
      delete self.tableData;
      return self;
    }

    /**
     * Stores table data for later use.
     */

  }, {
    key: "storeTableData",
    value: function storeTableData(data) {
      var store = this.getDataStore(),
          key = this.getMemoryKey("table:data"),
          options = this.options;
      if (store && options.storeTableData) {
        store.setItem(key, _json2.default.compose(data));
      }
      return this;
    }

    /**
     * Restores table data from cache.
     */

  }, {
    key: "restoreTableData",
    value: function restoreTableData() {
      var self = this,
          store = self.getDataStore(),
          key = self.getMemoryKey("table:data"),
          options = self.options;
      if (store && options.storeTableData) {
        var data = store.getItem(key);
        if (data) {
          // table data is available in cache
          try {
            // TODO: use the same function to parse, used by ajax proxy functions
            data = _json2.default.parse(data);
          } catch (ex) {
            // parsing failed
            store.removeItem(key);
          }
          self.handleTableData(data);
          self.cache.tableDataFetched = true;
        }
      }
      return self;
    }

    /**
     * Builds the KingTable, using its current state and view builder.
     */

  }, {
    key: "build",
    value: function build() {
      // depending on the current view, use the right builder to build
      // the table at its current state.
      var self = this;
      var builder = self.builder;
      if (!builder) {
        return;
      }
      builder.build();
    }

    /**
     * Returns a memory key for this KingTable.
     */

  }, {
    key: "getMemoryKey",
    value: function getMemoryKey(name) {
      var a = location.pathname + location.hash + ".kt";
      var id = this.id;
      if (id) a = id + ":" + a;
      return name ? a + ":::" + name : a;
    }

    /**
     * Handles fixed data.
     */

  }, {
    key: "setFixedData",
    value: function setFixedData(data) {
      var self = this;
      data = self.normalizeCollection(data);
      self.fixed = true;
      self.filters.searchDisabled = false;
      self.prepareData(data);
      self.data = data;
      self.initColumns();
      self.formatValues(data);
      self.updatePagination(data.length);
      return data;
    }

    /**
     * Fetches the data for this KingTable and handles its response.
     * The default implementation performs an ajax request.
     */

  }, {
    key: "getList",
    value: function getList(options, timestamp) {
      options = options || {};
      var self = this;
      // obtain fetch options
      var fetchOptions = self.mixinFetchData();

      return new Promise(function (resolve, reject) {
        self.emit("fetch:start").onFetchStart();
        self.getFetchPromiseWithCache(fetchOptions, options).then(function done(data) {
          // check if there is a newer call to function
          if (timestamp < self.lastFetchTimestamp) {
            // do nothing because there is a newer call to loadData
            return;
          }
          if (!data) {
            // invalid promise: the function must return something when resolving
            (0, _raise2.default)(14, "`getFetchPromise` did not return a value when resolving");
          }
          self.emit("fetch:done").onFetchDone(data);

          // check if returned data is an array or a catalog
          if (_utils2.default.isArray(data)) {
            //
            // The server returned an array, so take for good that this collection
            // is complete and doesn't require server side pagination. This is by design.
            //
            data = self.setFixedData(data);
            //
            // The collection is complete: apply client side pagination
            //
            resolve(self.getSubSet(data));
          } else {
            //
            // The server returned an object, so take for good that this collection requires
            // server side pagination; expect the returned data to include information like:
            // total number of results (possibly), so a client side pagination can be built;
            //
            // expect catalog structure (page count, page number, etc.)
            var subset = data.items || data.subset;
            if (!_utils2.default.isArray(subset)) (0, _raise2.default)(6, "The returned object is not a catalog");
            if (!_utils2.default.isNumber(data.total)) (0, _raise2.default)(7, "Missing total items count in response object.");

            subset = self.normalizeCollection(subset);
            // set data
            self.prepareData(subset);
            self.data = subset;
            self.initColumns();
            self.formatValues(subset);
            self.updatePagination(data.total);
            resolve(subset);
          }
        }, function fail() {
          // check if there is a newer call to function
          if (timestamp < self.lastFetchTimestamp) {
            // do nothing because there is a newer call to loadData
            return;
          }
          self.emit("fetch:fail").onFetchFail();
          reject();
        }).then(function always() {
          self.emit("fetch:end").onFetchEnd();
        });
      });
    }

    /**
     * Performs a search by text.
     */

  }, {
    key: "search",
    value: function search(val) {
      if (_utils2.default.isUnd(val)) val = "";
      var self = this;
      if (self.validateForSeach(val)) {
        // add filters inside the filters manager
        if (!val) {
          // remove filter
          self.unsetSearch();
        } else {
          self.onSearchStart(val);
          self.setSearchFilter(val);
        }
        // go to first page
        self.pagination.page = 1;
      } else {
        // value is not valid for search: remove the rule by key
        self.unsetSearch();
      }
      self.render();
    }
  }, {
    key: "isSearchActive",
    value: function isSearchActive() {
      var filter = this.filters.getRuleByKey("search");
      return !!filter;
    }

    /**
     * Unsets the search filters in this table.
     */

  }, {
    key: "unsetSearch",
    value: function unsetSearch() {
      var self = this;
      if (!self.isSearchActive()) {
        return self;
      }
      self.filters.removeRuleByKey("search");
      self.searchText = null;
      if (self.hasData()) self.updatePagination(self.data.length);
      self.trigger("search-empty").onSearchEmpty();
      return self;
    }

    /**
     * Sets a search filter for the table.
     *
     * @param {string} val: search value.
     * @param {bool} skipStore: whether to skip storing the filter in cache or not.
     */

  }, {
    key: "setSearchFilter",
    value: function setSearchFilter(val, skipStore) {
      var self = this;
      self.searchText = val;
      if (!skipStore) {
        self.getFiltersSetCache(); // store filter in cache
      }
      var searchProperties = self.getSearchProperties();
      // NB: if data is fetched from the server after table initialization,
      // then searchProperties may still be not available.
      self.filters.set({
        type: "search",
        key: "search",
        value: _regex2.default.getSearchPattern(_string2.default.getString(val), {
          searchMode: self.options.searchMode
        }),
        searchProperties: searchProperties && searchProperties.length ? searchProperties : false
      });
      self.trigger("search-active");
      return self;
    }

    /**
     * Gets the properties that should be used to search in this table.
     */

  }, {
    key: "getSearchProperties",
    value: function getSearchProperties() {
      var self = this,
          options = self.options;
      if (options.searchProperties)
        // the user explicitly specified the search properties
        return options.searchProperties;

      // if data is not initialized yet, return false; search properties will be set later
      if (!self.data || !self.columnsInitialized) return false;

      var searchable = _utils2.default.where(self.columns, function (col) {
        return col.allowSearch && !col.secret; // exclude secret columns
      });
      //
      // When searching, it's desirable to search inside string representations of
      // values, while keeping real values in the right type (for sorting numbers and dates, for instance)
      // However, it is also nice to search by actual values (e.g. searching "1000" should match numbers that are represented with thousands separators, too --> like '1,000.00')
      //
      var formattedSuffix = options.formattedSuffix;
      return _utils2.default.flatten(_utils2.default.map(searchable, function (x) {
        if (_utils2.default.isFunction(x.format)) {
          // TODO: which properties should also be searched in their default string representation? (Dates not likely, Numbers most probably yes)
          return x.type == "number" ? [x.name + formattedSuffix, x.name] : x.name + formattedSuffix;
        }
        return x.name;
      }));
    }

    /**
     * Returns true if a string value should trigger a search, false otherwise.
     */

  }, {
    key: "validateForSeach",
    value: function validateForSeach(val) {
      if (!val) return false;
      var minSearchChars = this.options.minSearchChars;
      if (val.match(/^[\s]+$/g) || _utils2.default.isNumber(minSearchChars) && val.length < minSearchChars) {
        return false;
      }
      return true;
    }

    /**
     * Returns a string representation of the anchor fetch time.
     * Time used to `anchor` fetching of items for fast growing tables
     * (i.e. items can be fetched if their creation time is before anchor timestamp)
     */

  }, {
    key: "getFormattedAnchorTime",
    value: function getFormattedAnchorTime() {
      var time = this.anchorTime;
      if (time instanceof Date) {
        if (_date2.default.isToday(time)) {
          return _date2.default.format(time, "HH:mm:ss");
        }
        return _date2.default.formatWithTime(time);
      }
      return "";
    }

    /**
     * Returns a string representation of the data fetch time.
     */

  }, {
    key: "getFormattedFetchTime",
    value: function getFormattedFetchTime() {
      var time = this.dataFetchTime;
      if (time instanceof Date) {
        if (_date2.default.isToday(time)) {
          return _date2.default.format(time, "HH:mm:ss");
        }
        return _date2.default.formatWithTime(time);
      }
      return "";
    }

    /**
     * Returns a promise object responsible of fetching data including a LRU caching mechanism;
     *
     * @param params
     * @returns {Promise}
     */

  }, {
    key: "getFetchPromiseWithCache",
    value: function getFetchPromiseWithCache(params, options) {
      // LRU caching mechanism. If the fetch options didn't change (it means: same filters),
      // and there is already data in the local storage or session storage, use stored data.
      if (!options) options = {};
      var self = this,
          o = self.options,
          lruCacheSize = o.lruCacheSize,
          store = self.getDataStore(),
          useLru = !!(lruCacheSize && store);
      var anchorTime = "anchorTime";
      if (useLru) {
        // check if there is data in the store
        var frozen = _json2.default.parse(_json2.default.compose(params));
        var key = self.getMemoryKey("catalogs"),
            cachedData = _lru2.default.get(key, function (x) {
          return _utils2.default.equal(frozen, x.filters);
        }, store, true);
        if (cachedData) {
          if (options.clearDataCache) {
            // clear the cache for all pages,
            // this is important to not confuse the user
            // because if only the cache for a specific page number were cleared, it would be difficult to understand
            _lru2.default.remove(key, undefined, store);
          } else {
            // set timestamp of when data was fetched
            self[anchorTime] = new Date(cachedData.data[anchorTime]);
            self.dataFetchTime = new Date(cachedData.ts);
            return new Promise(function (resolve, reject) {
              //
              // NB: it is important to use a timeout of 0 milliseconds, to
              // recreate similar scenario like the one given by an AJAX request
              // (e.g. for libraries like Knockout or Vue.js)
              // Otherwise the view would be build in different ways
              //
              setTimeout(function () {
                resolve(cachedData.data.data);
              }, 0);
            });
          }
        }
      }
      // fetch remotely
      return new Promise(function (resolve, reject) {
        self.loading = true;
        self.emit("fetching:data");
        self.getFetchPromise(params).then(function done(data) {
          if (useLru) {
            // store in cache
            _lru2.default.set(key, {
              data: data,
              filters: params,
              anchorTime: self[anchorTime].getTime()
            }, o.lruCacheSize, o.lruCacheMaxAge, store);
          }
          self.dataFetchTime = new Date();
          self.loading = false;
          self.emit("fetched:data");
          resolve(data);
        }, function fail() {
          self.loading = false;
          reject();
        });
      });
    }

    /**
     * Returns a promise object responsible of fetching data;
     * Override this function if data should be fetched in other ways
     * (for example, reading a file from file system).
     * This function must return a Promise object or a compatible object.
     *
     * @param params
     * @returns {Promise}
     */

  }, {
    key: "getFetchPromise",
    value: function getFetchPromise(params) {
      // The default implementation implements getFetchPromise by generating an AJAX call,
      // since this is the most common use case scenario.
      // However, this class is designed to be almost abstracted from AJAX, so overriding this single
      // function allows to fetch data from other sources (e.g. reading files in chunks from file system; returning mock data for unit tests; etc).
      var options = this.options;
      var url = options.url;
      if (!url) (0, _raise2.default)(5, "Missing url option, to fetch data");

      // NB: if method is GET, ajax helper will automatically convert it to a query string
      // with keys in alphabetical order; conversion is done transparently
      var method = options.httpMethod;

      // format fetch data
      params = this.formatFetchData(params);

      return _ajax2.default.shot({
        type: method,
        url: url,
        data: params
      });
    }
  }, {
    key: "numberFilterFormatter",
    value: function numberFilterFormatter(propertyName, value) {
      return value;
    }
  }, {
    key: "dateFilterFormatter",
    value: function dateFilterFormatter(propertyName, value) {
      return _date2.default.toIso8601(value);
    }
  }, {
    key: "formatFetchData",
    value: function formatFetchData(data) {
      var options = this.options;
      var sortByFormatter = options.sortByFormatter;
      if (data.sortBy && _utils2.default.isFunction(sortByFormatter)) {
        data.sortBy = sortByFormatter(data.sortBy);
      }

      var x;
      for (x in data) {
        var v = data[x];
        if (v instanceof Date) {
          data[x] = this.dateFilterFormatter(x, v);
        }
        if (v instanceof Number) {
          data[x] = this.numberFilterFormatter(x, v);
        }
      }
      return data;
    }

    /**
     * Returns an object that describe all filters and necessary options to fetch data.
     */

  }, {
    key: "mixinFetchData",
    value: function mixinFetchData() {
      var extraData = this.options.fetchData;
      if (_utils2.default.isFunction(extraData)) extraData = extraData.call(this);
      return _utils2.default.extend(this.getFiltersSetCache(), extraData || {});
    }

    /**
     * Ensures that a collection is normalized, if the server is returning an optimized
     * collection in the shape of array of arrays.
     * Optimized collections are converted in dictionaries, for easier handling during rendering,
     * as values can be handled by property name instead of array index.
     *
     * @param collection: collection to normalize
     */

  }, {
    key: "normalizeCollection",
    value: function normalizeCollection(collection) {
      var l = collection.length;
      if (!l) return collection;
      var first = collection[0];
      if (_utils2.default.isArray(first)) {
        // assumes that the server is returning an optimized collection:
        // the first array contains the column names; while the others the values.
        var a = [],
            i,
            j = first.length,
            k;
        for (i = 1; i < l; i++) {
          var o = {};
          for (k = 0; k < j; k++) {
            o[first[k]] = collection[i][k];
          }
          a.push(o);
        }
        return a;
      }
      // the collection is not optimized
      return collection;
    }

    /**
     * Returns the current collection of items.
     */

  }, {
    key: "getData",
    value: function getData(options) {
      var o = _utils2.default.extend({
        optimize: false,
        itemCount: true,
        hide: true // whether to exclude `hidden` columns
      }, options),
          self = this,
          itemCount = self.options.itemCount && o.itemCount;
      var data = self.getItemsToDisplay();
      var columns = _utils2.default.clone(self.columns);
      if (o.hide) {
        // delete hidden properties
        _utils2.default.each(_utils2.default.where(self.columns, function (o) {
          return o.hidden || o.secret;
        }), function (o) {
          _utils2.default.each(data, function (d) {
            delete d[o.name];
          });
        });
        columns = _utils2.default.where(self.columns, function (o) {
          return !o.hidden && !o.secret;
        });
      }
      if (itemCount) {
        self.setItemsNumber(data);
      }
      if (o.optimize) {
        if (itemCount) {
          columns.unshift({
            name: "ε_row",
            displayName: "#"
          });
        }
        return self.optimizeCollection(data, columns, o);
      }
      return data;
    }

    /**
     * Returns a list of items to display for this table at its current state.
     */

  }, {
    key: "getItemsToDisplay",
    value: function getItemsToDisplay() {
      var self = this,
          options = self.options,
          data = self.data;
      if (!data || !data.length) return [];
      //
      // clone the data; this is required to alter items
      // without affecting original items
      //
      data = _utils2.default.clone(data);

      if (!self.fixed) return data;

      // paginate, filter and sort client side
      var l = data.length;
      // apply filters here
      data = self.filters.skim(data);
      if (data.length != l) {
        self.updatePagination(data.length);
      }
      // apply sorting logic, but only if there is no search specified (the search by string property is already sorting really well),
      // or if the search sorting is configured to not rules over the regular sorting
      if (!self.searchText || !options.searchSortingRules) {
        var sortCriteria = self.sortCriteria;
        if (!_utils2.default.isEmpty(sortCriteria)) {
          _array2.default.sortBy(data, sortCriteria);
        }
      }
      // obtain a subset of data, after sorting (this order is really important)
      var subset = self.getSubSet(data);
      return subset;
    }

    /**
     * Sorts the underlying items by one or more properties.
     *
     * @param {(string|string[]|objects)} criteria: object describing
     */

  }, {
    key: "sortBy",
    value: function sortBy() {
      var criteria = _array2.default.getSortCriteria(arguments);
      if (!criteria || !criteria.length) {
        return this.unsetSortBy();
      }
      var self = this;
      self.sortCriteria = criteria;
      if (self.hasData()) {
        // render (will trigger storing filters in cache)
        _array2.default.sortBy(self.data, criteria);
        self.render();
      } else {
        // store filters in cache
        self.getFiltersSetCache();
      }
      return self;
    }

    /**
     * Progress sort order for a property with the given name.
     */

  }, {
    key: "progressSortBy",
    value: function progressSortBy(name) {
      if (!name) (0, _exceptions.ArgumentNullException)("name");
      var self = this;
      var columns = self.columns;
      if (!columns) {
        // this function can be called only when columns information are initialized
        (0, _raise2.default)(20, "Missing columns information");
      }
      var property = _utils2.default.find(columns, function (x) {
        return x.name == name;
      });
      if (!property) {
        (0, _raise2.default)(19, "Column '${name}' is not found among columns.");
      }
      var criteria = self.sortCriteria || [];
      var existingSort = _utils2.default.find(criteria, function (x) {
        return x[0] == name;
      });
      if (!existingSort) {
        // start by ascending, by default
        criteria.push([name, 1]);
      } else {
        var order = existingSort[1];
        if (order === -1) {
          // remove
          criteria = _utils2.default.reject(criteria, function (x) {
            return x[0] == name;
          });
        } else {
          // order can only be 1, move by 1
          existingSort[1] = -1;
        }
      }
      self.sortBy(criteria);
    }

    /**
     * Progress sort order for a single property with the given name.
     */

  }, {
    key: "progressSortBySingle",
    value: function progressSortBySingle(name) {
      if (!name) (0, _exceptions.ArgumentNullException)("name");
      var self = this;
      var columns = self.columns;
      if (!columns) {
        // this function can be called only when columns information are initialized
        (0, _raise2.default)(20, "Missing columns information");
      }
      var property = _utils2.default.find(columns, function (x) {
        return x.name == name;
      });
      if (!property) {
        (0, _raise2.default)(19, "Column '${name}' is not found among columns.");
      }
      var criteria = self.sortCriteria || [];
      var existingSort = _utils2.default.find(criteria, function (x) {
        return x[0] == name;
      });
      if (!existingSort) {
        // start by ascending, by default
        criteria = [name, 1];
      } else {
        var order = existingSort[1];
        if (order === -1) {
          criteria = [name, 1];
        } else {
          criteria = [name, -1];
        }
      }
      self.sortBy([criteria]);
    }

    /**
     * Unsets the sort by criteria for this table.
     */

  }, {
    key: "unsetSortBy",
    value: function unsetSortBy() {
      this.sortCriteria = null;
      // render (will trigger storing filters in cache)
      this.render();
      return this;
    }

    /**
     * Sets the numeration inside a given array of items.
     */

  }, {
    key: "setItemsNumber",
    value: function setItemsNumber(arr) {
      var self = this,
          pag = self.pagination,
          offset = (pag.page - 1) * pag.resultsPerPage;
      if (!arr) arr = self.data;
      var l = arr.length;
      for (var i = 0; i < l; i++) {
        arr[i].ε_row = (i + 1 + offset).toString();
      }
      return arr;
    }

    /**
     * Optimizes a collection; making its structure smaller by removing the property names.
     *
     * @param data
     * @param {string[]} columns: columns to include.
     * @param {object} options: options to optimize the collection.
     */

  }, {
    key: "optimizeCollection",
    value: function optimizeCollection(data, columns, options) {
      if (!columns) columns = this.columns;
      if (!options) options = {
        format: true
      };
      var a = [_utils2.default.map(columns, function (o) {
        return o.displayName;
      })],
          len = "length",
          push = "push",
          format = options.format,
          formattedSuffix = this.options.formattedSuffix,
          obj;
      for (var i = 0, l = data[len]; i < l; i++) {
        var b = [];
        for (var k = 0, j = columns[len]; k < j; k++) {
          var colname = columns[k].name,
              formattedName = colname + formattedSuffix;
          obj = data[i];
          if (format && _utils2.default.has(obj, formattedName)) {
            b[push](obj[formattedName]);
          } else {
            // NB: if the object does not have a property, string empty is added
            // to fill the property place.
            b[push](obj[colname] || "");
          }
        }
        a[push](b);
      }
      return a;
    }

    /**
     * Returns the value of the given property from the given item,
     * eventually returning the formatted value.
     */

  }, {
    key: "getItemValue",
    value: function getItemValue(item, name) {
      if (!item) (0, _exceptions.ArgumentNullException)("item");
      var options = this.options,
          formattedSuffix = options.formattedSuffix,
          formattedName = name + formattedSuffix;
      return _utils2.default.has(item, formattedName) ? item[formattedName] : item[name];
    }

    /**
     * Default function to get the name of the id property of displayed objects.
     */

  }, {
    key: "getIdProperty",
    value: function getIdProperty() {
      var o = this.options;
      if (_utils2.default.isString(o.idProperty)) return o.idProperty;

      var columns = this.columns;
      if (!columns || !columns.length) (0, _raise2.default)(4, "id property cannot be determined: columns are not initialized.");

      for (var i = 0, l = columns.length; i < l; i++) {
        var name = columns[i].name;
        if (/^_?id$|^_?guid$/i.test(name)) return name;
      }
      (0, _raise2.default)(4, "id property cannot be determined, please specify it using 'idProperty' option.");
    }
  }, {
    key: "getExportFileName",
    value: function getExportFileName(format) {
      return this.options.collectionName + "." + format;
    }
  }, {
    key: "getColumnsForExport",
    value: function getColumnsForExport() {
      var columns = this.columns;
      return this.options.exportHiddenProperties ? columns : _utils2.default.reject(columns, function (o) {
        return o.hidden || o.secret;
      });
    }

    /**
     * Client side export for a specific format.
     */

  }, {
    key: "exportTo",
    value: function exportTo(format) {
      if (!format) (0, _exceptions.ArgumentException)("format");

      var self = this,
          options = self.options;
      var filename = self.getExportFileName(format),
          exportFormat = _utils2.default.find(self.options.exportFormats, function (o) {
        return o.format === format;
      }),
          columns = self.getColumnsForExport();
      if (!exportFormat || !exportFormat.type) (0, _raise2.default)(30, "Missing format information");

      var itemsToDisplay = self.getData({ itemCount: false });
      var contents = "";
      if (exportFormat.handler) {
        //user defined handler
        contents = exportFormat.handler.call(self, itemsToDisplay);
      } else {
        //use default export handlers
        switch (format) {
          case "csv":
            var data = self.optimizeCollection(itemsToDisplay);
            contents = _csv2.default.serialize(data, options.csvOptions);
            break;
          case "json":
            contents = _json2.default.compose(itemsToDisplay, 2, 2);
            break;
          case "xml":
            contents = self.dataToXml(itemsToDisplay);
            break;
          default:
            throw "export format " + format + "not implemented";
        }
      }
      if (contents) _file2.default.exportfile(filename, contents, exportFormat.type);
    }

    /**
     * Basic function to convert the given data into an xml structure.
     */

  }, {
    key: "dataToXml",
    value: function dataToXml(data) {
      var self = this,
          columns = self.getColumnsForExport(),
          options = self.options,
          len = "length",
          d = document,
          s = new XMLSerializer(),
          createElement = "createElement",
          appendChild = "appendChild",
          root = d[createElement](options.collectionName || "collection");

      for (var i = 0, l = data[len]; i < l; i++) {
        var item = d[createElement](options.entityName || "item");
        for (var k = 0, j = columns[len]; k < j; k++) {
          var col = columns[k],
              name = col.name,
              value = data[i][name];
          if (options.entityUseProperties) {
            //use properties
            item.setAttribute(name, value);
          } else {
            //use elements
            var subitem = d[createElement](name);
            subitem.innerText = value;
            item[appendChild](subitem);
          }
        }
        root[appendChild](item);
      }
      var a = s.serializeToString(root);
      return options.prettyXml ? _xml2.default.pretty(a) : _xml2.default.normal(a);
    }

    /**
     * 
     * @param {*} obj 
     */

  }, {
    key: "disposeOf",
    value: function disposeOf(obj) {
      obj.dispose();
      _utils2.default.removeItem(this.disposables, obj);
    }

    /**
     * Disposes this KingTable.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      delete this.context;
      delete this.search;
      delete this.filters.context;
      _utils2.default.each(this.disposables, function (x) {
        if (x.dispose) x.dispose();
        if (_utils2.default.isFunction(x)) x();
      });
      this.disposables = [];
      var o = this.options;
      _utils2.default.ifcall(o.onDispose, this);
    }
  }], [{
    key: "regional",
    get: function get() {
      return _kingtable2.default;
    }
  }, {
    key: "version",
    get: function get() {
      return VERSION;
    }
  }, {
    key: "Utils",
    get: function get() {
      return _utils2.default;
    }
  }, {
    key: "StringUtils",
    get: function get() {
      return _string2.default;
    }
  }, {
    key: "NumberUtils",
    get: function get() {
      return _number2.default;
    }
  }, {
    key: "ArrayUtils",
    get: function get() {
      return _array2.default;
    }
  }, {
    key: "DateUtils",
    get: function get() {
      return _date2.default;
    }
  }, {
    key: "json",
    get: function get() {
      return _json2.default;
    }
  }, {
    key: "Paginator",
    get: function get() {
      return _paginator2.default;
    }
  }, {
    key: "PlainTextBuilder",
    get: function get() {
      return _kingtableText2.default;
    }
  }, {
    key: "HtmlBuilder",
    get: function get() {
      return _kingtableHtml2.default;
    }
  }, {
    key: "RichHtmlBuilder",
    get: function get() {
      return _kingtableRhtml2.default;
    }
  }, {
    key: "BaseHtmlBuilder",
    get: function get() {
      return _kingtableHtmlBase2.default;
    }

    /**
     * Gives access to KingTable builders, to allow overriding their functions.
     */

  }, {
    key: "builders",
    get: function get() {
      return BUILDERS;
    }

    /**
     * Gives access to KingTable custom storages, implementing an interface compatible
     * with sessionStorage and localStorage.
     */

  }, {
    key: "stores",
    get: function get() {
      return {
        "memory": _memstore2.default
      };
    }
  }]);

  return KingTable;
}(_events2.default);

// Extend KingTable object with properties that are meant to be globally available and editable
// for users of the library (programmers)
// NB: static get wouldn't work because the object would not be editable.
//


KingTable.defaults = DEFAULTS;

KingTable.Schemas = {
  /**
   * Default columns properties, by field value type.
   * This object is meant to be extended by implementers; following their personal preferences.
   */
  DefaultByType: {
    number: function number(columnSchema, objSchema) {
      return {
        format: function format(value) {
          // NB: this function is used only if a formatter function is not
          // defined for the given property; so here we suggest a format that makes sense for the value.
          return _number2.default.format(value);
        }
      };
    },
    date: function date(columnSchema, objSchema) {
      return {
        format: function dateFormatter(value) {
          // NB: this function is used only if a formatter function is not
          // defined for the given property; so here we suggest a format that makes sense for the value.

          // support date format defined inside column schema
          // use a format that makes sense for the value
          // if the date has time component, use format that contains time; otherwise only date part
          var hasTime = KingTable.DateUtils.hasTime(value);
          var format = KingTable.DateUtils.defaults.format[hasTime ? "long" : "short"];
          return KingTable.DateUtils.format(value, format);
        }
      };
    }
  },

  /**
   * Default columns properties, by field name.
   * This object is meant to be extended by implementers; following their personal preferences.
   */
  DefaultByName: {
    id: {
      name: "id",
      type: "id",
      hidden: true,
      secret: true
    },
    guid: {
      name: "guid",
      type: "guid",
      hidden: true,
      secret: true
    }
  }
};

// expose ajax functions
KingTable.Ajax = _ajax2.default;

// Pollute the window namespace with the KingTable object,
// this is intentional, so the users of the library that don't work with ES6, yet,
// can override its functions using: KingTable.prototype.propertyName = function something() {}
// Haters are gonna hate. But if you don't like, you can always create a custom build without following three lines! (MIT License)
if ((typeof window === "undefined" ? "undefined" : _typeof(window)) !== UNDEFINED) {
  window.KingTable = KingTable;
}

exports.default = KingTable;

},{"../../scripts/components/array":1,"../../scripts/components/date":2,"../../scripts/components/events":3,"../../scripts/components/number":4,"../../scripts/components/regex":6,"../../scripts/components/string":7,"../../scripts/data/ajax":9,"../../scripts/data/csv":10,"../../scripts/data/file":11,"../../scripts/data/json":13,"../../scripts/data/lru":14,"../../scripts/data/memstore":15,"../../scripts/data/object-analyzer":16,"../../scripts/data/sanitizer":17,"../../scripts/data/xml":18,"../../scripts/exceptions":20,"../../scripts/filters/filters-manager":21,"../../scripts/filters/paginator":22,"../../scripts/raise":26,"../../scripts/tables/kingtable.html.base.builder":28,"../../scripts/tables/kingtable.html.builder":29,"../../scripts/tables/kingtable.regional":31,"../../scripts/tables/kingtable.rhtml.builder":32,"../../scripts/tables/kingtable.text.builder":33,"../../scripts/utils":34}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * KingTable default regional object.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

exports.default = {
  "en": {
    "goToDetails": "Go to details",
    "sortOptions": "Sort options",
    "searchSortingRules": "When searching, sort by relevance",
    "advancedFilters": "Advanced filters",
    "sortModes": {
      "simple": "Simple (single property)",
      "complex": "Complex (multiple properties)"
    },
    "viewsType": {
      "table": "Table",
      "gallery": "Gallery"
    },
    "exportFormats": {
      "csv": "Csv",
      "json": "Json",
      "xml": "Xml"
    },
    "columns": "Columns",
    "export": "Export",
    "view": "View",
    "views": "Views",
    "loading": "Loading",
    "noData": "No data to display",
    "page": "Page",
    "resultsPerPage": "Results per page",
    "results": "Results",
    "of": "of",
    "firstPage": "First page",
    "lastPage": "Last page",
    "prevPage": "Previous page",
    "nextPage": "Next page",
    "refresh": "Refresh",
    "fetchTime": "Data fetched at:",
    "anchorTime": "Data at:",
    "sortAscendingBy": "Sort by {{name}} ascending",
    "sortDescendingBy": "Sort by {{name}} descending",
    "errorFetchingData": "An error occurred while fetching data."
  }
};

},{}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _html = require("../../scripts/data/html");

var _kingtableMenu = require("../../scripts/menus/kingtable.menu.html");

var _kingtableMenu2 = _interopRequireDefault(_kingtableMenu);

var _kingtableHtml = require("../../scripts/tables/kingtable.html.builder");

var _kingtableHtml2 = _interopRequireDefault(_kingtableHtml);

var _kingtableHtmlBase = require("../../scripts/tables/kingtable.html.base.builder");

var _kingtableHtmlBase2 = _interopRequireDefault(_kingtableHtmlBase);

var _kingtable = require("../../scripts/menus/kingtable.menu");

var _kingtable2 = _interopRequireDefault(_kingtable);

var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _dom = require("../../scripts/dom");

var _dom2 = _interopRequireDefault(_dom);

var _file = require("../../scripts/data/file");

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * KingTable rich HTML builder.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Renders tabular data in HTML format, with event handlers and tools.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Suitable for web pages and desktop applications powered by Node.js.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


// import xml from "../../scripts/data/xml"
var SPACE = " ";
var CHECKBOX_TYPE = "checkbox";
var KingTableClassName = "king-table";

function classObj(name) {
  return { "class": name };
}

/**
 * Default methods to build a Gallery view for KingTableRichHtmlBuilder.
 * NB: functions are executed in the context of the KingTableRichHtmlBuilder.
 */

var KingTableRhGalleryViewResolver = function (_KingTableBaseHtmlBui) {
  _inherits(KingTableRhGalleryViewResolver, _KingTableBaseHtmlBui);

  function KingTableRhGalleryViewResolver() {
    _classCallCheck(this, KingTableRhGalleryViewResolver);

    return _possibleConstructorReturn(this, (KingTableRhGalleryViewResolver.__proto__ || Object.getPrototypeOf(KingTableRhGalleryViewResolver)).apply(this, arguments));
  }

  _createClass(KingTableRhGalleryViewResolver, [{
    key: "buildView",
    value: function buildView(table, columns, data) {
      return new _html.VHtmlElement("div", classObj("king-table-gallery"), [this.buildBody(table, columns, data), new _html.VHtmlElement("br", classObj("break"))]);
    }

    /**
     * Builds a table body in HTML from given table and data.
     */

  }, {
    key: "buildBody",
    value: function buildBody(table, columns, data) {
      var builder = this,
          formattedSuffix = table.options.formattedSuffix,
          searchPattern = table.searchText ? table.filters.getRuleByKey("search").value : null,
          autoHighlight = table.options.autoHighlightSearchProperties;
      var ix = -1;
      var rows = _utils2.default.map(data, function (item) {
        ix += 1;
        item.__ix__ = ix;
        var cells = [],
            x,
            col;
        for (var i = 0, l = columns.length; i < l; i++) {
          col = columns[i];
          x = col.name;
          if (col.hidden || col.secret) {
            continue;
          }
          var formattedProp = x + formattedSuffix;
          var valueEl,
              value = _utils2.default.has(item, formattedProp) ? item[formattedProp] : item[x];

          // does the column define an html resolver?
          if (col.html) {
            if (!_utils2.default.isFunction(col.html)) {
              (0, _raise2.default)(24, "Invalid 'html' option for property");
            }
            // NB: it is responsibility of the user of the library to escape HTML characters that need to be escaped
            var html = col.html.call(builder, item, value);
            valueEl = new _html.VHtmlFragment(html || "");
          } else {
            if (value === null || value === undefined || value === "") {
              valueEl = new _html.VTextElement("");
            } else {
              // is a search active?
              if (searchPattern && autoHighlight && _utils2.default.isString(value)) {
                // an html fragment is required to display an highlighted value
                valueEl = new _html.VHtmlFragment(builder.highlight(value, searchPattern));
              } else {
                valueEl = new _html.VTextElement(value);
              }
            }
          }

          cells.push(new _html.VHtmlElement(col.name == "ε_row" ? "strong" : "span", col ? {
            "class": col.css || col.name,
            "title": col.displayName
          } : {}, valueEl));
        }
        return new _html.VHtmlElement("li", builder.getItemAttrObject(ix, item), cells);
      });
      return new _html.VHtmlElement("ul", { "class": "king-table-body" }, rows);
    }
  }]);

  return KingTableRhGalleryViewResolver;
}(_kingtableHtmlBase2.default);

var SortModes = {
  Simple: "simple", // only one property at a time;
  Complex: "complex" // sort by multiple properties;


  /**
   * Normalizes
   */
};function normalizeExtraView(o) {
  if (!o) (0, _raise2.default)(34, "Invalid extra view configuration.");
  if (!o.name) (0, _raise2.default)(35, "Missing name in extra view configuration.");

  if (o.getItemTemplate) {
    _utils2.default.extend(o, {
      resolver: {
        getItemTemplate: o.getItemTemplate,

        buildView: function buildView(table, columns, data) {
          var itemTemplate = this.getItemTemplate();
          if (!itemTemplate) {
            (0, _raise2.default)(31, "Invalid getItemTemplate function in extra view.");
          }
          var rows = _utils2.default.map(data, function (datum) {
            var html = itemTemplate.replace(/\{\{(.+?)\}\}/g, function (s, a) {
              if (!datum.hasOwnProperty(a)) (0, _raise2.default)(32, "Missing property " + a + ", for template");
              return table.getItemValue(datum, a);
            });
            return new _html.VHtmlFragment(html);
          });
          return new _html.VHtmlElement("div", { "class": ("king-table-body " + o.name).toLowerCase() }, rows);
        }
      }
    });
    delete o.getItemTemplate;
  }
  return o;
}

var KingTableRichHtmlBuilder = function (_KingTableHtmlBuilder) {
  _inherits(KingTableRichHtmlBuilder, _KingTableHtmlBuilder);

  /**
   * Creates a new instance of KingTableRichHtmlBuilder associated with the given table.
   */
  function KingTableRichHtmlBuilder(table) {
    _classCallCheck(this, KingTableRichHtmlBuilder);

    var _this2 = _possibleConstructorReturn(this, (KingTableRichHtmlBuilder.__proto__ || Object.getPrototypeOf(KingTableRichHtmlBuilder)).call(this, table));

    _this2.options = _utils2.default.extend({}, KingTableRichHtmlBuilder.defaults, table.options, table.options.rhtml || table.options.html);
    _this2.setSeachHandler();

    var options = _this2.options,
        extraViews = options.extraViews;
    if (extraViews) {
      options.views = options.views.concat(_utils2.default.map(extraViews, function (o) {
        return normalizeExtraView(o);
      }));
    }

    // load settings from stores
    _this2.loadSettings();

    // initialize global menu event handlers
    if (!_kingtable2.default.initialized) {
      _kingtable2.default.setup();
    }

    _this2.filtersViewOpen = options.filtersView && options.filtersViewExpandable && options.filtersViewOpen;
    return _this2;
  }

  _createClass(KingTableRichHtmlBuilder, [{
    key: "setListeners",
    value: function setListeners() {
      var _this3 = this;

      _get(KingTableRichHtmlBuilder.prototype.__proto__ || Object.getPrototypeOf(KingTableRichHtmlBuilder.prototype), "setListeners", this).call(this);

      // additional listeners
      var self = this,
          table = self.table;
      if (!table || !table.element) return self;

      self.listenTo(table, {
        "change:pagination": function changePagination() {
          if (!_this3.rootElement) return true;
          self.updatePagination();
        },
        "get-list:failed": function getListFailed() {
          // pagination must be updated also in this case
          if (!_this3.rootElement) return true;
          self.updatePagination();
        }
      });
    }
  }, {
    key: "loadSettings",
    value: function loadSettings() {
      var self = this,
          o = self.options,
          table = self.table,
          store = table.getFiltersStore();
      if (!store) return self;

      // restore sort mode
      var storedSortMode = table.getPreference("sort-mode");
      if (storedSortMode) {
        o.sortMode = storedSortMode;
      }

      var storedViewType = table.getPreference("view-type");
      if (storedViewType) {
        o.view = storedViewType;
      }

      return self;
    }

    /**
     * Sets a client side search handler for the table.
     */

  }, {
    key: "setSeachHandler",
    value: function setSeachHandler() {
      var delay = this.options.searchDelay;
      function search(text) {
        var table = this.table;
        // set search, but only if the value is of sufficient length
        if (table.validateForSeach(text)) {
          // the value is sufficient to trigger a search
          table.search(text);
        } else if (table.isSearchActive()) {
          // unset search: the value is either too short or empty
          table.unsetSearch();
          table.render();
        }
        table.getFiltersSetCache(); // store filter in cache
        // continue normally
        return true;
      }

      this.search = _utils2.default.isNumber(delay) && delay > 0 ? _utils2.default.debounce(search, delay, this) : search;
      return this;
    }

    /**
     * Gets the view resolver currently used by this KingTableRichHtmlBuilder,
     * with validation.
     */

  }, {
    key: "getViewResolver",
    value: function getViewResolver() {
      var o = this.options,
          view = o.view,
          views = o.views;
      if (!_utils2.default.isString(view)) {
        (0, _raise2.default)(21, "Missing view configuration for Rich HTML builder");
      }
      var viewData = _utils2.default.find(views, function (v) {
        return v.name == view;
      });
      if (!viewData) {
        (0, _raise2.default)(22, "Missing view resolver for view: " + view);
      }
      var resolver = viewData.resolver;
      if (resolver === true) {
        // use the default functions
        return this;
      }
      if (!resolver) (0, _raise2.default)(33, "Missing resolver in view configuration '" + view + "'");

      // support both instantiable objects and plain objects
      if (!_utils2.default.isPlainObject(resolver)) resolver = new resolver();

      if (!_utils2.default.quacks(resolver, ["buildView"])) {
        (0, _raise2.default)(23, "Invalid resolver for view: " + view);
      }
      return resolver;
    }

    /**
     * Returns a caption element for the given table.
     */

  }, {
    key: "buildCaption",
    value: function buildCaption() {
      var table = this.table;
      var caption = table.options.caption;
      return caption ? new _html.VHtmlElement("div", {
        "class": "king-table-caption"
      }, new _html.VHtmlElement("span", {}, new _html.VTextElement(caption))) : null;
    }

    /**
     * Builds the given instance of KingTable in HTML.
     */

  }, {
    key: "build",
    value: function build() {
      var self = this;
      var table = self.table;
      var element = table.element;
      if (!element) {
        // for this class, it doesn't make sense if a table doesn't have an element.
        // raise(25, "Missing table element"); //TODO: handle for tests
        return self;
      }
      return self.ensureLayout().update();
    }

    /**
     * Ensures that the HTML layout is ready to display the bound table.
     */

  }, {
    key: "ensureLayout",
    value: function ensureLayout() {
      var self = this;
      if (self.rootElement) {
        return self;
      }
      var table = self.table,
          o = self.options,
          element = table.element,
          view = self.buildView(null, null, new _html.VHtmlFragment(" ")),
          caption = self.buildCaption(),
          root = self.buildRoot(caption, view);
      table.emit("empty:element", element);
      _dom2.default.empty(element);
      _dom2.default.addClass(element, KingTableClassName);
      element.innerHTML = root.toString();
      // add reference to root element
      self.rootElement = _dom2.default.findFirstByClass(element, "king-table-region");
      // bind events
      self.bindEvents();

      _utils2.default.ifcall(o.onLayoutRender, self, [element]);
      if (o.filtersView) {
        _utils2.default.ifcall(o.onFiltersRender, self, [_dom2.default.findFirstByClass(element, "kt-filters")]);
      }
      return self;
    }

    /**
     * Updates the current rendered view to current table state.
     */

  }, {
    key: "update",
    value: function update() {
      this.updatePagination().updateView();
    }

    /**
     * Updates the current rendered pagination view to current table state.
     */

  }, {
    key: "updatePagination",
    value: function updatePagination() {
      var table = this.table,
          data = table.pagination,
          rootElement = this.rootElement;
      if (!rootElement) {
        (0, _raise2.default)(26, "missing root element");
      }
      var reg = this.getReg(),
          o = table.options,
          data = table.pagination,
          page = data.page,
          totalPageCount = data.totalPageCount,
          resultsPerPage = data.resultsPerPage,
          firstObjectNumber = data.firstObjectNumber,
          lastObjectNumber = data.lastObjectNumber,
          totalItemsCount = data.totalItemsCount,
          dataAnchorTime = table.getFormattedAnchorTime(),
          isNum = _utils2.default.isNumber,
          findByClass = _dom2.default.findFirstByClass,
          addClass = _dom2.default.addClass,
          removeClass = _dom2.default.removeClass;

      var pageEl = findByClass(rootElement, "pagination-bar-page-number");
      pageEl.value = page;

      var sizeEl = findByClass(rootElement, "pagination-bar-results-select");
      sizeEl.value = resultsPerPage;

      var a = "pagination-button",
          b = "pagination-button-disabled";
      _utils2.default.each(["pagination-bar-first-page", "pagination-bar-prev-page"], function (name) {
        var el = findByClass(rootElement, name);
        if (page > 1) {
          addClass(el, a);
          removeClass(el, b);
        } else {
          addClass(el, b);
          removeClass(el, a);
        }
      });

      _utils2.default.each(["pagination-bar-last-page", "pagination-bar-next-page"], function (name) {
        var el = findByClass(rootElement, name);
        if (page < totalPageCount) {
          addClass(el, a);
          removeClass(el, b);
        } else {
          addClass(el, b);
          removeClass(el, a);
        }
      });

      var resultsInfo = "";
      if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
        resultsInfo += reg.results + (" " + firstObjectNumber + " - " + lastObjectNumber);
        if (isNum(totalItemsCount)) {
          resultsInfo += " " + reg.of + " - " + totalItemsCount;
        }
      }
      var anchorTimeInfo = "";
      if (dataAnchorTime && table.options.showAnchorTimestamp) {
        anchorTimeInfo = reg.anchorTime + " " + dataAnchorTime;
      }

      var info = {
        "results-info": resultsInfo,
        "anchor-timestamp-info": anchorTimeInfo,
        "total-page-count": reg.of + " " + totalPageCount
      },
          x;
      for (x in info) {
        var el = findByClass(rootElement, x);
        if (el) {
          el.innerHTML = info[x];
        }
      }

      var search = table.searchText || "";
      var searchEl = findByClass(rootElement, "search-field");
      // update the search element value, but only if it is not currently
      // focused. Because if it is focused, the user is using it.
      if (searchEl && searchEl.value != search && _dom2.default.isFocused(searchEl) == false) {
        searchEl.value = search;
      }

      return this;
    }

    /**
     * Updates the table view to the current table state.
     */

  }, {
    key: "updateView",
    value: function updateView() {
      var self = this,
          o = self.options,
          table = self.table,
          data = table.pagination,
          rootElement = self.rootElement;
      if (!rootElement) {
        (0, _raise2.default)(26, "missing root element");
      }

      // classes
      _utils2.default.each({
        "kt-search-active": table.searchText,
        "kt-search-sorting": table.options.searchSortingRules
      }, function (condition, key) {
        _dom2.default.modClass(rootElement, key, condition);
      });

      // get data to display
      var data = table.getData({
        format: true,
        hide: false
      });
      var viewEl = _dom2.default.findFirstByClass(rootElement, "king-table-view");
      if (!data || !data.length) {
        // display empty view inside the table view region
        viewEl.innerHTML = self.emptyView().toString();
        return self;
      }
      var columns = self.getFields();
      // do tools need to be built for the first time?
      // TODO: eventually, support reinitializing columns (current implementation supports only tables that do not change between ajax requests)
      if (self._must_build_tools) {
        // get element
        var toolsEl = document.getElementById(self.toolsRegionId);
        toolsEl.innerHTML = self.buildToolsInner(true);
        delete self._must_build_tools;
      }
      self.currentItems = data;
      var view = self.buildView(columns, data);
      viewEl.innerHTML = view.children[0].toString();
      _utils2.default.ifcall(o.onViewUpdate, self, [viewEl]); // call if exists
      return self;
    }

    /**
     * Displays a built table.
     */

  }, {
    key: "display",
    value: function display(built) {
      var table = this.table,
          o = this.options;
      // if a table has an element, assume that is a DOM element;
      if (!_utils2.default.isString(built)) built = built.toString();
      this.ensureLayout();
      var root = this.rootElement;
      // update view only
      var viewEl = _dom2.default.findFirstByClass(root, "king-table-view");
      viewEl.innerHTML = built;
      _utils2.default.ifcall(o.onViewUpdate, this, [viewEl]); // call if exists
    }

    /**
     * Builds a root virtual element for the given table, with given
     * table children.
     */

  }, {
    key: "buildRoot",
    value: function buildRoot(caption, view) {
      var table = this.table;
      var rootAttr = {
        "class": "king-table-region"
      };
      if (table.id) {
        rootAttr.id = table.id;
      }
      return new _html.VHtmlElement("div", rootAttr, [caption, this.buildPaginationBar(), this.buildFiltersView(), view]);
    }

    /**
     * Builds a header from given table and columns.
     *
     * @param {object[]} columns;
     * @param {object[]} data;
     */

  }, {
    key: "buildPaginationBar",
    value: function buildPaginationBar() {
      var table = this.table,
          reg = this.getReg(),
          o = this.options,
          data = table.pagination,
          page = data.page,
          totalPageCount = data.totalPageCount,
          resultsPerPage = data.resultsPerPage,
          firstObjectNumber = data.firstObjectNumber,
          lastObjectNumber = data.lastObjectNumber,
          totalItemsCount = data.totalItemsCount,
          filtersView = o.filtersView,
          filtersViewExpandable = filtersView && o.filtersViewExpandable,
          filtersViewOpen = filtersViewExpandable && o.filtersViewOpen,
          dataAnchorTime = table.getFormattedAnchorTime(),
          isNum = _utils2.default.isNumber;

      var resultsInfo = "";
      if (isNum(firstObjectNumber) && isNum(lastObjectNumber) && lastObjectNumber > 0) {
        resultsInfo += reg.results + (" " + firstObjectNumber + " - " + lastObjectNumber);
        if (isNum(totalItemsCount)) {
          resultsInfo += " " + reg.of + " - " + totalItemsCount;
        }
      }
      var anchorTimeInfo;
      if (dataAnchorTime && table.options.showAnchorTimestamp) {
        anchorTimeInfo = reg.anchorTime + " " + dataAnchorTime;
      }
      var advancedFilters = reg.advancedFilters;
      var searchElement = o.allowSearch ? new _html.VHtmlElement("span", {
        "class": "pagination-bar-filters"
      }, new _html.VHtmlElement("input", {
        "type": "text",
        "class": "search-field",
        "value": table.searchText || ""
      })) : null;
      var span = "span",
          separator = new _html.VHtmlElement(span, { "class": "separator" });
      return new _html.VHtmlElement("div", {
        "class": "pagination-bar"
      }, [this.buildTools(), new _html.VHtmlElement(span, { "class": "pagination-bar-buttons" }, [new _html.VHtmlElement(span, {
        "tabindex": "0",
        "class": "pagination-button pagination-bar-first-page oi",
        "data-glyph": "media-step-backward",
        "title": reg.firstPage
      }), new _html.VHtmlElement(span, {
        "tabindex": "0",
        "class": "pagination-button pagination-bar-prev-page oi",
        "data-glyph": "caret-left",
        "title": reg.prevPage
      }), separator, new _html.VHtmlElement(span, {
        "class": "valigned"
      }, new _html.VTextElement(reg.page)), new _html.VHtmlElement("input", {
        "type": "text",
        "name": "page-number",
        "class": "must-integer pagination-bar-page-number",
        "value": data.page
      }), new _html.VHtmlElement("span", {
        "class": "valigned total-page-count",
        "value": data.page
      }, new _html.VTextElement(reg.of + " " + data.totalPageCount)), separator, new _html.VHtmlElement(span, {
        "tabindex": "0",
        "class": "pagination-button pagination-bar-refresh oi",
        "data-glyph": "reload",
        "title": reg.refresh
      }), separator, new _html.VHtmlElement(span, {
        "tabindex": "0",
        "class": "pagination-button pagination-bar-next-page oi",
        "data-glyph": "caret-right",
        "title": reg.nextPage
      }), new _html.VHtmlElement(span, {
        "tabindex": "0",
        "class": "pagination-button pagination-bar-last-page oi",
        "data-glyph": "media-step-forward",
        "title": reg.lastPage
      }), separator, new _html.VHtmlElement(span, {
        "class": "valigned"
      }, new _html.VTextElement(reg.resultsPerPage)), new _html.VHtmlElement("select", {
        "name": "pageresults",
        "class": "pagination-bar-results-select valigned"
      }, _utils2.default.map(o.resultsPerPageSelect, function (x) {
        var a = new _html.VHtmlElement("option", {
          "value": x
        }, new _html.VTextElement(x.toString()));
        if (x === o.resultsPerPage) {
          a.attributes.selected = true;
        }
        return a;
      })), separator, resultsInfo ? new _html.VHtmlElement(span, {
        "class": "valigned results-info"
      }, new _html.VTextElement(resultsInfo)) : null, resultsInfo ? separator : null, anchorTimeInfo ? new _html.VHtmlElement(span, {
        "class": "valigned anchor-timestamp-info"
      }, new _html.VTextElement(anchorTimeInfo)) : null, searchElement ? separator : null, searchElement, filtersViewExpandable ? separator : null, filtersViewExpandable ? new _html.VHtmlElement("button", {
        "class": "btn valigned camo-btn kt-advanced-filters" + (filtersViewOpen ? " kt-open" : "")
      }, new _html.VTextElement(advancedFilters)) : null])]);
    }

    /**
     * Builds a header from given table and columns.
     *
     * @param {object[]} columns;
     * @param {object[]} data;
     */

  }, {
    key: "buildHead",
    value: function buildHead(columns) {
      var table = this.table;
      var builder = table.builder;
      var sortCriteria = table.sortCriteria,
          reg = builder.getReg();
      var row = new _html.VHtmlElement("tr", {}, _utils2.default.map(_utils2.default.values(columns), function (prop) {
        if (prop.hidden || prop.secret) {
          return; // skip
        }
        var sorting = false,
            order,
            classes = [prop.css];
        if (prop.sortable) {
          classes.push("sortable");
          // is the table currently sorted by this property?
          var sortedBy = _utils2.default.find(sortCriteria, function (x) {
            return x[0] === prop.name;
          });
          if (sortedBy) {
            sorting = true;
            order = sortedBy[1];
          }
        }
        var displayName = prop.displayName;
        var cell = new _html.VHtmlElement("th", { "class": classes.join(" "), "data-prop": prop.name }, new _html.VHtmlElement("div", {}, [new _html.VHtmlElement("span", {}, new _html.VTextElement(displayName)), sorting ? new _html.VHtmlElement("span", {
          "class": "oi kt-sort-glyph",
          "data-glyph": order == 1 ? "sort-ascending" : "sort-descending",
          "aria-hidden": true,
          "title": _utils2.default.format(order == 1 ? reg.sortAscendingBy : reg.sortDescendingBy, { name: displayName })
        }) : null]));

        return cell;
      }));
      return new _html.VHtmlElement("thead", { "class": "king-table-head" }, row);
    }

    /**
     * Builds a view for the given table.
     *
     * @param {KingTable} table;
     * @param {object[]} columns;
     * @param {object[]} data;
     */

  }, {
    key: "buildView",
    value: function buildView(columns, data, subView) {
      var table = this.table;
      var view;
      if (subView) {
        view = subView;
      } else if (!data || !data.length) {
        view = new _html.VHtmlElement("div", {
          "class": "king-table-view"
        }, this.emptyView());
      } else {
        var resolver = this.getViewResolver(),
            view;
        if (resolver === this) {
          // use default resolver
          view = new _html.VHtmlElement("table", {
            "class": "king-table"
          }, [this.buildHead(columns), this.buildBody(columns, data)]);
        } else {
          // use custom resolver
          // add reference to table and options
          resolver.table = this.table;
          resolver.options = table.options;

          view = resolver.buildView(table, columns, data);
          // remove reference
          delete resolver.table;
          delete resolver.options;
        }
      }
      // wrap in view root element
      return new _html.VHtmlElement("div", {
        "class": "king-table-view"
      }, view);
    }
  }, {
    key: "getTemplate",
    value: function getTemplate(option, type) {
      if (_utils2.default.isFunction(option)) {
        return option.call(this);
      }
      if (!_utils2.default.isString(option)) {
        (0, _raise2.default)(38, "Cannot obtain HTML from given parameter " + type + ", must be a function or a string.");
      }
      var element = document.getElementById(option);
      if (element != null) {
        if (/script/i.test(element.tagName)) {
          return element.innerText;
        }
        (0, _raise2.default)(38, "Cannot obtain HTML from parameter " + type + ". Element is not <script>.");
      }
      // option treated as html fragment itself
      return option;
    }

    /**
     * Builds a filters view for the given table.
     */

  }, {
    key: "buildFiltersView",
    value: function buildFiltersView() {
      var self = this,
          o = self.options,
          filtersView = o.filtersView;

      if (!filtersView) return;
      var filtersViewOpen = o.filtersViewOpen,
          filtersViewExpandable = o.filtersViewExpandable,
          template = self.getTemplate(filtersView, "filtersView"),
          css = ["kt-filters"];

      if (filtersViewOpen || !filtersViewExpandable) css.push("kt-open");
      if (filtersViewExpandable) css.push("kt-expandable");

      return new _html.VHtmlElement("div", {
        "class": css.join(" ")
      }, [new _html.VHtmlFragment(template)]);
    }

    /**
     * Builds a tools view for the given table.
     */

  }, {
    key: "buildTools",
    value: function buildTools() {
      // tools can be either built immediately (if columns information are ready);
      // or afterwards upon update
      var table = this.table,
          colsInitialized = table.columnsInitialized;
      if (!colsInitialized) {
        this._must_build_tools = true;
      }
      var _id = this.toolsRegionId = _utils2.default.uniqueId("tools-region");
      return new _html.VHtmlElement("div", {
        "id": _id,
        "class": "tools-region"
      }, this.buildToolsInner(colsInitialized));
    }
  }, {
    key: "buildToolsInner",
    value: function buildToolsInner(colsInitialized) {
      return new _html.VWrapperElement([new _html.VHtmlElement("span", {
        "class": "oi ug-expander",
        "tabindex": "0",
        "data-glyph": "cog"
      }), colsInitialized ? this.buildMenu() : null]);
    }
  }, {
    key: "buildMenu",
    value: function buildMenu() {
      var self = this,
          o = self.options,
          extraTools = o.tools;

      var tools = [self.getColumnsMenuSchema(), self.getViewsMenuSchema(), o.allowSortModes ? self.getSortModeSchema() : null, self.getExportMenuSchema()];

      if (extraTools) {
        if (_utils2.default.isFunction(extraTools)) extraTools = extraTools.call(this);
        if (extraTools) {
          if (!_utils2.default.isArray(extraTools)) {
            (0, _raise2.default)(40, "Tools is not an array or a function returning an array.");
          }
          tools = tools.concat(extraTools);
        }
      }

      if (o.prepTools) {
        if (!_utils2.default.isFunction(o.prepTools)) {
          (0, _raise2.default)(41, "prepTools option must be a function.");
        }
        o.prepTools.call(this, tools);
      }

      return (0, _kingtableMenu.menuBuilder)({
        items: tools
      });
    }
  }, {
    key: "getSortModeSchema",
    value: function getSortModeSchema() {
      var reg = this.getReg();
      var options = this.options,
          currentMode = options.sortMode;
      var items = _utils2.default.map(SortModes, function (key, value) {
        return {
          name: reg.sortModes[value],
          checked: currentMode == value,
          type: "radio",
          value: value, // this is the radio value; and is required
          attr: {
            "name": "kt-sort-mode",
            "class": "sort-mode-radio"
          }
        };
      });
      return {
        name: reg.sortOptions,
        menu: {
          items: items
        }
      };
    }

    /**
     * Builds a default schema for columns menu.
     */

  }, {
    key: "getColumnsMenuSchema",
    value: function getColumnsMenuSchema() {
      // TODO: allow to disable by configuration
      if (!this.table.columns || !this.table.columns.length) {
        throw "Columns not initialized.";
      }
      var columns = _utils2.default.where(this.table.columns, function (x) {
        return !x.secret;
      });
      var reg = this.getReg();
      return {
        name: reg.columns,
        menu: {
          items: _utils2.default.map(columns, function (x) {
            return {
              name: x.displayName,
              checked: !x.hidden,
              type: CHECKBOX_TYPE,
              attr: {
                "name": x.name,
                "class": "visibility-check"
              }
            };
          })
        }
      };
    }

    /**
     * Builds a default schema for views menu.
     */

  }, {
    key: "getViewsMenuSchema",
    value: function getViewsMenuSchema() {
      var reg = this.getReg();
      var o = this.options,
          views = o.views,
          currentView = o.view;
      var items = _utils2.default.map(views, function (o) {
        var value = o.name;
        return {
          name: reg.viewsType[value] || value,
          checked: currentView == value,
          type: "radio",
          value: value,
          attr: {
            "name": "kt-view-type",
            "class": "view-type-radio"
          }
        };
      });
      return {
        name: reg.view,
        menu: {
          items: items
        }
      };
    }

    /**
     * Builds a default schema for export tools.
     */

  }, {
    key: "getExportMenuSchema",
    value: function getExportMenuSchema() {
      var table = this.table,
          exportFormats = table.options.exportFormats;
      if (!exportFormats || !exportFormats.length) return null; // disabled
      // if the client does not support client side export, remove the client side export formats
      if (!_file2.default.supportsCsExport()) {
        exportFormats = _utils2.default.reject(exportFormats, function (o) {
          return o.cs || o.clientSide;
        });
      }
      if (!exportFormats || !exportFormats.length) return null; // disabled

      var reg = this.getReg();

      var items = _utils2.default.map(exportFormats, function (o) {
        return {
          name: reg.exportFormats[o.format] || o.name,
          attr: {
            css: "export-btn",
            "data-format": o.format
          }
        };
      });

      return {
        name: reg.export,
        menu: {
          items: items
        }
      };
    }
  }, {
    key: "goToPrev",
    value: function goToPrev() {
      this.table.pagination.prev();
    }
  }, {
    key: "goToNext",
    value: function goToNext() {
      this.table.pagination.next();
    }
  }, {
    key: "goToFirst",
    value: function goToFirst() {
      this.table.pagination.first();
    }
  }, {
    key: "goToLast",
    value: function goToLast() {
      this.table.pagination.last();
    }
  }, {
    key: "refresh",
    value: function refresh() {
      this.table.refresh();
    }
  }, {
    key: "changePage",
    value: function changePage(e) {
      var v = e.target.value;
      if (/^\d+$/.test(v) && this.table.pagination.validPage(parseInt(v))) {
        // update
        this.table.pagination.page = parseInt(v);
        this.table.render();
      } else {
        // revert value
        e.target.value = this.table.pagination.page;
      }
    }
  }, {
    key: "changeResultsNumber",
    value: function changeResultsNumber(e) {
      var v = e.target.value;
      this.table.pagination.resultsPerPage = parseInt(v);
      this.table.render();
    }

    /**
     * Obtains the item related to the given event.
     * 
     * @param Event e: event
     */

  }, {
    key: "getItemByEv",
    value: function getItemByEv(e, ignoreMissing) {
      if (!e) return;
      return this.getItemByEl(e.target, ignoreMissing);
    }

    /**
     * Obtains the item to which a given HTML pertains.
     * 
     * @param HTMLElement el: element
     */

  }, {
    key: "getItemByEl",
    value: function getItemByEl(el, ignoreMissing) {
      if (!el) return;
      var itemElement = _dom2.default.closestWithClass(el, "kt-item");
      if (!itemElement) {
        // the element is not contained in an kt-item
        if (ignoreMissing) return;
        // not what the user of the library wants
        (0, _raise2.default)(36, "Cannot retrieve an item by event data. Make sure that HTML elements generated for table items have 'kt-item' class.");
      }
      var itemIx = itemElement.dataset.itemIx;
      if (_utils2.default.isUnd(itemIx)) {
        (0, _raise2.default)(37, "Cannot retrieve an item by element data. Make sure that HTML elements generated for table items have 'data-ix' attribute.");
      }
      return this.currentItems[itemIx]; //_.find(this.currentItems, i => i.__ix__ == itemIx);
    }
  }, {
    key: "onItemClick",
    value: function onItemClick(e) {
      var item = this.getItemByEl(e.target),
          options = this.options,
          pure = options.purist,
          und;
      options.onItemClick.call(this, item, pure ? und : e);
    }
  }, {
    key: "toggleAdvancedFilters",
    value: function toggleAdvancedFilters() {
      var name = "filtersViewOpen",
          oc = "kt-open";
      var filtersView = _dom2.default.findByClass(this.rootElement, "kt-filters")[0];
      var open = _dom2.default.hasClass(filtersView, oc);
      this[name] = !open;
      _dom2.default.modClass(filtersView, oc, this[name]);
    }
  }, {
    key: "clearFilters",
    value: function clearFilters() {
      // TODO
    }
  }, {
    key: "sort",
    value: function sort(e) {
      var el = e.target,
          options = this.options;
      // if sorting by search, ignore
      if (this.table.searchText && options.searchSortingRules) {
        return true;
      }

      if (!/th/i.test(el.tagName)) {
        el = _dom2.default.closestWithTag(el, "th");
      }
      var property = el.dataset.prop,
          table = this.table;;
      if (property && _utils2.default.any(this.table.columns, function (x) {
        return x.name == property;
      })) {
        switch (options.sortMode) {
          case SortModes.Simple:
            // sort by single property
            table.progressSortBySingle(property);
            break;
          case SortModes.Complex:
            // sort by multiple properties, in order of definition
            table.progressSortBy(property);
            break;
          default:
            (0, _raise2.default)(28, "Invalid sort mode options. Value must be either 'simple' or 'complex'.");
        }
      }
    }
  }, {
    key: "onSearchKeyUp",
    value: function onSearchKeyUp(e) {
      var a = e.target.value;
      this.search(a);
    }
  }, {
    key: "onSearchChange",
    value: function onSearchChange(e) {
      var a = e.target.value;
      this.search(a);
    }
  }, {
    key: "viewToModel",
    value: function viewToModel() {
      console.log("TODO");
    }
  }, {
    key: "prepareEvents",
    value: function prepareEvents(events, purist) {
      if (!events) return;
      if (_utils2.default.isFunction(events)) events = events.call(this);
      var x,
          newObj = {};

      var _loop = function _loop() {
        var fn = events[x];
        newObj[x] = _utils2.default.isString(fn) ? fn : function (e) {
          var item = this.getItemByEv(e, true);
          if (purist) {
            var re = fn.call(this, item);
          } else {
            var re = fn.call(this, e, item);
          }
          return re === false ? false : true;
        };
      };

      for (x in events) {
        _loop();
      }
      return newObj;
    }
  }, {
    key: "getEvents",
    value: function getEvents() {
      var options = this.options,
          purist = options.purist,
          events = options.events,
          ievents = options.ievents;
      // wrap custom events to receive the item as first parameter (if available), and maybe the event
      events = this.prepareEvents(events, purist);
      ievents = this.prepareEvents(ievents, true);
      var baseevents = this.getBaseEvents();
      return _utils2.default.extend({}, baseevents, events, ievents);
    }
  }, {
    key: "setSortMode",
    value: function setSortMode(name) {
      this.options.sortMode = name;
      // store sort mode in memory;
      this.table.storePreference("sort-mode", name);
    }
  }, {
    key: "setViewType",
    value: function setViewType(name) {
      this.options.view = name;
      // store sort mode in memory;
      this.table.storePreference("view-type", name);
      this.table.render();
    }
  }, {
    key: "getColumnsVisibility",
    value: function getColumnsVisibility() {
      var columnsCheckbox = _dom2.default.findByClass(this.rootElement, "visibility-check");
      return _utils2.default.map(columnsCheckbox, function (x) {
        return { name: _dom2.default.attr(x, "name"), visible: x.checked };
      });
    }

    /**
     * Event handler for default columns visibility checkbox change.
     */

  }, {
    key: "onColumnVisibilityChange",
    value: function onColumnVisibilityChange() {
      var columnsVisibility = this.getColumnsVisibility();
      this.table.toggleColumns(columnsVisibility);
    }
  }, {
    key: "onViewChange",
    value: function onViewChange(e) {
      if (!e) return true;
      var target = e.target;
      this.setViewType(target.value);
    }
  }, {
    key: "onSortModeChange",
    value: function onSortModeChange(e) {
      if (!e) return true;
      var target = e.target;
      this.setSortMode(target.value);
    }
  }, {
    key: "onExportClick",
    value: function onExportClick(e) {
      var el = e.target,
          format = el.dataset.format;
      if (!format) {
        (0, _raise2.default)(29, "Missing format in export element's dataset.");
      }
      this.table.exportTo(format);
    }
  }, {
    key: "getBaseEvents",
    value: function getBaseEvents() {
      var baseevents = {
        "click .pagination-bar-first-page": "goToFirst",
        "click .pagination-bar-last-page": "goToLast",
        "click .pagination-bar-prev-page": "goToPrev",
        "click .pagination-bar-next-page": "goToNext",
        "click .pagination-bar-refresh": "refresh",
        "change .pagination-bar-page-number": "changePage",
        "change .pagination-bar-results-select": "changeResultsNumber",
        "click .kt-advanced-filters": "toggleAdvancedFilters",
        "click .btn-clear-filters": "clearFilters",
        "click .king-table-head th.sortable": "sort",
        "keyup .search-field": "onSearchKeyUp",
        "paste .search-field, cut .search-field": "onSearchChange",
        "keyup .filters-region input[type='text']": "viewToModel",
        "keyup .filters-region textarea": "viewToModel",
        "change .filters-region input[type='checkbox']": "viewToModel",
        "change .filters-region input[type='radio']": "viewToModel",
        "change .filters-region select": "viewToModel",
        "change .visibility-check": "onColumnVisibilityChange",
        "click .export-btn": "onExportClick",
        "change [name='kt-view-type']": "onViewChange",
        "change [name='kt-sort-mode']": "onSortModeChange"
      };
      // different input types
      _utils2.default.each("text date datetime datetime-local email tel time search url week color month number".split(" "), function (inputType) {
        baseevents["change .filters-region input[type='" + inputType + "']"] = "viewToModel";
      });
      var options = this.options;
      if (options.onItemClick) {
        baseevents["click .kt-item"] = "onItemClick";
      }
      return baseevents;
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      var a = "__events__bound";
      if (this[a]) return this;
      this[a] = 1;
      return this.delegateEvents().bindWindowEvents();
    }
  }, {
    key: "anyMenuIsOpen",
    value: function anyMenuIsOpen() {
      return false; // TODO
    }
  }, {
    key: "bindWindowEvents",
    value: function bindWindowEvents() {
      if (typeof window != "undefined") {
        var self = this.unbindWindowEvents();
        _dom2.default.on(document.body, "keydown.king-table", function (e) {
          //if any menu is open, or any input is focused, do nothing
          if (_dom2.default.anyInputFocused() || self.anyMenuIsOpen()) return true;
          var kc = e.keyCode;
          //if the user clicked the left arrow, or A, go to previous page
          if (_utils2.default.contains([37, 65], kc)) {
            //prev page
            self.goToPrev();
          }
          //if the user clicked the right arrow, or D, go to next page
          if (_utils2.default.contains([39, 68], kc)) {
            //next page
            self.goToNext();
          }
        });
      }
      //TODO: support swipe events; using HammerJs library
      return this;
    }
  }, {
    key: "unbindWindowEvents",
    value: function unbindWindowEvents() {
      if (typeof window != "undefined") {
        var self = this;
        _dom2.default.off(document.body, "keydown.king-table");
      }
      return this;
    }

    /**
     * Applies event handlers.
     */

  }, {
    key: "delegateEvents",
    value: function delegateEvents() {
      var self = this,
          table = self.table,
          options = self.options,
          root = self.table.element,
          events = self.getEvents(),
          delegateEventSplitter = /^(\S+)\s*(.*)$/;
      self.undelegateEvents();
      for (var key in events) {
        var val = events[key],
            method = val;
        if (!method) (0, _raise2.default)(27, "Invalid method definition");
        // if method try to read from builder itself
        if (!_utils2.default.isFunction(method)) method = self[method];
        if (!method && _utils2.default.isFunction(options[val]))
          // try to read from options
          method = options[val];

        if (!_utils2.default.isFunction(method)) throw new Error("method not defined inside the model: " + events[key]);
        var match = key.match(delegateEventSplitter);
        var eventName = match[1],
            selector = match[2];
        method = _utils2.default.bind(method, self);
        eventName += ".delegate";
        if (selector === "") {
          // TODO: support
          throw new Error("delegates without selector are not implemented");
        } else {
          _dom2.default.on(root, eventName, selector, method);
        }
      }
      var a = "__events__bound";
      self[a] = 0;
      return self;
    }

    /**
     * Clears all event handlers associated with this table builder.
     */

  }, {
    key: "undelegateEvents",
    value: function undelegateEvents() {
      _dom2.default.off(this.table.element);
      return this;
    }

    /**
     * Disposes of this KingTableRichHtmlBuilder.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      // undelegate events
      this.undelegateEvents().unbindWindowEvents();
      // remove element
      _dom2.default.remove(this.rootElement);
      _dom2.default.removeClass(this.table.element, KingTableClassName);

      // removes reference to root element (it gets removed from DOM inside base dispose)
      this.currentItems = this.rootElement = null;
      _get(KingTableRichHtmlBuilder.prototype.__proto__ || Object.getPrototypeOf(KingTableRichHtmlBuilder.prototype), "dispose", this).call(this);
    }
  }, {
    key: "emptyView",
    value: function emptyView() {
      var reg = this.getReg();
      return new _html.VHtmlElement("div", { "class": "king-table-empty" }, new _html.VHtmlElement("span", 0, new _html.VTextElement(reg.noData)));
    }
  }, {
    key: "errorView",
    value: function errorView(message) {
      if (!message) {
        message = this.getReg().errorFetchingData;
      }
      return new _html.VHtmlFragment("<div class=\"king-table-error\">\n      <span class=\"message\">\n        <span>" + message + "</span>\n        <span class=\"oi\" data-glyph=\"warning\" aria-hidden=\"true\"></span>\n      </span>\n    </div>");
    }
  }, {
    key: "loadingView",
    value: function loadingView() {
      var reg = this.getReg();
      return new _html.VHtmlElement("div", {
        "class": "loading-info"
      }, [new _html.VHtmlElement("span", {
        "class": "loading-text"
      }, new _html.VTextElement(reg.loading)), new _html.VHtmlElement("span", {
        "class": "mini-loader"
      })]);
    }
  }, {
    key: "singleLine",
    value: function singleLine() {
      throw new Error("make targeted updates");
    }
  }], [{
    key: "BaseHtmlBuilder",
    get: function get() {
      return _kingtableHtmlBase2.default;
    }
  }, {
    key: "DomUtils",
    get: function get() {
      return _dom2.default;
    }
  }]);

  return KingTableRichHtmlBuilder;
}(_kingtableHtml2.default);

KingTableRichHtmlBuilder.defaults = {
  view: "table",
  views: [{ name: "table", resolver: true }, { name: "gallery", resolver: KingTableRhGalleryViewResolver }],
  filtersView: null, // allows to define a view for advanced filters
  filtersViewExpandable: true, // whether the advanced filters view should be expandable; or always visible.
  filtersViewOpen: false, // whether filters view should be automatically displayed, upon table render.
  searchDelay: 50,
  sortMode: SortModes.Simple,
  allowSortModes: true, // whether to allow selecting sort mode
  purist: false, // whether to exclude event and other DOM data in high level callbacks

  // Permits to specify the options of the results per page select
  resultsPerPageSelect: [10, 30, 50, 100, 200],

  // Permits to specify extra tools for this table
  tools: null,

  // Allows to alter tools before render
  prepTools: null,

  // Whether to automatically highlight values that answer to text search criteria.
  autoHighlightSearchProperties: true
};

exports.default = KingTableRichHtmlBuilder;

},{"../../scripts/data/file":11,"../../scripts/data/html":12,"../../scripts/dom":19,"../../scripts/menus/kingtable.menu":25,"../../scripts/menus/kingtable.menu.html":24,"../../scripts/raise":26,"../../scripts/tables/kingtable.html.base.builder":28,"../../scripts/tables/kingtable.html.builder":29,"../../scripts/utils":34}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kingtable = require("../../scripts/tables/kingtable.builder");

var _kingtable2 = _interopRequireDefault(_kingtable);

var _textSlider = require("../../scripts/literature/text-slider");

var _exceptions = require("../../scripts/exceptions");

var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

var _utils = require("../../scripts/utils");

var _utils2 = _interopRequireDefault(_utils);

var _string = require("../../scripts/components/string");

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * KingTable plain text builder.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Defines a table builder that renders tabular data in plain text,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * suitable for debug, unit tests, console output and plain text emails.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SPACE = " ";
var RN = "\r\n";
var LINE_SEP = _string2.default.repeat("*", 65);

var KingTableTextBuilder = function (_KingTableBuilder) {
  _inherits(KingTableTextBuilder, _KingTableBuilder);

  /**
   * Creates a new instance of KingTableTextBuilder associated with the given table.
   */
  function KingTableTextBuilder(table) {
    _classCallCheck(this, KingTableTextBuilder);

    var _this = _possibleConstructorReturn(this, (KingTableTextBuilder.__proto__ || Object.getPrototypeOf(KingTableTextBuilder)).call(this, table));

    _this.slider = new _textSlider.TextSlider("....");
    _this.setListeners(table);
    return _this;
  }

  /**
   * Sets listeners for the given table.
   */


  _createClass(KingTableTextBuilder, [{
    key: "setListeners",
    value: function setListeners(table) {
      if (!table) return;
      var self = this;

      if (table.element && KingTableTextBuilder.options.handleLoadingInfo) {
        self.listenTo(table, "fetching:data", function () {
          self.loadingHandler(table);
        });
        self.listenTo(table, "fetched:data", function () {
          self.unsetLoadingHandler();
        });
        self.listenTo(table, "fetch:fail", function () {
          self.unsetLoadingHandler().display(table, self.errorView());
        });
        self.listenTo(table, "no-results", function () {
          self.unsetLoadingHandler().display(table, self.emptyView());
        });
      }
    }

    /**
     * Global options for every KingTableTextBuilder.
     */

  }, {
    key: "singleLine",


    /**
     * Returns an information for the table in a single line, including
     * table caption and pagination information, if available.
     */
    value: function singleLine(table, line) {
      return this.tabulate([[line]], [], _utils2.default.extend({
        caption: table.options.caption
      }, table.pagination.totalPageCount > 0 ? table.pagination.data() : null));
    }

    /**
     * Returns an error view.
     */

  }, {
    key: "errorView",
    value: function errorView() {
      var table = this.table;
      var reg = this.getReg();
      return this.singleLine(table, reg.errorFetchingData);
    }
  }, {
    key: "loadingHandler",
    value: function loadingHandler(table) {
      var self = this;
      self.unsetLoadingHandler();
      var slider = this.slider;
      var reg = this.getReg();
      var label = reg.loading + " ";

      var delayInfo = table.hasData() ? KingTableTextBuilder.options.loadInfoDelay : 0;
      // display a loading information, but only if waiting for more than n milliseconds
      var element = table.element;
      self.showLoadingTimeout = setTimeout(function () {
        if (!table.loading) {
          return self.unsetLoadingHandler();
        }
        var text = self.singleLine(table, label + slider.next());
        if (element) {
          element.innerHTML = text;
        }

        // set interval, to display a nice text animation while loading
        //
        self.loadingInterval = setInterval(function () {
          if (!table.loading) {
            return self.unsetLoadingHandler();
          }
          var text = self.singleLine(table, label + slider.next());
          element.innerHTML = text;
        }, 600);
      }, delayInfo);
    }
  }, {
    key: "unsetLoadingHandler",
    value: function unsetLoadingHandler() {
      clearInterval(this.loadingInterval);
      clearTimeout(this.showLoadingTimeout);
      this.loadingInterval = this.showLoadingTimeout = null;
      return this;
    }

    /**
     * Disposes of this KingTableTextBuilder.
     */

  }, {
    key: "dispose",
    value: function dispose() {
      var element = table.element;
      if (element) {
        element.innerHTML = "";
      }
      this.stopListening(this.table);
      this.table = null;
      this.slider = null;
    }

    /**
     * Displays a built table.
     */

  }, {
    key: "display",
    value: function display(table, built) {
      //
      // NB: aside from this piece of code, this class is abstracted
      // from DOM manipulation;
      // If a table has an element, assume that is a DOM element;
      //
      var element = table.element;
      if (element) {
        //
        // NB: this class does not set any event handler,
        // hence does not try to unset any event handler when removing an element.
        //
        // a custom event is fired, so the user of the library can unset any event added
        // by other means (e.g. vanilla JavaScript or jQuery)
        //
        table.emit("empty:element", element);
        while (element.hasChildNodes()) {
          element.removeChild(element.lastChild);
        }
        if (element.tagName != "PRE") {
          // append a PRE element
          var child = document.createElement("pre");
          element.appendChild(child);
          element = child;
        }
        element.innerHTML = built;
        //
        // TODO: add method to dispose the element for each view handler?
      }
    }

    /**
     * Builds the given instance of KingTable in plain text.
     */

  }, {
    key: "build",
    value: function build(table) {
      if (!table) table = this.table;
      var a = table.getData({
        optimize: true,
        format: true
      });
      if (!a || !a.length) {
        return this.display(table, this.emptyView());
      }
      var headers = a.shift();
      var built = this.tabulate(headers, a, _utils2.default.extend({
        caption: table.options.caption,
        dataAnchorTime: table.options.showAnchorTimestamp ? table.getFormattedAnchorTime() : null
      }, table.pagination.data()));
      //
      // display the table:
      //
      this.display(table, built);
    }
  }, {
    key: "emptyView",
    value: function emptyView() {
      var reg = this.getReg();
      return LINE_SEP + RN + reg.noData + RN + LINE_SEP;
    }
  }, {
    key: "paginationInfo",
    value: function paginationInfo(data) {
      var s = "",
          sep = " - ";
      var reg = this.getReg(),
          page = data.page,
          totalPageCount = data.totalPageCount,
          firstObjectNumber = data.firstObjectNumber,
          lastObjectNumber = data.lastObjectNumber,
          totalItemsCount = data.totalItemsCount,
          dataAnchorTime = data.dataAnchorTime,
          isNum = _utils2.default.isNumber;
      if (isNum(page)) {
        s += reg.page + SPACE + page;

        if (isNum(totalPageCount)) {
          s += SPACE + reg.of + SPACE + totalPageCount;
        }

        if (isNum(firstObjectNumber) && isNum(lastObjectNumber)) {
          s += sep + reg.results + _string2.default.format(" {0} - {1}", firstObjectNumber, lastObjectNumber);
          if (isNum(totalItemsCount)) {
            s += _string2.default.format(" " + reg.of + " {0}", totalItemsCount);
          }
        }
      }
      if (dataAnchorTime) {
        s += sep + (reg.anchorTime + " " + dataAnchorTime);
      }
      return s;
    }

    /**
     * Sanitizes a string for display in a plain text table.
     */

  }, {
    key: "checkValue",
    value: function checkValue(s) {
      if (!s) return "";
      if (typeof s != "string") s = s.toString();
      return s ? s.replace(/\r/g, "␍").replace(/\n/g, "␊") : "";
    }

    /**
     * Creates a plain text tabular representation of data, given a set of headers and rows of values.
     * NB: this function is not responsible of formatting values! e.g. create string representations of numbers or dates
     *
     * @example
     * // returns +-------+-------+-------+
                  |  id   | name  | value |
                  +-------+-------+-------+
                  | 1     | AAA   | A11   |
                  +-------+-------+-------+
                  | 2     | BBB   | B11   |
                  +-------+-------+-------+
                  | 3     | CCC   | C11   |
                  +-------+-------+-------+
                  | 4     | DDD   | D11   |
                  +-------+-------+-------+
        var a = new KingTableTextBuilder();
        a.tabulate(["id", "name", "value"],
        [
          [1, "AAA", "A11"],
          [2, "BBB", "B11"],
          [3, "CCC", "C11"],
          [4, "DDD", "D11"]
        ]);
     */

  }, {
    key: "tabulate",
    value: function tabulate(headers, rows, options) {
      var _this2 = this;

      if (!_utils2.default.isArray(headers)) (0, _exceptions.TypeException)("headers", "array");
      if (!rows) (0, _exceptions.TypeException)("rows", "array");
      if (_utils2.default.any(rows, function (x) {
        return !_utils2.default.isArray(x);
      })) (0, _exceptions.TypeException)("rows child", "array");
      var o = _utils2.default.extend({}, KingTableTextBuilder.options, options || {});
      var headersAlignment = o.headersAlignment,
          rowsAlignment = o.rowsAlignment,
          padding = o.padding,
          cornerChar = o.cornerChar,
          headerLineSeparator = o.headerLineSeparator,
          cellVerticalLine = o.cellVerticalLine,
          cellHorizontalLine = o.cellHorizontalLine,
          minCellWidth = o.minCellWidth,
          headerCornerChar = o.headerCornerChar;
      if (padding < 0) (0, _exceptions.OutOfRangeException)("padding", 0);
      var self = this;
      // validate the length of headers and of each row: it must be the same
      var headersLength = headers.length;
      if (!headersLength) (0, _exceptions.ArgumentException)("headers must contain at least one item");
      if (_utils2.default.any(rows, function (x) {
        x.length != headersLength;
      })) (0, _exceptions.ArgumentException)("each row must contain the same number of items");

      var s = "";

      // sanitize all values
      _utils2.default.reach(headers, function (x) {
        return _this2.checkValue(x);
      });
      _utils2.default.reach(rows, function (x) {
        return _this2.checkValue(x);
      });

      var valueLeftPadding = _string2.default.ofLength(SPACE, padding);
      padding = padding * 2;
      // for each column, get the cell width
      var cols = _utils2.default.cols([headers].concat(rows)),
          colsLength = _utils2.default.map(cols, function (x) {
        return Math.max(_utils2.default.max(x, function (y) {
          return y.length;
        }), minCellWidth) + padding;
      });
      // does the table contains a caption?
      var totalRowLength;
      var caption = o.caption,
          checkLength = 0;
      if (caption) {
        checkLength = padding + caption.length + 2;
      }

      // does option contains information about the pagination?
      var paginationInfo = self.paginationInfo(o);
      if (paginationInfo) {
        // is the pagination info bigger than whole row length?
        var pageInfoLength = padding + paginationInfo.length + 2;
        checkLength = Math.max(checkLength, pageInfoLength);
      }

      // check if the last column length should be adapted to the header length
      if (checkLength > 0) {
        totalRowLength = _utils2.default.sum(colsLength) + colsLength.length + 1;
        if (checkLength > totalRowLength) {
          var fix = checkLength - totalRowLength;
          colsLength[colsLength.length - 1] += fix;
          totalRowLength = checkLength;
        }
      }

      if (caption) {
        s += cellVerticalLine + valueLeftPadding + caption + _string2.default.ofLength(SPACE, totalRowLength - caption.length - 3) + cellVerticalLine + RN;
      }
      if (paginationInfo) {
        s += cellVerticalLine + valueLeftPadding + paginationInfo + _string2.default.ofLength(SPACE, totalRowLength - paginationInfo.length - 3) + cellVerticalLine + RN;
      }

      var headCellsSeps = _utils2.default.map(colsLength, function (l) {
        return _string2.default.ofLength(headerLineSeparator, l);
      }),
          cellsSeps = _utils2.default.map(colsLength, function (l) {
        return _string2.default.ofLength(cellHorizontalLine, l);
      });

      var headerLineSep = "";
      // add the first line
      _utils2.default.each(headers, function (x, i) {
        headerLineSep += headerCornerChar + headCellsSeps[i];
      });
      // add last vertical separator
      headerLineSep += headerCornerChar + RN;

      if (paginationInfo || caption) {
        s = headerLineSep + s;
      }
      s += headerLineSep;

      // add headers
      _utils2.default.each(headers, function (x, i) {
        s += cellVerticalLine + self.align(valueLeftPadding + x, colsLength[i], headersAlignment);
      });

      // add last vertical singleLineSeparator
      s += cellVerticalLine + RN;

      // add header separator
      s += headerLineSep;

      // build line separator
      var lineSep = "",
          i;
      for (i = 0; i < headersLength; i++) {
        lineSep += cornerChar + cellsSeps[i];
      }lineSep += cornerChar;

      // build rows
      var rowsLength = rows.length,
          j,
          row,
          value;
      for (i = 0; i < rowsLength; i++) {
        row = rows[i];
        for (j = 0; j < headersLength; j++) {
          value = row[j];
          s += cellVerticalLine + self.align(valueLeftPadding + value, colsLength[j], rowsAlignment);
        }
        s += cellVerticalLine + RN;
        s += lineSep + RN;
      }
      return s;
    }

    /**
     * Applies an alignment to the given text, using the given length and filler, by alignment code.
     */

  }, {
    key: "align",
    value: function align(text, length, alignment, filler) {
      if (!filler) filler = SPACE;
      if (!alignment) (0, _exceptions.ArgumentNullException)("alignment");
      switch (alignment) {
        case "c":
        case "center":
          return _string2.default.center(text, length, filler);
        case "l":
        case "left":
          return _string2.default.ljust(text, length, filler);
          break;
        case "r":
        case "right":
          return _string2.default.rjust(text, length, filler);
        default:
          (0, _exceptions.ArgumentException)("alignment: " + alignment);
      }
    }
  }], [{
    key: "options",
    get: function get() {
      return {
        headerLineSeparator: "=",
        headerCornerChar: "=",
        cornerChar: "+",
        headersAlignment: "l",
        rowsAlignment: "l",
        padding: 1,
        cellVerticalLine: "|",
        cellHorizontalLine: "-",
        minCellWidth: 0,
        handleLoadingInfo: true, // whether to display loading information (suitable for console applications)
        loadInfoDelay: 500 // how many milliseconds should wait, before displaying the "Loading..." information
      };
    }
  }]);

  return KingTableTextBuilder;
}(_kingtable2.default);

exports.default = KingTableTextBuilder;

},{"../../scripts/components/string":7,"../../scripts/exceptions":20,"../../scripts/literature/text-slider":23,"../../scripts/raise":26,"../../scripts/tables/kingtable.builder":27,"../../scripts/utils":34}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _exceptions = require("../scripts/exceptions");

/**
 * Generic utilities to work with objects and functions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
var OBJECT = "object",
    STRING = "string",
    NUMBER = "number",
    FUNCTION = "function",
    LEN = "length",
    REP = "replace";

function map(a, fn) {
  if (!a || !a[LEN]) {
    if (isPlainObject(a)) {
      var x,
          b = [];
      for (x in a) {
        b.push(fn(x, a[x]));
      }
      return b;
    }
  };
  var b = [];
  for (var i = 0, l = a[LEN]; i < l; i++) {
    b.push(fn(a[i]));
  }return b;
}
function each(a, fn) {
  if (isPlainObject(a)) {
    for (var x in a) {
      fn(a[x], x);
    }return a;
  }
  if (!a || !a[LEN]) return a;
  for (var i = 0, l = a[LEN]; i < l; i++) {
    fn(a[i], i);
  }
}
function exec(fn, j) {
  for (var i = 0; i < j; i++) {
    fn(i);
  }
}
function isString(s) {
  return (typeof s === "undefined" ? "undefined" : _typeof(s)) == STRING;
}
function isNumber(o) {
  // in JavaScript NaN (Not a Number) if of type "number" (curious..)
  // However, when checking if something is a number it's desirable to return
  // false if it is NaN!
  if (isNaN(o)) {
    return false;
  }
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == NUMBER;
}
function isFunction(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == FUNCTION;
}
function isObject(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == OBJECT;
}
function isArray(o) {
  return o instanceof Array;
}
function isDate(o) {
  return o instanceof Date;
}
function isRegExp(o) {
  return o instanceof RegExp;
}
function isPlainObject(o) {
  return (typeof o === "undefined" ? "undefined" : _typeof(o)) == OBJECT && o !== null && o.constructor == Object;
}
function isEmpty(o) {
  if (!o) return true;
  if (isArray(o)) {
    return o.length == 0;
  }
  if (isPlainObject(o)) {
    var x;
    for (x in o) {
      return false;
    }
    return true;
  }
  if (isString(o)) {
    return o === "";
  }
  if (isNumber(o)) {
    return o === 0;
  }
  throw new Error("invalid argument");
}
function hasOwnProperty(o, n) {
  return o && o.hasOwnProperty(n);
}
function upper(s) {
  return s.toUpperCase();
}
function lower(s) {
  return s.toLowerCase();
}
function first(a, fn) {
  if (!fn) {
    return a ? a[0] : undefined;
  }
  for (var i = 0, l = a[LEN]; i < l; i++) {
    if (fn(a[i])) return a[i];
  }
}
function toArray(a) {
  if (isArray(a)) return a;
  if ((typeof a === "undefined" ? "undefined" : _typeof(a)) == OBJECT && a[LEN]) return map(a, function (o) {
    return o;
  });
  return Array.prototype.slice.call(arguments);
}
function flatten(a) {
  if (isArray(a)) return [].concat.apply([], map(a, flatten));
  return a;
}
var _id = -1;
function uniqueId(name) {
  _id++;
  return (name || "id") + _id;
}
function resetSeed() {
  _id = -1;
}
function keys(o) {
  if (!o) return [];
  var x,
      a = [];
  for (x in o) {
    a.push(x);
  }
  return a;
}
function values(o) {
  if (!o) return [];
  var x,
      a = [];
  for (x in o) {
    a.push(o[x]);
  }
  return a;
}
function minus(o, props) {
  if (!o) return o;
  if (!props) props = [];
  var a = {},
      x;
  for (x in o) {
    if (props.indexOf(x) == -1) {
      a[x] = o[x];
    }
  }
  return a;
}
function isUnd(x) {
  return typeof x === "undefined";
}
/**
 * Deep clones an item (except function types).
 */
function clone(o) {
  var x, a;
  if (o === null) return null;
  if (o === undefined) return undefined;
  if (isObject(o)) {
    if (isArray(o)) {
      a = [];
      for (var i = 0, l = o.length; i < l; i++) {
        a[i] = clone(o[i]);
      }
    } else {
      a = {};
      var v;
      for (x in o) {
        v = o[x];
        if (v === null || v === undefined) {
          a[x] = v;
          continue;
        }
        if (isObject(v)) {
          if (isDate(v)) {
            a[x] = new Date(v.getTime());
          } else if (isRegExp(v)) {
            a[x] = new RegExp(v.source, v.flags);
          } else if (isArray(v)) {
            a[x] = [];
            for (var i = 0, l = v.length; i < l; i++) {
              a[x][i] = clone(v[i]);
            }
          } else {
            a[x] = clone(v);
          }
        } else {
          a[x] = v;
        }
      }
    }
  } else {
    a = o;
  }
  return a;
}

exports.default = {
  extend: function extend() {
    var args = arguments;
    if (!args[LEN]) return;
    if (args[LEN] == 1) return args[0];
    var a = args[0],
        b,
        x;
    for (var i = 1, l = args[LEN]; i < l; i++) {
      b = args[i];
      if (!b) continue;
      for (x in b) {
        a[x] = b[x];
      }
    }
    return a;
  },
  stringArgs: function stringArgs(a) {
    if (!a || isUnd(a.length)) throw new Error("expected array argument");
    if (!a.length) return [];
    var l = a.length;
    if (l === 1) {
      var first = a[0];
      if (isString(first) && first.indexOf(" ") > -1) {
        return first.split(/\s+/g);
      }
    }
    return a;
  },


  uniqueId: uniqueId,

  resetSeed: resetSeed,

  flatten: flatten,

  each: each,

  exec: exec,

  keys: keys,

  values: values,

  minus: minus,

  map: map,

  first: first,

  toArray: toArray,

  isArray: isArray,

  isDate: isDate,

  isString: isString,

  isNumber: isNumber,

  isObject: isObject,

  isPlainObject: isPlainObject,

  isEmpty: isEmpty,

  isFunction: isFunction,

  has: hasOwnProperty,

  isNullOrEmptyString: function isNullOrEmptyString(v) {
    return v === null || v === undefined || v === "";
  },


  lower: lower,

  upper: upper,

  clone: clone,

  /**
   * Duck typing: checks if an object "Quacks like a Promise"
   *
   * @param {Promise} o;
   */
  quacksLikePromise: function quacksLikePromise(o) {
    if (o && _typeof(o.then) == FUNCTION) {
      return true;
    }
    return false;
  },


  /**
   * Returns the sum of values inside an array, eventually by predicate.
   */
  sum: function sum(a, fn) {
    if (!a) return;
    var b,
        l = a[LEN];
    if (!l) return;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (isUnd(b)) {
        b = v;
      } else {
        b += v;
      }
    }
    return b;
  },


  /**
   * Returns the maximum value inside an array, by predicate.
   */
  max: function max(a, fn) {
    var o = -Infinity;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v > o) o = v;
    }
    return o;
  },


  /**
   * Returns the minimum value inside an array, by predicate.
   */
  min: function min(a, fn) {
    var o = Infinity;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      var v = fn ? fn(a[i]) : a[i];
      if (v < o) o = v;
    }
    return o;
  },


  /**
   * Returns the item with the maximum value inside an array, by predicate.
   */
  withMax: function withMax(a, fn) {
    var o;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v > fn(o)) o = a[i];
    }
    return o;
  },


  /**
   * Returns the item with the minimum value inside an array, by predicate.
   */
  withMin: function withMin(a, fn) {
    var o;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!o) {
        o = a[i];
        continue;
      }
      var v = fn(a[i]);
      if (v < fn(o)) o = a[i];
    }
    return o;
  },
  indexOf: function indexOf(a, o) {
    return a.indexOf(o);
  },
  contains: function contains(a, o) {
    return a.indexOf(o) > -1;
  },


  /**
   * Returns a value indicating whether any object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  any: function any(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(x, a[x])) return true;
      }
      return false;
    }
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i])) return true;
    }
    return false;
  },


  /**
   * Returns a value indicating whether all object inside an array, or any
   * key-value pair inside an object, respect a given predicate.
   *
   * @param a: input array or object
   * @param fn: predicate to test items or key-value pairs
   */
  all: function all(a, fn) {
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (!fn(x, a[x])) return false;
      }
      return true;
    }
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!fn(a[i])) return false;
    }
    return true;
  },


  /**
   * Finds the first item or property that respects a given predicate.
   */
  find: function find(a, fn) {
    if (!a) return null;
    if (isArray(a)) {
      if (!a || !a[LEN]) return;
      for (var i = 0, l = a[LEN]; i < l; i++) {
        if (fn(a[i])) return a[i];
      }
    }
    if (isPlainObject(a)) {
      var x;
      for (x in a) {
        if (fn(a[x], x)) return a[x];
      }
    }
    return;
  },
  where: function where(a, fn) {
    if (!a || !a[LEN]) return [];
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (fn(a[i])) b.push(a[i]);
    }
    return b;
  },
  removeItem: function removeItem(a, o) {
    var x = -1;
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (a[i] === o) {
        x = i;
        break;
      }
    }
    a.splice(x, 1);
  },
  reject: function reject(a, fn) {
    if (!a || !a[LEN]) return [];
    var b = [];
    for (var i = 0, l = a[LEN]; i < l; i++) {
      if (!fn(a[i])) b.push(a[i]);
    }
    return b;
  },
  pick: function pick(o, arr, exclude) {
    var a = {};
    if (exclude) {
      for (var x in o) {
        if (arr.indexOf(x) == -1) a[x] = o[x];
      }
    } else {
      for (var i = 0, l = arr[LEN]; i < l; i++) {
        var p = arr[i];
        if (hasOwnProperty(o, p)) a[p] = o[p];
      }
    }
    return a;
  },


  /**
   * Requires an object to be defined and to have the given properties.
   *
   * @param {Object} o: object to validate
   * @param {String[]} props: list of properties to require
   * @param {string} [name=options]:
   */
  require: function require(o, props, name) {
    if (!name) name = "options";
    var error = "";
    if (o) {
      this.each(props, function (x) {
        if (!hasOwnProperty(o, x)) {
          error += "missing '" + x + "' in " + name;
        }
      });
    } else {
      error = "missing " + name;
    }
    if (error) throw new Error(error);
  },
  wrap: function wrap(fn, callback, context) {
    var _this = this,
        _arguments = arguments;

    var wrapper = function wrapper() {
      return callback.apply(_this, [fn].concat(toArray(_arguments)));
    };
    wrapper.bind(context || this);
    return wrapper;
  },
  unwrap: function (_unwrap) {
    function unwrap(_x) {
      return _unwrap.apply(this, arguments);
    }

    unwrap.toString = function () {
      return _unwrap.toString();
    };

    return unwrap;
  }(function (o) {
    return isFunction(o) ? unwrap(o()) : o;
  }),
  defer: function defer(fn) {
    setTimeout(fn, 0);
  },


  /**
   * Returns a new function that can be invoked at most n times.
   */
  atMost: function atMost(n, fn, context) {
    var m = n,
        result;
    function a() {
      if (n > 0) {
        n--;
        result = fn.apply(context || this, arguments);
      }
      return result;
    }
    return a;
  },


  isUnd: isUnd,

  /**
   * Returns a new function that can be invoked at most once.
   */
  once: function once(fn, context) {
    return this.atMost(1, fn, context);
  },


  /**
   * Returns a new function that is executed always passing the given arguments to it.
   * Python-fashion.
  */
  partial: function partial(fn) {
    var self = this;
    var args = self.toArray(arguments);
    args.shift();
    return function partial() {
      var bargs = self.toArray(arguments);
      return fn.apply({}, args.concat(bargs));
    };
  },


  /**
   * Quasi Pythonic object comparer
   */
  equal: function equal(a, b) {
    var NONE = null,
        und,
        t = true,
        f = false,
        s = "";
    if (a === b) return t;
    if (a === und || b === und || a === NONE || b === NONE || a === t || b === t || a === f || b === f || a === s || b === s) return false;
    if (isArray(a)) {
      if (isArray(b) && a[LEN] == b[LEN]) {
        // like in Python: return true if all objects
        // inside are equal, in the same order
        var i,
            l = a[LEN];
        for (i = 0; i < l; i++) {
          if (!this.equal(a[i], b[i])) {
            return f;
          }
        }
        return t;
      } else {
        return f;
      }
    }
    if (isNumber(a) || isString(a)) return a == b;
    if (a === NONE && b === NONE) return t;
    if (a === und && b === und) return t;
    var x,
        q = 0,
        w = 0;
    for (x in a) {
      if (a[x] !== und) q += 1;
      if (!this.equal(a[x], b[x])) return f;
    }
    for (x in b) {
      if (b[x] !== und) w += 1;
    }
    var diff = q == w;
    return diff;
  },


  /**
   * Given a list of arrays, returns a new list of columns obtained from them.
   */
  cols: function cols(a) {
    if (!a || !a.length) return [];
    var maxLength = this.max(a, function (x) {
      return x.length;
    });
    var b = [],
        i,
        j,
        l = a.length;
    for (j = 0; j < maxLength; j++) {
      var col = [];
      for (i = 0; i < l; i++) {
        col.push(a[i][j]);
      }
      b.push(col);
    }
    return b;
  },


  /**
   * Sorts an array of numbers in ascending order.
   */
  sortNums: function sortNums(a) {
    return a.sort(function (i, j) {
      if (i > j) return 1;if (i < j) return -1;return 0;
    });
  },


  /**
   * Returns a new function that can be fired only once every n milliseconds.
   * The function is fired after the timeout, and as late as possible.
   *
   * @param fn: function
   * @param ms: milliseconds
   * @param {any} context: function context.
   */
  debounce: function debounce(fn, ms, context) {
    var it;
    function d() {
      if (it) {
        clearTimeout(it);
      }
      var args = arguments.length ? toArray(arguments) : undefined;
      it = setTimeout(function () {
        it = null;
        fn.apply(context, args);
      }, ms);
    }
    return d;
  },


  /**
   * Edits the items of an array by using a given function.
   *
   * @param {array} a: array of items.
   * @param {function} fn: editing function.
   */
  reach: function reach(a, fn) {
    if (!isArray(a)) throw new Error("expected array");
    var item;
    for (var i = 0, l = a.length; i < l; i++) {
      item = a[i];
      if (isArray(item)) {
        this.reach(item, fn);
      } else {
        a[i] = fn(item);
      }
    }
    return a;
  },


  /**
   * Returns a value indicating whether the given object implements all given methods.
   */
  quacks: function quacks(o, methods) {
    if (!o) return false;
    if (!methods) throw "missing methods list";
    if (isString(methods)) {
      methods = toArray(arguments).slice(1, arguments.length);
    }
    for (var i = 0, l = methods.length; i < l; i++) {
      if (!isFunction(o[methods[i]])) {
        return false;
      }
    }
    return true;
  },


  /**
   * Replaces values in strings, using mustaches.
   */
  format: function format(s, o) {
    return s.replace(/\{\{(.+?)\}\}/g, function (s, a) {
      if (!o.hasOwnProperty(a)) return s;
      return o[a];
    });
  },


  /**
   * Proxy function to fn bind.
   */
  bind: function bind(fn, o) {
    return fn.bind(o);
  },
  ifcall: function ifcall(fn, ctx, args) {
    if (!fn) return;
    if (!args) {
      fn.call(ctx);
      return;
    }
    switch (args.length) {
      case 0:
        fn.call(ctx);return;
      case 1:
        fn.call(ctx, args[0]);return;
      case 2:
        fn.call(ctx, args[0], args[1]);return;
      case 3:
        fn.call(ctx, args[0], args[1], args[2]);return;
      default:
        fn.apply(ctx, args);
    }
  }
};

},{"../scripts/exceptions":20}]},{},[30])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9hcnJheS5qcyIsImNvZGUvc2NyaXB0cy9jb21wb25lbnRzL2RhdGUuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHMuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9udW1iZXIuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9yZWZsZWN0aW9uLmpzIiwiY29kZS9zY3JpcHRzL2NvbXBvbmVudHMvcmVnZXguanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9zdHJpbmcuanMiLCJjb2RlL3NjcmlwdHMvY29tcG9uZW50cy9zdHJpbmcubm9ybWFsaXplLmpzIiwiY29kZS9zY3JpcHRzL2RhdGEvYWpheC5qcyIsImNvZGUvc2NyaXB0cy9kYXRhL2Nzdi5qcyIsImNvZGUvc2NyaXB0cy9kYXRhL2ZpbGUuanMiLCJjb2RlL3NjcmlwdHMvZGF0YS9odG1sLmpzIiwiY29kZS9zY3JpcHRzL2RhdGEvanNvbi5qcyIsImNvZGUvc2NyaXB0cy9kYXRhL2xydS5qcyIsImNvZGUvc2NyaXB0cy9kYXRhL21lbXN0b3JlLmpzIiwiY29kZS9zY3JpcHRzL2RhdGEvb2JqZWN0LWFuYWx5emVyLmpzIiwiY29kZS9zY3JpcHRzL2RhdGEvc2FuaXRpemVyLmpzIiwiY29kZS9zY3JpcHRzL2RhdGEveG1sLmpzIiwiY29kZS9zY3JpcHRzL2RvbS5qcyIsImNvZGUvc2NyaXB0cy9leGNlcHRpb25zLmpzIiwiY29kZS9zY3JpcHRzL2ZpbHRlcnMvZmlsdGVycy1tYW5hZ2VyLmpzIiwiY29kZS9zY3JpcHRzL2ZpbHRlcnMvcGFnaW5hdG9yLmpzIiwiY29kZS9zY3JpcHRzL2xpdGVyYXR1cmUvdGV4dC1zbGlkZXIuanMiLCJjb2RlL3NjcmlwdHMvbWVudXMva2luZ3RhYmxlLm1lbnUuaHRtbC5qcyIsImNvZGUvc2NyaXB0cy9tZW51cy9raW5ndGFibGUubWVudS5qcyIsImNvZGUvc2NyaXB0cy9yYWlzZS5qcyIsImNvZGUvc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmJ1aWxkZXIuanMiLCJjb2RlL3NjcmlwdHMvdGFibGVzL2tpbmd0YWJsZS5odG1sLmJhc2UuYnVpbGRlci5qcyIsImNvZGUvc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmh0bWwuYnVpbGRlci5qcyIsImNvZGUvc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmpzIiwiY29kZS9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUucmVnaW9uYWwuanMiLCJjb2RlL3NjcmlwdHMvdGFibGVzL2tpbmd0YWJsZS5yaHRtbC5idWlsZGVyLmpzIiwiY29kZS9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUudGV4dC5idWlsZGVyLmpzIiwiY29kZS9zY3JpcHRzL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDVUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUtBOzs7QUFHQSxTQUFTLGNBQVQsQ0FBd0IsS0FBeEIsRUFBK0I7QUFDN0IsTUFBSSxJQUFJLE1BQU0sTUFBZDtBQUNBLE9BQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxDQUFwQixFQUF1QixHQUF2QixFQUE0QjtBQUMxQixRQUFJLElBQUksTUFBTSxDQUFOLENBQVI7QUFBQSxRQUFrQixPQUFPLEVBQUUsQ0FBRixDQUF6QjtBQUFBLFFBQStCLFFBQVEsRUFBRSxDQUFGLENBQXZDO0FBQ0EsUUFBSSxDQUFDLGdCQUFFLFFBQUYsQ0FBVyxLQUFYLENBQUQsSUFBc0IsQ0FBQyxjQUFjLElBQWQsQ0FBbUIsS0FBbkIsQ0FBM0IsRUFBc0Q7QUFDcEQsOERBQXFDLEtBQXJDLGVBQW9ELElBQXBEO0FBQ0Q7QUFDRCxNQUFFLENBQUYsSUFBTyxnQkFBRSxRQUFGLENBQVcsS0FBWCxJQUFvQixLQUFwQixHQUE2QixRQUFRLElBQVIsQ0FBYSxLQUFiLElBQXNCLENBQXRCLEdBQTBCLENBQUMs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QVEsV0FBRyxJQUFILENBQVEsR0FBUixFQUFjO0FBQ3RCLFdBQUssQ0FBTDtBQUFRLFdBQUcsSUFBSCxDQUFRLEdBQVIsRUFBYSxLQUFLLENBQUwsQ0FBYixFQUF1QjtBQUMvQixXQUFLLENBQUw7QUFBUSxXQUFHLElBQUgsQ0FBUSxHQUFSLEVBQWEsS0FBSyxDQUFMLENBQWIsRUFBc0IsS0FBSyxDQUFMLENBQXRCLEVBQWdDO0FBQ3hDLFdBQUssQ0FBTDtBQUFRLFdBQUcsSUFBSCxDQUFRLEdBQVIsRUFBYSxLQUFLLENBQUwsQ0FBYixFQUFzQixLQUFLLENBQUwsQ0FBdEIsRUFBK0IsS0FBSyxDQUFMLENBQS9CLEVBQXlDO0FBQ2pEO0FBQVMsV0FBRyxLQUFILENBQVMsR0FBVCxFQUFjLElBQWQ7QUFMWDtBQU9EO0FBamhCWSxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQXJyYXkgdXRpbGl0aWVzLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIlxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvc3RyaW5nXCJcbmltcG9ydCBSIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvcmVnZXhcIlxuaW1wb3J0IFJlZmxlY3Rpb24gZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9yZWZsZWN0aW9uXCJcbmltcG9ydCB7XG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxuICBUeXBlRXhjZXB0aW9uXG59IGZyb20gXCIuLi8uLi9zY3JpcHRzL2V4Y2VwdGlvbnNcIlxuXG4vKipcbiAqIE5vcm1hbGl6ZXMgYSBzb3J0IGJ5IGNvbmRpdGlvbi5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplT3JkZXIocHJvcHMpIHtcbiAgdmFyIGwgPSBwcm9wcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHAgPSBwcm9wc1tpXSwgbmFtZSA9IHBbMF0sIG9yZGVyID0gcFsxXTtcbiAgICBpZiAoIV8uaXNOdW1iZXIob3JkZXIpICYmICEvXmFzY3xeZGVzYy9pLnRlc3Qob3JkZXIpKSB7XG4gICAgICBBcmd1bWVudEV4Y2VwdGlvbihgVGhlIHNvcnQgb3JkZXIgJyR7b3JkZXJ9JyBmb3IgJyR7bmFtZX0nIGlzIG5vdCB2YWxpZCAoaXQgbXVzdCBiZSAvXmFzY3xeZGVzYy9pKS5gKVxuICAgIH1cbiAgICBwWzFdID0gXy5pc051bWJlcihvcmRlcikgPyBvcmRlciA6ICgvXmFzYy9pLnRlc3Qob3JkZXIpID8gMSA6IC0xKTtcbiAgfVxuICByZXR1cm4gcHJvcHM7XG59XG5cbi8qKlxuICogUGFyc2VzIGEgc3RyaW5nLCBwb3NzaWJseSByZXByZXNlbnRlZCB3aXRoIHRob3VzYW5kcyBzZXBhcmF0b3JzLFxuICogZGVjaW1hbCBzZXBhcmF0b3JzIGRpZmZlcmVudCB0aGFuIEpTIGRlZmF1bHQuXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQW55TnVtYmVyKHMpIHtcbiAgdmFyIHBhcnRzID0gcy5zcGxpdCgvKFtcXC5cXCxdXFxkKykkLyk7XG4gIHZhciBpbnRlZ3JhbFBhcnQgPSBwYXJ0c1swXSxcbiAgICBkZWNpbWFsUGFydCA9IHBhcnRzWzFdLFxuICAgIGEgPSAwO1xuICBpZiAoaW50ZWdyYWxQYXJ0KSB7XG4gICAgYSA9IHBhcnNlSW50KGludGVncmFsUGFydC5yZXBsYWNlKC9cXEQvZywgXCJcIikpO1xuICB9XG4gIGlmIChkZWNpbWFsUGFydCkge1xuICAgIGEgKz0gcGFyc2VGbG9hdChkZWNpbWFsUGFydC5yZXBsYWNlKC9cXCwvZywgXCIuXCIpKTtcbiAgfVxuICByZXR1cm4gL15cXHM/LS8udGVzdChzKSA/IC1hIDogYTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiBzdHJpbmcgbG9va3Mgc29ydGFibGUgYXMgYSBudW1iZXIuXG4gKiBJZiB0cnVlLCByZXR1cm5zIGEgcGFyc2VkIG51bWJlci5cbiAqL1xuZnVuY3Rpb24gbG9va1NvcnRhYmxlQXNOdW1iZXIocykge1xuICBpZiAoIV8uaXNTdHJpbmcocykpIHtcbiAgICBUeXBlRXhjZXB0aW9uKFwic1wiLCBcInN0cmluZ1wiKTtcbiAgfVxuICB2YXIgbSA9IHMubWF0Y2goL1stK35dPyhbMC05XXsxLDN9KD86WyxcXHNcXC5dezF9WzAtOV17M30pKig/OltcXC58XFwsXXsxfVswLTldKyk/KS9nKTtcbiAgaWYgKG0gJiYgbS5sZW5ndGggPT0gMSkge1xuICAgIGlmICgvKCNbMC05YS1mQS1GXXszfXwjWzAtOWEtZkEtRl17Nn18I1swLTlhLWZBLUZdezh9KSQvLnRlc3QocykpIHtcbiAgICAgIC8vIGhleGFkZWNpbWFsIHN0cmluZzogYWxwaGFiZXRpY2FsIG9yZGVyIGlzIGZpbmVcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gTnVtYmVycyBhcmUgY2hlY2tlZCBvbmx5IGlmIHRoZXJlIGlzIGEgc2luZ2xlIG1hdGNoIGluIHRoZSBzdHJpbmcuXG4gICAgLy8gaG93IG1hbnkgZGlnaXRzIGNvbXBhcmVkIHRvIG90aGVyIGxldHRlcnM/XG4gICAgdmFyIG5vbk51bWJlcnMgPSBzLm1hdGNoKC9bXjAtOVxcLlxcLFxcc10vZykubGVuZ3RoO1xuICAgIGlmIChub25OdW1iZXJzID4gNikge1xuICAgICAgLy8gdGhlcmUgYXJlIHRvbyBtYW55IGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IG51bWJlcnMgb3Igc2VwYXJhdG9ycztcbiAgICAgIC8vIHRoZSBzdHJpbmcgbXVzdCBiZSBtb3N0IHByb2JhYmx5IHNvcnRlZCBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIG51bWVyaWNQYXJ0ID0gbVswXTtcbiAgICB2YXIgbnVtVmFsID0gcGFyc2VBbnlOdW1iZXIobnVtZXJpY1BhcnQpO1xuICAgIHJldHVybiBudW1WYWw7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG52YXIgb3B0aW9ucyA9IHtcbiAgYXV0b1BhcnNlTnVtYmVyczogdHJ1ZSxcbiAgY2k6IHRydWVcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBub3JtYWxpemVPcmRlcixcblxuICBsb29rU29ydGFibGVBc051bWJlcixcblxuICBvcHRpb25zLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYSBzb3J0IGJ5IHN0cmluZywgY29udmVydGluZyBpdCBpbnRvIGFuIGFycmF5IG9mIGFycmF5cy5cbiAgICogXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzLCBzdHJpbmcgdG8gc29ydFxuICAgKi9cbiAgcGFyc2VTb3J0Qnkocykge1xuICAgIGlmICghcykgcmV0dXJuO1xuICAgIHZhciBwYXJ0cyA9IHMuc3BsaXQoL1xccyosXFxzKi9nKTtcbiAgICByZXR1cm4gXy5tYXAocGFydHMsIHBhcnQgPT4ge1xuICAgICAgdmFyIGEgPSBwYXJ0LnNwbGl0KC9cXHMvKSwgbmFtZSA9IGFbMF0sIG9yZGVyID0gYVsxXSB8fCBcImFzY1wiO1xuICAgICAgcmV0dXJuIFtuYW1lLCBTdHJpbmdVdGlscy5zdGFydHNXaXRoKG9yZGVyLCBcImFzY1wiLCB0cnVlKSA/IDEgOiAtMV07XG4gICAgfSk7XG4gIH0sXG5cbiAgaHVtYW5Tb3J0QnkoYSwgdmVyYm9zZSkge1xuICAgIGlmICghYSB8fCAhYS5sZW5ndGgpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiBfLm1hcChhLCBwYXJ0ID0+IHtcbiAgICAgIHZhciBuYW1lID0gcGFydFswXSwgb3JkZXIgPSBwYXJ0WzFdO1xuICAgICAgaWYgKG9yZGVyID09PSAxKSB7XG4gICAgICAgIHJldHVybiB2ZXJib3NlID8gKG5hbWUgKyBcIiBhc2NcIikgOiBuYW1lO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5hbWUgKyBcIiBkZXNjXCI7XG4gICAgfSkuam9pbihcIiwgXCIpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHNvcnQgY3JpdGVyaWEgZnJvbSBnaXZlbiBhcmd1bWVudHMuXG4gICAqL1xuICBnZXRTb3J0Q3JpdGVyaWEoYXJncykge1xuICAgIHZhciBhbCA9IGFyZ3MubGVuZ3RoLCBwcm9wcztcbiAgICBcbiAgICBpZiAoYXJncy5sZW5ndGggPT0gMSkge1xuICAgICAgdmFyIGZpcnN0UGFyYW1ldGVyID0gYXJnc1swXTtcbiAgICAgIGlmIChfLmlzU3RyaW5nKGZpcnN0UGFyYW1ldGVyKSAmJiBmaXJzdFBhcmFtZXRlci5zZWFyY2goLyx8XFxzLykgPiAtMSlcbiAgICAgIHJldHVybiB0aGlzLnBhcnNlU29ydEJ5KGZpcnN0UGFyYW1ldGVyKTtcbiAgICB9XG5cbiAgICBpZiAoYWwgPiAxKSB7XG4gICAgICAvLyBwYXNzaW5nIG11bHRpcGxlIHByb3BlcnR5IG5hbWVzIHNvcnRCeShhLCBcImFhXCIsIFwiYmJcIiwgXCJjY1wiKTtcbiAgICAgIHZhciBhID0gXy50b0FycmF5KGFyZ3MpO1xuICAgICAgcHJvcHMgPSBfLm1hcChhLCB4ID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFsaXplU29ydEJ5VmFsdWUoeCwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZXhwZWN0IGEgc2luZ2xlIHN0cmluZzsgb3IgYW4gb2JqZWN0XG4gICAgICBwcm9wcyA9IHRoaXMubm9ybWFsaXplU29ydEJ5VmFsdWUoYXJnc1swXSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9wcztcbiAgfSxcblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhIHNvcnQgYnkgY29uZGl0aW9uLlxuICAgKi9cbiAgbm9ybWFsaXplU29ydEJ5VmFsdWUoYSwgbXVsdGkpIHtcbiAgICBpZiAoXy5pc1N0cmluZyhhKSkge1xuICAgICAgcmV0dXJuIG11bHRpID8gW2EsIFwiYXNjXCJdIDogW1thLCBcImFzY1wiXV07XG4gICAgfVxuICAgIGlmIChfLmlzQXJyYXkoYSkpIHtcbiAgICAgIGlmIChfLmlzQXJyYXkoYVswXSkpXG4gICAgICAgIHJldHVybiBhOyAvLyBIZWosIGhlcmUgd2UgY2FuIGV4cGVjdCB0aGUgdXNlciBvZiB0aGUgZnVuY3Rpb24gaXMgcGFzc2luZyBhIHByb3BlciBwYXJhbWV0ZXIuXG4gICAgICByZXR1cm4gXy5tYXAoYSwgYyA9PiB7IHJldHVybiB0aGlzLm5vcm1hbGl6ZVNvcnRCeVZhbHVlKGMsIHRydWUpOyB9KTtcbiAgICB9XG4gICAgaWYgKF8uaXNQbGFpbk9iamVjdChhKSkge1xuICAgICAgdmFyIHgsIGIgPSBbXTtcbiAgICAgIGZvciAoeCBpbiBhKSB7XG4gICAgICAgIGIucHVzaChbeCwgYVt4XV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGI7XG4gICAgfVxuICAgIFR5cGVFeGNlcHRpb24oXCJzb3J0XCIsIFwic3RyaW5nIHwgW10gfCB7fVwiKVxuICB9LFxuXG4gIC8qKlxuICAgKiBDb21wYXJlcyB0d28gc3RyaW5ncywgYnV0IGFsc28gY2hlY2tpbmcgaWYgdGhleSBsb29rIGxpa2UgbnVtYmVycy5cbiAgICogSW4gdGhpcyBjYXNlLCB0aGV5IGFyZSBjb21wYXJlZCBhcyBudW1iZXJzLlxuICAgKi9cbiAgY29tcGFyZVN0cmluZ3MoYSwgYiwgb3JkZXIpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmF1dG9QYXJzZU51bWJlcnMpIHtcbiAgICAgIC8vXG4gICAgICAvLyBjaGVjayBpZiB0aGUgc3RyaW5ncyBjb250YWluIG51bWJlcnNcbiAgICAgIC8vXG4gICAgICB2YXIgYVZhbCA9IGxvb2tTb3J0YWJsZUFzTnVtYmVyKGEpLCBiVmFsID0gbG9va1NvcnRhYmxlQXNOdW1iZXIoYik7XG4gICAgICAvLyBudW1iZXJzIHdpblxuICAgICAgaWYgKGFWYWwgIT09IGZhbHNlIHx8IGJWYWwgIT09IGZhbHNlKSB7XG4gICAgICAgIC8vIHNvcnQgYXMgbnVtYmVyczogdGhpcyBpcyBtb3N0IHByb2JhYmx5IHdoYXQgdGhlIHByb2dyYW1tZXIgZGVzaXJlc1xuICAgICAgICBpZiAoYVZhbCA9PT0gYlZhbCkgcmV0dXJuIDA7XG4gICAgICAgIGlmIChhVmFsICE9PSBmYWxzZSAmJiBiID09PSBmYWxzZSkgcmV0dXJuIG9yZGVyO1xuICAgICAgICBpZiAoYVZhbCA9PT0gZmFsc2UgJiYgYiAhPT0gZmFsc2UpIHJldHVybiAtb3JkZXI7XG4gICAgICAgIGlmIChhVmFsIDwgYlZhbCkgcmV0dXJuIC1vcmRlcjtcbiAgICAgICAgaWYgKGFWYWwgPiBiVmFsKSByZXR1cm4gb3JkZXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmdVdGlscy5jb21wYXJlKGEsIGIsIG9yZGVyLCB0aGlzLm9wdGlvbnMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTb3J0cyBhbiBhcnJheSBvZiBpdGVtcyBieSBvbmUgb3IgbW9yZSBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAcGFyYW0gYXI6IGFycmF5IHRvIHNvcnRcbiAgICogQHBhcmFtIHsoc3RyaW5nfHN0cmluZ1tdfG9iamVjdHMpfSBzb3J0OiBvYmplY3QgZGVzY3JpYmluZ1xuICAgKiBAcGFyYW0gb3JkZXI6IGFzY2VuZGluZyAvIGRlc2NlbmRpbmdcbiAgICovXG4gIHNvcnRCeShhcikge1xuICAgIGlmICghXy5pc0FycmF5KGFyKSlcbiAgICAgIFR5cGVFeGNlcHRpb24oXCJhclwiLCBcImFycmF5XCIpO1xuXG4gICAgdmFyIGFsID0gYXJndW1lbnRzLmxlbmd0aCxcbiAgICAgIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzKS5zbGljZSgxLCBhbCksXG4gICAgICBwcm9wcyA9IHRoaXMuZ2V0U29ydENyaXRlcmlhKGFyZ3MpO1xuICAgIHByb3BzID0gbm9ybWFsaXplT3JkZXIocHJvcHMpO1xuICAgIHZhciBsID0gcHJvcHMubGVuZ3RoO1xuICAgIC8vIE9idGFpbiBzb3J0IGJ5IGluIHRoaXMgc2hhcGU6XG4gICAgLy8gW1tcImFcIiwgXCJhc2NcIl0sIFtcImJcIiwgXCJhc2NcIl1dXG4gICAgLy8gc2luY2UgRWNtYVNjcmlwdCBvYmplY3RzIGFyZSBub3QgZ3VhcmFudGVlZCBieSBzdGFuZGFyZCB0byBiZSBvcmRlcmVkIGRpY3Rpb25hcmllc1xuICAgIHZhciBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XG4gICAgdmFyIGNvbXBhcmVTdHJpbmdzID0gdGhpcy5jb21wYXJlU3RyaW5ncy5iaW5kKHRoaXMpO1xuICAgIHZhciB1bmQgPSB1bmRlZmluZWQsIG51ID0gbnVsbDtcbiAgICBhci5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYSA9PT0gYikgcmV0dXJuIDA7XG4gICAgICBpZiAoYSAhPT0gdW5kICYmIGIgPT09IHVuZCkgcmV0dXJuIC0xO1xuICAgICAgaWYgKGEgPT09IHVuZCAmJiBiICE9PSB1bmQpIHJldHVybiAxO1xuICAgICAgaWYgKGEgIT09IG51ICYmIGIgPT09IG51KSByZXR1cm4gLTE7XG4gICAgICBpZiAoYSA9PT0gbnUgJiYgYiAhPT0gbnUpIHJldHVybiAxO1xuICAgICAgLy8gTkI6IGJ5IGRlc2lnbiwgdGhlIG9yZGVyIGJ5IHByb3BlcnRpZXMgYXJlIGV4cGVjdGVkIHRvIGJlIGluIG9yZGVyIG9mIGltcG9ydGFuY2VcbiAgICAgIC8vXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcCA9IHByb3BzW2ldLCBuYW1lID0gcFswXSwgb3JkZXIgPSBwWzFdO1xuICAgICAgICB2YXIgYyA9IGFbbmFtZV0sIGQgPSBiW25hbWVdO1xuICAgICAgICBpZiAoYyA9PT0gZCkgY29udGludWU7IC8vIHByb3BlcnR5IGlzIGlkZW50aWNhbCwgY29udGludWUgdG8gbmV4dFxuICAgICAgICBpZiAoYyAhPT0gdW5kICYmIGQgPT09IHVuZCkgcmV0dXJuIC1vcmRlcjtcbiAgICAgICAgaWYgKGMgPT09IHVuZCAmJiBkICE9PSB1bmQpIHJldHVybiBvcmRlcjtcbiAgICAgICAgaWYgKGMgIT09IG51ICYmIGQgPT09IG51KSByZXR1cm4gLW9yZGVyO1xuICAgICAgICBpZiAoYyA9PT0gbnUgJiYgZCAhPT0gbnUpIHJldHVybiBvcmRlcjtcbiAgICAgICAgaWYgKGMgJiYgIWQpIHJldHVybiBvcmRlcjtcbiAgICAgICAgaWYgKCFjICYmIGQpIHJldHVybiAtb3JkZXI7XG4gICAgICAgIGlmIChpc1N0cmluZyhjKSAmJiBpc1N0cmluZyhkKSlcbiAgICAgICAgICAvL3NvcnQsIHN1cHBvcnRpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzXG4gICAgICAgICAgcmV0dXJuIGNvbXBhcmVTdHJpbmdzKGMsIGQsIG9yZGVyKTtcbiAgICAgICAgaWYgKGMgPCBkKSByZXR1cm4gLW9yZGVyO1xuICAgICAgICBpZiAoYyA+IGQpIHJldHVybiBvcmRlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIHJldHVybiBhcjtcbiAgfSxcblxuICAvKipcbiAgICogU29ydHMgYW4gYXJyYXkgb2YgaXRlbXMgYnkgYSBzaW5nbGUgcHJvcGVydHkuXG4gICAqXG4gICAqIEBwYXJhbSBhcnI6IGFycmF5IHRvIHNvcnRcbiAgICogQHBhcmFtIHByb3BlcnR5OiBuYW1lIG9mIHRoZSBzb3J0IHByb3BlcnR5XG4gICAqIEBwYXJhbSBvcmRlcjogYXNjZW5kaW5nIC8gZGVzY2VuZGluZ1xuICAgKi9cbiAgc29ydEJ5UHJvcGVydHkoYXJyLCBwcm9wZXJ0eSwgb3JkZXIpIHtcbiAgICBpZiAoIV8uaXNBcnJheShhcnIpKVxuICAgICAgVHlwZUV4Y2VwdGlvbihcImFyclwiLCBcImFycmF5XCIpO1xuICAgIGlmICghXy5pc1N0cmluZyhwcm9wZXJ0eSkpXG4gICAgICBUeXBlRXhjZXB0aW9uKFwicHJvcGVydHlcIiwgXCJzdHJpbmdcIik7XG4gICAgaWYgKCFfLmlzVW5kKG9yZGVyKSlcbiAgICAgIG9yZGVyID0gXCJhc2NcIjtcbiAgICBvcmRlciA9IF8uaXNOdW1iZXIob3JkZXIpID8gb3JkZXIgOiAoL15hc2MvaS50ZXN0KG9yZGVyKSA/IDEgOiAtMSk7XG4gICAgdmFyIG8gPSB7fTtcbiAgICBvW3Byb3BlcnR5XSA9IG9yZGVyO1xuICAgIHJldHVybiB0aGlzLnNvcnRCeShhcnIsIG8pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBpbnNpZGUgYSBjb2xsZWN0aW9uIG9mIGl0ZW1zIGJ5IGEgc3RyaW5nIHByb3BlcnR5LCB1c2luZyB0aGUgZ2l2ZW4gcGF0dGVybixcbiAgICogc29ydGluZyB0aGUgcmVzdWx0cyBieSBudW1iZXIgb2YgbWF0Y2hlcywgZmlyc3QgaW5kZXggYW5kIG51bWJlciBvZiByZWNvdXJyZW5jZXNcbiAgKi9cbiAgc2VhcmNoQnlTdHJpbmdQcm9wZXJ0eShvcHRpb25zKSB7XG4gICAgXy5yZXF1aXJlKG9wdGlvbnMsIFtcInBhdHRlcm5cIiwgXCJjb2xsZWN0aW9uXCIsIFwicHJvcGVydHlcIl0pO1xuICAgIHJldHVybiB0aGlzLnNlYXJjaEJ5U3RyaW5nUHJvcGVydGllcyhfLmV4dGVuZChvcHRpb25zLCB7XG4gICAgICBwcm9wZXJ0aWVzOiBbb3B0aW9ucy5wcm9wZXJ0eV1cbiAgICB9KSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGluc2lkZSBhIGNvbGxlY3Rpb24gb2YgaXRlbXMgYnkgYWxsIHN0cmluZyBwcm9wZXJ0aWVzLlxuICAgKi9cbiAgc2VhcmNoKGEpIHtcbiAgICBpZiAoIWEgfHwgIWEubGVuZ3RoKSByZXR1cm4gYTtcbiAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKGwgPCAyKSByZXR1cm4gYTtcbiAgICB2YXIgYXJncyA9IF8udG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEsIGwpO1xuICAgIHZhciBwcm9wcyA9IFtdLCB4LCBpdGVtLCBpc1N0cmluZyA9IF8uaXNTdHJpbmc7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaXRlbSA9IGFbaV07XG4gICAgICBmb3IgKHggaW4gaXRlbSkge1xuICAgICAgICBpZiAoaXNTdHJpbmcoaXRlbVt4XSkgJiYgcHJvcHMuaW5kZXhPZih4KSA9PSAtMSkge1xuICAgICAgICAgIHByb3BzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXy5lYWNoKGFyZ3MsIHggPT4geyBpZiAoIV8uaXNTdHJpbmcoeCkpIHsgQXJndW1lbnRFeGNlcHRpb24oYFVuZXhwZWN0ZWQgcGFyYW1ldGVyICR7eH1gKTsgfX0pO1xuICAgIHJldHVybiB0aGlzLnNlYXJjaEJ5U3RyaW5nUHJvcGVydGllcyh7XG4gICAgICBjb2xsZWN0aW9uOiBhLFxuICAgICAgcGF0dGVybjogUi5nZXRQYXR0ZXJuRnJvbVN0cmluZ3MoYXJncyksXG4gICAgICBwcm9wZXJ0aWVzOiBwcm9wcyxcbiAgICAgIG5vcm1hbGl6ZTogdHJ1ZVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBTZWFyY2hlcyBpbnNpZGUgYSBjb2xsZWN0aW9uIG9mIGl0ZW1zIGJ5IGNlcnRhaW5zIHN0cmluZyBwcm9wZXJ0aWVzLCB1c2luZyB0aGUgZ2l2ZW4gcGF0dGVybixcbiAgICogc29ydGluZyB0aGUgcmVzdWx0cyBieSBudW1iZXIgb2YgbWF0Y2hlcywgZmlyc3QgaW5kZXggYW5kIG51bWJlciBvZiByZWNvdXJyZW5jZXMuXG4gICAqL1xuICBzZWFyY2hCeVN0cmluZ1Byb3BlcnRpZXMob3B0aW9ucykge1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIG9yZGVyOiBcImFzY1wiLFxuICAgICAgbGltaXQ6IG51bGwsXG4gICAgICBrZWVwU2VhcmNoRGV0YWlsczogZmFsc2UsXG4gICAgICBnZXRSZXN1bHRzOiBmdW5jdGlvbiAoYSkge1xuICAgICAgICBpZiAodGhpcy5kZWNvcmF0ZSkge1xuICAgICAgICAgIC8vIGFkZCBpbmZvcm1hdGlvbiBhYm91dCB3aGljaCBwcm9wZXJ0eSBcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaXRlbSA9IGFbaV07XG4gICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IF8ud2hlcmUoaXRlbS5tYXRjaGVzLCBtID0+IHsgcmV0dXJuIG0gIT0gbnVsbDsgfSk7XG4gICAgICAgICAgICBhW2ldLm9iai5fX3NlYXJjaF9tYXRjaGVzX18gPSAgbWF0Y2hlcy5sZW5ndGggPyBfLm1hcChtYXRjaGVzLCB4ID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHgubWF0Y2hlZFByb3BlcnR5O1xuICAgICAgICAgICAgfSkgOiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMua2VlcFNlYXJjaERldGFpbHMpIHtcbiAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYiA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgYi5wdXNoKGFbaV0ub2JqKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYjtcbiAgICAgIH0sXG4gICAgICBub3JtYWxpemU6IHRydWUsXG4gICAgICBkZWNvcmF0ZTogZmFsc2UgLy8gd2hldGhlciB0byBkZWNvcmF0ZSBzb3VyY2Ugb2JqZWN0cyB3aXRoIGxpc3Qgb2YgcHJvcGVydGllcyB0aGF0IFxuICAgIH07XG4gICAgdmFyIG8gPSBfLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIGlmICghby5vcmRlciB8fCAhby5vcmRlci5tYXRjaCgvYXNjfGFzY2VuZGluZ3xkZXNjfGRlc2NlbmRpbmcvaSkpIG8ub3JkZXIgPSBcImFzY1wiO1xuICAgIHZhciBtYXRjaGVzID0gW10sIHJ4ID0gby5wYXR0ZXJuO1xuICAgIGlmICghKHJ4IGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgaWYgKF8uaXNTdHJpbmcocngpKSB7XG4gICAgICAgIHJ4ID0gUi5nZXRTZWFyY2hQYXR0ZXJuKHJ4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInRoZSBwYXR0ZXJuIG11c3QgYmUgYSBzdHJpbmcgb3IgYSByZWd1bGFyIGV4cHJlc3Npb25cIik7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBwcm9wZXJ0aWVzID0gby5wcm9wZXJ0aWVzLCBsZW4gPSBcImxlbmd0aFwiLCBub3JtYWxpemUgPSBvLm5vcm1hbGl6ZTtcbiAgICB2YXIgY29sbGVjdGlvbiA9IG8uY29sbGVjdGlvbjtcbiAgICB2YXIgaXNBcnJheSA9IF8uaXNBcnJheSwgaXNOdW1iZXIgPSBfLmlzTnVtYmVyLCBmbGF0dGVuID0gXy5mbGF0dGVuLCBtYXAgPSBfLm1hcDtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbGxlY3Rpb25bbGVuXTsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIG9iaiA9IGNvbGxlY3Rpb25baV0sIG9iam1hdGNoZXMgPSBbXSwgdG90YWxNYXRjaGVzID0gMDtcblxuICAgICAgZm9yICh2YXIgayA9IDAsIHQgPSBwcm9wZXJ0aWVzW2xlbl07IGsgPCB0OyBrKyspIHtcbiAgICAgICAgdmFyIHByb3AgPSBwcm9wZXJ0aWVzW2tdLFxuICAgICAgICAgICAgdmFsID0gUmVmbGVjdGlvbi5nZXRQcm9wZXJ0eVZhbHVlKG9iaiwgcHJvcCk7XG5cbiAgICAgICAgaWYgKCF2YWwpIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXZhbC5tYXRjaCkgdmFsID0gdmFsLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKGlzQXJyYXkodmFsKSkge1xuICAgICAgICAgIGlmICghdmFsW2xlbl0pIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWwgPSBmbGF0dGVuKHZhbCk7XG4gICAgICAgICAgdmFyIG1tID0gW10sIGZpcnN0SW5kZXg7XG4gICAgICAgICAgZm9yICh2YXIgYSA9IDAsIGwgPSB2YWxbbGVuXTsgYSA8IGw7IGErKykge1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gdmFsW2FdLm1hdGNoKHJ4KTtcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICBpZiAoIWlzTnVtYmVyKGZpcnN0SW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgZmlyc3RJbmRleCA9IGE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbW0ucHVzaChtYXRjaCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChtbVtsZW5dKSB7XG4gICAgICAgICAgICBvYmptYXRjaGVzW2tdID0ge1xuICAgICAgICAgICAgICBtYXRjaGVkUHJvcGVydHk6IHByb3AsXG4gICAgICAgICAgICAgIGluZGV4ZXM6IFtmaXJzdEluZGV4XSxcbiAgICAgICAgICAgICAgcmVjb3VycmVuY2VzOiBmbGF0dGVuKG1tKVtsZW5dXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vcm1hbGl6ZSB2YWx1ZVxuICAgICAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICAgICAgdmFsID0gU3RyaW5nVXRpbHMubm9ybWFsaXplKHZhbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hdGNoID0gdmFsLm1hdGNoKHJ4KTtcbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgLy8gY2xvbmUgcnhcbiAgICAgICAgICB2YXIgcnhDbG9uZSA9IG5ldyBSZWdFeHAocnguc291cmNlLCBcImdpXCIpLCBtLCBpbmRleGVzID0gW107XG4gICAgICAgICAgd2hpbGUgKG0gPSByeENsb25lLmV4ZWModmFsKSkge1xuICAgICAgICAgICAgaW5kZXhlcy5wdXNoKG0uaW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b3RhbE1hdGNoZXMgKz0gbWF0Y2hbbGVuXTtcbiAgICAgICAgICBvYmptYXRjaGVzW2tdID0ge1xuICAgICAgICAgICAgbWF0Y2hWYWx1ZTogdmFsLFxuICAgICAgICAgICAgbWF0Y2hlZFByb3BlcnR5OiBwcm9wLFxuICAgICAgICAgICAgaW5kZXhlczogaW5kZXhlcyxcbiAgICAgICAgICAgIHJlY291cnJlbmNlczogbWF0Y2hbbGVuXVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKG9iam1hdGNoZXNbbGVuXSkge1xuICAgICAgICBtYXRjaGVzLnB1c2goe1xuICAgICAgICAgIG9iajogb2JqLFxuICAgICAgICAgIG1hdGNoZXM6IG9iam1hdGNoZXMsXG4gICAgICAgICAgdG90YWxNYXRjaGVzOiB0b3RhbE1hdGNoZXNcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBvcmRlciA9IG8ub3JkZXIubWF0Y2goL2FzY3xhc2NlbmRpbmcvaSkgPyAxIDogLTEsXG4gICAgICAgIGxvd2VyID0gXCJ0b0xvd2VyQ2FzZVwiLFxuICAgICAgICBzdHIgICA9IFwidG9TdHJpbmdcIixcbiAgICAgICAgbWF0ICAgPSBcIm1hdGNoZXNcIixcbiAgICAgICAgbWF0cCAgPSBcIm1hdGNoZWRQcm9wZXJ0eVwiLFxuICAgICAgICBpb2YgICA9IFwiaW5kZXhPZlwiLFxuICAgICAgICBoYXNwICA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgcmVjICAgPSBcInJlY291cnJlbmNlc1wiLFxuICAgICAgICBvYmogICA9IFwib2JqXCIsXG4gICAgICAgIGl4cyAgID0gXCJpbmRleGVzXCIsXG4gICAgICAgIHRvdGFsID0gXCJ0b3RhbE1hdGNoZXNcIjtcbiAgICAvL3NvcnQgdGhlIGVudGlyZSBjb2xsZWN0aW9uIG9mIG1hdGNoZXNcbiAgICBtYXRjaGVzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcblxuICAgICAgLy8gaWYgb25lIGl0ZW0gaGFzIG1vcmUgbWF0Y2hlcyB0aGFuIHRoZSBvdGhlciwgaXQgY29tZXMgZmlyc3RcbiAgICAgIGlmIChhW3RvdGFsXSA+IGJbdG90YWxdKSByZXR1cm4gLW9yZGVyO1xuICAgICAgaWYgKGFbdG90YWxdIDwgYlt0b3RhbF0pIHJldHVybiBvcmRlcjtcblxuICAgICAgZm9yICh2YXIgayA9IDAsIGwgPSBwcm9wZXJ0aWVzW2xlbl07IGsgPCBsOyBrKyspIHtcbiAgICAgICAgdmFyIGFtID0gYVttYXRdW2tdLCBibSA9IGJbbWF0XVtrXTtcblxuICAgICAgICAvLyBpZiBib3RoIG9iamVjdHMgbGFjayBtYXRjaGVzIGluIHRoaXMgcHJvcGVydHksIGNvbnRpbnVlXG4gICAgICAgIGlmICghYW0gJiYgIWJtKSBjb250aW51ZTtcblxuICAgICAgICAvLyBwcm9wZXJ0aWVzIGFyZSBpbiBvcmRlciBvZiBpbXBvcnRhbmNlLFxuICAgICAgICAvLyBzbyBpZiBvbmUgb2JqZWN0IGhhcyBtYXRjaGVzIGluIHRoaXMgcHJvcGVydHkgYW5kIHRoZSBvdGhlciBkb2VzIG5vdCxcbiAgICAgICAgLy8gaXQgY29tZXMgZmlyc3QgYnkgZGVmaW5pdGlvblxuICAgICAgICBpZiAoYW0gJiYgIWJtKSByZXR1cm4gLW9yZGVyO1xuICAgICAgICBpZiAoIWFtICYmIGJtKSByZXR1cm4gb3JkZXI7XG5cbiAgICAgICAgLy8gc29ydCBieSBpbmRleGVzLCBhcHBsaWVzIHRoZSBmb2xsb3dpbmcgcnVsZXMgb25seSBpZiBvbmUgd29yZCBzdGFydGVkIHdpdGggdGhlIHNlYXJjaFxuICAgICAgICB2YXIgbWluQSA9IF8ubWluKGFtW2l4c10pLCBtaW5CID0gXy5taW4oYm1baXhzXSk7XG4gICAgICAgIGlmIChtaW5BIDwgbWluQikgcmV0dXJuIC1vcmRlcjtcbiAgICAgICAgaWYgKG1pbkEgPiBtaW5CKSByZXR1cm4gb3JkZXI7XG4gICAgICAgIGlmIChhbVtpeHNdW2lvZl0obWluQSkgPCBibVtpeHNdW2lvZl0obWluQikpIHJldHVybiAtb3JkZXI7XG4gICAgICAgIGlmIChhbVtpeHNdW2lvZl0obWluQSkgPiBibVtpeHNdW2lvZl0obWluQikpIHJldHVybiBvcmRlcjtcblxuXG4gICAgICAgIHZhciBhbyA9IGFbb2JqXSwgYm8gPSBiW29ial07XG4gICAgICAgIC8vY2hlY2sgaWYgb2JqZWN0cyBoYXZlIG1hdGNoZWQgcHJvcGVydHkgYmVjYXVzZSB3ZSBhcmUgc3VwcG9ydGluZyBzZWFyY2ggaW5zaWRlIGFycmF5cyBhbmQgb2JqZWN0cyBzdWJwcm9wZXJ0aWVzXG4gICAgICAgIGlmIChhb1toYXNwXShhbVttYXRwXSkgJiYgYm9baGFzcF0oYm1bbWF0cF0pKSB7XG4gICAgICAgICAgLy9zb3J0IGJ5IGFscGhhYmV0aWNhbCBvcmRlclxuICAgICAgICAgIGlmIChhb1thbVttYXRwXV1bc3RyXSgpW2xvd2VyXSgpIDwgYm9bYm1bbWF0cF1dW3N0cl0oKVtsb3dlcl0oKSkgcmV0dXJuIC1vcmRlcjtcbiAgICAgICAgICBpZiAoYW9bYW1bbWF0cF1dW3N0cl0oKVtsb3dlcl0oKSA+IGJvW2JtW21hdHBdXVtzdHJdKClbbG93ZXJdKCkpIHJldHVybiBvcmRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vb3JkZXIgYnkgdGhlIG51bWJlciBvZiByZWNvdXJyZW5jZXNcbiAgICAgICAgaWYgKGFtW3JlY10gPiBibVtyZWNdKSByZXR1cm4gLW9yZGVyO1xuICAgICAgICBpZiAoYW1bcmVjXSA8IGJtW3JlY10pIHJldHVybiBvcmRlcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIHZhciBsaW1pdCA9IG8ubGltaXQ7XG4gICAgaWYgKGxpbWl0KVxuICAgICAgbWF0Y2hlcyA9IG1hdGNoZXMuc2xpY2UoMCwgXy5taW4obGltaXQsIG1hdGNoZXNbbGVuXSkpO1xuICAgIHJldHVybiBvLmdldFJlc3VsdHMobWF0Y2hlcyk7XG4gIH1cbn1cbiIsIi8qKlxuICogRGF0ZSB1dGlsaXRpZXMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlscy5qc1wiXG5pbXBvcnQge1xuICBBcmd1bWVudEV4Y2VwdGlvbixcbiAgVHlwZUV4Y2VwdGlvblxufSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcblxuZnVuY3Rpb24gemVyb0ZpbGwocywgbCkge1xuICBpZiAoXCJzdHJpbmdcIiAhPSB0eXBlb2YgcykgcyA9IHMudG9TdHJpbmcoKTtcbiAgd2hpbGUgKHMubGVuZ3RoIDwgbClcbiAgICBzID0gXCIwXCIgKyBzO1xuICByZXR1cm4gcztcbn07XG5cbi8vIEZyZWVseSBpbnNwaXJlZCBieSAuTkVUIG1ldGhvZHNcbi8vIGh0dHBzOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvOGtiM2RkZDQlMjh2PXZzLjExMCUyOS5hc3B4XG52YXIgcGFydHMgPSB7XG4gIHllYXI6IHtcbiAgICByeDogL1l7MSw0fS8sXG4gICAgZm46IGZ1bmN0aW9uIChkYXRlLCBmb3JtYXQpIHtcbiAgICAgIHZhciByZSA9IGRhdGUuZ2V0RnVsbFllYXIoKS50b1N0cmluZygpO1xuICAgICAgd2hpbGUgKHJlLmxlbmd0aCA+IGZvcm1hdC5sZW5ndGgpXG4gICAgICAgIHJlID0gcmUuc3Vic3RyKDEsIHJlLmxlbmd0aCk7XG4gICAgICByZXR1cm4gcmU7XG4gICAgfVxuICB9LFxuICBtb250aDoge1xuICAgIHJ4OiAvTXsxLDR9LyxcbiAgICBmbjogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCwgZnVsbEZvcm1hdCwgcmVnaW9uYWwpIHtcbiAgICAgIHZhciByZSA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpO1xuICAgICAgc3dpdGNoIChmb3JtYXQubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZXR1cm4gcmU7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gemVyb0ZpbGwocmUsIDIpO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgLy8gc2hvcnQgbmFtZVxuICAgICAgICAgIHJlID0gZGF0ZS5nZXRNb250aCgpO1xuICAgICAgICAgIHJldHVybiByZWdpb25hbC5tb250aFNob3J0W3JlXTtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIC8vIGxvbmcgbmFtZVxuICAgICAgICAgIHJlID0gZGF0ZS5nZXRNb250aCgpO1xuICAgICAgICAgIHJldHVybiByZWdpb25hbC5tb250aFtyZV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkYXk6IHtcbiAgICByeDogL0R7MSw0fS8sXG4gICAgZm46IGZ1bmN0aW9uIChkYXRlLCBmb3JtYXQsIGZ1bGxGb3JtYXQsIHJlZ2lvbmFsKSB7XG4gICAgICB2YXIgcmUgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpO1xuICAgICAgc3dpdGNoIChmb3JtYXQubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZXR1cm4gcmU7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gemVyb0ZpbGwocmUudG9TdHJpbmcoKSwgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAvL3Nob3J0IG5hbWVcbiAgICAgICAgICByZSA9IGRhdGUuZ2V0RGF5KCk7XG4gICAgICAgICAgcmV0dXJuIHJlZ2lvbmFsLndlZWtTaG9ydFtyZV07XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAvL2xvbmcgbmFtZVxuICAgICAgICAgIHJlID0gZGF0ZS5nZXREYXkoKTtcbiAgICAgICAgICByZXR1cm4gcmVnaW9uYWwud2Vla1tyZV07XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBob3VyOiB7XG4gICAgcng6IC9oezEsMn0vaSxcbiAgICBmbjogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCwgZnVsbGZvcm1hdCkge1xuICAgICAgdmFyIHJlID0gZGF0ZS5nZXRIb3VycygpLCBhbXBtID0gL3R7MSwyfS9pLnRlc3QoZnVsbGZvcm1hdCk7XG4gICAgICBpZiAoYW1wbSAmJiByZSA+IDEyKVxuICAgICAgICByZSA9IHJlICUgMTI7XG4gICAgICByZSA9IHJlLnRvU3RyaW5nKCk7XG4gICAgICB3aGlsZSAocmUubGVuZ3RoIDwgZm9ybWF0Lmxlbmd0aClcbiAgICAgICAgcmUgPSBcIjBcIiArIHJlO1xuICAgICAgcmV0dXJuIHJlO1xuICAgIH1cbiAgfSxcbiAgbWludXRlOiB7XG4gICAgcng6IC9tezEsMn0vLFxuICAgIGZuOiBmdW5jdGlvbiAoZGF0ZSwgZm9ybWF0KSB7XG4gICAgICB2YXIgcmUgPSBkYXRlLmdldE1pbnV0ZXMoKS50b1N0cmluZygpO1xuICAgICAgd2hpbGUgKHJlLmxlbmd0aCA8IGZvcm1hdC5sZW5ndGgpXG4gICAgICAgIHJlID0gXCIwXCIgKyByZTtcbiAgICAgIHJldHVybiByZTtcbiAgICB9XG4gIH0sXG4gIHNlY29uZDoge1xuICAgIHJ4OiAvc3sxLDJ9LyxcbiAgICBmbjogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCkge1xuICAgICAgdmFyIHJlID0gZGF0ZS5nZXRTZWNvbmRzKCkudG9TdHJpbmcoKTtcbiAgICAgIHdoaWxlIChyZS5sZW5ndGggPCBmb3JtYXQubGVuZ3RoKVxuICAgICAgICByZSA9IFwiMFwiICsgcmU7XG4gICAgICByZXR1cm4gcmU7XG4gICAgfVxuICB9LFxuICBtaWxsaXNlY29uZDoge1xuICAgIHJ4OiAvZnsxLDR9LyxcbiAgICBmbjogZnVuY3Rpb24gKGRhdGUsIGZvcm1hdCkge1xuICAgICAgdmFyIGwgPSBmb3JtYXQubGVuZ3RoO1xuICAgICAgdmFyIHJlID0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKS50b1N0cmluZygpO1xuICAgICAgd2hpbGUgKHJlLmxlbmd0aCA8IGwpXG4gICAgICAgIHJlID0gXCIwXCIgKyByZTtcbiAgICAgIGlmIChyZS5sZW5ndGggPiBsKSB7XG4gICAgICAgIHJldHVybiByZS5zdWJzdHIoMCwgbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmU7XG4gICAgfVxuICB9LFxuICBob3Vyc29mZnNldDoge1xuICAgIHJ4OiAvensxLDN9L2ksXG4gICAgZm46IGZ1bmN0aW9uIChkYXRlLCBmb3JtYXQsIGZ1bGxmb3JtYXQpIHtcbiAgICAgIHZhciByZSA9IC0oZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpIC8gNjApLCBzaWduID0gcmUgPiAwID8gXCIrXCIgOiBcIlwiO1xuICAgICAgc3dpdGNoIChmb3JtYXQubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZXR1cm4gc2lnbiArIHJlO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIHNpZ24gKyB6ZXJvRmlsbChyZSwgMik7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAvL3dpdGggbWludXRlc1xuICAgICAgICAgIHJldHVybiBzaWduICsgemVyb0ZpbGwocmUsIDIpICsgXCI6MDBcIjtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFtcG06IHtcbiAgICByeDogL3R7MSwyfS9pLFxuICAgIGZuOiBmdW5jdGlvbiAoZGF0ZSwgZm9ybWF0KSB7XG4gICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKSwgY2FwaXRhbHMgPSAvVHsxLDJ9Ly50ZXN0KGZvcm1hdCksIHJlO1xuICAgICAgc3dpdGNoIChmb3JtYXQubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZSA9IGggPiAxMiA/IFwicFwiIDogXCJhXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZSA9IGggPiAxMiA/IFwicG1cIiA6IFwiYW1cIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXBpdGFscyA/IHJlLnRvVXBwZXJDYXNlKCkgOiByZTtcbiAgICB9XG4gIH0sXG4gIHdlZWtkYXk6IHtcbiAgICByeDogL3d7MSwyfS9pLFxuICAgIGZuOiBmdW5jdGlvbiAoZGF0ZSwgZm9ybWF0LCBmdWxsRm9ybWF0LCByZWdpb25hbCkge1xuICAgICAgdmFyIHdlZWtEYXkgPSBkYXRlLmdldERheSgpO1xuICAgICAgdmFyIGtleSA9IGZvcm1hdC5sZW5ndGggPiAxID8gXCJ3ZWVrXCIgOiBcIndlZWtTaG9ydFwiLFxuICAgICAgICByZWcgPSByZWdpb25hbFtrZXldO1xuICAgICAgaWYgKHJlZyAmJiByZWdbd2Vla0RheV0gIT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHJlZ1t3ZWVrRGF5XTtcbiAgICAgIHJldHVybiB3ZWVrRGF5O1xuICAgIH1cbiAgfVxufTtcblxuY29uc3QgaXNvZGF0ZXJ4ID0gL15cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfVxcLlxcZCtaPyR8XlxcZHs0fS1cXGR7Mn0tXFxkezJ9W1RcXHNdXFxkezJ9OlxcZHsyfTpcXGR7Mn0oPzpcXHNVVEMpPyQvO1xuY29uc3QgZGF0ZXJ4ID0gL14oXFxkezR9KVxcRChcXGR7MSwyfSlcXEQoXFxkezEsMn0pKD86XFxzKFxcZHsxLDJ9KSg/OlxcRChcXGR7MSwyfSkpPyg/OlxcRChcXGR7MSwyfSkpPyk/JC9cblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiB2YWx1ZSBsb29rcyBsaWtlIGEgZGF0ZS5cbiAgICovXG4gIGxvb2tzTGlrZURhdGU6IGZ1bmN0aW9uIChzKSB7XG4gICAgaWYgKCFzKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKHMgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZVxuICAgIGlmICh0eXBlb2YgcyAhPSBcInN0cmluZ1wiKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCEhZGF0ZXJ4LmV4ZWMocykpIHJldHVybiB0cnVlO1xuICAgIGlmICghIWlzb2RhdGVyeC5leGVjKHMpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgZGVmYXVsdHM6IHtcbiAgICBcImZvcm1hdFwiOiB7XG4gICAgICBcInNob3J0XCI6IFwiREQuTU0uWVlZWVwiLFxuICAgICAgXCJsb25nXCI6IFwiREQuTU0uWVlZWSBISDptbTpzc1wiXG4gICAgfSxcbiAgICBcIndlZWtcIjogW1xuICAgICAgXCJTdW5kYXlcIixcbiAgICAgIFwiTW9uZGF5XCIsXG4gICAgICBcIlR1ZXNkYXlcIixcbiAgICAgIFwiV2VkbmVzZGF5XCIsXG4gICAgICBcIlRodXJzZGF5XCIsXG4gICAgICBcIkZyaWRheVwiLFxuICAgICAgXCJTYXR1cmRheVwiXG4gICAgXSxcbiAgICBcIndlZWtTaG9ydFwiOiBbXG4gICAgICBcIlN1blwiLFxuICAgICAgXCJNb25cIixcbiAgICAgIFwiVHVlXCIsXG4gICAgICBcIldlZFwiLFxuICAgICAgXCJUaHVcIixcbiAgICAgIFwiRnJpXCIsXG4gICAgICBcIlNhdFwiXG4gICAgXSxcbiAgICBcIm1vbnRoXCI6IFtcbiAgICAgIFwiSmFudWFyeVwiLFxuICAgICAgXCJGZWJydWFyeVwiLFxuICAgICAgXCJNYXJjaFwiLFxuICAgICAgXCJBcHJpbFwiLFxuICAgICAgXCJNYXlcIixcbiAgICAgIFwiSnVuZVwiLFxuICAgICAgXCJKdWx5XCIsXG4gICAgICBcIkF1Z3VzdFwiLFxuICAgICAgXCJTZXB0ZW1iZXJcIixcbiAgICAgIFwiT2N0b2JlclwiLFxuICAgICAgXCJOb3ZlbWJlclwiLFxuICAgICAgXCJEZWNlbWJlclwiXG4gICAgXSxcbiAgICBcIm1vbnRoU2hvcnRcIjogW1xuICAgICAgXCJKYW5cIixcbiAgICAgIFwiRmViXCIsXG4gICAgICBcIk1hclwiLFxuICAgICAgXCJBcHJcIixcbiAgICAgIFwiTWF5XCIsXG4gICAgICBcIkp1blwiLFxuICAgICAgXCJKdWxcIixcbiAgICAgIFwiQXVnXCIsXG4gICAgICBcIlNlcFwiLFxuICAgICAgXCJPY3RcIixcbiAgICAgIFwiTm92XCIsXG4gICAgICBcIkRlY1wiXG4gICAgXVxuICB9LFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgYSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZGF0ZSBpbnRvIGFuIGluc3RhbmNlIG9mIERhdGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzOiBzdHJpbmcgdG8gcGFyc2VcbiAgICovXG4gIHBhcnNlKHMpIHtcbiAgICBpZiAoIV8uaXNTdHJpbmcocykpIHtcbiAgICAgIFR5cGVFeGNlcHRpb24oXCJzXCIsIFwic3RyaW5nXCIpO1xuICAgIH1cbiAgICB2YXIgbSA9IGRhdGVyeC5leGVjKHMpO1xuICAgIGlmIChtKSB7XG4gICAgICAvLyBUaGUgZGF0ZSBpcyBub3QgaW4gc3RhbmRhcmQgZm9ybWF0LlxuICAgICAgLy8gdGhpcyBtZWFucyB0aGF0ICpzb21lKiBicm93c2VycyB3aWxsIG1ha2UgYXNzdW1wdGlvbnMgYWJvdXQgdGhlIHRpbWV6b25lIG9mIHRoZSBkYXRlXG4gICAgICB2YXIgaG91ciA9IG1bNF07XG4gICAgICBpZiAoaG91cikge1xuICAgICAgICB2YXIgYSA9IG5ldyBEYXRlKHBhcnNlSW50KG1bMV0pLCBwYXJzZUludChtWzJdKS0xLCBwYXJzZUludChtWzNdKSwgcGFyc2VJbnQoaG91ciksIHBhcnNlSW50KG1bNV0gfHwgMCksIHBhcnNlSW50KG1bNl0gfHwgMCkpO1xuICAgICAgICByZXR1cm4gYTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRGF0ZShtWzFdLCBtWzJdLTEsIG1bM10pO1xuICAgIH1cbiAgICAvLyBkb2VzIHRoZSBkYXRlIGxvb2sgbGlrZSBhIGRhdGUgaW4gSVNPIGZvcm1hdD9cbiAgICBpZiAoISFpc29kYXRlcnguZXhlYyhzKSkge1xuICAgICAgLy8gdGhpcyBpcyB0aGUgaWRlYWwgc2NlbmFyaW86IHRoZSBzZXJ2ZXIgaXMgcmV0dXJuaW5nIGRhdGVzIGluIElTTyBmb3JtYXQsXG4gICAgICAvLyBzbyB0aGV5IGNhbiBiZSBwYXNzZWQgc2FmZWx5IHRvIERhdGUgY29uc3RydWN0b3JcbiAgICAgIGlmICghL1okLy50ZXN0KHMpICYmIHMuaW5kZXhPZihcIlVUQ1wiKSA9PSAtMSkgcyA9IHMgKyBcIlpcIjsgLy8gTkI6IHRoaXMgZml4IGlzIG5lY2Vzc2FyeSB0byBoYXZlIGRhdGVzIHRoYXQgd29yayBpbiBGaXJlZm94IGxpa2UgaW4gQ2hyb21lXG4gICAgICAvLyBXZSBjYW4gZG8gaXQsIGJlY2F1c2UgdGhlIHNlcnZlciBpcyBzdG9yaW5nIGFuZCByZXR1cm5pbmcgZGF0ZXMgaW4gVVRDXG4gICAgICAvLyBUaGUgWiBzdWZmaXggaXMgZ29pbmcgdG8gYmUgZGVwcmVjYXRlZFxuICAgICAgcmV0dXJuIG5ldyBEYXRlKHMpO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBkYXRlIHdpdGhvdXQgdGltZSxcbiAgICogb3B0aW9uYWxseSB1c2luZyBhIGdpdmVuIHJlZ2lvbmFsIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtkYXRlfSBkOiBkYXRlIHRvIGZvcm1hdDtcbiAgICogQHBhcmFtIHtvYmplY3R9IFtyZWdpb25hbF0gLSByZWdpb25hbCBvYmplY3RcbiAgICovXG4gIGZvcm1hdChkYXRlLCBmb3JtYXQsIHJlZ2lvbmFsKSB7XG4gICAgaWYgKCFmb3JtYXQpIGZvcm1hdCA9IHRoaXMuZGVmYXVsdHMuZm9ybWF0LnNob3J0O1xuICAgIGlmICghcmVnaW9uYWwpIHJlZ2lvbmFsID0gdGhpcy5kZWZhdWx0cztcbiAgICB2YXIgcmUgPSBmb3JtYXQ7XG4gICAgZm9yICh2YXIgeCBpbiBwYXJ0cykge1xuICAgICAgdmFyIHBhcnQgPSBwYXJ0c1t4XSxcbiAgICAgICAgbSA9IGZvcm1hdC5tYXRjaChwYXJ0LnJ4KTtcbiAgICAgIGlmICghbSkgY29udGludWU7XG4gICAgICByZSA9IHJlLnJlcGxhY2UocGFydC5yeCwgcGFydC5mbihkYXRlLCBtWzBdLCBmb3JtYXQsIHJlZ2lvbmFsKSk7XG4gICAgfVxuICAgIHJldHVybiByZTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIGRhdGUgYW5kIHRpbWUsXG4gICAqIG9wdGlvbmFsbHkgdXNpbmcgYSBnaXZlbiByZWdpb25hbCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7ZGF0ZX0gZDogZGF0ZSB0byBmb3JtYXQ7XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbcmVnaW9uYWxdIC0gcmVnaW9uYWwgb2JqZWN0XG4gICAqL1xuICBmb3JtYXRXaXRoVGltZShkLCByZWdpb25hbCkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdChkLCB0aGlzLmRlZmF1bHRzLmZvcm1hdC5sb25nLCByZWdpb25hbCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIGEgdmFsaWQgZGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIHthbnl9IHY6IHZhbHVlIHRvIGNoZWNrLlxuICAgKi9cbiAgaXNWYWxpZCh2KSB7XG4gICAgcmV0dXJuIHYgaW5zdGFuY2VvZiBEYXRlICYmIGlzRmluaXRlKHYpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHR3byBkYXRlcyBhcmUgaW4gdGhlIHNhbWUgZGF5LlxuICAgKlxuICAgKiBAcGFyYW0ge2RhdGV9IGE6IGRhdGUgdG8gY2hlY2s7XG4gICAqIEBwYXJhbSB7ZGF0ZX0gYjogZGF0ZSB0byBjaGVjaztcbiAgICovXG4gIHNhbWVEYXkoYSwgYikge1xuICAgIHJldHVybiBhLmdldEZ1bGxZZWFyKCkgPT09IGIuZ2V0RnVsbFllYXIoKVxuICAgICYmIGEuZ2V0TW9udGgoKSA9PT0gYi5nZXRNb250aCgpXG4gICAgJiYgYS5nZXREYXRlKCkgPT09IGIuZ2V0RGF0ZSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGEgZGF0ZSBpcyB0b2RheS5cbiAgICpcbiAgICogQHBhcmFtIHtkYXRlfSBhOiBkYXRlIHRvIGNoZWNrO1xuICAgKi9cbiAgaXNUb2RheShhKSB7XG4gICAgcmV0dXJuIHRoaXMuc2FtZURheShhLCBuZXcgRGF0ZSgpKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBhIGRhdGUgaGFzIGEgdGltZSBjb21wb25lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7ZGF0ZX0gYTogZGF0ZSB0byBjaGVjaztcbiAgICovXG4gIGhhc1RpbWUoYSkge1xuICAgIHZhciBob3VycyA9IGEuZ2V0SG91cnMoKSwgbWludXRlcyA9IGEuZ2V0TWludXRlcygpLCBzZWNvbmRzID0gYS5nZXRTZWNvbmRzKCk7XG4gICAgcmV0dXJuICEhKGhvdXJzIHx8IG1pbnV0ZXMgfHwgc2Vjb25kcyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdGFuZGFyZGl6ZWQgSVNPIDg2MDEgZm9ybWF0dGVkIHN0cmluZy5cbiAgICogMjAxMS0wNi0yOVQxNjo1Mjo0OC4wMDBaXG4gICAqL1xuICB0b0lzbzg2MDEoYSkge1xuICAgIHJldHVybiB0aGlzLmZvcm1hdChhLCBcIllZWVktTU0tRERcIikgKyBcIlRcIiArIHRoaXMuZm9ybWF0KGEsIFwiaGg6bW06c3NcIikgKyBcIi5cIiArIHRoaXMuZm9ybWF0KGEsIFwiZmZmXCIpICsgXCJaXCI7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSByZXByZXNlbnRpbmcgYSBkYXRlIGluIEV4Y2VsLXN0eWxlLlxuICAgKiBFeGNlbCBzdG9yZXMgZGF0ZXMgYXMgc2VxdWVudGlhbCBzZXJpYWwgbnVtYmVycyBzbyB0aGF0IHRoZXkgY2FuIGJlIHVzZWQgaW4gY2FsY3VsYXRpb25zLiBcbiAgICogQnkgZGVmYXVsdCwgSmFudWFyeSAxLCAxOTAwIGlzIHNlcmlhbCBudW1iZXIgMSwgYW5kIEphbnVhcnkgMSwgMjAwOCBpcyBzZXJpYWwgbnVtYmVyIDM5NDQ4IGJlY2F1c2UgaXQgaXMgMzksNDQ3IGRheXMgYWZ0ZXIgSmFudWFyeSAxLCAxOTAwLlxuICAgKi9cbiAgdG9FeGNlbERhdGVWYWx1ZSh2KSB7XG4gICAgdmFyIGEgPSAyNTU2OS4wICsgKCh2LmdldFRpbWUoKSAtICh2LmdldFRpbWV6b25lT2Zmc2V0KCkgKiA2MCAqIDEwMDApKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSk7XG4gICAgcmV0dXJuIGEudG9TdHJpbmcoKS5zdWJzdHIoMCw1KTtcbiAgfVxufVxuIiwiLyoqXG4gKiBFdmVudHMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiO1xuXG52YXIgYXJyYXkgPSBbXTtcbnZhciBwdXNoID0gYXJyYXkucHVzaDtcbnZhciBzbGljZSA9IGFycmF5LnNsaWNlO1xudmFyIHNwbGljZSA9IGFycmF5LnNwbGljZTtcblxuLy8gUmVndWxhciBleHByZXNzaW9uIHVzZWQgdG8gc3BsaXQgZXZlbnQgc3RyaW5ncy5cbmNvbnN0IGV2ZW50U3BsaXR0ZXIgPSAvXFxzKy87XG5cbnZhciBldmVudHNBcGkgPSBmdW5jdGlvbiAob2JqLCBhY3Rpb24sIG5hbWUsIHJlc3QpIHtcbiAgaWYgKCFuYW1lKSByZXR1cm4gdHJ1ZTtcblxuICAvLyBIYW5kbGUgZXZlbnQgbWFwcy5cbiAgaWYgKHR5cGVvZiBuYW1lID09PSBcIm9iamVjdFwiKSB7XG4gICAgZm9yICh2YXIga2V5IGluIG5hbWUpIHtcbiAgICAgIG9ialthY3Rpb25dLmFwcGx5KG9iaiwgW2tleSwgbmFtZVtrZXldXS5jb25jYXQocmVzdCkpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBIYW5kbGUgc3BhY2Ugc2VwYXJhdGVkIGV2ZW50IG5hbWVzLlxuICBpZiAoZXZlbnRTcGxpdHRlci50ZXN0KG5hbWUpKSB7XG4gICAgdmFyIG5hbWVzID0gbmFtZS5zcGxpdChldmVudFNwbGl0dGVyKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5hbWVzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgb2JqW2FjdGlvbl0uYXBwbHkob2JqLCBbbmFtZXNbaV1dLmNvbmNhdChyZXN0KSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG52YXIgdHJpZ2dlckV2ZW50cyA9IGZ1bmN0aW9uIChldmVudHMsIGFyZ3MpIHtcbiAgdmFyIGV2LCBpID0gLTEsIGwgPSBldmVudHMubGVuZ3RoLCBhMSA9IGFyZ3NbMF0sIGEyID0gYXJnc1sxXSwgYTMgPSBhcmdzWzJdO1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCk7IHJldHVybjtcbiAgICBjYXNlIDE6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSk7IHJldHVybjtcbiAgICBjYXNlIDI6IHdoaWxlICgrK2kgPCBsKSAoZXYgPSBldmVudHNbaV0pLmNhbGxiYWNrLmNhbGwoZXYuY3R4LCBhMSwgYTIpOyByZXR1cm47XG4gICAgY2FzZSAzOiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5jYWxsKGV2LmN0eCwgYTEsIGEyLCBhMyk7IHJldHVybjtcbiAgICBkZWZhdWx0OiB3aGlsZSAoKytpIDwgbCkgKGV2ID0gZXZlbnRzW2ldKS5jYWxsYmFjay5hcHBseShldi5jdHgsIGFyZ3MpO1xuICB9XG59XG5cbi8vXG4vLyBCYXNlIGNsYXNzIGZvciBldmVudHMgZW1pdHRlcnNcbi8vXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudHNFbWl0dGVyIHtcblxuICAvLyBCaW5kIGFuIGV2ZW50IHRvIGEgYGNhbGxiYWNrYCBmdW5jdGlvbi4gUGFzc2luZyBgXCJhbGxcImAgd2lsbCBiaW5kXG4gIC8vIHRoZSBjYWxsYmFjayB0byBhbGwgZXZlbnRzIGZpcmVkLlxuICBvbihuYW1lLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwib25cIiwgbmFtZSwgW2NhbGxiYWNrLCBjb250ZXh0XSkgfHwgIWNhbGxiYWNrKSByZXR1cm4gdGhpcztcbiAgICB0aGlzLl9ldmVudHMgfHwgKHRoaXMuX2V2ZW50cyA9IHt9KTtcbiAgICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdIHx8ICh0aGlzLl9ldmVudHNbbmFtZV0gPSBbXSk7XG4gICAgZXZlbnRzLnB1c2goeyBjYWxsYmFjazogY2FsbGJhY2ssIGNvbnRleHQ6IGNvbnRleHQsIGN0eDogY29udGV4dCB8fCB0aGlzIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gQmluZCBhbiBldmVudCB0byBvbmx5IGJlIHRyaWdnZXJlZCBhIHNpbmdsZSB0aW1lLiBBZnRlciB0aGUgZmlyc3QgdGltZVxuICAvLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZCwgaXQgd2lsbCBiZSByZW1vdmVkLlxuICBvbmNlKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgaWYgKCFldmVudHNBcGkodGhpcywgXCJvbmNlXCIsIG5hbWUsIFtjYWxsYmFjaywgY29udGV4dF0pIHx8ICFjYWxsYmFjaykgcmV0dXJuIHRoaXM7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBvbmNlID0gXy5vbmNlKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub2ZmKG5hbWUsIG9uY2UpO1xuICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9KTtcbiAgICBvbmNlLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIG9uY2UsIGNvbnRleHQpO1xuICB9XG5cbiAgLy8gUmVtb3ZlIG9uZSBvciBtYW55IGNhbGxiYWNrcy5cbiAgb2ZmKG5hbWUsIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gICAgdmFyIHJldGFpbiwgZXYsIGV2ZW50cywgbmFtZXMsIGksIGwsIGosIGs7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIWV2ZW50c0FwaSh0aGlzLCBcIm9mZlwiLCBuYW1lLCBbY2FsbGJhY2ssIGNvbnRleHRdKSkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKCFuYW1lICYmICFjYWxsYmFjayAmJiAhY29udGV4dCkge1xuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBuYW1lcyA9IG5hbWUgPyBbbmFtZV0gOiBfLmtleXModGhpcy5fZXZlbnRzKTtcbiAgICBmb3IgKGkgPSAwLCBsID0gbmFtZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBuYW1lID0gbmFtZXNbaV07XG4gICAgICBpZiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzW25hbWVdKSB7XG4gICAgICAgIHRoaXMuX2V2ZW50c1tuYW1lXSA9IHJldGFpbiA9IFtdO1xuICAgICAgICBpZiAoY2FsbGJhY2sgfHwgY29udGV4dCkge1xuICAgICAgICAgIGZvciAoaiA9IDAsIGsgPSBldmVudHMubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBldiA9IGV2ZW50c1tqXTtcbiAgICAgICAgICAgIGlmICgoY2FsbGJhY2sgJiYgY2FsbGJhY2sgIT09IGV2LmNhbGxiYWNrICYmIGNhbGxiYWNrICE9PSBldi5jYWxsYmFjay5fY2FsbGJhY2spIHx8XG4gICAgICAgICAgICAoY29udGV4dCAmJiBjb250ZXh0ICE9PSBldi5jb250ZXh0KSkge1xuICAgICAgICAgICAgICByZXRhaW4ucHVzaChldik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghcmV0YWluLmxlbmd0aCkgZGVsZXRlIHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIFRyaWdnZXIgb25lIG9yIG1hbnkgZXZlbnRzLCBmaXJpbmcgYWxsIGJvdW5kIGNhbGxiYWNrcy5cbiAgdHJpZ2dlcihuYW1lKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMpIHJldHVybiB0aGlzO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGlmICghZXZlbnRzQXBpKHRoaXMsIFwidHJpZ2dlclwiLCBuYW1lLCBhcmdzKSkgcmV0dXJuIHRoaXM7XG4gICAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50c1tuYW1lXTtcbiAgICB2YXIgYWxsRXZlbnRzID0gdGhpcy5fZXZlbnRzLmFsbDtcbiAgICBpZiAoZXZlbnRzKSB0cmlnZ2VyRXZlbnRzKGV2ZW50cywgYXJncyk7XG4gICAgaWYgKGFsbEV2ZW50cykgdHJpZ2dlckV2ZW50cyhhbGxFdmVudHMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBUcmlnZ2VyIG9uZSBvciBtYW55IGV2ZW50cywgZmlyaW5nIGFsbCBib3VuZCBjYWxsYmFja3MuXG4gIGVtaXQobmFtZSkge1xuICAgIHJldHVybiB0aGlzLnRyaWdnZXIobmFtZSk7XG4gIH1cblxuICAvLyBUZWxsIHRoaXMgb2JqZWN0IHRvIHN0b3AgbGlzdGVuaW5nIHRvIGVpdGhlciBzcGVjaWZpYyBldmVudHMsIG9yXG4gIC8vIHRvIGV2ZXJ5IG9iamVjdCBpdCdzIGN1cnJlbnRseSBsaXN0ZW5pbmcgdG8uXG4gIHN0b3BMaXN0ZW5pbmcob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG4gICAgaWYgKCFsaXN0ZW5lcnMpIHJldHVybiB0aGlzO1xuICAgIHZhciBkZWxldGVMaXN0ZW5lciA9ICFuYW1lICYmICFjYWxsYmFjaztcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwib2JqZWN0XCIpIGNhbGxiYWNrID0gdGhpcztcbiAgICBpZiAob2JqKSAobGlzdGVuZXJzID0ge30pW29iai5fbGlzdGVuZXJJZF0gPSBvYmo7XG4gICAgZm9yICh2YXIgaWQgaW4gbGlzdGVuZXJzKSB7XG4gICAgICBsaXN0ZW5lcnNbaWRdLm9mZihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgICBpZiAoZGVsZXRlTGlzdGVuZXIpIGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbaWRdO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlblRvKG9iaiwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICAvLyBzdXBwb3J0IGNhbGxpbmcgdGhlIG1ldGhvZCB3aXRoIGFuIG9iamVjdCBhcyBzZWNvbmQgcGFyYW1ldGVyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMiAmJiB0eXBlb2YgbmFtZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgICB2YXIgeDtcbiAgICAgIGZvciAoeCBpbiBuYW1lKSB7XG4gICAgICAgIHRoaXMubGlzdGVuVG8ob2JqLCB4LCBuYW1lW3hdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcbiAgICBsaXN0ZW5lcnNbaWRdID0gb2JqO1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xuICAgIG9iai5vbihuYW1lLCBjYWxsYmFjaywgdGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5Ub09uY2Uob2JqLCBuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnMgfHwgKHRoaXMuX2xpc3RlbmVycyA9IHt9KTtcbiAgICB2YXIgaWQgPSBvYmouX2xpc3RlbmVySWQgfHwgKG9iai5fbGlzdGVuZXJJZCA9IF8udW5pcXVlSWQoXCJsXCIpKTtcbiAgICBsaXN0ZW5lcnNbaWRdID0gb2JqO1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJvYmplY3RcIikgY2FsbGJhY2sgPSB0aGlzO1xuICAgIG9iai5vbmNlKG5hbWUsIGNhbGxiYWNrLCB0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcbiIsIi8qKlxuICogTnVtYmVyIHV0aWxpdGllcy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICBmb3JtYXQ6IGZ1bmN0aW9uICh2LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgLy9yZXR1cm4gdi50b1N0cmluZygpO1xuICAgIC8vXG4gICAgLy8gVE9ETzogaWYgYXZhaWxhYmxlLCB1c2UgdGhlIEludGwuTnVtYmVyRm9ybWF0IGNsYXNzISFcbiAgICAvLyBpZiBub3QsIGFzayBmb3IgYSBQb2x5ZmlsbCEgQnV0IGluIGNvbnNvbGUuaW5mby5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9OdW1iZXJGb3JtYXRcbiAgICBpZiAodHlwZW9mIEludGwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJldHVybiBJbnRsLk51bWJlckZvcm1hdChvcHRpb25zLmxvY2FsZSB8fCBcImVuLUdCXCIpLmZvcm1hdCh2KTtcbiAgICB9XG4gICAgcmV0dXJuICh2IHx8IFwiXCIpLnRvU3RyaW5nKCk7XG4gICAgLy9cbiAgICAvLyBjb25zb2xlLmxvZyhuZXcgSW50bC5OdW1iZXJGb3JtYXQoJ3BsJywgeyBtaW5pbXVtRnJhY3Rpb25EaWdpdHM6IDIgfSkuZm9ybWF0KDEyMzEyMy4wMDApKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBSZWZsZWN0aW9uIHV0aWxpdGllcy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCJcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgLy8gZ2V0cyB2YWx1ZSBvciB2YWx1ZXMgb2YgYSBnaXZlbiBvYmplY3QsIGZyb20gYSBuYW1lIG9yIG5hbWVzcGFjZSAoZXhhbXBsZTogXCJkb2cubmFtZVwiKVxuICBnZXRQcm9wZXJ0eVZhbHVlKG8sIG5hbWUpIHtcbiAgICB2YXIgYSA9IG5hbWUuc3BsaXQoXCIuXCIpLCB4ID0gbywgcDtcbiAgICB3aGlsZSAocCA9IGEuc2hpZnQoKSkge1xuICAgICAgaWYgKF8uaGFzKHgsIHApKSB7XG4gICAgICAgIHggPSB4W3BdO1xuICAgICAgfVxuICAgICAgaWYgKF8uaXNBcnJheSh4KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKF8uaXNBcnJheSh4KSkge1xuICAgICAgaWYgKCFhLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmdldENvbGxlY3Rpb25Qcm9wZXJ0aWVzVmFsdWUoeCwgYS5qb2luKFwiLlwiKSk7XG4gICAgfVxuICAgIHJldHVybiB4O1xuICB9LFxuXG4gIC8vIGdldHMgcHJvcGVydGllcyB2YWx1ZXMgZnJvbSBhIGdpdmVuIGNvbGxlY3Rpb25cbiAgZ2V0Q29sbGVjdGlvblByb3BlcnRpZXNWYWx1ZShjb2xsZWN0aW9uLCBuYW1lLCBpbmNsdWRlRW1wdHlWYWx1ZXMpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGluY2x1ZGVFbXB0eVZhbHVlcyAhPSBcImJvb2xlYW5cIikge1xuICAgICAgaW5jbHVkZUVtcHR5VmFsdWVzID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBhID0gbmFtZS5zcGxpdChcIi5cIiksIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29sbGVjdGlvbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBvID0gY29sbGVjdGlvbltpXTtcblxuICAgICAgaWYgKCFfLmhhcyhvLCBhWzBdKSkge1xuICAgICAgICBpZiAoaW5jbHVkZUVtcHR5VmFsdWVzKSB7XG4gICAgICAgICAgdmFsdWVzLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAoXy5pc0FycmF5KG8pKSB7XG4gICAgICAgIHZhciBmb3VuZENvbGwgPSB0aGlzLmdldENvbGxlY3Rpb25Qcm9wZXJ0aWVzVmFsdWUobywgbmFtZSk7XG4gICAgICAgIGlmIChpbmNsdWRlRW1wdHlWYWx1ZXMgfHwgZm91bmRDb2xsLmxlbmd0aCkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKGZvdW5kQ29sbCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXy5pc1BsYWluT2JqZWN0KG8pKSB7XG4gICAgICAgIHZhciBmb3VuZFZhbCA9IHRoaXMuZ2V0UHJvcGVydHlWYWx1ZShvLCBuYW1lKTtcbiAgICAgICAgaWYgKGluY2x1ZGVFbXB0eVZhbHVlcyB8fCB0aGlzLnZhbGlkYXRlVmFsdWUoZm91bmRWYWwpKSB7XG4gICAgICAgICAgdmFsdWVzLnB1c2goZm91bmRWYWwpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW5jbHVkZUVtcHR5VmFsdWVzIHx8IHRoaXMudmFsaWRhdGVWYWx1ZShvKSkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0sXG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHRoZSBvYmplY3QgaGFzIGEgc2lnbmlmaWNhbnQgdmFsdWUsIGZhbHNlIG90aGVyd2lzZVxuICB2YWxpZGF0ZVZhbHVlKG8pIHtcbiAgICBpZiAoIW8pIHJldHVybiBmYWxzZTtcbiAgICBpZiAoXy5pc0FycmF5KG8pKSB7XG4gICAgICByZXR1cm4gISFvLmxlbmd0aDtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiIsIi8qKlxuICogUmVnZXggdXRpbGl0aWVzLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHMuanNcIlxuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzZWFyY2ggcGF0dGVybiBmcm9tIGEgbGlzdCBvZiBzdHJpbmdzLlxuICAgKi9cbiAgZ2V0UGF0dGVybkZyb21TdHJpbmdzKGEpIHtcbiAgICBpZiAoIWEgfHwgIWEubGVuZ3RoKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBwYXJhbWV0ZXJcIik7XG4gICAgdmFyIHMgPSBfLm1hcChhLCB4ID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmVzY2FwZUNoYXJzRm9yUmVnZXgoeCk7XG4gICAgfSkuam9pbihcInxcIik7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXCIoXCIgKyBzICsgXCIpXCIsIFwibWdpXCIpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBhIHN0cmluZyB0byB1c2UgaXQgdG8gZGVjbGFyZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAgICovXG4gIGVzY2FwZUNoYXJzRm9yUmVnZXgocykge1xuICAgIGlmICh0eXBlb2YgcyAhPSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gICAgLy9jaGFyYWN0ZXJzIHRvIGVzY2FwZSBpbiByZWd1bGFyIGV4cHJlc3Npb25zXG4gICAgcmV0dXJuIHMucmVwbGFjZSgvKFtcXF5cXCRcXC5cXChcXClcXFtcXF1cXD9cXCFcXCpcXCtcXHtcXH1cXHxcXC9cXFxcXSkvZywgXCJcXFxcJDFcIikucmVwbGFjZSgvXFxzL2csIFwiXFxcXHNcIik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGEgc2VhcmNoIHBhdHRlcm4sXG4gICAqIHJldHVybnMgdW5kZWZpbmVkIGlmIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gaXMgbm90IHZhbGlkLlxuICAgKi9cbiAgZ2V0U2VhcmNoUGF0dGVybihzLCBvcHRpb25zKSB7XG4gICAgaWYgKCFzKSByZXR1cm4gLy4rL21naTtcbiAgICBvcHRpb25zID0gXy5leHRlbmQoeyBzZWFyY2hNb2RlOiBcImZ1bGxzdHJpbmdcIiB9LCBvcHRpb25zIHx8IHt9KTtcbiAgICBzd2l0Y2ggKG9wdGlvbnMuc2VhcmNoTW9kZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICBjYXNlIFwic3BsaXR3b3Jkc1wiOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWRcIilcblxuICAgICAgY2FzZSBcImZ1bGxzdHJpbmdcIjpcbiAgICAgICAgLy9lc2NhcGUgY2hhcmFjdGVyc1xuICAgICAgICBzID0gdGhpcy5lc2NhcGVDaGFyc0ZvclJlZ2V4KHMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKFwiICsgcyArIFwiKVwiLCBcIm1naVwiKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAvL3RoaXMgc2hvdWxkIG5vdCBoYXBwZW5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgXCJpbnZhbGlkIHNlYXJjaE1vZGVcIjtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGEgc2VhcmNoIG1hdGNoIHBhdHRlcm4uXG4gICAqL1xuICBnZXRNYXRjaFBhdHRlcm4ocykge1xuICAgIGlmICghcykgeyByZXR1cm4gLy4rL21nOyB9XG4gICAgcyA9IHRoaXMuZXNjYXBlQ2hhcnNGb3JSZWdleChzKTtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzLCBcImlcIik7XG4gIH1cbn1cbiIsIi8qKlxuICogU3RyaW5nIHV0aWxpdGllcy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmNvbnN0IFJFUCA9IFwicmVwbGFjZVwiXG5jb25zdCBJTlZBTElEX0ZJTExFUiA9IFwiaW52YWxpZCBmaWxsZXIgKG11c3QgYmUgYXMgc2luZ2xlIGNoYXJhY3RlcilcIlxuY29uc3QgTEVOR1RIX01VU1RfUE9TSVRJVkUgPSBcImxlbmd0aCBtdXN0IGJlID4gMFwiXG5pbXBvcnQge1xuICBBcmd1bWVudEV4Y2VwdGlvblxufSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzLmpzXCJcbmltcG9ydCBub3JtYWxpemUgZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9zdHJpbmcubm9ybWFsaXplXCJcbmNvbnN0IGlzU3RyaW5nID0gXy5pc1N0cmluZ1xuXG5mdW5jdGlvbiB0b0xvd2VyKHMpIHtcbiAgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gdG9VcHBlcihzKSB7XG4gIHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBub3JtYWxpemUsXG5cbiAgcmVwbGFjZUF0KHMsIGluZGV4LCByZXBsYWNlbWVudCkge1xuICAgIGlmICghcykgcmV0dXJuIHM7XG4gICAgcmV0dXJuIHMuc3Vic3RyKDAsIGluZGV4KSArIHJlcGxhY2VtZW50ICsgcy5zdWJzdHIoaW5kZXggKyByZXBsYWNlbWVudC5sZW5ndGgpO1xuICB9LFxuXG4gIGZpbmREaWFjcml0aWNzKHMpIHtcbiAgICBpZiAoIXMpIHJldHVybiBzO1xuXG4gICAgdmFyIHJ4ID0gL1tcXHUwMzAwLVxcdTAzNkZdfFtcXHUxQUIw4oCTXFx1MUFGRl0vZ207XG4gICAgdmFyIGEgPSBbXSwgbTtcbiAgICB3aGlsZSAobSA9IHJ4LmV4ZWMocykpIHtcbiAgICAgIGEucHVzaCh7XG4gICAgICAgIGk6IG0uaW5kZXgsXG4gICAgICAgIHY6IG1bMF1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbiAgfSxcblxuICAvKipcbiAgICogUmVzdG9yZSBkaWFjcml0aWNzIGluIG5vcm1hbGl6ZWQgc3RyaW5ncy5cbiAgICovXG4gIHJlc3RvcmVEaWFjcml0aWNzKHMsIGRpYWNyaXRpY3MsIG9mZnNldCkge1xuICAgIGlmICghcykgcmV0dXJuIHM7XG4gICAgdmFyIGwgPSBkaWFjcml0aWNzLmxlbmd0aDtcbiAgICBpZiAoIWwpIHJldHVybiBzO1xuICAgIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkgb2Zmc2V0ID0gMDtcbiAgICB2YXIgZW5kSW5kZXggPSBvZmZzZXQgKyBzLmxlbmd0aCAtIDE7IC8vIE5COiB3ZSBvbmx5IHJlc3RvcmUgZGlhY3JpdGljcyB0aGF0IGFwcGVhcnMgaW4gdGhlIHN0cmluZyBwb3J0aW9uXG4gICAgdmFyIGQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIGQgPSBkaWFjcml0aWNzW2ldO1xuICAgICAgaWYgKGQuaSA+IGVuZEluZGV4KSBicmVhaztcbiAgICAgIHMgPSB0aGlzLnJlcGxhY2VBdChzLCBkLmkgLSBvZmZzZXQsIGQudik7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHN0cmluZyBpbiBzbmFrZV9jYXNlLCBmcm9tIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAqL1xuICBzbmFrZUNhc2Uocykge1xuICAgIGlmICghcykgcmV0dXJuIHM7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlTXVsdGlwbGVTcGFjZXMocy50cmltKCkpXG4gICAgICBbUkVQXSgvW15hLXpBLVowLTldL2csIFwiX1wiKVxuICAgICAgW1JFUF0oLyhbYS16XSlbXFxzXFwtXT8oW0EtWl0pL2csIChhLCBiLCBjKSA9PiB7IHJldHVybiBiICsgXCJfXCIgKyB0b0xvd2VyKGMpOyB9KVxuICAgICAgW1JFUF0oLyhbQS1aXSspL2csIChhLCBiKSA9PiB7IHJldHVybiB0b0xvd2VyKGIpOyB9KVxuICAgICAgW1JFUF0oL197Mix9L2csIFwiX1wiKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBzdHJpbmcgaW4ga2ViYWItY2FzZSwgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nLlxuICAgKi9cbiAga2ViYWJDYXNlKHMpIHtcbiAgICBpZiAoIXMpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZU11bHRpcGxlU3BhY2VzKHMudHJpbSgpKVxuICAgICAgW1JFUF0oL1teYS16QS1aMC05XS9nLCBcIi1cIilcbiAgICAgIFtSRVBdKC8oW2Etel0pW1xcc1xcLV0/KFtBLVpdKS9nLCAoYSwgYiwgYykgPT4geyByZXR1cm4gYiArIFwiLVwiICsgdG9Mb3dlcihjKTsgfSlcbiAgICAgIFtSRVBdKC8oW0EtWl0rKS9nLCAoYSwgYikgPT4geyByZXR1cm4gdG9Mb3dlcihiKTsgfSlcbiAgICAgIFtSRVBdKC8tezIsfS9nLCBcIi1cIik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgc3RyaW5nIGluIGNhbWVsQ2FzZSwgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nLlxuICAgKi9cbiAgY2FtZWxDYXNlKHMpIHtcbiAgICBpZiAoIXMpIHJldHVybiBzO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZU11bHRpcGxlU3BhY2VzKHMudHJpbSgpKVxuICAgICAgW1JFUF0oL1teYS16QS1aMC05XSsoW2EtekEtWl0pPy9nLCAoYSwgYikgPT4geyByZXR1cm4gdG9VcHBlcihiKTsgfSlcbiAgICAgIFtSRVBdKC8oW2Etel0pW1xcc1xcLV0/KFtBLVpdKS9nLCAoYSwgYiwgYykgPT4geyByZXR1cm4gYiArIHRvVXBwZXIoYyk7IH0pXG4gICAgICBbUkVQXSgvXihbQS1aXSspL2csIChhLCBiKSA9PiB7IHJldHVybiB0b0xvd2VyKGIpOyB9KTtcbiAgfSxcblxuICBmb3JtYXQocykge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHJldHVybiBzW1JFUF0oL3soXFxkKyl9L2csIChtYXRjaCwgaSkgPT4ge1xuICAgICAgcmV0dXJuIHR5cGVvZiBhcmdzW2ldICE9IFwidW5kZWZpbmVkXCIgPyBhcmdzW2ldIDogbWF0Y2g7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZnJvbSB0aGUgZ2l2ZW4gdmFsdWUsIGluIGFueSBjYXNlLlxuICAgKi9cbiAgZ2V0U3RyaW5nKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsID09IFwic3RyaW5nXCIpIHJldHVybiB2YWw7XG4gICAgaWYgKHZhbC50b1N0cmluZykgcmV0dXJuIHZhbC50b1N0cmluZygpO1xuICAgIHJldHVybiBcIlwiO1xuICB9LFxuXG4gIC8qKlxuICAgKiBBIHN0cmluZyBjb21wYXJlIGZ1bmN0aW9uIHRoYXQgc3VwcG9ydHMgc29ydGluZyBvZiBzcGVjaWFsIGNoYXJhY3RlcnMuXG4gICAqXG4gICAqIEBwYXJhbSBhIHRoZSBmaXJzdCBzdHJpbmcgdG8gY29tcGFyZVxuICAgKiBAcGFyYW0gYiB0aGUgc2Vjb25kIHN0cmluZyB0byBjb21wYXJlXG4gICAqIEBwYXJhbSBvcmRlciBhc2NlbmRpbmcgb3IgZGVzY2VuZGluZ1xuICAgKiBAcGFyYW0gb3B0aW9ucyAoY2FzZVNlbnNpdGl2ZTsgY2hhcmFjdGVycyBvcHRpb24pXG4gICAqIEByZXR1cm5zIHsqfVxuICAgKi9cbiAgY29tcGFyZShhLCBiLCBvcmRlciwgb3B0aW9ucykge1xuICAgIG9yZGVyID0gXy5pc051bWJlcihvcmRlcikgPyBvcmRlciA6ICgvXmFzYy9pLnRlc3Qob3JkZXIpID8gMSA6IC0xKTtcbiAgICB2YXIgbyA9IF8uZXh0ZW5kKHtcbiAgICAgIGNpOiB0cnVlICAvLyBjYXNlIGluc2Vuc2l0aXZlXG4gICAgfSwgb3B0aW9ucyk7XG4gICAgaWYgKGEgJiYgIWIpIHJldHVybiBvcmRlcjtcbiAgICBpZiAoIWEgJiYgYikgcmV0dXJuIC1vcmRlcjtcbiAgICBpZiAoIWEgJiYgIWIpIHJldHVybiAwO1xuICAgIGlmIChhID09IGIpIHJldHVybiAwO1xuICAgIGlmICghXy5pc1N0cmluZyhhKSkgYSA9IGEudG9TdHJpbmcoKTtcbiAgICBpZiAoIV8uaXNTdHJpbmcoYikpIGIgPSBiLnRvU3RyaW5nKCk7XG4gICAgaWYgKG8uY2kpIHtcbiAgICAgIGEgPSBhLnRvTG93ZXJDYXNlKCk7XG4gICAgICBiID0gYi50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbm9ybWFsaXplKGEpIDwgbm9ybWFsaXplKGIpID8gLW9yZGVyIDogb3JkZXI7XG4gIH0sXG5cbiAgb2ZMZW5ndGgoYywgbCkge1xuICAgIHJldHVybiBuZXcgQXJyYXkobCArIDEpLmpvaW4oYyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFB5dGhvbi1saWtlIGNlbnRlciBmdW5jdGlvbjogcmV0dXJucyBhIG5ldyBzdHJpbmcgb2YgdGhlIGdpdmVuIGxlbmd0aCwgY2VudGVyaW5nIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSBzOiBzdHJpbmcgdG8gY2VudGVyXG4gICAqIEBwYXJhbSBsZW5ndGg6IG91dHB1dCBzdHJpbmcgbGVuZ3RoXG4gICAqIEBwYXJhbSBmaWxsZXI6IGZpbGxlciBjaGFyYWN0ZXJcbiAgICogQHJldHVybnMge1N0cmluZ31cbiAgICovXG4gIGNlbnRlcihzLCBsZW5ndGgsIGZpbGxlcikge1xuICAgIGlmIChsZW5ndGggPD0gMClcbiAgICAgIHRocm93IG5ldyBFcnJvcihMRU5HVEhfTVVTVF9QT1NJVElWRSk7XG4gICAgaWYgKCFmaWxsZXIpIGZpbGxlciA9IFwiIFwiO1xuICAgIGlmICghcylcbiAgICAgIHJldHVybiB0aGlzLm9mTGVuZ3RoKGZpbGxlciwgbGVuZ3RoKTtcbiAgICBpZiAoZmlsbGVyLmxlbmd0aCAhPSAxKSB0aHJvdyBuZXcgRXJyb3IoSU5WQUxJRF9GSUxMRVIpO1xuICAgIHZhciBoYWxmTGVuZ3RoID0gTWF0aC5mbG9vcigobGVuZ3RoIC0gcy5sZW5ndGgpIC8gMik7XG4gICAgdmFyIHN0YXJ0SGFsZiA9IHRoaXMub2ZMZW5ndGgoZmlsbGVyLCBoYWxmTGVuZ3RoKTtcbiAgICB2YXIgbGVmdCA9IGZhbHNlO1xuICAgIHZhciBvdXRwdXQgPSBzdGFydEhhbGYgKyBzICsgc3RhcnRIYWxmO1xuICAgIHdoaWxlIChvdXRwdXQubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICBpZiAobGVmdCkge1xuICAgICAgICAgIG91dHB1dCA9IGZpbGx0ZXIgKyBvdXRwdXQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIG91dHB1dCA9IG91dHB1dCArIGZpbGxlcjtcbiAgICAgIH1cbiAgICAgIGxlZnQgPSAhbGVmdDtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIHN0YXJ0cyB3aXRoIHRoZSBzZWNvbmRcbiAgICogZ2l2ZW4gc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gU3RyaW5nIHRvIGNoZWNrXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBTdGFydCB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IENhc2UgaW5zZW5zaXRpdmU/XG4gICAqL1xuICBzdGFydHNXaXRoKGEsIGIsIGNpKSB7XG4gICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKGNpKSB7XG4gICAgICByZXR1cm4gYS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoYikgPT0gMDtcbiAgICB9XG4gICAgcmV0dXJuIGEuaW5kZXhPZihiKSA9PSAwO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHN0cmluZyBvZiB0aGUgZ2l2ZW4gbGVuZ3RoLCByaWdodCBmaWxsZWQgd2l0aCB0aGUgZ2l2ZW5cbiAgICogZmlsbGVyIGNoYXJhY3Rlci5cbiAgICovXG4gIGxqdXN0KHMsIGxlbmd0aCwgZmlsbGVyKSB7XG4gICAgaWYgKGxlbmd0aCA8PSAwKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKExFTkdUSF9NVVNUX1BPU0lUSVZFKTtcbiAgICBpZiAoIWZpbGxlcikgZmlsbGVyID0gXCIgXCI7XG4gICAgaWYgKCFzKVxuICAgICAgcmV0dXJuIHRoaXMub2ZMZW5ndGgoZmlsbGVyLCBsZW5ndGgpO1xuICAgIGlmIChmaWxsZXIubGVuZ3RoICE9IDEpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoSU5WQUxJRF9GSUxMRVIpO1xuICAgIHdoaWxlIChzLmxlbmd0aCA8IGxlbmd0aClcbiAgICAgIHMgPSBzICsgZmlsbGVyO1xuICAgIHJldHVybiBzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IHN0cmluZyBvZiB0aGUgZ2l2ZW4gbGVuZ3RoLCBsZWZ0IGZpbGxlZCB3aXRoIHRoZSBnaXZlblxuICAgKiBmaWxsZXIgY2hhcmFjdGVyLlxuICAgKi9cbiAgcmp1c3QocywgbGVuZ3RoLCBmaWxsZXIpIHtcbiAgICBpZiAobGVuZ3RoIDw9IDApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoTEVOR1RIX01VU1RfUE9TSVRJVkUpO1xuICAgIGlmICghZmlsbGVyKSBmaWxsZXIgPSBcIiBcIjtcbiAgICBpZiAoIXMpXG4gICAgICByZXR1cm4gdGhpcy5vZkxlbmd0aChmaWxsZXIsIGxlbmd0aCk7XG4gICAgaWYgKGZpbGxlci5sZW5ndGggIT0gMSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihJTlZBTElEX0ZJTExFUik7XG4gICAgd2hpbGUgKHMubGVuZ3RoIDwgbGVuZ3RoKVxuICAgICAgcyA9IGZpbGxlciArIHM7XG4gICAgcmV0dXJuIHM7XG4gIH0sXG5cbiAgcmVtb3ZlTXVsdGlwbGVTcGFjZXMocykge1xuICAgIHJldHVybiBzW1JFUF0oL1xcc3syLH0vZywgXCIgXCIpO1xuICB9LFxuXG4gIHJlbW92ZUxlYWRpbmdTcGFjZXMocykge1xuICAgIHJldHVybiBzW1JFUF0oL15cXHMrfFxccyskLywgXCJcIik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpeGVzIHRoZSB3aWR0aCBvZiBhbGwgbGluZXMgaW5zaWRlIHRoZSBnaXZlbiB0ZXh0LCB1c2luZyB0aGUgZ2l2ZW4gZmlsbGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcyAtIHRleHQgb2Ygd2hpY2ggbGluZXMgc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtmaWxsZXI9IF0gLSBmaWxsZXIgdG8gdXNlXG4gICAqL1xuICBmaXhXaWR0aChzLCBmaWxsZXIpIHtcbiAgICBpZiAoIXMpIHJldHVybiBzO1xuICAgIGlmICghZmlsbGVyKSBmaWxsZXIgPSBcIiBcIjtcbiAgICB2YXIgbGluZXMsIHdhc1N0cmluZztcbiAgICBpZiAoXy5pc1N0cmluZyhzKSkge1xuICAgICAgbGluZXMgPSBzLnNwbGl0KC9cXG4vZyk7XG4gICAgICB3YXNTdHJpbmcgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHMpKSB7XG4gICAgICBsaW5lcyA9IF8uY2xvbmUocyk7XG4gICAgICB3YXNTdHJpbmcgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgQXJndW1lbnRFeGNlcHRpb24oXCJzXCIsIFwiZXhwZWN0ZWQgc3RyaW5nIG9yIHN0cmluZ1tdXCIpO1xuICAgIH1cbiAgICB2YXIgbGluZSwgbCA9IGxpbmVzLmxlbmd0aCwgYSA9IFtdO1xuICAgIC8vIG9idGFpbiB0aGUgbGluZXMgbWF4IGxlbmd0aFxuICAgIHZhciBtYXhMZW5ndGggPSBfLm1heChsaW5lcywgeCA9PiB7IHJldHVybiB4Lmxlbmd0aDsgfSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxpbmUgPSBsaW5lc1tpXTtcbiAgICAgIHdoaWxlIChsaW5lLmxlbmd0aCA8IG1heExlbmd0aCkge1xuICAgICAgICBsaW5lICs9IGZpbGxlcjtcbiAgICAgIH1cbiAgICAgIGxpbmVzW2ldID0gbGluZTtcbiAgICB9XG4gICAgcmV0dXJuIHdhc1N0cmluZyA/IGxpbmVzLmpvaW4oXCJcXG5cIikgOiBsaW5lcztcbiAgfSxcblxuICByZXBlYXQocywgbCkge1xuICAgIHJldHVybiBuZXcgQXJyYXkobCsxKS5qb2luKHMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiBhbGwgbGluZXMgaW5zaWRlIHRoZSBnaXZlbiBzdHJpbmcuXG4gICAqL1xuICBsaW5lc1dpZHRocyhzKSB7XG4gICAgaWYgKCFzKSByZXR1cm4gMDtcbiAgICB2YXIgbGluZXM7XG4gICAgaWYgKF8uaXNTdHJpbmcocykpIHtcbiAgICAgIGxpbmVzID0gcy5zcGxpdCgvXFxuL2cpO1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHMpKSB7XG4gICAgICBsaW5lcyA9IF8uY2xvbmUocyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIEFyZ3VtZW50RXhjZXB0aW9uKFwic1wiLCBcImV4cGVjdGVkIHN0cmluZyBvciBzdHJpbmdbXVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIF8ubWFwKGxpbmVzLCB4ID0+IHsgcmV0dXJuIHgubGVuZ3RoOyB9KTtcbiAgfVxufVxuIiwiLypcbiAgIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gXG4vLyBOb3RlIGZyb20gUm9iZXJ0byBQcmV2YXRvOiB0aGUgb3JpZ2luYWwgY29kZSB3YXMgb2J0YWluZWQgaGVyZTpcbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTkwOTA0L3JlbW92ZS1hY2NlbnRzLWRpYWNyaXRpY3MtaW4tYS1zdHJpbmctaW4tamF2YXNjcmlwdFxuLy8gXG4vLyBpdCBoYXMgYmVlbiByZXdyaXR0ZW4gaW4gRVM2IGFuZCByZWFkYXB0ZWQgZm9yIHVzZSAobm8gYWxlcnQpLlxuLy9cblxuY29uc3QgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwID0gW1xuICB7XCJiYXNlXCI6XCJBXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA0MVxcdTI0QjZcXHVGRjIxXFx1MDBDMFxcdTAwQzFcXHUwMEMyXFx1MUVBNlxcdTFFQTRcXHUxRUFBXFx1MUVBOFxcdTAwQzNcXHUwMTAwXFx1MDEwMlxcdTFFQjBcXHUxRUFFXFx1MUVCNFxcdTFFQjJcXHUwMjI2XFx1MDFFMFxcdTAwQzRcXHUwMURFXFx1MUVBMlxcdTAwQzVcXHUwMUZBXFx1MDFDRFxcdTAyMDBcXHUwMjAyXFx1MUVBMFxcdTFFQUNcXHUxRUI2XFx1MUUwMFxcdTAxMDRcXHUwMjNBXFx1MkM2RlwifSxcbiAge1wiYmFzZVwiOlwiQUFcIixcImxldHRlcnNcIjpcIlxcdUE3MzJcIn0sXG4gIHtcImJhc2VcIjpcIkFFXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMEM2XFx1MDFGQ1xcdTAxRTJcIn0sXG4gIHtcImJhc2VcIjpcIkFPXCIsXCJsZXR0ZXJzXCI6XCJcXHVBNzM0XCJ9LFxuICB7XCJiYXNlXCI6XCJBVVwiLFwibGV0dGVyc1wiOlwiXFx1QTczNlwifSxcbiAge1wiYmFzZVwiOlwiQVZcIixcImxldHRlcnNcIjpcIlxcdUE3MzhcXHVBNzNBXCJ9LFxuICB7XCJiYXNlXCI6XCJBWVwiLFwibGV0dGVyc1wiOlwiXFx1QTczQ1wifSxcbiAge1wiYmFzZVwiOlwiQlwiLCBcImxldHRlcnNcIjpcIlxcdTAwNDJcXHUyNEI3XFx1RkYyMlxcdTFFMDJcXHUxRTA0XFx1MUUwNlxcdTAyNDNcXHUwMTgyXFx1MDE4MVwifSxcbiAge1wiYmFzZVwiOlwiQ1wiLCBcImxldHRlcnNcIjpcIlxcdTAwNDNcXHUyNEI4XFx1RkYyM1xcdTAxMDZcXHUwMTA4XFx1MDEwQVxcdTAxMENcXHUwMEM3XFx1MUUwOFxcdTAxODdcXHUwMjNCXFx1QTczRVwifSxcbiAge1wiYmFzZVwiOlwiRFwiLCBcImxldHRlcnNcIjpcIlxcdTAwNDRcXHUyNEI5XFx1RkYyNFxcdTFFMEFcXHUwMTBFXFx1MUUwQ1xcdTFFMTBcXHUxRTEyXFx1MUUwRVxcdTAxMTBcXHUwMThCXFx1MDE4QVxcdTAxODlcXHVBNzc5XFx1MDBEMFwifSxcbiAge1wiYmFzZVwiOlwiRFpcIixcImxldHRlcnNcIjpcIlxcdTAxRjFcXHUwMUM0XCJ9LFxuICB7XCJiYXNlXCI6XCJEelwiLFwibGV0dGVyc1wiOlwiXFx1MDFGMlxcdTAxQzVcIn0sXG4gIHtcImJhc2VcIjpcIkVcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDQ1XFx1MjRCQVxcdUZGMjVcXHUwMEM4XFx1MDBDOVxcdTAwQ0FcXHUxRUMwXFx1MUVCRVxcdTFFQzRcXHUxRUMyXFx1MUVCQ1xcdTAxMTJcXHUxRTE0XFx1MUUxNlxcdTAxMTRcXHUwMTE2XFx1MDBDQlxcdTFFQkFcXHUwMTFBXFx1MDIwNFxcdTAyMDZcXHUxRUI4XFx1MUVDNlxcdTAyMjhcXHUxRTFDXFx1MDExOFxcdTFFMThcXHUxRTFBXFx1MDE5MFxcdTAxOEVcIn0sXG4gIHtcImJhc2VcIjpcIkZcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDQ2XFx1MjRCQlxcdUZGMjZcXHUxRTFFXFx1MDE5MVxcdUE3N0JcIn0sXG4gIHtcImJhc2VcIjpcIkdcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDQ3XFx1MjRCQ1xcdUZGMjdcXHUwMUY0XFx1MDExQ1xcdTFFMjBcXHUwMTFFXFx1MDEyMFxcdTAxRTZcXHUwMTIyXFx1MDFFNFxcdTAxOTNcXHVBN0EwXFx1QTc3RFxcdUE3N0VcIn0sXG4gIHtcImJhc2VcIjpcIkhcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDQ4XFx1MjRCRFxcdUZGMjhcXHUwMTI0XFx1MUUyMlxcdTFFMjZcXHUwMjFFXFx1MUUyNFxcdTFFMjhcXHUxRTJBXFx1MDEyNlxcdTJDNjdcXHUyQzc1XFx1QTc4RFwifSxcbiAge1wiYmFzZVwiOlwiSVwiLCBcImxldHRlcnNcIjpcIlxcdTAwNDlcXHUyNEJFXFx1RkYyOVxcdTAwQ0NcXHUwMENEXFx1MDBDRVxcdTAxMjhcXHUwMTJBXFx1MDEyQ1xcdTAxMzBcXHUwMENGXFx1MUUyRVxcdTFFQzhcXHUwMUNGXFx1MDIwOFxcdTAyMEFcXHUxRUNBXFx1MDEyRVxcdTFFMkNcXHUwMTk3XCJ9LFxuICB7XCJiYXNlXCI6XCJKXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA0QVxcdTI0QkZcXHVGRjJBXFx1MDEzNFxcdTAyNDhcIn0sXG4gIHtcImJhc2VcIjpcIktcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDRCXFx1MjRDMFxcdUZGMkJcXHUxRTMwXFx1MDFFOFxcdTFFMzJcXHUwMTM2XFx1MUUzNFxcdTAxOThcXHUyQzY5XFx1QTc0MFxcdUE3NDJcXHVBNzQ0XFx1QTdBMlwifSxcbiAge1wiYmFzZVwiOlwiTFwiLCBcImxldHRlcnNcIjpcIlxcdTAwNENcXHUyNEMxXFx1RkYyQ1xcdTAxM0ZcXHUwMTM5XFx1MDEzRFxcdTFFMzZcXHUxRTM4XFx1MDEzQlxcdTFFM0NcXHUxRTNBXFx1MDE0MVxcdTAyM0RcXHUyQzYyXFx1MkM2MFxcdUE3NDhcXHVBNzQ2XFx1QTc4MFwifSxcbiAge1wiYmFzZVwiOlwiTEpcIixcImxldHRlcnNcIjpcIlxcdTAxQzdcIn0sXG4gIHtcImJhc2VcIjpcIkxqXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMUM4XCJ9LFxuICB7XCJiYXNlXCI6XCJNXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA0RFxcdTI0QzJcXHVGRjJEXFx1MUUzRVxcdTFFNDBcXHUxRTQyXFx1MkM2RVxcdTAxOUNcIn0sXG4gIHtcImJhc2VcIjpcIk5cIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDRFXFx1MjRDM1xcdUZGMkVcXHUwMUY4XFx1MDE0M1xcdTAwRDFcXHUxRTQ0XFx1MDE0N1xcdTFFNDZcXHUwMTQ1XFx1MUU0QVxcdTFFNDhcXHUwMjIwXFx1MDE5RFxcdUE3OTBcXHVBN0E0XCJ9LFxuICB7XCJiYXNlXCI6XCJOSlwiLFwibGV0dGVyc1wiOlwiXFx1MDFDQVwifSxcbiAge1wiYmFzZVwiOlwiTmpcIixcImxldHRlcnNcIjpcIlxcdTAxQ0JcIn0sXG4gIHtcImJhc2VcIjpcIk9cIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDRGXFx1MjRDNFxcdUZGMkZcXHUwMEQyXFx1MDBEM1xcdTAwRDRcXHUxRUQyXFx1MUVEMFxcdTFFRDZcXHUxRUQ0XFx1MDBENVxcdTFFNENcXHUwMjJDXFx1MUU0RVxcdTAxNENcXHUxRTUwXFx1MUU1MlxcdTAxNEVcXHUwMjJFXFx1MDIzMFxcdTAwRDZcXHUwMjJBXFx1MUVDRVxcdTAxNTBcXHUwMUQxXFx1MDIwQ1xcdTAyMEVcXHUwMUEwXFx1MUVEQ1xcdTFFREFcXHUxRUUwXFx1MUVERVxcdTFFRTJcXHUxRUNDXFx1MUVEOFxcdTAxRUFcXHUwMUVDXFx1MDBEOFxcdTAxRkVcXHUwMTg2XFx1MDE5RlxcdUE3NEFcXHVBNzRDXCJ9LFxuICB7XCJiYXNlXCI6XCJPSVwiLFwibGV0dGVyc1wiOlwiXFx1MDFBMlwifSxcbiAge1wiYmFzZVwiOlwiT09cIixcImxldHRlcnNcIjpcIlxcdUE3NEVcIn0sXG4gIHtcImJhc2VcIjpcIk9VXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMjIyXCJ9LFxuICB7XCJiYXNlXCI6XCJPRVwiLFwibGV0dGVyc1wiOlwiXFx1MDA4Q1xcdTAxNTJcIn0sXG4gIHtcImJhc2VcIjpcIm9lXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMDlDXFx1MDE1M1wifSxcbiAge1wiYmFzZVwiOlwiUFwiLCBcImxldHRlcnNcIjpcIlxcdTAwNTBcXHUyNEM1XFx1RkYzMFxcdTFFNTRcXHUxRTU2XFx1MDFBNFxcdTJDNjNcXHVBNzUwXFx1QTc1MlxcdUE3NTRcIn0sXG4gIHtcImJhc2VcIjpcIlFcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDUxXFx1MjRDNlxcdUZGMzFcXHVBNzU2XFx1QTc1OFxcdTAyNEFcIn0sXG4gIHtcImJhc2VcIjpcIlJcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDUyXFx1MjRDN1xcdUZGMzJcXHUwMTU0XFx1MUU1OFxcdTAxNThcXHUwMjEwXFx1MDIxMlxcdTFFNUFcXHUxRTVDXFx1MDE1NlxcdTFFNUVcXHUwMjRDXFx1MkM2NFxcdUE3NUFcXHVBN0E2XFx1QTc4MlwifSxcbiAge1wiYmFzZVwiOlwiU1wiLCBcImxldHRlcnNcIjpcIlxcdTAwNTNcXHUyNEM4XFx1RkYzM1xcdTFFOUVcXHUwMTVBXFx1MUU2NFxcdTAxNUNcXHUxRTYwXFx1MDE2MFxcdTFFNjZcXHUxRTYyXFx1MUU2OFxcdTAyMThcXHUwMTVFXFx1MkM3RVxcdUE3QThcXHVBNzg0XCJ9LFxuICB7XCJiYXNlXCI6XCJUXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA1NFxcdTI0QzlcXHVGRjM0XFx1MUU2QVxcdTAxNjRcXHUxRTZDXFx1MDIxQVxcdTAxNjJcXHUxRTcwXFx1MUU2RVxcdTAxNjZcXHUwMUFDXFx1MDFBRVxcdTAyM0VcXHVBNzg2XCJ9LFxuICB7XCJiYXNlXCI6XCJUWlwiLFwibGV0dGVyc1wiOlwiXFx1QTcyOFwifSxcbiAge1wiYmFzZVwiOlwiVVwiLCBcImxldHRlcnNcIjpcIlxcdTAwNTVcXHUyNENBXFx1RkYzNVxcdTAwRDlcXHUwMERBXFx1MDBEQlxcdTAxNjhcXHUxRTc4XFx1MDE2QVxcdTFFN0FcXHUwMTZDXFx1MDBEQ1xcdTAxREJcXHUwMUQ3XFx1MDFENVxcdTAxRDlcXHUxRUU2XFx1MDE2RVxcdTAxNzBcXHUwMUQzXFx1MDIxNFxcdTAyMTZcXHUwMUFGXFx1MUVFQVxcdTFFRThcXHUxRUVFXFx1MUVFQ1xcdTFFRjBcXHUxRUU0XFx1MUU3MlxcdTAxNzJcXHUxRTc2XFx1MUU3NFxcdTAyNDRcIn0sXG4gIHtcImJhc2VcIjpcIlZcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDU2XFx1MjRDQlxcdUZGMzZcXHUxRTdDXFx1MUU3RVxcdTAxQjJcXHVBNzVFXFx1MDI0NVwifSxcbiAge1wiYmFzZVwiOlwiVllcIixcImxldHRlcnNcIjpcIlxcdUE3NjBcIn0sXG4gIHtcImJhc2VcIjpcIldcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDU3XFx1MjRDQ1xcdUZGMzdcXHUxRTgwXFx1MUU4MlxcdTAxNzRcXHUxRTg2XFx1MUU4NFxcdTFFODhcXHUyQzcyXCJ9LFxuICB7XCJiYXNlXCI6XCJYXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA1OFxcdTI0Q0RcXHVGRjM4XFx1MUU4QVxcdTFFOENcIn0sXG4gIHtcImJhc2VcIjpcIllcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDU5XFx1MjRDRVxcdUZGMzlcXHUxRUYyXFx1MDBERFxcdTAxNzZcXHUxRUY4XFx1MDIzMlxcdTFFOEVcXHUwMTc4XFx1MUVGNlxcdTFFRjRcXHUwMUIzXFx1MDI0RVxcdTFFRkVcIn0sXG4gIHtcImJhc2VcIjpcIlpcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDVBXFx1MjRDRlxcdUZGM0FcXHUwMTc5XFx1MUU5MFxcdTAxN0JcXHUwMTdEXFx1MUU5MlxcdTFFOTRcXHUwMUI1XFx1MDIyNFxcdTJDN0ZcXHUyQzZCXFx1QTc2MlwifSxcbiAge1wiYmFzZVwiOlwiYVwiLCBcImxldHRlcnNcIjpcIlxcdTAwNjFcXHUyNEQwXFx1RkY0MVxcdTFFOUFcXHUwMEUwXFx1MDBFMVxcdTAwRTJcXHUxRUE3XFx1MUVBNVxcdTFFQUJcXHUxRUE5XFx1MDBFM1xcdTAxMDFcXHUwMTAzXFx1MUVCMVxcdTFFQUZcXHUxRUI1XFx1MUVCM1xcdTAyMjdcXHUwMUUxXFx1MDBFNFxcdTAxREZcXHUxRUEzXFx1MDBFNVxcdTAxRkJcXHUwMUNFXFx1MDIwMVxcdTAyMDNcXHUxRUExXFx1MUVBRFxcdTFFQjdcXHUxRTAxXFx1MDEwNVxcdTJDNjVcXHUwMjUwXCJ9LFxuICB7XCJiYXNlXCI6XCJhYVwiLFwibGV0dGVyc1wiOlwiXFx1QTczM1wifSxcbiAge1wiYmFzZVwiOlwiYWVcIixcImxldHRlcnNcIjpcIlxcdTAwRTZcXHUwMUZEXFx1MDFFM1wifSxcbiAge1wiYmFzZVwiOlwiYW9cIixcImxldHRlcnNcIjpcIlxcdUE3MzVcIn0sXG4gIHtcImJhc2VcIjpcImF1XCIsXCJsZXR0ZXJzXCI6XCJcXHVBNzM3XCJ9LFxuICB7XCJiYXNlXCI6XCJhdlwiLFwibGV0dGVyc1wiOlwiXFx1QTczOVxcdUE3M0JcIn0sXG4gIHtcImJhc2VcIjpcImF5XCIsXCJsZXR0ZXJzXCI6XCJcXHVBNzNEXCJ9LFxuICB7XCJiYXNlXCI6XCJiXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2MlxcdTI0RDFcXHVGRjQyXFx1MUUwM1xcdTFFMDVcXHUxRTA3XFx1MDE4MFxcdTAxODNcXHUwMjUzXCJ9LFxuICB7XCJiYXNlXCI6XCJjXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2M1xcdTI0RDJcXHVGRjQzXFx1MDEwN1xcdTAxMDlcXHUwMTBCXFx1MDEwRFxcdTAwRTdcXHUxRTA5XFx1MDE4OFxcdTAyM0NcXHVBNzNGXFx1MjE4NFwifSxcbiAge1wiYmFzZVwiOlwiZFwiLCBcImxldHRlcnNcIjpcIlxcdTAwNjRcXHUyNEQzXFx1RkY0NFxcdTFFMEJcXHUwMTBGXFx1MUUwRFxcdTFFMTFcXHUxRTEzXFx1MUUwRlxcdTAxMTFcXHUwMThDXFx1MDI1NlxcdTAyNTdcXHVBNzdBXCJ9LFxuICB7XCJiYXNlXCI6XCJkelwiLFwibGV0dGVyc1wiOlwiXFx1MDFGM1xcdTAxQzZcIn0sXG4gIHtcImJhc2VcIjpcImVcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDY1XFx1MjRENFxcdUZGNDVcXHUwMEU4XFx1MDBFOVxcdTAwRUFcXHUxRUMxXFx1MUVCRlxcdTFFQzVcXHUxRUMzXFx1MUVCRFxcdTAxMTNcXHUxRTE1XFx1MUUxN1xcdTAxMTVcXHUwMTE3XFx1MDBFQlxcdTFFQkJcXHUwMTFCXFx1MDIwNVxcdTAyMDdcXHUxRUI5XFx1MUVDN1xcdTAyMjlcXHUxRTFEXFx1MDExOVxcdTFFMTlcXHUxRTFCXFx1MDI0N1xcdTAyNUJcXHUwMUREXCJ9LFxuICB7XCJiYXNlXCI6XCJmXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2NlxcdTI0RDVcXHVGRjQ2XFx1MUUxRlxcdTAxOTJcXHVBNzdDXCJ9LFxuICB7XCJiYXNlXCI6XCJnXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2N1xcdTI0RDZcXHVGRjQ3XFx1MDFGNVxcdTAxMURcXHUxRTIxXFx1MDExRlxcdTAxMjFcXHUwMUU3XFx1MDEyM1xcdTAxRTVcXHUwMjYwXFx1QTdBMVxcdTFENzlcXHVBNzdGXCJ9LFxuICB7XCJiYXNlXCI6XCJoXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2OFxcdTI0RDdcXHVGRjQ4XFx1MDEyNVxcdTFFMjNcXHUxRTI3XFx1MDIxRlxcdTFFMjVcXHUxRTI5XFx1MUUyQlxcdTFFOTZcXHUwMTI3XFx1MkM2OFxcdTJDNzZcXHUwMjY1XCJ9LFxuICB7XCJiYXNlXCI6XCJodlwiLFwibGV0dGVyc1wiOlwiXFx1MDE5NVwifSxcbiAge1wiYmFzZVwiOlwiaVwiLCBcImxldHRlcnNcIjpcIlxcdTAwNjlcXHUyNEQ4XFx1RkY0OVxcdTAwRUNcXHUwMEVEXFx1MDBFRVxcdTAxMjlcXHUwMTJCXFx1MDEyRFxcdTAwRUZcXHUxRTJGXFx1MUVDOVxcdTAxRDBcXHUwMjA5XFx1MDIwQlxcdTFFQ0JcXHUwMTJGXFx1MUUyRFxcdTAyNjhcXHUwMTMxXCJ9LFxuICB7XCJiYXNlXCI6XCJqXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2QVxcdTI0RDlcXHVGRjRBXFx1MDEzNVxcdTAxRjBcXHUwMjQ5XCJ9LFxuICB7XCJiYXNlXCI6XCJrXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2QlxcdTI0REFcXHVGRjRCXFx1MUUzMVxcdTAxRTlcXHUxRTMzXFx1MDEzN1xcdTFFMzVcXHUwMTk5XFx1MkM2QVxcdUE3NDFcXHVBNzQzXFx1QTc0NVxcdUE3QTNcIn0sXG4gIHtcImJhc2VcIjpcImxcIiwgXCJsZXR0ZXJzXCI6XCJcXHUwMDZDXFx1MjREQlxcdUZGNENcXHUwMTQwXFx1MDEzQVxcdTAxM0VcXHUxRTM3XFx1MUUzOVxcdTAxM0NcXHUxRTNEXFx1MUUzQlxcdTAxN0ZcXHUwMTQyXFx1MDE5QVxcdTAyNkJcXHUyQzYxXFx1QTc0OVxcdUE3ODFcXHVBNzQ3XCJ9LFxuICB7XCJiYXNlXCI6XCJsalwiLFwibGV0dGVyc1wiOlwiXFx1MDFDOVwifSxcbiAge1wiYmFzZVwiOlwibVwiLCBcImxldHRlcnNcIjpcIlxcdTAwNkRcXHUyNERDXFx1RkY0RFxcdTFFM0ZcXHUxRTQxXFx1MUU0M1xcdTAyNzFcXHUwMjZGXCJ9LFxuICB7XCJiYXNlXCI6XCJuXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2RVxcdTI0RERcXHVGRjRFXFx1MDFGOVxcdTAxNDRcXHUwMEYxXFx1MUU0NVxcdTAxNDhcXHUxRTQ3XFx1MDE0NlxcdTFFNEJcXHUxRTQ5XFx1MDE5RVxcdTAyNzJcXHUwMTQ5XFx1QTc5MVxcdUE3QTVcIn0sXG4gIHtcImJhc2VcIjpcIm5qXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMUNDXCJ9LFxuICB7XCJiYXNlXCI6XCJvXCIsIFwibGV0dGVyc1wiOlwiXFx1MDA2RlxcdTI0REVcXHVGRjRGXFx1MDBGMlxcdTAwRjNcXHUwMEY0XFx1MUVEM1xcdTFFRDFcXHUxRUQ3XFx1MUVENVxcdTAwRjVcXHUxRTREXFx1MDIyRFxcdTFFNEZcXHUwMTREXFx1MUU1MVxcdTFFNTNcXHUwMTRGXFx1MDIyRlxcdTAyMzFcXHUwMEY2XFx1MDIyQlxcdTFFQ0ZcXHUwMTUxXFx1MDFEMlxcdTAyMERcXHUwMjBGXFx1MDFBMVxcdTFFRERcXHUxRURCXFx1MUVFMVxcdTFFREZcXHUxRUUzXFx1MUVDRFxcdTFFRDlcXHUwMUVCXFx1MDFFRFxcdTAwRjhcXHUwMUZGXFx1MDI1NFxcdUE3NEJcXHVBNzREXFx1MDI3NVwifSxcbiAge1wiYmFzZVwiOlwib2lcIixcImxldHRlcnNcIjpcIlxcdTAxQTNcIn0sXG4gIHtcImJhc2VcIjpcIm91XCIsXCJsZXR0ZXJzXCI6XCJcXHUwMjIzXCJ9LFxuICB7XCJiYXNlXCI6XCJvb1wiLFwibGV0dGVyc1wiOlwiXFx1QTc0RlwifSxcbiAge1wiYmFzZVwiOlwicFwiLFwibGV0dGVyc1wiOlwiXFx1MDA3MFxcdTI0REZcXHVGRjUwXFx1MUU1NVxcdTFFNTdcXHUwMUE1XFx1MUQ3RFxcdUE3NTFcXHVBNzUzXFx1QTc1NVwifSxcbiAge1wiYmFzZVwiOlwicVwiLFwibGV0dGVyc1wiOlwiXFx1MDA3MVxcdTI0RTBcXHVGRjUxXFx1MDI0QlxcdUE3NTdcXHVBNzU5XCJ9LFxuICB7XCJiYXNlXCI6XCJyXCIsXCJsZXR0ZXJzXCI6XCJcXHUwMDcyXFx1MjRFMVxcdUZGNTJcXHUwMTU1XFx1MUU1OVxcdTAxNTlcXHUwMjExXFx1MDIxM1xcdTFFNUJcXHUxRTVEXFx1MDE1N1xcdTFFNUZcXHUwMjREXFx1MDI3RFxcdUE3NUJcXHVBN0E3XFx1QTc4M1wifSxcbiAge1wiYmFzZVwiOlwic1wiLFwibGV0dGVyc1wiOlwiXFx1MDA3M1xcdTI0RTJcXHVGRjUzXFx1MDBERlxcdTAxNUJcXHUxRTY1XFx1MDE1RFxcdTFFNjFcXHUwMTYxXFx1MUU2N1xcdTFFNjNcXHUxRTY5XFx1MDIxOVxcdTAxNUZcXHUwMjNGXFx1QTdBOVxcdUE3ODVcXHUxRTlCXCJ9LFxuICB7XCJiYXNlXCI6XCJ0XCIsXCJsZXR0ZXJzXCI6XCJcXHUwMDc0XFx1MjRFM1xcdUZGNTRcXHUxRTZCXFx1MUU5N1xcdTAxNjVcXHUxRTZEXFx1MDIxQlxcdTAxNjNcXHUxRTcxXFx1MUU2RlxcdTAxNjdcXHUwMUFEXFx1MDI4OFxcdTJDNjZcXHVBNzg3XCJ9LFxuICB7XCJiYXNlXCI6XCJ0elwiLFwibGV0dGVyc1wiOlwiXFx1QTcyOVwifSxcbiAge1wiYmFzZVwiOlwidVwiLFwibGV0dGVyc1wiOiBcIlxcdTAwNzVcXHUyNEU0XFx1RkY1NVxcdTAwRjlcXHUwMEZBXFx1MDBGQlxcdTAxNjlcXHUxRTc5XFx1MDE2QlxcdTFFN0JcXHUwMTZEXFx1MDBGQ1xcdTAxRENcXHUwMUQ4XFx1MDFENlxcdTAxREFcXHUxRUU3XFx1MDE2RlxcdTAxNzFcXHUwMUQ0XFx1MDIxNVxcdTAyMTdcXHUwMUIwXFx1MUVFQlxcdTFFRTlcXHUxRUVGXFx1MUVFRFxcdTFFRjFcXHUxRUU1XFx1MUU3M1xcdTAxNzNcXHUxRTc3XFx1MUU3NVxcdTAyODlcIn0sXG4gIHtcImJhc2VcIjpcInZcIixcImxldHRlcnNcIjpcIlxcdTAwNzZcXHUyNEU1XFx1RkY1NlxcdTFFN0RcXHUxRTdGXFx1MDI4QlxcdUE3NUZcXHUwMjhDXCJ9LFxuICB7XCJiYXNlXCI6XCJ2eVwiLFwibGV0dGVyc1wiOlwiXFx1QTc2MVwifSxcbiAge1wiYmFzZVwiOlwid1wiLFwibGV0dGVyc1wiOlwiXFx1MDA3N1xcdTI0RTZcXHVGRjU3XFx1MUU4MVxcdTFFODNcXHUwMTc1XFx1MUU4N1xcdTFFODVcXHUxRTk4XFx1MUU4OVxcdTJDNzNcIn0sXG4gIHtcImJhc2VcIjpcInhcIixcImxldHRlcnNcIjpcIlxcdTAwNzhcXHUyNEU3XFx1RkY1OFxcdTFFOEJcXHUxRThEXCJ9LFxuICB7XCJiYXNlXCI6XCJ5XCIsXCJsZXR0ZXJzXCI6XCJcXHUwMDc5XFx1MjRFOFxcdUZGNTlcXHUxRUYzXFx1MDBGRFxcdTAxNzdcXHUxRUY5XFx1MDIzM1xcdTFFOEZcXHUwMEZGXFx1MUVGN1xcdTFFOTlcXHUxRUY1XFx1MDFCNFxcdTAyNEZcXHUxRUZGXCJ9LFxuICB7XCJiYXNlXCI6XCJ6XCIsXCJsZXR0ZXJzXCI6XCJcXHUwMDdBXFx1MjRFOVxcdUZGNUFcXHUwMTdBXFx1MUU5MVxcdTAxN0NcXHUwMTdFXFx1MUU5M1xcdTFFOTVcXHUwMUI2XFx1MDIyNVxcdTAyNDBcXHUyQzZDXFx1QTc2M1wifVxuXTtcblxudmFyIGRpYWNyaXRpY3NNYXAgPSB7fTtcbmZvciAodmFyIGkgPSAwOyBpIDwgZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwLmxlbmd0aDsgaSsrKSB7XG4gIHZhciBsZXR0ZXJzID0gZGVmYXVsdERpYWNyaXRpY3NSZW1vdmFsTWFwW2ldLmxldHRlcnM7XG4gIGZvciAodmFyIGogPSAwOyBqIDwgbGV0dGVycy5sZW5ndGg7IGorKykge1xuICAgIGRpYWNyaXRpY3NNYXBbbGV0dGVyc1tqXV0gPSBkZWZhdWx0RGlhY3JpdGljc1JlbW92YWxNYXBbaV0uYmFzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEaWFjcml0aWNzIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXlxcdTAwMDAtXFx1MDA3RV0vZywgZnVuY3Rpb24oYSl7IFxuICAgIHJldHVybiBkaWFjcml0aWNzTWFwW2FdIHx8IGE7IFxuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcmVtb3ZlRGlhY3JpdGljcyIsIi8qKlxuICogVmFuaWxsYSBBSkFYIGhlbHBlciB1c2luZyBQcm9taXNlLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIlxuaW1wb3J0IGpzb24gZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9qc29uXCJcblxuY29uc3QgRk9STV9EQVRBID0gXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIlxuY29uc3QgSlNPTl9NSU1FID0gXCJhcHBsaWNhdGlvbi9qc29uXCJcbmNvbnN0IENPTlRFTlRfVFlQRSA9IFwiQ29udGVudC1UeXBlXCJcblxudmFyIGRlZmF1bHRzID0ge1xuICB0eXBlOiBcIlBPU1RcIixcbiAgaGVhZGVyczoge1xuICAgIFwiWC1SZXF1ZXN0ZWQtV2l0aFwiOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgXCJDb250ZW50LVR5cGVcIjogSlNPTl9NSU1FIC8vIGRlbGV0ZWQgZm9yIEdFVCByZXF1ZXN0cywgYXMgdmFsdWVzIGFyZSBwbGFjZWQgaW4gcXVlcnkgc3RyaW5nXG4gIH0sXG4gIGpzb246IHtcbiAgICBwYXJzZURhdGVzOiB0cnVlXG4gIH1cbn07XG5cbmZ1bmN0aW9uIHNhbml0aXplQ29udGVudFR5cGUoY29udGVudFR5cGUpIHtcbiAgLy8ganVzdCB0byBiZSBzdXJlLi4uIHNpbmNlIGluIG1hbnkgY2FzZXMgc3RhbmRhcmQgSlNPTiBtaW1lIHR5cGUgaXMgbm90IHVzZWRcbiAgaWYgKGNvbnRlbnRUeXBlLmluZGV4T2YoXCJqc29uXCIpID4gLTEgJiYgY29udGVudFR5cGUgIT0gSlNPTl9NSU1FKSB7XG4gICAgcmV0dXJuIEpTT05fTUlNRTtcbiAgfVxuICByZXR1cm4gY29udGVudFR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBkZWZhdWx0czogZGVmYXVsdHMsXG5cbiAgLyoqXG4gICAqIEV4dGVuc2liaWxpdHkgcG9pbnQuXG4gICAqIEFsbG93cyB0byBkZWZpbmUgZ2xvYmFsIGxvZ2ljIGJlZm9yZSBzZW5kaW5nIGFueSByZXF1ZXN0LlxuICAgKi9cbiAgcmVxdWVzdEJlZm9yZVNlbmQoeGhyLCBvcHRpb25zLCBvcmlnaW5hbE9wdGlvbnMpIHsgfSxcblxuICAvKipcbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICogQWxsb3dzIHRvIG92ZXJyaWRlIGdsb2JhbCBkZWZhdWx0cyBmb3IgQUpBWCByZXF1ZXN0cy5cbiAgICovXG4gIHNldHVwKG8pIHtcbiAgICBpZiAoIV8uaXNQbGFpbk9iamVjdChvKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9ucyBmb3IgQUpBWCBzZXR1cC5cIik7XG4gICAgXy5leHRlbmQodGhpcy5kZWZhdWx0cywgbyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgY29udmVydGVyczoge1xuICAgIFwiYXBwbGljYXRpb24vanNvblwiOiBmdW5jdGlvbiAocmVzcG9uc2UsIHJlcSwgb3B0aW9ucykge1xuICAgICAgcmV0dXJuIGpzb24ucGFyc2UocmVzcG9uc2UsIG9wdGlvbnMuanNvbik7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcXVlcnkgc3RyaW5nXG4gICAqIFxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YTogZGF0YSB0byByZXByZXNlbnQgaW4gcXVlcnkgc3RyaW5nLlxuICAgKi9cbiAgY3JlYXRlUXMoZGF0YSkge1xuICAgIGlmICghZGF0YSkgcmV0dXJuIFwiXCI7XG5cbiAgICB2YXIgeCwgcXMgPSBbXSwgdjtcbiAgICBmb3IgKHggaW4gZGF0YSkge1xuICAgICAgdiA9IGRhdGFbeF07XG4gICAgICBpZiAoIV8uaXNOdWxsT3JFbXB0eVN0cmluZyh2KSkge1xuICAgICAgICBxcy5wdXNoKFt4LCB2XSk7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHNvcnQgYnkgbmFtZVxuICAgIHFzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIGlmIChhID4gYikgcmV0dXJuIDE7XG4gICAgICBpZiAoYSA8IGIpIHJldHVybiAtMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIC8vIHJldHVybiBtYXBwZWQgc3RyaW5nXG4gICAgcmV0dXJuIF8ubWFwKHFzLCBvID0+IHtcbiAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQob1swXSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvWzFdKVxuICAgIH0pLmpvaW4oXCImXCIpO1xuICB9LFxuXG4gIHNob3Qob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgIHZhciBleHRyYUhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnM7XG4gICAgfVxuICAgIHZhciBvID0gXy5leHRlbmQoe30sIF8uY2xvbmUodGhpcy5kZWZhdWx0cyksIG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgIC8vIGtlZXAgZGVmYXVsdCBoZWFkZXJzLCBldmVuIGlmIHRoZSB1c2VyIGlzIGFkZGluZyBtb3JlXG4gICAgICBvLmhlYWRlcnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5kZWZhdWx0cy5oZWFkZXJzLCBvcHRpb25zLmhlYWRlcnMpO1xuICAgIH1cbiAgICB2YXIgdXJsID0gby51cmw7XG4gICAgaWYgKCF1cmwpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtaXNzaW5nIGB1cmxgIGZvciBYTUxIdHRwUmVxdWVzdFwiKTtcblxuICAgIHZhciBzZWxmID0gdGhpcywgY29udmVydGVycyA9IHNlbGYuY29udmVydGVycztcblxuICAgIHZhciBtZXRob2QgPSBvLnR5cGU7XG4gICAgaWYgKCFtZXRob2QpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJtaXNzaW5nIGB0eXBlYCBmb3IgWE1MSHR0cFJlcXVlc3RcIik7XG4gICAgXG4gICAgLy8gaWYgdGhlIHJlcXVlc3QgaWYgb2YgR0VUIG1ldGhvZCBhbmQgdGhlcmUgaXMgZGF0YSB0byBzZW5kLFxuICAgIC8vIGNvbnZlcnQgYXV0b21hdGljYWxseSBkYXRhIHRvIHF1ZXJ5IHN0cmluZyBhbmQgYXBwZW5kIGl0IHRvIHVybFxuICAgIHZhciBpc0dldCA9IG1ldGhvZCA9PSBcIkdFVFwiLCBpbnB1dERhdGEgPSBvLmRhdGE7XG4gICAgaWYgKGlzR2V0ICYmIGlucHV0RGF0YSkge1xuICAgICAgdmFyIHFzID0gdGhpcy5jcmVhdGVRcyhpbnB1dERhdGEpO1xuICAgICAgdmFyIGhhc1F1ZXJ5U3RyaW5nID0gdXJsLmluZGV4T2YoXCI/XCIpICE9IC0xO1xuICAgICAgdXJsICs9ICgoaGFzUXVlcnlTdHJpbmcgPyBcIiZcIiA6IFwiP1wiKSArIHFzKTtcbiAgICAgIGRlbGV0ZSBvLmhlYWRlcnNbQ09OVEVOVF9UWVBFXTsgLy8gc2luY2UgZGF0YSBpcyBwbGFjZWQgaW4gcXVlcnkgc3RyaW5nXG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGEgbmV3IHByb21pc2UuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgLy8gRG8gdGhlIHVzdWFsIFhIUiBzdHVmZlxuICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgcmVxLm9wZW4obWV0aG9kLCB1cmwpO1xuXG4gICAgICB2YXIgaGVhZGVycyA9IG8uaGVhZGVycztcbiAgICAgIGlmIChoZWFkZXJzKSB7XG4gICAgICAgIHZhciB4O1xuICAgICAgICBmb3IgKHggaW4gaGVhZGVycykge1xuICAgICAgICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKHgsIGhlYWRlcnNbeF0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVGhpcyBpcyBjYWxsZWQgZXZlbiBvbiA0MDQgZXRjXG4gICAgICAgIC8vIHNvIGNoZWNrIHRoZSBzdGF0dXNcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIHRoZSByZXNwb25zZSB0ZXh0XG4gICAgICAgICAgLy8gcGFyc2UgYXV0b21hdGljYWxseSB0aGUgcmVzcG9uc2VcbiAgICAgICAgICB2YXIgZGF0YSA9IHJlcS5yZXNwb25zZTtcblxuICAgICAgICAgIC8vIE5COiBpZiB0aGUgc2VydmVyIGRvZXMgbm90IHJldHVybiBhIGNvbnRlbnQtdHlwZSBoZWFkZXIsIHRoaXMgZnVuY3Rpb24gZG9lcyBubyBjb252ZXJzaW9uXG4gICAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBpcyBrZXB0IGludGVudGlvbmFsbHkgc2ltcGxlIGFuZCBkb2VzIG5vdCBkbyBjb250ZW50LXR5cGUgc25pZmZpbmcgd2hhdHNvZXZlclxuICAgICAgICAgIHZhciBjb250ZW50VHlwZSA9IHNhbml0aXplQ29udGVudFR5cGUocmVxLmdldFJlc3BvbnNlSGVhZGVyKENPTlRFTlRfVFlQRSkgfHwgXCJcIik7XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGNvbnZlcnRlciA9IGNvbnZlcnRlcnNbY29udGVudFR5cGVdO1xuICAgICAgICAgIGlmIChfLmlzRnVuY3Rpb24oY29udmVydGVyKSkge1xuICAgICAgICAgICAgZGF0YSA9IGNvbnZlcnRlcihkYXRhLCByZXEsIG8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKGRhdGEsIHJlcS5zdGF0dXMsIHJlcSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHJlamVjdCB3aXRoIHRoZSBzdGF0dXMgdGV4dFxuICAgICAgICAgIC8vIHdoaWNoIHdpbGwgaG9wZWZ1bGx5IGJlIGEgbWVhbmluZ2Z1bCBlcnJvclxuICAgICAgICAgIHJlamVjdChFcnJvcihyZXEuc3RhdHVzVGV4dCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyBIYW5kbGUgbmV0d29yayBlcnJvcnNcbiAgICAgIHJlcS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZXEsIG51bGwsIEVycm9yKFwiTmV0d29yayBFcnJvclwiKSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgZGF0YSA9IG8uZGF0YTtcbiAgICAgIGlmIChkYXRhICYmICghaXNHZXQpKSB7XG4gICAgICAgIHZhciBjb250ZW50VHlwZSA9IG8uaGVhZGVyc1tDT05URU5UX1RZUEVdO1xuICAgICAgICAvLyBkb2VzIGRhdGEgcmVxdWlyZSB0byBiZSBzZXJpYWxpemVkIGluIEpTT04/XG4gICAgICAgIGlmIChjb250ZW50VHlwZS5pbmRleE9mKFwiL2pzb25cIikgPiAtMSkge1xuICAgICAgICAgIGRhdGEgPSBqc29uLmNvbXBvc2UoZGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGVudFR5cGUgPT0gRk9STV9EQVRBKSB7XG4gICAgICAgICAgLy8gVE9ETzogc3VwcG9ydCB4LXd3dy1mb3JtLXVybGVuY29kZWQgUE9TVCBkYXRhXG4gICAgICAgICAgdGhyb3cgXCJOb3QgaW1wbGVtZW50ZWRcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBcImludmFsaWQgb3Igbm90IGltcGxlbWVudGVkIGNvbnRlbnQgdHlwZTogXCIgKyBjb250ZW50VHlwZTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLnJlcXVlc3RCZWZvcmVTZW5kKHJlcSwgbywgb3B0aW9ucyk7XG4gICAgICAgIHJlcS5zZW5kKGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTWFrZSB0aGUgcmVxdWVzdFxuICAgICAgICBzZWxmLnJlcXVlc3RCZWZvcmVTZW5kKHJlcSwgbywgb3B0aW9ucyk7XG4gICAgICAgIHJlcS5zZW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0KHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMudXJsID0gdXJsO1xuICAgIG9wdGlvbnMudHlwZSA9IFwiR0VUXCI7XG4gICAgcmV0dXJuIHRoaXMuc2hvdChvcHRpb25zKTtcbiAgfSxcblxuICBwb3N0KHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMudXJsID0gdXJsO1xuICAgIG9wdGlvbnMudHlwZSA9IFwiUE9TVFwiO1xuICAgIHJldHVybiB0aGlzLnNob3Qob3B0aW9ucyk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ3N2IGZvcm1hdCBmdW5jdGlvbnMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5cbnZhciBUeXBlSGFuZGxpbmcgPSB7XG4gIGFsbFN0cmluZ3M6IDEsIC8vIGFsbCB2YWx1ZXMgYXJlIHRyZWF0ZWQgYXMgYWxsU3RyaW5nc1xuICBrZWVwVHlwZTogMiAgICAvLyB0eXBlcyBhcmUga2VwdFxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRlZmF1bHQ6IHtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRvIGFkZCBCT01cbiAgICAgKi9cbiAgICBhZGRCb206IHRydWUsXG4gICAgLyoqXG4gICAgICogU2VwYXJhdG9yIHRvIHVzZVxuICAgICAqL1xuICAgIHNlcGFyYXRvcjogXCIsXCIsXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0byBhZGQgYSBzZXBhcmF0b3IgbGluZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLCBvciBub3QuXG4gICAgICogKE1heSBiZSB1c2VmdWwgZm9yIGV4Y2VsKVxuICAgICAqL1xuICAgIGFkZFNlcGFyYXRvckxpbmU6IGZhbHNlLFxuICAgIC8qKlxuICAgICAqIEhvdyB0aGUgdHlwZXMgc2hvdWxkIGJlIGhhbmRsZWQ6IGFsbFN0cmluZ3MgdG8gbWFuYWdlIGFsbCBwcm9wZXJ0aWVzIGFzIHN0cmluZ3MgKGFsbCB3aWxsIGJlIHF1b3RlZClcbiAgICAgKi9cbiAgICB0eXBlSGFuZGxpbmc6IFR5cGVIYW5kbGluZy5rZWVwVHlwZVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXJpYWxpemVzIHRoZSBnaXZlbiBjb2xsZWN0aW9uIGluIGNzdiBmb3JtYXQuXG4gICAqIEFzc3VtZXMgdGhhdCB0aGUgY29sbGVjdGlvbiBpcyBvcHRpbWl6ZWQgKHRoZSBmaXJzdCByb3cgY29udGFpbnMgcHJvcGVydGllcywgdGhlIG90aGVyIG9ubHkgdmFsdWVzKVxuICAgKiBcbiAgICogQHBhcmFtIGRhdGEgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgKi9cbiAgc2VyaWFsaXplKGRhdGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgbyA9IF8uZXh0ZW5kKHt9LCB0aGlzLmRlZmF1bHQsIG9wdGlvbnMpO1xuXG4gICAgdmFyIHJlID0gW10sXG4gICAgICBwdXNoID0gXCJwdXNoXCIsXG4gICAgICB0b1N0cmluZyA9IFwidG9TdHJpbmdcIixcbiAgICAgIGxlbiA9IFwibGVuZ3RoXCIsXG4gICAgICByZXAgPSBcInJlcGxhY2VcIixcbiAgICAgIHRlc3QgPSBcInRlc3RcIixcbiAgICAgIHNlcCA9IG8uc2VwYXJhdG9yLFxuICAgICAgZG9icXVvdGUgPSBcIlxcXCJcIixcbiAgICAgIHR5cGVIYW5kbGluZyA9IG8udHlwZUhhbmRsaW5nLFxuICAgICAgbWFyayA9IG8uYWRkQm9tID8gXCJcXHVGRUZGXCIgOiBcIlwiO1xuICAgIC8vaWYgKG8uYWRkU2VwYXJhdG9yTGluZSkge1xuICAgIC8vICByZVtwdXNoXShcInNlcD1cIiArIHNlcCk7XG4gICAgLy99XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhW2xlbl07IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhID0gW10sIHJvdyA9IGRhdGFbaV07XG4gICAgICAvL2Fzc3VtZSB0aGF0IHRoZSBmaXJzdCByb3cgY29udGFpbnMgdGhlIGNvbHVtbnNcbiAgICAgIGZvciAodmFyIGsgPSAwLCBqID0gcm93W2xlbl07IGsgPCBqOyBrKyspIHtcbiAgICAgICAgdmFyIHYgPSByb3dba107XG4gICAgICAgIGlmICh2IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICAgIC8vIFRPRE86IHVzZSBkYXRlIHV0aWxpdGllcy5cbiAgICAgICAgICAvLyBpZiB0aGUgdmFsdWUgaGFzIHRpbWUsIGluY2x1ZGUgdGltZTsgb3RoZXJ3aXNlIHVzZSBvbmx5IGRhdGVcbiAgICAgICAgICB2ID0gdi50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0eXBlb2YgdiAhPSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB2ID0gdiAmJiB2W3RvU3RyaW5nXSA/IHZbdG9TdHJpbmddKCkgOiBcIlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL2VzY2FwZSBxdW90ZXMgLSBSRkMtNDE4MCwgcGFyYWdyYXBoIFwiSWYgZG91YmxlLXF1b3RlcyBhcmUgdXNlZCB0byBlbmNsb3NlIGZpZWxkcywgdGhlbiBhIGRvdWJsZS1xdW90ZVxuICAgICAgICAvL2FwcGVhcmluZyBpbnNpZGUgYSBmaWVsZCBtdXN0IGJlIGVzY2FwZWQgYnkgcHJlY2VkaW5nIGl0IHdpdGggYW5vdGhlciBkb3VibGUgcXVvdGUuXCJcbiAgICAgICAgaWYgKC9cIi9bdGVzdF0odikpXG4gICAgICAgICAgdiA9IHZbcmVwXSgvXCIvZywgXCJcXFwiXFxcIlwiKTtcbiAgICAgICAgLy9odHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db21tYS1zZXBhcmF0ZWRfdmFsdWVzXG4gICAgICAgIC8vRmllbGRzIHdpdGggZW1iZWRkZWQgY29tbWFzIG9yIGRvdWJsZS1xdW90ZSBjaGFyYWN0ZXJzIG11c3QgYmUgcXVvdGVkLiAoYnkgc3RhbmRhcmQsIHNvIGV2ZW4gaWYgQ3N2VHlwZUhhbmRsaW5nIGlzIGRpZmZlcmVudCB0aGFuIFwiQWxsU3RyaW5nc1wiKVxuICAgICAgICAvLzE5OTcsIEZvcmQsIEUzNTAsIFwiU3VwZXIsIFwiXCJsdXh1cmlvdXNcIlwiIHRydWNrXCJcbiAgICAgICAgLy8xOTk3LCBGb3JkLCBFMzUwLCBcIlN1cGVyLCBsdXh1cmlvdXMgdHJ1Y2tcIlxuICAgICAgICBpZiAodHlwZUhhbmRsaW5nID09IFR5cGVIYW5kbGluZy5hbGxTdHJpbmdzIHx8IC9cInxcXG4vW3Rlc3RdKHYpIHx8IHYuaW5kZXhPZihzZXApID4gLTEpXG4gICAgICAgICAgdiA9IGRvYnF1b3RlICsgdiArIGRvYnF1b3RlO1xuICAgICAgICBhW3B1c2hdKHYpO1xuICAgICAgfVxuICAgICAgcmVbcHVzaF0oYS5qb2luKHNlcCkpO1xuICAgIH1cbiAgICAvLyB0aGUgb25seSB3YXkgdG8gbWFrZSBNUyBFeGNlbCB3b3JrIHdpdGggVVRGLTggYW5kIHNwZWNpZmljIHNlcGFyYXRvcixcbiAgICAvLyBpcyB0byBwdXQgYXQgdGhlIGVuZCBhIHRhYiArIHNlcGFyYXRvcjsgYW5kIGEgQk9NIG1hcmsgYXQgdGhlIGJlZ2lubmluZ1xuICAgIGlmIChvLmFkZFNlcGFyYXRvckxpbmUpIHtcbiAgICAgIHJlW3B1c2hdKFwiXFx0XCIgKyBzZXApO1xuICAgIH1cbiAgICByZXR1cm4gbWFyayArIChyZS5qb2luKFwiXFxuXCIpKTtcbiAgfVxufSIsIi8qKlxuICogRmlsZSB1dGlsaXRpZXMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNsaWVudCBzaWRlIGV4cG9ydCBpcyBzdXBwb3J0ZWRcbiAgICogYnkgdGhlIGNsaWVudCwgb3Igbm90LlxuICAgKi9cbiAgc3VwcG9ydHNDc0V4cG9ydDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBuYXZpZ2F0b3IubXNTYXZlQmxvYiB8fCAoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgIHJldHVybiBsaW5rLmRvd25sb2FkICE9PSB1bmRlZmluZWQ7XG4gICAgfSkoKTtcbiAgfSxcblxuICAvKipcbiAgICogRXhwb3J0cyBhIGZpbGU7IHByb21wdGluZyB0aGUgdXNlciBmb3IgZG93bmxvYWQuXG4gICAqIFxuICAgKiBAcGFyYW0gZmlsZW5hbWVcbiAgICogQHBhcmFtIGxpbmVzXG4gICAqL1xuICBleHBvcnRmaWxlOiBmdW5jdGlvbiAoZmlsZW5hbWUsIHRleHQsIHR5cGUpIHtcbiAgICB2YXIgc2V0QXR0cmlidXRlID0gXCJzZXRBdHRyaWJ1dGVcIiwgbXNTYXZlQmxvYiA9IFwibXNTYXZlQmxvYlwiO1xuICAgIHZhciBibG9iID0gbmV3IEJsb2IoW3RleHRdLCB7IHR5cGU6IHR5cGUgfSk7XG4gICAgaWYgKG5hdmlnYXRvclttc1NhdmVCbG9iXSkgeyAvLyBJRSAxMCtcbiAgICAgIG5hdmlnYXRvclttc1NhdmVCbG9iXShibG9iLCBmaWxlbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICBpZiAobGluay5kb3dubG9hZCAhPT0gdW5kZWZpbmVkKSB7IC8vIGZlYXR1cmUgZGV0ZWN0aW9uXG4gICAgICAgIC8vIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCBIVE1MNSBkb3dubG9hZCBhdHRyaWJ1dGVcbiAgICAgICAgdmFyIHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIGxpbmtbc2V0QXR0cmlidXRlXShcImhyZWZcIiwgdXJsKTtcbiAgICAgICAgbGlua1tzZXRBdHRyaWJ1dGVdKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgdmlzaWJpbGl0eTogXCJoaWRkZW5cIixcbiAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuICAgICAgICAgIGxlZnQ6IFwiLTk5OTlweFwiXG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIHggaW4gc3R5bGUpXG4gICAgICAgICAgbGluay5zdHlsZVt4XSA9IHN0eWxlW3hdO1xuICAgICAgICAvL2luamVjdFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxpbmspO1xuICAgICAgICBsaW5rLmNsaWNrKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICB9XG4gICAgfVxuICB9XG59IiwiLyoqXG4gKiBYTUwgYW5kIEhUTUwgdXRpbGl0aWVzIHRvIGJ1aWxkIEhUTUwgc3RyaW5ncy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuZnVuY3Rpb24gaXNOdW0oeCkge1xuICByZXR1cm4gdHlwZW9mIHggPT0gXCJudW1iZXJcIjtcbn1cblxuLyoqXG4gKiBBIHZpcnR1YWwgWE1MIGVsZW1lbnQuXG4gKi9cbmNsYXNzIFZYbWxFbGVtZW50IHtcblxuICBjb25zdHJ1Y3Rvcih0YWdOYW1lLCBhdHRyaWJ1dGVzLCBjaGlsZHJlbikge1xuICAgIHRoaXMudGFnTmFtZSA9IHRhZ05hbWVcbiAgICB0aGlzLmF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9XG4gICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuIGluc3RhbmNlb2YgQXJyYXkgPT0gZmFsc2UpIHtcbiAgICAgIC8vIE5COiBjaGlsZHJlbiBjYW4gYmUgYW55dGhpbmcgaW1wbGVtZW50aW5nIGEgdG9TdHJpbmcgbWV0aG9kIChkdWNrIHR5cGluZylcbiAgICAgIGNoaWxkcmVuID0gW2NoaWxkcmVuXTtcbiAgICB9XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuIHx8IFtdXG4gICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcbiAgICB0aGlzLmVtcHR5ID0gZmFsc2U7XG4gIH1cblxuICBnZXQgdGFnTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGFnTmFtZTtcbiAgfVxuXG4gIHNldCB0YWdOYW1lKHZhbCkge1xuICAgIGlmICh0eXBlb2YgdmFsICE9IFwic3RyaW5nXCIpIHRocm93IG5ldyBFcnJvcihcInRhZ05hbWUgbXVzdCBiZSBhIHN0cmluZ1wiKTtcbiAgICBpZiAoIXZhbC50cmltKCkpIHRocm93IG5ldyBFcnJvcihcInRhZ05hbWUgbXVzdCBoYXZlIGEgbGVuZ3RoXCIpO1xuICAgIGlmICh2YWwuaW5kZXhPZihcIiBcIikgPiAtMSkgdGhyb3cgbmV3IEVycm9yKFwidGFnTmFtZSBjYW5ub3QgY29udGFpbiBzcGFjZXNcIik7XG4gICAgdGhpcy5fdGFnTmFtZSA9IHZhbFxuICB9XG5cbiAgYXBwZW5kQ2hpbGQoY2hpbGQpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBWWG1sRWxlbWVudCBpbnRvIGFuIFhNTCBmcmFnbWVudC5cbiAgICovXG4gIHRvU3RyaW5nKGluZGVudCwgaW5kZW50Q2hhciwgbGV2ZWwpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGVtcHR5ID0gc2VsZi5lbXB0eSxcbiAgICAgICAgdGFnTmFtZSA9IHNlbGYudGFnTmFtZSxcbiAgICAgICAgYXR0cnMgPSBzZWxmLmF0dHJpYnV0ZXMsXG4gICAgICAgIGluZGVudCA9IGlzTnVtKGluZGVudCkgPyBpbmRlbnQgOiAwLFxuICAgICAgICBsZXZlbCA9IGlzTnVtKGxldmVsKSA/IGxldmVsIDogMCxcbiAgICAgICAgaW5kZW50U3RyaW5nID0gaW5kZW50ID4gMCA/IG5ldyBBcnJheSgoaW5kZW50ICogbGV2ZWwpKzEpLmpvaW4oaW5kZW50Q2hhciB8fCBcIiBcIikgOiBcIlwiLFxuICAgICAgICBzID0gXCI8XCIgKyB0YWdOYW1lLFxuICAgICAgICB4O1xuICAgIGZvciAoeCBpbiBhdHRycykge1xuICAgICAgaWYgKGF0dHJzW3hdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKEJPT0xFQU5fUFJPUEVSVElFUy5pbmRleE9mKHgpID4gLTEpIHtcbiAgICAgICAgICBzICs9IGAgJHt4fWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcyArPSBgICR7eH09XCIke2F0dHJzW3hdfVwiYDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW1wdHkpIHtcbiAgICAgIHMgKz0gXCIgLz5cIjtcbiAgICAgIGlmIChpbmRlbnQgPiAwKSB7XG4gICAgICAgIC8vIGFkZCB0aGUgaW5kZW50IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAgICAgICBzID0gaW5kZW50U3RyaW5nICsgcyArIFwiXFxuXCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gcztcbiAgICB9XG4gICAgcyArPSBcIj5cIjtcbiAgICB2YXIgY2hpbGRyZW4gPSBzZWxmLmNoaWxkcmVuO1xuICAgIGlmIChpbmRlbnQgPiAwICYmIGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcyArPSBcIlxcblwiO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICBpZiAoIWNoaWxkKSBjb250aW51ZTtcbiAgICAgIC8vIHN1cHBvcnQgSFRNTCBmcmFnbWVudHNcbiAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBzICs9IChpbmRlbnRTdHJpbmcgKyBjaGlsZCArIFwiXFxuXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFjaGlsZC5oaWRkZW4pIHtcbiAgICAgICAgICBzICs9IGNoaWxkLnRvU3RyaW5nKGluZGVudCwgaW5kZW50Q2hhciwgbGV2ZWwgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBzICs9IChpbmRlbnRTdHJpbmcgKyBgPC8ke3RhZ05hbWV9PmApO1xuICAgIH0gZWxzZSB7XG4gICAgICBzICs9IGA8LyR7dGFnTmFtZX0+YDtcbiAgICB9XG4gICAgaWYgKGluZGVudCA+IDApIHtcbiAgICAgIC8vIGFkZCB0aGUgaW5kZW50IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAgICAgcyA9IGluZGVudFN0cmluZyArIHMgKyBcIlxcblwiO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxufVxuXG5jb25zdCBFTVBUWV9FTEVNRU5UUyA9IFwiYXJlYSBiYXNlIGJhc2Vmb250IGJyIGNvbCBmcmFtZSBociBpbWcgaW5wdXQgaXNpbmRleCBsaW5rIG1ldGEgcGFyYW1cIi5zcGxpdChcIiBcIik7XG5jb25zdCBCT09MRUFOX1BST1BFUlRJRVMgPSBcImNoZWNrZWQgc2VsZWN0ZWQgZGlzYWJsZWQgcmVhZG9ubHkgbXVsdGlwbGUgaXNtYXAgaXNNYXAgZGVmZXIgbm9yZXNpemUgbm9SZXNpemUgbm93cmFwIG5vV3JhcCBub3NoYWRlIG5vU2hhZGUgY29tcGFjdFwiLnNwbGl0KFwiIFwiKTtcblxuZnVuY3Rpb24gZXNjYXBlSHRtbCh1bnNhZmUpIHtcbiAgcmV0dXJuIHVuc2FmZVxuICAgIC5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIilcbiAgICAucmVwbGFjZSgvPC9nLCBcIiZsdDtcIilcbiAgICAucmVwbGFjZSgvPi9nLCBcIiZndDtcIilcbiAgICAucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIilcbiAgICAucmVwbGFjZSgvJy9nLCBcIiYjMDM5O1wiKTtcbiB9XG5cbi8qKlxuICogQSB2aXJ0dWFsIEhUTUwgZWxlbWVudC5cbiAqL1xuY2xhc3MgVkh0bWxFbGVtZW50IGV4dGVuZHMgVlhtbEVsZW1lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHRhZ05hbWUsIGF0dHJpYnV0ZXMsIGNoaWxkcmVuKSB7XG4gICAgc3VwZXIodGFnTmFtZSwgYXR0cmlidXRlcywgY2hpbGRyZW4pXG4gICAgdGhpcy5lbXB0eSA9IEVNUFRZX0VMRU1FTlRTLmluZGV4T2YodGFnTmFtZS50b0xvd2VyQ2FzZSgpKSA+IC0xO1xuICB9XG5cbiAgZ2V0IGlkKCkge1xuICAgIHJldHVybiB0aGlzLmF0dHJpYnV0ZXMuaWQ7XG4gIH1cblxuICBzZXQgaWQodmFsKSB7XG4gICAgdGhpcy5hdHRyaWJ1dGVzLmlkID0gdmFsXG4gIH1cbn1cblxuLyoqXG4gKiBBIHZpcnR1YWwgdGV4dCBlbGVtZW50LlxuICovXG5jbGFzcyBWVGV4dEVsZW1lbnQge1xuXG4gIGNvbnN0cnVjdG9yKHRleHQpIHtcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG4gIH1cblxuICBnZXQgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGV4dDtcbiAgfVxuXG4gIHNldCB0ZXh0KHZhbCkge1xuICAgIC8vIGVzY2FwZSBjaGFyYWN0ZXJzIHRoYXQgbmVlZCB0byBiZSBlc2NhcGVkXG4gICAgaWYgKCF2YWwpIHZhbCA9IFwiXCI7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT0gXCJzdHJpbmdcIikgdmFsID0gdmFsLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5fdGV4dCA9IGVzY2FwZUh0bWwodmFsKTtcbiAgfVxuXG4gIHRvU3RyaW5nKGluZGVudCwgaW5kZW50Q2hhciwgbGV2ZWwpIHtcbiAgICB2YXIgaW5kZW50ID0gaXNOdW0oaW5kZW50KSA/IGluZGVudCA6IDAsXG4gICAgICAgIGxldmVsID0gaXNOdW0obGV2ZWwpID8gbGV2ZWwgOiAwLFxuICAgICAgICBpbmRlbnRTdHJpbmcgPSBpbmRlbnQgPiAwID8gbmV3IEFycmF5KChpbmRlbnQgKiBsZXZlbCkrMSkuam9pbihpbmRlbnRDaGFyIHx8IFwiIFwiKSA6IFwiXCI7XG4gICAgcmV0dXJuIGluZGVudFN0cmluZyArIHRoaXMudGV4dCArIChpbmRlbnRTdHJpbmcgPyBcIlxcblwiIDogXCJcIilcbiAgfVxufVxuXG4vKipcbiAqIEEgcGllY2Ugb2YgSFRNTCBmcmFnbWVudCB0aGF0IHNob3VsZCBiZSByZW5kZXJlZCB3aXRob3V0IGVzY2FwaW5nLlxuICovXG5jbGFzcyBWSHRtbEZyYWdtZW50IHtcbiAgY29uc3RydWN0b3IoaHRtbCkge1xuICAgIHRoaXMuaHRtbCA9IGh0bWxcbiAgfVxuXG4gIHRvU3RyaW5nKGluZGVudCwgaW5kZW50Q2hhciwgbGV2ZWwpIHtcbiAgICB2YXIgaW5kZW50ID0gaXNOdW0oaW5kZW50KSA/IGluZGVudCA6IDAsXG4gICAgICAgIGxldmVsID0gaXNOdW0obGV2ZWwpID8gbGV2ZWwgOiAwLFxuICAgICAgICBpbmRlbnRTdHJpbmcgPSBpbmRlbnQgPiAwID8gbmV3IEFycmF5KChpbmRlbnQgKiBsZXZlbCkrMSkuam9pbihpbmRlbnRDaGFyIHx8IFwiIFwiKSA6IFwiXCI7XG4gICAgcmV0dXJuIGluZGVudFN0cmluZyArIHRoaXMuaHRtbCArIChpbmRlbnRTdHJpbmcgPyBcIlxcblwiIDogXCJcIilcbiAgfVxufVxuXG4vKipcbiAqIEEgdmlydHVhbCBjb21tZW50IGVsZW1lbnQuXG4gKi9cbmNsYXNzIFZDb21tZW50RWxlbWVudCB7XG5cbiAgY29uc3RydWN0b3IodGV4dCkge1xuICAgIHRoaXMudGV4dCA9IHRleHRcbiAgfVxuXG4gIGdldCB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLl90ZXh0O1xuICB9XG5cbiAgc2V0IHRleHQodmFsKSB7XG4gICAgaWYgKCF2YWwpIHZhbCA9IFwiXCI7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT0gXCJzdHJpbmdcIikgdmFsID0gdmFsLnRvU3RyaW5nKCk7XG4gICAgLy8gZGlzYWxsb3dzIDwhLS0gYW5kIC0tPiBpbnNpZGUgdGhlIGNvbW1lbnQgdGV4dFxuICAgIHZhbCA9IHZhbC5yZXBsYWNlKC88IS0tL2csIFwiXCIpLnJlcGxhY2UoLy0tPi9nLCBcIlwiKTtcbiAgICB0aGlzLl90ZXh0ID0gdmFsO1xuICB9XG5cbiAgdG9TdHJpbmcoaW5kZW50LCBpbmRlbnRDaGFyLCBsZXZlbCkge1xuICAgIHZhciBpbmRlbnQgPSBpc051bShpbmRlbnQpID8gaW5kZW50IDogMCxcbiAgICAgICAgbGV2ZWwgPSBpc051bShsZXZlbCkgPyBsZXZlbCA6IDAsXG4gICAgICAgIGluZGVudFN0cmluZyA9IGluZGVudCA+IDAgPyBuZXcgQXJyYXkoKGluZGVudCAqIGxldmVsKSsxKS5qb2luKGluZGVudENoYXIgfHwgXCIgXCIpIDogXCJcIjtcbiAgICByZXR1cm4gaW5kZW50U3RyaW5nICsgXCI8IS0tXCIgKyB0aGlzLnRleHQgKyBcIi0tPlwiICsgKGluZGVudFN0cmluZyA/IFwiXFxuXCIgOiBcIlwiKVxuICB9XG59XG5cbi8qKlxuICogVmlydHVhbCB3cmFwcGVyIGVsZW1lbnQgZm9yIG11bHRpcGxlIGVsZW1lbnRzIHdpdGhvdXQgc2luZ2xlIHJvb3QuXG4gKi9cbmNsYXNzIFZXcmFwcGVyRWxlbWVudCB7XG4gIGNvbnN0cnVjdG9yKGNoaWxkcmVuKSB7XG4gICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuXG4gICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcbiAgfVxuXG4gIHRvU3RyaW5nKGluZGVudCwgaW5kZW50Q2hhciwgbGV2ZWwpIHtcbiAgICB2YXIgcyA9IFwiXCIsIGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcbiAgICBpZiAoIWNoaWxkcmVuIHx8IHRoaXMuaGlkZGVuKSByZXR1cm4gcztcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmICghY2hpbGQpIGNvbnRpbnVlO1xuICAgICAgaWYgKCFjaGlsZC5oaWRkZW4pIHtcbiAgICAgICAgcyArPSBjaGlsZC50b1N0cmluZyhpbmRlbnQsIGluZGVudENoYXIsIGxldmVsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHM7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgVlhtbEVsZW1lbnQsXG4gIFZIdG1sRWxlbWVudCxcbiAgVkh0bWxGcmFnbWVudCxcbiAgVlRleHRFbGVtZW50LFxuICBWQ29tbWVudEVsZW1lbnQsXG4gIFZXcmFwcGVyRWxlbWVudCxcbiAgZXNjYXBlSHRtbFxufVxuIiwiLyoqXG4gKiBQcm94eSBmdW5jdGlvbnMgZm9yIGJ1aWx0LWluIEpTT04gQVBJLlxuICogUHJveHkgZnVuY3Rpb25zIGFyZSB1c2VkLCBmb3IgZXhhbXBsZSwgdG8gcmVtb3ZlIHRoZSBhc3ltbWV0cnkgYmV0d2VlblxuICogLSAgSlNPTiBzdHJpbmdpZnkgKGNyZWF0aW5nIHN0cmluZyByZXByZXNlbnRhdGlvbnMgb2YgZGF0ZXMpIGFuZFxuICogLSAgSlNPTiBwYXJzZSAoTk9UIHBhcnNpbmcgZGF0ZXMgaW4gSVNPIGZvcm1hdCAtIGxvc2luZyBkYXRlcykuXG4gKlxuICogQmVzaWRlcywgSSBIQVRFIHRoZSB3b3JkIFwic3RyaW5naWZ5XCIhISFcbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQgRCBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL2RhdGVcIlxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIC8qKlxuICAgKiBTZXJpYWxpemVzIGFuIG9iamVjdCBpbnRvIEpTT04gZm9ybWF0LlxuICAgKi9cbiAgY29tcG9zZTogZnVuY3Rpb24gKG8sIGluZGVudGF0aW9uKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG8sIGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIG51bGw7IH1cbiAgICAgIHJldHVybiB2O1xuICAgIH0sIGluZGVudGF0aW9uKTtcbiAgfSxcblxuICAvKipcbiAgICogUGFyc2VzIGFuIG9iamVjdCByZXByZXNlbnRlZCBpbiBKU09OIGZvcm1hdC5cbiAgICovXG4gIHBhcnNlOiBmdW5jdGlvbiAocywgb3B0aW9ucykge1xuICAgIHZhciBvID0gXy5leHRlbmQoe1xuICAgICAgcGFyc2VEYXRlczogdHJ1ZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgaWYgKCFvLnBhcnNlRGF0ZXMpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHMpO1xuICAgIH1cblxuICAgIHJldHVybiBKU09OLnBhcnNlKHMsIGZ1bmN0aW9uKGssIHYpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHYpICYmIEQubG9va3NMaWtlRGF0ZSh2KSkge1xuICAgICAgICAvLyBjaGVjayBpZiB0aGUgdmFsdWUgbG9va3MgbGlrZSBhIGRhdGUgYW5kIGNhbiBiZSBwYXJzZWRcbiAgICAgICAgdmFyIGEgPSBELnBhcnNlKHYpO1xuICAgICAgICBpZiAoYSAmJiBELmlzVmFsaWQoYSkpIHtcbiAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHY7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENsb25lcyBhbiBvYmplY3QgdXNpbmcgSlNPTi5cbiAgICogVW5saWtlIHRoZSBub3JtYWwgSlNPTiBBUEksIERhdGVzIGFyZSBrZXB0IGFzIGRhdGVzO1xuICAgKiBob3dldmVyLCBzdHJpbmdzIHRoYXQgbG9va3MgbGlrZSBkYXRlcyBiZWNvbWVzIGRhdGVzLlxuICAgKi9cbiAgY2xvbmU6IGZ1bmN0aW9uIChvKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyc2UodGhpcy5jb21wb3NlKG8pKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBMUlUgY2FjaGUuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQganNvbiBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kYXRhL2pzb25cIlxuaW1wb3J0IHtcbiAgQXJndW1lbnROdWxsRXhjZXB0aW9uXG59IGZyb20gXCIuLi8uLi9zY3JpcHRzL2V4Y2VwdGlvbnNcIlxuXG5mdW5jdGlvbiBnZXRTdG9yYWdlKHR5cGUpIHtcbiAgaWYgKF8uaXNPYmplY3QodHlwZSkpIHJldHVybiB0eXBlO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlIDE6XG4gICAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHNlc3Npb25TdG9yYWdlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBnZXQ6IGZ1bmN0aW9uIChuYW1lLCBjb25kaXRpb24sIHR5cGUsIGRldGFpbHMpIHtcbiAgICBpZiAoY29uZGl0aW9uID09PSB0cnVlKSB7XG4gICAgICBkZXRhaWxzID0gdHJ1ZTtcbiAgICAgIGNvbmRpdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IHRydWUpIHtcbiAgICAgIGRldGFpbHMgPSB0cnVlO1xuICAgICAgdHlwZSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIHN0b3JhZ2UgPSBnZXRTdG9yYWdlKHR5cGUpO1xuICAgIHZhciBpLCBvID0gc3RvcmFnZS5nZXRJdGVtKG5hbWUpO1xuICAgIGlmIChvKSB7XG4gICAgICB0cnkge1xuICAgICAgICBvID0ganNvbi5wYXJzZShvKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShuYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gc2V0IHRpbWVzdGFtcCBpbiBlYWNoIGl0ZW0gZGF0YVxuICAgICAgaWYgKCFjb25kaXRpb24pXG4gICAgICAgIHJldHVybiBfLm1hcChvLCB4ID0+IHsgcmV0dXJuIGRldGFpbHMgPyB4IDogeC5kYXRhOyB9KTtcbiAgICAgIHZhciB0b1JlbW92ZSA9IFtdLCB0b1JldHVybjtcbiAgICAgIHZhciBsID0gby5sZW5ndGg7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBjYSA9IG9baV07XG4gICAgICAgIGlmICghY2EpIGNvbnRpbnVlO1xuICAgICAgICB2YXIgZGF0YSA9IGNhLmRhdGEsIGV4cGlyYXRpb24gPSBkYXRhLmV4cGlyYXRpb247XG4gICAgICAgIGlmIChfLmlzTnVtYmVyKGV4cGlyYXRpb24pICYmIGV4cGlyYXRpb24gPiAwKSB7XG4gICAgICAgICAgLy8gaXMgdGhlIGRhdGEgZXhwaXJlZD9cbiAgICAgICAgICBpZiAobmV3IERhdGUoKS5nZXRUaW1lKCkgPiBleHBpcmF0aW9uKSB7XG4gICAgICAgICAgICAvLyB0aGUgaXRlbSBleHBpcmVkLCBpdCBzaG91bGQgYmUgcmVtb3ZlZFxuICAgICAgICAgICAgdG9SZW1vdmUucHVzaChjYSk7XG4gICAgICAgICAgICAvLyBza2lwXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmRpdGlvbihkYXRhKSkge1xuICAgICAgICAgIHRvUmV0dXJuID0gZGV0YWlscyA/IGNhIDogZGF0YTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRvUmVtb3ZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnJlbW92ZShuYW1lLCB4ID0+IHtcbiAgICAgICAgICByZXR1cm4gdG9SZW1vdmUuaW5kZXhPZih4KSA+IC0xO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b1JldHVybjtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gaXRlbSBmcm9tIHRoZSBjYWNoZSwgZXZlbnR1YWxseSB1c2luZyBhIGNvbmRpdGlvbi5cbiAgICovXG4gIHJlbW92ZTogZnVuY3Rpb24gKG5hbWUsIGNvbmRpdGlvbiwgdHlwZSkge1xuICAgIHZhciBzdG9yYWdlID0gZ2V0U3RvcmFnZSh0eXBlKTtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgc3RvcmFnZS5yZW1vdmVJdGVtKG5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgaSwgbyA9IHN0b3JhZ2UuZ2V0SXRlbShuYW1lKTtcblxuICAgIGlmIChvKSB7XG4gICAgICB0cnkge1xuICAgICAgICBvID0ganNvbi5wYXJzZShvKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShuYW1lKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIGwgPSBvLmxlbmd0aDtcbiAgICAgIHZhciB0b0tlZXAgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIGNhID0gb1tpXTtcbiAgICAgICAgaWYgKCFjYSkgY29udGludWU7XG4gICAgICAgIHZhciBkYXRhID0gY2EuZGF0YTtcbiAgICAgICAgaWYgKCFjb25kaXRpb24oZGF0YSkpIHtcbiAgICAgICAgICAvLyBrZWVwIHRoaXMgaXRlbVxuICAgICAgICAgIHRvS2VlcC5wdXNoKGNhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHN0b3JhZ2Uuc2V0SXRlbShuYW1lLCBqc29uLmNvbXBvc2UodG9LZWVwKSk7XG4gICAgfVxuICB9LFxuXG4gIHNldDogZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBtYXhTaXplLCBtYXhBZ2UsIHR5cGUpIHtcbiAgICBpZiAoIV8uaXNOdW1iZXIobWF4U2l6ZSkpXG4gICAgICBtYXhTaXplID0gMTA7XG4gICAgaWYgKCFfLmlzTnVtYmVyKG1heEFnZSkpXG4gICAgICBtYXhBZ2UgPSAtMTtcbiAgICB2YXIgc3RvcmFnZSA9IGdldFN0b3JhZ2UodHlwZSk7XG4gICAgdmFyIHRzID0gbmV3IERhdGUoKS5nZXRUaW1lKCksIGV4cCA9IG1heEFnZSA+IDAgPyB0cyArIG1heEFnZSA6IC0xO1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgdHM6IHRzLFxuICAgICAgZXhwaXJhdGlvbjogZXhwLFxuICAgICAgZGF0YTogdmFsdWVcbiAgICB9O1xuICAgIHZhciBvID0gc3RvcmFnZS5nZXRJdGVtKG5hbWUpO1xuICAgIGlmIChvKSB7XG4gICAgICB0cnkge1xuICAgICAgICBvID0ganNvbi5wYXJzZShvKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShuYW1lKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0KG5hbWUsIHZhbHVlLCBtYXhTaXplKTtcbiAgICAgIH1cbiAgICAgIGlmIChvLmxlbmd0aCA+PSBtYXhTaXplKSB7XG4gICAgICAgIC8vIHJlbW92ZSBvbGRlc3QgaXRlbVxuICAgICAgICBvLnNoaWZ0KCk7XG4gICAgICB9XG4gICAgICBvLnB1c2goZGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG5ldyBvYmplY3RcbiAgICAgIG8gPSBbe1xuICAgICAgICB0czogdHMsXG4gICAgICAgIGV4cGlyYXRpb246IGV4cCxcbiAgICAgICAgZGF0YTogdmFsdWVcbiAgICAgIH1dO1xuICAgIH1cbiAgICByZXR1cm4gc3RvcmFnZS5zZXRJdGVtKG5hbWUsIGpzb24uY29tcG9zZShvKSk7XG4gIH1cbn1cbiIsIi8qKlxuICogTWVtb3J5IHN0b3JhZ2UuIEFsbG93cyB0byByZXBsYWNlIHVzZSBvZiBsb2NhbFN0b3JhZ2UgYW5kIHNlc3Npb25TdG9yYWdlXG4gKiB3aXRoIGFuIGluLW1lbW9yeSBzdG9yYWdlIHRoYXQgaW1wbGVtZW50cyB0aGUgc2FtZSBpbnRlcmZhY2UuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbmNvbnN0IENBQ0hFID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBpdGVtcygpIHtcbiAgICByZXR1cm4gQ0FDSEU7XG4gIH0sXG5cbiAgbGVuZ3RoKCkge1xuICAgIHZhciB4LCBpID0gMDtcbiAgICBmb3IgKHggaW4gQ0FDSEUpIHsgaSsrOyB9XG4gICAgcmV0dXJuIGk7XG4gIH0sXG5cbiAgZ2V0SXRlbShuYW1lKSB7XG4gICAgcmV0dXJuIENBQ0hFW25hbWVdO1xuICB9LFxuXG4gIHNldEl0ZW0obmFtZSwgdmFsdWUpIHtcbiAgICBDQUNIRVtuYW1lXSA9IHZhbHVlO1xuICB9LFxuXG4gIHJlbW92ZUl0ZW0obmFtZSkge1xuICAgIGRlbGV0ZSBDQUNIRVtuYW1lXTtcbiAgfSxcblxuICBjbGVhcigpIHtcbiAgICB2YXIgeDtcbiAgICBmb3IgKHggaW4gQ0FDSEUpIHtcbiAgICAgIGRlbGV0ZSBDQUNIRVt4XTtcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogT2JqZWN0IGFuYWx5emVyLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQW5hbHl6ZXIge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBwcm9wZXJ0aWVzIG9mIGEgZ2l2ZW4gaXRlbS5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZGVzY3JpYmUobywgb3B0aW9ucykge1xuICAgIGlmIChfLmlzQXJyYXkobykpXG4gICAgICByZXR1cm4gdGhpcy5kZXNjcmliZUxpc3Qobywgb3B0aW9ucyk7XG4gICAgdmFyIHNjaGVtYSA9IHt9LCB4O1xuICAgIGZvciAoeCBpbiBvKSB7XG4gICAgICBzY2hlbWFbeF0gPSB0aGlzLmdldFR5cGUob1t4XSk7XG4gICAgfVxuICAgIHJldHVybiBzY2hlbWE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgcHJvcGVydGllcyBvZiB0aGUgaXRlbXMgY29udGFpbmVkIGJ5IGEgbGlzdC5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZGVzY3JpYmVMaXN0KGEsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2NoZW1hID0ge307XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgZnVuY3Rpb24gdHlwKG8pIHtcbiAgICAgIHJldHVybiBvOyAvLyBUT0RPOiByZWZhY3RvciB0byByZXR1cm4gb2JqZWN0IHdpdGggXCJudWxsYWJsZVwiIGluZm8/XG4gICAgfVxuICAgIHZhciBsID0gXy5pc051bWJlcihvcHRpb25zLmxpbWl0KSA/IG9wdGlvbnMubGltaXQgOiBhLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIG8gPSB0aGlzLmRlc2NyaWJlKGFbaV0pO1xuICAgICAgZm9yICh2YXIgeCBpbiBvKSB7XG4gICAgICAgIGlmIChfLmhhcyhzY2hlbWEsIHgpKSB7XG4gICAgICAgICAgLy9jb21wYXJlXG4gICAgICAgICAgaWYgKHR5cChvW3hdKSAhPSB1bmRlZmluZWQgJiYgdHlwKHNjaGVtYVt4XSkgIT0gdHlwKG9beF0pKSB7XG4gICAgICAgICAgICBpZiAoIXR5cChzY2hlbWFbeF0pKSB7XG4gICAgICAgICAgICAgIHNjaGVtYVt4XSA9IHR5cChvW3hdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vZm9yY2Ugc3RyaW5nIHR5cGVcbiAgICAgICAgICAgICAgc2NoZW1hW3hdID0gXCJzdHJpbmdcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYWRkIG5ldyAgcHJvcGVydHlcbiAgICAgICAgICBfLmV4dGVuZChzY2hlbWEsIG8pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5sYXp5ICYmICFfLmFueShzY2hlbWEsIChrLCB2KSA9PiB7XG4gICAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQ7XG4gICAgICB9KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNjaGVtYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGluZyBhIHR5cGUsIGluIGdyZWF0ZXIgZGV0YWlsIHRoYW4gbm9ybWFsIEpTLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAqL1xuICBnZXRUeXBlKG8pIHtcbiAgICBpZiAobyA9PSBudWxsIHx8IG8gPT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgaWYgKG8gaW5zdGFuY2VvZiBBcnJheSkgcmV0dXJuIFwiYXJyYXlcIjtcbiAgICBpZiAobyBpbnN0YW5jZW9mIERhdGUpIHJldHVybiBcImRhdGVcIjtcbiAgICBpZiAobyBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIFwicmVnZXhcIjtcbiAgICByZXR1cm4gdHlwZW9mIG87XG4gIH1cblxufVxuIiwiLyoqXG4gKiBTdHJpbmdzIHNhbml0aXplci5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNhbml0aXplciB7XG5cbiAgc2FuaXRpemUobykge1xuICAgIHZhciB4O1xuICAgIGZvciAoeCBpbiBvKSB7XG4gICAgICBpZiAoXy5pc1N0cmluZyhvW3hdKSkge1xuICAgICAgICBvW3hdID0gdGhpcy5lc2NhcGUob1t4XSk7XG4gICAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3Qob1t4XSkpIHtcbiAgICAgICAgaWYgKF8uaXNBcnJheShvW3hdKSkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb1t4XS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIG9beF1baV0gPSB0aGlzLnNhbml0aXplKG9beF1baV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvW3hdID0gdGhpcy5zYW5pdGl6ZShvW3hdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcbiAgfVxuXG5lc2NhcGVIdG1sKHMpIHtcbiAgcmV0dXJuIHNcbiAgICAucmVwbGFjZSgvJi9nLCBcIiZhbXA7XCIpXG4gICAgLnJlcGxhY2UoLzwvZywgXCImbHQ7XCIpXG4gICAgLnJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpXG4gICAgLnJlcGxhY2UoL1wiL2csIFwiJnF1b3Q7XCIpXG4gICAgLnJlcGxhY2UoLycvZywgXCImIzAzOTtcIik7XG4gfVxuXG4gIGVzY2FwZShzKSB7XG4gICAgcmV0dXJuIHMgPyB0aGlzLmVzY2FwZUh0bWwocykgOiBcIlwiO1xuICB9XG59XG4iLCIvKipcbiAqIFhNTCBmb3JtYXQgZnVuY3Rpb25zLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IF8gZnJvbSBcIi4uLy4uL3NjcmlwdHMvdXRpbHNcIlxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5vcm1hbDogZnVuY3Rpb24gKHhtbCkge1xuICAgIHJldHVybiBcIjw/eG1sIHZlcnNpb249XFxcIjEuMFxcXCI/PlwiICsgeG1sLnJlcGxhY2UoL1xcc3htbG5zPVwiaHR0cDpcXC9cXC93d3dcXC53M1xcLm9yZ1xcL1xcZCtcXC94aHRtbFwiLywgXCJcIik7XG4gIH0sXG5cbiAgcHJldHR5OiBmdW5jdGlvbiAoeG1sLCBpbmRlbnRhdGlvbikge1xuICAgIHhtbCA9IHRoaXMubm9ybWFsKHhtbCk7XG4gICAgaWYgKHR5cGVvZiBpbmRlbnRhdGlvbiAhPSBcIm51bWJlclwiKVxuICAgICAgaW5kZW50YXRpb24gPSAyO1xuICAgIHZhciByZWcgPSAvKD4pKDwpKFxcLyopL2csIGEgPSBbXTtcbiAgICB4bWwgPSB4bWwucmVwbGFjZShyZWcsIFwiJDFcXHJcXG4kMiQzXCIpO1xuICAgIHZhciBwYWQgPSAwLCBwYXJ0cyA9IHhtbC5zcGxpdCgnXFxyXFxuJyksIGwgPSBwYXJ0cy5sZW5ndGg7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIG5vZGUgPSBwYXJ0c1tpXTtcbiAgICAgIHZhciBpbmRlbnQgPSAwO1xuICAgICAgaWYgKG5vZGUubWF0Y2goLy4rPFxcL1xcd1tePl0qPiQvKSkge1xuICAgICAgICBpbmRlbnQgPSAwO1xuICAgICAgfSBlbHNlIGlmIChub2RlLm1hdGNoKC9ePFxcL1xcdy8pKSB7XG4gICAgICAgIGlmIChwYWQgIT0gMCkge1xuICAgICAgICAgIHBhZCAtPSAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5vZGUubWF0Y2goL148XFx3W14+XSpbXlxcL10+LiokLykpIHtcbiAgICAgICAgaW5kZW50ID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluZGVudCA9IDA7XG4gICAgICB9XG4gICAgICB2YXIgcGFkZGluZyA9IG5ldyBBcnJheShwYWQgKiBpbmRlbnRhdGlvbikuam9pbihcIiBcIik7XG4gICAgICBhLnB1c2gocGFkZGluZyArIG5vZGUgKyBcIlxcclxcblwiKTtcbiAgICAgIHBhZCArPSBpbmRlbnQ7XG4gICAgfVxuICAgIHJldHVybiBhLmpvaW4oXCJcIik7XG4gIH1cbn1cbiIsIi8qKlxuICogRE9NIHV0aWxpdGllcy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmNvbnN0IE9CSkVDVCA9IFwib2JqZWN0XCIsXG4gIFNUUklORyA9IFwic3RyaW5nXCIsXG4gIE5VTUJFUiA9IFwibnVtYmVyXCIsXG4gIEZVTkNUSU9OID0gXCJmdW5jdGlvblwiLFxuICBMRU4gPSBcImxlbmd0aFwiLFxuICBSRVAgPSBcInJlcGxhY2VcIjtcbmltcG9ydCBfIGZyb20gXCIuLi9zY3JpcHRzL3V0aWxzLmpzXCI7XG5jb25zdCBhbnkgPSBfLmFueTtcbmNvbnN0IGVhY2ggPSBfLmVhY2g7XG5cbmZ1bmN0aW9uIG1vZENsYXNzKGVsLCBuLCBhZGQpIHtcbiAgaWYgKG4uc2VhcmNoKC9cXHMvKSA+IC0xKSB7XG4gICAgbiA9IG4uc3BsaXQoL1xccy9nKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG5bTEVOXTsgaSA8IGw7IGkgKyspIHtcbiAgICAgIG1vZENsYXNzKGVsLCBuW2ldLCBhZGQpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgbiA9PSBTVFJJTkcpIHtcbiAgICBlbC5jbGFzc0xpc3RbYWRkID8gXCJhZGRcIiA6IFwicmVtb3ZlXCJdKG4pO1xuICB9XG4gIHJldHVybiBlbDtcbn1cbmZ1bmN0aW9uIGFkZENsYXNzKGVsLCBuKSB7XG4gIHJldHVybiBtb2RDbGFzcyhlbCwgbiwgMSk7XG59XG5mdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgbikge1xuICByZXR1cm4gbW9kQ2xhc3MoZWwsIG4sIDApO1xufVxuZnVuY3Rpb24gaGFzQ2xhc3MoZWwsIG4pIHtcbiAgcmV0dXJuIGVsICYmIGVsLmNsYXNzTGlzdC5jb250YWlucyhuKTtcbn1cbmZ1bmN0aW9uIGF0dHIoZWwsIG4pIHtcbiAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShuKTtcbn1cbmZ1bmN0aW9uIGF0dHJOYW1lKGVsKSB7XG4gIHJldHVybiBhdHRyKGVsLCBcIm5hbWVcIik7XG59XG5mdW5jdGlvbiBuYW1lU2VsZWN0b3IoZWwpIHtcbiAgcmV0dXJuICBcIltuYW1lPSdcIiArIGF0dHJOYW1lKGVsKSArIFwiJ11cIjtcbn1cbmZ1bmN0aW9uIGlzUGFzc3dvcmQobykge1xuICByZXR1cm4gaXNJbnB1dChvKSAmJiBhdHRyKG8sIFwidHlwZVwiKSA9PSBcInBhc3N3b3JkXCI7XG59XG5mdW5jdGlvbiBzZXRWYWx1ZShlbCwgdikge1xuICBpZiAoZWwudHlwZSA9PSBcImNoZWNrYm94XCIpIHtcbiAgICBlbC5jaGVja2VkID0gdiA9PSB0cnVlIHx8IC8xfHRydWUvLnRlc3Qodik7XG4gICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJjaGFuZ2VcIiksIHsgZm9yY2VkOiB0cnVlIH0pO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoZWwudmFsdWUgIT0gdikge1xuICAgIGVsLnZhbHVlID0gdjtcbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiKSwgeyBmb3JjZWQ6IHRydWUgfSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGdldFZhbHVlKGVsKSB7XG4gIHZhciBpc0lucHV0ID0gL2lucHV0L2kudGVzdChlbC50YWdOYW1lKTtcbiAgaWYgKGlzSW5wdXQpIHtcbiAgICBzd2l0Y2ggKGF0dHIoZWwsIFwidHlwZVwiKSkge1xuICAgICAgY2FzZSBcInJhZGlvXCI6XG4gICAgICBjYXNlIFwiY2hlY2tib3hcIjpcbiAgICAgICAgcmV0dXJuIGVsLmNoZWNrZWQ7XG4gICAgfVxuICB9XG4gIHJldHVybiBlbC52YWx1ZTtcbn1cbmZ1bmN0aW9uIGlzUmFkaW9CdXR0b24oZWwpIHtcbiAgcmV0dXJuIGVsICYmIC9eaW5wdXQkL2kudGVzdChlbC50YWdOYW1lKSAmJiAvXihyYWRpbykkL2kudGVzdChlbC50eXBlKTtcbn1cbmZ1bmN0aW9uIGlzU2VsZWN0YWJsZShlbCkge1xuICByZXR1cm4gZWwgJiYgKC9ec2VsZWN0JC9pLnRlc3QoZWwudGFnTmFtZSkgfHwgaXNSYWRpb0J1dHRvbihlbCkpO1xufVxuZnVuY3Rpb24gbmV4dChlbCkge1xuICByZXR1cm4gZWwubmV4dEVsZW1lbnRTaWJsaW5nO1xufVxuZnVuY3Rpb24gbmV4dFdpdGhDbGFzcyhlbCwgbikge1xuICB2YXIgYSA9IGVsLm5leHRFbGVtZW50U2libGluZztcbiAgcmV0dXJuIGhhc0NsYXNzKGEsIG4pID8gYSA6IHVuZGVmaW5lZDtcbn1cbmZ1bmN0aW9uIHByZXYoZWwpIHtcbiAgcmV0dXJuIGVsLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG59XG5mdW5jdGlvbiBmaW5kKGVsLCBzZWxlY3Rvcikge1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59XG5mdW5jdGlvbiBmaW5kRmlyc3QoZWwsIHNlbGVjdG9yKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKVswXTtcbn1cbmZ1bmN0aW9uIGZpbmRGaXJzdEJ5Q2xhc3MoZWwsIG5hbWUpIHtcbiAgcmV0dXJuIGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUobmFtZSlbMF07XG59XG5mdW5jdGlvbiBpc0hpZGRlbihlbCkge1xuICB2YXIgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XG4gIHJldHVybiAoc3R5bGUuZGlzcGxheSA9PSBcIm5vbmVcIiB8fCBzdHlsZS52aXNpYmlsaXR5ID09IFwiaGlkZGVuXCIpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWcpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKTtcbn1cbmZ1bmN0aW9uIGFmdGVyKGEsIGIpIHtcbiAgYS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShiLCBhLm5leHRTaWJsaW5nKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZChhLCBiKSB7XG4gIGEuYXBwZW5kQ2hpbGQoYik7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobykge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gT0JKRUNUID8gbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXG4gICAgbyAmJiB0eXBlb2YgbyA9PT0gT0JKRUNUICYmIG8gIT09IG51bGwgJiYgby5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gU1RSSU5HXG4gICk7XG59XG5mdW5jdGlvbiBpc0FueUlucHV0KG8pIHtcbiAgLy8gVE9ETzogYWRkIHN1cHBvcnQgZm9yIGRpdnMgdHJhbnNmb3JtZWQgaW50byByaWNoIGlucHV0XG4gIHJldHVybiBvICYmIGlzRWxlbWVudChvKSAmJiAvaW5wdXR8YnV0dG9ufHRleHRhcmVhfHNlbGVjdC9pLnRlc3Qoby50YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGlzSW5wdXQobykge1xuICByZXR1cm4gbyAmJiBpc0VsZW1lbnQobykgJiYgL2lucHV0L2kudGVzdChvLnRhZ05hbWUpO1xufVxuZnVuY3Rpb24gZXhwZWN0UGFyZW50KGVsKSB7XG4gIGlmICghaXNFbGVtZW50KGVsKSkgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgSFRNTCBFbGVtZW50XCIpO1xuICB2YXIgcGFyZW50ID0gZWwucGFyZW50Tm9kZTtcbiAgaWYgKCFpc0VsZW1lbnQocGFyZW50KSkgdGhyb3cgbmV3IEVycm9yKFwiZXhwZWN0ZWQgSFRNTCBlbGVtZW50IHdpdGggcGFyZW50Tm9kZVwiKTtcbiAgcmV0dXJuIHBhcmVudDtcbn1cbmNvbnN0IERPVCA9IFwiLlwiO1xuXG4vKipcbiAqIFNwbGl0cyBhbiBldmVudCBuYW1lIGludG8gaXRzIGV2ZW50IG5hbWUgYW5kIG5hbWVzcGFjZS5cbiAqL1xuZnVuY3Rpb24gc3BsaXROYW1lc3BhY2UoZXZlbnROYW1lKSB7XG4gIHZhciBpID0gZXZlbnROYW1lLmluZGV4T2YoRE9UKTtcbiAgaWYgKGkgPiAtMSkge1xuICAgIHZhciBuYW1lID0gZXZlbnROYW1lLnN1YnN0cigwLCBpKTtcbiAgICByZXR1cm4gW2V2ZW50TmFtZS5zdWJzdHIoMCwgaSksIGV2ZW50TmFtZS5zdWJzdHIoaSArIDEpXTtcbiAgfVxuICByZXR1cm4gW2V2ZW50TmFtZSwgXCJcIl07XG59XG5cbmNvbnN0IEhBTkRMRVJTID0gW107XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBzcGxpdE5hbWVzcGFjZSxcblxuICAvKipcbiAgICogRW1wdGllcyBhbiBlbGVtZW50LCByZW1vdmluZyBhbGwgaXRzIGNoaWxkcmVuIGVsZW1lbnRzIGFuZCBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIGVtcHR5KG5vZGUpIHtcbiAgICB3aGlsZSAobm9kZS5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgIC8vIHJlbW92ZSBldmVudCBoYW5kbGVycyBvbiB0aGUgY2hpbGQsIGFib3V0IHRvIGJlIHJlbW92ZWQ6XG4gICAgICB0aGlzLm9mZihub2RlLmxhc3RDaGlsZCk7XG4gICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUubGFzdENoaWxkKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gZWxlbWVudCwgd2l0aCBhbGwgZXZlbnQgaGFuZGxlcnMuXG4gICAqL1xuICByZW1vdmUoYSkge1xuICAgIGlmICghYSkgcmV0dXJuO1xuICAgIHRoaXMub2ZmKGEpO1xuICAgIHZhciBwYXJlbnQgPSBhLnBhcmVudEVsZW1lbnQgfHwgYS5wYXJlbnROb2RlO1xuICAgIGlmIChwYXJlbnQpIHtcbiAgICAgIC8vIGluIHN0dXBpZCBJRSwgdGV4dCBub2RlcyBhbmQgY29tbWVudHMgZG9uJ3QgaGF2ZSBhIHBhcmVudEVsZW1lbnRcbiAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChhKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgdGhlIGdpdmVuIGVsZW1lbnQgaGF2aW5nIHRoZSBnaXZlbiB0YWdOYW1lLlxuICAgKlxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgZnJvbSB3aGljaCB0byBmaW5kIHRoZSBhbmNlc3RvclxuICAgKiBAcGFyYW0gcHJlZGljYXRlOiBwcmVkaWNhdGUgdG8gdXNlIGZvciBsb29rdXAuXG4gICAqIEBwYXJhbSBleGNsdWRlSXRzZWxmOiB3aGV0aGVyIHRvIGluY2x1ZGUgdGhlIGVsZW1lbnQgaXRzZWxmLlxuICAgKi9cbiAgY2xvc2VzdChlbCwgcHJlZGljYXRlLCBleGNsdWRlSXRzZWxmKSB7XG4gICAgaWYgKCFlbCB8fCAhcHJlZGljYXRlKSByZXR1cm47XG4gICAgaWYgKCFleGNsdWRlSXRzZWxmKSB7XG4gICAgICBpZiAocHJlZGljYXRlKGVsKSkgcmV0dXJuIGVsO1xuICAgIH1cbiAgICB2YXIgbywgcGFyZW50ID0gZWw7XG4gICAgd2hpbGUgKHBhcmVudCA9IHBhcmVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHBhcmVudCkpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igb2YgdGhlIGdpdmVuIGVsZW1lbnQgaGF2aW5nIHRoZSBnaXZlbiB0YWdOYW1lLlxuICAgKlxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgZnJvbSB3aGljaCB0byBmaW5kIHRoZSBhbmNlc3RvclxuICAgKiBAcGFyYW0gdGFnTmFtZTogdGFnTmFtZSB0byBsb29rIGZvci5cbiAgICogQHBhcmFtIGV4Y2x1ZGVJdHNlbGY6IHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAqL1xuICBjbG9zZXN0V2l0aFRhZyhlbCwgdGFnTmFtZSwgZXhjbHVkZUl0c2VsZikge1xuICAgIGlmICghdGFnTmFtZSkgcmV0dXJuO1xuICAgIHRhZ05hbWUgPSB0YWdOYW1lLnRvVXBwZXJDYXNlKCk7XG4gICAgcmV0dXJuIHRoaXMuY2xvc2VzdChlbCwgZWwgPT4ge1xuICAgICAgcmV0dXJuIGVsLnRhZ05hbWUgPT0gdGFnTmFtZTtcbiAgICB9LCBleGNsdWRlSXRzZWxmKTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY2xvc2VzdCBhbmNlc3RvciBvZiB0aGUgZ2l2ZW4gZWxlbWVudCBoYXZpbmcgdGhlIGdpdmVuIGNsYXNzLlxuICAgKlxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgZnJvbSB3aGljaCB0byBmaW5kIHRoZSBhbmNlc3RvclxuICAgKiBAcGFyYW0gdGFnTmFtZTogdGFnTmFtZSB0byBsb29rIGZvci5cbiAgICogQHBhcmFtIGV4Y2x1ZGVJdHNlbGY6IHdoZXRoZXIgdG8gaW5jbHVkZSB0aGUgZWxlbWVudCBpdHNlbGYuXG4gICAqL1xuICBjbG9zZXN0V2l0aENsYXNzKGVsLCBjbGFzc05hbWUsIGV4Y2x1ZGVJdHNlbGYpIHtcbiAgICBpZiAoIWNsYXNzTmFtZSkgcmV0dXJuO1xuICAgIHJldHVybiB0aGlzLmNsb3Nlc3QoZWwsIGVsID0+IGhhc0NsYXNzKGVsLCBjbGFzc05hbWUpLCBleGNsdWRlSXRzZWxmKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgYSBub2RlIGNvbnRhaW5zIGFub3RoZXIgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIGE6IGNvbnRhaW5pbmcgbm9kZVxuICAgKiBAcGFyYW0gYjogbm9kZSB0byBiZSBjaGVja2VkIGZvciBjb250YWlubWVudFxuICAgKi9cbiAgY29udGFpbnMoYSwgYikge1xuICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlXG4gICAgaWYgKCFhLmhhc0NoaWxkTm9kZXMoKSkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBjaGlsZHJlbiA9IGEuY2hpbGROb2RlcywgbCA9IGNoaWxkcmVuLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICBpZiAoY2hpbGQgPT09IGIpIHJldHVybiB0cnVlO1xuICAgICAgaWYgKHRoaXMuY29udGFpbnMoY2hpbGQsIGIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldHMgYSBkZWxlZ2F0ZSBldmVudCBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICogQHBhcmFtIGV2ZW50TmFtZVxuICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICogQHBhcmFtIG1ldGhvZFxuICAgKiBAcmV0dXJucyB7dGhpc31cbiAgICovXG4gIG9uKGVsZW1lbnQsIHR5cGUsIHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIGlmICghaXNFbGVtZW50KGVsZW1lbnQpKVxuICAgICAgLy8gZWxlbWVudCBjb3VsZCBiZSBhIHRleHQgZWxlbWVudCBvciBhIGNvbW1lbnRcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImFyZ3VtZW50IGlzIG5vdCBhIERPTSBlbGVtZW50LlwiKTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHNlbGVjdG9yKSAmJiAhY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrID0gc2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9IG51bGw7XG4gICAgfVxuICAgIHZhciAkID0gdGhpcztcbiAgICB2YXIgcGFydHMgPSBzcGxpdE5hbWVzcGFjZSh0eXBlKTtcbiAgICB2YXIgZXZlbnROYW1lID0gcGFydHNbMF0sIG5zID0gcGFydHNbMV07XG4gICAgdmFyIGxpc3RlbmVyID0gKGUpID0+IHtcbiAgICAgIHZhciBtID0gZS50YXJnZXQ7XG4gICAgICBpZiAoc2VsZWN0b3IpIHtcbiAgICAgICAgdmFyIHRhcmdldHMgPSBmaW5kKGVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGFueSh0YXJnZXRzLCAobykgPT4geyByZXR1cm4gZS50YXJnZXQgPT09IG8gfHwgJC5jb250YWlucyhvLCBlLnRhcmdldCk7IH0pKSB7XG4gICAgICAgICAgdmFyIHJlID0gY2FsbGJhY2soZSwgZS5kZXRhaWwpO1xuICAgICAgICAgIGlmIChyZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZSA9IGNhbGxiYWNrKGUsIGUuZGV0YWlsKTtcbiAgICAgICAgaWYgKHJlID09PSBmYWxzZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgSEFORExFUlMucHVzaCh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgZXY6IGV2ZW50TmFtZSxcbiAgICAgIG5zOiBucyxcbiAgICAgIGZuOiBsaXN0ZW5lcixcbiAgICAgIGVsOiBlbGVtZW50XG4gICAgfSk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBzZXQgYnkgRE9NIGhlbHBlciBvbiBhIGdpdmVuIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIHt0aGlzfVxuICAgKi9cbiAgb2ZmKGVsZW1lbnQsIHR5cGUpIHtcbiAgICBpZiAoIWlzRWxlbWVudChlbGVtZW50KSlcbiAgICAgIC8vIGVsZW1lbnQgY291bGQgYmUgYSB0ZXh0IGVsZW1lbnQgb3IgYSBjb21tZW50XG4gICAgICByZXR1cm47XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGlmICh0eXBlWzBdID09PSBET1QpIHtcbiAgICAgICAgLy8gdW5zZXQgZXZlbnQgbGlzdGVuZXJzIGJ5IG5hbWVzcGFjZVxuICAgICAgICB2YXIgbnMgPSB0eXBlLnN1YnN0cigxKTtcbiAgICAgICAgZWFjaChIQU5ETEVSUywgKG8pID0+IHtcbiAgICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCAmJiBvLm5zID09IG5zKSB7XG4gICAgICAgICAgICBvLmVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoby5ldiwgby5mbiwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoZWNrIG5hbWVzcGFjZVxuICAgICAgICB2YXIgcGFydHMgPSBzcGxpdE5hbWVzcGFjZSh0eXBlKTtcbiAgICAgICAgdmFyIGV2ZW50TmFtZSA9IHBhcnRzWzBdLCBucyA9IHBhcnRzWzFdO1xuICAgICAgICBlYWNoKEhBTkRMRVJTLCAobykgPT4ge1xuICAgICAgICAgIGlmIChvLmVsID09PSBlbGVtZW50ICYmIG8uZXYgPT0gZXZlbnROYW1lICYmICghbnMgfHwgby5ucyA9PSBucykpIHtcbiAgICAgICAgICAgIG8uZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLmV2LCBvLmZuLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBlYWNoKEhBTkRMRVJTLCAobykgPT4ge1xuICAgICAgICBpZiAoby5lbCA9PT0gZWxlbWVudCkge1xuICAgICAgICAgIG8uZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLmV2LCBvLmZuLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBldmVudCBoYW5kbGVycyBzZXQgYnkgRE9NIGhlbHBlci5cbiAgICogQHJldHVybnMge3RoaXN9XG4gICAqL1xuICBvZmZBbGwoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBlbGVtZW50O1xuICAgIGVhY2goSEFORExFUlMsIChvKSA9PiB7XG4gICAgICBlbGVtZW50ID0gby5lbDtcbiAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLmV2LCBvLmZuLCB0cnVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfSxcblxuICAvKipcbiAgICogRmlyZXMgYW4gZXZlbnQgb24gYSBnaXZlbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgb24gd2hpY2ggdG8gZmlyZSBhbiBldmVudC5cbiAgICogQHBhcmFtIGV2ZW50TmFtZTogbmFtZSBvZiB0aGUgZXZlbnQgdG8gZmlyZS5cbiAgICogQHBhcmFtIGRhdGE6IGV2ZW50IGRhdGEuXG4gICAqL1xuICBmaXJlKGVsLCBldmVudE5hbWUsIGRhdGEpIHtcbiAgICBpZiAoZXZlbnROYW1lID09IFwiZm9jdXNcIikge1xuICAgICAgZWwuZm9jdXMoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGV2ZW50O1xuICAgIGlmICh3aW5kb3cuQ3VzdG9tRXZlbnQpIHtcbiAgICAgIGV2ZW50ID0gbmV3IEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgeyBkZXRhaWw6IGRhdGEgfSk7XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5jcmVhdGVFdmVudCkge1xuICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudChcIkN1c3RvbUV2ZW50XCIpO1xuICAgICAgZXZlbnQuaW5pdEN1c3RvbUV2ZW50KGV2ZW50TmFtZSwgdHJ1ZSwgdHJ1ZSwgZGF0YSk7XG4gICAgfVxuICAgIGVsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzaWJsaW5ncyBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIGVsOiBlbGVtZW50IG9mIHdoaWNoIHRvIGdldCB0aGUgc2libGluZ3MuXG4gICAqL1xuICBzaWJsaW5ncyhlbCwgYWxsTm9kZXMpIHtcbiAgICB2YXIgcGFyZW50ID0gZXhwZWN0UGFyZW50KGVsKTtcbiAgICB2YXIgYSA9IFtdLCBjaGlsZHJlbiA9IHBhcmVudFthbGxOb2RlcyA/IFwiY2hpbGROb2Rlc1wiIDogXCJjaGlsZHJlblwiXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICBpZiAoY2hpbGQgIT09IGVsKSB7XG4gICAgICAgIGEucHVzaChjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IHNpYmxpbmdzIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZWw6IGVsZW1lbnQgb2Ygd2hpY2ggdG8gZ2V0IHRoZSBzaWJsaW5ncy5cbiAgICovXG4gIG5leHRTaWJsaW5ncyhlbCwgYWxsTm9kZXMpIHtcbiAgICB2YXIgcGFyZW50ID0gZXhwZWN0UGFyZW50KGVsKTtcbiAgICB2YXIgYSA9IFtdLCBjaGlsZHJlbiA9IHBhcmVudFthbGxOb2RlcyA/IFwiY2hpbGROb2Rlc1wiIDogXCJjaGlsZHJlblwiXSwgaW5jbHVkZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIGlmIChjaGlsZCAhPT0gZWwgJiYgaW5jbHVkZSkge1xuICAgICAgICBhLnB1c2goY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5jbHVkZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyBzaWJsaW5ncyBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIGVsOiBlbGVtZW50IG9mIHdoaWNoIHRvIGdldCB0aGUgc2libGluZ3MuXG4gICAqL1xuICBwcmV2U2libGluZ3MoZWwsIGFsbE5vZGVzKSB7XG4gICAgdmFyIHBhcmVudCA9IGV4cGVjdFBhcmVudChlbCk7XG4gICAgdmFyIGEgPSBbXSwgY2hpbGRyZW4gPSBwYXJlbnRbYWxsTm9kZXMgPyBcImNoaWxkTm9kZXNcIiA6IFwiY2hpbGRyZW5cIl07XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgaWYgKGNoaWxkICE9PSBlbCkge1xuICAgICAgICBhLnB1c2goY2hpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBlbGVtZW50cyBieSBjbGFzcyBuYW1lLlxuICAgKi9cbiAgZmluZEJ5Q2xhc3MoZWwsIG5hbWUpIHtcbiAgICByZXR1cm4gZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShuYW1lKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJuIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiBlbGVtZW50IGlzIGZvY3VzZWQuXG4gICAqXG4gICAqIEBwYXJhbSBlbDogZWxlbWVudCB0byBjaGVjayBmb3IgZm9jdXNcbiAgICovXG4gIGlzRm9jdXNlZChlbCkge1xuICAgIGlmICghZWwpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZWwgPT09IHRoaXMuZ2V0Rm9jdXNlZEVsZW1lbnQoKTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3VycmVudGx5IGFjdGl2ZSBlbGVtZW50LCBpbiB0aGUgRE9NLlxuICAgKi9cbiAgZ2V0Rm9jdXNlZEVsZW1lbnQoKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCI6Zm9jdXNcIik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlcmUgaXMgYW55IGlucHV0IGVsZW1lbnQgY3VycmVudGx5IGZvY3VzZWQuXG4gICAqL1xuICBhbnlJbnB1dEZvY3VzZWQoKSB7XG4gICAgdmFyIGEgPSB0aGlzLmdldEZvY3VzZWRFbGVtZW50KCk7XG4gICAgcmV0dXJuIGEgJiYgL2lucHV0fHNlbGVjdHx0ZXh0YXJlYS9pLnRlc3QoYS50YWdOYW1lKTtcbiAgfSxcblxuICBwcmV2LFxuXG4gIG5leHQsXG5cbiAgYXBwZW5kLFxuXG4gIGFkZENsYXNzLFxuXG4gIHJlbW92ZUNsYXNzLFxuXG4gIG1vZENsYXNzLFxuXG4gIGF0dHIsXG5cbiAgaGFzQ2xhc3MsXG5cbiAgYWZ0ZXIsXG5cbiAgY3JlYXRlRWxlbWVudCxcblxuICBpc0VsZW1lbnQsXG5cbiAgaXNJbnB1dCxcblxuICBpc0FueUlucHV0LFxuXG4gIGlzU2VsZWN0YWJsZSxcblxuICBpc1JhZGlvQnV0dG9uLFxuXG4gIGlzUGFzc3dvcmQsXG5cbiAgYXR0ck5hbWUsXG5cbiAgaXNIaWRkZW4sXG5cbiAgZmluZCxcblxuICBmaW5kRmlyc3QsXG5cbiAgZmluZEZpcnN0QnlDbGFzcyxcblxuICBnZXRWYWx1ZSxcblxuICBzZXRWYWx1ZVxufTtcbiIsIi8qKlxuICogUHJveHkgZnVuY3Rpb25zIHRvIHJhaXNlIGV4Y2VwdGlvbnMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5mdW5jdGlvbiBpc051bWJlcih4KSB7XG4gIHJldHVybiB0eXBlb2YgeCA9PSBcIm51bWJlclwiO1xufVxuY29uc3QgTk9fUEFSQU0gPSBcIj8/P1wiXG5cbmZ1bmN0aW9uIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihuYW1lKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIlRoZSBwYXJhbWV0ZXIgY2Fubm90IGJlIG51bGw6IFwiICsgKG5hbWUgfHwgTk9fUEFSQU0pKVxufVxuXG5mdW5jdGlvbiBBcmd1bWVudEV4Y2VwdGlvbihkZXRhaWxzKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYXJndW1lbnQ6IFwiICsgKGRldGFpbHMgfHwgTk9fUEFSQU0pKVxufVxuXG5mdW5jdGlvbiBUeXBlRXhjZXB0aW9uKG5hbWUsIGV4cGVjdGVkVHlwZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBwYXJhbWV0ZXI6IFwiICsgKG5hbWUgfHwgTk9fUEFSQU0pICsgXCIgb2YgdHlwZTogXCIgKyAodHlwZSB8fCBOT19QQVJBTSkpXG59XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbkV4Y2VwdGlvbihkZXNjKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3BlcmF0aW9uOiBcIiArIGRlc2MpO1xufVxuXG5mdW5jdGlvbiBPdXRPZlJhbmdlRXhjZXB0aW9uKG5hbWUsIG1pbiwgbWF4KSB7XG4gIHZhciBtZXNzYWdlID0gXCJPdXQgb2YgcmFuZ2UuIEV4cGVjdGVkIHBhcmFtZXRlcjogXCIgKyAobmFtZSB8fCBOT19QQVJBTSlcbiAgaWYgKCFpc051bWJlcihtYXgpICYmIG1pbiA9PT0gMCkge1xuICAgIG1lc3NhZ2UgPSBcIiB0byBiZSBwb3NpdGl2ZS5cIjtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaXNOdW1iZXIobWluKSlcbiAgICAgIG1lc3NhZ2UgPSBcIiA+PVwiICsgbWluO1xuICAgIGlmIChpc051bWJlcihtYXgpKVxuICAgICAgbWVzc2FnZSA9IFwiIDw9XCIgKyBtYXg7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpXG59XG5cbmV4cG9ydCB7XG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxuICBBcmd1bWVudE51bGxFeGNlcHRpb24sXG4gIFR5cGVFeGNlcHRpb24sXG4gIE91dE9mUmFuZ2VFeGNlcHRpb24sXG4gIE9wZXJhdGlvbkV4Y2VwdGlvblxufVxuIiwiLyoqXG4gKiBGaWx0ZXJzIG1hbmFnZXIuXG4gKiBQcm92aWRlcyBtZXRob2RzIHRvIGhhbmRsZSBjbGllbnQgc2lkZSBmaWx0ZXJpbmcgbG9naWMgZm9yIGFycmF5cy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCBFdmVudHNFbWl0dGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvZXZlbnRzXCJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCJcbmltcG9ydCByYWlzZSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9yYWlzZVwiXG5pbXBvcnQgUmVnZXhVdGlscyBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL3JlZ2V4XCJcbmltcG9ydCBBcnJheVV0aWxzIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvYXJyYXlcIlxuaW1wb3J0IFMgZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9zdHJpbmdcIlxuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbHRlcnNNYW5hZ2VyIGV4dGVuZHMgRXZlbnRzRW1pdHRlciB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucywgc3RhdGljUHJvcGVydGllcykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgdGhpcy5zZWFyY2hEaXNhYmxlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdChvcHRpb25zLCBzdGF0aWNQcm9wZXJ0aWVzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGluaXQob3B0aW9ucywgc3RhdGljUHJvcGVydGllcykge1xuICAgIGlmIChzdGF0aWNQcm9wZXJ0aWVzKVxuICAgICAgXy5leHRlbmQodGhpcywgc3RhdGljUHJvcGVydGllcylcbiAgICB0aGlzLm9wdGlvbnMgPSBfLmV4dGVuZCh7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyk7XG4gIH1cblxuICBzZXQoZmlsdGVyLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IF8uZXh0ZW5kKHtcbiAgICAgIHNpbGVudDogZmFsc2VcbiAgICB9LCBvcHRpb25zIHx8IHt9KTtcbiAgICBpZiAoIWZpbHRlcikgcmV0dXJuIHRoaXM7XG4gICAgaWYgKGZpbHRlci5pZCAmJiAhZmlsdGVyLmtleSkgZmlsdGVyLmtleSA9IGZpbHRlci5pZDtcbiAgICBpZiAoZmlsdGVyLmtleSkge1xuICAgICAgdGhpcy5ydWxlcyA9IF8ucmVqZWN0KHRoaXMucnVsZXMsIGZ1bmN0aW9uIChyKSB7IHJldHVybiByLmtleSA9PT0gZmlsdGVyLmtleTsgfSk7XG4gICAgfVxuICAgIGlmIChmaWx0ZXIuZnJvbUxpdmVGaWx0ZXJzKVxuICAgICAgcmV0dXJuIHRoaXMuc2V0TGl2ZUZpbHRlcihmaWx0ZXIpO1xuICAgIHRoaXMucnVsZXMucHVzaChmaWx0ZXIpO1xuICAgIGlmICghb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgIHRoaXMub25SdWxlc0NoYW5nZShmaWx0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldExpdmVGaWx0ZXIoZmlsdGVyKSB7XG4gICAgcmFpc2UoMTIsIFwiTGl2ZUZpbHRlciBmZWF0dXJlIG5vdCBpbXBsZW1lbnRlZC5cIik7XG4gIH1cblxuICBzdGF0aWMgZ2V0IGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgcnVsZSBieSBrZXkuXG4gICAqL1xuICBnZXRSdWxlQnlLZXkoa2V5KSB7XG4gICAgcmV0dXJuIF8uZmluZCh0aGlzLnJ1bGVzLCAocnVsZSkgPT4geyByZXR1cm4gcnVsZS5rZXkgPT0ga2V5OyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHJ1bGVzIGJ5IHR5cGUuXG4gICAqL1xuICBnZXRSdWxlc0J5VHlwZSh0eXBlKSB7XG4gICAgcmV0dXJuIF8ud2hlcmUodGhpcy5ydWxlcywgKHJ1bGUpID0+IHsgcmV0dXJuIHJ1bGUudHlwZSA9PSB0eXBlOyB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgc2luZ2xlIHJ1bGUgYnkga2V5LlxuICAgKi9cbiAgcmVtb3ZlUnVsZUJ5S2V5IChrZXksIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gXy5leHRlbmQoe1xuICAgICAgc2lsZW50OiBmYWxzZVxuICAgIH0sIG9wdGlvbnMgfHwge30pO1xuICAgIHZhciBzZWxmID0gdGhpcywgcnVsZXMgPSBzZWxmLnJ1bGVzO1xuICAgIHZhciBydWxlVG9SZW1vdmUgPSBfLmZpbmQocnVsZXMsIChyKSA9PiB7IHJldHVybiByLmtleSA9PSBrZXk7IH0pO1xuICAgIGlmIChydWxlVG9SZW1vdmUpIHtcbiAgICAgIHNlbGYucnVsZXMgPSBfLnJlamVjdChydWxlcywgKHIpID0+IHsgcmV0dXJuIHIgPT09IHJ1bGVUb1JlbW92ZTsgfSk7XG4gICAgICBpZiAoIW9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgIHNlbGYub25SdWxlc0NoYW5nZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBmaXJlIHdoZW4gcnVsZXMgY2hhbmdlLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKi9cbiAgb25SdWxlc0NoYW5nZSgpIHt9XG5cbiAgLyoqXG4gICAqIFNlYXJjaGVzIGluc2lkZSBhIGNvbGxlY3Rpb24gZm9yIGFsbCBpdGVtcyB0aGF0IHJlc3BlY3QgYSBnaXZlbiBzZWFyY2ggc3RyaW5nLlxuICAgKi9cbiAgc2VhcmNoKGNvbGxlY3Rpb24sIHMsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXMgfHwgIWNvbGxlY3Rpb24gfHwgdGhpcy5zZWFyY2hEaXNhYmxlZCkgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgdmFyIHJ4ID0gcyBpbnN0YW5jZW9mIFJlZ0V4cCA/IHMgOiBSZWdleFV0aWxzLmdldFNlYXJjaFBhdHRlcm4oUy5nZXRTdHJpbmcocyksIG9wdGlvbnMpO1xuICAgIGlmICghcngpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoIW9wdGlvbnMuc2VhcmNoUHJvcGVydGllcylcbiAgICAgIC8vIHRyeSB0byBnZXQgc2VhcmNoIHByb3BlcnRpZXMgZnJvbSB0aGUgY29udGV4dFxuICAgICAgb3B0aW9ucy5zZWFyY2hQcm9wZXJ0aWVzID0gdGhpcy5jb250ZXh0LmdldFNlYXJjaFByb3BlcnRpZXMoKTtcbiAgICBpZiAoIW9wdGlvbnMuc2VhcmNoUHJvcGVydGllcylcbiAgICAgIHJhaXNlKDExLCBcIm1pc3Npbmcgc2VhcmNoIHByb3BlcnRpZXNcIik7XG4gICAgcmV0dXJuIEFycmF5VXRpbHMuc2VhcmNoQnlTdHJpbmdQcm9wZXJ0aWVzKHtcbiAgICAgIHBhdHRlcm46IHJ4LFxuICAgICAgcHJvcGVydGllczogb3B0aW9ucy5zZWFyY2hQcm9wZXJ0aWVzLFxuICAgICAgY29sbGVjdGlvbjogY29sbGVjdGlvbixcbiAgICAgIGtlZXBTZWFyY2hEZXRhaWxzOiBmYWxzZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNraW1zIGFuIGFycmF5LCBhcHBseWluZyBhbGwgY29uZmlndXJlZCBmaWx0ZXJzLlxuICAgKi9cbiAgc2tpbShhcnIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHJ1bGVzID0gc2VsZi5ydWxlcywgbCA9IHJ1bGVzLmxlbmd0aDtcbiAgICBpZiAoIWwpIHJldHVybiBhcnI7XG4gICAgdmFyIGEgPSBhcnI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBmaWx0ZXIgPSBzZWxmLnJ1bGVzW2ldO1xuICAgICAgaWYgKGZpbHRlci5kaXNhYmxlZCkgY29udGludWU7XG4gICAgICBhID0gc2VsZi5hcHBseUZpbHRlcihhLCBmaWx0ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGEgZ2l2ZW4gZmlsdGVyIHRvIGFuIGFycmF5LlxuICAgKi9cbiAgYXBwbHlGaWx0ZXIoYXJyLCBmaWx0ZXIpIHtcbiAgICBzd2l0Y2ggKGZpbHRlci50eXBlKSB7XG4gICAgICBjYXNlIFwic2VhcmNoXCI6XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaChhcnIsIGZpbHRlci52YWx1ZSwgZmlsdGVyKTtcbiAgICAgIGNhc2UgXCJmblwiOlxuICAgICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICAgIHJldHVybiBfLndoZXJlKGFyciwgXy5wYXJ0aWFsKGZpbHRlci5mbi5iaW5kKGZpbHRlci5jb250ZXh0IHx8IHRoaXMpLCBmaWx0ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhpcyBGaWx0ZXJzTWFuYWdlciwgcmVtb3ZpbmcgYWxsIGZpbHRlciBydWxlcyBpbiBpdC5cbiAgICovXG4gIHJlc2V0ICgpIHtcbiAgICB2YXIgcnVsZTtcbiAgICB3aGlsZSAocnVsZSA9IHRoaXMucnVsZXMuc2hpZnQoKSkge1xuICAgICAgaWYgKHJ1bGUub25SZXNldCkge1xuICAgICAgICBydWxlLm9uUmVzZXQuY2FsbCh0aGlzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsIi8qKlxuICogUGFnaW5hdG9yIGNsYXNzLlxuICogT2ZmZXJzIG1ldGhvZHMgdG8gaGFuZGxlIHBhZ2luYXRpb24gb2YgaXRlbXMgYW5kIHBhZ2UgbnVtYmVyLnNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCJcblxuZnVuY3Rpb24gY2hlY2tOdW1iZXIoKSB7XG4gIHZhciBpLCBsID0gYXJndW1lbnRzLmxlbmd0aCwgYTtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGEgPSBhcmd1bWVudHNbaV07XG4gICAgaWYgKCFfLmlzTnVtYmVyKGEpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB0eXBlXCIpXG4gIH1cbn1cbmZ1bmN0aW9uIGNoZWNrTnVsbGFibGVOdW1iZXIoKSB7XG4gIHZhciBpLCBsID0gYXJndW1lbnRzLmxlbmd0aCwgYTtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGEgPSBhcmd1bWVudHNbaV07XG4gICAgaWYgKCFfLmlzVW5kKGEpICYmICFfLmlzTnVtYmVyKGEpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB0eXBlXCIpXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFnaW5hdG9yIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgY2hlY2tOdWxsYWJsZU51bWJlcihvcHRpb25zLnBhZ2UsIG9wdGlvbnMudG90YWxJdGVtc0NvdW50LCBvcHRpb25zLnJlc3VsdHNQZXJQYWdlKVxuICAgIHRoaXMucGFnZSA9IG9wdGlvbnMucGFnZSB8fCAwO1xuICAgIHRoaXMucmVzdWx0c1BlclBhZ2UgPSBvcHRpb25zLnJlc3VsdHNQZXJQYWdlIHx8IDMwO1xuICAgIHRoaXMudG90YWxJdGVtc0NvdW50ID0gb3B0aW9ucy50b3RhbEl0ZW1zQ291bnQgfHwgSW5maW5pdHk7XG4gICAgdGhpcy50b3RhbFBhZ2VDb3VudCA9IEluZmluaXR5O1xuICAgIHRoaXMuZmlyc3RPYmplY3ROdW1iZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5sYXN0T2JqZWN0TnVtYmVyID0gdW5kZWZpbmVkO1xuICAgIGlmICghXy5pc1VuZChvcHRpb25zLnRvdGFsSXRlbXNDb3VudCkpIHtcbiAgICAgIHRoaXMuc2V0VG90YWxJdGVtc0NvdW50KG9wdGlvbnMudG90YWxJdGVtc0NvdW50LCB0cnVlKTtcbiAgICB9XG4gICAgaWYgKF8uaXNGdW5jdGlvbihvcHRpb25zLm9uUGFnZUNoYW5nZSkpIHtcbiAgICAgIC8vIG92ZXJyaWRlXG4gICAgICB0aGlzLm9uUGFnZUNoYW5nZSA9IG9wdGlvbnMub25QYWdlQ2hhbmdlO1xuICAgIH1cbiAgfVxuXG4gIGdldCByZXN1bHRzUGVyUGFnZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVzdWx0c1BlclBhZ2U7XG4gIH1cblxuICBzZXQgcmVzdWx0c1BlclBhZ2UodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDA7XG4gICAgY2hlY2tOdW1iZXIodmFsdWUpO1xuICAgIHZhciBzZWxmID0gdGhpcywgdG90YWxJdGVtc0NvdW50ID0gc2VsZi50b3RhbEl0ZW1zQ291bnQ7XG4gICAgLy8gaXMgdG90YWwgaXRlbXMgY291bnQga25vd24/XG4gICAgaWYgKHRvdGFsSXRlbXNDb3VudCkge1xuICAgICAgdmFyIHRvdGFsUGFnZXMgPSBzZWxmLmdldFBhZ2VDb3VudCh0b3RhbEl0ZW1zQ291bnQsIHZhbHVlKTtcbiAgICAgIHNlbGYudG90YWxQYWdlQ291bnQgPSB0b3RhbFBhZ2VzO1xuICAgICAgaWYgKHRvdGFsUGFnZXMgPD0gc2VsZi5fcGFnZSkge1xuICAgICAgICAvLyBnbyB0byBsYXN0IHBhZ2VcbiAgICAgICAgc2VsZi5wYWdlID0gdG90YWxQYWdlcztcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5fcmVzdWx0c1BlclBhZ2UgPSB2YWx1ZTtcbiAgICBzZWxmLnVwZGF0ZUl0ZW1zTnVtYmVyKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBwYWdlIG9mIHRoaXMgcGFnaW5hdG9yLlxuICAgKi9cbiAgZ2V0IHBhZ2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhZ2U7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3VycmVudCBwYWdlIG9mIHRoaXMgcGFnaW5hdG9yLlxuICAgKi9cbiAgc2V0IHBhZ2UodmFsdWUpIHtcbiAgICBjaGVja051bWJlcih2YWx1ZSlcbiAgICBpZiAodmFsdWUgIT0gdGhpcy5wYWdlKSB7XG4gICAgICB0aGlzLl9wYWdlID0gdmFsdWU7XG4gICAgICB0aGlzLnVwZGF0ZUl0ZW1zTnVtYmVyKCk7XG4gICAgICB0aGlzLm9uUGFnZUNoYW5nZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgc3VtbWFyeSBvZiB0aGlzIHBhZ2luYXRvci5cbiAgICovXG4gIGRhdGEoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzO1xuICAgIHJldHVybiB7XG4gICAgICBwYWdlOiBkYXRhLl9wYWdlLFxuICAgICAgdG90YWxQYWdlQ291bnQ6IGRhdGEudG90YWxQYWdlQ291bnQsXG4gICAgICByZXN1bHRzUGVyUGFnZTogZGF0YS5yZXN1bHRzUGVyUGFnZSxcbiAgICAgIGZpcnN0T2JqZWN0TnVtYmVyOiBkYXRhLmZpcnN0T2JqZWN0TnVtYmVyLFxuICAgICAgbGFzdE9iamVjdE51bWJlcjogZGF0YS5sYXN0T2JqZWN0TnVtYmVyLFxuICAgICAgdG90YWxJdGVtc0NvdW50OiBkYXRhLnRvdGFsSXRlbXNDb3VudFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0byBwcmV2aW91cyBwYWdlLlxuICAgKi9cbiAgcHJldigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBhID0gc2VsZi5wYWdlIC0gMTtcbiAgICBpZiAoc2VsZi52YWxpZFBhZ2UoYSkpIHtcbiAgICAgIHNlbGYucGFnZSA9IGE7XG4gICAgfVxuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdG8gbmV4dCBwYWdlLlxuICAgKi9cbiAgbmV4dCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBhID0gc2VsZi5wYWdlICsgMTtcbiAgICBpZiAoc2VsZi52YWxpZFBhZ2UoYSkpIHtcbiAgICAgIHNlbGYucGFnZSA9IGE7XG4gICAgfVxuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdG8gdGhlIGZpcnN0IHBhZ2UuXG4gICAqL1xuICBmaXJzdCgpIHtcbiAgICB0aGlzLnBhZ2UgPSAxO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdvZXMgdG8gdGhlIGxhc3QgcGFnZS5cbiAgICovXG4gIGxhc3QoKSB7XG4gICAgdGhpcy5wYWdlID0gdGhpcy50b3RhbFBhZ2VDb3VudDtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBvYmplY3RzIG51bWJlcnMgaW4gbWVtb3J5LlxuICAgKi9cbiAgdXBkYXRlSXRlbXNOdW1iZXIoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCB0b3RhbEl0ZW1zQ291bnQgPSBzZWxmLnRvdGFsSXRlbXNDb3VudDtcbiAgICBzZWxmLmZpcnN0T2JqZWN0TnVtYmVyID0gKHNlbGYucGFnZSAqIHNlbGYucmVzdWx0c1BlclBhZ2UpIC0gc2VsZi5yZXN1bHRzUGVyUGFnZSArIDE7XG4gICAgc2VsZi5sYXN0T2JqZWN0TnVtYmVyID0gTWF0aC5taW4oXy5pc051bWJlcih0b3RhbEl0ZW1zQ291bnQpID8gdG90YWxJdGVtc0NvdW50IDogSW5maW5pdHksIHNlbGYucGFnZSAqIHNlbGYucmVzdWx0c1BlclBhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHRvdGFsIGl0ZW1zIGNvdW50IG9mIHRoaXMgcGFnaW5hdG9yLlxuICAgKi9cbiAgc2V0VG90YWxJdGVtc0NvdW50KGl0ZW1zQ291bnQsIHVwb25Jbml0aWFsaXphdGlvbikge1xuICAgIGNoZWNrTnVtYmVyKGl0ZW1zQ291bnQpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnRvdGFsSXRlbXNDb3VudCA9IGl0ZW1zQ291bnQ7XG4gICAgdmFyIHRvdGFsUGFnZXMgPSBzZWxmLmdldFBhZ2VDb3VudChpdGVtc0NvdW50LCBzZWxmLnJlc3VsdHNQZXJQYWdlKTtcbiAgICBzZWxmLnRvdGFsUGFnZUNvdW50ID0gdG90YWxQYWdlcztcbiAgICAvL2lmIHRoZSBjdXJyZW50IHBhZ2UgaXMgZ3JlYXRlciB0aGFuIHRoZSB0b3RhbCBwYWdlcyBjb3VudDsgc2V0IGF1dG9tYXRpY2FsbHkgdGhlIHBhZ2UgdG8gMVxuICAgIC8vIE5COiB0aGUgZm9sbG93aW5nIGRvZXMgbm90IG1ha2Ugc2Vuc2UgdXBvbiBpbml0aWFsaXphdGlvbiEhXG4gICAgaWYgKCF1cG9uSW5pdGlhbGl6YXRpb24gJiYgdG90YWxQYWdlcyA8IHNlbGYucGFnZSkge1xuICAgICAgc2VsZi5wYWdlID0gMTtcbiAgICB9XG4gICAgc2VsZi51cGRhdGVJdGVtc051bWJlcigpO1xuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGdpdmVuIHZhbHVlIGlzIGEgdmFsaWQgcGFnZSBudW1iZXIgZm9yIHRoaXMgcGFnaW5hdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gdmFsOiBwYWdlIG51bWJlclxuICAgKi9cbiAgdmFsaWRQYWdlKHZhbCkge1xuICAgIHZhciBwID0gdGhpcztcbiAgICByZXR1cm4gIShpc05hTih2YWwpIHx8IHZhbCA8IDEgfHwgdmFsID4gcC50b3RhbFBhZ2VDb3VudCB8fCB2YWwgPT09IHAucGFnZSk7XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gZmlyZWQgd2hlbiBjaGFuZ2luZyBwYWdlLlxuICAgKi9cbiAgb25QYWdlQ2hhbmdlKCkgeyB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRvdGFsIHBhZ2UgY291bnQgdG8gZGlzcGxheSBuIG9iamVjdHMsIGdpdmVuIHRoZSBudW1iZXIgb2Ygb2JqZWN0cyBwZXIgcGFnZS5cbiAgICpcbiAgICogQHBhcmFtIG9iamVjdHNDb3VudDogdG90YWwgaXRlbXMgY291bnRcbiAgICogQHBhcmFtIG9iamVjdHNQZXJQYWdlOiBwYWdlIHNpemUsIG51bWJlciBvZiBpdGVtcyBwZXIgcGFnZVxuICAgKi9cbiAgZ2V0UGFnZUNvdW50KG9iamVjdHNDb3VudCwgb2JqZWN0c1BlclBhZ2UpIHtcbiAgICBjaGVja051bWJlcihvYmplY3RzQ291bnQsIG9iamVjdHNQZXJQYWdlKVxuICAgIGlmIChvYmplY3RzQ291bnQgPT09IEluZmluaXR5KSByZXR1cm4gSW5maW5pdHk7XG4gICAgaWYgKG9iamVjdHNDb3VudCA9PT0gLUluZmluaXR5KSByZXR1cm4gMDtcbiAgICBpZiAob2JqZWN0c0NvdW50IDwgMSlcbiAgICAgIHJldHVybiAwO1xuICAgIGlmIChvYmplY3RzQ291bnQgPiBvYmplY3RzUGVyUGFnZSkge1xuICAgICAgaWYgKG9iamVjdHNDb3VudCAlIG9iamVjdHNQZXJQYWdlID09IDApIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdHNDb3VudCAvIG9iamVjdHNQZXJQYWdlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIE1hdGguY2VpbChvYmplY3RzQ291bnQgLyBvYmplY3RzUGVyUGFnZSk7XG4gICAgfVxuICAgIHJldHVybiAxO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBkZWxldGUgdGhpcy5vblBhZ2VDaGFuZ2U7XG4gIH1cbn1cbiIsIi8qKlxuICogVGV4dCBzbGlkZXIuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQge1xuIEFyZ3VtZW50RXhjZXB0aW9uLFxuIEFyZ3VtZW50TnVsbEV4Y2VwdGlvblxufSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcblxuY2xhc3MgVGV4dFNsaWRlciB7XG5cbiAgY29uc3RydWN0b3IodGV4dCwgZmlsbGVyKSB7XG4gICAgaWYgKCF0ZXh0KSBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJ0ZXh0XCIpO1xuICAgIHRoaXMubGVuZ3RoID0gdGV4dC5sZW5ndGhcbiAgICB0aGlzLmkgPSAwXG4gICAgdGhpcy5qID0gdGhpcy5sZW5ndGhcbiAgICB0aGlzLnRleHQgPSB0ZXh0XG4gICAgdGhpcy5maWxsZXIgPSBmaWxsZXIgfHwgXCIgXCJcbiAgICB0aGlzLnJpZ2h0ID0gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGlzIFRleHRTbGlkZXIgYXQgaXRzIGluaXRpYWwgc3RhdHRlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5pID0gMFxuICAgIHRoaXMuaiA9IHRoaXMubGVuZ3RoXG4gICAgdGhpcy5yaWdodCA9IHRydWVcbiAgfVxuXG4gIG5leHQoKSB7XG4gICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgcyA9IHNlbGYudGV4dCxcbiAgICAgICBmaWxsZXIgPSBzZWxmLmZpbGxlcixcbiAgICAgICBsZW5ndGggPSBzZWxmLmxlbmd0aCxcbiAgICAgICBpID0gc2VsZi5pLFxuICAgICAgIGogPSBzZWxmLmosXG4gICAgICAgcmlnaHQgPSBzZWxmLnJpZ2h0O1xuICAgdmFyIGEgPSBzLnN1YnN0cihpLCBqKTtcbiAgIHZhciBjaGFuZ2UgPSBmYWxzZTtcbiAgIGlmIChyaWdodCkge1xuICAgICBpZiAoaiA9PSAxKSB7XG4gICAgICAgaiA9IHMubGVuZ3RoO1xuICAgICAgIGkgPSBqO1xuICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgIH0gZWxzZSB7XG4gICAgICAgai0tO1xuICAgICB9XG4gICB9IGVsc2Uge1xuICAgICBpZiAoaSA9PSAwKSB7XG4gICAgICAgai0tO1xuICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgIH0gZWxzZSB7XG4gICAgICAgaS0tO1xuICAgICB9XG4gICB9XG5cbiAgIGlmIChyaWdodCAmJiBzLmxlbmd0aCAhPSBhLmxlbmd0aCkge1xuICAgICBhID0gbmV3IEFycmF5KHMubGVuZ3RoIC0gYS5sZW5ndGggKyAxKS5qb2luKGZpbGxlcikgKyBhO1xuICAgfSBlbHNlIHtcbiAgICAgYSA9IGEgKyBuZXcgQXJyYXkocy5sZW5ndGggLSBhLmxlbmd0aCArIDEpLmpvaW4oZmlsbGVyKTtcbiAgIH1cbiAgIGlmIChjaGFuZ2UpIHtcbiAgICAgcmlnaHQgPSAhcmlnaHQ7XG4gICAgIHNlbGYucmlnaHQgPSByaWdodDtcbiAgIH1cbiAgIHNlbGYuaSA9IGk7XG4gICBzZWxmLmogPSBqO1xuICAgcmV0dXJuIGE7XG4gIH1cbn1cblxuZXhwb3J0IHsgVGV4dFNsaWRlciB9XG4iLCIvKipcbiAqIEtpbmdUYWJsZSBtZW51IGJ1aWxkZXIgZnVuY3Rpb24uXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQgJCBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kb21cIlxuaW1wb3J0IHsgQXJndW1lbnROdWxsRXhjZXB0aW9uIH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvZXhjZXB0aW9uc1wiXG5pbXBvcnQgeyBWSHRtbEVsZW1lbnQsIFZUZXh0RWxlbWVudCwgVkNvbW1lbnRFbGVtZW50LCBWV3JhcHBlckVsZW1lbnQgfSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kYXRhL2h0bWxcIlxuXG5mdW5jdGlvbiBidWlsZE1lbnVJdGVtQ2FyZXQoKSB7XG4gIHJldHVybiBuZXcgVkh0bWxFbGVtZW50KFwic3BhblwiLCB7XG4gICAgXCJjbGFzc1wiOiBcIm9pXCIsXG4gICAgXCJkYXRhLWdseXBoXCI6IFwiY2FyZXQtcmlnaHRcIlxuICB9KTtcbn1cblxuZnVuY3Rpb24gbWVudUJ1aWxkZXIobWVudXMpIHtcbiAgaWYgKCFtZW51cykgdGhyb3cgXCJtaXNzaW5nIG1lbnVzXCI7XG4gIGlmIChfLmlzUGxhaW5PYmplY3QobWVudXMpKSByZXR1cm4gbWVudUJ1aWxkZXIoW21lbnVzXSk7XG4gIGlmICghXy5pc0FycmF5KG1lbnVzKSB8fCAhbWVudXMubGVuZ3RoKSB0aHJvdyBcIm1pc3NpbmcgbWVudXNcIjtcbiAgLy9ub3JtYWxpemUgc2NoZW1hLCBpZiBuZWVkZWRcbiAgdmFyIGZpcnN0ID0gbWVudXNbMF07XG4gIGlmICghZmlyc3QuaXRlbXMgJiYgZmlyc3QubWVudSkge1xuICAgIG1lbnVzID0gW3sgaXRlbXM6IG1lbnVzIH1dO1xuICB9XG4gIHZhciBhID0gXy5tYXAobWVudXMsIG1lbnUgPT4ge1xuICAgIHZhciBpdGVtcyA9IG1lbnUuaXRlbXM7XG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJ1bFwiLCB7XG4gICAgICBcImlkXCI6IG1lbnUuaWQsXG4gICAgICBcImNsYXNzXCI6IFwidWctbWVudVwiXG4gICAgfSwgaXRlbXMgPyBfLm1hcChpdGVtcywgeCA9PiB7XG4gICAgICBpZiAoIXgpIHJldHVybjtcbiAgICAgIHJldHVybiBtZW51SXRlbUJ1aWxkZXIoeCk7XG4gICAgfSkgOiBudWxsKTtcbiAgfSk7XG4gIHJldHVybiBuZXcgVldyYXBwZXJFbGVtZW50KGEpO1xufVxuXG5mdW5jdGlvbiBtZW51SXRlbUNhcmV0KCkge1xuICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgIFwiY2xhc3NcIjogXCJvaVwiLFxuICAgIFwiZGF0YS1nbHlwaFwiOiBcImNhcmV0LXJpZ2h0XCJcbiAgfSlcbn1cblxuZnVuY3Rpb24gbWVudUl0ZW1CdWlsZGVyKG9wdGlvbnMpIHtcbiAgICB2YXIgbyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIHR5cGUgPSBvLnR5cGUsXG4gICAgICAgIGhyZWYgPSBvLmhyZWYsXG4gICAgICAgIGNsYXNzZXMgPSBbXSxcbiAgICAgICAgbmFtZSA9IG8ubmFtZSxcbiAgICAgICAgc3VibWVudSA9IG8ubWVudSxcbiAgICAgICAgYXR0ciA9IG8uYXR0cixcbiAgICAgICAgY2FyZXQgPSBzdWJtZW51ID8gYnVpbGRNZW51SXRlbUNhcmV0KCkgOiBudWxsLFxuICAgICAgICBjaGlsZHJlbiA9IFtdLFxuICAgICAgICBlbCxcbiAgICAgICAgbmFtZVRleHRFbCA9IG5ldyBWVGV4dEVsZW1lbnQobmFtZSB8fCBcIlwiKTtcbiAgICBpZiAoYXR0ciAmJiBhdHRyLmNzcyAmJiAhYXR0cltcImNsYXNzXCJdKSB7XG4gICAgICAvLyBhbGxvdyB0byB1c2UgYXR0cmlidXRlIGNzcyBmb3IgY2xhc3NcbiAgICAgIGF0dHJbXCJjbGFzc1wiXSA9IGF0dHIuY3NzO1xuICAgICAgZGVsZXRlIGF0dHIuY3NzO1xuICAgIH1cbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJjaGVja2JveFwiOlxuICAgICAgICB2YXIgY2lkID0gXy51bmlxdWVJZChcIm1uY2stXCIpO1xuICAgICAgICB2YXIgY2hlY2tlZCA9IG8uY2hlY2tlZCA/IHRydWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGVsID0gbmV3IFZXcmFwcGVyRWxlbWVudChbbmV3IFZIdG1sRWxlbWVudChcImlucHV0XCIsIF8uZXh0ZW5kKHt9LCBhdHRyLCB7XG4gICAgICAgICAgXCJpZFwiOiBjaWQsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwiY2hlY2tib3hcIixcbiAgICAgICAgICBcImNoZWNrZWRcIjogY2hlY2tlZFxuICAgICAgICB9KSksIG5ldyBWSHRtbEVsZW1lbnQoXCJsYWJlbFwiLCB7XG4gICAgICAgICAgXCJmb3JcIjogY2lkXG4gICAgICAgIH0sIG5hbWVUZXh0RWwpXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInJhZGlvXCI6XG4gICAgICAgIHZhciB2YWx1ZSA9IG8udmFsdWU7XG4gICAgICAgIGlmICghdmFsdWUpIHRocm93IG5ldyBFcnJvcihcIm1pc3NpbmcgJ3ZhbHVlJyBmb3IgcmFkaW8gbWVudSBpdGVtXCIpO1xuICAgICAgICB2YXIgY2lkID0gXy51bmlxdWVJZChcIm1ucmQtXCIpO1xuICAgICAgICB2YXIgY2hlY2tlZCA9IG8uY2hlY2tlZCA/IHRydWUgOiB1bmRlZmluZWQ7XG4gICAgICAgIGVsID0gbmV3IFZXcmFwcGVyRWxlbWVudChbbmV3IFZIdG1sRWxlbWVudChcImlucHV0XCIsIF8uZXh0ZW5kKHt9LCBhdHRyLCB7XG4gICAgICAgICAgXCJpZFwiOiBjaWQsXG4gICAgICAgICAgXCJ0eXBlXCI6IFwicmFkaW9cIixcbiAgICAgICAgICBcImNoZWNrZWRcIjogY2hlY2tlZCxcbiAgICAgICAgICBcInZhbHVlXCI6IHZhbHVlXG4gICAgICAgIH0pKSwgbmV3IFZIdG1sRWxlbWVudChcImxhYmVsXCIsIHtcbiAgICAgICAgICBcImZvclwiOiBjaWRcbiAgICAgICAgfSwgbmFtZVRleHRFbCldKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoaHJlZikge1xuICAgICAgICAgIGVsID0gbmV3IFZIdG1sRWxlbWVudChcImFcIiwgIF8uZXh0ZW5kKHtcbiAgICAgICAgICAgIFwiaHJlZlwiOiBocmVmXG4gICAgICAgICAgfSwgYXR0ciksIFtuYW1lVGV4dEVsLCBjYXJldF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsID0gbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwgXy5leHRlbmQoe1xuICAgICAgICAgICAgXCJ0YWJpbmRleFwiOiBcIjBcIlxuICAgICAgICAgIH0sIGF0dHIpLCBbbmFtZVRleHRFbCwgY2FyZXRdKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gbmFtZSBlbGVtZW50XG4gICAgY2hpbGRyZW4ucHVzaChlbCk7XG5cbiAgICBpZiAoc3VibWVudSkge1xuICAgICAgY2hpbGRyZW4ucHVzaChtZW51QnVpbGRlcihzdWJtZW51KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJsaVwiLCB7XG4gICAgICBcImlkXCI6IG8uaWQsXG4gICAgICBcImNsYXNzXCI6IHN1Ym1lbnUgPyBcInVnLXN1Ym1lbnVcIiA6IHVuZGVmaW5lZFxuICAgIH0sIGNoaWxkcmVuKTtcbn1cblxuZXhwb3J0IHsgbWVudUJ1aWxkZXIsIG1lbnVJdGVtQnVpbGRlciB9IiwiLyoqXG4gKiBLaW5nVGFibGUgbWVudSBjb3JlIGZ1bmN0aW9ucy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCAkIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RvbVwiXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5cbmZ1bmN0aW9uIGV2ZW50VG9JZ25vcmUoZSkge1xuICByZXR1cm4gL2lucHV0fHNlbGVjdHx0ZXh0YXJlYXxsYWJlbHxeYSQvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpO1xufVxuXG52YXIgbWVudWZ1bmN0aW9ucyA9IHtcblxuICBjbG9zZU1lbnVzOiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoZSAmJiBlLndoaWNoID09PSAzKSByZXR1cm47XG4gICAgXy5lYWNoKFtcInVnLW1lbnVcIiwgXCJ1Zy1zdWJtZW51XCJdLCBjbGFzc05hbWUgPT4ge1xuICAgICAgdmFyIGVsZW1lbnRzID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNsYXNzTmFtZSk7XG4gICAgICBcbiAgICAgIF8uZWFjaChlbGVtZW50cywgZWwgPT4ge1xuICAgICAgICBpZiAoJC5jb250YWlucyhlbCwgZS50YXJnZXQpKSByZXR1cm47XG5cbiAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudE5vZGU7XG4gICAgICAgIGlmICghJC5oYXNDbGFzcyhwYXJlbnQsIFwib3BlblwiKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICgvaW5wdXR8dGV4dGFyZWEvaS50ZXN0KGUudGFyZ2V0LnRhZ05hbWUpICYmICQuY29udGFpbnMocGFyZW50LCBlLnRhcmdldCkpIHJldHVybjtcblxuICAgICAgICAkLnJlbW92ZUNsYXNzKHBhcmVudCwgXCJvcGVuXCIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZXhwYW5kTWVudTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZXZlbnRUb0lnbm9yZShlKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgZWwgPSBlLnRhcmdldCwgZGlzYWJsZWQgPSBcImRpc2FibGVkXCI7XG4gICAgaWYgKCQuaGFzQ2xhc3MoZWwsIGRpc2FibGVkKSB8fCBlbC5oYXNBdHRyaWJ1dGUoZGlzYWJsZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnRFbGVtZW50LCBvcGVuID0gXCJvcGVuXCI7XG4gICAgaWYgKCQuaGFzQ2xhc3MocGFyZW50LCBvcGVuKSkge1xuICAgICAgJC5yZW1vdmVDbGFzcyhwYXJlbnQsIG9wZW4pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkLmFkZENsYXNzKHBhcmVudCwgb3Blbik7XG4gICAgfVxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgZXhwYW5kU3ViTWVudTogZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZXZlbnRUb0lnbm9yZShlKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIG9wZW4gPSBcIm9wZW5cIixcbiAgICAgIGVsID0gJC5jbG9zZXN0V2l0aFRhZyhlLnRhcmdldCwgXCJsaVwiKSxcbiAgICAgIHNpYmxpbmdzID0gJC5zaWJsaW5ncyhlbCk7XG4gICAgXy5lYWNoKHNpYmxpbmdzLCBzaWIgPT4ge1xuICAgICAgJC5yZW1vdmVDbGFzcyhzaWIsIG9wZW4pO1xuICAgICAgdmFyIGFsbE9wZW4gPSBzaWIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShvcGVuKTtcbiAgICAgIF8uZWFjaChhbGxPcGVuLCBhID0+IHtcbiAgICAgICAgJC5yZW1vdmVDbGFzcyhhLCBvcGVuKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgICQuYWRkQ2xhc3MoZWwsIG9wZW4pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIHNldHVwKCkge1xuICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHZhciBjbGljayA9IFwiY2xpY2subWVudXNcIixcbiAgICAgIGtleWRvd24gPSBcImtleWRvd24ubWVudXNcIiwgYm8gPSBkb2N1bWVudC5ib2R5O1xuICAgICQub2ZmKGJvLCBjbGljaylcbiAgICAkLm9uKGJvLCBjbGljaywgbWVudWZ1bmN0aW9ucy5jbG9zZU1lbnVzKTsgLy8gb3JkZXIgaXMgaW1wb3J0YW50XG4gICAgJC5vbihibywgY2xpY2ssIFwiLnVnLWV4cGFuZGVyXCIsIG1lbnVmdW5jdGlvbnMuZXhwYW5kTWVudSk7XG4gICAgJC5vbihibywgY2xpY2ssIFwiLnVnLXN1Ym1lbnVcIiwgbWVudWZ1bmN0aW9ucy5leHBhbmRTdWJNZW51KTtcbiAgfVxufSIsIi8qKlxuICogS2luZ1RhYmxlIHJhaXNlIGZ1bmN0aW9uLlxuICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJhaXNlIGV4Y2VwdGlvbnMgdGhhdCBpbmNsdWRlIGEgbGluayB0byB0aGUgR2l0SHViIHdpa2ksXG4gKiBwcm92aWRpbmcgZnVydGhlciBpbmZvcm1hdGlvbiBhbmQgZGV0YWlscy5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBSYWlzZXMgYW4gZXhjZXB0aW9uLCBvZmZlcmluZyBhIGxpbmsgdG8gdGhlIEdpdEh1YiB3aWtpLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByYWlzZShlcnIsIGRldGFpbCkge1xuICB2YXIgbWVzc2FnZSA9IChkZXRhaWwgPyBkZXRhaWwgOiBcIkVycm9yXCIpICsgXCIuIEZvciBmdXJ0aGVyIGRldGFpbHM6IGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGUvd2lraS9FcnJvcnMjXCIgKyBlcnI7XG4gIGlmICh0eXBlb2YgY29uc29sZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbi8qXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5FcnJvcnNcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbjEuIE1pc3NpbmcgUHJvbWlzZSBpbXBsZW1lbnRhdGlvbi5cbjIuIE1pc3NpbmcgZGVwZW5kZW5jeS5cbjMuIEtpbmdUYWJsZSBpbml0aWFsaXphdGlvbjogRGF0YSBpcyBub3QgYW4gYXJyYXkuXG40LiBLaW5nVGFibGU6IGNhbm5vdCBkZXRlcm1pbmUgaWQgcHJvcGVydHkgb2YgZGlzcGxheWVkIG9iamVjdHMuXG41LiBLaW5nVGFibGU6IGFuIEFKQVggcmVxdWVzdCBpcyByZXF1aXJlZCwgYnV0IHVybCBpcyBub3QgY29uZmlndXJlZC5cbjYuIEtpbmdUYWJsZTogdGhlIHJldHVybmVkIG9iamVjdCBpcyBub3QgYSBjYXRhbG9nLlxuNy4gS2luZ1RhYmxlOiBtaXNzaW5nIHRvdGFsIGl0ZW1zIGNvdW50IGluIHJlc3BvbnNlIG9iamVjdC5cbjguIEtpbmdUYWJsZTogbWlzc2luZyB2aWV3IGNvbmZpZ3VyYXRpb24uXG45LiBLaW5nVGFibGU6IG1pc3Npbmcgdmlld3MgY29uZmlndXJhdGlvbi5cbjEwLiBLaW5nVGFibGU6IG1pc3NpbmcgaGFuZGxlciBmb3Igdmlldy5cbjExLiBGaWx0ZXJzTWFuYWdlcjogbWlzc2luZyBzZWFyY2ggcHJvcGVydGllcy5cbjEyLiBGZWF0dXJlIG5vdCBpbXBsZW1lbnRlZC5cbjEzLiBnZXRUYWJsZURhdGEgaXMgbm90IHJldHVybmluZyBhIHByb21pc2Ugb2JqZWN0LlxuMTQuIGdldEZldGNoUHJvbWlzZSBkaWQgbm90IHJldHVybiBhIHZhbHVlIHdoZW4gcmVzb2x2aW5nLlxuMTUuIE1pc3NpbmcgcmVnaW9uYWwuXG4xNi4gSW52YWxpZCBjb2x1bW5zIG9wdGlvbi5cbjE3LiBNaXNzaW5nIHByb3BlcnR5IG5hbWUgaW4gY29sdW1uIG9wdGlvbi5cbjE4LiBDb2x1bW4gbmFtZSBkZWZpbmVkIGluIG9wdGlvbnMsIG5vdCBmb3VuZCBpbnNpZGUgZGF0YSBpdGVtcy5cbjE5LiBDb2x1bW4gZG9lcyBub3QgZXhpc3QuXG4yMC4gTWlzc2luZyBjb2x1bW5zIGluZm9ybWF0aW9uIChwcm9wZXJ0aWVzIG5vdCBpbml0aWFsaXplZCkuXG4yMS4gTWlzc2luZyB2aWV3IGNvbmZpZ3VyYXRpb24gZm9yIFJpY2ggSFRNTCBidWlsZGVyLlxuMjIuIE1pc3NpbmcgdmlldyByZXNvbHZlciBmb3IgUmljaCBIVE1MIGJ1aWxkZXIuXG4yMy4gSW52YWxpZCByZXNvbHZlciBmb3IgUmljaCBIVE1MIGJ1aWxkZXIgdmlldy5cbjI0LiBJbnZhbGlkIGBodG1sYCBvcHRpb24gZm9yIGNvbHVtbiAocHJvcGVydHkpLlxuMjUuIENhbm5vdCBkaXNwbGF5IGEgYnVpbHQgdGFibGUsIGJlY2F1c2UgdGhlIHRhYmxlIGlzIG5vdCBib3VuZCB0byBhbiBlbGVtZW50LlxuMjYuIENhbm5vdCB1cGRhdGUgd2l0aG91dCByb290IGVsZW1lbnQuXG4yNy4gSW52YWxpZCBtZXRob2QgZGVmaW5pdGlvbiAobXVzdCBiZSBzdHJpbmcgb3IgZnVuY3Rpb24pLlxuMjguIEludmFsaWQgc29ydCBtb2RlIGZvciBSSFRNTCBidWlsZGVyLlxuMjkuIE1pc3NpbmcgZm9ybWF0IGluIGV4cG9ydCBlbGVtZW50LlxuMzAuIE1pc3NpbmcgZm9ybWF0IGluZm9ybWF0aW9uLlxuMzEuIEludmFsaWQgZ2V0SXRlbVRlbXBsYXRlIGZ1bmN0aW9uIGluIGV4dHJhIHZpZXcuXG4zMi4gTWlzc2luZyBwcm9wZXJ0eSBmb3IgdGVtcGxhdGUuXG4zMy4gTWlzc2luZyByZXNvbHZlciBpbiB2aWV3IGNvbmZpZ3VyYXRpb24uXG4zNC4gSW52YWxpZCBleHRyYSB2aWV3cyBjb25maWd1cmF0aW9uIChudWxsIG9yIGZhbHN5IHZhbHVlKS5cbjM1LiBNaXNzaW5nICduYW1lJyBwcm9wZXJ0eSBpbiBleHRyYSB2aWV3IGNvbmZpZ3VyYXRpb24uXG4zNi4gQ2Fubm90IHJldHJpZXZlIGFuIGl0ZW0gYnkgZXZlbnQgZGF0YS4gTWFrZSBzdXJlIHRoYXQgSFRNTCBlbGVtZW50cyBnZW5lcmF0ZWQgZm9yIHRhYmxlIGl0ZW1zIGhhdmUgJ2t0LWl0ZW0nIGNsYXNzLlxuMzcuIENhbm5vdCByZXRyaWV2ZSBhbiBpdGVtIGJ5IGVsZW1lbnQgZGF0YS4gTWFrZSBzdXJlIHRoYXQgSFRNTCBlbGVtZW50cyBnZW5lcmF0ZWQgZm9yIHRhYmxlIGl0ZW1zIGhhdmUgJ2RhdGEtaXgnIGF0dHJpYnV0ZS5cbjM4LiBDYW5ub3Qgb2J0YWluIEhUTUwgZnJvbSBwYXJhbWV0ZXIuXG4zOS4gS2luZ1RhYmxlIGlzIG5vdCBkZWZpbmVkIGluIGdsb2JhbCBuYW1lc3BhY2UuXG40MC4gVG9vbHMgaXMgbm90IGFuIGFycmF5IG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIGFycmF5LlxuNDEuIEludmFsaWQgSFRUUCBNZXRob2QgY29uZmlndXJhdGlvbi5cbiovXG4iLCIvKipcbiAqIEtpbmdUYWJsZSBiYXNlIGJ1aWxkZXIgY2xhc3MuXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgYnVpbGRlcnMuXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IEV2ZW50c0VtaXR0ZXIgZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHNcIlxuaW1wb3J0IEtpbmdUYWJsZSBmcm9tIFwiLi4vLi4vc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlXCJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2luZ1RhYmxlQnVpbGRlciBleHRlbmRzIEV2ZW50c0VtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKHRhYmxlKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudGFibGUgPSB0YWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbnMgZm9yIHRoZSBjdXJyZW50IGxhbmd1YWdlIGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBnZXRSZWcoKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICByZXR1cm4gdGFibGUgPyB0YWJsZS5nZXRSZWcoKSA6IEtpbmdUYWJsZS5yZWdpb25hbC5lbjtcbiAgfVxufVxuIiwiLyoqXG4gKiBLaW5nVGFibGUgYmFzZSBIVE1MIGJ1aWxkZXIuXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgSFRNTCBidWlsZGVycy5cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQgUyBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL3N0cmluZ1wiXG5pbXBvcnQgeyBlc2NhcGVIdG1sIH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9odG1sXCJcbmltcG9ydCBLaW5nVGFibGVCdWlsZGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUuYnVpbGRlclwiXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtpbmdUYWJsZUJhc2VIdG1sQnVpbGRlciBleHRlbmRzIEtpbmdUYWJsZUJ1aWxkZXIge1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGF0dHJpYnV0ZSBvYmplY3QgZm9yIGFuIEhUTUwgZWxlbWVudCByZWxhdGVkIHRvIGFuIGl0ZW0uXG4gICAqIFxuICAgKiBAcGFyYW0ge2ludH0gaXggXG4gICAqL1xuICBnZXRJdGVtQXR0ck9iamVjdChpeCwgaXRlbSkge1xuICAgIHZhciBvID0gdGhpcy5vcHRpb25zLCBkZWNvID0gbyAmJiBvLml0ZW1EZWNvcmF0b3I7XG4gICAgdmFyIGF0dHIgPSB7IFxuICAgICAgXCJjbGFzc1wiOiBcImt0LWl0ZW1cIixcbiAgICAgIFwiZGF0YS1pdGVtLWl4XCI6IGl4ICAvLyBpdGVtIGluZGV4IGFtb25nIGN1cnJlbnRseSBkaXNwbGF5ZWQgaXRlbXNcbiAgICB9O1xuICAgIGlmIChkZWNvKSB7XG4gICAgICB2YXIgcmUgPSBkZWNvLmNhbGwodGhpcywgaXRlbSk7XG4gICAgICAvLyBUT0RPOiBtZXJnZSBjbGFzcyBvciBjc3Mgb3B0aW9uXG4gICAgICByZXR1cm4gXy5leHRlbmQoYXR0ciwgcmUpO1xuICAgIH1cbiAgICByZXR1cm4gYXR0cjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9kdWNlcyBhIGZyYWdtZW50IG9mIEhUTUwgdG8gaGlnaGxpZ2ggYSBwYXR0ZXJuIGluc2lkZSBhIHRleHQuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0OiB0ZXh0IGZyb20gd2hpY2ggdG8gcHJvZHVjZSBhbiBIVE1MIGZyYWdtZW50LlxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcGF0dGVybjogc2VhcmNoIHBhdHRlcm4uXG4gICAqL1xuICBoaWdobGlnaHQodGV4dCwgcGF0dGVybikge1xuICAgIGlmICghdGV4dCkgcmV0dXJuIFwiXCI7XG4gICAgaWYgKCEocGF0dGVybiBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgIC8vIG9idGFpbiBmcm9tIHRhYmxlXG4gICAgICB2YXIgdGFibGUgPSB0aGlzLnRhYmxlO1xuICAgICAgdmFyIHBhdHRlcm4gPSB0YWJsZS5zZWFyY2hUZXh0ID8gdGFibGUuZmlsdGVycy5nZXRSdWxlQnlLZXkoXCJzZWFyY2hcIikudmFsdWUgOiBudWxsO1xuICAgICAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICB2YXIgZGlhY3JpdGljcyA9IFMuZmluZERpYWNyaXRpY3ModGV4dCk7XG4gICAgdmFyIGhhc0RpYWNyaXRpY3MgPSBkaWFjcml0aWNzLmxlbmd0aCwgdGV4dFdpdGhvdXREaWFjcml0aWNzO1xuXG4gICAgaWYgKGhhc0RpYWNyaXRpY3MpIHtcbiAgICAgIC8vIHJlbW92ZSBkaWFjcml0aWNzIGJlZm9yZSBmaW5kaW5nIG1hdGNoZXNcbiAgICAgIHRleHRXaXRob3V0RGlhY3JpdGljcyA9IFMubm9ybWFsaXplKHRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXh0V2l0aG91dERpYWNyaXRpY3MgPSB0ZXh0O1xuICAgIH1cbiAgICAvLyBmaW5kIGFsbCBtYXRjaGVzIGF0IHRoZWlyIGluZGV4LCB0aGlzIGlzIHJlcXVpcmVkIHRvIHByb3Blcmx5IGVzY2FwZSBodG1sIGNoYXJhY3RlcnNcbiAgICB2YXIgbWF0Y2hlcyA9IFtdO1xuICAgIHRleHRXaXRob3V0RGlhY3JpdGljcy5yZXBsYWNlKHBhdHRlcm4sIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIGluZGV4ID0gYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGgtMl07XG4gICAgICAvLyBOQjogaWYgdGhlIHN0cmluZyBjb250YWluZWQgZGlhY3JpdGljcywgd2UgbmVlZCB0byByZXN0b3JlXG4gICAgICAvLyBvbmx5IHRob3NlIHRoYXQgYXBwZWFyZWQgaW4gdGhlIHNhbWUgcGxhY2Ugb2YgdGhlIG9yaWdpbmFsIHN0cmluZ1xuICAgICAgbWF0Y2hlcy5wdXNoKHtcbiAgICAgICAgaTogaW5kZXgsXG4gICAgICAgIHZhbDogaGFzRGlhY3JpdGljcyA/IFMucmVzdG9yZURpYWNyaXRpY3ModmFsdWUsIGRpYWNyaXRpY3MsIGluZGV4KSA6IHZhbHVlIC8vIHB1dCBiYWNrIGRpYWNyaXRpY3Mgd2hlcmUgdGhleSB3ZXJlXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBzID0gXCJcIiwgaiA9IDAsIG0sIHZhbDtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1hdGNoZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBtID0gbWF0Y2hlc1tpXTtcbiAgICAgIHZhbCA9IG0udmFsO1xuICAgICAgdmFyIHBvcnRpb24gPSB0ZXh0LnN1YnN0cmluZyhqLCBtLmkpO1xuICAgICAgcyArPSBlc2NhcGVIdG1sKHBvcnRpb24pOyAvLyBlc2NhcGUgdGhlIHBvcnRpb24gdGhhdCBpcyBvdXRzaWRlIG9mIHRoZSBoaWdobGlnaHRcbiAgICAgIGogPSBtLmkgKyB2YWwubGVuZ3RoO1xuICAgICAgcyArPSBcIjxzcGFuIGNsYXNzPVxcXCJrdC1zZWFyY2gtaGlnaGxpZ2h0XFxcIj5cIiArIGVzY2FwZUh0bWwodmFsKSArIFwiPC9zcGFuPlwiO1xuICAgIH1cbiAgICBpZiAoaiA8IHRleHQubGVuZ3RoKSB7XG4gICAgICBzICs9IGVzY2FwZUh0bWwodGV4dC5zdWJzdHIoaikpO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxufVxuIiwiLyoqXG4gKiBLaW5nVGFibGUgYmFyZSBIVE1MIGJ1aWxkZXIuXG4gKiBSZW5kZXJzIHRhYnVsYXIgZGF0YSBpbiBIVE1MIGZvcm1hdCwgd2l0aG91dCBldmVudCBoYW5kbGVycy5cbiAqIFN1aXRhYmxlIGZvciB3ZWIgcGFnZXMgYW5kIGVtYWlscy5cbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgeyBWSHRtbEVsZW1lbnQsIFZUZXh0RWxlbWVudCwgVkNvbW1lbnRFbGVtZW50LCBWV3JhcHBlckVsZW1lbnQsIFZIdG1sRnJhZ21lbnQsIGVzY2FwZUh0bWwgfSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kYXRhL2h0bWxcIlxuaW1wb3J0IEtpbmdUYWJsZUJhc2VIdG1sQnVpbGRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmh0bWwuYmFzZS5idWlsZGVyXCJcbmltcG9ydCByYWlzZSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9yYWlzZVwiXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQgJCBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kb21cIlxuY29uc3QgU1BBQ0UgPSBcIiBcIlxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLaW5nVGFibGVIdG1sQnVpbGRlciBleHRlbmRzIEtpbmdUYWJsZUJhc2VIdG1sQnVpbGRlciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgS2luZ1RhYmxlSHRtbEJ1aWxkZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiB0YWJsZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRhYmxlKSB7XG4gICAgc3VwZXIodGFibGUpXG4gICAgdGhpcy5vcHRpb25zID0gXy5leHRlbmQoe30sIHRhYmxlID8gdGFibGUub3B0aW9ucyA6IG51bGwpO1xuICAgIHRoaXMuc2V0TGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogR2xvYmFsIG9wdGlvbnMgZm9yIGV2ZXJ5IEtpbmdUYWJsZUh0bWxCdWlsZGVyLlxuICAgKi9cbiAgc3RhdGljIGdldCBvcHRpb25zKCkge1xuICAgIHJldHVybiB7XG4gICAgICBoYW5kbGVMb2FkaW5nSW5mbzogdHJ1ZSwgLy8gd2hldGhlciB0byBkaXNwbGF5IGxvYWRpbmcgaW5mb3JtYXRpb24gKHN1aXRhYmxlIGZvciBjb25zb2xlIGFwcGxpY2F0aW9ucylcbiAgICAgIGxvYWRJbmZvRGVsYXk6IDUwMCwgICAgICAvLyBob3cgbWFueSBtaWxsaXNlY29uZHMgc2hvdWxkIHdhaXQsIGJlZm9yZSBkaXNwbGF5aW5nIHRoZSBcIkxvYWRpbmcuLi5cIiBpbmZvcm1hdGlvblxuICAgICAgcGFnaW5hdGlvbkluZm86IHRydWUgICAgIC8vIHdoZXRoZXIgdG8gc2hvdyBwYWdpbmF0aW9uIGluZm8gb3Igbm90XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxpc3RlbmVycyBmb3IgdGhlIGdpdmVuIHRhYmxlLlxuICAgKi9cbiAgc2V0TGlzdGVuZXJzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdGFibGUgPSBzZWxmLnRhYmxlO1xuICAgIGlmICghdGFibGUgfHwgIXRhYmxlLmVsZW1lbnQpIHJldHVybiBzZWxmO1xuXG4gICAgc2VsZi5saXN0ZW5Ubyh0YWJsZSwge1xuICAgICAgXCJmZXRjaGluZzpkYXRhXCI6ICgpID0+IHtcbiAgICAgICAgc2VsZi5sb2FkaW5nSGFuZGxlcigpO1xuICAgICAgfSxcbiAgICAgIFwiZmV0Y2hlZDpkYXRhXCI6ICgpID0+IHtcbiAgICAgICAgc2VsZi51bnNldExvYWRpbmdIYW5kbGVyKCk7XG4gICAgICB9LFxuICAgICAgXCJmZXRjaDpmYWlsXCI6ICgpID0+IHtcbiAgICAgICAgc2VsZi51bnNldExvYWRpbmdIYW5kbGVyKCkuZGlzcGxheShzZWxmLmVycm9yVmlldygpKTtcbiAgICAgIH0sXG4gICAgICBcIm5vLXJlc3VsdHNcIjogKCkgPT4ge1xuICAgICAgICBzZWxmLnVuc2V0TG9hZGluZ0hhbmRsZXIoKS5kaXNwbGF5KHNlbGYuZW1wdHlWaWV3KCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYXV0by1nZW5lcmF0ZWQgZmllbGRzIGJ5IG9wdGlvbnMuXG4gICAqL1xuICBnZXRHZW5lcmF0ZWRGaWVsZHMoKSB7XG4gICAgdmFyIG8gPSB0aGlzLm9wdGlvbnMsXG4gICAgICByZWcgPSB0aGlzLmdldFJlZygpLFxuICAgICAgZGV0YWlsUm91dGUgPSBvLmRldGFpbFJvdXRlLFxuICAgICAgYSA9IFtdLFxuICAgICAgZ29Ub0RldGFpbHMgPSByZWcuZ29Ub0RldGFpbHM7XG5cbiAgICBpZiAoZGV0YWlsUm91dGUpIHtcbiAgICAgIGlmICghL1xcLyQvLnRlc3QoZGV0YWlsUm91dGUpKSB7XG4gICAgICAgIGRldGFpbFJvdXRlID0gby5kZXRhaWxSb3V0ZSA9IGRldGFpbFJvdXRlICsgXCIvXCI7XG4gICAgICB9XG4gICAgICAvLyBGb2xsb3dpbmcgY291bGQgY2F1c2UgZXhjZXB0aW9uIGlmIGlkIHByb3BlcnR5IGNhbm5vdCBiZSBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHlcbiAgICAgIHZhciBpZFByb3BlcnR5ID0gdGhpcy50YWJsZS5nZXRJZFByb3BlcnR5KCk7XG5cbiAgICAgIGEucHVzaCh7XG4gICAgICAgIG5hbWU6IFwiZGV0YWlscy1saW5rXCIsXG4gICAgICAgIGh0bWw6IGl0ZW0gPT4ge1xuICAgICAgICAgIHZhciBpdGVtRGV0YWlsUm91dGUgPSBkZXRhaWxSb3V0ZSArIGl0ZW1baWRQcm9wZXJ0eV07XG4gICAgICAgICAgcmV0dXJuIGA8YSBjbGFzcz0na3QtZGV0YWlscy1saW5rJyBocmVmPScke2l0ZW1EZXRhaWxSb3V0ZX0nPiR7Z29Ub0RldGFpbHN9PC9hPmA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBmaWVsZHMgdG8gYmUgZGlzcGxheWVkLlxuICAgKiBGaWVsZHMgY29tcHJpc2VzIG9iamVjdHMgcHJvcGVydGllcyBhbmQgZXh0cmEgaW5mb3JtYXRpb24gZm9yIGV2ZXJ5IGl0ZW0uXG4gICAqL1xuICBnZXRGaWVsZHMoKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgZmllbGRzID0gXy5jbG9uZSh0YWJsZS5jb2x1bW5zKSxcbiAgICAgICAgbyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgaXRlbUNvdW50ID0gby5pdGVtQ291bnQsXG4gICAgICAgIGdlbmVyYXRlZEZpZWxkcyA9IHRoaXMuZ2V0R2VuZXJhdGVkRmllbGRzKCksXG4gICAgICAgIGNvdW50RmllbGQgPSBpdGVtQ291bnQgPyB7XG4gICAgICAgICAgbmFtZTogXCLOtV9yb3dcIixcbiAgICAgICAgICBkaXNwbGF5TmFtZTogXCIjXCJcbiAgICAgICAgfSA6IG51bGw7XG5cbiAgICBpZiAoY291bnRGaWVsZCkge1xuICAgICAgZmllbGRzLnVuc2hpZnQoY291bnRGaWVsZCk7XG4gICAgfVxuXG4gICAgLy8gYWxsb3cgZXh0ZW5kaW5nIHRoZSB0YWJsZSB3aXRoIGV4dHJhIGZpZWxkc1xuICAgIHZhciBleHRyYUZpZWxkcyA9IG8uZmllbGRzO1xuICAgIGlmIChleHRyYUZpZWxkcykge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihleHRyYUZpZWxkcykpIHtcbiAgICAgICAgZXh0cmFGaWVsZHMgPSBleHRyYUZpZWxkcy5jYWxsKHRoaXMsIGZpZWxkcyk7XG4gICAgICB9XG4gICAgICBmaWVsZHMgPSBnZW5lcmF0ZWRGaWVsZHMuY29uY2F0KGV4dHJhRmllbGRzLmNvbmNhdChmaWVsZHMpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmllbGRzID0gZ2VuZXJhdGVkRmllbGRzLmNvbmNhdChmaWVsZHMpO1xuICAgIH1cbiAgICByZXR1cm4gZmllbGRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgZ2l2ZW4gaW5zdGFuY2Ugb2YgS2luZ1RhYmxlIGluIEhUTUwuXG4gICAqL1xuICBidWlsZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHRhYmxlID0gc2VsZi50YWJsZTtcbiAgICB2YXIgZGF0YSA9IHRhYmxlLmdldERhdGEoe1xuICAgICAgZm9ybWF0OiB0cnVlLFxuICAgICAgaGlkZTogZmFsc2VcbiAgICB9KTtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gc2VsZi5kaXNwbGF5KHNlbGYuZW1wdHlWaWV3KCkpXG4gICAgfVxuICAgIHZhciBmaWVsZHMgPSBzZWxmLmdldEZpZWxkcygpO1xuICAgIHZhciBjYXB0aW9uID0gc2VsZi5idWlsZENhcHRpb24oKTtcbiAgICB2YXIgdmlldyA9IHNlbGYuYnVpbGRWaWV3KGZpZWxkcywgZGF0YSk7XG4gICAgdmFyIHJvb3QgPSBzZWxmLmJ1aWxkUm9vdChjYXB0aW9uLCB2aWV3KTtcbiAgICBzZWxmLmRpc3BsYXkocm9vdCk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgcm9vdCB2aXJ0dWFsIGVsZW1lbnQgZm9yIHRoZSBnaXZlbiB0YWJsZSwgd2l0aCBnaXZlblxuICAgKiB0YWJsZSBjaGlsZHJlbi5cbiAgICovXG4gIGJ1aWxkUm9vdChjYXB0aW9uLCB2aWV3KSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgcm9vdEF0dHIgPSB7XG4gICAgICBcImNsYXNzXCI6IFwia2luZy10YWJsZS1yZWdpb25cIlxuICAgIH07XG4gICAgaWYgKHRhYmxlLmlkKSB7XG4gICAgICByb290QXR0ci5pZCA9IHRhYmxlLmlkO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCByb290QXR0ciwgW1xuICAgICAgY2FwdGlvbixcbiAgICAgIHZpZXdcbiAgICBdKVxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhIGRlZmF1bHQgdmlldy5cbiAgICovXG4gIGJ1aWxkVmlldyhmaWVsZHMsIGRhdGEpIHtcbiAgICB2YXIgdGFibGUgPSB0aGlzLnRhYmxlO1xuICAgIHJldHVybiBuZXcgVkh0bWxFbGVtZW50KFwidGFibGVcIiwge1xuICAgICAgXCJjbGFzc1wiOiBcImtpbmctdGFibGVcIlxuICAgIH0sIFtcbiAgICAgIHRoaXMuYnVpbGRIZWFkKGZpZWxkcyksXG4gICAgICB0aGlzLmJ1aWxkQm9keShmaWVsZHMsIGRhdGEpXG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgaGVhZGVyLlxuICAgKi9cbiAgYnVpbGRIZWFkKGZpZWxkcykge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGU7XG4gICAgdmFyIHJvdyA9IG5ldyBWSHRtbEVsZW1lbnQoXCJ0clwiLCB7fSwgXy5tYXAoXy52YWx1ZXMoZmllbGRzKSwgcHJvcCA9PiB7XG4gICAgICBpZiAocHJvcC5oaWRkZW4gfHwgcHJvcC5zZWNyZXQpIHtcbiAgICAgICAgcmV0dXJuOyAvLyBza2lwXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcInRoXCIsIHtcImNsYXNzXCI6IHByb3AuY3NzfSwgbmV3IFZUZXh0RWxlbWVudChwcm9wLmRpc3BsYXlOYW1lKSk7XG4gICAgfSkpO1xuICAgIHJldHVybiBuZXcgVkh0bWxFbGVtZW50KFwidGhlYWRcIiwge1wiY2xhc3NcIjogXCJraW5nLXRhYmxlLWhlYWRcIn0sIHJvdyk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgdGFibGUgYm9keSBpbiBIVE1MIGZyb20gZ2l2ZW4gdGFibGUgYW5kIGRhdGEuXG4gICAqL1xuICBidWlsZEJvZHkoZmllbGRzLCBkYXRhKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZSxcbiAgICAgICAgYnVpbGRlciA9IHRhYmxlLmJ1aWxkZXIsXG4gICAgICAgIGZvcm1hdHRlZFN1ZmZpeCA9IHRhYmxlLm9wdGlvbnMuZm9ybWF0dGVkU3VmZml4LFxuICAgICAgICBzZWFyY2hQYXR0ZXJuID0gdGFibGUuc2VhcmNoVGV4dCA/IHRhYmxlLmZpbHRlcnMuZ2V0UnVsZUJ5S2V5KFwic2VhcmNoXCIpLnZhbHVlIDogbnVsbCxcbiAgICAgICAgYXV0b0hpZ2hsaWdodCA9IHRhYmxlLm9wdGlvbnMuYXV0b0hpZ2hsaWdodFNlYXJjaFByb3BlcnRpZXM7XG4gICAgLy8gYXQgZXZlcnkgdGFibGUgYnVpbGQsIGFzc2lnbiBhbiBpZCB0byB0aGUgcmVwcmVzZW50ZWQgaXRlbVxuICAgIHZhciBpeCA9IC0xO1xuICAgIHZhciByb3dzID0gXy5tYXAoZGF0YSwgaXRlbSA9PiB7XG4gICAgICBpeCArPSAxO1xuICAgICAgaXRlbS5fX2l4X18gPSBpeDtcbiAgICAgIHZhciBjZWxscyA9IFtdLCB4LCBjb2w7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZpZWxkcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29sID0gZmllbGRzW2ldO1xuICAgICAgICB4ID0gY29sLm5hbWU7XG4gICAgICAgIGlmIChjb2wuaGlkZGVuIHx8IGNvbC5zZWNyZXQpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm9ybWF0dGVkUHJvcCA9IHggKyBmb3JtYXR0ZWRTdWZmaXg7XG5cbiAgICAgICAgdmFyIHZhbHVlRWwsIHZhbHVlID0gXy5oYXMoaXRlbSwgZm9ybWF0dGVkUHJvcCkgPyBpdGVtW2Zvcm1hdHRlZFByb3BdIDogaXRlbVt4XTtcblxuICAgICAgICAvLyBkb2VzIHRoZSBjb2x1bW4gZGVmaW5lIGFuIGh0bWwgcmVzb2x2ZXI/XG4gICAgICAgIGlmIChjb2wuaHRtbCkge1xuICAgICAgICAgIGlmICghXy5pc0Z1bmN0aW9uKGNvbC5odG1sKSkge1xuICAgICAgICAgICAgcmFpc2UoMjQsIFwiSW52YWxpZCAnaHRtbCcgb3B0aW9uIGZvciBwcm9wZXJ0eSwgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTkI6IGl0IGlzIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSB1c2VyIG9mIHRoZSBsaWJyYXJ5IHRvIGVzY2FwZSBIVE1MIGNoYXJhY3RlcnMgdGhhdCBuZWVkIHRvIGJlIGVzY2FwZWRcbiAgICAgICAgICB2YXIgaHRtbCA9IGNvbC5odG1sLmNhbGwoYnVpbGRlciwgaXRlbSwgdmFsdWUpO1xuICAgICAgICAgIHZhbHVlRWwgPSBuZXcgVkh0bWxGcmFnbWVudChodG1sIHx8IFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBcIlwiKSB7XG4gICAgICAgICAgICB2YWx1ZUVsID0gbmV3IFZUZXh0RWxlbWVudChcIlwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaXMgYSBzZWFyY2ggYWN0aXZlP1xuICAgICAgICAgICAgaWYgKHNlYXJjaFBhdHRlcm4gJiYgYXV0b0hpZ2hsaWdodCAmJiBfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICAgICAgICAvLyBhbiBodG1sIGZyYWdtZW50IGlzIHJlcXVpcmVkIHRvIGRpc3BsYXkgYW4gaGlnaGxpZ2h0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgdmFsdWVFbCA9IG5ldyBWSHRtbEZyYWdtZW50KGJ1aWxkZXIuaGlnaGxpZ2h0KHZhbHVlLCBzZWFyY2hQYXR0ZXJuKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YWx1ZUVsID0gbmV3IFZUZXh0RWxlbWVudCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2VsbHMucHVzaChuZXcgVkh0bWxFbGVtZW50KFwidGRcIiwgY29sID8ge1xuICAgICAgICAgIFwiY2xhc3NcIjogY29sLmNzcyB8fCBjb2wubmFtZVxuICAgICAgICB9IDoge30sIHZhbHVlRWwpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJ0clwiLCB0aGlzLmdldEl0ZW1BdHRyT2JqZWN0KGl4LCBpdGVtKSwgY2VsbHMpO1xuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJ0Ym9keVwiLCB7XCJjbGFzc1wiOiBcImtpbmctdGFibGUtYm9keVwifSwgcm93cyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNhcHRpb24gZWxlbWVudCBmb3IgdGhlIGdpdmVuIHRhYmxlLlxuICAgKi9cbiAgYnVpbGRDYXB0aW9uKCkge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGU7XG4gICAgdmFyIGNhcHRpb24gPSB0YWJsZS5vcHRpb25zLmNhcHRpb247XG4gICAgdmFyIHBhZ2luYXRpb25JbmZvID0gS2luZ1RhYmxlSHRtbEJ1aWxkZXIub3B0aW9ucy5wYWdpbmF0aW9uSW5mb1xuICAgICAgPyB0aGlzLmJ1aWxkUGFnaW5hdGlvbkluZm8oKVxuICAgICAgOiBudWxsO1xuICAgIHJldHVybiBjYXB0aW9uIHx8IHBhZ2luYXRpb25JbmZvID8gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBcImNsYXNzXCI6IFwia2luZy10YWJsZS1jYXB0aW9uXCJcbiAgICB9LCBbXG4gICAgICBjYXB0aW9uID8gbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge30sIG5ldyBWVGV4dEVsZW1lbnQoY2FwdGlvbikpIDogbnVsbCxcbiAgICAgIHBhZ2luYXRpb25JbmZvXG4gICAgICA/IChjYXB0aW9uID8gbmV3IFZIdG1sRWxlbWVudChcImJyXCIpIDogbnVsbClcbiAgICAgIDogbnVsbCwgcGFnaW5hdGlvbkluZm9dKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBwYWdpbmF0aW9uIGluZm9ybWF0aW9uIGFib3V0IHRoZSBnaXZlbiB0YWJsZS5cbiAgICovXG4gIGJ1aWxkUGFnaW5hdGlvbkluZm8oKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgZGF0YSA9IHRhYmxlLnBhZ2luYXRpb24sXG4gICAgICAgIHJlZyA9IHRoaXMuZ2V0UmVnKCksXG4gICAgICAgIHBhZ2UgPSBkYXRhLnBhZ2UsXG4gICAgICAgIHRvdGFsUGFnZUNvdW50ID0gZGF0YS50b3RhbFBhZ2VDb3VudCxcbiAgICAgICAgcmVzdWx0c1BlclBhZ2UgPSBkYXRhLnJlc3VsdHNQZXJQYWdlLFxuICAgICAgICBmaXJzdE9iamVjdE51bWJlciA9IGRhdGEuZmlyc3RPYmplY3ROdW1iZXIsXG4gICAgICAgIGxhc3RPYmplY3ROdW1iZXIgPSBkYXRhLmxhc3RPYmplY3ROdW1iZXIsXG4gICAgICAgIHRvdGFsSXRlbXNDb3VudCA9IGRhdGEudG90YWxJdGVtc0NvdW50LFxuICAgICAgICBkYXRhQW5jaG9yVGltZSA9IHRhYmxlLmdldEZvcm1hdHRlZEFuY2hvclRpbWUoKSxcbiAgICAgICAgaXNOdW0gPSBfLmlzTnVtYmVyO1xuICAgIC8vIHJlbmRlciBzaW1wbHkgcGFnaW5hdGlvbiBpbmZvcm1hdGlvbixcbiAgICAvLyBzaW5jZSBldmVudCBoYW5kbGVycyBhcmUgb3V0IG9mIHRoZSBzY29wZSBvZiB0aGlzIGNsYXNzXG4gICAgdmFyIHMgPSBcIlwiLCBzZXAgPSBcIiAtIFwiO1xuICAgIGlmIChpc051bShwYWdlKSkge1xuICAgICAgcyArPSByZWcucGFnZSArIFNQQUNFICsgcGFnZTtcblxuICAgICAgaWYgKGlzTnVtKHRvdGFsUGFnZUNvdW50KSAmJiB0b3RhbFBhZ2VDb3VudCA+IDApIHtcbiAgICAgICAgcyArPSBTUEFDRSArIHJlZy5vZiArIFNQQUNFICsgdG90YWxQYWdlQ291bnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc051bShmaXJzdE9iamVjdE51bWJlcikgJiYgaXNOdW0obGFzdE9iamVjdE51bWJlcikgJiYgbGFzdE9iamVjdE51bWJlciA+IDApIHtcbiAgICAgICAgcyArPSBzZXAgKyByZWcucmVzdWx0cyArIGAgJHtmaXJzdE9iamVjdE51bWJlcn0gLSAke2xhc3RPYmplY3ROdW1iZXJ9YDtcbiAgICAgICAgaWYgKGlzTnVtKHRvdGFsSXRlbXNDb3VudCkpIHtcbiAgICAgICAgICBzICs9IGAgJHtyZWcub2Z9IC0gJHt0b3RhbEl0ZW1zQ291bnR9YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkYXRhQW5jaG9yVGltZSAmJiB0YWJsZS5vcHRpb25zLnNob3dBbmNob3JUaW1lc3RhbXApIHtcbiAgICAgIHMgKz0gc2VwICsgYCR7cmVnLmFuY2hvclRpbWV9ICR7ZGF0YUFuY2hvclRpbWV9YDtcbiAgICB9XG4gICAgdmFyIHBhZ2luYXRpb25JbmZvID0gbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24taW5mb1wiXG4gICAgfSwgbmV3IFZUZXh0RWxlbWVudChzKSk7XG4gICAgcmV0dXJuIHBhZ2luYXRpb25JbmZvO1xuICB9XG5cbiAgZW1wdHlWaWV3KGJhcmUpIHtcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKTtcbiAgICB2YXIgZWwgPSBuZXcgVkh0bWxFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzXCI6IFwia2luZy10YWJsZS1lbXB0eVwifSxcbiAgICAgIG5ldyBWSHRtbEVsZW1lbnQoXCJzcGFuXCIsIDAsIG5ldyBWVGV4dEVsZW1lbnQocmVnLm5vRGF0YSkpKTtcbiAgICByZXR1cm4gYmFyZSA/IGVsIDogdGhpcy5zaW5nbGVMaW5lKHRoaXMudGFibGUsIGVsKTtcbiAgfVxuXG4gIGVycm9yVmlldyhtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlID0gdGhpcy5nZXRSZWcoKS5lcnJvckZldGNoaW5nRGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuc2luZ2xlTGluZSh0aGlzLnRhYmxlLCBuZXcgVkh0bWxGcmFnbWVudChgPGRpdiBjbGFzcz1cImtpbmctdGFibGUtZXJyb3JcIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwibWVzc2FnZVwiPlxuICAgICAgICA8c3Bhbj4ke21lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cIm9pXCIgZGF0YS1nbHlwaD1cIndhcm5pbmdcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L3NwYW4+XG4gICAgICA8L3NwYW4+XG4gICAgPC9kaXY+YCkpO1xuICB9XG5cbiAgbG9hZGluZ1ZpZXcoKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKVxuICAgIHZhciBjYXB0aW9uID0gdGhpcy5idWlsZENhcHRpb24oKTtcbiAgICBjYXB0aW9uLmNoaWxkcmVuLnB1c2gobmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBcImNsYXNzXCI6IFwibG9hZGluZy1pbmZvXCJcbiAgICB9LCBbbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgXCJjbGFzc1wiOiBcImxvYWRpbmctdGV4dFwiXG4gICAgfSwgbmV3IFZUZXh0RWxlbWVudChyZWcubG9hZGluZykpLCBuZXcgVkh0bWxFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICBcImNsYXNzXCI6IFwibWluaS1sb2FkZXJcIlxuICAgIH0pXSkpO1xuICAgIHJldHVybiB0aGlzLmJ1aWxkUm9vdChbY2FwdGlvbl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgYnVpbHQgdGFibGUuXG4gICAqL1xuICBkaXNwbGF5KGJ1aWx0KSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICAvLyBJZiBhIHRhYmxlIGhhcyBhbiBlbGVtZW50LCBhc3N1bWUgdGhhdCBpcyBhIERPTSBlbGVtZW50O1xuICAgIGlmICghXy5pc1N0cmluZyhidWlsdCkpXG4gICAgICBidWlsdCA9IGJ1aWx0LnRvU3RyaW5nKCk7XG4gICAgLy9cbiAgICAvLyBOQjogYXNpZGUgZnJvbSB0aGlzIHBpZWNlIG9mIGNvZGUsIHRoaXMgY2xhc3MgaXMgYWJzdHJhY3RlZFxuICAgIC8vIGZyb20gRE9NIG1hbmlwdWxhdGlvbjtcbiAgICAvLyBJZiBhIHRhYmxlIGhhcyBhbiBlbGVtZW50LCBhc3N1bWUgdGhhdCBpcyBhIERPTSBlbGVtZW50O1xuICAgIC8vXG4gICAgdmFyIGVsZW1lbnQgPSB0YWJsZS5lbGVtZW50O1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAvL1xuICAgICAgLy8gTkI6IHRoaXMgY2xhc3MgZG9lcyBub3Qgc2V0IGFueSBldmVudCBoYW5kbGVyLFxuICAgICAgLy8gaGVuY2UgZG9lcyBub3QgdHJ5IHRvIHVuc2V0IGFueSBldmVudCBoYW5kbGVyIHdoZW4gcmVtb3ZpbmcgYW4gZWxlbWVudC5cbiAgICAgIC8vXG4gICAgICAvLyBhIGN1c3RvbSBldmVudCBpcyBmaXJlZCwgc28gdGhlIHVzZXIgb2YgdGhlIGxpYnJhcnkgY2FuIHVuc2V0IGFueSBldmVudCBhZGRlZFxuICAgICAgLy8gYnkgb3RoZXIgbWVhbnMgKGUuZy4gdmFuaWxsYSBKYXZhU2NyaXB0IG9yIGpRdWVyeSlcbiAgICAgIC8vXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJraW5nLXRhYmxlXCIpO1xuICAgICAgdGFibGUuZW1pdChcImVtcHR5OmVsZW1lbnRcIiwgZWxlbWVudCk7XG4gICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICBlbGVtZW50LmlubmVySFRNTCA9IGJ1aWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGluZm9ybWF0aW9uIGZvciB0aGUgdGFibGUgaW4gYSBzaW5nbGUgbGluZSwgaW5jbHVkaW5nXG4gICAqIHRhYmxlIGNhcHRpb24gYW5kIHBhZ2luYXRpb24gaW5mb3JtYXRpb24sIGlmIGF2YWlsYWJsZS5cbiAgICovXG4gIHNpbmdsZUxpbmUobGluZSkge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGU7XG4gICAgdmFyIGNhcHRpb24gPSB0aGlzLmJ1aWxkQ2FwdGlvbigpO1xuICAgIGNhcHRpb24uY2hpbGRyZW4ucHVzaChuZXcgVkh0bWxFbGVtZW50KFwiYnJcIiksIG5ldyBWSHRtbEVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgXCJjbGFzc1wiOiBcImxvYWRpbmctaW5mb1wiXG4gICAgfSwgXy5pc1N0cmluZyhsaW5lKSA/IG5ldyBWVGV4dEVsZW1lbnQobGluZSkgOiBsaW5lKSk7XG4gICAgcmV0dXJuIHRoaXMuYnVpbGRSb290KFtjYXB0aW9uXSk7XG4gIH1cblxuICBsb2FkaW5nSGFuZGxlcigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIHRhYmxlID0gc2VsZi50YWJsZTtcbiAgICBzZWxmLnVuc2V0TG9hZGluZ0hhbmRsZXIoKTtcblxuICAgIHZhciBkZWxheUluZm8gPSB0YWJsZS5oYXNEYXRhKCkgPyBLaW5nVGFibGVIdG1sQnVpbGRlci5vcHRpb25zLmxvYWRJbmZvRGVsYXkgOiAwO1xuICAgIC8vIGRpc3BsYXkgYSBsb2FkaW5nIGluZm9ybWF0aW9uLCBidXQgb25seSBpZiB3YWl0aW5nIGZvciBtb3JlIHRoYW4gbiBtaWxsaXNlY29uZHNcbiAgICBzZWxmLnNob3dMb2FkaW5nVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCF0YWJsZS5sb2FkaW5nKSB7XG4gICAgICAgIHJldHVybiBzZWxmLnVuc2V0TG9hZGluZ0hhbmRsZXIoKTtcbiAgICAgIH1cbiAgICAgIHNlbGYuZGlzcGxheShzZWxmLmxvYWRpbmdWaWV3KCkpO1xuICAgIH0sIGRlbGF5SW5mbylcbiAgfVxuXG4gIHVuc2V0TG9hZGluZ0hhbmRsZXIoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuc2hvd0xvYWRpbmdUaW1lb3V0KTtcbiAgICB0aGlzLnNob3dMb2FkaW5nVGltZW91dCA9IG51bGw7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgb2YgdGhpcyBLaW5nVGFibGVIdG1sQnVpbGRlci5cbiAgICovXG4gIGRpc3Bvc2UoKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgZWxlbWVudCA9IHRhYmxlLmVsZW1lbnQ7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICQuZW1wdHkoZWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuc3RvcExpc3RlbmluZyh0aGlzLnRhYmxlKTtcbiAgICB0aGlzLnRhYmxlID0gbnVsbDtcbiAgICBkZWxldGUgdGhpcy5vcHRpb25zO1xuICB9XG59XG4iLCIvKipcbiAqIEtpbmdUYWJsZSBjb3JlIGNsYXNzLlxuICogVGhpcyBjbGFzcyBpcyByZXNwb25zaWJsZSBvZiBmZXRjaGluZyBkYXRhLCBoYW5kbGluZyByZXNwb25zZXMsXG4gKiBjb25maWd1cmluZyBjb2x1bW5zLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IEtpbmdUYWJsZVRleHRCdWlsZGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUudGV4dC5idWlsZGVyXCJcbmltcG9ydCBLaW5nVGFibGVIdG1sQnVpbGRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmh0bWwuYnVpbGRlclwiXG5pbXBvcnQgS2luZ1RhYmxlQmFzZUh0bWxCdWlsZGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUuaHRtbC5iYXNlLmJ1aWxkZXJcIlxuaW1wb3J0IEtpbmdUYWJsZVJpY2hIdG1sQnVpbGRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLnJodG1sLmJ1aWxkZXJcIlxuaW1wb3J0IEtpbmdUYWJsZVJlZ2lvbmFsIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUucmVnaW9uYWxcIlxuaW1wb3J0IEV2ZW50c0VtaXR0ZXIgZnJvbSBcIi4uLy4uL3NjcmlwdHMvY29tcG9uZW50cy9ldmVudHNcIlxuaW1wb3J0IEFuYWx5emVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RhdGEvb2JqZWN0LWFuYWx5emVyXCJcbmltcG9ydCBTYW5pdGl6ZXIgZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9zYW5pdGl6ZXJcIlxuaW1wb3J0IEZpbHRlcnNNYW5hZ2VyIGZyb20gXCIuLi8uLi9zY3JpcHRzL2ZpbHRlcnMvZmlsdGVycy1tYW5hZ2VyXCJcbmltcG9ydCBQYWdpbmF0b3IgZnJvbSBcIi4uLy4uL3NjcmlwdHMvZmlsdGVycy9wYWdpbmF0b3JcIlxuaW1wb3J0IGFqYXggZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9hamF4XCJcbmltcG9ydCByYWlzZSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9yYWlzZVwiXG5pbXBvcnQgXyBmcm9tIFwiLi4vLi4vc2NyaXB0cy91dGlsc1wiXG5pbXBvcnQgUyBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL3N0cmluZ1wiXG5pbXBvcnQgUiBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL3JlZ2V4XCJcbmltcG9ydCBOIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvbnVtYmVyXCJcbmltcG9ydCBEIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvZGF0ZVwiXG5pbXBvcnQgQSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9jb21wb25lbnRzL2FycmF5XCJcbmltcG9ydCBjc3YgZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9jc3ZcIlxuaW1wb3J0IGpzb24gZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9qc29uXCJcbmltcG9ydCB4bWwgZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS94bWxcIlxuaW1wb3J0IEZpbGVVdGlsIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RhdGEvZmlsZVwiXG5pbXBvcnQgbHJ1X2NhY2hlIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RhdGEvbHJ1XCJcbmltcG9ydCBNZW1TdG9yZSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9kYXRhL21lbXN0b3JlXCJcbmltcG9ydCB7XG4gIEFyZ3VtZW50RXhjZXB0aW9uLFxuICBBcmd1bWVudE51bGxFeGNlcHRpb24sXG4gIE9wZXJhdGlvbkV4Y2VwdGlvblxufSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9leGNlcHRpb25zXCJcbmNvbnN0IFZFUlNJT04gPSBcIjIuMC4wXCJcblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIFxuICAvLyBUYWJsZSBsYW5ndWFnZS5cbiAgbGFuZzogXCJlblwiLFxuXG4gIC8vIFRhYmxlIGNhcHRpb24uXG4gIGNhcHRpb246IG51bGwsXG5cbiAgLy8gV2hldGhlciB0byBkaXNwbGF5IHRoZSBpdGVtIG51bWJlciBvciBub3QuXG4gIGl0ZW1Db3VudDogdHJ1ZSxcblxuICAvLyBEZWZhdWx0IHNjaGVtYSBmb3IgZWFjaCB0YWJsZSBjb2x1bW4uXG4gIGNvbHVtbkRlZmF1bHQ6IHtcbiAgICBuYW1lOiBcIlwiLFxuICAgIHR5cGU6IFwidGV4dFwiLFxuICAgIHNvcnRhYmxlOiB0cnVlLFxuICAgIGFsbG93U2VhcmNoOiB0cnVlLFxuICAgIGhpZGRlbjogZmFsc2VcbiAgICAvLyBzZWNyZXQ6IHVuZGVmaW5lZFxuICAgIC8vIGZvcm1hdDogdW5kZWZpbmVkIChhbGxvd3MgdG8gZGVmaW5lIGZvcm1hdHRpbmcgZnVuY3Rpb24pIFxuICB9LFxuXG4gIGh0dHBNZXRob2Q6IFwiR0VUXCIsIC8vIG1ldGhvZCB0byB1c2UgdG8gZmV0Y2ggZGF0YSwgd2hlbiB1c2luZyBBSkFYIHJlcXVlc3RzXG5cbiAgLy8gV2hldGhlciB0byBhbGxvdyBzZWFyY2gsIG9yIG5vdC5cbiAgYWxsb3dTZWFyY2g6IHRydWUsXG5cbiAgLy8gTWluaW11bSBudW1iZXIgb2YgY2hhcmFjdGVycyBpbnNpZGUgdGhlIHNlYXJjaCBmaWVsZCB0byB0cmlnZ2VyIGEgc2VhcmNoLlxuICBtaW5TZWFyY2hDaGFyczogMyxcblxuICAvLyBEZWZhdWx0IGZpcnN0IHBhZ2UuXG4gIHBhZ2U6IDEsXG5cbiAgLy8gRGVmYXVsdCBwYWdlIHNpemVcbiAgcmVzdWx0c1BlclBhZ2U6IDMwLFxuXG4gIC8vIFN1ZmZpeCB0byB1c2UgZm9yIGZvcm1hdHRlZCBwcm9wZXJ0aWVzXG4gIGZvcm1hdHRlZFN1ZmZpeDogXCJfKGZvcm1hdHRlZClcIixcblxuICAvLyBQZXJtaXRzIHRvIHNwZWNpZnkgd2hldGhlciB0aGUgY29sbGVjdGlvbiBpcyBmaXhlZCBvciBub3RcbiAgLy8gZGVmYXVsdCBjaGFuZ2VzIGlmIHRoZSB0YWJsZSBpcyBpbnN0YW50aWF0ZWQgcGFzc2luZyBhIGNvbGxlY3Rpb25cbiAgZml4ZWQ6IHVuZGVmaW5lZCxcblxuICAvLyBQZXJtaXRzIHRvIHNwZWNpZnkgYW4gaW5pdGlhbCBzZWFyY2ggd2hlbiBnZW5lcmF0aW5nIHRoZSB0YWJsZSBmb3IgdGhlIGZpcnN0IHRpbWVcbiAgc2VhcmNoOiBcIlwiLFxuXG4gIC8vIFBlcm1pdHMgdG8gc3BlY2lmeSBob3cgc29ydCBieSBpbmZvcm1hdGlvbiBtdXN0IGJlIHRyYW5zbWl0dGVkXG4gIHNvcnRCeUZvcm1hdHRlcjogQS5odW1hblNvcnRCeSxcblxuICAvLyBQZXJtaXRzIHRvIHNwZWNpZnkgdGhlIHNlYXJjaCBtb2RlIHRvIHVzZSBkdXJpbmcgbGl2ZSBzZWFyY2hcbiAgLy8gRnVsbFN0cmluZywgU3BsaXRXb3JkcyBvciBTcGxpdFNlbnRlbmNlc1xuICBzZWFyY2hNb2RlOiBcIkZ1bGxTdHJpbmdcIixcblxuICAvLyBEZWZhdWx0IGV4cG9ydCBmb3JtYXRzLlxuICBleHBvcnRGb3JtYXRzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJDc3ZcIixcbiAgICAgIGZvcm1hdDogXCJjc3ZcIixcbiAgICAgIHR5cGU6IFwidGV4dC9jc3ZcIixcbiAgICAgIGNzOiB0cnVlICAvLyBjbGllbnQgc2lkZVxuICAgIH0sXG4gICAge1xuICAgICAgbmFtZTogXCJKc29uXCIsXG4gICAgICBmb3JtYXQ6IFwianNvblwiLFxuICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICBjczogdHJ1ZSAgLy8gY2xpZW50IHNpZGVcbiAgICB9LFxuICAgIHtcbiAgICAgIG5hbWU6IFwiWG1sXCIsXG4gICAgICBmb3JtYXQ6IFwieG1sXCIsXG4gICAgICB0eXBlOiBcInRleHQveG1sXCIsXG4gICAgICBjczogdHJ1ZSAgLy8gY2xpZW50IHNpZGVcbiAgICB9XG4gIF0sXG5cbiAgLy8gV2hldGhlciB0byBwcmV0dGlmeSB4bWwgd2hlbiBleHBvcnRpbmcsIG9yIG5vdC5cbiAgcHJldHR5WG1sOiB0cnVlLFxuXG4gIC8vIEFsbG93cyB0byBzcGVjaWZ5IGNzdiBzZXJpYWxpemF0aW9uIG9wdGlvbnNcbiAgY3N2T3B0aW9uczoge30sXG5cbiAgLy8gV2hldGhlciB0byBpbmNsdWRlIGhpZGRlbiBwcm9wZXJ0aWVzIGluIHRoZSBleHBvcnQ7IG9yIG5vdC5cbiAgZXhwb3J0SGlkZGVuUHJvcGVydGllczogZmFsc2UsXG5cbiAgLy8gS2luZCBvZiBidWlsZGVyLlxuICBidWlsZGVyOiBcInJodG1sXCIsXG5cbiAgLy8gV2hldGhlciB0byBzdG9yZSBkYXRhIHJldHVybmVkIGJ5IGBnZXRUYWJsZURhdGFgIGZ1bmN0aW9uLCBvciBub3QuXG4gIC8vIElmIHRydWUsIGRhdGEgaXMgc3RvcmVkIGluIG1lbW9yeSBhbmQgaW4gZGF0YSBzdG9yYWdlIGZvciBsYXRlciB1c2UuXG4gIHN0b3JlVGFibGVEYXRhOiB0cnVlLFxuXG4gIC8vIFRoZSBMUlUgY2FjaGUgc2l6ZSAoaG93IG1hbnkgaXRlbXMgcGVyIGtleSBjYW4gYmUgc3RvcmVkKS5cbiAgbHJ1Q2FjaGVTaXplOiAxMCxcblxuICAvLyBUaGUgTFJVIGNhY2hlIG1heCBhZ2UgaW4gbWlsbGlzZWNvbmRzIC0gZGVmYXVsdCAxNSBtaW51dGVzOyAoPD0gMCBmb3Igbm8gZXhwaXJhdGlvbikuXG4gIGxydUNhY2hlTWF4QWdlOiA2MCoxZTMqMTUsXG5cbiAgLy8gV2hldGhlciB0aGUgYW5jaG9yIHRpbWVzdGFtcCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG4gIHNob3dBbmNob3JUaW1lc3RhbXA6IHRydWUsXG5cbiAgY29sbGVjdGlvbk5hbWU6IFwiZGF0YVwiLFxuXG4gIC8vIFdoZW4gdGV4dCBzZWFyY2ggaXMgdXNlZCwgaXRzIHNvcnQgbG9naWMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIHRoZSBzb3J0IGNyaXRlcmlhIGRlZmluZWQgY2xpY2tpbmcgb24gY29sdW1ucy5cbiAgc2VhcmNoU29ydGluZ1J1bGVzOiB0cnVlLFxuXG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIGlkLlxuICBpZFByb3BlcnR5OiBudWxsLFxuXG4gIC8vIFdoZXRoZXIgc2VhcmNoZWQgdmFsdWVzIHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGhpZ2hsaWdodGVkXG4gIGF1dG9IaWdobGlnaHRTZWFyY2hQcm9wZXJ0aWVzOiB0cnVlLFxuXG4gIC8vIFZhbHVlIHRvIHVzZSBmb3IgcmVwcmVzZW50IG51bGwgb3IgZW1wdHkgdmFsdWVzLlxuICBlbXB0eVZhbHVlOiBcIlwiXG59XG5cbmNvbnN0IEJVSUxERVJTID0ge1xuICBcInRleHRcIjogS2luZ1RhYmxlVGV4dEJ1aWxkZXIsXG4gIFwiaHRtbFwiOiBLaW5nVGFibGVIdG1sQnVpbGRlcixcbiAgXCJyaHRtbFwiOiBLaW5nVGFibGVSaWNoSHRtbEJ1aWxkZXJcbn07XG5cbmNvbnN0IFVOREVGSU5FRCA9IFwidW5kZWZpbmVkXCI7XG5cbmlmICh0eXBlb2YgUHJvbWlzZSA9PSBVTkRFRklORUQpIHtcbiAgdmFyIGZpeGVkID0gZmFsc2U7XG4gIC8vIGNoZWNrIGlmIEVTNlByb21pc2Ugd2FzIGxvYWRlZFxuICBpZiAodHlwZW9mIEVTNlByb21pc2UgIT0gVU5ERUZJTkVEICYmIEVTNlByb21pc2UucG9seWZpbGwpIHtcbiAgICB0cnkge1xuICAgICAgRVM2UHJvbWlzZS5wb2x5ZmlsbCgpO1xuICAgICAgZml4ZWQgPSB0eXBlb2YgUHJvbWlzZSAhPSBVTkRFRklORUQ7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8vIGlnbm9yZVxuICAgIH1cbiAgfVxuICBpZiAoIWZpeGVkKSB7XG4gICAgcmFpc2UoMSwgXCJNaXNzaW5nIGltcGxlbWVudGF0aW9uIG9mIFByb21pc2UgKG1pc3NpbmcgZGVwZW5kZW5jeSlcIilcbiAgfVxufVxuXG5jbGFzcyBLaW5nVGFibGUgZXh0ZW5kcyBFdmVudHNFbWl0dGVyIHtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBLaW5nVGFibGUgd2l0aCB0aGUgZ2l2ZW4gb3B0aW9ucyBhbmQgc3RhdGljIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zOiBvcHRpb25zIHRvIHVzZSBmb3IgdGhpcyBpbnN0YW5jZSBvZiBLaW5nVGFibGUuXG4gICAqIEBwYXJhbSBzdGF0aWNQcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzIHRvIG92ZXJyaWRlIGluIHRoZSBpbnN0YW5jZSBvZiBLaW5nVGFibGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zLCBzdGF0aWNQcm9wZXJ0aWVzKSB7XG4gICAgc3VwZXIoKTtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9cbiAgICAvLyBUaGUgc2Vjb25kIGFyZ3VtZW50IGFsbG93cyB0byBvdmVycmlkZSBwcm9wZXJ0aWVzIG9mIHRoZSBLaW5nVGFibGUgaW5zdGFuY2UuXG4gICAgLy9cbiAgICBpZiAoc3RhdGljUHJvcGVydGllcykge1xuICAgICAgXy5leHRlbmQoc2VsZiwgc3RhdGljUHJvcGVydGllcyk7XG4gICAgfVxuICAgIC8vXG4gICAgLy8gQmFzZSBwcm9wZXJ0aWVzIGFyZSBhdXRvbWF0aWNhbGx5IHNldCBmcm9tIHRoZSBmaXJzdCBhcmd1bWVudCBpbnRvIHRoZSBpbnN0YW5jZVxuICAgIC8vXG4gICAgXy5lYWNoKHNlbGYuYmFzZVByb3BlcnRpZXMoKSwgeCA9PiB7XG4gICAgICBpZiAoXy5oYXMob3B0aW9ucywgeCkpIHtcbiAgICAgICAgc2VsZlt4XSA9IG9wdGlvbnNbeF07XG4gICAgICAgIGRlbGV0ZSBvcHRpb25zW3hdO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZhciBzb3J0QnkgPSBvcHRpb25zLnNvcnRCeTtcbiAgICBpZiAoXy5pc1N0cmluZyhzb3J0QnkpKSB7XG4gICAgICBzZWxmLnNvcnRDcml0ZXJpYSA9IEEuZ2V0U29ydENyaXRlcmlhKHNvcnRCeSk7XG4gICAgfVxuXG4gICAgLy8gU2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gc2VsZi5vcHRpb25zID0gXy5leHRlbmQoe30sIEtpbmdUYWJsZS5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgc2VsZi5sb2FkaW5nID0gZmFsc2U7XG4gICAgc2VsZi5pbml0KG9wdGlvbnMsIHN0YXRpY1Byb3BlcnRpZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLCB0aGF0IGNhbiBiZSBvdmVycmlkZGVuIHVzaW5nIHRoZSBmaXJzdCBhcmd1bWVudCAob3B0aW9ucykgb2YgS2luZ1RhYmxlIGNvbnN0cnVjdG9yLFxuICAgKiBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBzZWNvbmQgYXJndW1lbnQsIHdoaWNoIGFsbG93cyB0byBvdmVycmlkZSBhbnkgcHJvcGVydHkgaW4gYW4gaW5zdGFuY2Ugb2YgS2luZ1RhYmxlLlxuICAgKiBQcm9wZXJ0aWVzIG91dHNpZGUgb2YgdGhpcyBhcnJheSBhbmQgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50LCBhcmUgaW5zdGVhZCBwdXQgaW4gdGhlIFwib3B0aW9uc1wiIHByb3BlcnR5IG9mIGEgS2luZ1RhYmxlLlxuICAgKi9cbiAgYmFzZVByb3BlcnRpZXMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIFwiaWRcIiwgICAgICAgICAgICAgICAgICAgIC8vIGFsbG93cyB0byBzZXQgYW4gaWQgdG8gdGhlIGtpbmd0YWJsZVxuICAgICAgXCJvbkluaXRcIiwgICAgICAgICAgICAgICAgLy8gZnVuY3Rpb24gdG8gZXhlY3V0ZSBhZnRlciBpbml0aWFsaXphdGlvblxuICAgICAgXCJlbGVtZW50XCIsICAgICAgICAgICAgICAgLy8gYWxsb3dzIHRvIHNwZWNpZnkgdGhlIHRhYmxlIGVsZW1lbnRcbiAgICAgIFwiY29udGV4dFwiLCAgICAgICAgICAgICAgIC8vIHRhYmxlIGNvbnRleHRcbiAgICAgIFwiZml4ZWRcIiwgICAgICAgICAgICAgICAgIC8vXG4gICAgICBcInByZXBhcmVEYXRhXCIsICAgICAgICAgICAvL1xuICAgICAgXCJnZXRFeHRyYUZpbHRlcnNcIiwgICAgICAgLy9cbiAgICAgIFwiZ2V0VGFibGVEYXRhXCIsICAgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGdldCByZXF1aXJlZCBkYXRhIHRvIHJlbmRlciB0aGUgdGFibGVcbiAgICAgIFwiYWZ0ZXJSZW5kZXJcIiwgICAgICAgICAgIC8vIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgYWZ0ZXIgcmVuZGVyXG4gICAgICBcImJlZm9yZVJlbmRlclwiLCAgICAgICAgICAvLyBmdW5jdGlvbiB0byBleGVjdXRlIGJlZm9yZSByZW5kZXJcbiAgICAgIFwibnVtYmVyRmlsdGVyRm9ybWF0dGVyXCIsIC8vIGZ1bmN0aW9uIHRvIGZvcm1hdCBudW1iZXJzIGZvciBmaWx0ZXJzXG4gICAgICBcImRhdGVGaWx0ZXJGb3JtYXR0ZXJcIiAgICAvLyBmdW5jdGlvbiB0byBmb3JtYXQgZGF0ZXMgZm9yIGZpbHRlcnNcbiAgICBdO1xuICB9XG5cbiAgc3RhdGljIGdldCByZWdpb25hbCgpIHtcbiAgICByZXR1cm4gS2luZ1RhYmxlUmVnaW9uYWw7XG4gIH1cblxuICBzdGF0aWMgZ2V0IHZlcnNpb24oKSB7XG4gICAgcmV0dXJuIFZFUlNJT047XG4gIH1cblxuICBzdGF0aWMgZ2V0IFV0aWxzKCkge1xuICAgIHJldHVybiBfO1xuICB9XG5cbiAgc3RhdGljIGdldCBTdHJpbmdVdGlscygpIHtcbiAgICByZXR1cm4gUztcbiAgfVxuXG4gIHN0YXRpYyBnZXQgTnVtYmVyVXRpbHMoKSB7XG4gICAgcmV0dXJuIE47XG4gIH1cblxuICBzdGF0aWMgZ2V0IEFycmF5VXRpbHMoKSB7XG4gICAgcmV0dXJuIEE7XG4gIH1cblxuICBzdGF0aWMgZ2V0IERhdGVVdGlscygpIHtcbiAgICByZXR1cm4gRDtcbiAgfVxuXG4gIHN0YXRpYyBnZXQganNvbigpIHtcbiAgICByZXR1cm4ganNvbjtcbiAgfVxuXG4gIHN0YXRpYyBnZXQgUGFnaW5hdG9yKCkge1xuICAgIHJldHVybiBQYWdpbmF0b3I7XG4gIH1cblxuICBzdGF0aWMgZ2V0IFBsYWluVGV4dEJ1aWxkZXIoKSB7XG4gICAgcmV0dXJuIEtpbmdUYWJsZVRleHRCdWlsZGVyO1xuICB9XG5cbiAgc3RhdGljIGdldCBIdG1sQnVpbGRlcigpIHtcbiAgICByZXR1cm4gS2luZ1RhYmxlSHRtbEJ1aWxkZXI7XG4gIH1cblxuICBzdGF0aWMgZ2V0IFJpY2hIdG1sQnVpbGRlcigpIHtcbiAgICByZXR1cm4gS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyO1xuICB9XG5cbiAgc3RhdGljIGdldCBCYXNlSHRtbEJ1aWxkZXIoKSB7XG4gICAgcmV0dXJuIEtpbmdUYWJsZUJhc2VIdG1sQnVpbGRlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlcyBhY2Nlc3MgdG8gS2luZ1RhYmxlIGJ1aWxkZXJzLCB0byBhbGxvdyBvdmVycmlkaW5nIHRoZWlyIGZ1bmN0aW9ucy5cbiAgICovXG4gIHN0YXRpYyBnZXQgYnVpbGRlcnMoKSB7XG4gICAgcmV0dXJuIEJVSUxERVJTO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVzIGFjY2VzcyB0byBLaW5nVGFibGUgY3VzdG9tIHN0b3JhZ2VzLCBpbXBsZW1lbnRpbmcgYW4gaW50ZXJmYWNlIGNvbXBhdGlibGVcbiAgICogd2l0aCBzZXNzaW9uU3RvcmFnZSBhbmQgbG9jYWxTdG9yYWdlLlxuICAgKi9cbiAgc3RhdGljIGdldCBzdG9yZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFwibWVtb3J5XCI6IE1lbVN0b3JlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGFuIGluc3RhbmNlIG9mIEtpbmdUYWJsZS5cbiAgICovXG4gIGluaXQob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLmNhY2hlID0ge307XG4gICAgc2VsZi5kaXNwb3NhYmxlcyA9IFtdO1xuICAgIHNlbGYuYW5hbHlzdCA9IG5ldyBBbmFseXplcigpO1xuICAgIHNlbGYuc2FuaXRpemVyID0gbmV3IFNhbml0aXplcigpO1xuICAgIHNlbGYuZmlsdGVycyA9IG5ldyBGaWx0ZXJzTWFuYWdlcih7fSwge1xuICAgICAgY29udGV4dDogc2VsZlxuICAgIH0pO1xuXG4gICAgdmFyIGRhdGEgPSBvcHRpb25zLmRhdGE7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgIGlmICghXy5pc0FycmF5KGRhdGEpKVxuICAgICAgICByYWlzZSgzLCBcIkRhdGEgaXMgbm90IGFuIGFycmF5XCIpO1xuICAgICAgLy8gS2luZ1RhYmxlIGluaXRpYWxpemVkIHBhc3NpbmcgYW4gYXJyYXkgb2YgaXRlbXMsXG4gICAgICAvLyB1bmxlc3Mgc3BlY2lmaWVkIG90aGVyd2lzZSwgYXNzdW1lIHRoYXQgaXQgaXMgYSBmaXhlZCB0YWJsZVxuICAgICAgLy8gKGkuZS4gYSB0YWJsZSB0aGF0IGRvZXNuJ3QgcmVxdWlyZSBzZXJ2ZXIgc2lkZSBwYWdpbmF0aW9uKVxuXG4gICAgICAvLyBBcHBseSB0aGUgc2FtZSBsb2dpYyB0aGF0IHdvdWxkIGJlIGFwcGxpZWQgaWYgZGF0YSB3YXMgY29taW5nIGZyb21cbiAgICAgIC8vIHNlcnZlciBzaWRlIChlLmcuIHBhcnNpbmcgb2YgZGF0ZXMpXG4gICAgICBkYXRhID0ganNvbi5jbG9uZShkYXRhKTtcbiAgICAgIHNlbGYuc2V0Rml4ZWREYXRhKGRhdGEpO1xuICAgIH1cbiAgICAvLyBOQjogaXQgaXMgaW1wb3J0YW50IHRvIGxvYWQgc2V0dGluZ3MgYWZ0ZXIgc2V0dGluZyBkYXRhO1xuICAgIC8vIGJlY2F1c2UgaWYgY2xpZW50IHNpZGUgc2VhcmNoIGlzIHVzZWQsIHNlYXJjaCBmaWx0ZXIgcmVxdWlyZXMgc2VhcmNoIHByb3BlcnRpZXNcbiAgICBzZWxmLmxvYWRTZXR0aW5ncygpOyAvLyBsb2FkIHNldHRpbmdzIGZyb20gc3RvcmFnZSwgaWYgYXBwbGljYWJsZVxuICAgIHNlbGYuc2V0UGFnaW5hdGlvbigpO1xuXG4gICAgaWYgKCFzZWxmLmZpeGVkKSB7XG4gICAgICAvLyBpZiB0aGUgdGFibGUgY29sbGVjdGlvbiBpcyBub3QgZml4ZWQ7XG4gICAgICAvLyB0aGVuIHRoZXJlIGlzIG5vIG5lZWQgdG8gcGVyZm9ybSBzZWFyY2ggb3BlcmF0aW9ucyBvbiB0aGUgY2xpZW50IHNpZGU7XG4gICAgICBzZWxmLmZpbHRlcnMuc2VhcmNoRGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIGluaXRpYWxpemUgdGhlIGN1cnJlbnQgYnVpbGRlclxuICAgIC8vIHRoaXMgaXMgcmVxdWlyZWQgdG8gYWxsb3cgZGlzcGxheWluZyBsb2FkaW5nIGluZm9ybWF0aW9uXG4gICAgc2VsZi5zZXRCdWlsZGVyKG9wdGlvbnMuYnVpbGRlcikub25Jbml0KCk7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb25zIGZvciB0aGUgY3VycmVudCBsYW5ndWFnZSBjb25maWd1cmF0aW9uLlxuICAgKi9cbiAgZ2V0UmVnKCkge1xuICAgIHZhciBsYW5nID0gdGhpcy5vcHRpb25zLmxhbmc7XG4gICAgaWYgKCFsYW5nKSByYWlzZSAoMTUsIFwiTWlzc2luZyBsYW5ndWFnZSBvcHRpb24gKGNhbm5vdCBiZSBudWxsIG9yIGZhbHN5KVwiKVxuICAgIHZhciBvID0gS2luZ1RhYmxlLnJlZ2lvbmFsW2xhbmddO1xuICAgIGlmICghbykgcmFpc2UoMTUsIGBNaXNzaW5nIHJlZ2lvbmFsIGZvciBsYW5ndWFnZSAke2xhbmd9YCk7XG4gICAgcmV0dXJuIG87XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYnVpbGRlciBoYW5kbGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZTogYnVpbGRlciB0eXBlLlxuICAgKi9cbiAgc2V0QnVpbGRlcihuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmFpc2UoOCwgXCJuYW1lIGNhbm5vdCBiZSBudWxsIG9yIGVtcHR5XCIpO1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbyA9IHNlbGYub3B0aW9ucyxcbiAgICAgICAgYnVpbGRlcnMgPSBLaW5nVGFibGUuYnVpbGRlcnM7XG4gICAgaWYgKHNlbGYuYnVpbGRlcikge1xuICAgICAgc2VsZi5kaXNwb3NlT2Yoc2VsZi5idWlsZGVyKTtcbiAgICB9XG4gICAgdmFyIGJ1aWxkZXJUeXBlID0gYnVpbGRlcnNbbmFtZV07XG4gICAgaWYgKCFidWlsZGVyVHlwZSkge1xuICAgICAgcmFpc2UoMTAsIFwiTWlzc2luZyBoYW5kbGVyIGZvciBidWlsZGVyOiBcIiArIG5hbWUpO1xuICAgIH1cbiAgICB2YXIgYnVpbGRlciA9IG5ldyBidWlsZGVyVHlwZShzZWxmKTtcbiAgICBzZWxmLmJ1aWxkZXIgPSBidWlsZGVyO1xuICAgIHNlbGYuZGlzcG9zYWJsZXMucHVzaChidWlsZGVyKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGNsaWVudCBzaWRlIHBhZ2luYXRpb24gdG8gYW4gYXJyYXksIG9uIHRoZSBiYXNpcyBvZiBjdXJyZW50IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBnZXRTdWJTZXQoYSkge1xuICAgIHZhciBwYWdpbmF0aW9uID0gdGhpcy5wYWdpbmF0aW9uO1xuICAgIHZhciBmcm9tID0gKHBhZ2luYXRpb24ucGFnZSAtIDEpICogcGFnaW5hdGlvbi5yZXN1bHRzUGVyUGFnZSwgdG8gPSBwYWdpbmF0aW9uLnJlc3VsdHNQZXJQYWdlICsgZnJvbTtcbiAgICByZXR1cm4gYS5zbGljZShmcm9tLCB0byk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGFnaW5hdGlvbiBkYXRhIGluc2lkZSB0aGUgaW5zdGFuY2Ugb2YgS2luZ1RhYmxlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7S2luZ1RhYmxlfVxuICAgKi9cbiAgc2V0UGFnaW5hdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBkYXRhID0gc2VsZi5kYXRhLFxuICAgICAgb3B0aW9ucyA9IHNlbGYub3B0aW9ucyxcbiAgICAgIHBhZ2UgPSBvcHRpb25zLnBhZ2UsXG4gICAgICByZXN1bHRzUGVyUGFnZSA9IG9wdGlvbnMucmVzdWx0c1BlclBhZ2UsXG4gICAgICB0b3RhbEl0ZW1zQ291bnQgPSBvcHRpb25zLnRvdGFsSXRlbXNDb3VudCB8fCAoZGF0YSA/IGRhdGEubGVuZ3RoIDogMCk7XG4gICAgaWYgKHNlbGYucGFnaW5hdGlvbikge1xuICAgICAgc2VsZi5kaXNwb3NlT2Yoc2VsZi5wYWdpbmF0aW9uKTtcbiAgICB9XG4gICAgdmFyIHBhZ2luYXRpb24gPSBzZWxmLnBhZ2luYXRpb24gPSBuZXcgUGFnaW5hdG9yKHtcbiAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICByZXN1bHRzUGVyUGFnZTogcmVzdWx0c1BlclBhZ2UsXG4gICAgICB0b3RhbEl0ZW1zQ291bnQ6IHRvdGFsSXRlbXNDb3VudCxcbiAgICAgIG9uUGFnZUNoYW5nZTogKCkgPT4ge1xuICAgICAgICBzZWxmLnJlbmRlcigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuZGlzcG9zYWJsZXMucHVzaChwYWdpbmF0aW9uKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBwYWdpbmF0aW9uLCBhY2NvcmRpbmcgdG8gdGhlIHRvdGFsIGNvdW50IG9mIGl0ZW1zXG4gICAqIHRoYXQgc2F0aXNmeSB0aGUgY3VycmVudCBmaWx0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gdG90YWxJdGVtc0NvdW50OiB0aGUgdG90YWwgY291bnQgb2YgaXRlbXMgdGhhdCBzYXRpc2Z5IHRoZSBjdXJyZW50IGZpbHRlcnMgKGV4Y2VwdCBwYWdlIG51bWJlcilcbiAgICogQHJldHVybnMge0tpbmdUYWJsZX1cbiAgICovXG4gIHVwZGF0ZVBhZ2luYXRpb24odG90YWxJdGVtc0NvdW50KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5wYWdpbmF0aW9uKSBzZWxmLnNldFBhZ2luYXRpb24oKTtcbiAgICBpZiAoIV8uaXNOdW1iZXIodG90YWxJdGVtc0NvdW50KSlcbiAgICAgIHRocm93IFwiaW52YWxpZCB0eXBlXCI7XG4gICAgdmFyIHBhZ2luYXRpb24gPSBzZWxmLnBhZ2luYXRpb247XG4gICAgcGFnaW5hdGlvbi5zZXRUb3RhbEl0ZW1zQ291bnQodG90YWxJdGVtc0NvdW50KTtcbiAgICAvLyByZXN1bHRzIGNvdW50IGNoYW5nZVxuICAgIF8uaWZjYWxsKHNlbGYub25SZXN1bHRzQ291bnRDaGFuZ2UsIHNlbGYpO1xuICAgIHNlbGYudHJpZ2dlcihcImNoYW5nZTpwYWdpbmF0aW9uXCIpO1xuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNhbGxlZCB3aGVuIGluaXRpYWxpemF0aW9uIGlzIGNvbXBsZXRlZC5cbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICovXG4gIG9uSW5pdCgpIHsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoaXMgaW5zdGFuY2Ugb2YgS2luZ1RhYmxlIGhhcyBkYXRhIG9yXG4gICAqIG5vdC5cbiAgICovXG4gIGhhc0RhdGEoKSB7XG4gICAgdmFyIGRhdGEgPSB0aGlzLmRhdGE7XG4gICAgcmV0dXJuICEhKGRhdGEgJiYgZGF0YS5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0cnVjdHVyZSBvZiB0aGUgY29sbGVjdGlvbiBpdGVtcy5cbiAgICogQnkgZGVmYXVsdCwgaXQgaXMgYXNzdW1lZCB0aGF0IGFsbCBpdGVtcyBpbnNpZGUgdGhlIGNvbGxlY3Rpb24gaGF2ZSB0aGVcbiAgICogc2FtZSBzdHJ1Y3R1cmUuXG4gICAqL1xuICBnZXRJdGVtU3RydWN0dXJlKCkge1xuICAgIC8vIGFuYWx5emUgd2hvbGUgY29sbGVjdGlvbiwgaWYgbmVjZXNzYXJ5LCBvbmx5IHRoZSBmaXJzdCBpdGVtIGlmIHBvc3NpYmxlXG4gICAgLy8gaWYgbmVjZXNzYXJ5ID09IGlmIGFueSBwcm9wZXJ0eSBpcyBudWxsYWJsZSBhbmQgaXQncyBuZWNlc3NhcnkgdG8gY2hlY2tcbiAgICAvLyBtdWx0aXBsZSBpdGVtcyB1bnRpbCBhIGNlcnRhaW4gdmFsdWUgaXMgZm91bmQgKGUuZy4gbnVsbGFibGUgbnVtYmVycywgZGF0ZXMpXG4gICAgcmV0dXJuIHRoaXMuYW5hbHlzdC5kZXNjcmliZSh0aGlzLmRhdGEsIHsgbGF6eTogdHJ1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgY29sdW1ucyBpbmZvcm1hdGlvbiBmb3IgdGhpcyBLaW5nVGFibGUuXG4gICAqL1xuICBpbml0Q29sdW1ucygpIHtcbiAgICB2YXIgbiA9IFwiY29sdW1uc0luaXRpYWxpemVkXCIsXG4gICAgICBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZltuXSB8fCAhc2VsZi5oYXNEYXRhKCkpIHJldHVybiBzZWxmO1xuICAgIHNlbGZbbl0gPSB0cnVlO1xuICAgIHZhciBjb2x1bW5zID0gW107XG5cbiAgICAvLyBnZXRzIHRoZSBmaXJzdCBvYmplY3Qgb2YgdGhlIHRhYmxlIGFzIHN0YXJ0aW5nIHBvaW50XG4gICAgdmFyIG9ialNjaGVtYSA9IHNlbGYuZ2V0SXRlbVN0cnVjdHVyZSgpO1xuICAgIHZhciB4LCBwcm9wZXJ0aWVzID0gW107XG4gICAgZm9yICh4IGluIG9ialNjaGVtYSkge1xuICAgICAgb2JqU2NoZW1hW3hdID0geyBuYW1lOiB4LCB0eXBlOiBvYmpTY2hlbWFbeF0gfTtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh4KTtcbiAgICB9XG4gICAgdmFyIG9wdGlvbnNDb2x1bW5zID0gc2VsZi5vcHRpb25zLmNvbHVtbnM7XG5cbiAgICAvLyBkb2VzIHRoZSB1c2VyIHNwZWNpZmllZCBjb2x1bW5zIGluIGNvbnN0cnVjdG9yIG9wdGlvbnM/XG4gICAgaWYgKG9wdGlvbnNDb2x1bW5zKSB7XG4gICAgICB2YXIgaSA9IDAsIG5hbWU7XG4gICAgICBmb3IgKHggaW4gb3B0aW9uc0NvbHVtbnMpIHtcbiAgICAgICAgdmFyIGNvbCA9IG9wdGlvbnNDb2x1bW5zW3hdO1xuICAgICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KG9wdGlvbnNDb2x1bW5zKSkge1xuICAgICAgICAgIG5hbWUgPSB4O1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShvcHRpb25zQ29sdW1ucykpIHtcbiAgICAgICAgICBpZiAoXy5pc1N0cmluZyhjb2wpKSB7XG4gICAgICAgICAgICByYWlzZSgxNiwgYGludmFsaWQgY29sdW1ucyBvcHRpb24gJHtjb2x9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5hbWUgPSBjb2wubmFtZTtcbiAgICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIHJhaXNlKDE3LCBcIm1pc3NpbmcgbmFtZSBpbiBjb2x1bW4gb3B0aW9uXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByYWlzZSgxNiwgXCJpbnZhbGlkIGNvbHVtbnMgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlzIHRoZSBuYW1lIGluc2lkZSB0aGUgb2JqZWN0IHNjaGVtYT9cbiAgICAgICAgaWYgKF8uaW5kZXhPZihwcm9wZXJ0aWVzLCBuYW1lKSA9PSAtMSkge1xuICAgICAgICAgIHJhaXNlKDE4LCBgQSBjb2x1bW4gaXMgZGVmaW5lZCB3aXRoIG5hbWUgXCIke25hbWV9XCIsIGJ1dCB0aGlzIHByb3BlcnR5IHdhcyBub3QgZm91bmQgYW1vbmcgb2JqZWN0IHByb3BlcnRpZXMuIEl0ZW1zIHByb3BlcnRpZXMgYXJlOiAke3Byb3BlcnRpZXMuam9pbignLCAnKX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN1cHBvcnQgZGVmaW5pbmcgb25seSB0aGUgY29sdW1ucyBieSB0aGVpciBkaXNwbGF5IG5hbWUgKHRvIHNhdmUgcHJvZ3JhbW1lcnMncyB0aW1lKVxuICAgICAgICBpZiAoXy5pc1N0cmluZyhjb2wpKSB7XG4gICAgICAgICAgLy8gbm9ybWFsaXplXG4gICAgICAgICAgY29sID0gb3B0aW9uc0NvbHVtbnNbeF0gPSB7IGRpc3BsYXlOYW1lOiBjb2wgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5pc1N0cmluZyhjb2wubmFtZSkpIHtcbiAgICAgICAgICAvLyBpZiBhIG5hbWUgcHJvcGVydHkgaXMgZGVmaW5lZCwgcmVwbGFjZSBpdCB3aXRoIHRoZSBrZXkgYGRpc3BsYXlOYW1lYCxcbiAgICAgICAgICAvLyBzaW5jZSB0aGUgS2luZ1RhYmxlIHJlcXVpcmVzIHRoZSBuYW1lIHRvIGJlIGVxdWFsIHRvIHRoZSBhY3R1YWwgcHJvcGVydHkgbmFtZS5cbiAgICAgICAgICBjb2wuZGlzcGxheU5hbWUgPSBjb2wubmFtZTtcbiAgICAgICAgICBkZWxldGUgY29sLm5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgb2JqU2NoZW1hW25hbWVdID0gXy5leHRlbmQob2JqU2NoZW1hW25hbWVdLCBjb2wpO1xuXG4gICAgICAgIHZhciBjb2xQb3MgPSBjb2wucG9zaXRpb247XG4gICAgICAgIGlmIChfLmlzTnVtYmVyKGNvbFBvcykpIHtcbiAgICAgICAgICBvYmpTY2hlbWFbbmFtZV0ucG9zaXRpb24gPSBjb2xQb3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb2JqU2NoZW1hW25hbWVdLnBvc2l0aW9uID0gaTtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh4IGluIG9ialNjaGVtYSkge1xuICAgICAgdmFyIGJhc2UgPSB7IG5hbWU6IHggfSxcbiAgICAgICAgc2NoZW1hID0gb2JqU2NoZW1hW3hdLFxuICAgICAgICB0eXBlID0gc2NoZW1hLnR5cGU7XG4gICAgICBpZiAoIXR5cGUpIHNjaGVtYS50eXBlID0gdHlwZSA9IFwic3RyaW5nXCI7XG4gICAgICAvLyBleHRlbmQgd2l0aCB0YWJsZSBjb2x1bW4gZGVmYXVsdCBvcHRpb25zXG4gICAgICB2YXIgY29sID0gXy5leHRlbmQoe30sIHNlbGYub3B0aW9ucy5jb2x1bW5EZWZhdWx0LCBiYXNlLCBzY2hlbWEpO1xuICAgICAgLy8gYXNzaWduIGEgdW5pcXVlIGlkIHRvIHRoaXMgY29sdW1uIG9iamVjdDpcbiAgICAgIGNvbC5jaWQgPSBfLnVuaXF1ZUlkKFwiY29sXCIpO1xuICAgICAgdHlwZSA9IF8ubG93ZXIodHlwZSk7XG4gICAgICAvL3NldCBkZWZhdWx0IHByb3BlcnRpZXMgYnkgZmllbGQgdHlwZVxuICAgICAgdmFyIGEgPSBLaW5nVGFibGUuU2NoZW1hcy5EZWZhdWx0QnlUeXBlO1xuICAgICAgaWYgKF8uaGFzKGEsIHR5cGUpKSB7XG4gICAgICAgIC8vZGVmYXVsdCBzY2hlbWEgYnkgdHlwZVxuICAgICAgICB2YXIgZGVmID0gYVt0eXBlXTtcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihkZWYpKSBkZWYgPSBkZWYuY2FsbChzZWxmLCBzY2hlbWEsIG9ialNjaGVtYSk7XG4gICAgICAgIF8uZXh0ZW5kKGJhc2UsIGRlZik7XG4gICAgICB9XG4gICAgICAvL3NldCBkZWZhdWx0IHByb3BlcnRpZXMgYnkgbmFtZVxuICAgICAgYSA9IEtpbmdUYWJsZS5TY2hlbWFzLkRlZmF1bHRCeU5hbWU7XG4gICAgICBpZiAoXy5oYXMoYSwgeCkpIHtcbiAgICAgICAgLy9kZWZhdWx0IHNjaGVtYSBieSBuYW1lXG4gICAgICAgIF8uZXh0ZW5kKGJhc2UsIGFbeF0pO1xuICAgICAgfVxuXG4gICAgICBfLmV4dGVuZChjb2wsIGJhc2UpO1xuXG4gICAgICBpZiAob3B0aW9uc0NvbHVtbnMpIHtcbiAgICAgICAgLy90aGUgdXNlciBlc3BsaWNpdGx5IGRlZmluZWQgc29tZSBjb2x1bW4gb3B0aW9uc1xuICAgICAgICAvL2NvbHVtbnMgYXJlIGRlZmluZWQgaW4gdGhlIG9wdGlvbnMsIHNvIHRha2UgdGhlaXIgZGVmYXVsdHMsIHN1cHBvcnRpbmcgYm90aCBhcnJheXMgb3IgcGxhaW4gb2JqZWN0c1xuICAgICAgICB2YXIgZGVmaW5lZFNjaGVtYSA9IF8uaXNBcnJheShvcHRpb25zQ29sdW1ucylcbiAgICAgICAgICA/IF8uZmluZChvcHRpb25zQ29sdW1ucywgZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8ubmFtZSA9PSB4OyB9KVxuICAgICAgICAgIDogb3B0aW9uc0NvbHVtbnNbeF07XG4gICAgICAgIGlmIChkZWZpbmVkU2NoZW1hKSB7XG4gICAgICAgICAgLy9zb21lIG9wdGlvbnMgYXJlIGV4cGxpY2l0bHkgZGVmaW5lZCBmb3IgYSBmaWVsZDogZXh0ZW5kIGV4aXN0aW5nIHNjaGVtYSB3aXRoIGNvbHVtbiBkZWZhdWx0c1xuICAgICAgICAgIF8uZXh0ZW5kKGNvbCwgZGVmaW5lZFNjaGVtYSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIHNldCBjc3MgbmFtZSBmb3IgY29sdW1uXG4gICAgICBuID0gXCJjc3NcIjtcbiAgICAgIGlmICghXy5pc1N0cmluZyhjb2xbbl0pKSB7XG4gICAgICAgIGNvbFtuXSA9IFMua2ViYWJDYXNlKGNvbC5uYW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFfLmlzU3RyaW5nKGNvbC5kaXNwbGF5TmFtZSkpXG4gICAgICAgIGNvbC5kaXNwbGF5TmFtZSA9IGNvbC5uYW1lO1xuICAgICAgY29sdW1ucy5wdXNoKGNvbCk7XG4gICAgfVxuXG4gICAgLy8gaWYgdGhlIHVzZXIgZGVmaW5lZCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIG9wdGlvbnM7XG4gICAgLy8gYXV0b21hdGljYWxseSBzZXQgdGhlaXIgcG9zaXRpb24gb24gdGhlIGJhc2lzIG9mIHRoZWlyIGluZGV4XG4gICAgdmFyIHAgPSBcInBvc2l0aW9uXCI7XG4gICAgaWYgKG9wdGlvbnNDb2x1bW5zKSB7XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICBmb3IgKHZhciB4IGluIG9wdGlvbnNDb2x1bW5zKSB7XG4gICAgICAgIHZhciBjb2wgPSBfLmZpbmQoY29sdW1ucywgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICByZXR1cm4gby5uYW1lID09IHg7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY29sICYmICFfLmhhcyhjb2wsIHApKVxuICAgICAgICAgIGNvbFtwXSA9IGk7XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZXN0b3JlIGNvbHVtbnMgaW5mb3JtYXRpb24gZnJvbSBjYWNoZVxuICAgIC8vXG4gICAgdmFyIGNvbHVtbnNEYXRhID0gc2VsZi5nZXRDYWNoZWRDb2x1bW5zRGF0YSgpO1xuICAgIHZhciBoID0gXCJoaWRkZW5cIjtcbiAgICBpZiAoY29sdW1uc0RhdGEpIHtcbiAgICAgIF8uZWFjaChjb2x1bW5zRGF0YSwgYyA9PiB7XG4gICAgICAgIHZhciBjb2wgPSBfLmZpbmQoY29sdW1ucywgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICByZXR1cm4gby5uYW1lID09IGMubmFtZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjb2wpIHtcbiAgICAgICAgICBjb2xbcF0gPSBjW3BdOyAgLy8gcG9zaXRpb25cbiAgICAgICAgICBjb2xbaF0gPSBjW2hdOyAgLy8gaGlkZGVuXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBzZWxmLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgIC8vIE5vdyBjb2x1bW5zIGluZm9ybWF0aW9uIGlzIGluaXRpYWxpemVkOlxuICAgIC8vIGl0IG1heSBiZSBuZWNlc3NhcnkgdG8gc2V0IGEgc2VhcmNoIGZpbHRlciwgZm9yIGZpeGVkIHRhYmxlc1xuICAgIGlmIChzZWxmLmZpeGVkICYmIHNlbGYuc2VhcmNoVGV4dCkge1xuICAgICAgc2VsZi5zZXRTZWFyY2hGaWx0ZXIoc2VsZi5zZWFyY2hUZXh0LCB0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICBzdG9yZVByZWZlcmVuY2UocGxhaW5LZXksIHZhbHVlKSB7XG4gICAgdmFyIHN0b3JlID0gdGhpcy5nZXRGaWx0ZXJzU3RvcmUoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGtleSA9IHRoaXMuZ2V0TWVtb3J5S2V5KHBsYWluS2V5KTtcbiAgICBzdG9yZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICB9XG5cbiAgZ2V0UHJlZmVyZW5jZShwbGFpbktleSkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuZ2V0RmlsdGVyc1N0b3JlKCk7XG4gICAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICAgIHZhciBrZXkgPSB0aGlzLmdldE1lbW9yeUtleShwbGFpbktleSk7XG4gICAgcmV0dXJuIHN0b3JlLmdldEl0ZW0oa2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdG9yYWdlIHVzZWQgdG8gc3RvcmUgZmlsdGVycyBzZXR0aW5ncy5cbiAgICovXG4gIGdldEZpbHRlcnNTdG9yZSgpIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0b3JhZ2UgdXNlZCB0byBzdG9yZSBkYXRhLlxuICAgKi9cbiAgZ2V0RGF0YVN0b3JlKCkge1xuICAgIHJldHVybiBzZXNzaW9uU3RvcmFnZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBzZXR0aW5ncyBmcm9tIGNvbmZpZ3VyZWQgc3RvcmFnZS5cbiAgICovXG4gIGxvYWRTZXR0aW5ncygpIHtcbiAgICBpZiAodGhpcy5nZXRUYWJsZURhdGEpIHtcbiAgICAgIC8vIHRhYmxlIHJlcXVpcmVzIGRhdGE6IHRyeSB0byByZXN0b3JlIGZyb20gY2FjaGVcbiAgICAgIHRoaXMucmVzdG9yZVRhYmxlRGF0YSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZXN0b3JlRmlsdGVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgZmlsdGVycyBmcm9tIGNhY2hlLlxuICAgKi9cbiAgcmVzdG9yZUZpbHRlcnMoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBvcHRpb25zID0gc2VsZi5vcHRpb25zO1xuXG4gICAgLy8gcmVzdG9yZSBmaWx0ZXJzIGZyb20gc3RvcmFnZVxuICAgIHZhciBmaWx0ZXJzU3RvcmUgPSBzZWxmLmdldEZpbHRlcnNTdG9yZSgpO1xuICAgIGlmICghZmlsdGVyc1N0b3JlKSByZXR1cm4gc2VsZjtcblxuICAgIHZhciBrZXkgPSBzZWxmLmdldE1lbW9yeUtleShcImZpbHRlcnNcIik7XG4gICAgdmFyIGZpbHRlcnNDYWNoZSA9IGZpbHRlcnNTdG9yZS5nZXRJdGVtKGtleSk7XG4gICAgaWYgKCFmaWx0ZXJzQ2FjaGUpIHJldHVybiBzZWxmO1xuICAgIFxuICAgIHRyeSB7XG4gICAgICB2YXIgZmlsdGVycyA9IGpzb24ucGFyc2UoZmlsdGVyc0NhY2hlKTtcbiAgICAgIHZhciBiYXNpY0ZpbHRlcnMgPSBcInBhZ2Ugc2l6ZSBzb3J0Qnkgc2VhcmNoIHRpbWVzdGFtcFwiLnNwbGl0KFwiIFwiKTtcbiAgICAgIHNlbGYudHJpZ2dlcihcInJlc3RvcmU6ZmlsdGVyc1wiLCBmaWx0ZXJzKTtcbiAgICAgIC8vIHJlc3RvcmUgdGFibGUgaW5uZXIgZmlsdGVyc1xuICAgICAgXy5lYWNoKGJhc2ljRmlsdGVycywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgLy8gc2l6ZSBtYXBzIHRvIHJlc3VsdHMgcGVyIHBhZ2UhIChiZWNhdXNlIHRhYmxlICdzaXplJyB3b3VsZCBiZSB1bmNsZWFyKVxuICAgICAgICBpZiAoeCA9PSBcInNlYXJjaFwiKSB7XG4gICAgICAgICAgaWYgKHNlbGYudmFsaWRhdGVGb3JTZWFjaChmaWx0ZXJzW3hdKSkge1xuICAgICAgICAgICAgc2VsZi5zZXRTZWFyY2hGaWx0ZXIoZmlsdGVyc1t4XSwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHggPT0gXCJzb3J0QnlcIikge1xuICAgICAgICAgIHNlbGYuc29ydENyaXRlcmlhID0gZmlsdGVyc1t4XTtcbiAgICAgICAgfSBlbHNlIGlmICh4ID09IFwic2l6ZVwiKSB7XG4gICAgICAgICAgb3B0aW9ucy5yZXN1bHRzUGVyUGFnZSA9IGZpbHRlcnNbeF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0aW9uc1t4XSA9IGZpbHRlcnNbeF07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gY2FsbCBhIGZ1bmN0aW9uIGFuZCBmaXJlIGFuIGV2ZW50LCBzbyB0aGUgdXNlciBvZiB0aGUgbGlicmFyeSBjYW4gcmVzdG9yZVxuICAgICAgLy8gY3VzdG9tLCB0YWJsZSBzcGVjaWZpYyBmaWx0ZXJzLlxuICAgICAgdmFyIGV4dHJhRmlsdGVycyA9IF8ubWludXMoZmlsdGVycywgYmFzaWNGaWx0ZXJzKTtcbiAgICAgIGlmICghXy5pc0VtcHR5KGV4dHJhRmlsdGVycykpIHtcbiAgICAgICAgc2VsZi5yZXN0b3JlRXh0cmFGaWx0ZXJzKGZpbHRlcnMpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAvLyBkZXNlcmlhbGl6YXRpb24gZmFpbGVkOiByZW1vdmUgaXRlbSBmcm9tIGNhY2hlXG4gICAgICBmaWx0ZXJzU3RvcmUucmVtb3ZlSXRlbShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGZpbHRlcnMgb2YgdGhpcyBLaW5nVGFibGUuXG4gICAqIEZpbHRlcnMgaW5jbHVkZSBwYWdlIG51bWJlciwgcGFnZSBzaXplLCBvcmRlciBieSAocHJvcGVydHkgbmFtZSk7IHNvcnQgY3JpdGVyaWEsXG4gICAqIGZyZWUgdGV4dCBzZWFyY2gsIHRpbWVzdGFtcCBvZiB0aGUgZmlyc3QgdGltZSB0aGUgdGFibGUgd2FzIHJlbmRlcmVkICh0aGlzIHRpbWVzdGFtcCBpcyB1cGRhdGVkIHdoZW4gdGhlIHVzZXIgY2xpY2tzIG9uIHRoZSByZWZyZXNoIGJ1dHRvbikuXG4gICAqL1xuICBnZXRGaWx0ZXJzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcGFnaW5hdGlvbiA9IHNlbGYucGFnaW5hdGlvbjtcbiAgICAvLyBOQjogdGhpcyBmdW5jdGlvbiBkaXNhbGxvdyBvdmVycmlkaW5nIGJhc2ljIGZpbHRlcnMgKHBhZ2UgbnVtYmVyLCBzaXplLCBzb3J0QnksIHNlYXJjaCwgdGltZXN0YW1wKTtcbiAgICAvLyB1c2luZyB0aGUgZm9sbG93aW5nIG9yZGVyIG9mIGVsZW1lbnRzOlxuICAgIHZhciBhbmNob3JUaW1lID0gXCJhbmNob3JUaW1lXCI7XG4gICAgaWYgKF8uaXNVbmQoc2VsZlthbmNob3JUaW1lXSkpIHtcbiAgICAgIC8vIHNldCBhbmNob3IgdGltZTogaXQgY2FuIGJlIHVzZWQgZm9yIGZhc3QgZ3Jvd2luZyB0YWJsZXMuXG4gICAgICAvLyB0aGlzIG11c3QgYmUgZmV0Y2hlZCBiZWZvcmUgY2FjaGluZyBmaWx0ZXJzXG4gICAgICBzZWxmW2FuY2hvclRpbWVdID0gbmV3IERhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIF8uZXh0ZW5kKHt9LCBzZWxmLmdldEV4dHJhRmlsdGVycygpLCB7XG4gICAgICBwYWdlOiBwYWdpbmF0aW9uLnBhZ2UsICAgICAgICAgICAvLyBwYWdlIG51bWJlclxuICAgICAgc2l6ZTogcGFnaW5hdGlvbi5yZXN1bHRzUGVyUGFnZSwgLy8gcGFnZSBzaXplOyBpLmUuIHJlc3VsdHMgcGVyIHBhZ2VcbiAgICAgIHNvcnRCeTogc2VsZi5zb3J0Q3JpdGVyaWEgfHwgbnVsbCwgICAgICAgICAgLy8gc29ydCBjcml0ZXJpYSAob25lIG9yIG1vcmUgcHJvcGVydGllcylcbiAgICAgIHNlYXJjaDogc2VsZi5zZWFyY2hUZXh0IHx8IG51bGwsXG4gICAgICB0aW1lc3RhbXA6IHNlbGYuYW5jaG9yVGltZSB8fCBudWxsICAvLyB0aGUgdGltZXN0YW1wIG9mIHRoZSBmaXJzdCB0aW1lIHRoZSB0YWJsZSB3YXMgcmVuZGVyZWRcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGZpbHRlcnMgb2YgdGhpcyBLaW5nVGFibGUsIGluY2x1ZGluZyBhIGNhY2hpbmcgbWVjaGFuaXNtIChzZXQgb25seSkuXG4gICAqL1xuICBnZXRGaWx0ZXJzU2V0Q2FjaGUoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBmaWx0ZXJzID0gc2VsZi5nZXRGaWx0ZXJzKCksXG4gICAgICAgIHN0b3JlID0gc2VsZi5nZXRGaWx0ZXJzU3RvcmUoKTtcbiAgICBpZiAoc3RvcmUpIHtcbiAgICAgIC8vIHN0b3JlIGN1cnJlbnQgZmlsdGVycyBzZXQ7IHRoaXMgaXMgdXNlZCB0byByZXN0b3JlXG4gICAgICAvLyBmaWx0ZXJzIHVwb24gcmVsb2FkIG9yIHBhZ2UgcmVmcmVzaFxuICAgICAgdmFyIGtleSA9IHNlbGYuZ2V0TWVtb3J5S2V5KFwiZmlsdGVyc1wiKTtcbiAgICAgIHNlbGYudHJpZ2dlcihcInN0b3JlOmZpbHRlcnNcIiwgZmlsdGVycyk7XG4gICAgICBzdG9yZS5zZXRJdGVtKGtleSwganNvbi5jb21wb3NlKGZpbHRlcnMpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZpbHRlcnM7XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gcmV0dXJuIGV4dHJhIGZpbHRlcnMgZm9yIGEgc3BlY2lmaWMgaW5zdGFuY2Ugb2YgS2luZ3RUYWJsZS5cbiAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGNvbGxlY3QgZmlsdGVycyB0aGF0IHJlbGF0ZXMgdG8gYSBzcGVjaWZpYyBjb250ZXh0LCBhbmQgbWVyZ2UgdGhlbSB3aXRoXG4gICAqIHRhYmxlIGJhc2ljIGZpbHRlcnMgKHBhZ2UgbnVtYmVyLCBwYWdlIHNpemUsIHNvcnQgb3JkZXIpLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRFeHRyYUZpbHRlcnMoKSB7IH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCBhbGxvd3MgdG8gcmVzdG9yZSBleHRyYSBmaWx0ZXJzIGZyb20gY2FjaGUsIGZvciBhIHNwZWNpZmljIGluc3RhbmNlIG9mIEtpbmd0VGFibGUuXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCByZXN0b3JlIGNhY2hlZCBmaWx0ZXJzIGluIHRoZSB0YWJsZSBjb250ZXh0LCBzbyB0aGV5IGNhbiBiZSByZWFkIHdoZW4gZmV0Y2hpbmcgYSBjb2xsZWN0aW9uIG9mIGl0ZW1zLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICByZXN0b3JlRXh0cmFGaWx0ZXJzKGZpbHRlcnMpIHt9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biBiZWZvcmUgcmVuZGVyaW5nLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKi9cbiAgYmVmb3JlUmVuZGVyKCkge31cblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gcnVuIGFmdGVyIHJlbmRlcmluZy5cbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICovXG4gIGFmdGVyUmVuZGVyKCkge31cblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gYW4gQUpBWCByZXF1ZXN0IHN0YXJ0cy5cbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICovXG4gIG9uRmV0Y2hTdGFydCgpIHt9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIGFuIEFKQVggcmVxdWVzdCBlbmRzIHBvc2l0aXZlbHkuXG4gICAqIEV4dGVuc2liaWxpdHkgcG9pbnQuXG4gICAqL1xuICBvbkZldGNoRG9uZSgpIHt9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIGFuIEFKQVggcmVxdWVzdCBlbmRzIG5lZ2F0aXZlbHkuXG4gICAqIEV4dGVuc2liaWxpdHkgcG9pbnQuXG4gICAqL1xuICBvbkZldGNoRmFpbCgpIHt9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIGFuIEFKQVggcmVxdWVzdCBlbmRzIChpbiBhbnkgY2FzZSkuXG4gICAqIEV4dGVuc2liaWxpdHkgcG9pbnQuXG4gICAqL1xuICBvbkZldGNoRW5kKCkge31cblxuICAvKipcbiAgICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gc2VhcmNoIGZpbHRlciBpcyBlbXB0eS5cbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICovXG4gIG9uU2VhcmNoRW1wdHkoKSB7fVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBzZWFyY2ggc3RhcnRzLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKi9cbiAgb25TZWFyY2hTdGFydCh2YWwpIHt9XG5cbiAgLyoqXG4gICAqIERlZmluZSBhIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIHRvIHByZXByb2Nlc3MgZGF0YSB1cG9uIGZldGNoaW5nLlxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKi9cbiAgcHJlcGFyZURhdGEoZGF0YSkge1xuICAgIC8vIGhhbmRsZSB0aGlzLmRhdGEgKGUuZy4gcGFyc2luZyBkYXRlcywgZXRjLilcbiAgICAvLyBkYXRhID09PSB0aGlzLmRhdGFcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtYXRzIHRoZSB2YWx1ZXMgaW5zaWRlIHRoZSBpdGVtcyAocmVxdWlyZXMgY29sdW1ucyBpbmZvcm1hdGlvbikuXG4gICAqL1xuICBmb3JtYXRWYWx1ZXMoZGF0YSkge1xuICAgIC8vIGZpcnN0IHVzZSB0aGUgZnVuY3Rpb24gdGhhdCBpcyBkZXNpZ25lZCB0byBiZSBvdmVycmlkYWJsZSBieSBwcm9ncmFtbWVyc1xuICAgIHZhciBzZWxmID0gdGhpcywgbyA9IHNlbGYub3B0aW9ucztcbiAgICBpZiAoIWRhdGEpIGRhdGEgPSBzZWxmLmRhdGE7XG4gICAgLy8gYXBwbHkgZm9ybWF0dGluZyBieSBjb2x1bW5cbiAgICB2YXIgZm9ybWF0dGVkU3VmZml4ID0gc2VsZi5vcHRpb25zLmZvcm1hdHRlZFN1ZmZpeCwgbiwgdjtcbiAgICB2YXIgZm9ybWF0dGVkUHJvcGVydGllcyA9IF8ud2hlcmUoc2VsZi5jb2x1bW5zLCB4ID0+IHsgcmV0dXJuIF8uaXNGdW5jdGlvbih4LmZvcm1hdCk7IH0pO1xuICAgIF8uZWFjaChkYXRhLCB4ID0+IHtcbiAgICAgIF8uZWFjaChmb3JtYXR0ZWRQcm9wZXJ0aWVzLCBjID0+IHtcbiAgICAgICAgbiA9IGMubmFtZSArIGZvcm1hdHRlZFN1ZmZpeDtcbiAgICAgICAgdiA9IHhbYy5uYW1lXTtcbiAgICAgICAgeFtuXSA9IChfLmlzVW5kKHYpIHx8IHYgPT09IG51bGwgfHwgdiA9PT0gXCJcIikgPyBvLmVtcHR5VmFsdWUgOiBjLmZvcm1hdCh2LCB4KSB8fCBvLmVtcHR5VmFsdWU7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb2x1bW5zIG9yZGVyIGJ5IHByb3BlcnR5IG5hbWUuXG4gICAqL1xuICBzZXRDb2x1bW5zT3JkZXIoKSB7XG4gICAgdmFyIGFyZ3MgPSBfLnN0cmluZ0FyZ3MoYXJndW1lbnRzKTtcbiAgICB2YXIgbCA9IGFyZ3MubGVuZ3RoO1xuICAgIGlmICghbCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciBjb2xzID0gdGhpcy5jb2x1bW5zLCBmb3VuZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgbiA9IGFyZ3NbaV07XG4gICAgICB2YXIgY29sID0gXy5maW5kKGNvbHMsIHggPT4geyByZXR1cm4geC5uYW1lID09IG47IH0pO1xuICAgICAgaWYgKCFjb2wpIHJhaXNlKDE5LCBgbWlzc2luZyBjb2x1bW4gd2l0aCBuYW1lIFwiJHtufVwiYCk7XG4gICAgICBjb2wucG9zaXRpb24gPSBpO1xuICAgICAgZm91bmQucHVzaChjb2wpO1xuICAgIH1cbiAgICB2YXIgbm90Rm91bmQgPSBfLndoZXJlKGNvbHMsIHggPT4geyByZXR1cm4gZm91bmQuaW5kZXhPZih4KSA9PSAtMTsgfSk7XG4gICAgXy5lYWNoKG5vdEZvdW5kLCB4ID0+IHtcbiAgICAgIGwrKztcbiAgICAgIHgucG9zaXRpb24gPSBsO1xuICAgIH0pO1xuICAgIEEuc29ydEJ5KGNvbHMsIFwicG9zaXRpb25cIik7XG4gICAgLy8gc3RvcmUgaW4gbWVtb3J5XG4gICAgdGhpcy5zdG9yZUNvbHVtbnNEYXRhKCkucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2hvd3Mgb3IgaGlkZXMgY29sdW1ucywgZGVwZW5kaW5nIG9uIHBhcmFtZXRlci5cbiAgICovXG4gIHRvZ2dsZUNvbHVtbnMocGFyYW0pIHtcbiAgICB2YXIgY29scyA9IHRoaXMuY29sdW1ucztcbiAgICBfLmVhY2gocGFyYW0sIHggPT4ge1xuICAgICAgaWYgKF8uaXNBcnJheSh4KSkge1xuICAgICAgICB2YXIgbmFtZSA9IHhbMF0sIHZpc2libGUgPSB4WzFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5hbWUgPSB4Lm5hbWUsIHZpc2libGUgPSB4LnZpc2libGU7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBjb2wgPSBfLmZpbmQoY29scywgY29sID0+IHsgcmV0dXJuIGNvbC5uYW1lID09IG5hbWU7IH0pO1xuICAgICAgaWYgKCFjb2wpIHtcbiAgICAgICAgcmFpc2UoMTksIGBtaXNzaW5nIGNvbHVtbiB3aXRoIG5hbWUgXCIke25hbWV9XCJgKTtcbiAgICAgIH1cbiAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgIGNvbC5oaWRkZW4gPSBjb2wuc2VjcmV0ID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sLmhpZGRlbiA9IHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5zdG9yZUNvbHVtbnNEYXRhKCkucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSGlkZXMgb25lIG9yIG1vcmUgY29sdW1ucyBieSBuYW1lLlxuICAgKi9cbiAgaGlkZUNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sdW1uc1Zpc2liaWxpdHkoXy5zdHJpbmdBcmdzKGFyZ3VtZW50cyksIGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyBvbmUgb3IgbW9yZSBjb2x1bW5zIGJ5IG5hbWUuXG4gICAqL1xuICBzaG93Q29sdW1ucygpIHtcbiAgICByZXR1cm4gdGhpcy5jb2x1bW5zVmlzaWJpbGl0eShfLnN0cmluZ0FyZ3MoYXJndW1lbnRzKSwgdHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBjb2x1bW5zIHZpc2liaWxpdHkuXG4gICAqL1xuICBjb2x1bW5zVmlzaWJpbGl0eShhcmdzLCB2aXNpYmxlKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgYXJnc1swXSA9PSBcIipcIikge1xuICAgICAgXy5lYWNoKHRoaXMuY29sdW1ucywgeCA9PiB7XG4gICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgeC5oaWRkZW4gPSB4LnNlY3JldCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4LmhpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBfLmVhY2goYXJncywgeCA9PiB7XG4gICAgICAgIHRoaXMuY29sQXR0cih4LCBcImhpZGRlblwiLCAhdmlzaWJsZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5zdG9yZUNvbHVtbnNEYXRhKCkucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGNvbHVtbiBwcm9wZXJ0eSBieSBuYW1lcyBhbmQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lOiBjb2x1bW4gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gYXR0cjogYXR0cmlidXRlIG5hbWVcbiAgICogQHBhcmFtIHthbnl9IHZhbHVlOiBhdHRyaWJ1dGUgdmFsdWVcbiAgICovXG4gIGNvbEF0dHIobmFtZSwgYXR0ciwgdmFsdWUpIHtcbiAgICBpZiAoIW5hbWUpIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcIm5hbWVcIik7XG4gICAgdmFyIGNvbHMgPSB0aGlzLmNvbHVtbnM7XG4gICAgaWYgKCFjb2xzKSByYWlzZSgyMCwgXCJtaXNzaW5nIGNvbHVtbnMgaW5mb3JtYXRpb24gKHByb3BlcnRpZXMgbm90IGluaXRpYWxpemVkKVwiKTtcbiAgICB2YXIgY29sID0gXy5maW5kKGNvbHMsIHggPT4geyByZXR1cm4geC5uYW1lID09IG5hbWU7IH0pO1xuICAgIGlmICghY29sKSByYWlzZSgxOSwgYG1pc3NpbmcgY29sdW1uIHdpdGggbmFtZSBcIiR7bmFtZX1cImApO1xuICAgIGNvbFthdHRyXSA9IHZhbHVlO1xuICAgIHJldHVybiBjb2w7XG4gIH1cblxuICAvKipcbiAgICogU3RvcmVzIGNvbHVtbnMgZGF0YSBpbiBjYWNoZS5cbiAgICogTkI6IHRoaXMgaXMgdXNlZCBvbmx5IHRvIHN0b3JlIGNvbHVtbnMgcG9zaXRpb24sIGhpZGRlbiBkYXRhLlxuICAgKiBPYmplY3RzIHN0cnVjdHVyZSBzdGlsbCBjb250cm9scyB0aGUgY29sdW1ucyBkYXRhLlxuICAgKi9cbiAgc3RvcmVDb2x1bW5zRGF0YSgpIHtcbiAgICB2YXIgc3RvcmUgPSB0aGlzLmdldERhdGFTdG9yZSgpLFxuICAgICAgICBrZXkgPSB0aGlzLmdldE1lbW9yeUtleShcImNvbHVtbnM6ZGF0YVwiKSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgZGF0YSA9IHRoaXMuY29sdW1ucztcbiAgICBpZiAoc3RvcmUgJiYgb3B0aW9ucy5zdG9yZVRhYmxlRGF0YSkge1xuICAgICAgc3RvcmUuc2V0SXRlbShrZXksIGpzb24uY29tcG9zZShkYXRhKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgY29sdW1ucyBkYXRhIGZyb20gc3RvcmFnZS5cbiAgICogTkI6IHRoaXMgaXMgdXNlZCBvbmx5IHRvIHN0b3JlIGNvbHVtbnMgcG9zaXRpb24sIGhpZGRlbiBkYXRhLlxuICAgKiBPYmplY3RzIHN0cnVjdHVyZSBzdGlsbCBjb250cm9scyB0aGUgY29sdW1ucyBkYXRhLlxuICAgKi9cbiAgZ2V0Q2FjaGVkQ29sdW1uc0RhdGEoKSB7XG4gICAgdmFyIHN0b3JlID0gdGhpcy5nZXREYXRhU3RvcmUoKSxcbiAgICAgICAga2V5ID0gdGhpcy5nZXRNZW1vcnlLZXkoXCJjb2x1bW5zOmRhdGFcIiksXG4gICAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgaWYgKHN0b3JlICYmIG9wdGlvbnMuc3RvcmVUYWJsZURhdGEpIHtcbiAgICAgIHZhciBkYXRhID0gc3RvcmUuZ2V0SXRlbShrZXkpO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4ganNvbi5wYXJzZShkYXRhKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICBzdG9yZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogU29ydHMgY29sdW1ucywgYWNjb3JkaW5nIHRvIHRoZWlyIGN1cnJlbnQgcG9zaXRpb24gc2V0dGluZy5cbiAgICovXG4gIHNvcnRDb2x1bW5zKCkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXRDb2x1bW5zT3JkZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgLy8gZGVmYXVsdCBmdW5jdGlvbiB0byBzb3J0IGNvbHVtbnM6IHRoZXkgYXJlIHNvcnRlZFxuICAgIC8vIGJ5IHBvc2l0aW9uIGZpcnN0LCB0aGVuIGRpc3BsYXkgbmFtZVxuICAgIHZhciBpc051bWJlciA9IF8uaXNOdW1iZXIsIGNvbHVtbnMgPSB0aGlzLmNvbHVtbnM7XG4gICAgY29sdW1ucy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICB2YXIgcCA9IFwicG9zaXRpb25cIjtcbiAgICAgIGlmIChpc051bWJlcihhW3BdKSAmJiAhaXNOdW1iZXIoYltwXSkpIHJldHVybiAtMTtcbiAgICAgIGlmICghaXNOdW1iZXIoYVtwXSkgJiYgaXNOdW1iZXIoYltwXSkpIHJldHVybiAxO1xuICAgICAgaWYgKGFbcF0gPiBiW3BdKSByZXR1cm4gMTtcbiAgICAgIGlmIChhW3BdIDwgYltwXSkgcmV0dXJuIC0xO1xuICAgICAgLy8gY29tcGFyZSBkaXNwbGF5IG5hbWVcbiAgICAgIHAgPSBcImRpc3BsYXlOYW1lXCI7XG4gICAgICByZXR1cm4gUy5jb21wYXJlKGFbcF0sIGJbcF0sIDEpO1xuICAgIH0pO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29sdW1ucy5sZW5ndGg7IGkgPCBsOyBpKyspXG4gICAgICBjb2x1bW5zW2ldLnBvc2l0aW9uID0gaTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHNldFRvb2xzKCkge1xuICAgIC8vIFRPRE86IGtlZXAgdGhpcyBjbGFzcyBhYnN0cmFjdGVkIGZyb20gRE9NXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIHRvIGRlZmluZSBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBkYXRhIHJlcXVpcmVkIHRvIHJlbmRlciB0aGUgdGFibGUgaXRzZWxmLlxuICAgKiBUaGlzIGlzIGNvbW1vbmx5IG5lY2Vzc2FyeSwgZm9yIGV4YW1wbGUsIHdoZW4gYW4gQUpBWCByZXF1ZXN0IGlzIHJlcXVpcmVkIHRvIGZldGNoIGZpbHRlcnMgaW5mb3JtYXRpb25cbiAgICogKGUuZy4gYW4gYXJyYXkgb2YgcG9zc2libGUgdHlwZXMgZm9yIGEgc2VsZWN0KVxuICAgKiBFeHRlbnNpYmlsaXR5IHBvaW50LlxuICAgKi9cbiAgLy8gZ2V0VGFibGVEYXRhKCkgeyB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZGF0YSByZXR1cm5lZCBieSB0aGUgJ2dldFRhYmxlRGF0YScgcHJvbWlzZSwgaWYgYW55LlxuICAgKiBCeSBkZWZhdWx0LCB0aGlzIGZ1bmN0aW9uIHNpbXBseSBzdG9yZXMgdGhlIHRhYmxlIGRhdGEgaW4gYSBwcm9wZXJ0eSBjYWxsZWQgJ3RhYmxlRGF0YSdcbiAgICogRXh0ZW5zaWJpbGl0eSBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGRhdGE6IGRhdGEgcmV0dXJuZWQgYnkgZ2V0VGFibGVEYXRhIHByb21pc2UgKGlmIGFueSkuXG4gICAqL1xuICBoYW5kbGVUYWJsZURhdGEoZGF0YSkge1xuICAgIHRoaXMudGFibGVEYXRhID0gZGF0YTtcbiAgfVxuXG4gIC8qXG4gICAqIFJlZnJlc2hlcyB0aGUgS2luZ1RhYmxlLCBjbGVhcmluZyBpdHMgZGF0YSBjYWNoZSBhbmRcbiAgICogcGVyZm9ybWluZyBhIG5ldyByZW5kZXJpbmcuXG4gICAqL1xuICByZWZyZXNoKCkge1xuICAgIGRlbGV0ZSB0aGlzLmFuY2hvclRpbWU7XG4gICAgLy8gY2xlYXIgZGF0YSBjYWNoZVxuXG4gICAgcmV0dXJuIHRoaXMucmVuZGVyKHtcbiAgICAgIGNsZWFyRGF0YUNhY2hlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYW4gaGFyZCByZWZyZXNoIG9uIHRoZSBLaW5nVGFibGU7IGNsZWFyaW5nIGFsbCBpdHMgY2FjaGVkIGRhdGFcbiAgICogYW5kIHBlcmZvcm1pbmcgYSBuZXcgcmVuZGVyaW5nLlxuICAgKi9cbiAgaGFyZFJlZnJlc2goKSB7XG4gICAgdGhpcy50cmlnZ2VyKFwiaGFyZDpyZWZyZXNoXCIpLmNsZWFyVGFibGVEYXRhKCk7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyKHtcbiAgICAgIGNsZWFyRGF0YUNhY2hlOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgS2luZ1RhYmxlLCB1c2luZyBpdHMgY3VycmVudCB2aWV3IGFuZCB2aWV3IGJ1aWxkZXIuXG4gICAqIElmIG5lY2Vzc2FyeSwgaXQgYWxzbyBmZXRjaGVzIGRhdGEgcmVxdWlyZWQgYnkgdGhlIHRhYmxlIGl0c2VsZlxuICAgKiAoZS5nLiBpbmZvcm1hdGlvbiB0byByZW5kZXIgdGhlIGZpbHRlcnMgdmlldykuXG4gICAqL1xuICByZW5kZXIob3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUoKSB7XG4gICAgICAgIHNlbGYuYmVmb3JlUmVuZGVyKCk7XG5cbiAgICAgICAgc2VsZi5pbml0Q29sdW1ucygpXG4gICAgICAgICAgLnNvcnRDb2x1bW5zKClcbiAgICAgICAgICAuc2V0VG9vbHMoKVxuICAgICAgICAgIC5idWlsZCgpO1xuICAgICAgICBzZWxmLmFmdGVyUmVuZGVyKCk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICAgIC8vIFRPRE86IHRoZSBgaGFzRGF0YWAgY2hlY2sgaXMgbm90IHNwZWNpZmljIGVub3VnaC4gKG1heWJlPylcbiAgICAgICAgaWYgKHNlbGYuZml4ZWQgJiYgc2VsZi5oYXNEYXRhKCkpIHtcbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIHJlc29sdmUgYXV0b21hdGljYWxseTogdGhlIGRhdGEgaXMgYWxyZWFkeSBhdmFpbGFibGUgYW5kIG5vdCBjaGFuZ2luZ1xuICAgICAgICAgIC8vIGhvd2V2ZXIsIGZpbHRlcnMgbmVlZCB0byBiZSBzdG9yZWQgZm9yIGNvbnNpc3RlbmN5IHdpdGggcGFnaW5hdGVkIHNldHMuXG4gICAgICAgICAgc2VsZi5nZXRGaWx0ZXJzU2V0Q2FjaGUoKTtcbiAgICAgICAgICBoYW5kbGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBpdCBpcyBuZWNlc3NhcnkgdG8gZmV0Y2ggZGF0YVxuICAgICAgICAgIHZhciB0aW1lc3RhbXAgPSBzZWxmLmxhc3RGZXRjaFRpbWVzdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgIHNlbGYuZ2V0TGlzdChvcHRpb25zLCB0aW1lc3RhbXApLnRoZW4oZnVuY3Rpb24gc3VjY2VzcyhkYXRhKSB7XG4gICAgICAgICAgICBpZiAoIWRhdGEgfHwgIWRhdGEubGVuZ3RoICYmICFzZWxmLmNvbHVtbnNJbml0aWFsaXplZCkge1xuICAgICAgICAgICAgICAvLyB0aGVyZSBpcyBubyBkYXRhOiB0aGlzIG1heSBoYXBwZW4gaWYgdGhlIHNlcnZlciBpcyBub3QgcmV0dXJuaW5nIGFueVxuICAgICAgICAgICAgICAvLyBvYmplY3RcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZW1pdChcIm5vLXJlc3VsdHNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYW5kbGUoKTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiBmYWlsKCkge1xuICAgICAgICAgICAgc2VsZi5lbWl0KFwiZ2V0LWxpc3Q6ZmFpbGVkXCIpO1xuICAgICAgICAgICAgcmVqZWN0KFwiZ2V0LWxpc3Q6ZmFpbGVkXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vXG4gICAgICAvLyBpZiBuZWNlc3NhcnksIGZldGNoIGxpc3QgZGF0YSAoZS5nLiBmaWx0ZXJzIGRhdGEsIG9yIGFueXRoaW5nIGVsc2UgdGhhdCBuZWVkIHRvIGJlIGZldGNoZWRcbiAgICAgIC8vIGZyb20gdGhlIHNlcnZlciBzaWRlIGJlZm9yZSBkaXNwbGF5aW5nIGEgcmVuZGVyZWQgdGFibGUpXG4gICAgICAvL1xuICAgICAgaWYgKHNlbGYuZ2V0VGFibGVEYXRhICYmICFzZWxmLmNhY2hlLnRhYmxlRGF0YUZldGNoZWQpIHtcbiAgICAgICAgLy8gd2FzIHRoZSBkYXRhIGFscmVhZHkgZmV0Y2hlZD9cblxuICAgICAgICB2YXIgdGFibGVEYXRhUHJvbWlzZSA9IHNlbGYuZ2V0VGFibGVEYXRhKCk7XG4gICAgICAgIC8vIE5COiBoZXJlIGR1Y2sgdHlwaW5nIGlzIHVzZWQuXG4gICAgICAgIGlmICghXy5xdWFja3NMaWtlUHJvbWlzZSh0YWJsZURhdGFQcm9taXNlKSkge1xuICAgICAgICAgIHJhaXNlKDEzLCBcImdldFRhYmxlRGF0YSBtdXN0IHJldHVybiBhIFByb21pc2Ugb3IgUHJvbWlzZS1saWtlIG9iamVjdC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB0YWJsZURhdGFQcm9taXNlLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBpZiAoc2VsZi5vcHRpb25zLnN0b3JlVGFibGVEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmNhY2hlLnRhYmxlRGF0YUZldGNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gc3RvcmUgdGFibGUgZGF0YSBpbiBzdG9yZVxuICAgICAgICAgICAgc2VsZi5zdG9yZVRhYmxlRGF0YShkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2VsZi5oYW5kbGVUYWJsZURhdGEoZGF0YSk7XG4gICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIGZldGNoaW5nIHRhYmxlIGRhdGEgZmFpbGVkXG4gICAgICAgICAgc2VsZi5lbWl0KFwiZ2V0LXRhYmxlLWRhdGE6ZmFpbGVkXCIpO1xuICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRhYmxlIHJlcXVpcmVzIG5vIGRhdGFcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdG8gY2xlYXIgc3RvcmVkIHRhYmxlIGRhdGEuXG4gICAqL1xuICBjbGVhclRhYmxlRGF0YSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIHN0b3JlID0gc2VsZi5nZXREYXRhU3RvcmUoKSxcbiAgICAgICAga2V5ID0gc2VsZi5nZXRNZW1vcnlLZXkoXCJ0YWJsZTpkYXRhXCIpLFxuICAgICAgICBvcHRpb25zID0gc2VsZi5vcHRpb25zO1xuICAgIGlmIChzdG9yZSAmJiBvcHRpb25zLnN0b3JlVGFibGVEYXRhKSB7XG4gICAgICBzdG9yZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgfVxuICAgIHNlbGYuY2FjaGUudGFibGVEYXRhRmV0Y2hlZCA9IGZhbHNlO1xuICAgIGRlbGV0ZSBzZWxmLnRhYmxlRGF0YTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZXMgdGFibGUgZGF0YSBmb3IgbGF0ZXIgdXNlLlxuICAgKi9cbiAgc3RvcmVUYWJsZURhdGEoZGF0YSkge1xuICAgIHZhciBzdG9yZSA9IHRoaXMuZ2V0RGF0YVN0b3JlKCksXG4gICAgICAgIGtleSA9IHRoaXMuZ2V0TWVtb3J5S2V5KFwidGFibGU6ZGF0YVwiKSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICBpZiAoc3RvcmUgJiYgb3B0aW9ucy5zdG9yZVRhYmxlRGF0YSkge1xuICAgICAgc3RvcmUuc2V0SXRlbShrZXksIGpzb24uY29tcG9zZShkYXRhKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmVzIHRhYmxlIGRhdGEgZnJvbSBjYWNoZS5cbiAgICovXG4gIHJlc3RvcmVUYWJsZURhdGEoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBzdG9yZSA9IHNlbGYuZ2V0RGF0YVN0b3JlKCksXG4gICAgICAgIGtleSA9IHNlbGYuZ2V0TWVtb3J5S2V5KFwidGFibGU6ZGF0YVwiKSxcbiAgICAgICAgb3B0aW9ucyA9IHNlbGYub3B0aW9ucztcbiAgICBpZiAoc3RvcmUgJiYgb3B0aW9ucy5zdG9yZVRhYmxlRGF0YSkge1xuICAgICAgdmFyIGRhdGEgPSBzdG9yZS5nZXRJdGVtKGtleSk7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICAvLyB0YWJsZSBkYXRhIGlzIGF2YWlsYWJsZSBpbiBjYWNoZVxuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIFRPRE86IHVzZSB0aGUgc2FtZSBmdW5jdGlvbiB0byBwYXJzZSwgdXNlZCBieSBhamF4IHByb3h5IGZ1bmN0aW9uc1xuICAgICAgICAgIGRhdGEgPSBqc29uLnBhcnNlKGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIC8vIHBhcnNpbmcgZmFpbGVkXG4gICAgICAgICAgc3RvcmUucmVtb3ZlSXRlbShrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuaGFuZGxlVGFibGVEYXRhKGRhdGEpO1xuICAgICAgICBzZWxmLmNhY2hlLnRhYmxlRGF0YUZldGNoZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgdGhlIEtpbmdUYWJsZSwgdXNpbmcgaXRzIGN1cnJlbnQgc3RhdGUgYW5kIHZpZXcgYnVpbGRlci5cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIC8vIGRlcGVuZGluZyBvbiB0aGUgY3VycmVudCB2aWV3LCB1c2UgdGhlIHJpZ2h0IGJ1aWxkZXIgdG8gYnVpbGRcbiAgICAvLyB0aGUgdGFibGUgYXQgaXRzIGN1cnJlbnQgc3RhdGUuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBidWlsZGVyID0gc2VsZi5idWlsZGVyO1xuICAgIGlmICghYnVpbGRlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBidWlsZGVyLmJ1aWxkKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1lbW9yeSBrZXkgZm9yIHRoaXMgS2luZ1RhYmxlLlxuICAgKi9cbiAgZ2V0TWVtb3J5S2V5KG5hbWUpIHtcbiAgICB2YXIgYSA9IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uaGFzaCArIFwiLmt0XCI7XG4gICAgdmFyIGlkID0gdGhpcy5pZDtcbiAgICBpZiAoaWQpIGEgPSBpZCArIFwiOlwiICsgYVxuICAgIHJldHVybiBuYW1lID8gKGEgKyBcIjo6OlwiICsgbmFtZSkgOiBhO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZml4ZWQgZGF0YS5cbiAgICovXG4gIHNldEZpeGVkRGF0YShkYXRhKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGRhdGEgPSBzZWxmLm5vcm1hbGl6ZUNvbGxlY3Rpb24oZGF0YSk7XG4gICAgc2VsZi5maXhlZCA9IHRydWU7XG4gICAgc2VsZi5maWx0ZXJzLnNlYXJjaERpc2FibGVkID0gZmFsc2U7XG4gICAgc2VsZi5wcmVwYXJlRGF0YShkYXRhKTtcbiAgICBzZWxmLmRhdGEgPSBkYXRhO1xuICAgIHNlbGYuaW5pdENvbHVtbnMoKTtcbiAgICBzZWxmLmZvcm1hdFZhbHVlcyhkYXRhKTtcbiAgICBzZWxmLnVwZGF0ZVBhZ2luYXRpb24oZGF0YS5sZW5ndGgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIGRhdGEgZm9yIHRoaXMgS2luZ1RhYmxlIGFuZCBoYW5kbGVzIGl0cyByZXNwb25zZS5cbiAgICogVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gcGVyZm9ybXMgYW4gYWpheCByZXF1ZXN0LlxuICAgKi9cbiAgZ2V0TGlzdChvcHRpb25zLCB0aW1lc3RhbXApIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy8gb2J0YWluIGZldGNoIG9wdGlvbnNcbiAgICB2YXIgZmV0Y2hPcHRpb25zID0gc2VsZi5taXhpbkZldGNoRGF0YSgpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHNlbGYuZW1pdChcImZldGNoOnN0YXJ0XCIpXG4gICAgICAgICAgLm9uRmV0Y2hTdGFydCgpO1xuICAgICAgc2VsZi5nZXRGZXRjaFByb21pc2VXaXRoQ2FjaGUoZmV0Y2hPcHRpb25zLCBvcHRpb25zKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIGRvbmUoZGF0YSkge1xuICAgICAgICAvLyBjaGVjayBpZiB0aGVyZSBpcyBhIG5ld2VyIGNhbGwgdG8gZnVuY3Rpb25cbiAgICAgICAgaWYgKHRpbWVzdGFtcCA8IHNlbGYubGFzdEZldGNoVGltZXN0YW1wKSB7XG4gICAgICAgICAgLy8gZG8gbm90aGluZyBiZWNhdXNlIHRoZXJlIGlzIGEgbmV3ZXIgY2FsbCB0byBsb2FkRGF0YVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICAvLyBpbnZhbGlkIHByb21pc2U6IHRoZSBmdW5jdGlvbiBtdXN0IHJldHVybiBzb21ldGhpbmcgd2hlbiByZXNvbHZpbmdcbiAgICAgICAgICByYWlzZSgxNCwgXCJgZ2V0RmV0Y2hQcm9taXNlYCBkaWQgbm90IHJldHVybiBhIHZhbHVlIHdoZW4gcmVzb2x2aW5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZW1pdChcImZldGNoOmRvbmVcIikub25GZXRjaERvbmUoZGF0YSk7XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgcmV0dXJuZWQgZGF0YSBpcyBhbiBhcnJheSBvciBhIGNhdGFsb2dcbiAgICAgICAgaWYgKF8uaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gVGhlIHNlcnZlciByZXR1cm5lZCBhbiBhcnJheSwgc28gdGFrZSBmb3IgZ29vZCB0aGF0IHRoaXMgY29sbGVjdGlvblxuICAgICAgICAgIC8vIGlzIGNvbXBsZXRlIGFuZCBkb2Vzbid0IHJlcXVpcmUgc2VydmVyIHNpZGUgcGFnaW5hdGlvbi4gVGhpcyBpcyBieSBkZXNpZ24uXG4gICAgICAgICAgLy9cbiAgICAgICAgICBkYXRhID0gc2VsZi5zZXRGaXhlZERhdGEoZGF0YSk7XG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBUaGUgY29sbGVjdGlvbiBpcyBjb21wbGV0ZTogYXBwbHkgY2xpZW50IHNpZGUgcGFnaW5hdGlvblxuICAgICAgICAgIC8vXG4gICAgICAgICAgcmVzb2x2ZShzZWxmLmdldFN1YlNldChkYXRhKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFRoZSBzZXJ2ZXIgcmV0dXJuZWQgYW4gb2JqZWN0LCBzbyB0YWtlIGZvciBnb29kIHRoYXQgdGhpcyBjb2xsZWN0aW9uIHJlcXVpcmVzXG4gICAgICAgICAgLy8gc2VydmVyIHNpZGUgcGFnaW5hdGlvbjsgZXhwZWN0IHRoZSByZXR1cm5lZCBkYXRhIHRvIGluY2x1ZGUgaW5mb3JtYXRpb24gbGlrZTpcbiAgICAgICAgICAvLyB0b3RhbCBudW1iZXIgb2YgcmVzdWx0cyAocG9zc2libHkpLCBzbyBhIGNsaWVudCBzaWRlIHBhZ2luYXRpb24gY2FuIGJlIGJ1aWx0O1xuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gZXhwZWN0IGNhdGFsb2cgc3RydWN0dXJlIChwYWdlIGNvdW50LCBwYWdlIG51bWJlciwgZXRjLilcbiAgICAgICAgICB2YXIgc3Vic2V0ID0gZGF0YS5pdGVtcyB8fCBkYXRhLnN1YnNldDtcbiAgICAgICAgICBpZiAoIV8uaXNBcnJheShzdWJzZXQpKVxuICAgICAgICAgICAgcmFpc2UoNiwgXCJUaGUgcmV0dXJuZWQgb2JqZWN0IGlzIG5vdCBhIGNhdGFsb2dcIik7XG4gICAgICAgICAgaWYgKCFfLmlzTnVtYmVyKGRhdGEudG90YWwpKVxuICAgICAgICAgICAgcmFpc2UoNywgXCJNaXNzaW5nIHRvdGFsIGl0ZW1zIGNvdW50IGluIHJlc3BvbnNlIG9iamVjdC5cIik7XG5cbiAgICAgICAgICBzdWJzZXQgPSBzZWxmLm5vcm1hbGl6ZUNvbGxlY3Rpb24oc3Vic2V0KTtcbiAgICAgICAgICAvLyBzZXQgZGF0YVxuICAgICAgICAgIHNlbGYucHJlcGFyZURhdGEoc3Vic2V0KTtcbiAgICAgICAgICBzZWxmLmRhdGEgPSBzdWJzZXQ7XG4gICAgICAgICAgc2VsZi5pbml0Q29sdW1ucygpO1xuICAgICAgICAgIHNlbGYuZm9ybWF0VmFsdWVzKHN1YnNldCk7XG4gICAgICAgICAgc2VsZi51cGRhdGVQYWdpbmF0aW9uKGRhdGEudG90YWwpO1xuICAgICAgICAgIHJlc29sdmUoc3Vic2V0KTtcbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gZmFpbCgpIHtcbiAgICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYSBuZXdlciBjYWxsIHRvIGZ1bmN0aW9uXG4gICAgICAgIGlmICh0aW1lc3RhbXAgPCBzZWxmLmxhc3RGZXRjaFRpbWVzdGFtcCkge1xuICAgICAgICAgIC8vIGRvIG5vdGhpbmcgYmVjYXVzZSB0aGVyZSBpcyBhIG5ld2VyIGNhbGwgdG8gbG9hZERhdGFcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5lbWl0KFwiZmV0Y2g6ZmFpbFwiKS5vbkZldGNoRmFpbCgpO1xuICAgICAgICByZWplY3QoKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gYWx3YXlzKCkge1xuICAgICAgICBzZWxmLmVtaXQoXCJmZXRjaDplbmRcIikub25GZXRjaEVuZCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgYSBzZWFyY2ggYnkgdGV4dC5cbiAgICovXG4gIHNlYXJjaCh2YWwpIHtcbiAgICBpZiAoXy5pc1VuZCh2YWwpKSB2YWwgPSBcIlwiO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi52YWxpZGF0ZUZvclNlYWNoKHZhbCkpIHtcbiAgICAgIC8vIGFkZCBmaWx0ZXJzIGluc2lkZSB0aGUgZmlsdGVycyBtYW5hZ2VyXG4gICAgICBpZiAoIXZhbCkge1xuICAgICAgICAvLyByZW1vdmUgZmlsdGVyXG4gICAgICAgIHNlbGYudW5zZXRTZWFyY2goKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYub25TZWFyY2hTdGFydCh2YWwpO1xuICAgICAgICBzZWxmLnNldFNlYXJjaEZpbHRlcih2YWwpO1xuICAgICAgfVxuICAgICAgLy8gZ28gdG8gZmlyc3QgcGFnZVxuICAgICAgc2VsZi5wYWdpbmF0aW9uLnBhZ2UgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB2YWx1ZSBpcyBub3QgdmFsaWQgZm9yIHNlYXJjaDogcmVtb3ZlIHRoZSBydWxlIGJ5IGtleVxuICAgICAgc2VsZi51bnNldFNlYXJjaCgpO1xuICAgIH1cbiAgICBzZWxmLnJlbmRlcigpO1xuICB9XG5cbiAgaXNTZWFyY2hBY3RpdmUoKSB7XG4gICAgdmFyIGZpbHRlciA9IHRoaXMuZmlsdGVycy5nZXRSdWxlQnlLZXkoXCJzZWFyY2hcIik7XG4gICAgcmV0dXJuICEhZmlsdGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc2V0cyB0aGUgc2VhcmNoIGZpbHRlcnMgaW4gdGhpcyB0YWJsZS5cbiAgICovXG4gIHVuc2V0U2VhcmNoKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuaXNTZWFyY2hBY3RpdmUoKSkge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuICAgIHNlbGYuZmlsdGVycy5yZW1vdmVSdWxlQnlLZXkoXCJzZWFyY2hcIik7XG4gICAgc2VsZi5zZWFyY2hUZXh0ID0gbnVsbDtcbiAgICBpZiAoc2VsZi5oYXNEYXRhKCkpXG4gICAgICBzZWxmLnVwZGF0ZVBhZ2luYXRpb24oc2VsZi5kYXRhLmxlbmd0aCk7XG4gICAgc2VsZi50cmlnZ2VyKFwic2VhcmNoLWVtcHR5XCIpLm9uU2VhcmNoRW1wdHkoKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgc2VhcmNoIGZpbHRlciBmb3IgdGhlIHRhYmxlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsOiBzZWFyY2ggdmFsdWUuXG4gICAqIEBwYXJhbSB7Ym9vbH0gc2tpcFN0b3JlOiB3aGV0aGVyIHRvIHNraXAgc3RvcmluZyB0aGUgZmlsdGVyIGluIGNhY2hlIG9yIG5vdC5cbiAgICovXG4gIHNldFNlYXJjaEZpbHRlcih2YWwsIHNraXBTdG9yZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNlYXJjaFRleHQgPSB2YWw7XG4gICAgaWYgKCFza2lwU3RvcmUpIHtcbiAgICAgIHNlbGYuZ2V0RmlsdGVyc1NldENhY2hlKCk7IC8vIHN0b3JlIGZpbHRlciBpbiBjYWNoZVxuICAgIH1cbiAgICB2YXIgc2VhcmNoUHJvcGVydGllcyA9IHNlbGYuZ2V0U2VhcmNoUHJvcGVydGllcygpO1xuICAgIC8vIE5COiBpZiBkYXRhIGlzIGZldGNoZWQgZnJvbSB0aGUgc2VydmVyIGFmdGVyIHRhYmxlIGluaXRpYWxpemF0aW9uLFxuICAgIC8vIHRoZW4gc2VhcmNoUHJvcGVydGllcyBtYXkgc3RpbGwgYmUgbm90IGF2YWlsYWJsZS5cbiAgICBzZWxmLmZpbHRlcnMuc2V0KHtcbiAgICAgIHR5cGU6IFwic2VhcmNoXCIsXG4gICAgICBrZXk6IFwic2VhcmNoXCIsXG4gICAgICB2YWx1ZTogUi5nZXRTZWFyY2hQYXR0ZXJuKFMuZ2V0U3RyaW5nKHZhbCksIHtcbiAgICAgICAgc2VhcmNoTW9kZTogc2VsZi5vcHRpb25zLnNlYXJjaE1vZGVcbiAgICAgIH0pLFxuICAgICAgc2VhcmNoUHJvcGVydGllczogc2VhcmNoUHJvcGVydGllcyAmJiBzZWFyY2hQcm9wZXJ0aWVzLmxlbmd0aCA/IHNlYXJjaFByb3BlcnRpZXMgOiBmYWxzZVxuICAgIH0pO1xuICAgIHNlbGYudHJpZ2dlcihcInNlYXJjaC1hY3RpdmVcIik7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcHJvcGVydGllcyB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHNlYXJjaCBpbiB0aGlzIHRhYmxlLlxuICAgKi9cbiAgZ2V0U2VhcmNoUHJvcGVydGllcygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIG9wdGlvbnMgPSBzZWxmLm9wdGlvbnM7XG4gICAgaWYgKG9wdGlvbnMuc2VhcmNoUHJvcGVydGllcylcbiAgICAgIC8vIHRoZSB1c2VyIGV4cGxpY2l0bHkgc3BlY2lmaWVkIHRoZSBzZWFyY2ggcHJvcGVydGllc1xuICAgICAgcmV0dXJuIG9wdGlvbnMuc2VhcmNoUHJvcGVydGllcztcblxuICAgIC8vIGlmIGRhdGEgaXMgbm90IGluaXRpYWxpemVkIHlldCwgcmV0dXJuIGZhbHNlOyBzZWFyY2ggcHJvcGVydGllcyB3aWxsIGJlIHNldCBsYXRlclxuICAgIGlmICghc2VsZi5kYXRhIHx8ICFzZWxmLmNvbHVtbnNJbml0aWFsaXplZClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIHZhciBzZWFyY2hhYmxlID0gXy53aGVyZShzZWxmLmNvbHVtbnMsIGNvbCA9PiB7XG4gICAgICByZXR1cm4gY29sLmFsbG93U2VhcmNoICYmICghY29sLnNlY3JldCk7IC8vIGV4Y2x1ZGUgc2VjcmV0IGNvbHVtbnNcbiAgICB9KTtcbiAgICAvL1xuICAgIC8vIFdoZW4gc2VhcmNoaW5nLCBpdCdzIGRlc2lyYWJsZSB0byBzZWFyY2ggaW5zaWRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMgb2ZcbiAgICAvLyB2YWx1ZXMsIHdoaWxlIGtlZXBpbmcgcmVhbCB2YWx1ZXMgaW4gdGhlIHJpZ2h0IHR5cGUgKGZvciBzb3J0aW5nIG51bWJlcnMgYW5kIGRhdGVzLCBmb3IgaW5zdGFuY2UpXG4gICAgLy8gSG93ZXZlciwgaXQgaXMgYWxzbyBuaWNlIHRvIHNlYXJjaCBieSBhY3R1YWwgdmFsdWVzIChlLmcuIHNlYXJjaGluZyBcIjEwMDBcIiBzaG91bGQgbWF0Y2ggbnVtYmVycyB0aGF0IGFyZSByZXByZXNlbnRlZCB3aXRoIHRob3VzYW5kcyBzZXBhcmF0b3JzLCB0b28gLS0+IGxpa2UgJzEsMDAwLjAwJylcbiAgICAvL1xuICAgIHZhciBmb3JtYXR0ZWRTdWZmaXggPSBvcHRpb25zLmZvcm1hdHRlZFN1ZmZpeDtcbiAgICByZXR1cm4gXy5mbGF0dGVuKF8ubWFwKHNlYXJjaGFibGUsIHggPT4ge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbih4LmZvcm1hdCkpIHtcbiAgICAgICAgLy8gVE9ETzogd2hpY2ggcHJvcGVydGllcyBzaG91bGQgYWxzbyBiZSBzZWFyY2hlZCBpbiB0aGVpciBkZWZhdWx0IHN0cmluZyByZXByZXNlbnRhdGlvbj8gKERhdGVzIG5vdCBsaWtlbHksIE51bWJlcnMgbW9zdCBwcm9iYWJseSB5ZXMpXG4gICAgICAgIHJldHVybiB4LnR5cGUgPT0gXCJudW1iZXJcIiA/IFt4Lm5hbWUgKyBmb3JtYXR0ZWRTdWZmaXgsIHgubmFtZV0gOiB4Lm5hbWUgKyBmb3JtYXR0ZWRTdWZmaXg7XG4gICAgICB9XG4gICAgICByZXR1cm4geC5uYW1lO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgYSBzdHJpbmcgdmFsdWUgc2hvdWxkIHRyaWdnZXIgYSBzZWFyY2gsIGZhbHNlIG90aGVyd2lzZS5cbiAgICovXG4gIHZhbGlkYXRlRm9yU2VhY2ggKHZhbCkge1xuICAgIGlmICghdmFsKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIG1pblNlYXJjaENoYXJzID0gdGhpcy5vcHRpb25zLm1pblNlYXJjaENoYXJzO1xuICAgIGlmICh2YWwubWF0Y2goL15bXFxzXSskL2cpIHx8IChfLmlzTnVtYmVyKG1pblNlYXJjaENoYXJzKSAmJiB2YWwubGVuZ3RoIDwgbWluU2VhcmNoQ2hhcnMpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFuY2hvciBmZXRjaCB0aW1lLlxuICAgKiBUaW1lIHVzZWQgdG8gYGFuY2hvcmAgZmV0Y2hpbmcgb2YgaXRlbXMgZm9yIGZhc3QgZ3Jvd2luZyB0YWJsZXNcbiAgICogKGkuZS4gaXRlbXMgY2FuIGJlIGZldGNoZWQgaWYgdGhlaXIgY3JlYXRpb24gdGltZSBpcyBiZWZvcmUgYW5jaG9yIHRpbWVzdGFtcClcbiAgICovXG4gIGdldEZvcm1hdHRlZEFuY2hvclRpbWUoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmFuY2hvclRpbWU7XG4gICAgaWYgKHRpbWUgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICBpZiAoRC5pc1RvZGF5KHRpbWUpKSB7XG4gICAgICAgIHJldHVybiBELmZvcm1hdCh0aW1lLCBcIkhIOm1tOnNzXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIEQuZm9ybWF0V2l0aFRpbWUodGltZSk7XG4gICAgfVxuICAgIHJldHVybiBcIlwiO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEgZmV0Y2ggdGltZS5cbiAgICovXG4gIGdldEZvcm1hdHRlZEZldGNoVGltZSgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuZGF0YUZldGNoVGltZTtcbiAgICBpZiAodGltZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgIGlmIChELmlzVG9kYXkodGltZSkpIHtcbiAgICAgICAgcmV0dXJuIEQuZm9ybWF0KHRpbWUsIFwiSEg6bW06c3NcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gRC5mb3JtYXRXaXRoVGltZSh0aW1lKTtcbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHByb21pc2Ugb2JqZWN0IHJlc3BvbnNpYmxlIG9mIGZldGNoaW5nIGRhdGEgaW5jbHVkaW5nIGEgTFJVIGNhY2hpbmcgbWVjaGFuaXNtO1xuICAgKlxuICAgKiBAcGFyYW0gcGFyYW1zXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgZ2V0RmV0Y2hQcm9taXNlV2l0aENhY2hlKHBhcmFtcywgb3B0aW9ucykge1xuICAgIC8vIExSVSBjYWNoaW5nIG1lY2hhbmlzbS4gSWYgdGhlIGZldGNoIG9wdGlvbnMgZGlkbid0IGNoYW5nZSAoaXQgbWVhbnM6IHNhbWUgZmlsdGVycyksXG4gICAgLy8gYW5kIHRoZXJlIGlzIGFscmVhZHkgZGF0YSBpbiB0aGUgbG9jYWwgc3RvcmFnZSBvciBzZXNzaW9uIHN0b3JhZ2UsIHVzZSBzdG9yZWQgZGF0YS5cbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICBvID0gc2VsZi5vcHRpb25zLFxuICAgICAgbHJ1Q2FjaGVTaXplID0gby5scnVDYWNoZVNpemUsXG4gICAgICBzdG9yZSA9IHNlbGYuZ2V0RGF0YVN0b3JlKCksXG4gICAgICB1c2VMcnUgPSAhIShscnVDYWNoZVNpemUgJiYgc3RvcmUpO1xuICAgIHZhciBhbmNob3JUaW1lID0gXCJhbmNob3JUaW1lXCI7XG4gICAgaWYgKHVzZUxydSkge1xuICAgICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgZGF0YSBpbiB0aGUgc3RvcmVcbiAgICAgIHZhciBmcm96ZW4gPSBqc29uLnBhcnNlKGpzb24uY29tcG9zZShwYXJhbXMpKTtcbiAgICAgIHZhciBrZXkgPSBzZWxmLmdldE1lbW9yeUtleShcImNhdGFsb2dzXCIpLFxuICAgICAgICBjYWNoZWREYXRhID0gbHJ1X2NhY2hlLmdldChrZXksIHggPT4ge1xuICAgICAgICAgIHJldHVybiBfLmVxdWFsKGZyb3plbiwgeC5maWx0ZXJzKTtcbiAgICAgICAgfSwgc3RvcmUsIHRydWUpO1xuICAgICAgaWYgKGNhY2hlZERhdGEpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuY2xlYXJEYXRhQ2FjaGUpIHtcbiAgICAgICAgICAvLyBjbGVhciB0aGUgY2FjaGUgZm9yIGFsbCBwYWdlcyxcbiAgICAgICAgICAvLyB0aGlzIGlzIGltcG9ydGFudCB0byBub3QgY29uZnVzZSB0aGUgdXNlclxuICAgICAgICAgIC8vIGJlY2F1c2UgaWYgb25seSB0aGUgY2FjaGUgZm9yIGEgc3BlY2lmaWMgcGFnZSBudW1iZXIgd2VyZSBjbGVhcmVkLCBpdCB3b3VsZCBiZSBkaWZmaWN1bHQgdG8gdW5kZXJzdGFuZFxuICAgICAgICAgIGxydV9jYWNoZS5yZW1vdmUoa2V5LCB1bmRlZmluZWQsIHN0b3JlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzZXQgdGltZXN0YW1wIG9mIHdoZW4gZGF0YSB3YXMgZmV0Y2hlZFxuICAgICAgICAgIHNlbGZbYW5jaG9yVGltZV0gPSBuZXcgRGF0ZShjYWNoZWREYXRhLmRhdGFbYW5jaG9yVGltZV0pO1xuICAgICAgICAgIHNlbGYuZGF0YUZldGNoVGltZSA9IG5ldyBEYXRlKGNhY2hlZERhdGEudHMpO1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gTkI6IGl0IGlzIGltcG9ydGFudCB0byB1c2UgYSB0aW1lb3V0IG9mIDAgbWlsbGlzZWNvbmRzLCB0b1xuICAgICAgICAgICAgLy8gcmVjcmVhdGUgc2ltaWxhciBzY2VuYXJpbyBsaWtlIHRoZSBvbmUgZ2l2ZW4gYnkgYW4gQUpBWCByZXF1ZXN0XG4gICAgICAgICAgICAvLyAoZS5nLiBmb3IgbGlicmFyaWVzIGxpa2UgS25vY2tvdXQgb3IgVnVlLmpzKVxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIHRoZSB2aWV3IHdvdWxkIGJlIGJ1aWxkIGluIGRpZmZlcmVudCB3YXlzXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIHJlc29sdmUoY2FjaGVkRGF0YS5kYXRhLmRhdGEpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gZmV0Y2ggcmVtb3RlbHlcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgc2VsZi5sb2FkaW5nID0gdHJ1ZTtcbiAgICAgIHNlbGYuZW1pdChcImZldGNoaW5nOmRhdGFcIik7XG4gICAgICBzZWxmLmdldEZldGNoUHJvbWlzZShwYXJhbXMpLnRoZW4oZnVuY3Rpb24gZG9uZShkYXRhKSB7XG4gICAgICAgIGlmICh1c2VMcnUpIHtcbiAgICAgICAgICAvLyBzdG9yZSBpbiBjYWNoZVxuICAgICAgICAgIGxydV9jYWNoZS5zZXQoa2V5LCB7XG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgZmlsdGVyczogcGFyYW1zLFxuICAgICAgICAgICAgYW5jaG9yVGltZTogc2VsZlthbmNob3JUaW1lXS5nZXRUaW1lKClcbiAgICAgICAgICB9LCBvLmxydUNhY2hlU2l6ZSwgby5scnVDYWNoZU1heEFnZSwgc3RvcmUpO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YUZldGNoVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHNlbGYubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICBzZWxmLmVtaXQoXCJmZXRjaGVkOmRhdGFcIik7XG4gICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICB9LCBmdW5jdGlvbiBmYWlsKCkge1xuICAgICAgICBzZWxmLmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgcmVqZWN0KCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgcHJvbWlzZSBvYmplY3QgcmVzcG9uc2libGUgb2YgZmV0Y2hpbmcgZGF0YTtcbiAgICogT3ZlcnJpZGUgdGhpcyBmdW5jdGlvbiBpZiBkYXRhIHNob3VsZCBiZSBmZXRjaGVkIGluIG90aGVyIHdheXNcbiAgICogKGZvciBleGFtcGxlLCByZWFkaW5nIGEgZmlsZSBmcm9tIGZpbGUgc3lzdGVtKS5cbiAgICogVGhpcyBmdW5jdGlvbiBtdXN0IHJldHVybiBhIFByb21pc2Ugb2JqZWN0IG9yIGEgY29tcGF0aWJsZSBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXNcbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICBnZXRGZXRjaFByb21pc2UocGFyYW1zKSB7XG4gICAgLy8gVGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gaW1wbGVtZW50cyBnZXRGZXRjaFByb21pc2UgYnkgZ2VuZXJhdGluZyBhbiBBSkFYIGNhbGwsXG4gICAgLy8gc2luY2UgdGhpcyBpcyB0aGUgbW9zdCBjb21tb24gdXNlIGNhc2Ugc2NlbmFyaW8uXG4gICAgLy8gSG93ZXZlciwgdGhpcyBjbGFzcyBpcyBkZXNpZ25lZCB0byBiZSBhbG1vc3QgYWJzdHJhY3RlZCBmcm9tIEFKQVgsIHNvIG92ZXJyaWRpbmcgdGhpcyBzaW5nbGVcbiAgICAvLyBmdW5jdGlvbiBhbGxvd3MgdG8gZmV0Y2ggZGF0YSBmcm9tIG90aGVyIHNvdXJjZXMgKGUuZy4gcmVhZGluZyBmaWxlcyBpbiBjaHVua3MgZnJvbSBmaWxlIHN5c3RlbTsgcmV0dXJuaW5nIG1vY2sgZGF0YSBmb3IgdW5pdCB0ZXN0czsgZXRjKS5cbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB2YXIgdXJsID0gb3B0aW9ucy51cmw7XG4gICAgaWYgKCF1cmwpIHJhaXNlKDUsIFwiTWlzc2luZyB1cmwgb3B0aW9uLCB0byBmZXRjaCBkYXRhXCIpO1xuXG4gICAgLy8gTkI6IGlmIG1ldGhvZCBpcyBHRVQsIGFqYXggaGVscGVyIHdpbGwgYXV0b21hdGljYWxseSBjb252ZXJ0IGl0IHRvIGEgcXVlcnkgc3RyaW5nXG4gICAgLy8gd2l0aCBrZXlzIGluIGFscGhhYmV0aWNhbCBvcmRlcjsgY29udmVyc2lvbiBpcyBkb25lIHRyYW5zcGFyZW50bHlcbiAgICB2YXIgbWV0aG9kID0gb3B0aW9ucy5odHRwTWV0aG9kO1xuXG4gICAgLy8gZm9ybWF0IGZldGNoIGRhdGFcbiAgICBwYXJhbXMgPSB0aGlzLmZvcm1hdEZldGNoRGF0YShwYXJhbXMpO1xuXG4gICAgcmV0dXJuIGFqYXguc2hvdCh7XG4gICAgICB0eXBlOiBtZXRob2QsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGRhdGE6IHBhcmFtc1xuICAgIH0pO1xuICB9XG5cbiAgbnVtYmVyRmlsdGVyRm9ybWF0dGVyKHByb3BlcnR5TmFtZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICBkYXRlRmlsdGVyRm9ybWF0dGVyKHByb3BlcnR5TmFtZSwgdmFsdWUpIHtcbiAgICByZXR1cm4gRC50b0lzbzg2MDEodmFsdWUpO1xuICB9XG5cbiAgZm9ybWF0RmV0Y2hEYXRhKGRhdGEpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB2YXIgc29ydEJ5Rm9ybWF0dGVyID0gb3B0aW9ucy5zb3J0QnlGb3JtYXR0ZXI7XG4gICAgaWYgKGRhdGEuc29ydEJ5ICYmIF8uaXNGdW5jdGlvbihzb3J0QnlGb3JtYXR0ZXIpKSB7XG4gICAgICBkYXRhLnNvcnRCeSA9IHNvcnRCeUZvcm1hdHRlcihkYXRhLnNvcnRCeSk7XG4gICAgfVxuXG4gICAgdmFyIHg7XG4gICAgZm9yICh4IGluIGRhdGEpIHtcbiAgICAgIHZhciB2ID0gZGF0YVt4XTtcbiAgICAgIGlmICh2IGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICBkYXRhW3hdID0gdGhpcy5kYXRlRmlsdGVyRm9ybWF0dGVyKHgsIHYpO1xuICAgICAgfVxuICAgICAgaWYgKHYgaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgZGF0YVt4XSA9IHRoaXMubnVtYmVyRmlsdGVyRm9ybWF0dGVyKHgsIHYpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCB0aGF0IGRlc2NyaWJlIGFsbCBmaWx0ZXJzIGFuZCBuZWNlc3Nhcnkgb3B0aW9ucyB0byBmZXRjaCBkYXRhLlxuICAgKi9cbiAgbWl4aW5GZXRjaERhdGEoKSB7XG4gICAgdmFyIGV4dHJhRGF0YSA9IHRoaXMub3B0aW9ucy5mZXRjaERhdGE7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihleHRyYURhdGEpKSBcbiAgICAgIGV4dHJhRGF0YSA9IGV4dHJhRGF0YS5jYWxsKHRoaXMpO1xuICAgIHJldHVybiBfLmV4dGVuZCh0aGlzLmdldEZpbHRlcnNTZXRDYWNoZSgpLCBleHRyYURhdGEgfHwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuc3VyZXMgdGhhdCBhIGNvbGxlY3Rpb24gaXMgbm9ybWFsaXplZCwgaWYgdGhlIHNlcnZlciBpcyByZXR1cm5pbmcgYW4gb3B0aW1pemVkXG4gICAqIGNvbGxlY3Rpb24gaW4gdGhlIHNoYXBlIG9mIGFycmF5IG9mIGFycmF5cy5cbiAgICogT3B0aW1pemVkIGNvbGxlY3Rpb25zIGFyZSBjb252ZXJ0ZWQgaW4gZGljdGlvbmFyaWVzLCBmb3IgZWFzaWVyIGhhbmRsaW5nIGR1cmluZyByZW5kZXJpbmcsXG4gICAqIGFzIHZhbHVlcyBjYW4gYmUgaGFuZGxlZCBieSBwcm9wZXJ0eSBuYW1lIGluc3RlYWQgb2YgYXJyYXkgaW5kZXguXG4gICAqXG4gICAqIEBwYXJhbSBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uIHRvIG5vcm1hbGl6ZVxuICAgKi9cbiAgbm9ybWFsaXplQ29sbGVjdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGwgPSBjb2xsZWN0aW9uLmxlbmd0aDtcbiAgICBpZiAoIWwpXG4gICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB2YXIgZmlyc3QgPSBjb2xsZWN0aW9uWzBdO1xuICAgIGlmIChfLmlzQXJyYXkoZmlyc3QpKSB7XG4gICAgICAvLyBhc3N1bWVzIHRoYXQgdGhlIHNlcnZlciBpcyByZXR1cm5pbmcgYW4gb3B0aW1pemVkIGNvbGxlY3Rpb246XG4gICAgICAvLyB0aGUgZmlyc3QgYXJyYXkgY29udGFpbnMgdGhlIGNvbHVtbiBuYW1lczsgd2hpbGUgdGhlIG90aGVycyB0aGUgdmFsdWVzLlxuICAgICAgdmFyIGEgPSBbXSwgaSwgaiA9IGZpcnN0Lmxlbmd0aCwgaztcbiAgICAgIGZvciAoaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIG8gPSB7fTtcbiAgICAgICAgZm9yIChrID0gMDsgayA8IGo7IGsrKykge1xuICAgICAgICAgIG9bZmlyc3Rba11dID0gY29sbGVjdGlvbltpXVtrXTtcbiAgICAgICAgfVxuICAgICAgICBhLnB1c2gobyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgLy8gdGhlIGNvbGxlY3Rpb24gaXMgbm90IG9wdGltaXplZFxuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBvZiBpdGVtcy5cbiAgICovXG4gIGdldERhdGEob3B0aW9ucykge1xuICAgIHZhciBvID0gXy5leHRlbmQoe1xuICAgICAgb3B0aW1pemU6IGZhbHNlLFxuICAgICAgaXRlbUNvdW50OiB0cnVlLFxuICAgICAgaGlkZTogdHJ1ZSAgLy8gd2hldGhlciB0byBleGNsdWRlIGBoaWRkZW5gIGNvbHVtbnNcbiAgICB9LCBvcHRpb25zKSxcbiAgICAgIHNlbGYgPSB0aGlzLFxuICAgICAgaXRlbUNvdW50ID0gc2VsZi5vcHRpb25zLml0ZW1Db3VudCAmJiBvLml0ZW1Db3VudDtcbiAgICB2YXIgZGF0YSA9IHNlbGYuZ2V0SXRlbXNUb0Rpc3BsYXkoKTtcbiAgICB2YXIgY29sdW1ucyA9IF8uY2xvbmUoc2VsZi5jb2x1bW5zKTtcbiAgICBpZiAoby5oaWRlKSB7XG4gICAgICAvLyBkZWxldGUgaGlkZGVuIHByb3BlcnRpZXNcbiAgICAgIF8uZWFjaChfLndoZXJlKHNlbGYuY29sdW1ucywgbyA9PiB7XG4gICAgICAgIHJldHVybiBvLmhpZGRlbiB8fCBvLnNlY3JldDtcbiAgICAgIH0pLCBvID0+IHtcbiAgICAgICAgXy5lYWNoKGRhdGEsIGQgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBkW28ubmFtZV07XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBjb2x1bW5zID0gXy53aGVyZShzZWxmLmNvbHVtbnMsIG8gPT4ge1xuICAgICAgICByZXR1cm4gIW8uaGlkZGVuICYmICFvLnNlY3JldDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaXRlbUNvdW50KSB7XG4gICAgICBzZWxmLnNldEl0ZW1zTnVtYmVyKGRhdGEpO1xuICAgIH1cbiAgICBpZiAoby5vcHRpbWl6ZSkge1xuICAgICAgaWYgKGl0ZW1Db3VudCkge1xuICAgICAgICBjb2x1bW5zLnVuc2hpZnQoe1xuICAgICAgICAgIG5hbWU6IFwizrVfcm93XCIsXG4gICAgICAgICAgZGlzcGxheU5hbWU6IFwiI1wiXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlbGYub3B0aW1pemVDb2xsZWN0aW9uKGRhdGEsIGNvbHVtbnMsIG8pO1xuICAgIH1cbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBpdGVtcyB0byBkaXNwbGF5IGZvciB0aGlzIHRhYmxlIGF0IGl0cyBjdXJyZW50IHN0YXRlLlxuICAgKi9cbiAgZ2V0SXRlbXNUb0Rpc3BsYXkoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBcbiAgICAgICAgb3B0aW9ucyA9IHNlbGYub3B0aW9ucyxcbiAgICAgICAgZGF0YSA9IHNlbGYuZGF0YTtcbiAgICBpZiAoIWRhdGEgfHwgIWRhdGEubGVuZ3RoKVxuICAgICAgcmV0dXJuIFtdO1xuICAgIC8vXG4gICAgLy8gY2xvbmUgdGhlIGRhdGE7IHRoaXMgaXMgcmVxdWlyZWQgdG8gYWx0ZXIgaXRlbXNcbiAgICAvLyB3aXRob3V0IGFmZmVjdGluZyBvcmlnaW5hbCBpdGVtc1xuICAgIC8vXG4gICAgZGF0YSA9IF8uY2xvbmUoZGF0YSk7XG5cbiAgICBpZiAoIXNlbGYuZml4ZWQpIHJldHVybiBkYXRhO1xuXG4gICAgLy8gcGFnaW5hdGUsIGZpbHRlciBhbmQgc29ydCBjbGllbnQgc2lkZVxuICAgIHZhciBsID0gZGF0YS5sZW5ndGg7XG4gICAgLy8gYXBwbHkgZmlsdGVycyBoZXJlXG4gICAgZGF0YSA9IHNlbGYuZmlsdGVycy5za2ltKGRhdGEpO1xuICAgIGlmIChkYXRhLmxlbmd0aCAhPSBsKSB7XG4gICAgICBzZWxmLnVwZGF0ZVBhZ2luYXRpb24oZGF0YS5sZW5ndGgpO1xuICAgIH1cbiAgICAvLyBhcHBseSBzb3J0aW5nIGxvZ2ljLCBidXQgb25seSBpZiB0aGVyZSBpcyBubyBzZWFyY2ggc3BlY2lmaWVkICh0aGUgc2VhcmNoIGJ5IHN0cmluZyBwcm9wZXJ0eSBpcyBhbHJlYWR5IHNvcnRpbmcgcmVhbGx5IHdlbGwpLFxuICAgIC8vIG9yIGlmIHRoZSBzZWFyY2ggc29ydGluZyBpcyBjb25maWd1cmVkIHRvIG5vdCBydWxlcyBvdmVyIHRoZSByZWd1bGFyIHNvcnRpbmdcbiAgICBpZiAoIXNlbGYuc2VhcmNoVGV4dCB8fCAhb3B0aW9ucy5zZWFyY2hTb3J0aW5nUnVsZXMpIHtcbiAgICAgIHZhciBzb3J0Q3JpdGVyaWEgPSBzZWxmLnNvcnRDcml0ZXJpYTtcbiAgICAgIGlmICghXy5pc0VtcHR5KHNvcnRDcml0ZXJpYSkpIHtcbiAgICAgICAgQS5zb3J0QnkoZGF0YSwgc29ydENyaXRlcmlhKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb2J0YWluIGEgc3Vic2V0IG9mIGRhdGEsIGFmdGVyIHNvcnRpbmcgKHRoaXMgb3JkZXIgaXMgcmVhbGx5IGltcG9ydGFudClcbiAgICB2YXIgc3Vic2V0ID0gc2VsZi5nZXRTdWJTZXQoZGF0YSk7XG4gICAgcmV0dXJuIHN1YnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTb3J0cyB0aGUgdW5kZXJseWluZyBpdGVtcyBieSBvbmUgb3IgbW9yZSBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAcGFyYW0geyhzdHJpbmd8c3RyaW5nW118b2JqZWN0cyl9IGNyaXRlcmlhOiBvYmplY3QgZGVzY3JpYmluZ1xuICAgKi9cbiAgc29ydEJ5KCkge1xuICAgIHZhciBjcml0ZXJpYSA9IEEuZ2V0U29ydENyaXRlcmlhKGFyZ3VtZW50cyk7XG4gICAgaWYgKCFjcml0ZXJpYSB8fCAhY3JpdGVyaWEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy51bnNldFNvcnRCeSgpO1xuICAgIH1cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zb3J0Q3JpdGVyaWEgPSBjcml0ZXJpYTtcbiAgICBpZiAoc2VsZi5oYXNEYXRhKCkpIHtcbiAgICAgIC8vIHJlbmRlciAod2lsbCB0cmlnZ2VyIHN0b3JpbmcgZmlsdGVycyBpbiBjYWNoZSlcbiAgICAgIEEuc29ydEJ5KHNlbGYuZGF0YSwgY3JpdGVyaWEpO1xuICAgICAgc2VsZi5yZW5kZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gc3RvcmUgZmlsdGVycyBpbiBjYWNoZVxuICAgICAgc2VsZi5nZXRGaWx0ZXJzU2V0Q2FjaGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAvKipcbiAgICogUHJvZ3Jlc3Mgc29ydCBvcmRlciBmb3IgYSBwcm9wZXJ0eSB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgcHJvZ3Jlc3NTb3J0QnkobmFtZSkge1xuICAgIGlmICghbmFtZSkgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwibmFtZVwiKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNvbHVtbnMgPSBzZWxmLmNvbHVtbnM7XG4gICAgaWYgKCFjb2x1bW5zKSB7XG4gICAgICAvLyB0aGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgb25seSB3aGVuIGNvbHVtbnMgaW5mb3JtYXRpb24gYXJlIGluaXRpYWxpemVkXG4gICAgICByYWlzZSgyMCwgXCJNaXNzaW5nIGNvbHVtbnMgaW5mb3JtYXRpb25cIik7XG4gICAgfVxuICAgIHZhciBwcm9wZXJ0eSA9IF8uZmluZChjb2x1bW5zLCB4ID0+IHtcbiAgICAgIHJldHVybiB4Lm5hbWUgPT0gbmFtZTtcbiAgICB9KTtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICByYWlzZSgxOSwgXCJDb2x1bW4gJyR7bmFtZX0nIGlzIG5vdCBmb3VuZCBhbW9uZyBjb2x1bW5zLlwiKTtcbiAgICB9XG4gICAgdmFyIGNyaXRlcmlhID0gc2VsZi5zb3J0Q3JpdGVyaWEgfHwgW107XG4gICAgdmFyIGV4aXN0aW5nU29ydCA9IF8uZmluZChjcml0ZXJpYSwgeCA9PiB7XG4gICAgICByZXR1cm4geFswXSA9PSBuYW1lO1xuICAgIH0pO1xuICAgIGlmICghZXhpc3RpbmdTb3J0KSB7XG4gICAgICAvLyBzdGFydCBieSBhc2NlbmRpbmcsIGJ5IGRlZmF1bHRcbiAgICAgIGNyaXRlcmlhLnB1c2goW25hbWUsIDFdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9yZGVyID0gZXhpc3RpbmdTb3J0WzFdO1xuICAgICAgaWYgKG9yZGVyID09PSAtMSkge1xuICAgICAgICAvLyByZW1vdmVcbiAgICAgICAgY3JpdGVyaWEgPSBfLnJlamVjdChjcml0ZXJpYSwgeCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHhbMF0gPT0gbmFtZTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBvcmRlciBjYW4gb25seSBiZSAxLCBtb3ZlIGJ5IDFcbiAgICAgICAgZXhpc3RpbmdTb3J0WzFdID0gLTE7XG4gICAgICB9XG4gICAgfVxuICAgIHNlbGYuc29ydEJ5KGNyaXRlcmlhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9ncmVzcyBzb3J0IG9yZGVyIGZvciBhIHNpbmdsZSBwcm9wZXJ0eSB3aXRoIHRoZSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgcHJvZ3Jlc3NTb3J0QnlTaW5nbGUobmFtZSkge1xuICAgIGlmICghbmFtZSkgQXJndW1lbnROdWxsRXhjZXB0aW9uKFwibmFtZVwiKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNvbHVtbnMgPSBzZWxmLmNvbHVtbnM7XG4gICAgaWYgKCFjb2x1bW5zKSB7XG4gICAgICAvLyB0aGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgb25seSB3aGVuIGNvbHVtbnMgaW5mb3JtYXRpb24gYXJlIGluaXRpYWxpemVkXG4gICAgICByYWlzZSgyMCwgXCJNaXNzaW5nIGNvbHVtbnMgaW5mb3JtYXRpb25cIik7XG4gICAgfVxuICAgIHZhciBwcm9wZXJ0eSA9IF8uZmluZChjb2x1bW5zLCB4ID0+IHtcbiAgICAgIHJldHVybiB4Lm5hbWUgPT0gbmFtZTtcbiAgICB9KTtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICByYWlzZSgxOSwgXCJDb2x1bW4gJyR7bmFtZX0nIGlzIG5vdCBmb3VuZCBhbW9uZyBjb2x1bW5zLlwiKTtcbiAgICB9XG4gICAgdmFyIGNyaXRlcmlhID0gc2VsZi5zb3J0Q3JpdGVyaWEgfHwgW107XG4gICAgdmFyIGV4aXN0aW5nU29ydCA9IF8uZmluZChjcml0ZXJpYSwgeCA9PiB7XG4gICAgICByZXR1cm4geFswXSA9PSBuYW1lO1xuICAgIH0pO1xuICAgIGlmICghZXhpc3RpbmdTb3J0KSB7XG4gICAgICAvLyBzdGFydCBieSBhc2NlbmRpbmcsIGJ5IGRlZmF1bHRcbiAgICAgIGNyaXRlcmlhID0gW25hbWUsIDFdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgb3JkZXIgPSBleGlzdGluZ1NvcnRbMV07XG4gICAgICBpZiAob3JkZXIgPT09IC0xKSB7XG4gICAgICAgIGNyaXRlcmlhID0gW25hbWUsIDFdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3JpdGVyaWEgPSBbbmFtZSwgLTFdO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLnNvcnRCeShbY3JpdGVyaWFdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnNldHMgdGhlIHNvcnQgYnkgY3JpdGVyaWEgZm9yIHRoaXMgdGFibGUuXG4gICAqL1xuICB1bnNldFNvcnRCeSgpIHtcbiAgICB0aGlzLnNvcnRDcml0ZXJpYSA9IG51bGw7XG4gICAgLy8gcmVuZGVyICh3aWxsIHRyaWdnZXIgc3RvcmluZyBmaWx0ZXJzIGluIGNhY2hlKVxuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbnVtZXJhdGlvbiBpbnNpZGUgYSBnaXZlbiBhcnJheSBvZiBpdGVtcy5cbiAgICovXG4gIHNldEl0ZW1zTnVtYmVyKGFycikge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgcGFnID0gc2VsZi5wYWdpbmF0aW9uLFxuICAgICAgICBvZmZzZXQgPSAocGFnLnBhZ2UgLSAxKSAqIHBhZy5yZXN1bHRzUGVyUGFnZTtcbiAgICBpZiAoIWFycikgYXJyID0gc2VsZi5kYXRhO1xuICAgIHZhciBsID0gYXJyLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgYXJyW2ldLs61X3JvdyA9IChpICsgMSArIG9mZnNldCkudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuXG4gIC8qKlxuICAgKiBPcHRpbWl6ZXMgYSBjb2xsZWN0aW9uOyBtYWtpbmcgaXRzIHN0cnVjdHVyZSBzbWFsbGVyIGJ5IHJlbW92aW5nIHRoZSBwcm9wZXJ0eSBuYW1lcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGFcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gY29sdW1uczogY29sdW1ucyB0byBpbmNsdWRlLlxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uczogb3B0aW9ucyB0byBvcHRpbWl6ZSB0aGUgY29sbGVjdGlvbi5cbiAgICovXG4gIG9wdGltaXplQ29sbGVjdGlvbihkYXRhLCBjb2x1bW5zLCBvcHRpb25zKSB7XG4gICAgaWYgKCFjb2x1bW5zKSBjb2x1bW5zID0gdGhpcy5jb2x1bW5zO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHtcbiAgICAgIGZvcm1hdDogdHJ1ZVxuICAgIH07XG4gICAgdmFyIGEgPSBbXy5tYXAoY29sdW1ucywgbyA9PiBvLmRpc3BsYXlOYW1lKV0sIGxlbiA9IFwibGVuZ3RoXCIsXG4gICAgICAgICBwdXNoID0gXCJwdXNoXCIsXG4gICAgICAgICBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCxcbiAgICAgICAgIGZvcm1hdHRlZFN1ZmZpeCA9IHRoaXMub3B0aW9ucy5mb3JtYXR0ZWRTdWZmaXgsXG4gICAgICAgICBvYmo7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhW2xlbl07IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBiID0gW107XG4gICAgICBmb3IgKHZhciBrID0gMCwgaiA9IGNvbHVtbnNbbGVuXTsgayA8IGo7IGsrKykge1xuICAgICAgICB2YXIgY29sbmFtZSA9IGNvbHVtbnNba10ubmFtZSxcbiAgICAgICAgICAgIGZvcm1hdHRlZE5hbWUgPSBjb2xuYW1lICsgZm9ybWF0dGVkU3VmZml4O1xuICAgICAgICBvYmogPSBkYXRhW2ldO1xuICAgICAgICBpZiAoZm9ybWF0ICYmIF8uaGFzKG9iaiwgZm9ybWF0dGVkTmFtZSkpIHtcbiAgICAgICAgICBiW3B1c2hdKG9ialtmb3JtYXR0ZWROYW1lXSk7XG4gICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgIC8vIE5COiBpZiB0aGUgb2JqZWN0IGRvZXMgbm90IGhhdmUgYSBwcm9wZXJ0eSwgc3RyaW5nIGVtcHR5IGlzIGFkZGVkXG4gICAgICAgICAgLy8gdG8gZmlsbCB0aGUgcHJvcGVydHkgcGxhY2UuXG4gICAgICAgICAgYltwdXNoXShvYmpbY29sbmFtZV0gfHwgXCJcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFbcHVzaF0oYik7XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBwcm9wZXJ0eSBmcm9tIHRoZSBnaXZlbiBpdGVtLFxuICAgKiBldmVudHVhbGx5IHJldHVybmluZyB0aGUgZm9ybWF0dGVkIHZhbHVlLlxuICAgKi9cbiAgZ2V0SXRlbVZhbHVlKGl0ZW0sIG5hbWUpIHtcbiAgICBpZiAoIWl0ZW0pIEFyZ3VtZW50TnVsbEV4Y2VwdGlvbihcIml0ZW1cIik7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGZvcm1hdHRlZFN1ZmZpeCA9IG9wdGlvbnMuZm9ybWF0dGVkU3VmZml4LFxuICAgICAgICBmb3JtYXR0ZWROYW1lID0gbmFtZSArIGZvcm1hdHRlZFN1ZmZpeDtcbiAgICByZXR1cm4gXy5oYXMoaXRlbSwgZm9ybWF0dGVkTmFtZSkgPyBpdGVtW2Zvcm1hdHRlZE5hbWVdIDogaXRlbVtuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZhdWx0IGZ1bmN0aW9uIHRvIGdldCB0aGUgbmFtZSBvZiB0aGUgaWQgcHJvcGVydHkgb2YgZGlzcGxheWVkIG9iamVjdHMuXG4gICAqL1xuICBnZXRJZFByb3BlcnR5KCkge1xuICAgIHZhciBvID0gdGhpcy5vcHRpb25zO1xuICAgIGlmIChfLmlzU3RyaW5nKG8uaWRQcm9wZXJ0eSkpIHJldHVybiBvLmlkUHJvcGVydHk7XG5cbiAgICB2YXIgY29sdW1ucyA9IHRoaXMuY29sdW1ucztcbiAgICBpZiAoIWNvbHVtbnMgfHwgIWNvbHVtbnMubGVuZ3RoKSByYWlzZSg0LCBcImlkIHByb3BlcnR5IGNhbm5vdCBiZSBkZXRlcm1pbmVkOiBjb2x1bW5zIGFyZSBub3QgaW5pdGlhbGl6ZWQuXCIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb2x1bW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdmFyIG5hbWUgPSBjb2x1bW5zW2ldLm5hbWU7XG4gICAgICBpZiAoL15fP2lkJHxeXz9ndWlkJC9pLnRlc3QobmFtZSkpXG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbiAgICByYWlzZSg0LCBcImlkIHByb3BlcnR5IGNhbm5vdCBiZSBkZXRlcm1pbmVkLCBwbGVhc2Ugc3BlY2lmeSBpdCB1c2luZyAnaWRQcm9wZXJ0eScgb3B0aW9uLlwiKTtcbiAgfVxuXG4gIGdldEV4cG9ydEZpbGVOYW1lKGZvcm1hdCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuY29sbGVjdGlvbk5hbWUgKyBcIi5cIiArIGZvcm1hdDtcbiAgfVxuXG4gIGdldENvbHVtbnNGb3JFeHBvcnQoKSB7XG4gICAgdmFyIGNvbHVtbnMgPSB0aGlzLmNvbHVtbnM7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5leHBvcnRIaWRkZW5Qcm9wZXJ0aWVzXG4gICAgICA/IGNvbHVtbnNcbiAgICAgIDogXy5yZWplY3QoY29sdW1ucywgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgcmV0dXJuIG8uaGlkZGVuIHx8IG8uc2VjcmV0O1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xpZW50IHNpZGUgZXhwb3J0IGZvciBhIHNwZWNpZmljIGZvcm1hdC5cbiAgICovXG4gIGV4cG9ydFRvKGZvcm1hdCkge1xuICAgIGlmICghZm9ybWF0KSBBcmd1bWVudEV4Y2VwdGlvbihcImZvcm1hdFwiKTtcblxuICAgIHZhciBzZWxmID0gdGhpcywgb3B0aW9ucyA9IHNlbGYub3B0aW9ucztcbiAgICB2YXIgZmlsZW5hbWUgPSBzZWxmLmdldEV4cG9ydEZpbGVOYW1lKGZvcm1hdCksXG4gICAgICBleHBvcnRGb3JtYXQgPSBfLmZpbmQoc2VsZi5vcHRpb25zLmV4cG9ydEZvcm1hdHMsIGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIHJldHVybiBvLmZvcm1hdCA9PT0gZm9ybWF0O1xuICAgICAgfSksXG4gICAgICBjb2x1bW5zID0gc2VsZi5nZXRDb2x1bW5zRm9yRXhwb3J0KCk7XG4gICAgaWYgKCFleHBvcnRGb3JtYXQgfHwgIWV4cG9ydEZvcm1hdC50eXBlKSByYWlzZSgzMCwgXCJNaXNzaW5nIGZvcm1hdCBpbmZvcm1hdGlvblwiKTtcblxuICAgIHZhciBpdGVtc1RvRGlzcGxheSA9IHNlbGYuZ2V0RGF0YSh7IGl0ZW1Db3VudDogZmFsc2UgfSk7XG4gICAgdmFyIGNvbnRlbnRzID0gXCJcIjtcbiAgICBpZiAoZXhwb3J0Rm9ybWF0LmhhbmRsZXIpIHtcbiAgICAgIC8vdXNlciBkZWZpbmVkIGhhbmRsZXJcbiAgICAgIGNvbnRlbnRzID0gZXhwb3J0Rm9ybWF0LmhhbmRsZXIuY2FsbChzZWxmLCBpdGVtc1RvRGlzcGxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdXNlIGRlZmF1bHQgZXhwb3J0IGhhbmRsZXJzXG4gICAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgICBjYXNlIFwiY3N2XCI6XG4gICAgICAgICAgdmFyIGRhdGEgPSBzZWxmLm9wdGltaXplQ29sbGVjdGlvbihpdGVtc1RvRGlzcGxheSk7XG4gICAgICAgICAgY29udGVudHMgPSBjc3Yuc2VyaWFsaXplKGRhdGEsIG9wdGlvbnMuY3N2T3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJqc29uXCI6XG4gICAgICAgICAgY29udGVudHMgPSBqc29uLmNvbXBvc2UoaXRlbXNUb0Rpc3BsYXksIDIsIDIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwieG1sXCI6XG4gICAgICAgICAgY29udGVudHMgPSBzZWxmLmRhdGFUb1htbChpdGVtc1RvRGlzcGxheSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgXCJleHBvcnQgZm9ybWF0IFwiICsgZm9ybWF0ICsgXCJub3QgaW1wbGVtZW50ZWRcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbnRlbnRzKVxuICAgICAgRmlsZVV0aWwuZXhwb3J0ZmlsZShmaWxlbmFtZSwgY29udGVudHMsIGV4cG9ydEZvcm1hdC50eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNpYyBmdW5jdGlvbiB0byBjb252ZXJ0IHRoZSBnaXZlbiBkYXRhIGludG8gYW4geG1sIHN0cnVjdHVyZS5cbiAgICovXG4gIGRhdGFUb1htbCAoZGF0YSkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIGNvbHVtbnMgPSBzZWxmLmdldENvbHVtbnNGb3JFeHBvcnQoKSxcbiAgICAgIG9wdGlvbnMgPSBzZWxmLm9wdGlvbnMsXG4gICAgICBsZW4gPSBcImxlbmd0aFwiLFxuICAgICAgZCA9IGRvY3VtZW50LFxuICAgICAgcyA9IG5ldyBYTUxTZXJpYWxpemVyKCksXG4gICAgICBjcmVhdGVFbGVtZW50ID0gXCJjcmVhdGVFbGVtZW50XCIsXG4gICAgICBhcHBlbmRDaGlsZCA9IFwiYXBwZW5kQ2hpbGRcIixcbiAgICAgIHJvb3QgPSBkW2NyZWF0ZUVsZW1lbnRdKG9wdGlvbnMuY29sbGVjdGlvbk5hbWUgfHwgXCJjb2xsZWN0aW9uXCIpO1xuICAgICAgXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBkYXRhW2xlbl07IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gZFtjcmVhdGVFbGVtZW50XShvcHRpb25zLmVudGl0eU5hbWUgfHwgXCJpdGVtXCIpO1xuICAgICAgZm9yICh2YXIgayA9IDAsIGogPSBjb2x1bW5zW2xlbl07IGsgPCBqOyBrKyspIHtcbiAgICAgICAgdmFyIGNvbCA9IGNvbHVtbnNba10sIG5hbWUgPSBjb2wubmFtZSwgdmFsdWUgPSBkYXRhW2ldW25hbWVdO1xuICAgICAgICBpZiAob3B0aW9ucy5lbnRpdHlVc2VQcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgLy91c2UgcHJvcGVydGllc1xuICAgICAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvL3VzZSBlbGVtZW50c1xuICAgICAgICAgIHZhciBzdWJpdGVtID0gZFtjcmVhdGVFbGVtZW50XShuYW1lKTtcbiAgICAgICAgICBzdWJpdGVtLmlubmVyVGV4dCA9IHZhbHVlO1xuICAgICAgICAgIGl0ZW1bYXBwZW5kQ2hpbGRdKHN1Yml0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByb290W2FwcGVuZENoaWxkXShpdGVtKTtcbiAgICB9XG4gICAgdmFyIGEgPSBzLnNlcmlhbGl6ZVRvU3RyaW5nKHJvb3QpO1xuICAgIHJldHVybiBvcHRpb25zLnByZXR0eVhtbCA/IHhtbC5wcmV0dHkoYSkgOiB4bWwubm9ybWFsKGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0geyp9IG9iaiBcbiAgICovXG4gIGRpc3Bvc2VPZihvYmopIHtcbiAgICBvYmouZGlzcG9zZSgpO1xuICAgIF8ucmVtb3ZlSXRlbSh0aGlzLmRpc3Bvc2FibGVzLCBvYmopO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoaXMgS2luZ1RhYmxlLlxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICBkZWxldGUgdGhpcy5jb250ZXh0O1xuICAgIGRlbGV0ZSB0aGlzLnNlYXJjaDtcbiAgICBkZWxldGUgdGhpcy5maWx0ZXJzLmNvbnRleHQ7XG4gICAgXy5lYWNoKHRoaXMuZGlzcG9zYWJsZXMsIHggPT4ge1xuICAgICAgaWYgKHguZGlzcG9zZSlcbiAgICAgICAgeC5kaXNwb3NlKCk7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKHgpKVxuICAgICAgICB4KCk7XG4gICAgfSk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IFtdO1xuICAgIHZhciBvID0gdGhpcy5vcHRpb25zO1xuICAgIF8uaWZjYWxsKG8ub25EaXNwb3NlLCB0aGlzKTtcbiAgfVxufVxuXG4vLyBFeHRlbmQgS2luZ1RhYmxlIG9iamVjdCB3aXRoIHByb3BlcnRpZXMgdGhhdCBhcmUgbWVhbnQgdG8gYmUgZ2xvYmFsbHkgYXZhaWxhYmxlIGFuZCBlZGl0YWJsZVxuLy8gZm9yIHVzZXJzIG9mIHRoZSBsaWJyYXJ5IChwcm9ncmFtbWVycylcbi8vIE5COiBzdGF0aWMgZ2V0IHdvdWxkbid0IHdvcmsgYmVjYXVzZSB0aGUgb2JqZWN0IHdvdWxkIG5vdCBiZSBlZGl0YWJsZS5cbi8vXG5LaW5nVGFibGUuZGVmYXVsdHMgPSBERUZBVUxUUztcblxuS2luZ1RhYmxlLlNjaGVtYXMgPSB7XG4gIC8qKlxuICAgKiBEZWZhdWx0IGNvbHVtbnMgcHJvcGVydGllcywgYnkgZmllbGQgdmFsdWUgdHlwZS5cbiAgICogVGhpcyBvYmplY3QgaXMgbWVhbnQgdG8gYmUgZXh0ZW5kZWQgYnkgaW1wbGVtZW50ZXJzOyBmb2xsb3dpbmcgdGhlaXIgcGVyc29uYWwgcHJlZmVyZW5jZXMuXG4gICAqL1xuICBEZWZhdWx0QnlUeXBlOiB7XG4gICAgbnVtYmVyOiBmdW5jdGlvbiAoY29sdW1uU2NoZW1hLCBvYmpTY2hlbWEpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgLy8gTkI6IHRoaXMgZnVuY3Rpb24gaXMgdXNlZCBvbmx5IGlmIGEgZm9ybWF0dGVyIGZ1bmN0aW9uIGlzIG5vdFxuICAgICAgICAgIC8vIGRlZmluZWQgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eTsgc28gaGVyZSB3ZSBzdWdnZXN0IGEgZm9ybWF0IHRoYXQgbWFrZXMgc2Vuc2UgZm9yIHRoZSB2YWx1ZS5cbiAgICAgICAgICByZXR1cm4gTi5mb3JtYXQodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0sXG4gICAgZGF0ZTogZnVuY3Rpb24gKGNvbHVtblNjaGVtYSwgb2JqU2NoZW1hKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uIGRhdGVGb3JtYXR0ZXIodmFsdWUpIHtcbiAgICAgICAgICAvLyBOQjogdGhpcyBmdW5jdGlvbiBpcyB1c2VkIG9ubHkgaWYgYSBmb3JtYXR0ZXIgZnVuY3Rpb24gaXMgbm90XG4gICAgICAgICAgLy8gZGVmaW5lZCBmb3IgdGhlIGdpdmVuIHByb3BlcnR5OyBzbyBoZXJlIHdlIHN1Z2dlc3QgYSBmb3JtYXQgdGhhdCBtYWtlcyBzZW5zZSBmb3IgdGhlIHZhbHVlLlxuXG4gICAgICAgICAgLy8gc3VwcG9ydCBkYXRlIGZvcm1hdCBkZWZpbmVkIGluc2lkZSBjb2x1bW4gc2NoZW1hXG4gICAgICAgICAgLy8gdXNlIGEgZm9ybWF0IHRoYXQgbWFrZXMgc2Vuc2UgZm9yIHRoZSB2YWx1ZVxuICAgICAgICAgIC8vIGlmIHRoZSBkYXRlIGhhcyB0aW1lIGNvbXBvbmVudCwgdXNlIGZvcm1hdCB0aGF0IGNvbnRhaW5zIHRpbWU7IG90aGVyd2lzZSBvbmx5IGRhdGUgcGFydFxuICAgICAgICAgIHZhciBoYXNUaW1lID0gS2luZ1RhYmxlLkRhdGVVdGlscy5oYXNUaW1lKHZhbHVlKTtcbiAgICAgICAgICB2YXIgZm9ybWF0ID0gS2luZ1RhYmxlLkRhdGVVdGlscy5kZWZhdWx0cy5mb3JtYXRbaGFzVGltZSA/IFwibG9uZ1wiIDogXCJzaG9ydFwiXTtcbiAgICAgICAgICByZXR1cm4gS2luZ1RhYmxlLkRhdGVVdGlscy5mb3JtYXQodmFsdWUsIGZvcm1hdCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBEZWZhdWx0IGNvbHVtbnMgcHJvcGVydGllcywgYnkgZmllbGQgbmFtZS5cbiAgICogVGhpcyBvYmplY3QgaXMgbWVhbnQgdG8gYmUgZXh0ZW5kZWQgYnkgaW1wbGVtZW50ZXJzOyBmb2xsb3dpbmcgdGhlaXIgcGVyc29uYWwgcHJlZmVyZW5jZXMuXG4gICAqL1xuICBEZWZhdWx0QnlOYW1lOiB7XG4gICAgaWQ6IHtcbiAgICAgIG5hbWU6IFwiaWRcIixcbiAgICAgIHR5cGU6IFwiaWRcIixcbiAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgIHNlY3JldDogdHJ1ZVxuICAgIH0sXG4gICAgZ3VpZDoge1xuICAgICAgbmFtZTogXCJndWlkXCIsXG4gICAgICB0eXBlOiBcImd1aWRcIixcbiAgICAgIGhpZGRlbjogdHJ1ZSxcbiAgICAgIHNlY3JldDogdHJ1ZVxuICAgIH1cbiAgfVxufTtcblxuLy8gZXhwb3NlIGFqYXggZnVuY3Rpb25zXG5LaW5nVGFibGUuQWpheCA9IGFqYXg7XG5cbi8vIFBvbGx1dGUgdGhlIHdpbmRvdyBuYW1lc3BhY2Ugd2l0aCB0aGUgS2luZ1RhYmxlIG9iamVjdCxcbi8vIHRoaXMgaXMgaW50ZW50aW9uYWwsIHNvIHRoZSB1c2VycyBvZiB0aGUgbGlicmFyeSB0aGF0IGRvbid0IHdvcmsgd2l0aCBFUzYsIHlldCxcbi8vIGNhbiBvdmVycmlkZSBpdHMgZnVuY3Rpb25zIHVzaW5nOiBLaW5nVGFibGUucHJvdG90eXBlLnByb3BlcnR5TmFtZSA9IGZ1bmN0aW9uIHNvbWV0aGluZygpIHt9XG4vLyBIYXRlcnMgYXJlIGdvbm5hIGhhdGUuIEJ1dCBpZiB5b3UgZG9uJ3QgbGlrZSwgeW91IGNhbiBhbHdheXMgY3JlYXRlIGEgY3VzdG9tIGJ1aWxkIHdpdGhvdXQgZm9sbG93aW5nIHRocmVlIGxpbmVzISAoTUlUIExpY2Vuc2UpXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gVU5ERUZJTkVEKSB7XG4gIHdpbmRvdy5LaW5nVGFibGUgPSBLaW5nVGFibGVcbn1cblxuZXhwb3J0IGRlZmF1bHQgS2luZ1RhYmxlXG4iLCIvKipcbiAqIEtpbmdUYWJsZSBkZWZhdWx0IHJlZ2lvbmFsIG9iamVjdC5cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQge1xuICBcImVuXCI6IHtcbiAgICBcImdvVG9EZXRhaWxzXCI6IFwiR28gdG8gZGV0YWlsc1wiLFxuICAgIFwic29ydE9wdGlvbnNcIjogXCJTb3J0IG9wdGlvbnNcIixcbiAgICBcInNlYXJjaFNvcnRpbmdSdWxlc1wiOiBcIldoZW4gc2VhcmNoaW5nLCBzb3J0IGJ5IHJlbGV2YW5jZVwiLFxuICAgIFwiYWR2YW5jZWRGaWx0ZXJzXCI6IFwiQWR2YW5jZWQgZmlsdGVyc1wiLFxuICAgIFwic29ydE1vZGVzXCI6IHtcbiAgICAgIFwic2ltcGxlXCI6IFwiU2ltcGxlIChzaW5nbGUgcHJvcGVydHkpXCIsXG4gICAgICBcImNvbXBsZXhcIjogXCJDb21wbGV4IChtdWx0aXBsZSBwcm9wZXJ0aWVzKVwiXG4gICAgfSxcbiAgICBcInZpZXdzVHlwZVwiOiB7XG4gICAgICBcInRhYmxlXCI6IFwiVGFibGVcIixcbiAgICAgIFwiZ2FsbGVyeVwiOiBcIkdhbGxlcnlcIlxuICAgIH0sXG4gICAgXCJleHBvcnRGb3JtYXRzXCI6IHtcbiAgICAgIFwiY3N2XCI6IFwiQ3N2XCIsXG4gICAgICBcImpzb25cIjogXCJKc29uXCIsXG4gICAgICBcInhtbFwiOiBcIlhtbFwiXG4gICAgfSxcbiAgICBcImNvbHVtbnNcIjogXCJDb2x1bW5zXCIsXG4gICAgXCJleHBvcnRcIjogXCJFeHBvcnRcIixcbiAgICBcInZpZXdcIjogXCJWaWV3XCIsXG4gICAgXCJ2aWV3c1wiOiBcIlZpZXdzXCIsXG4gICAgXCJsb2FkaW5nXCI6IFwiTG9hZGluZ1wiLFxuICAgIFwibm9EYXRhXCI6IFwiTm8gZGF0YSB0byBkaXNwbGF5XCIsXG4gICAgXCJwYWdlXCI6IFwiUGFnZVwiLFxuICAgIFwicmVzdWx0c1BlclBhZ2VcIjogXCJSZXN1bHRzIHBlciBwYWdlXCIsXG4gICAgXCJyZXN1bHRzXCI6IFwiUmVzdWx0c1wiLFxuICAgIFwib2ZcIjogXCJvZlwiLFxuICAgIFwiZmlyc3RQYWdlXCI6IFwiRmlyc3QgcGFnZVwiLFxuICAgIFwibGFzdFBhZ2VcIjogXCJMYXN0IHBhZ2VcIixcbiAgICBcInByZXZQYWdlXCI6IFwiUHJldmlvdXMgcGFnZVwiLFxuICAgIFwibmV4dFBhZ2VcIjogXCJOZXh0IHBhZ2VcIixcbiAgICBcInJlZnJlc2hcIjogXCJSZWZyZXNoXCIsXG4gICAgXCJmZXRjaFRpbWVcIjogXCJEYXRhIGZldGNoZWQgYXQ6XCIsXG4gICAgXCJhbmNob3JUaW1lXCI6IFwiRGF0YSBhdDpcIixcbiAgICBcInNvcnRBc2NlbmRpbmdCeVwiOiBcIlNvcnQgYnkge3tuYW1lfX0gYXNjZW5kaW5nXCIsXG4gICAgXCJzb3J0RGVzY2VuZGluZ0J5XCI6IFwiU29ydCBieSB7e25hbWV9fSBkZXNjZW5kaW5nXCIsXG4gICAgXCJlcnJvckZldGNoaW5nRGF0YVwiOiBcIkFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGZldGNoaW5nIGRhdGEuXCJcbiAgfVxufVxuIiwiLyoqXG4gKiBLaW5nVGFibGUgcmljaCBIVE1MIGJ1aWxkZXIuXG4gKiBSZW5kZXJzIHRhYnVsYXIgZGF0YSBpbiBIVE1MIGZvcm1hdCwgd2l0aCBldmVudCBoYW5kbGVycyBhbmQgdG9vbHMuXG4gKiBTdWl0YWJsZSBmb3Igd2ViIHBhZ2VzIGFuZCBkZXNrdG9wIGFwcGxpY2F0aW9ucyBwb3dlcmVkIGJ5IE5vZGUuanMuXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuaW1wb3J0IHsgVkh0bWxFbGVtZW50LCBWVGV4dEVsZW1lbnQsIFZDb21tZW50RWxlbWVudCwgVldyYXBwZXJFbGVtZW50LCBWSHRtbEZyYWdtZW50IH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvZGF0YS9odG1sXCJcbmltcG9ydCB7IG1lbnVCdWlsZGVyLCBtZW51SXRlbUJ1aWxkZXIgfSBmcm9tIFwiLi4vLi4vc2NyaXB0cy9tZW51cy9raW5ndGFibGUubWVudS5odG1sXCJcbmltcG9ydCBLaW5nVGFibGVIdG1sQnVpbGRlciBmcm9tIFwiLi4vLi4vc2NyaXB0cy90YWJsZXMva2luZ3RhYmxlLmh0bWwuYnVpbGRlclwiXG5pbXBvcnQgS2luZ1RhYmxlQmFzZUh0bWxCdWlsZGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUuaHRtbC5iYXNlLmJ1aWxkZXJcIlxuaW1wb3J0IEtpbmdUYWJsZU1lbnVGdW5jdGlvbnMgZnJvbSBcIi4uLy4uL3NjcmlwdHMvbWVudXMva2luZ3RhYmxlLm1lbnVcIlxuaW1wb3J0IEtpbmdUYWJsZU1lbnVIdG1sIGZyb20gXCIuLi8uLi9zY3JpcHRzL21lbnVzL2tpbmd0YWJsZS5tZW51Lmh0bWxcIlxuaW1wb3J0IHJhaXNlIGZyb20gXCIuLi8uLi9zY3JpcHRzL3JhaXNlXCJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCJcbmltcG9ydCAkIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RvbVwiXG5pbXBvcnQgRmlsZVV0aWxzIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RhdGEvZmlsZVwiXG4vLyBpbXBvcnQgeG1sIGZyb20gXCIuLi8uLi9zY3JpcHRzL2RhdGEveG1sXCJcbmNvbnN0IFNQQUNFID0gXCIgXCJcbmNvbnN0IENIRUNLQk9YX1RZUEUgPSBcImNoZWNrYm94XCJcbmNvbnN0IEtpbmdUYWJsZUNsYXNzTmFtZSA9IFwia2luZy10YWJsZVwiXG5cbmZ1bmN0aW9uIGNsYXNzT2JqKG5hbWUpIHtcbiAgcmV0dXJuIHtcImNsYXNzXCI6IG5hbWV9O1xufVxuXG4vKipcbiAqIERlZmF1bHQgbWV0aG9kcyB0byBidWlsZCBhIEdhbGxlcnkgdmlldyBmb3IgS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyLlxuICogTkI6IGZ1bmN0aW9ucyBhcmUgZXhlY3V0ZWQgaW4gdGhlIGNvbnRleHQgb2YgdGhlIEtpbmdUYWJsZVJpY2hIdG1sQnVpbGRlci5cbiAqL1xuY2xhc3MgS2luZ1RhYmxlUmhHYWxsZXJ5Vmlld1Jlc29sdmVyIGV4dGVuZHMgS2luZ1RhYmxlQmFzZUh0bWxCdWlsZGVyIHtcblxuICBidWlsZFZpZXcodGFibGUsIGNvbHVtbnMsIGRhdGEpIHtcbiAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCBjbGFzc09iaihcImtpbmctdGFibGUtZ2FsbGVyeVwiKSwgXG4gICAgW1xuICAgICAgdGhpcy5idWlsZEJvZHkodGFibGUsIGNvbHVtbnMsIGRhdGEpLFxuICAgICAgbmV3IFZIdG1sRWxlbWVudChcImJyXCIsIGNsYXNzT2JqKFwiYnJlYWtcIikpXG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgdGFibGUgYm9keSBpbiBIVE1MIGZyb20gZ2l2ZW4gdGFibGUgYW5kIGRhdGEuXG4gICAqL1xuICBidWlsZEJvZHkodGFibGUsIGNvbHVtbnMsIGRhdGEpIHtcbiAgICB2YXIgYnVpbGRlciA9IHRoaXMsXG4gICAgICAgIGZvcm1hdHRlZFN1ZmZpeCA9IHRhYmxlLm9wdGlvbnMuZm9ybWF0dGVkU3VmZml4LFxuICAgICAgICBzZWFyY2hQYXR0ZXJuID0gdGFibGUuc2VhcmNoVGV4dCA/IHRhYmxlLmZpbHRlcnMuZ2V0UnVsZUJ5S2V5KFwic2VhcmNoXCIpLnZhbHVlIDogbnVsbCxcbiAgICAgICAgYXV0b0hpZ2hsaWdodCA9IHRhYmxlLm9wdGlvbnMuYXV0b0hpZ2hsaWdodFNlYXJjaFByb3BlcnRpZXM7XG4gICAgdmFyIGl4ID0gLTE7XG4gICAgdmFyIHJvd3MgPSBfLm1hcChkYXRhLCBpdGVtID0+IHtcbiAgICAgIGl4ICs9IDE7XG4gICAgICBpdGVtLl9faXhfXyA9IGl4O1xuICAgICAgdmFyIGNlbGxzID0gW10sIHgsIGNvbDtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gY29sdW1ucy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29sID0gY29sdW1uc1tpXTtcbiAgICAgICAgeCA9IGNvbC5uYW1lO1xuICAgICAgICBpZiAoY29sLmhpZGRlbiB8fCBjb2wuc2VjcmV0KSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvcm1hdHRlZFByb3AgPSB4ICsgZm9ybWF0dGVkU3VmZml4O1xuICAgICAgICB2YXIgdmFsdWVFbCwgdmFsdWUgPSBfLmhhcyhpdGVtLCBmb3JtYXR0ZWRQcm9wKSA/IGl0ZW1bZm9ybWF0dGVkUHJvcF0gOiBpdGVtW3hdO1xuXG4gICAgICAgIC8vIGRvZXMgdGhlIGNvbHVtbiBkZWZpbmUgYW4gaHRtbCByZXNvbHZlcj9cbiAgICAgICAgaWYgKGNvbC5odG1sKSB7XG4gICAgICAgICAgaWYgKCFfLmlzRnVuY3Rpb24oY29sLmh0bWwpKSB7XG4gICAgICAgICAgICByYWlzZSgyNCwgXCJJbnZhbGlkICdodG1sJyBvcHRpb24gZm9yIHByb3BlcnR5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOQjogaXQgaXMgcmVzcG9uc2liaWxpdHkgb2YgdGhlIHVzZXIgb2YgdGhlIGxpYnJhcnkgdG8gZXNjYXBlIEhUTUwgY2hhcmFjdGVycyB0aGF0IG5lZWQgdG8gYmUgZXNjYXBlZFxuICAgICAgICAgIHZhciBodG1sID0gY29sLmh0bWwuY2FsbChidWlsZGVyLCBpdGVtLCB2YWx1ZSk7XG4gICAgICAgICAgdmFsdWVFbCA9IG5ldyBWSHRtbEZyYWdtZW50KGh0bWwgfHwgXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHZhbHVlRWwgPSBuZXcgVlRleHRFbGVtZW50KFwiXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpcyBhIHNlYXJjaCBhY3RpdmU/XG4gICAgICAgICAgICBpZiAoc2VhcmNoUGF0dGVybiAmJiBhdXRvSGlnaGxpZ2h0ICYmIF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICAgIC8vIGFuIGh0bWwgZnJhZ21lbnQgaXMgcmVxdWlyZWQgdG8gZGlzcGxheSBhbiBoaWdobGlnaHRlZCB2YWx1ZVxuICAgICAgICAgICAgICB2YWx1ZUVsID0gbmV3IFZIdG1sRnJhZ21lbnQoYnVpbGRlci5oaWdobGlnaHQodmFsdWUsIHNlYXJjaFBhdHRlcm4pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhbHVlRWwgPSBuZXcgVlRleHRFbGVtZW50KHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjZWxscy5wdXNoKG5ldyBWSHRtbEVsZW1lbnQoY29sLm5hbWUgPT0gXCLOtV9yb3dcIiA/IFwic3Ryb25nXCIgOiBcInNwYW5cIiwgY29sID8ge1xuICAgICAgICAgIFwiY2xhc3NcIjogY29sLmNzcyB8fCBjb2wubmFtZSxcbiAgICAgICAgICBcInRpdGxlXCI6IGNvbC5kaXNwbGF5TmFtZVxuICAgICAgICB9IDoge30sIHZhbHVlRWwpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJsaVwiLCBidWlsZGVyLmdldEl0ZW1BdHRyT2JqZWN0KGl4LCBpdGVtKSwgY2VsbHMpO1xuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJ1bFwiLCB7XCJjbGFzc1wiOiBcImtpbmctdGFibGUtYm9keVwifSwgcm93cyk7XG4gIH1cbn1cblxuY29uc3QgU29ydE1vZGVzID0ge1xuICBTaW1wbGU6IFwic2ltcGxlXCIsICAvLyBvbmx5IG9uZSBwcm9wZXJ0eSBhdCBhIHRpbWU7XG4gIENvbXBsZXg6IFwiY29tcGxleFwiIC8vIHNvcnQgYnkgbXVsdGlwbGUgcHJvcGVydGllcztcbn1cblxuXG4vKipcbiAqIE5vcm1hbGl6ZXNcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplRXh0cmFWaWV3KG8pIHtcbiAgaWYgKCFvKSByYWlzZSgzNCwgXCJJbnZhbGlkIGV4dHJhIHZpZXcgY29uZmlndXJhdGlvbi5cIik7XG4gIGlmICghby5uYW1lKSByYWlzZSgzNSwgXCJNaXNzaW5nIG5hbWUgaW4gZXh0cmEgdmlldyBjb25maWd1cmF0aW9uLlwiKTtcblxuICBpZiAoby5nZXRJdGVtVGVtcGxhdGUpIHtcbiAgICBfLmV4dGVuZChvLCB7XG4gICAgICByZXNvbHZlcjoge1xuICAgICAgICBnZXRJdGVtVGVtcGxhdGU6IG8uZ2V0SXRlbVRlbXBsYXRlLFxuICAgICAgICBcbiAgICAgICAgYnVpbGRWaWV3OiBmdW5jdGlvbiAodGFibGUsIGNvbHVtbnMsIGRhdGEpIHtcbiAgICAgICAgICB2YXIgaXRlbVRlbXBsYXRlID0gdGhpcy5nZXRJdGVtVGVtcGxhdGUoKTtcbiAgICAgICAgICBpZiAoIWl0ZW1UZW1wbGF0ZSkge1xuICAgICAgICAgICAgcmFpc2UoMzEsIFwiSW52YWxpZCBnZXRJdGVtVGVtcGxhdGUgZnVuY3Rpb24gaW4gZXh0cmEgdmlldy5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciByb3dzID0gXy5tYXAoZGF0YSwgZGF0dW0gPT4ge1xuICAgICAgICAgICAgdmFyIGh0bWwgPSBpdGVtVGVtcGxhdGUucmVwbGFjZSgvXFx7XFx7KC4rPylcXH1cXH0vZywgKHMsIGEpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFkYXR1bS5oYXNPd25Qcm9wZXJ0eShhKSlcbiAgICAgICAgICAgICAgICByYWlzZSgzMiwgYE1pc3NpbmcgcHJvcGVydHkgJHthfSwgZm9yIHRlbXBsYXRlYCk7XG4gICAgICAgICAgICAgIHJldHVybiB0YWJsZS5nZXRJdGVtVmFsdWUoZGF0dW0sIGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFZIdG1sRnJhZ21lbnQoaHRtbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJkaXZcIiwge1wiY2xhc3NcIjogYGtpbmctdGFibGUtYm9keSAke28ubmFtZX1gLnRvTG93ZXJDYXNlKCl9LCByb3dzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGRlbGV0ZSBvLmdldEl0ZW1UZW1wbGF0ZTtcbiAgfVxuICByZXR1cm4gbztcbn1cblxuXG5jbGFzcyBLaW5nVGFibGVSaWNoSHRtbEJ1aWxkZXIgZXh0ZW5kcyBLaW5nVGFibGVIdG1sQnVpbGRlciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyIGFzc29jaWF0ZWQgd2l0aCB0aGUgZ2l2ZW4gdGFibGUuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih0YWJsZSkge1xuICAgIHN1cGVyKHRhYmxlKVxuICAgIHRoaXMub3B0aW9ucyA9IF8uZXh0ZW5kKHt9LCBLaW5nVGFibGVSaWNoSHRtbEJ1aWxkZXIuZGVmYXVsdHMsIHRhYmxlLm9wdGlvbnMsIHRhYmxlLm9wdGlvbnMucmh0bWwgfHwgdGFibGUub3B0aW9ucy5odG1sKTtcbiAgICB0aGlzLnNldFNlYWNoSGFuZGxlcigpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICBleHRyYVZpZXdzID0gb3B0aW9ucy5leHRyYVZpZXdzO1xuICAgIGlmIChleHRyYVZpZXdzKSB7XG4gICAgICBvcHRpb25zLnZpZXdzID0gb3B0aW9ucy52aWV3cy5jb25jYXQoXy5tYXAoZXh0cmFWaWV3cywgbyA9PiBub3JtYWxpemVFeHRyYVZpZXcobykpKTtcbiAgICB9XG5cbiAgICAvLyBsb2FkIHNldHRpbmdzIGZyb20gc3RvcmVzXG4gICAgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuICAgIC8vIGluaXRpYWxpemUgZ2xvYmFsIG1lbnUgZXZlbnQgaGFuZGxlcnNcbiAgICBpZiAoIUtpbmdUYWJsZU1lbnVGdW5jdGlvbnMuaW5pdGlhbGl6ZWQpIHtcbiAgICAgIEtpbmdUYWJsZU1lbnVGdW5jdGlvbnMuc2V0dXAoKTtcbiAgICB9XG5cbiAgICB0aGlzLmZpbHRlcnNWaWV3T3BlbiA9IG9wdGlvbnMuZmlsdGVyc1ZpZXcgJiYgb3B0aW9ucy5maWx0ZXJzVmlld0V4cGFuZGFibGUgJiYgb3B0aW9ucy5maWx0ZXJzVmlld09wZW47XG4gIH1cblxuICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgc3VwZXIuc2V0TGlzdGVuZXJzKCk7XG5cbiAgICAvLyBhZGRpdGlvbmFsIGxpc3RlbmVyc1xuICAgIHZhciBzZWxmID0gdGhpcywgdGFibGUgPSBzZWxmLnRhYmxlO1xuICAgIGlmICghdGFibGUgfHwgIXRhYmxlLmVsZW1lbnQpIHJldHVybiBzZWxmO1xuXG4gICAgc2VsZi5saXN0ZW5Ubyh0YWJsZSwge1xuICAgICAgXCJjaGFuZ2U6cGFnaW5hdGlvblwiOiAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5yb290RWxlbWVudCkgcmV0dXJuIHRydWU7XG4gICAgICAgIHNlbGYudXBkYXRlUGFnaW5hdGlvbigpO1xuICAgICAgfSxcbiAgICAgIFwiZ2V0LWxpc3Q6ZmFpbGVkXCI6ICgpID0+IHtcbiAgICAgICAgLy8gcGFnaW5hdGlvbiBtdXN0IGJlIHVwZGF0ZWQgYWxzbyBpbiB0aGlzIGNhc2VcbiAgICAgICAgaWYgKCF0aGlzLnJvb3RFbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgc2VsZi51cGRhdGVQYWdpbmF0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0IEJhc2VIdG1sQnVpbGRlcigpIHtcbiAgICByZXR1cm4gS2luZ1RhYmxlQmFzZUh0bWxCdWlsZGVyO1xuICB9XG5cbiAgc3RhdGljIGdldCBEb21VdGlscygpIHtcbiAgICByZXR1cm4gJDtcbiAgfVxuXG4gIGxvYWRTZXR0aW5ncygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIFxuICAgICAgbyA9IHNlbGYub3B0aW9ucyxcbiAgICAgIHRhYmxlID0gc2VsZi50YWJsZSwgc3RvcmUgPSB0YWJsZS5nZXRGaWx0ZXJzU3RvcmUoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gc2VsZjtcblxuICAgIC8vIHJlc3RvcmUgc29ydCBtb2RlXG4gICAgdmFyIHN0b3JlZFNvcnRNb2RlID0gdGFibGUuZ2V0UHJlZmVyZW5jZShcInNvcnQtbW9kZVwiKTtcbiAgICBpZiAoc3RvcmVkU29ydE1vZGUpIHtcbiAgICAgIG8uc29ydE1vZGUgPSBzdG9yZWRTb3J0TW9kZTtcbiAgICB9XG5cbiAgICB2YXIgc3RvcmVkVmlld1R5cGUgPSB0YWJsZS5nZXRQcmVmZXJlbmNlKFwidmlldy10eXBlXCIpO1xuICAgIGlmIChzdG9yZWRWaWV3VHlwZSkge1xuICAgICAgby52aWV3ID0gc3RvcmVkVmlld1R5cGU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAgLyoqXG4gICAgKiBTZXRzIGEgY2xpZW50IHNpZGUgc2VhcmNoIGhhbmRsZXIgZm9yIHRoZSB0YWJsZS5cbiAgICAqL1xuICBzZXRTZWFjaEhhbmRsZXIoKSB7XG4gICAgdmFyIGRlbGF5ID0gdGhpcy5vcHRpb25zLnNlYXJjaERlbGF5O1xuICAgIGZ1bmN0aW9uIHNlYXJjaCh0ZXh0KSB7XG4gICAgICB2YXIgdGFibGUgPSB0aGlzLnRhYmxlO1xuICAgICAgLy8gc2V0IHNlYXJjaCwgYnV0IG9ubHkgaWYgdGhlIHZhbHVlIGlzIG9mIHN1ZmZpY2llbnQgbGVuZ3RoXG4gICAgICBpZiAodGFibGUudmFsaWRhdGVGb3JTZWFjaCh0ZXh0KSkge1xuICAgICAgICAvLyB0aGUgdmFsdWUgaXMgc3VmZmljaWVudCB0byB0cmlnZ2VyIGEgc2VhcmNoXG4gICAgICAgIHRhYmxlLnNlYXJjaCh0ZXh0KTtcbiAgICAgIH0gZWxzZSBpZiAodGFibGUuaXNTZWFyY2hBY3RpdmUoKSkge1xuICAgICAgICAvLyB1bnNldCBzZWFyY2g6IHRoZSB2YWx1ZSBpcyBlaXRoZXIgdG9vIHNob3J0IG9yIGVtcHR5XG4gICAgICAgIHRhYmxlLnVuc2V0U2VhcmNoKCk7XG4gICAgICAgIHRhYmxlLnJlbmRlcigpO1xuICAgICAgfVxuICAgICAgdGFibGUuZ2V0RmlsdGVyc1NldENhY2hlKCk7IC8vIHN0b3JlIGZpbHRlciBpbiBjYWNoZVxuICAgICAgLy8gY29udGludWUgbm9ybWFsbHlcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuc2VhcmNoID0gXy5pc051bWJlcihkZWxheSkgJiYgZGVsYXkgPiAwXG4gICAgICA/IF8uZGVib3VuY2Uoc2VhcmNoLCBkZWxheSwgdGhpcylcbiAgICAgIDogc2VhcmNoO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHZpZXcgcmVzb2x2ZXIgY3VycmVudGx5IHVzZWQgYnkgdGhpcyBLaW5nVGFibGVSaWNoSHRtbEJ1aWxkZXIsXG4gICAqIHdpdGggdmFsaWRhdGlvbi5cbiAgICovXG4gIGdldFZpZXdSZXNvbHZlcigpIHtcbiAgICB2YXIgbyA9IHRoaXMub3B0aW9ucyxcbiAgICAgIHZpZXcgPSBvLnZpZXcsXG4gICAgICB2aWV3cyA9IG8udmlld3M7XG4gICAgaWYgKCFfLmlzU3RyaW5nKHZpZXcpKSB7XG4gICAgICByYWlzZSgyMSwgXCJNaXNzaW5nIHZpZXcgY29uZmlndXJhdGlvbiBmb3IgUmljaCBIVE1MIGJ1aWxkZXJcIik7XG4gICAgfVxuICAgIHZhciB2aWV3RGF0YSA9IF8uZmluZCh2aWV3cywgdiA9PiB7IHJldHVybiB2Lm5hbWUgPT0gdmlldzsgfSk7XG4gICAgaWYgKCF2aWV3RGF0YSkge1xuICAgICAgcmFpc2UoMjIsIFwiTWlzc2luZyB2aWV3IHJlc29sdmVyIGZvciB2aWV3OiBcIiArIHZpZXcpO1xuICAgIH1cbiAgICB2YXIgcmVzb2x2ZXIgPSB2aWV3RGF0YS5yZXNvbHZlcjtcbiAgICBpZiAocmVzb2x2ZXIgPT09IHRydWUpIHtcbiAgICAgIC8vIHVzZSB0aGUgZGVmYXVsdCBmdW5jdGlvbnNcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoIXJlc29sdmVyKVxuICAgICAgcmFpc2UoMzMsIGBNaXNzaW5nIHJlc29sdmVyIGluIHZpZXcgY29uZmlndXJhdGlvbiAnJHt2aWV3fSdgKTtcbiAgICBcbiAgICAvLyBzdXBwb3J0IGJvdGggaW5zdGFudGlhYmxlIG9iamVjdHMgYW5kIHBsYWluIG9iamVjdHNcbiAgICBpZiAoIV8uaXNQbGFpbk9iamVjdChyZXNvbHZlcikpXG4gICAgICByZXNvbHZlciA9IG5ldyByZXNvbHZlcigpO1xuICAgIFxuICAgIGlmICghXy5xdWFja3MocmVzb2x2ZXIsIFtcImJ1aWxkVmlld1wiXSkpIHtcbiAgICAgIHJhaXNlKDIzLCBcIkludmFsaWQgcmVzb2x2ZXIgZm9yIHZpZXc6IFwiICsgdmlldyk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2FwdGlvbiBlbGVtZW50IGZvciB0aGUgZ2l2ZW4gdGFibGUuXG4gICAqL1xuICBidWlsZENhcHRpb24oKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgY2FwdGlvbiA9IHRhYmxlLm9wdGlvbnMuY2FwdGlvbjtcbiAgICByZXR1cm4gY2FwdGlvbiA/IG5ldyBWSHRtbEVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgXCJjbGFzc1wiOiBcImtpbmctdGFibGUtY2FwdGlvblwiXG4gICAgfSwgbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge30sIG5ldyBWVGV4dEVsZW1lbnQoY2FwdGlvbikpKSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBnaXZlbiBpbnN0YW5jZSBvZiBLaW5nVGFibGUgaW4gSFRNTC5cbiAgICovXG4gIGJ1aWxkKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgdGFibGUgPSBzZWxmLnRhYmxlO1xuICAgIHZhciBlbGVtZW50ID0gdGFibGUuZWxlbWVudDtcbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIC8vIGZvciB0aGlzIGNsYXNzLCBpdCBkb2Vzbid0IG1ha2Ugc2Vuc2UgaWYgYSB0YWJsZSBkb2Vzbid0IGhhdmUgYW4gZWxlbWVudC5cbiAgICAgIC8vIHJhaXNlKDI1LCBcIk1pc3NpbmcgdGFibGUgZWxlbWVudFwiKTsgLy9UT0RPOiBoYW5kbGUgZm9yIHRlc3RzXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuZW5zdXJlTGF5b3V0KCkudXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IHRoZSBIVE1MIGxheW91dCBpcyByZWFkeSB0byBkaXNwbGF5IHRoZSBib3VuZCB0YWJsZS5cbiAgICovXG4gIGVuc3VyZUxheW91dCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYucm9vdEVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgICB2YXIgdGFibGUgPSBzZWxmLnRhYmxlLFxuICAgICAgICBvID0gc2VsZi5vcHRpb25zLFxuICAgICAgICBlbGVtZW50ID0gdGFibGUuZWxlbWVudCxcbiAgICAgICAgdmlldyA9IHNlbGYuYnVpbGRWaWV3KG51bGwsIG51bGwsIG5ldyBWSHRtbEZyYWdtZW50KFwiIFwiKSksXG4gICAgICAgIGNhcHRpb24gPSBzZWxmLmJ1aWxkQ2FwdGlvbigpLFxuICAgICAgICByb290ID0gc2VsZi5idWlsZFJvb3QoY2FwdGlvbiwgdmlldyk7XG4gICAgdGFibGUuZW1pdChcImVtcHR5OmVsZW1lbnRcIiwgZWxlbWVudCk7XG4gICAgJC5lbXB0eShlbGVtZW50KTtcbiAgICAkLmFkZENsYXNzKGVsZW1lbnQsIEtpbmdUYWJsZUNsYXNzTmFtZSk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSByb290LnRvU3RyaW5nKCk7XG4gICAgLy8gYWRkIHJlZmVyZW5jZSB0byByb290IGVsZW1lbnRcbiAgICBzZWxmLnJvb3RFbGVtZW50ID0gJC5maW5kRmlyc3RCeUNsYXNzKGVsZW1lbnQsIFwia2luZy10YWJsZS1yZWdpb25cIik7XG4gICAgLy8gYmluZCBldmVudHNcbiAgICBzZWxmLmJpbmRFdmVudHMoKTtcblxuICAgIF8uaWZjYWxsKG8ub25MYXlvdXRSZW5kZXIsIHNlbGYsIFtlbGVtZW50XSk7XG4gICAgaWYgKG8uZmlsdGVyc1ZpZXcpIHtcbiAgICAgIF8uaWZjYWxsKG8ub25GaWx0ZXJzUmVuZGVyLCBzZWxmLCBbJC5maW5kRmlyc3RCeUNsYXNzKGVsZW1lbnQsIFwia3QtZmlsdGVyc1wiKV0pO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBjdXJyZW50IHJlbmRlcmVkIHZpZXcgdG8gY3VycmVudCB0YWJsZSBzdGF0ZS5cbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLnVwZGF0ZVBhZ2luYXRpb24oKS51cGRhdGVWaWV3KCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgY3VycmVudCByZW5kZXJlZCBwYWdpbmF0aW9uIHZpZXcgdG8gY3VycmVudCB0YWJsZSBzdGF0ZS5cbiAgICovXG4gIHVwZGF0ZVBhZ2luYXRpb24oKSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZSxcbiAgICAgIGRhdGEgPSB0YWJsZS5wYWdpbmF0aW9uLFxuICAgICAgcm9vdEVsZW1lbnQgPSB0aGlzLnJvb3RFbGVtZW50O1xuICAgIGlmICghcm9vdEVsZW1lbnQpIHtcbiAgICAgIHJhaXNlKDI2LCBcIm1pc3Npbmcgcm9vdCBlbGVtZW50XCIpO1xuICAgIH1cbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKSxcbiAgICAgICAgbyA9IHRhYmxlLm9wdGlvbnMsXG4gICAgICAgIGRhdGEgPSB0YWJsZS5wYWdpbmF0aW9uLFxuICAgICAgICBwYWdlID0gZGF0YS5wYWdlLFxuICAgICAgICB0b3RhbFBhZ2VDb3VudCA9IGRhdGEudG90YWxQYWdlQ291bnQsXG4gICAgICAgIHJlc3VsdHNQZXJQYWdlID0gZGF0YS5yZXN1bHRzUGVyUGFnZSxcbiAgICAgICAgZmlyc3RPYmplY3ROdW1iZXIgPSBkYXRhLmZpcnN0T2JqZWN0TnVtYmVyLFxuICAgICAgICBsYXN0T2JqZWN0TnVtYmVyID0gZGF0YS5sYXN0T2JqZWN0TnVtYmVyLFxuICAgICAgICB0b3RhbEl0ZW1zQ291bnQgPSBkYXRhLnRvdGFsSXRlbXNDb3VudCxcbiAgICAgICAgZGF0YUFuY2hvclRpbWUgPSB0YWJsZS5nZXRGb3JtYXR0ZWRBbmNob3JUaW1lKCksXG4gICAgICAgIGlzTnVtID0gXy5pc051bWJlcixcbiAgICAgICAgZmluZEJ5Q2xhc3MgPSAkLmZpbmRGaXJzdEJ5Q2xhc3MsXG4gICAgICAgIGFkZENsYXNzID0gJC5hZGRDbGFzcyxcbiAgICAgICAgcmVtb3ZlQ2xhc3MgPSAkLnJlbW92ZUNsYXNzO1xuICAgIFxuICAgIHZhciBwYWdlRWwgPSBmaW5kQnlDbGFzcyhyb290RWxlbWVudCwgXCJwYWdpbmF0aW9uLWJhci1wYWdlLW51bWJlclwiKTtcbiAgICBwYWdlRWwudmFsdWUgPSBwYWdlO1xuXG4gICAgdmFyIHNpemVFbCA9IGZpbmRCeUNsYXNzKHJvb3RFbGVtZW50LCBcInBhZ2luYXRpb24tYmFyLXJlc3VsdHMtc2VsZWN0XCIpO1xuICAgIHNpemVFbC52YWx1ZSA9IHJlc3VsdHNQZXJQYWdlO1xuXG4gICAgdmFyIGEgPSBcInBhZ2luYXRpb24tYnV0dG9uXCIsIGIgPSBcInBhZ2luYXRpb24tYnV0dG9uLWRpc2FibGVkXCI7XG4gICAgXy5lYWNoKFtcInBhZ2luYXRpb24tYmFyLWZpcnN0LXBhZ2VcIiwgXCJwYWdpbmF0aW9uLWJhci1wcmV2LXBhZ2VcIl0sIG5hbWUgPT4ge1xuICAgICAgdmFyIGVsID0gZmluZEJ5Q2xhc3Mocm9vdEVsZW1lbnQsIG5hbWUpO1xuICAgICAgaWYgKHBhZ2UgPiAxKSB7XG4gICAgICAgIGFkZENsYXNzKGVsLCBhKVxuICAgICAgICByZW1vdmVDbGFzcyhlbCwgYilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFkZENsYXNzKGVsLCBiKVxuICAgICAgICByZW1vdmVDbGFzcyhlbCwgYSlcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIF8uZWFjaChbXCJwYWdpbmF0aW9uLWJhci1sYXN0LXBhZ2VcIiwgXCJwYWdpbmF0aW9uLWJhci1uZXh0LXBhZ2VcIl0sIG5hbWUgPT4ge1xuICAgICAgdmFyIGVsID0gZmluZEJ5Q2xhc3Mocm9vdEVsZW1lbnQsIG5hbWUpO1xuICAgICAgaWYgKHBhZ2UgPCB0b3RhbFBhZ2VDb3VudCkge1xuICAgICAgICBhZGRDbGFzcyhlbCwgYSlcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIGIpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRDbGFzcyhlbCwgYilcbiAgICAgICAgcmVtb3ZlQ2xhc3MoZWwsIGEpXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgcmVzdWx0c0luZm8gPSBcIlwiO1xuICAgIGlmIChpc051bShmaXJzdE9iamVjdE51bWJlcikgJiYgaXNOdW0obGFzdE9iamVjdE51bWJlcikgJiYgbGFzdE9iamVjdE51bWJlciA+IDApIHtcbiAgICAgIHJlc3VsdHNJbmZvICs9IHJlZy5yZXN1bHRzICsgYCAke2ZpcnN0T2JqZWN0TnVtYmVyfSAtICR7bGFzdE9iamVjdE51bWJlcn1gO1xuICAgICAgaWYgKGlzTnVtKHRvdGFsSXRlbXNDb3VudCkpIHtcbiAgICAgICAgcmVzdWx0c0luZm8gKz0gYCAke3JlZy5vZn0gLSAke3RvdGFsSXRlbXNDb3VudH1gXG4gICAgICB9XG4gICAgfVxuICAgIHZhciBhbmNob3JUaW1lSW5mbyA9IFwiXCI7XG4gICAgaWYgKGRhdGFBbmNob3JUaW1lICYmIHRhYmxlLm9wdGlvbnMuc2hvd0FuY2hvclRpbWVzdGFtcCkge1xuICAgICAgYW5jaG9yVGltZUluZm8gPSBgJHtyZWcuYW5jaG9yVGltZX0gJHtkYXRhQW5jaG9yVGltZX1gO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0ge1xuICAgICAgXCJyZXN1bHRzLWluZm9cIjogcmVzdWx0c0luZm8sXG4gICAgICBcImFuY2hvci10aW1lc3RhbXAtaW5mb1wiOiBhbmNob3JUaW1lSW5mbyxcbiAgICAgIFwidG90YWwtcGFnZS1jb3VudFwiOiByZWcub2YgKyBcIiBcIiArIHRvdGFsUGFnZUNvdW50XG4gICAgfSwgeDtcbiAgICBmb3IgKHggaW4gaW5mbykge1xuICAgICAgdmFyIGVsID0gZmluZEJ5Q2xhc3Mocm9vdEVsZW1lbnQsIHgpO1xuICAgICAgaWYgKGVsKSB7XG4gICAgICAgIGVsLmlubmVySFRNTCA9IGluZm9beF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHNlYXJjaCA9IHRhYmxlLnNlYXJjaFRleHQgfHwgXCJcIjtcbiAgICB2YXIgc2VhcmNoRWwgPSBmaW5kQnlDbGFzcyhyb290RWxlbWVudCwgXCJzZWFyY2gtZmllbGRcIik7XG4gICAgLy8gdXBkYXRlIHRoZSBzZWFyY2ggZWxlbWVudCB2YWx1ZSwgYnV0IG9ubHkgaWYgaXQgaXMgbm90IGN1cnJlbnRseVxuICAgIC8vIGZvY3VzZWQuIEJlY2F1c2UgaWYgaXQgaXMgZm9jdXNlZCwgdGhlIHVzZXIgaXMgdXNpbmcgaXQuXG4gICAgaWYgKHNlYXJjaEVsICYmIHNlYXJjaEVsLnZhbHVlICE9IHNlYXJjaCAmJiAkLmlzRm9jdXNlZChzZWFyY2hFbCkgPT0gZmFsc2UpIHtcbiAgICAgIHNlYXJjaEVsLnZhbHVlID0gc2VhcmNoO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHRhYmxlIHZpZXcgdG8gdGhlIGN1cnJlbnQgdGFibGUgc3RhdGUuXG4gICAqL1xuICB1cGRhdGVWaWV3KCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIG8gPSBzZWxmLm9wdGlvbnMsXG4gICAgICB0YWJsZSA9IHNlbGYudGFibGUsXG4gICAgICBkYXRhID0gdGFibGUucGFnaW5hdGlvbixcbiAgICAgIHJvb3RFbGVtZW50ID0gc2VsZi5yb290RWxlbWVudDtcbiAgICBpZiAoIXJvb3RFbGVtZW50KSB7XG4gICAgICByYWlzZSgyNiwgXCJtaXNzaW5nIHJvb3QgZWxlbWVudFwiKTtcbiAgICB9XG5cbiAgICAvLyBjbGFzc2VzXG4gICAgXy5lYWNoKHtcbiAgICAgIFwia3Qtc2VhcmNoLWFjdGl2ZVwiOiB0YWJsZS5zZWFyY2hUZXh0LFxuICAgICAgXCJrdC1zZWFyY2gtc29ydGluZ1wiOiB0YWJsZS5vcHRpb25zLnNlYXJjaFNvcnRpbmdSdWxlc1xuICAgIH0sIChjb25kaXRpb24sIGtleSkgPT4ge1xuICAgICAgJC5tb2RDbGFzcyhyb290RWxlbWVudCwga2V5LCBjb25kaXRpb24pO1xuICAgIH0pO1xuXG4gICAgLy8gZ2V0IGRhdGEgdG8gZGlzcGxheVxuICAgIHZhciBkYXRhID0gdGFibGUuZ2V0RGF0YSh7XG4gICAgICBmb3JtYXQ6IHRydWUsXG4gICAgICBoaWRlOiBmYWxzZVxuICAgIH0pO1xuICAgIHZhciB2aWV3RWwgPSAkLmZpbmRGaXJzdEJ5Q2xhc3Mocm9vdEVsZW1lbnQsIFwia2luZy10YWJsZS12aWV3XCIpO1xuICAgIGlmICghZGF0YSB8fCAhZGF0YS5sZW5ndGgpIHtcbiAgICAgIC8vIGRpc3BsYXkgZW1wdHkgdmlldyBpbnNpZGUgdGhlIHRhYmxlIHZpZXcgcmVnaW9uXG4gICAgICB2aWV3RWwuaW5uZXJIVE1MID0gc2VsZi5lbXB0eVZpZXcoKS50b1N0cmluZygpO1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuICAgIHZhciBjb2x1bW5zID0gc2VsZi5nZXRGaWVsZHMoKTtcbiAgICAvLyBkbyB0b29scyBuZWVkIHRvIGJlIGJ1aWx0IGZvciB0aGUgZmlyc3QgdGltZT9cbiAgICAvLyBUT0RPOiBldmVudHVhbGx5LCBzdXBwb3J0IHJlaW5pdGlhbGl6aW5nIGNvbHVtbnMgKGN1cnJlbnQgaW1wbGVtZW50YXRpb24gc3VwcG9ydHMgb25seSB0YWJsZXMgdGhhdCBkbyBub3QgY2hhbmdlIGJldHdlZW4gYWpheCByZXF1ZXN0cylcbiAgICBpZiAoc2VsZi5fbXVzdF9idWlsZF90b29scykge1xuICAgICAgLy8gZ2V0IGVsZW1lbnRcbiAgICAgIHZhciB0b29sc0VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZi50b29sc1JlZ2lvbklkKTtcbiAgICAgIHRvb2xzRWwuaW5uZXJIVE1MID0gc2VsZi5idWlsZFRvb2xzSW5uZXIodHJ1ZSk7XG4gICAgICBkZWxldGUgc2VsZi5fbXVzdF9idWlsZF90b29scztcbiAgICB9XG4gICAgc2VsZi5jdXJyZW50SXRlbXMgPSBkYXRhO1xuICAgIHZhciB2aWV3ID0gc2VsZi5idWlsZFZpZXcoY29sdW1ucywgZGF0YSk7XG4gICAgdmlld0VsLmlubmVySFRNTCA9IHZpZXcuY2hpbGRyZW5bMF0udG9TdHJpbmcoKTtcbiAgICBfLmlmY2FsbChvLm9uVmlld1VwZGF0ZSwgc2VsZiwgW3ZpZXdFbF0pOyAvLyBjYWxsIGlmIGV4aXN0c1xuICAgIHJldHVybiBzZWxmO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgYnVpbHQgdGFibGUuXG4gICAqL1xuICBkaXNwbGF5KGJ1aWx0KSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZSwgbyA9IHRoaXMub3B0aW9ucztcbiAgICAvLyBpZiBhIHRhYmxlIGhhcyBhbiBlbGVtZW50LCBhc3N1bWUgdGhhdCBpcyBhIERPTSBlbGVtZW50O1xuICAgIGlmICghXy5pc1N0cmluZyhidWlsdCkpXG4gICAgICBidWlsdCA9IGJ1aWx0LnRvU3RyaW5nKCk7XG4gICAgdGhpcy5lbnN1cmVMYXlvdXQoKTtcbiAgICB2YXIgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XG4gICAgLy8gdXBkYXRlIHZpZXcgb25seVxuICAgIHZhciB2aWV3RWwgPSAkLmZpbmRGaXJzdEJ5Q2xhc3Mocm9vdCwgXCJraW5nLXRhYmxlLXZpZXdcIik7XG4gICAgdmlld0VsLmlubmVySFRNTCA9IGJ1aWx0O1xuICAgIF8uaWZjYWxsKG8ub25WaWV3VXBkYXRlLCB0aGlzLCBbdmlld0VsXSk7IC8vIGNhbGwgaWYgZXhpc3RzXG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgcm9vdCB2aXJ0dWFsIGVsZW1lbnQgZm9yIHRoZSBnaXZlbiB0YWJsZSwgd2l0aCBnaXZlblxuICAgKiB0YWJsZSBjaGlsZHJlbi5cbiAgICovXG4gIGJ1aWxkUm9vdChjYXB0aW9uLCB2aWV3KSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgcm9vdEF0dHIgPSB7XG4gICAgICBcImNsYXNzXCI6IFwia2luZy10YWJsZS1yZWdpb25cIlxuICAgIH07XG4gICAgaWYgKHRhYmxlLmlkKSB7XG4gICAgICByb290QXR0ci5pZCA9IHRhYmxlLmlkO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCByb290QXR0ciwgW1xuICAgICAgY2FwdGlvbixcbiAgICAgIHRoaXMuYnVpbGRQYWdpbmF0aW9uQmFyKCksXG4gICAgICB0aGlzLmJ1aWxkRmlsdGVyc1ZpZXcoKSxcbiAgICAgIHZpZXdcbiAgICBdKVxuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhIGhlYWRlciBmcm9tIGdpdmVuIHRhYmxlIGFuZCBjb2x1bW5zLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdFtdfSBjb2x1bW5zO1xuICAgKiBAcGFyYW0ge29iamVjdFtdfSBkYXRhO1xuICAgKi9cbiAgYnVpbGRQYWdpbmF0aW9uQmFyKCkge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGUsXG4gICAgICAgIHJlZyA9IHRoaXMuZ2V0UmVnKCksXG4gICAgICAgIG8gPSB0aGlzLm9wdGlvbnMsXG4gICAgICAgIGRhdGEgPSB0YWJsZS5wYWdpbmF0aW9uLFxuICAgICAgICBwYWdlID0gZGF0YS5wYWdlLFxuICAgICAgICB0b3RhbFBhZ2VDb3VudCA9IGRhdGEudG90YWxQYWdlQ291bnQsXG4gICAgICAgIHJlc3VsdHNQZXJQYWdlID0gZGF0YS5yZXN1bHRzUGVyUGFnZSxcbiAgICAgICAgZmlyc3RPYmplY3ROdW1iZXIgPSBkYXRhLmZpcnN0T2JqZWN0TnVtYmVyLFxuICAgICAgICBsYXN0T2JqZWN0TnVtYmVyID0gZGF0YS5sYXN0T2JqZWN0TnVtYmVyLFxuICAgICAgICB0b3RhbEl0ZW1zQ291bnQgPSBkYXRhLnRvdGFsSXRlbXNDb3VudCxcbiAgICAgICAgZmlsdGVyc1ZpZXcgPSBvLmZpbHRlcnNWaWV3LFxuICAgICAgICBmaWx0ZXJzVmlld0V4cGFuZGFibGUgPSBmaWx0ZXJzVmlldyAmJiBvLmZpbHRlcnNWaWV3RXhwYW5kYWJsZSxcbiAgICAgICAgZmlsdGVyc1ZpZXdPcGVuID0gZmlsdGVyc1ZpZXdFeHBhbmRhYmxlICYmIG8uZmlsdGVyc1ZpZXdPcGVuLFxuICAgICAgICBkYXRhQW5jaG9yVGltZSA9IHRhYmxlLmdldEZvcm1hdHRlZEFuY2hvclRpbWUoKSxcbiAgICAgICAgaXNOdW0gPSBfLmlzTnVtYmVyO1xuICAgIFxuICAgIHZhciByZXN1bHRzSW5mbyA9IFwiXCI7XG4gICAgaWYgKGlzTnVtKGZpcnN0T2JqZWN0TnVtYmVyKSAmJiBpc051bShsYXN0T2JqZWN0TnVtYmVyKSAmJiBsYXN0T2JqZWN0TnVtYmVyID4gMCkge1xuICAgICAgcmVzdWx0c0luZm8gKz0gcmVnLnJlc3VsdHMgKyBgICR7Zmlyc3RPYmplY3ROdW1iZXJ9IC0gJHtsYXN0T2JqZWN0TnVtYmVyfWA7XG4gICAgICBpZiAoaXNOdW0odG90YWxJdGVtc0NvdW50KSkge1xuICAgICAgICByZXN1bHRzSW5mbyArPSBgICR7cmVnLm9mfSAtICR7dG90YWxJdGVtc0NvdW50fWBcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGFuY2hvclRpbWVJbmZvO1xuICAgIGlmIChkYXRhQW5jaG9yVGltZSAmJiB0YWJsZS5vcHRpb25zLnNob3dBbmNob3JUaW1lc3RhbXApIHtcbiAgICAgIGFuY2hvclRpbWVJbmZvID0gYCR7cmVnLmFuY2hvclRpbWV9ICR7ZGF0YUFuY2hvclRpbWV9YDtcbiAgICB9XG4gICAgdmFyIGFkdmFuY2VkRmlsdGVycyA9IHJlZy5hZHZhbmNlZEZpbHRlcnM7XG4gICAgdmFyIHNlYXJjaEVsZW1lbnQgPSBvLmFsbG93U2VhcmNoID8gbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgICAgIFwiY2xhc3NcIjogXCJwYWdpbmF0aW9uLWJhci1maWx0ZXJzXCJcbiAgICAgICAgfSwgbmV3IFZIdG1sRWxlbWVudChcImlucHV0XCIsIHtcbiAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInNlYXJjaC1maWVsZFwiLFxuICAgICAgICAgIFwidmFsdWVcIjogdGFibGUuc2VhcmNoVGV4dCB8fCBcIlwiXG4gICAgICAgIH0pKSA6IG51bGw7XG4gICAgdmFyIHNwYW4gPSBcInNwYW5cIiwgc2VwYXJhdG9yID0gbmV3IFZIdG1sRWxlbWVudChzcGFuLCB7XCJjbGFzc1wiOiBcInNlcGFyYXRvclwifSk7XG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYmFyXCIsXG4gICAgfSwgW1xuICAgICAgICB0aGlzLmJ1aWxkVG9vbHMoKSxcbiAgICAgICAgbmV3IFZIdG1sRWxlbWVudChzcGFuLCB7XCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYmFyLWJ1dHRvbnNcIn0sIFtcbiAgICAgICAgbmV3IFZIdG1sRWxlbWVudChzcGFuLCB7XG4gICAgICAgICAgXCJ0YWJpbmRleFwiOiBcIjBcIixcbiAgICAgICAgICBcImNsYXNzXCI6IFwicGFnaW5hdGlvbi1idXR0b24gcGFnaW5hdGlvbi1iYXItZmlyc3QtcGFnZSBvaVwiLFxuICAgICAgICAgIFwiZGF0YS1nbHlwaFwiOiBcIm1lZGlhLXN0ZXAtYmFja3dhcmRcIixcbiAgICAgICAgICBcInRpdGxlXCI6IHJlZy5maXJzdFBhZ2VcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwidGFiaW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYnV0dG9uIHBhZ2luYXRpb24tYmFyLXByZXYtcGFnZSBvaVwiLFxuICAgICAgICAgIFwiZGF0YS1nbHlwaFwiOiBcImNhcmV0LWxlZnRcIixcbiAgICAgICAgICBcInRpdGxlXCI6IHJlZy5wcmV2UGFnZVxuICAgICAgICB9KSxcbiAgICAgICAgc2VwYXJhdG9yLFxuICAgICAgICBuZXcgVkh0bWxFbGVtZW50KHNwYW4sIHtcbiAgICAgICAgICBcImNsYXNzXCI6IFwidmFsaWduZWRcIlxuICAgICAgICB9LCBuZXcgVlRleHRFbGVtZW50KHJlZy5wYWdlKSksXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoXCJpbnB1dFwiLCB7XG4gICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxuICAgICAgICAgIFwibmFtZVwiOiBcInBhZ2UtbnVtYmVyXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcIm11c3QtaW50ZWdlciBwYWdpbmF0aW9uLWJhci1wYWdlLW51bWJlclwiLFxuICAgICAgICAgIFwidmFsdWVcIjogZGF0YS5wYWdlXG4gICAgICAgIH0pLFxuICAgICAgICBuZXcgVkh0bWxFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICAgICAgXCJjbGFzc1wiOiBcInZhbGlnbmVkIHRvdGFsLXBhZ2UtY291bnRcIixcbiAgICAgICAgICBcInZhbHVlXCI6IGRhdGEucGFnZVxuICAgICAgICB9LCBuZXcgVlRleHRFbGVtZW50KHJlZy5vZiArIFwiIFwiICsgZGF0YS50b3RhbFBhZ2VDb3VudCkpLFxuICAgICAgICBzZXBhcmF0b3IsXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwidGFiaW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYnV0dG9uIHBhZ2luYXRpb24tYmFyLXJlZnJlc2ggb2lcIixcbiAgICAgICAgICBcImRhdGEtZ2x5cGhcIjogXCJyZWxvYWRcIixcbiAgICAgICAgICBcInRpdGxlXCI6IHJlZy5yZWZyZXNoXG4gICAgICAgIH0pLFxuICAgICAgICBzZXBhcmF0b3IsXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwidGFiaW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYnV0dG9uIHBhZ2luYXRpb24tYmFyLW5leHQtcGFnZSBvaVwiLFxuICAgICAgICAgIFwiZGF0YS1nbHlwaFwiOiBcImNhcmV0LXJpZ2h0XCIsXG4gICAgICAgICAgXCJ0aXRsZVwiOiByZWcubmV4dFBhZ2VcbiAgICAgICAgfSksXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwidGFiaW5kZXhcIjogXCIwXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInBhZ2luYXRpb24tYnV0dG9uIHBhZ2luYXRpb24tYmFyLWxhc3QtcGFnZSBvaVwiLFxuICAgICAgICAgIFwiZGF0YS1nbHlwaFwiOiBcIm1lZGlhLXN0ZXAtZm9yd2FyZFwiLFxuICAgICAgICAgIFwidGl0bGVcIjogcmVnLmxhc3RQYWdlXG4gICAgICAgIH0pLFxuICAgICAgICBzZXBhcmF0b3IsXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwiY2xhc3NcIjogXCJ2YWxpZ25lZFwiLFxuICAgICAgICB9LCBuZXcgVlRleHRFbGVtZW50KHJlZy5yZXN1bHRzUGVyUGFnZSkpLFxuICAgICAgICBuZXcgVkh0bWxFbGVtZW50KFwic2VsZWN0XCIsIHtcbiAgICAgICAgICBcIm5hbWVcIjogXCJwYWdlcmVzdWx0c1wiLFxuICAgICAgICAgIFwiY2xhc3NcIjogXCJwYWdpbmF0aW9uLWJhci1yZXN1bHRzLXNlbGVjdCB2YWxpZ25lZFwiXG4gICAgICAgIH0sIF8ubWFwKG8ucmVzdWx0c1BlclBhZ2VTZWxlY3QsIHggPT4ge1xuICAgICAgICAgIHZhciBhID0gbmV3IFZIdG1sRWxlbWVudChcIm9wdGlvblwiLCB7XG4gICAgICAgICAgICBcInZhbHVlXCI6IHhcbiAgICAgICAgICB9LCBuZXcgVlRleHRFbGVtZW50KHgudG9TdHJpbmcoKSkpXG4gICAgICAgICAgaWYgKHggPT09IG8ucmVzdWx0c1BlclBhZ2UpIHtcbiAgICAgICAgICAgIGEuYXR0cmlidXRlcy5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9KSksXG4gICAgICAgIHNlcGFyYXRvcixcbiAgICAgICAgcmVzdWx0c0luZm8gPyBuZXcgVkh0bWxFbGVtZW50KHNwYW4sIHtcbiAgICAgICAgICBcImNsYXNzXCI6IFwidmFsaWduZWQgcmVzdWx0cy1pbmZvXCJcbiAgICAgICAgfSwgbmV3IFZUZXh0RWxlbWVudChyZXN1bHRzSW5mbykpIDogbnVsbCxcbiAgICAgICAgcmVzdWx0c0luZm8gPyBzZXBhcmF0b3IgOiBudWxsLFxuICAgICAgICBhbmNob3JUaW1lSW5mbyA/IG5ldyBWSHRtbEVsZW1lbnQoc3Bhbiwge1xuICAgICAgICAgIFwiY2xhc3NcIjogXCJ2YWxpZ25lZCBhbmNob3ItdGltZXN0YW1wLWluZm9cIlxuICAgICAgICB9LCBuZXcgVlRleHRFbGVtZW50KGFuY2hvclRpbWVJbmZvKSkgOiBudWxsLFxuICAgICAgICBzZWFyY2hFbGVtZW50ID8gc2VwYXJhdG9yIDogbnVsbCxcbiAgICAgICAgc2VhcmNoRWxlbWVudCxcbiAgICAgICAgZmlsdGVyc1ZpZXdFeHBhbmRhYmxlID8gc2VwYXJhdG9yIDogbnVsbCxcbiAgICAgICAgZmlsdGVyc1ZpZXdFeHBhbmRhYmxlID8gbmV3IFZIdG1sRWxlbWVudChcImJ1dHRvblwiLCB7XG4gICAgICAgICAgXCJjbGFzc1wiOiBcImJ0biB2YWxpZ25lZCBjYW1vLWJ0biBrdC1hZHZhbmNlZC1maWx0ZXJzXCIgKyAoZmlsdGVyc1ZpZXdPcGVuID8gXCIga3Qtb3BlblwiIDogXCJcIilcbiAgICAgICAgfSwgbmV3IFZUZXh0RWxlbWVudChhZHZhbmNlZEZpbHRlcnMpKSA6IG51bGxcbiAgICAgIF0pXG4gICAgXSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgaGVhZGVyIGZyb20gZ2l2ZW4gdGFibGUgYW5kIGNvbHVtbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0W119IGNvbHVtbnM7XG4gICAqIEBwYXJhbSB7b2JqZWN0W119IGRhdGE7XG4gICAqL1xuICBidWlsZEhlYWQoY29sdW1ucykge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGU7XG4gICAgdmFyIGJ1aWxkZXIgPSB0YWJsZS5idWlsZGVyO1xuICAgIHZhciBzb3J0Q3JpdGVyaWEgPSB0YWJsZS5zb3J0Q3JpdGVyaWEsIHJlZyA9IGJ1aWxkZXIuZ2V0UmVnKCk7XG4gICAgdmFyIHJvdyA9IG5ldyBWSHRtbEVsZW1lbnQoXCJ0clwiLCB7fSwgXy5tYXAoXy52YWx1ZXMoY29sdW1ucyksIHByb3AgPT4ge1xuICAgICAgaWYgKHByb3AuaGlkZGVuIHx8IHByb3Auc2VjcmV0KSB7XG4gICAgICAgIHJldHVybjsgLy8gc2tpcFxuICAgICAgfVxuICAgICAgdmFyIHNvcnRpbmcgPSBmYWxzZSwgb3JkZXIsIGNsYXNzZXMgPSBbcHJvcC5jc3NdO1xuICAgICAgaWYgKHByb3Auc29ydGFibGUpIHtcbiAgICAgICAgY2xhc3Nlcy5wdXNoKFwic29ydGFibGVcIik7XG4gICAgICAgIC8vIGlzIHRoZSB0YWJsZSBjdXJyZW50bHkgc29ydGVkIGJ5IHRoaXMgcHJvcGVydHk/XG4gICAgICAgIHZhciBzb3J0ZWRCeSA9IF8uZmluZChzb3J0Q3JpdGVyaWEsIHggPT4ge1xuICAgICAgICAgIHJldHVybiB4WzBdID09PSBwcm9wLm5hbWU7XG4gICAgICAgIH0pXG4gICAgICAgIGlmIChzb3J0ZWRCeSkge1xuICAgICAgICAgIHNvcnRpbmcgPSB0cnVlO1xuICAgICAgICAgIG9yZGVyID0gc29ydGVkQnlbMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBkaXNwbGF5TmFtZSA9IHByb3AuZGlzcGxheU5hbWU7XG4gICAgICB2YXIgY2VsbCA9IG5ldyBWSHRtbEVsZW1lbnQoXCJ0aFwiLCB7XCJjbGFzc1wiOiBjbGFzc2VzLmpvaW4oXCIgXCIpLCBcImRhdGEtcHJvcFwiOiBwcm9wLm5hbWV9LCBuZXcgVkh0bWxFbGVtZW50KFwiZGl2XCIsIHt9LCBbXG4gICAgICAgIG5ldyBWSHRtbEVsZW1lbnQoXCJzcGFuXCIsIHt9LCBuZXcgVlRleHRFbGVtZW50KGRpc3BsYXlOYW1lKSksXG4gICAgICAgIHNvcnRpbmcgPyBuZXcgVkh0bWxFbGVtZW50KFwic3BhblwiLCB7XG4gICAgICAgICAgXCJjbGFzc1wiOiBcIm9pIGt0LXNvcnQtZ2x5cGhcIixcbiAgICAgICAgICBcImRhdGEtZ2x5cGhcIjogb3JkZXIgPT0gMSA/IFwic29ydC1hc2NlbmRpbmdcIiA6IFwic29ydC1kZXNjZW5kaW5nXCIsXG4gICAgICAgICAgXCJhcmlhLWhpZGRlblwiOiB0cnVlLFxuICAgICAgICAgIFwidGl0bGVcIjogXy5mb3JtYXQob3JkZXIgPT0gMSA/IHJlZy5zb3J0QXNjZW5kaW5nQnkgOiByZWcuc29ydERlc2NlbmRpbmdCeSwgeyBuYW1lOiBkaXNwbGF5TmFtZSB9KVxuICAgICAgICB9KSA6IG51bGxcbiAgICAgIF0pKVxuXG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9KSk7XG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJ0aGVhZFwiLCB7XCJjbGFzc1wiOiBcImtpbmctdGFibGUtaGVhZFwifSwgcm93KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSB2aWV3IGZvciB0aGUgZ2l2ZW4gdGFibGUuXG4gICAqXG4gICAqIEBwYXJhbSB7S2luZ1RhYmxlfSB0YWJsZTtcbiAgICogQHBhcmFtIHtvYmplY3RbXX0gY29sdW1ucztcbiAgICogQHBhcmFtIHtvYmplY3RbXX0gZGF0YTtcbiAgICovXG4gIGJ1aWxkVmlldyhjb2x1bW5zLCBkYXRhLCBzdWJWaWV3KSB7XG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZTtcbiAgICB2YXIgdmlldztcbiAgICBpZiAoc3ViVmlldykge1xuICAgICAgdmlldyA9IHN1YlZpZXc7XG4gICAgfSBlbHNlIGlmICghZGF0YSB8fCAhZGF0YS5sZW5ndGgpIHtcbiAgICAgIHZpZXcgPSBuZXcgVkh0bWxFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgICAgXCJjbGFzc1wiOiBcImtpbmctdGFibGUtdmlld1wiXG4gICAgICB9LCB0aGlzLmVtcHR5VmlldygpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc29sdmVyID0gdGhpcy5nZXRWaWV3UmVzb2x2ZXIoKSwgdmlldztcbiAgICAgIGlmIChyZXNvbHZlciA9PT0gdGhpcykge1xuICAgICAgICAvLyB1c2UgZGVmYXVsdCByZXNvbHZlclxuICAgICAgICB2aWV3ID0gbmV3IFZIdG1sRWxlbWVudChcInRhYmxlXCIsIHtcbiAgICAgICAgICBcImNsYXNzXCI6IFwia2luZy10YWJsZVwiXG4gICAgICAgIH0sIFtcbiAgICAgICAgICB0aGlzLmJ1aWxkSGVhZChjb2x1bW5zKSxcbiAgICAgICAgICB0aGlzLmJ1aWxkQm9keShjb2x1bW5zLCBkYXRhKVxuICAgICAgICBdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHVzZSBjdXN0b20gcmVzb2x2ZXJcbiAgICAgICAgLy8gYWRkIHJlZmVyZW5jZSB0byB0YWJsZSBhbmQgb3B0aW9uc1xuICAgICAgICByZXNvbHZlci50YWJsZSA9IHRoaXMudGFibGU7XG4gICAgICAgIHJlc29sdmVyLm9wdGlvbnMgPSB0YWJsZS5vcHRpb25zO1xuXG4gICAgICAgIHZpZXcgPSByZXNvbHZlci5idWlsZFZpZXcodGFibGUsIGNvbHVtbnMsIGRhdGEpO1xuICAgICAgICAvLyByZW1vdmUgcmVmZXJlbmNlXG4gICAgICAgIGRlbGV0ZSByZXNvbHZlci50YWJsZTtcbiAgICAgICAgZGVsZXRlIHJlc29sdmVyLm9wdGlvbnM7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIHdyYXAgaW4gdmlldyByb290IGVsZW1lbnRcbiAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBcImNsYXNzXCI6IFwia2luZy10YWJsZS12aWV3XCJcbiAgICB9LCB2aWV3KTtcbiAgfVxuXG4gIGdldFRlbXBsYXRlKG9wdGlvbiwgdHlwZSkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob3B0aW9uKSkge1xuICAgICAgcmV0dXJuIG9wdGlvbi5jYWxsKHRoaXMpO1xuICAgIH1cbiAgICBpZiAoIV8uaXNTdHJpbmcob3B0aW9uKSkge1xuICAgICAgcmFpc2UoMzgsIGBDYW5ub3Qgb2J0YWluIEhUTUwgZnJvbSBnaXZlbiBwYXJhbWV0ZXIgJHt0eXBlfSwgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGEgc3RyaW5nLmApO1xuICAgIH1cbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbik7XG4gICAgaWYgKGVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgaWYgKC9zY3JpcHQvaS50ZXN0KGVsZW1lbnQudGFnTmFtZSkpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuaW5uZXJUZXh0O1xuICAgICAgfVxuICAgICAgcmFpc2UoMzgsIGBDYW5ub3Qgb2J0YWluIEhUTUwgZnJvbSBwYXJhbWV0ZXIgJHt0eXBlfS4gRWxlbWVudCBpcyBub3QgPHNjcmlwdD4uYCk7XG4gICAgfVxuICAgIC8vIG9wdGlvbiB0cmVhdGVkIGFzIGh0bWwgZnJhZ21lbnQgaXRzZWxmXG4gICAgcmV0dXJuIG9wdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSBmaWx0ZXJzIHZpZXcgZm9yIHRoZSBnaXZlbiB0YWJsZS5cbiAgICovXG4gIGJ1aWxkRmlsdGVyc1ZpZXcoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgbyA9IHNlbGYub3B0aW9ucyxcbiAgICAgIGZpbHRlcnNWaWV3ID0gby5maWx0ZXJzVmlldztcbiAgICBcbiAgICBpZiAoIWZpbHRlcnNWaWV3KSByZXR1cm47XG4gICAgdmFyIGZpbHRlcnNWaWV3T3BlbiA9IG8uZmlsdGVyc1ZpZXdPcGVuLFxuICAgICAgICBmaWx0ZXJzVmlld0V4cGFuZGFibGUgPSBvLmZpbHRlcnNWaWV3RXhwYW5kYWJsZSxcbiAgICAgICAgdGVtcGxhdGUgPSBzZWxmLmdldFRlbXBsYXRlKGZpbHRlcnNWaWV3LCBcImZpbHRlcnNWaWV3XCIpLFxuICAgICAgICBjc3MgPSBbXCJrdC1maWx0ZXJzXCJdO1xuXG4gICAgaWYgKGZpbHRlcnNWaWV3T3BlbiB8fCAoIWZpbHRlcnNWaWV3RXhwYW5kYWJsZSkpIGNzcy5wdXNoKFwia3Qtb3BlblwiKTtcbiAgICBpZiAoZmlsdGVyc1ZpZXdFeHBhbmRhYmxlKSBjc3MucHVzaChcImt0LWV4cGFuZGFibGVcIik7XG5cbiAgICByZXR1cm4gbmV3IFZIdG1sRWxlbWVudChcImRpdlwiLCB7XG4gICAgICBcImNsYXNzXCI6IGNzcy5qb2luKFwiIFwiKVxuICAgIH0sIFtuZXcgVkh0bWxGcmFnbWVudCh0ZW1wbGF0ZSldKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSB0b29scyB2aWV3IGZvciB0aGUgZ2l2ZW4gdGFibGUuXG4gICAqL1xuICBidWlsZFRvb2xzKCkge1xuICAgIC8vIHRvb2xzIGNhbiBiZSBlaXRoZXIgYnVpbHQgaW1tZWRpYXRlbHkgKGlmIGNvbHVtbnMgaW5mb3JtYXRpb24gYXJlIHJlYWR5KTtcbiAgICAvLyBvciBhZnRlcndhcmRzIHVwb24gdXBkYXRlXG4gICAgdmFyIHRhYmxlID0gdGhpcy50YWJsZSwgY29sc0luaXRpYWxpemVkID0gdGFibGUuY29sdW1uc0luaXRpYWxpemVkO1xuICAgIGlmICghY29sc0luaXRpYWxpemVkKSB7XG4gICAgICB0aGlzLl9tdXN0X2J1aWxkX3Rvb2xzID0gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIF9pZCA9IHRoaXMudG9vbHNSZWdpb25JZCA9IF8udW5pcXVlSWQoXCJ0b29scy1yZWdpb25cIik7IFxuICAgIHJldHVybiBuZXcgVkh0bWxFbGVtZW50KFwiZGl2XCIsIHtcbiAgICAgIFwiaWRcIjogX2lkLFxuICAgICAgXCJjbGFzc1wiOiBcInRvb2xzLXJlZ2lvblwiXG4gICAgfSwgdGhpcy5idWlsZFRvb2xzSW5uZXIoY29sc0luaXRpYWxpemVkKSk7XG4gIH1cblxuICBidWlsZFRvb2xzSW5uZXIoY29sc0luaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIG5ldyBWV3JhcHBlckVsZW1lbnQoW1xuICAgICAgbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgICBcImNsYXNzXCI6IFwib2kgdWctZXhwYW5kZXJcIixcbiAgICAgICAgXCJ0YWJpbmRleFwiOiBcIjBcIixcbiAgICAgICAgXCJkYXRhLWdseXBoXCI6IFwiY29nXCJcbiAgICAgIH0pLFxuICAgICAgY29sc0luaXRpYWxpemVkID8gdGhpcy5idWlsZE1lbnUoKSA6IG51bGxcbiAgICBdKTtcbiAgfVxuXG4gIGJ1aWxkTWVudSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIFxuICAgICAgbyA9IHNlbGYub3B0aW9ucywgXG4gICAgICBleHRyYVRvb2xzID0gby50b29scztcbiAgICBcbiAgICB2YXIgdG9vbHMgPSBbXG4gICAgICBzZWxmLmdldENvbHVtbnNNZW51U2NoZW1hKCksXG4gICAgICBzZWxmLmdldFZpZXdzTWVudVNjaGVtYSgpLFxuICAgICAgby5hbGxvd1NvcnRNb2RlcyA/IHNlbGYuZ2V0U29ydE1vZGVTY2hlbWEoKSA6IG51bGwsXG4gICAgICBzZWxmLmdldEV4cG9ydE1lbnVTY2hlbWEoKVxuICAgIF07XG5cbiAgICBpZiAoZXh0cmFUb29scykge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihleHRyYVRvb2xzKSkgZXh0cmFUb29scyA9IGV4dHJhVG9vbHMuY2FsbCh0aGlzKTtcbiAgICAgIGlmIChleHRyYVRvb2xzKSB7XG4gICAgICAgIGlmICghXy5pc0FycmF5KGV4dHJhVG9vbHMpKSB7XG4gICAgICAgICAgcmFpc2UoNDAsIFwiVG9vbHMgaXMgbm90IGFuIGFycmF5IG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGFuIGFycmF5LlwiKTtcbiAgICAgICAgfVxuICAgICAgICB0b29scyA9IHRvb2xzLmNvbmNhdChleHRyYVRvb2xzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoby5wcmVwVG9vbHMpIHtcbiAgICAgIGlmICghXy5pc0Z1bmN0aW9uKG8ucHJlcFRvb2xzKSkge1xuICAgICAgICByYWlzZSg0MSwgXCJwcmVwVG9vbHMgb3B0aW9uIG11c3QgYmUgYSBmdW5jdGlvbi5cIik7XG4gICAgICB9XG4gICAgICBvLnByZXBUb29scy5jYWxsKHRoaXMsIHRvb2xzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWVudUJ1aWxkZXIoe1xuICAgICAgICBpdGVtczogdG9vbHNcbiAgICB9KTtcbiAgfVxuXG4gIGdldFNvcnRNb2RlU2NoZW1hKCkge1xuICAgIHZhciByZWcgPSB0aGlzLmdldFJlZygpO1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLCBjdXJyZW50TW9kZSA9IG9wdGlvbnMuc29ydE1vZGU7XG4gICAgdmFyIGl0ZW1zID0gXy5tYXAoU29ydE1vZGVzLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogcmVnLnNvcnRNb2Rlc1t2YWx1ZV0sXG4gICAgICAgIGNoZWNrZWQ6IGN1cnJlbnRNb2RlID09IHZhbHVlLFxuICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgIHZhbHVlOiB2YWx1ZSwgLy8gdGhpcyBpcyB0aGUgcmFkaW8gdmFsdWU7IGFuZCBpcyByZXF1aXJlZFxuICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgXCJuYW1lXCI6IFwia3Qtc29ydC1tb2RlXCIsXG4gICAgICAgICAgXCJjbGFzc1wiOiBcInNvcnQtbW9kZS1yYWRpb1wiXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHJlZy5zb3J0T3B0aW9ucyxcbiAgICAgIG1lbnU6IHtcbiAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSBkZWZhdWx0IHNjaGVtYSBmb3IgY29sdW1ucyBtZW51LlxuICAgKi9cbiAgZ2V0Q29sdW1uc01lbnVTY2hlbWEoKSB7XG4gICAgLy8gVE9ETzogYWxsb3cgdG8gZGlzYWJsZSBieSBjb25maWd1cmF0aW9uXG4gICAgaWYgKCF0aGlzLnRhYmxlLmNvbHVtbnMgfHwgIXRoaXMudGFibGUuY29sdW1ucy5sZW5ndGgpIHtcbiAgICAgIHRocm93IFwiQ29sdW1ucyBub3QgaW5pdGlhbGl6ZWQuXCI7XG4gICAgfVxuICAgIHZhciBjb2x1bW5zID0gXy53aGVyZSh0aGlzLnRhYmxlLmNvbHVtbnMsIHggPT4ge1xuICAgICAgcmV0dXJuICF4LnNlY3JldDtcbiAgICB9KTtcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKTtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogcmVnLmNvbHVtbnMsXG4gICAgICBtZW51OiB7XG4gICAgICAgIGl0ZW1zOiBfLm1hcChjb2x1bW5zLCB4ID0+IHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbmFtZTogeC5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIGNoZWNrZWQ6ICF4LmhpZGRlbixcbiAgICAgICAgICAgIHR5cGU6IENIRUNLQk9YX1RZUEUsXG4gICAgICAgICAgICBhdHRyOiB7XG4gICAgICAgICAgICAgIFwibmFtZVwiOiB4Lm5hbWUsXG4gICAgICAgICAgICAgIFwiY2xhc3NcIjogXCJ2aXNpYmlsaXR5LWNoZWNrXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgZGVmYXVsdCBzY2hlbWEgZm9yIHZpZXdzIG1lbnUuXG4gICAqL1xuICBnZXRWaWV3c01lbnVTY2hlbWEoKSB7XG4gICAgdmFyIHJlZyA9IHRoaXMuZ2V0UmVnKCk7XG4gICAgdmFyIG8gPSB0aGlzLm9wdGlvbnMsIHZpZXdzID0gby52aWV3cywgY3VycmVudFZpZXcgPSBvLnZpZXc7XG4gICAgdmFyIGl0ZW1zID0gXy5tYXAodmlld3MsIG8gPT4ge1xuICAgICAgdmFyIHZhbHVlID0gby5uYW1lO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogcmVnLnZpZXdzVHlwZVt2YWx1ZV0gfHwgdmFsdWUsXG4gICAgICAgIGNoZWNrZWQ6IGN1cnJlbnRWaWV3ID09IHZhbHVlLFxuICAgICAgICB0eXBlOiBcInJhZGlvXCIsXG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIFwibmFtZVwiOiBcImt0LXZpZXctdHlwZVwiLFxuICAgICAgICAgIFwiY2xhc3NcIjogXCJ2aWV3LXR5cGUtcmFkaW9cIlxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZWcudmlldyxcbiAgICAgIG1lbnU6IHtcbiAgICAgICAgaXRlbXM6IGl0ZW1zXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYSBkZWZhdWx0IHNjaGVtYSBmb3IgZXhwb3J0IHRvb2xzLlxuICAgKi9cbiAgZ2V0RXhwb3J0TWVudVNjaGVtYSgpIHtcbiAgICB2YXIgdGFibGUgPSB0aGlzLnRhYmxlLFxuICAgICAgIGV4cG9ydEZvcm1hdHMgPSB0YWJsZS5vcHRpb25zLmV4cG9ydEZvcm1hdHM7XG4gICAgaWYgKCFleHBvcnRGb3JtYXRzIHx8ICFleHBvcnRGb3JtYXRzLmxlbmd0aCkgcmV0dXJuIG51bGw7IC8vIGRpc2FibGVkXG4gICAgLy8gaWYgdGhlIGNsaWVudCBkb2VzIG5vdCBzdXBwb3J0IGNsaWVudCBzaWRlIGV4cG9ydCwgcmVtb3ZlIHRoZSBjbGllbnQgc2lkZSBleHBvcnQgZm9ybWF0c1xuICAgIGlmICghRmlsZVV0aWxzLnN1cHBvcnRzQ3NFeHBvcnQoKSkge1xuICAgICAgZXhwb3J0Rm9ybWF0cyA9IF8ucmVqZWN0KGV4cG9ydEZvcm1hdHMsIG8gPT4gby5jcyB8fCBvLmNsaWVudFNpZGUpO1xuICAgIH1cbiAgICBpZiAoIWV4cG9ydEZvcm1hdHMgfHwgIWV4cG9ydEZvcm1hdHMubGVuZ3RoKSByZXR1cm4gbnVsbDsgLy8gZGlzYWJsZWRcbiAgICBcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKTtcblxuICAgIHZhciBpdGVtcyA9IF8ubWFwKGV4cG9ydEZvcm1hdHMsIG8gPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbmFtZTogcmVnLmV4cG9ydEZvcm1hdHNbby5mb3JtYXRdIHx8IG8ubmFtZSxcbiAgICAgICAgYXR0cjoge1xuICAgICAgICAgIGNzczogXCJleHBvcnQtYnRuXCIsXG4gICAgICAgICAgXCJkYXRhLWZvcm1hdFwiOiBvLmZvcm1hdFxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHJlZy5leHBvcnQsXG4gICAgICBtZW51OiB7XG4gICAgICAgIGl0ZW1zOiBpdGVtc1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBnb1RvUHJldigpIHtcbiAgICB0aGlzLnRhYmxlLnBhZ2luYXRpb24ucHJldigpO1xuICB9XG5cbiAgZ29Ub05leHQoKSB7XG4gICAgdGhpcy50YWJsZS5wYWdpbmF0aW9uLm5leHQoKTtcbiAgfVxuXG4gIGdvVG9GaXJzdCgpIHtcbiAgICB0aGlzLnRhYmxlLnBhZ2luYXRpb24uZmlyc3QoKTtcbiAgfVxuXG4gIGdvVG9MYXN0KCkge1xuICAgIHRoaXMudGFibGUucGFnaW5hdGlvbi5sYXN0KCk7XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHRoaXMudGFibGUucmVmcmVzaCgpO1xuICB9XG5cbiAgY2hhbmdlUGFnZShlKSB7XG4gICAgdmFyIHYgPSBlLnRhcmdldC52YWx1ZTtcbiAgICBpZiAoL15cXGQrJC8udGVzdCh2KSAmJiB0aGlzLnRhYmxlLnBhZ2luYXRpb24udmFsaWRQYWdlKHBhcnNlSW50KHYpKSkge1xuICAgICAgLy8gdXBkYXRlXG4gICAgICB0aGlzLnRhYmxlLnBhZ2luYXRpb24ucGFnZSA9IHBhcnNlSW50KHYpO1xuICAgICAgdGhpcy50YWJsZS5yZW5kZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gcmV2ZXJ0IHZhbHVlXG4gICAgICBlLnRhcmdldC52YWx1ZSA9IHRoaXMudGFibGUucGFnaW5hdGlvbi5wYWdlO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZVJlc3VsdHNOdW1iZXIoZSkge1xuICAgIHZhciB2ID0gZS50YXJnZXQudmFsdWU7XG4gICAgdGhpcy50YWJsZS5wYWdpbmF0aW9uLnJlc3VsdHNQZXJQYWdlID0gcGFyc2VJbnQodik7XG4gICAgdGhpcy50YWJsZS5yZW5kZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPYnRhaW5zIHRoZSBpdGVtIHJlbGF0ZWQgdG8gdGhlIGdpdmVuIGV2ZW50LlxuICAgKiBcbiAgICogQHBhcmFtIEV2ZW50IGU6IGV2ZW50XG4gICAqL1xuICBnZXRJdGVtQnlFdihlLCBpZ25vcmVNaXNzaW5nKSB7XG4gICAgaWYgKCFlKSByZXR1cm47XG4gICAgcmV0dXJuIHRoaXMuZ2V0SXRlbUJ5RWwoZS50YXJnZXQsIGlnbm9yZU1pc3NpbmcpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9idGFpbnMgdGhlIGl0ZW0gdG8gd2hpY2ggYSBnaXZlbiBIVE1MIHBlcnRhaW5zLlxuICAgKiBcbiAgICogQHBhcmFtIEhUTUxFbGVtZW50IGVsOiBlbGVtZW50XG4gICAqL1xuICBnZXRJdGVtQnlFbChlbCwgaWdub3JlTWlzc2luZykge1xuICAgIGlmICghZWwpIHJldHVybjtcbiAgICB2YXIgaXRlbUVsZW1lbnQgPSAkLmNsb3Nlc3RXaXRoQ2xhc3MoZWwsIFwia3QtaXRlbVwiKTtcbiAgICBpZiAoIWl0ZW1FbGVtZW50KSB7XG4gICAgICAvLyB0aGUgZWxlbWVudCBpcyBub3QgY29udGFpbmVkIGluIGFuIGt0LWl0ZW1cbiAgICAgIGlmIChpZ25vcmVNaXNzaW5nKSByZXR1cm47XG4gICAgICAvLyBub3Qgd2hhdCB0aGUgdXNlciBvZiB0aGUgbGlicmFyeSB3YW50c1xuICAgICAgcmFpc2UoMzYsIFwiQ2Fubm90IHJldHJpZXZlIGFuIGl0ZW0gYnkgZXZlbnQgZGF0YS4gTWFrZSBzdXJlIHRoYXQgSFRNTCBlbGVtZW50cyBnZW5lcmF0ZWQgZm9yIHRhYmxlIGl0ZW1zIGhhdmUgJ2t0LWl0ZW0nIGNsYXNzLlwiKTtcbiAgICB9XG4gICAgdmFyIGl0ZW1JeCA9IGl0ZW1FbGVtZW50LmRhdGFzZXQuaXRlbUl4O1xuICAgIGlmIChfLmlzVW5kKGl0ZW1JeCkpIHtcbiAgICAgIHJhaXNlKDM3LCBcIkNhbm5vdCByZXRyaWV2ZSBhbiBpdGVtIGJ5IGVsZW1lbnQgZGF0YS4gTWFrZSBzdXJlIHRoYXQgSFRNTCBlbGVtZW50cyBnZW5lcmF0ZWQgZm9yIHRhYmxlIGl0ZW1zIGhhdmUgJ2RhdGEtaXgnIGF0dHJpYnV0ZS5cIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRJdGVtc1tpdGVtSXhdOy8vXy5maW5kKHRoaXMuY3VycmVudEl0ZW1zLCBpID0+IGkuX19peF9fID09IGl0ZW1JeCk7XG4gIH1cblxuICBvbkl0ZW1DbGljayhlKSB7XG4gICAgdmFyIGl0ZW0gPSB0aGlzLmdldEl0ZW1CeUVsKGUudGFyZ2V0KSxcbiAgICAgIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsIHB1cmUgPSBvcHRpb25zLnB1cmlzdCwgdW5kO1xuICAgIG9wdGlvbnMub25JdGVtQ2xpY2suY2FsbCh0aGlzLCBpdGVtLCBwdXJlID8gdW5kIDogZSk7XG4gIH1cblxuICB0b2dnbGVBZHZhbmNlZEZpbHRlcnMoKSB7XG4gICAgdmFyIG5hbWUgPSBcImZpbHRlcnNWaWV3T3BlblwiLCBvYyA9IFwia3Qtb3BlblwiO1xuICAgIHZhciBmaWx0ZXJzVmlldyA9ICQuZmluZEJ5Q2xhc3ModGhpcy5yb290RWxlbWVudCwgXCJrdC1maWx0ZXJzXCIpWzBdO1xuICAgIHZhciBvcGVuID0gJC5oYXNDbGFzcyhmaWx0ZXJzVmlldywgb2MpO1xuICAgIHRoaXNbbmFtZV0gPSAhb3BlbjtcbiAgICAkLm1vZENsYXNzKGZpbHRlcnNWaWV3LCBvYywgdGhpc1tuYW1lXSk7XG4gIH1cblxuICBjbGVhckZpbHRlcnMoKSB7XG4gICAgLy8gVE9ET1xuICB9XG5cbiAgc29ydChlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQsIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgLy8gaWYgc29ydGluZyBieSBzZWFyY2gsIGlnbm9yZVxuICAgIGlmICh0aGlzLnRhYmxlLnNlYXJjaFRleHQgJiYgb3B0aW9ucy5zZWFyY2hTb3J0aW5nUnVsZXMpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICghL3RoL2kudGVzdChlbC50YWdOYW1lKSkge1xuICAgICAgZWwgPSAkLmNsb3Nlc3RXaXRoVGFnKGVsLCBcInRoXCIpO1xuICAgIH1cbiAgICB2YXIgcHJvcGVydHkgPSBlbC5kYXRhc2V0LnByb3AsIHRhYmxlID0gdGhpcy50YWJsZTs7XG4gICAgaWYgKHByb3BlcnR5ICYmIF8uYW55KHRoaXMudGFibGUuY29sdW1ucywgeCA9PiB7XG4gICAgICByZXR1cm4geC5uYW1lID09IHByb3BlcnR5O1xuICAgIH0pKSB7XG4gICAgICBzd2l0Y2ggKG9wdGlvbnMuc29ydE1vZGUpIHtcbiAgICAgICAgY2FzZSBTb3J0TW9kZXMuU2ltcGxlOlxuICAgICAgICAgIC8vIHNvcnQgYnkgc2luZ2xlIHByb3BlcnR5XG4gICAgICAgICAgdGFibGUucHJvZ3Jlc3NTb3J0QnlTaW5nbGUocHJvcGVydHkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNvcnRNb2Rlcy5Db21wbGV4OlxuICAgICAgICAgIC8vIHNvcnQgYnkgbXVsdGlwbGUgcHJvcGVydGllcywgaW4gb3JkZXIgb2YgZGVmaW5pdGlvblxuICAgICAgICAgIHRhYmxlLnByb2dyZXNzU29ydEJ5KHByb3BlcnR5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByYWlzZSgyOCwgXCJJbnZhbGlkIHNvcnQgbW9kZSBvcHRpb25zLiBWYWx1ZSBtdXN0IGJlIGVpdGhlciAnc2ltcGxlJyBvciAnY29tcGxleCcuXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uU2VhcmNoS2V5VXAoZSkge1xuICAgIHZhciBhID0gZS50YXJnZXQudmFsdWU7XG4gICAgdGhpcy5zZWFyY2goYSk7XG4gIH1cblxuICBvblNlYXJjaENoYW5nZShlKSB7XG4gICAgdmFyIGEgPSBlLnRhcmdldC52YWx1ZTtcbiAgICB0aGlzLnNlYXJjaChhKTtcbiAgfVxuXG4gIHZpZXdUb01vZGVsKCkge1xuICAgIGNvbnNvbGUubG9nKFwiVE9ET1wiKVxuICB9XG5cbiAgcHJlcGFyZUV2ZW50cyhldmVudHMsIHB1cmlzdCkge1xuICAgIGlmICghZXZlbnRzKSByZXR1cm47XG4gICAgaWYgKF8uaXNGdW5jdGlvbihldmVudHMpKSBldmVudHMgPSBldmVudHMuY2FsbCh0aGlzKTtcbiAgICB2YXIgeCwgbmV3T2JqID0ge307XG4gICAgZm9yICh4IGluIGV2ZW50cykge1xuICAgICAgbGV0IGZuID0gZXZlbnRzW3hdO1xuICAgICAgbmV3T2JqW3hdID0gXy5pc1N0cmluZyhmbikgPyBmbiA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5nZXRJdGVtQnlFdihlLCB0cnVlKTtcbiAgICAgICAgaWYgKHB1cmlzdCkge1xuICAgICAgICAgIHZhciByZSA9IGZuLmNhbGwodGhpcywgaXRlbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHJlID0gZm4uY2FsbCh0aGlzLCBlLCBpdGVtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmUgPT09IGZhbHNlID8gZmFsc2UgOiB0cnVlO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxuXG4gIGdldEV2ZW50cygpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgcHVyaXN0ID0gb3B0aW9ucy5wdXJpc3QsXG4gICAgICAgIGV2ZW50cyA9IG9wdGlvbnMuZXZlbnRzLCBcbiAgICAgICAgaWV2ZW50cyA9IG9wdGlvbnMuaWV2ZW50cztcbiAgICAvLyB3cmFwIGN1c3RvbSBldmVudHMgdG8gcmVjZWl2ZSB0aGUgaXRlbSBhcyBmaXJzdCBwYXJhbWV0ZXIgKGlmIGF2YWlsYWJsZSksIGFuZCBtYXliZSB0aGUgZXZlbnRcbiAgICBldmVudHMgPSB0aGlzLnByZXBhcmVFdmVudHMoZXZlbnRzLCBwdXJpc3QpO1xuICAgIGlldmVudHMgPSB0aGlzLnByZXBhcmVFdmVudHMoaWV2ZW50cywgdHJ1ZSk7XG4gICAgdmFyIGJhc2VldmVudHMgPSB0aGlzLmdldEJhc2VFdmVudHMoKTtcbiAgICByZXR1cm4gXy5leHRlbmQoe30sIGJhc2VldmVudHMsIGV2ZW50cywgaWV2ZW50cyk7XG4gIH1cblxuICBzZXRTb3J0TW9kZShuYW1lKSB7XG4gICAgdGhpcy5vcHRpb25zLnNvcnRNb2RlID0gbmFtZTtcbiAgICAvLyBzdG9yZSBzb3J0IG1vZGUgaW4gbWVtb3J5O1xuICAgIHRoaXMudGFibGUuc3RvcmVQcmVmZXJlbmNlKFwic29ydC1tb2RlXCIsIG5hbWUpO1xuICB9XG5cbiAgc2V0Vmlld1R5cGUobmFtZSkge1xuICAgIHRoaXMub3B0aW9ucy52aWV3ID0gbmFtZTtcbiAgICAvLyBzdG9yZSBzb3J0IG1vZGUgaW4gbWVtb3J5O1xuICAgIHRoaXMudGFibGUuc3RvcmVQcmVmZXJlbmNlKFwidmlldy10eXBlXCIsIG5hbWUpO1xuICAgIHRoaXMudGFibGUucmVuZGVyKCk7XG4gIH1cblxuICBnZXRDb2x1bW5zVmlzaWJpbGl0eSgpIHtcbiAgICB2YXIgY29sdW1uc0NoZWNrYm94ID0gJC5maW5kQnlDbGFzcyh0aGlzLnJvb3RFbGVtZW50LCBcInZpc2liaWxpdHktY2hlY2tcIik7XG4gICAgcmV0dXJuIF8ubWFwKGNvbHVtbnNDaGVja2JveCwgeCA9PiB7IHJldHVybiB7IG5hbWU6ICQuYXR0cih4LCBcIm5hbWVcIiksIHZpc2libGU6IHguY2hlY2tlZCB9IH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEV2ZW50IGhhbmRsZXIgZm9yIGRlZmF1bHQgY29sdW1ucyB2aXNpYmlsaXR5IGNoZWNrYm94IGNoYW5nZS5cbiAgICovXG4gIG9uQ29sdW1uVmlzaWJpbGl0eUNoYW5nZSgpIHtcbiAgICB2YXIgY29sdW1uc1Zpc2liaWxpdHkgPSB0aGlzLmdldENvbHVtbnNWaXNpYmlsaXR5KCk7XG4gICAgdGhpcy50YWJsZS50b2dnbGVDb2x1bW5zKGNvbHVtbnNWaXNpYmlsaXR5KTtcbiAgfVxuXG4gIG9uVmlld0NoYW5nZShlKSB7XG4gICAgaWYgKCFlKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgdGhpcy5zZXRWaWV3VHlwZSh0YXJnZXQudmFsdWUpO1xuICB9XG5cbiAgb25Tb3J0TW9kZUNoYW5nZShlKSB7XG4gICAgaWYgKCFlKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgdGhpcy5zZXRTb3J0TW9kZSh0YXJnZXQudmFsdWUpO1xuICB9XG5cbiAgb25FeHBvcnRDbGljayhlKSB7XG4gICAgdmFyIGVsID0gZS50YXJnZXQsXG4gICAgICBmb3JtYXQgPSBlbC5kYXRhc2V0LmZvcm1hdDtcbiAgICBpZiAoIWZvcm1hdCkge1xuICAgICAgcmFpc2UoMjksIFwiTWlzc2luZyBmb3JtYXQgaW4gZXhwb3J0IGVsZW1lbnQncyBkYXRhc2V0LlwiKTtcbiAgICB9XG4gICAgdGhpcy50YWJsZS5leHBvcnRUbyhmb3JtYXQpO1xuICB9XG5cbiAgZ2V0QmFzZUV2ZW50cygpIHtcbiAgICB2YXIgYmFzZWV2ZW50cyA9IHtcbiAgICAgIFwiY2xpY2sgLnBhZ2luYXRpb24tYmFyLWZpcnN0LXBhZ2VcIjogXCJnb1RvRmlyc3RcIixcbiAgICAgIFwiY2xpY2sgLnBhZ2luYXRpb24tYmFyLWxhc3QtcGFnZVwiOiBcImdvVG9MYXN0XCIsXG4gICAgICBcImNsaWNrIC5wYWdpbmF0aW9uLWJhci1wcmV2LXBhZ2VcIjogXCJnb1RvUHJldlwiLFxuICAgICAgXCJjbGljayAucGFnaW5hdGlvbi1iYXItbmV4dC1wYWdlXCI6IFwiZ29Ub05leHRcIixcbiAgICAgIFwiY2xpY2sgLnBhZ2luYXRpb24tYmFyLXJlZnJlc2hcIjogXCJyZWZyZXNoXCIsXG4gICAgICBcImNoYW5nZSAucGFnaW5hdGlvbi1iYXItcGFnZS1udW1iZXJcIjogXCJjaGFuZ2VQYWdlXCIsXG4gICAgICBcImNoYW5nZSAucGFnaW5hdGlvbi1iYXItcmVzdWx0cy1zZWxlY3RcIjogXCJjaGFuZ2VSZXN1bHRzTnVtYmVyXCIsXG4gICAgICBcImNsaWNrIC5rdC1hZHZhbmNlZC1maWx0ZXJzXCI6IFwidG9nZ2xlQWR2YW5jZWRGaWx0ZXJzXCIsXG4gICAgICBcImNsaWNrIC5idG4tY2xlYXItZmlsdGVyc1wiOiBcImNsZWFyRmlsdGVyc1wiLFxuICAgICAgXCJjbGljayAua2luZy10YWJsZS1oZWFkIHRoLnNvcnRhYmxlXCI6IFwic29ydFwiLFxuICAgICAgXCJrZXl1cCAuc2VhcmNoLWZpZWxkXCI6IFwib25TZWFyY2hLZXlVcFwiLFxuICAgICAgXCJwYXN0ZSAuc2VhcmNoLWZpZWxkLCBjdXQgLnNlYXJjaC1maWVsZFwiOiBcIm9uU2VhcmNoQ2hhbmdlXCIsXG4gICAgICBcImtleXVwIC5maWx0ZXJzLXJlZ2lvbiBpbnB1dFt0eXBlPSd0ZXh0J11cIjogXCJ2aWV3VG9Nb2RlbFwiLFxuICAgICAgXCJrZXl1cCAuZmlsdGVycy1yZWdpb24gdGV4dGFyZWFcIjogXCJ2aWV3VG9Nb2RlbFwiLFxuICAgICAgXCJjaGFuZ2UgLmZpbHRlcnMtcmVnaW9uIGlucHV0W3R5cGU9J2NoZWNrYm94J11cIjogXCJ2aWV3VG9Nb2RlbFwiLFxuICAgICAgXCJjaGFuZ2UgLmZpbHRlcnMtcmVnaW9uIGlucHV0W3R5cGU9J3JhZGlvJ11cIjogXCJ2aWV3VG9Nb2RlbFwiLFxuICAgICAgXCJjaGFuZ2UgLmZpbHRlcnMtcmVnaW9uIHNlbGVjdFwiOiBcInZpZXdUb01vZGVsXCIsXG4gICAgICBcImNoYW5nZSAudmlzaWJpbGl0eS1jaGVja1wiOiBcIm9uQ29sdW1uVmlzaWJpbGl0eUNoYW5nZVwiLFxuICAgICAgXCJjbGljayAuZXhwb3J0LWJ0blwiOiBcIm9uRXhwb3J0Q2xpY2tcIixcbiAgICAgIFwiY2hhbmdlIFtuYW1lPSdrdC12aWV3LXR5cGUnXVwiOiBcIm9uVmlld0NoYW5nZVwiLFxuICAgICAgXCJjaGFuZ2UgW25hbWU9J2t0LXNvcnQtbW9kZSddXCI6IFwib25Tb3J0TW9kZUNoYW5nZVwiXG4gICAgfTtcbiAgICAvLyBkaWZmZXJlbnQgaW5wdXQgdHlwZXNcbiAgICBfLmVhY2goXCJ0ZXh0IGRhdGUgZGF0ZXRpbWUgZGF0ZXRpbWUtbG9jYWwgZW1haWwgdGVsIHRpbWUgc2VhcmNoIHVybCB3ZWVrIGNvbG9yIG1vbnRoIG51bWJlclwiLnNwbGl0KFwiIFwiKSwgZnVuY3Rpb24gKGlucHV0VHlwZSkge1xuICAgICAgYmFzZWV2ZW50c1tcImNoYW5nZSAuZmlsdGVycy1yZWdpb24gaW5wdXRbdHlwZT0nXCIgKyBpbnB1dFR5cGUgKyBcIiddXCJdID0gXCJ2aWV3VG9Nb2RlbFwiO1xuICAgIH0pO1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIGlmIChvcHRpb25zLm9uSXRlbUNsaWNrKSB7XG4gICAgICBiYXNlZXZlbnRzW1wiY2xpY2sgLmt0LWl0ZW1cIl0gPSBcIm9uSXRlbUNsaWNrXCI7XG4gICAgfVxuICAgIHJldHVybiBiYXNlZXZlbnRzO1xuICB9XG5cbiAgYmluZEV2ZW50cygpIHtcbiAgICB2YXIgYSA9IFwiX19ldmVudHNfX2JvdW5kXCI7XG4gICAgaWYgKHRoaXNbYV0pIHJldHVybiB0aGlzO1xuICAgIHRoaXNbYV0gPSAxO1xuICAgIHJldHVybiB0aGlzXG4gICAgICAuZGVsZWdhdGVFdmVudHMoKVxuICAgICAgLmJpbmRXaW5kb3dFdmVudHMoKTtcbiAgfVxuXG4gIGFueU1lbnVJc09wZW4oKSB7XG4gICAgcmV0dXJuIGZhbHNlOy8vIFRPRE9cbiAgfVxuXG4gIGJpbmRXaW5kb3dFdmVudHMoKSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLnVuYmluZFdpbmRvd0V2ZW50cygpO1xuICAgICAgJC5vbihkb2N1bWVudC5ib2R5LCBcImtleWRvd24ua2luZy10YWJsZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIC8vaWYgYW55IG1lbnUgaXMgb3Blbiwgb3IgYW55IGlucHV0IGlzIGZvY3VzZWQsIGRvIG5vdGhpbmdcbiAgICAgICAgaWYgKCQuYW55SW5wdXRGb2N1c2VkKCkgfHwgc2VsZi5hbnlNZW51SXNPcGVuKCkpIHJldHVybiB0cnVlO1xuICAgICAgICB2YXIga2MgPSBlLmtleUNvZGU7XG4gICAgICAgIC8vaWYgdGhlIHVzZXIgY2xpY2tlZCB0aGUgbGVmdCBhcnJvdywgb3IgQSwgZ28gdG8gcHJldmlvdXMgcGFnZVxuICAgICAgICBpZiAoXy5jb250YWlucyhbMzcsIDY1XSwga2MpKSB7XG4gICAgICAgICAgLy9wcmV2IHBhZ2VcbiAgICAgICAgICBzZWxmLmdvVG9QcmV2KCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9pZiB0aGUgdXNlciBjbGlja2VkIHRoZSByaWdodCBhcnJvdywgb3IgRCwgZ28gdG8gbmV4dCBwYWdlXG4gICAgICAgIGlmIChfLmNvbnRhaW5zKFszOSwgNjhdLCBrYykpIHtcbiAgICAgICAgICAvL25leHQgcGFnZVxuICAgICAgICAgIHNlbGYuZ29Ub05leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8vVE9ETzogc3VwcG9ydCBzd2lwZSBldmVudHM7IHVzaW5nIEhhbW1lckpzIGxpYnJhcnlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHVuYmluZFdpbmRvd0V2ZW50cygpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAkLm9mZihkb2N1bWVudC5ib2R5LCBcImtleWRvd24ua2luZy10YWJsZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQXBwbGllcyBldmVudCBoYW5kbGVycy5cbiAgICovXG4gIGRlbGVnYXRlRXZlbnRzKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHRhYmxlID0gc2VsZi50YWJsZSxcbiAgICAgIG9wdGlvbnMgPSBzZWxmLm9wdGlvbnMsXG4gICAgICByb290ID0gc2VsZi50YWJsZS5lbGVtZW50LFxuICAgICAgZXZlbnRzID0gc2VsZi5nZXRFdmVudHMoKSxcbiAgICAgIGRlbGVnYXRlRXZlbnRTcGxpdHRlciA9IC9eKFxcUyspXFxzKiguKikkLztcbiAgICBzZWxmLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gZXZlbnRzKSB7XG4gICAgICB2YXIgdmFsID0gZXZlbnRzW2tleV0sXG4gICAgICAgIG1ldGhvZCA9IHZhbDtcbiAgICAgIGlmICghbWV0aG9kKSByYWlzZSgyNywgXCJJbnZhbGlkIG1ldGhvZCBkZWZpbml0aW9uXCIpO1xuICAgICAgLy8gaWYgbWV0aG9kIHRyeSB0byByZWFkIGZyb20gYnVpbGRlciBpdHNlbGZcbiAgICAgIGlmICghXy5pc0Z1bmN0aW9uKG1ldGhvZCkpIG1ldGhvZCA9IHNlbGZbbWV0aG9kXTtcbiAgICAgIGlmICghbWV0aG9kICYmIF8uaXNGdW5jdGlvbihvcHRpb25zW3ZhbF0pKVxuICAgICAgICAvLyB0cnkgdG8gcmVhZCBmcm9tIG9wdGlvbnNcbiAgICAgICAgbWV0aG9kID0gb3B0aW9uc1t2YWxdO1xuXG4gICAgICBpZiAoIV8uaXNGdW5jdGlvbihtZXRob2QpKSB0aHJvdyBuZXcgRXJyb3IoXCJtZXRob2Qgbm90IGRlZmluZWQgaW5zaWRlIHRoZSBtb2RlbDogXCIgKyBldmVudHNba2V5XSk7XG4gICAgICB2YXIgbWF0Y2ggPSBrZXkubWF0Y2goZGVsZWdhdGVFdmVudFNwbGl0dGVyKTtcbiAgICAgIHZhciBldmVudE5hbWUgPSBtYXRjaFsxXSwgc2VsZWN0b3IgPSBtYXRjaFsyXTtcbiAgICAgIG1ldGhvZCA9IF8uYmluZChtZXRob2QsIHNlbGYpO1xuICAgICAgZXZlbnROYW1lICs9IFwiLmRlbGVnYXRlXCI7XG4gICAgICBpZiAoc2VsZWN0b3IgPT09IFwiXCIpIHtcbiAgICAgICAgLy8gVE9ETzogc3VwcG9ydFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJkZWxlZ2F0ZXMgd2l0aG91dCBzZWxlY3RvciBhcmUgbm90IGltcGxlbWVudGVkXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJC5vbihyb290LCBldmVudE5hbWUsIHNlbGVjdG9yLCBtZXRob2QpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgYSA9IFwiX19ldmVudHNfX2JvdW5kXCI7XG4gICAgc2VsZlthXSA9IDA7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBldmVudCBoYW5kbGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyB0YWJsZSBidWlsZGVyLlxuICAgKi9cbiAgdW5kZWxlZ2F0ZUV2ZW50cygpIHtcbiAgICAkLm9mZih0aGlzLnRhYmxlLmVsZW1lbnQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIG9mIHRoaXMgS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyLlxuICAgKi9cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyB1bmRlbGVnYXRlIGV2ZW50c1xuICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpLnVuYmluZFdpbmRvd0V2ZW50cygpO1xuICAgIC8vIHJlbW92ZSBlbGVtZW50XG4gICAgJC5yZW1vdmUodGhpcy5yb290RWxlbWVudCk7XG4gICAgJC5yZW1vdmVDbGFzcyh0aGlzLnRhYmxlLmVsZW1lbnQsIEtpbmdUYWJsZUNsYXNzTmFtZSk7XG5cbiAgICAvLyByZW1vdmVzIHJlZmVyZW5jZSB0byByb290IGVsZW1lbnQgKGl0IGdldHMgcmVtb3ZlZCBmcm9tIERPTSBpbnNpZGUgYmFzZSBkaXNwb3NlKVxuICAgIHRoaXMuY3VycmVudEl0ZW1zID0gdGhpcy5yb290RWxlbWVudCA9IG51bGw7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgZW1wdHlWaWV3KCkge1xuICAgIHZhciByZWcgPSB0aGlzLmdldFJlZygpO1xuICAgIHJldHVybiBuZXcgVkh0bWxFbGVtZW50KFwiZGl2XCIsIHtcImNsYXNzXCI6IFwia2luZy10YWJsZS1lbXB0eVwifSxcbiAgICAgIG5ldyBWSHRtbEVsZW1lbnQoXCJzcGFuXCIsIDAsIG5ldyBWVGV4dEVsZW1lbnQocmVnLm5vRGF0YSkpKTtcbiAgfVxuXG4gIGVycm9yVmlldyhtZXNzYWdlKSB7XG4gICAgaWYgKCFtZXNzYWdlKSB7XG4gICAgICBtZXNzYWdlID0gdGhpcy5nZXRSZWcoKS5lcnJvckZldGNoaW5nRGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBWSHRtbEZyYWdtZW50KGA8ZGl2IGNsYXNzPVwia2luZy10YWJsZS1lcnJvclwiPlxuICAgICAgPHNwYW4gY2xhc3M9XCJtZXNzYWdlXCI+XG4gICAgICAgIDxzcGFuPiR7bWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwib2lcIiBkYXRhLWdseXBoPVwid2FybmluZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICA8L2Rpdj5gKTtcbiAgfVxuXG4gIGxvYWRpbmdWaWV3KCkge1xuICAgIHZhciByZWcgPSB0aGlzLmdldFJlZygpXG4gICAgcmV0dXJuIG5ldyBWSHRtbEVsZW1lbnQoXCJkaXZcIiwge1xuICAgICAgXCJjbGFzc1wiOiBcImxvYWRpbmctaW5mb1wiXG4gICAgfSwgW25ldyBWSHRtbEVsZW1lbnQoXCJzcGFuXCIsIHtcbiAgICAgIFwiY2xhc3NcIjogXCJsb2FkaW5nLXRleHRcIlxuICAgIH0sIG5ldyBWVGV4dEVsZW1lbnQocmVnLmxvYWRpbmcpKSwgbmV3IFZIdG1sRWxlbWVudChcInNwYW5cIiwge1xuICAgICAgXCJjbGFzc1wiOiBcIm1pbmktbG9hZGVyXCJcbiAgICB9KV0pO1xuICB9XG5cbiAgc2luZ2xlTGluZSgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJtYWtlIHRhcmdldGVkIHVwZGF0ZXNcIik7XG4gIH1cbn1cblxuS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyLmRlZmF1bHRzID0ge1xuICB2aWV3OiBcInRhYmxlXCIsXG4gIHZpZXdzOiBbXG4gICAge25hbWU6XCJ0YWJsZVwiLCByZXNvbHZlcjogdHJ1ZX0sXG4gICAge25hbWU6XCJnYWxsZXJ5XCIsIHJlc29sdmVyOiBLaW5nVGFibGVSaEdhbGxlcnlWaWV3UmVzb2x2ZXJ9XG4gIF0sXG4gIGZpbHRlcnNWaWV3OiBudWxsLCAvLyBhbGxvd3MgdG8gZGVmaW5lIGEgdmlldyBmb3IgYWR2YW5jZWQgZmlsdGVyc1xuICBmaWx0ZXJzVmlld0V4cGFuZGFibGU6IHRydWUsIC8vIHdoZXRoZXIgdGhlIGFkdmFuY2VkIGZpbHRlcnMgdmlldyBzaG91bGQgYmUgZXhwYW5kYWJsZTsgb3IgYWx3YXlzIHZpc2libGUuXG4gIGZpbHRlcnNWaWV3T3BlbjogZmFsc2UsIC8vIHdoZXRoZXIgZmlsdGVycyB2aWV3IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGRpc3BsYXllZCwgdXBvbiB0YWJsZSByZW5kZXIuXG4gIHNlYXJjaERlbGF5OiA1MCxcbiAgc29ydE1vZGU6IFNvcnRNb2Rlcy5TaW1wbGUsXG4gIGFsbG93U29ydE1vZGVzOiB0cnVlLCAvLyB3aGV0aGVyIHRvIGFsbG93IHNlbGVjdGluZyBzb3J0IG1vZGVcbiAgcHVyaXN0OiBmYWxzZSwgICAgICAgICAvLyB3aGV0aGVyIHRvIGV4Y2x1ZGUgZXZlbnQgYW5kIG90aGVyIERPTSBkYXRhIGluIGhpZ2ggbGV2ZWwgY2FsbGJhY2tzXG5cbiAgLy8gUGVybWl0cyB0byBzcGVjaWZ5IHRoZSBvcHRpb25zIG9mIHRoZSByZXN1bHRzIHBlciBwYWdlIHNlbGVjdFxuICByZXN1bHRzUGVyUGFnZVNlbGVjdDogWzEwLCAzMCwgNTAsIDEwMCwgMjAwXSxcblxuICAvLyBQZXJtaXRzIHRvIHNwZWNpZnkgZXh0cmEgdG9vbHMgZm9yIHRoaXMgdGFibGVcbiAgdG9vbHM6IG51bGwsXG5cbiAgLy8gQWxsb3dzIHRvIGFsdGVyIHRvb2xzIGJlZm9yZSByZW5kZXJcbiAgcHJlcFRvb2xzOiBudWxsLFxuXG4gIC8vIFdoZXRoZXIgdG8gYXV0b21hdGljYWxseSBoaWdobGlnaHQgdmFsdWVzIHRoYXQgYW5zd2VyIHRvIHRleHQgc2VhcmNoIGNyaXRlcmlhLlxuICBhdXRvSGlnaGxpZ2h0U2VhcmNoUHJvcGVydGllczogdHJ1ZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgS2luZ1RhYmxlUmljaEh0bWxCdWlsZGVyOyIsIi8qKlxuICogS2luZ1RhYmxlIHBsYWluIHRleHQgYnVpbGRlci5cbiAqIERlZmluZXMgYSB0YWJsZSBidWlsZGVyIHRoYXQgcmVuZGVycyB0YWJ1bGFyIGRhdGEgaW4gcGxhaW4gdGV4dCxcbiAqIHN1aXRhYmxlIGZvciBkZWJ1ZywgdW5pdCB0ZXN0cywgY29uc29sZSBvdXRwdXQgYW5kIHBsYWluIHRleHQgZW1haWxzLlxuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9Sb2JlcnRvUHJldmF0by9LaW5nVGFibGVcbiAqXG4gKiBDb3B5cmlnaHQgMjAxNywgUm9iZXJ0byBQcmV2YXRvXG4gKiBodHRwczovL3JvYmVydG9wcmV2YXRvLmdpdGh1Yi5pb1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZTpcbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cbmltcG9ydCBLaW5nVGFibGVCdWlsZGVyIGZyb20gXCIuLi8uLi9zY3JpcHRzL3RhYmxlcy9raW5ndGFibGUuYnVpbGRlclwiXG5pbXBvcnQgeyBUZXh0U2xpZGVyIH0gZnJvbSBcIi4uLy4uL3NjcmlwdHMvbGl0ZXJhdHVyZS90ZXh0LXNsaWRlclwiXG5pbXBvcnQge1xuICBBcmd1bWVudEV4Y2VwdGlvbixcbiAgQXJndW1lbnROdWxsRXhjZXB0aW9uLFxuICBUeXBlRXhjZXB0aW9uLFxuICBPdXRPZlJhbmdlRXhjZXB0aW9uXG59IGZyb20gXCIuLi8uLi9zY3JpcHRzL2V4Y2VwdGlvbnNcIlxuaW1wb3J0IHJhaXNlIGZyb20gXCIuLi8uLi9zY3JpcHRzL3JhaXNlXCJcbmltcG9ydCBfIGZyb20gXCIuLi8uLi9zY3JpcHRzL3V0aWxzXCJcbmltcG9ydCBTIGZyb20gXCIuLi8uLi9zY3JpcHRzL2NvbXBvbmVudHMvc3RyaW5nXCJcbmNvbnN0IFNQQUNFID0gXCIgXCJcbmNvbnN0IFJOID0gXCJcXHJcXG5cIlxuY29uc3QgTElORV9TRVAgPSBTLnJlcGVhdChcIipcIiwgNjUpO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtpbmdUYWJsZVRleHRCdWlsZGVyIGV4dGVuZHMgS2luZ1RhYmxlQnVpbGRlciB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgS2luZ1RhYmxlVGV4dEJ1aWxkZXIgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiB0YWJsZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRhYmxlKSB7XG4gICAgc3VwZXIodGFibGUpXG4gICAgdGhpcy5zbGlkZXIgPSBuZXcgVGV4dFNsaWRlcihcIi4uLi5cIilcbiAgICB0aGlzLnNldExpc3RlbmVycyh0YWJsZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBsaXN0ZW5lcnMgZm9yIHRoZSBnaXZlbiB0YWJsZS5cbiAgICovXG4gIHNldExpc3RlbmVycyh0YWJsZSkge1xuICAgIGlmICghdGFibGUpIHJldHVybjtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodGFibGUuZWxlbWVudCAmJiBLaW5nVGFibGVUZXh0QnVpbGRlci5vcHRpb25zLmhhbmRsZUxvYWRpbmdJbmZvKSB7XG4gICAgICBzZWxmLmxpc3RlblRvKHRhYmxlLCBcImZldGNoaW5nOmRhdGFcIiwgKCkgPT4ge1xuICAgICAgICBzZWxmLmxvYWRpbmdIYW5kbGVyKHRhYmxlKTtcbiAgICAgIH0pO1xuICAgICAgc2VsZi5saXN0ZW5Ubyh0YWJsZSwgXCJmZXRjaGVkOmRhdGFcIiwgKCkgPT4ge1xuICAgICAgICBzZWxmLnVuc2V0TG9hZGluZ0hhbmRsZXIoKTtcbiAgICAgIH0pO1xuICAgICAgc2VsZi5saXN0ZW5Ubyh0YWJsZSwgXCJmZXRjaDpmYWlsXCIsICgpID0+IHtcbiAgICAgICAgc2VsZi51bnNldExvYWRpbmdIYW5kbGVyKCkuZGlzcGxheSh0YWJsZSwgc2VsZi5lcnJvclZpZXcoKSk7XG4gICAgICB9KTtcbiAgICAgIHNlbGYubGlzdGVuVG8odGFibGUsIFwibm8tcmVzdWx0c1wiLCAoKSA9PiB7XG4gICAgICAgIHNlbGYudW5zZXRMb2FkaW5nSGFuZGxlcigpLmRpc3BsYXkodGFibGUsIHNlbGYuZW1wdHlWaWV3KCkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdsb2JhbCBvcHRpb25zIGZvciBldmVyeSBLaW5nVGFibGVUZXh0QnVpbGRlci5cbiAgICovXG4gIHN0YXRpYyBnZXQgb3B0aW9ucygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVhZGVyTGluZVNlcGFyYXRvcjogXCI9XCIsXG4gICAgICBoZWFkZXJDb3JuZXJDaGFyOiBcIj1cIixcbiAgICAgIGNvcm5lckNoYXI6IFwiK1wiLFxuICAgICAgaGVhZGVyc0FsaWdubWVudDogXCJsXCIsXG4gICAgICByb3dzQWxpZ25tZW50OiBcImxcIixcbiAgICAgIHBhZGRpbmc6IDEsXG4gICAgICBjZWxsVmVydGljYWxMaW5lOiBcInxcIixcbiAgICAgIGNlbGxIb3Jpem9udGFsTGluZTogXCItXCIsXG4gICAgICBtaW5DZWxsV2lkdGg6IDAsXG4gICAgICBoYW5kbGVMb2FkaW5nSW5mbzogdHJ1ZSwgLy8gd2hldGhlciB0byBkaXNwbGF5IGxvYWRpbmcgaW5mb3JtYXRpb24gKHN1aXRhYmxlIGZvciBjb25zb2xlIGFwcGxpY2F0aW9ucylcbiAgICAgIGxvYWRJbmZvRGVsYXk6IDUwMCAgICAgICAvLyBob3cgbWFueSBtaWxsaXNlY29uZHMgc2hvdWxkIHdhaXQsIGJlZm9yZSBkaXNwbGF5aW5nIHRoZSBcIkxvYWRpbmcuLi5cIiBpbmZvcm1hdGlvblxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBpbmZvcm1hdGlvbiBmb3IgdGhlIHRhYmxlIGluIGEgc2luZ2xlIGxpbmUsIGluY2x1ZGluZ1xuICAgKiB0YWJsZSBjYXB0aW9uIGFuZCBwYWdpbmF0aW9uIGluZm9ybWF0aW9uLCBpZiBhdmFpbGFibGUuXG4gICAqL1xuICBzaW5nbGVMaW5lKHRhYmxlLCBsaW5lKSB7XG4gICAgcmV0dXJuIHRoaXMudGFidWxhdGUoW1tsaW5lXV0sIFtdLCBfLmV4dGVuZCh7XG4gICAgICBjYXB0aW9uOiB0YWJsZS5vcHRpb25zLmNhcHRpb25cbiAgICB9LCB0YWJsZS5wYWdpbmF0aW9uLnRvdGFsUGFnZUNvdW50ID4gMCA/IHRhYmxlLnBhZ2luYXRpb24uZGF0YSgpIDogbnVsbCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBlcnJvciB2aWV3LlxuICAgKi9cbiAgZXJyb3JWaWV3KCkge1xuICAgIHZhciB0YWJsZSA9IHRoaXMudGFibGU7XG4gICAgdmFyIHJlZyA9IHRoaXMuZ2V0UmVnKCk7XG4gICAgcmV0dXJuIHRoaXMuc2luZ2xlTGluZSh0YWJsZSwgcmVnLmVycm9yRmV0Y2hpbmdEYXRhKTtcbiAgfVxuXG4gIGxvYWRpbmdIYW5kbGVyKHRhYmxlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYudW5zZXRMb2FkaW5nSGFuZGxlcigpO1xuICAgIHZhciBzbGlkZXIgPSB0aGlzLnNsaWRlcjtcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKVxuICAgIHZhciBsYWJlbCA9IHJlZy5sb2FkaW5nICsgXCIgXCI7XG5cbiAgICB2YXIgZGVsYXlJbmZvID0gdGFibGUuaGFzRGF0YSgpID8gS2luZ1RhYmxlVGV4dEJ1aWxkZXIub3B0aW9ucy5sb2FkSW5mb0RlbGF5IDogMDtcbiAgICAvLyBkaXNwbGF5IGEgbG9hZGluZyBpbmZvcm1hdGlvbiwgYnV0IG9ubHkgaWYgd2FpdGluZyBmb3IgbW9yZSB0aGFuIG4gbWlsbGlzZWNvbmRzXG4gICAgdmFyIGVsZW1lbnQgPSB0YWJsZS5lbGVtZW50O1xuICAgIHNlbGYuc2hvd0xvYWRpbmdUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIXRhYmxlLmxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYudW5zZXRMb2FkaW5nSGFuZGxlcigpO1xuICAgICAgfVxuICAgICAgdmFyIHRleHQgPSBzZWxmLnNpbmdsZUxpbmUodGFibGUsIGxhYmVsICsgc2xpZGVyLm5leHQoKSk7XG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIC8vIHNldCBpbnRlcnZhbCwgdG8gZGlzcGxheSBhIG5pY2UgdGV4dCBhbmltYXRpb24gd2hpbGUgbG9hZGluZ1xuICAgICAgLy9cbiAgICAgIHNlbGYubG9hZGluZ0ludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRhYmxlLmxvYWRpbmcpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi51bnNldExvYWRpbmdIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRleHQgPSBzZWxmLnNpbmdsZUxpbmUodGFibGUsIGxhYmVsICsgc2xpZGVyLm5leHQoKSk7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgIH0sIDYwMCk7XG4gICAgfSwgZGVsYXlJbmZvKVxuICB9XG5cbiAgdW5zZXRMb2FkaW5nSGFuZGxlcigpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMubG9hZGluZ0ludGVydmFsKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5zaG93TG9hZGluZ1RpbWVvdXQpO1xuICAgIHRoaXMubG9hZGluZ0ludGVydmFsID0gdGhpcy5zaG93TG9hZGluZ1RpbWVvdXQgPSBudWxsO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIG9mIHRoaXMgS2luZ1RhYmxlVGV4dEJ1aWxkZXIuXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHZhciBlbGVtZW50ID0gdGFibGUuZWxlbWVudDtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cbiAgICB0aGlzLnN0b3BMaXN0ZW5pbmcodGhpcy50YWJsZSk7XG4gICAgdGhpcy50YWJsZSA9IG51bGw7XG4gICAgdGhpcy5zbGlkZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIGEgYnVpbHQgdGFibGUuXG4gICAqL1xuICBkaXNwbGF5KHRhYmxlLCBidWlsdCkge1xuICAgIC8vXG4gICAgLy8gTkI6IGFzaWRlIGZyb20gdGhpcyBwaWVjZSBvZiBjb2RlLCB0aGlzIGNsYXNzIGlzIGFic3RyYWN0ZWRcbiAgICAvLyBmcm9tIERPTSBtYW5pcHVsYXRpb247XG4gICAgLy8gSWYgYSB0YWJsZSBoYXMgYW4gZWxlbWVudCwgYXNzdW1lIHRoYXQgaXMgYSBET00gZWxlbWVudDtcbiAgICAvL1xuICAgIHZhciBlbGVtZW50ID0gdGFibGUuZWxlbWVudDtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgLy9cbiAgICAgIC8vIE5COiB0aGlzIGNsYXNzIGRvZXMgbm90IHNldCBhbnkgZXZlbnQgaGFuZGxlcixcbiAgICAgIC8vIGhlbmNlIGRvZXMgbm90IHRyeSB0byB1bnNldCBhbnkgZXZlbnQgaGFuZGxlciB3aGVuIHJlbW92aW5nIGFuIGVsZW1lbnQuXG4gICAgICAvL1xuICAgICAgLy8gYSBjdXN0b20gZXZlbnQgaXMgZmlyZWQsIHNvIHRoZSB1c2VyIG9mIHRoZSBsaWJyYXJ5IGNhbiB1bnNldCBhbnkgZXZlbnQgYWRkZWRcbiAgICAgIC8vIGJ5IG90aGVyIG1lYW5zIChlLmcuIHZhbmlsbGEgSmF2YVNjcmlwdCBvciBqUXVlcnkpXG4gICAgICAvL1xuICAgICAgdGFibGUuZW1pdChcImVtcHR5OmVsZW1lbnRcIiwgZWxlbWVudCk7XG4gICAgICB3aGlsZSAoZWxlbWVudC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChlbGVtZW50Lmxhc3RDaGlsZCk7XG4gICAgICB9XG4gICAgICBpZiAoZWxlbWVudC50YWdOYW1lICE9IFwiUFJFXCIpIHtcbiAgICAgICAgLy8gYXBwZW5kIGEgUFJFIGVsZW1lbnRcbiAgICAgICAgdmFyIGNoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInByZVwiKTtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIGVsZW1lbnQgPSBjaGlsZDtcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gYnVpbHQ7XG4gICAgICAvL1xuICAgICAgLy8gVE9ETzogYWRkIG1ldGhvZCB0byBkaXNwb3NlIHRoZSBlbGVtZW50IGZvciBlYWNoIHZpZXcgaGFuZGxlcj9cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBnaXZlbiBpbnN0YW5jZSBvZiBLaW5nVGFibGUgaW4gcGxhaW4gdGV4dC5cbiAgICovXG4gIGJ1aWxkKHRhYmxlKSB7XG4gICAgaWYgKCF0YWJsZSkgdGFibGUgPSB0aGlzLnRhYmxlO1xuICAgIHZhciBhID0gdGFibGUuZ2V0RGF0YSh7XG4gICAgICBvcHRpbWl6ZTogdHJ1ZSxcbiAgICAgIGZvcm1hdDogdHJ1ZVxuICAgIH0pO1xuICAgIGlmICghYSB8fCAhYS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BsYXkodGFibGUsIHRoaXMuZW1wdHlWaWV3KCkpXG4gICAgfVxuICAgIHZhciBoZWFkZXJzID0gYS5zaGlmdCgpO1xuICAgIHZhciBidWlsdCA9IHRoaXMudGFidWxhdGUoaGVhZGVycywgYSwgXy5leHRlbmQoe1xuICAgICAgY2FwdGlvbjogdGFibGUub3B0aW9ucy5jYXB0aW9uLFxuICAgICAgZGF0YUFuY2hvclRpbWU6IHRhYmxlLm9wdGlvbnMuc2hvd0FuY2hvclRpbWVzdGFtcCA/IHRhYmxlLmdldEZvcm1hdHRlZEFuY2hvclRpbWUoKSA6IG51bGxcbiAgICB9LCB0YWJsZS5wYWdpbmF0aW9uLmRhdGEoKSkpO1xuICAgIC8vXG4gICAgLy8gZGlzcGxheSB0aGUgdGFibGU6XG4gICAgLy9cbiAgICB0aGlzLmRpc3BsYXkodGFibGUsIGJ1aWx0KTtcbiAgfVxuXG4gIGVtcHR5VmlldygpIHtcbiAgICB2YXIgcmVnID0gdGhpcy5nZXRSZWcoKVxuICAgIHJldHVybiBMSU5FX1NFUCArIFJOICsgcmVnLm5vRGF0YSArIFJOICsgTElORV9TRVA7XG4gIH1cblxuICBwYWdpbmF0aW9uSW5mbyhkYXRhKSB7XG4gICAgdmFyIHMgPSBcIlwiLCBzZXAgPSBcIiAtIFwiO1xuICAgIHZhciByZWcgPSB0aGlzLmdldFJlZygpLFxuICAgICAgICBwYWdlID0gZGF0YS5wYWdlLFxuICAgICAgICB0b3RhbFBhZ2VDb3VudCA9IGRhdGEudG90YWxQYWdlQ291bnQsXG4gICAgICAgIGZpcnN0T2JqZWN0TnVtYmVyID0gZGF0YS5maXJzdE9iamVjdE51bWJlcixcbiAgICAgICAgbGFzdE9iamVjdE51bWJlciA9IGRhdGEubGFzdE9iamVjdE51bWJlcixcbiAgICAgICAgdG90YWxJdGVtc0NvdW50ID0gZGF0YS50b3RhbEl0ZW1zQ291bnQsXG4gICAgICAgIGRhdGFBbmNob3JUaW1lID0gZGF0YS5kYXRhQW5jaG9yVGltZSxcbiAgICAgICAgaXNOdW0gPSBfLmlzTnVtYmVyO1xuICAgIGlmIChpc051bShwYWdlKSkge1xuICAgICAgcyArPSByZWcucGFnZSArIFNQQUNFICsgcGFnZTtcblxuICAgICAgaWYgKGlzTnVtKHRvdGFsUGFnZUNvdW50KSkge1xuICAgICAgICBzICs9IFNQQUNFICsgcmVnLm9mICsgU1BBQ0UgKyB0b3RhbFBhZ2VDb3VudDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzTnVtKGZpcnN0T2JqZWN0TnVtYmVyKSAmJiBpc051bShsYXN0T2JqZWN0TnVtYmVyKSkge1xuICAgICAgICBzICs9IHNlcCArIHJlZy5yZXN1bHRzICsgUy5mb3JtYXQoXCIgezB9IC0gezF9XCIsIGZpcnN0T2JqZWN0TnVtYmVyLCBsYXN0T2JqZWN0TnVtYmVyKTtcbiAgICAgICAgaWYgKGlzTnVtKHRvdGFsSXRlbXNDb3VudCkpIHtcbiAgICAgICAgICBzICs9IFMuZm9ybWF0KFwiIFwiICsgcmVnLm9mICsgXCIgezB9XCIsIHRvdGFsSXRlbXNDb3VudCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGRhdGFBbmNob3JUaW1lKSB7XG4gICAgICBzICs9IHNlcCArIGAke3JlZy5hbmNob3JUaW1lfSAke2RhdGFBbmNob3JUaW1lfWA7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhbml0aXplcyBhIHN0cmluZyBmb3IgZGlzcGxheSBpbiBhIHBsYWluIHRleHQgdGFibGUuXG4gICAqL1xuICBjaGVja1ZhbHVlKHMpIHtcbiAgICBpZiAoIXMpIHJldHVybiBcIlwiO1xuICAgIGlmICh0eXBlb2YgcyAhPSBcInN0cmluZ1wiKSBzID0gcy50b1N0cmluZygpO1xuICAgIHJldHVybiBzID8gcy5yZXBsYWNlKC9cXHIvZywgXCLikI1cIikucmVwbGFjZSgvXFxuL2csIFwi4pCKXCIpIDogXCJcIjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcGxhaW4gdGV4dCB0YWJ1bGFyIHJlcHJlc2VudGF0aW9uIG9mIGRhdGEsIGdpdmVuIGEgc2V0IG9mIGhlYWRlcnMgYW5kIHJvd3Mgb2YgdmFsdWVzLlxuICAgKiBOQjogdGhpcyBmdW5jdGlvbiBpcyBub3QgcmVzcG9uc2libGUgb2YgZm9ybWF0dGluZyB2YWx1ZXMhIGUuZy4gY3JlYXRlIHN0cmluZyByZXByZXNlbnRhdGlvbnMgb2YgbnVtYmVycyBvciBkYXRlc1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiAvLyByZXR1cm5zICstLS0tLS0tKy0tLS0tLS0rLS0tLS0tLStcbiAgICAgICAgICAgICAgICB8ICBpZCAgIHwgbmFtZSAgfCB2YWx1ZSB8XG4gICAgICAgICAgICAgICAgKy0tLS0tLS0rLS0tLS0tLSstLS0tLS0tK1xuICAgICAgICAgICAgICAgIHwgMSAgICAgfCBBQUEgICB8IEExMSAgIHxcbiAgICAgICAgICAgICAgICArLS0tLS0tLSstLS0tLS0tKy0tLS0tLS0rXG4gICAgICAgICAgICAgICAgfCAyICAgICB8IEJCQiAgIHwgQjExICAgfFxuICAgICAgICAgICAgICAgICstLS0tLS0tKy0tLS0tLS0rLS0tLS0tLStcbiAgICAgICAgICAgICAgICB8IDMgICAgIHwgQ0NDICAgfCBDMTEgICB8XG4gICAgICAgICAgICAgICAgKy0tLS0tLS0rLS0tLS0tLSstLS0tLS0tK1xuICAgICAgICAgICAgICAgIHwgNCAgICAgfCBEREQgICB8IEQxMSAgIHxcbiAgICAgICAgICAgICAgICArLS0tLS0tLSstLS0tLS0tKy0tLS0tLS0rXG4gICAgICB2YXIgYSA9IG5ldyBLaW5nVGFibGVUZXh0QnVpbGRlcigpO1xuICAgICAgYS50YWJ1bGF0ZShbXCJpZFwiLCBcIm5hbWVcIiwgXCJ2YWx1ZVwiXSxcbiAgICAgIFtcbiAgICAgICAgWzEsIFwiQUFBXCIsIFwiQTExXCJdLFxuICAgICAgICBbMiwgXCJCQkJcIiwgXCJCMTFcIl0sXG4gICAgICAgIFszLCBcIkNDQ1wiLCBcIkMxMVwiXSxcbiAgICAgICAgWzQsIFwiREREXCIsIFwiRDExXCJdXG4gICAgICBdKTtcbiAgICovXG4gIHRhYnVsYXRlKFxuICAgIGhlYWRlcnMsXG4gICAgcm93cyxcbiAgICBvcHRpb25zKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkoaGVhZGVycykpXG4gICAgICBUeXBlRXhjZXB0aW9uKFwiaGVhZGVyc1wiLCBcImFycmF5XCIpXG4gICAgaWYgKCFyb3dzKVxuICAgICAgVHlwZUV4Y2VwdGlvbihcInJvd3NcIiwgXCJhcnJheVwiKVxuICAgIGlmIChfLmFueShyb3dzLCB4ID0+IHsgcmV0dXJuICFfLmlzQXJyYXkoeCk7IH0pKVxuICAgICAgVHlwZUV4Y2VwdGlvbihcInJvd3MgY2hpbGRcIiwgXCJhcnJheVwiKVxuICAgIHZhciBvID0gXy5leHRlbmQoe30sIEtpbmdUYWJsZVRleHRCdWlsZGVyLm9wdGlvbnMsIG9wdGlvbnMgfHwge30pO1xuICAgIHZhciBoZWFkZXJzQWxpZ25tZW50ID0gby5oZWFkZXJzQWxpZ25tZW50LFxuICAgICAgICByb3dzQWxpZ25tZW50ID0gby5yb3dzQWxpZ25tZW50LFxuICAgICAgICBwYWRkaW5nID0gby5wYWRkaW5nLFxuICAgICAgICBjb3JuZXJDaGFyID0gby5jb3JuZXJDaGFyLFxuICAgICAgICBoZWFkZXJMaW5lU2VwYXJhdG9yID0gby5oZWFkZXJMaW5lU2VwYXJhdG9yLFxuICAgICAgICBjZWxsVmVydGljYWxMaW5lID0gby5jZWxsVmVydGljYWxMaW5lLFxuICAgICAgICBjZWxsSG9yaXpvbnRhbExpbmUgPSBvLmNlbGxIb3Jpem9udGFsTGluZSxcbiAgICAgICAgbWluQ2VsbFdpZHRoID0gby5taW5DZWxsV2lkdGgsXG4gICAgICAgIGhlYWRlckNvcm5lckNoYXIgPSBvLmhlYWRlckNvcm5lckNoYXI7XG4gICAgaWYgKHBhZGRpbmcgPCAwKVxuICAgICAgT3V0T2ZSYW5nZUV4Y2VwdGlvbihcInBhZGRpbmdcIiwgMClcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy8gdmFsaWRhdGUgdGhlIGxlbmd0aCBvZiBoZWFkZXJzIGFuZCBvZiBlYWNoIHJvdzogaXQgbXVzdCBiZSB0aGUgc2FtZVxuICAgIHZhciBoZWFkZXJzTGVuZ3RoID0gaGVhZGVycy5sZW5ndGg7XG4gICAgaWYgKCFoZWFkZXJzTGVuZ3RoKVxuICAgICAgQXJndW1lbnRFeGNlcHRpb24oXCJoZWFkZXJzIG11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgaXRlbVwiKVxuICAgIGlmIChfLmFueShyb3dzLCB4ID0+IHsgeC5sZW5ndGggIT0gaGVhZGVyc0xlbmd0aDsgfSkpXG4gICAgICBBcmd1bWVudEV4Y2VwdGlvbihcImVhY2ggcm93IG11c3QgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgaXRlbXNcIilcblxuICAgIHZhciBzID0gXCJcIlxuXG4gICAgLy8gc2FuaXRpemUgYWxsIHZhbHVlc1xuICAgIF8ucmVhY2goaGVhZGVycywgeCA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5jaGVja1ZhbHVlKHgpO1xuICAgIH0pXG4gICAgXy5yZWFjaChyb3dzLCB4ID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmNoZWNrVmFsdWUoeCk7XG4gICAgfSlcblxuICAgIHZhciB2YWx1ZUxlZnRQYWRkaW5nID0gUy5vZkxlbmd0aChTUEFDRSwgcGFkZGluZylcbiAgICBwYWRkaW5nID0gcGFkZGluZyAqIDI7XG4gICAgLy8gZm9yIGVhY2ggY29sdW1uLCBnZXQgdGhlIGNlbGwgd2lkdGhcbiAgICB2YXIgY29scyA9IF8uY29scyhbaGVhZGVyc10uY29uY2F0KHJvd3MpKSxcbiAgICAgIGNvbHNMZW5ndGggPSBfLm1hcChjb2xzLCB4ID0+IHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KF8ubWF4KHgsIHkgPT4geyByZXR1cm4geS5sZW5ndGg7IH0pLCBtaW5DZWxsV2lkdGgpICsgcGFkZGluZztcbiAgICAgIH0pO1xuICAgIC8vIGRvZXMgdGhlIHRhYmxlIGNvbnRhaW5zIGEgY2FwdGlvbj9cbiAgICB2YXIgdG90YWxSb3dMZW5ndGg7XG4gICAgdmFyIGNhcHRpb24gPSBvLmNhcHRpb24sIGNoZWNrTGVuZ3RoID0gMDtcbiAgICBpZiAoY2FwdGlvbikge1xuICAgICAgY2hlY2tMZW5ndGggPSBwYWRkaW5nICsgY2FwdGlvbi5sZW5ndGggKyAyO1xuICAgIH1cblxuICAgIC8vIGRvZXMgb3B0aW9uIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwYWdpbmF0aW9uP1xuICAgIHZhciBwYWdpbmF0aW9uSW5mbyA9IHNlbGYucGFnaW5hdGlvbkluZm8obyk7XG4gICAgaWYgKHBhZ2luYXRpb25JbmZvKSB7XG4gICAgICAvLyBpcyB0aGUgcGFnaW5hdGlvbiBpbmZvIGJpZ2dlciB0aGFuIHdob2xlIHJvdyBsZW5ndGg/XG4gICAgICB2YXIgcGFnZUluZm9MZW5ndGggPSBwYWRkaW5nICsgcGFnaW5hdGlvbkluZm8ubGVuZ3RoICsgMjtcbiAgICAgIGNoZWNrTGVuZ3RoID0gTWF0aC5tYXgoY2hlY2tMZW5ndGgsIHBhZ2VJbmZvTGVuZ3RoKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiB0aGUgbGFzdCBjb2x1bW4gbGVuZ3RoIHNob3VsZCBiZSBhZGFwdGVkIHRvIHRoZSBoZWFkZXIgbGVuZ3RoXG4gICAgaWYgKGNoZWNrTGVuZ3RoID4gMCkge1xuICAgICAgdG90YWxSb3dMZW5ndGggPSBfLnN1bShjb2xzTGVuZ3RoKSArIChjb2xzTGVuZ3RoLmxlbmd0aCkgKyAxO1xuICAgICAgaWYgKGNoZWNrTGVuZ3RoID4gdG90YWxSb3dMZW5ndGgpIHtcbiAgICAgICAgdmFyIGZpeCA9IGNoZWNrTGVuZ3RoIC0gdG90YWxSb3dMZW5ndGg7XG4gICAgICAgIGNvbHNMZW5ndGhbY29sc0xlbmd0aC5sZW5ndGggLSAxXSArPSBmaXg7XG4gICAgICAgIHRvdGFsUm93TGVuZ3RoID0gY2hlY2tMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNhcHRpb24pIHtcbiAgICAgIHMgKz0gY2VsbFZlcnRpY2FsTGluZSArIHZhbHVlTGVmdFBhZGRpbmcgKyBjYXB0aW9uICsgUy5vZkxlbmd0aChTUEFDRSwgdG90YWxSb3dMZW5ndGggLSBjYXB0aW9uLmxlbmd0aCAtIDMpICsgY2VsbFZlcnRpY2FsTGluZSArIFJOO1xuICAgIH1cbiAgICBpZiAocGFnaW5hdGlvbkluZm8pIHtcbiAgICAgIHMgKz0gY2VsbFZlcnRpY2FsTGluZSArIHZhbHVlTGVmdFBhZGRpbmcgKyBwYWdpbmF0aW9uSW5mbyArIFMub2ZMZW5ndGgoU1BBQ0UsIHRvdGFsUm93TGVuZ3RoIC0gcGFnaW5hdGlvbkluZm8ubGVuZ3RoIC0gMykgKyBjZWxsVmVydGljYWxMaW5lICsgUk47XG4gICAgfVxuXG4gICAgdmFyIGhlYWRDZWxsc1NlcHMgPSBfLm1hcChjb2xzTGVuZ3RoLCBsID0+IHtcbiAgICAgICAgcmV0dXJuIFMub2ZMZW5ndGgoaGVhZGVyTGluZVNlcGFyYXRvciwgbCk7XG4gICAgICB9KSxcbiAgICAgIGNlbGxzU2VwcyA9IF8ubWFwKGNvbHNMZW5ndGgsIGwgPT4ge1xuICAgICAgICByZXR1cm4gUy5vZkxlbmd0aChjZWxsSG9yaXpvbnRhbExpbmUsIGwpO1xuICAgICAgfSk7XG5cbiAgICB2YXIgaGVhZGVyTGluZVNlcCA9IFwiXCI7XG4gICAgLy8gYWRkIHRoZSBmaXJzdCBsaW5lXG4gICAgXy5lYWNoKGhlYWRlcnMsICh4LCBpKSA9PiB7XG4gICAgICBoZWFkZXJMaW5lU2VwICs9IGhlYWRlckNvcm5lckNoYXIgKyBoZWFkQ2VsbHNTZXBzW2ldO1xuICAgIH0pO1xuICAgIC8vIGFkZCBsYXN0IHZlcnRpY2FsIHNlcGFyYXRvclxuICAgIGhlYWRlckxpbmVTZXAgKz0gaGVhZGVyQ29ybmVyQ2hhciArIFJOO1xuXG4gICAgaWYgKHBhZ2luYXRpb25JbmZvIHx8IGNhcHRpb24pIHtcbiAgICAgIHMgPSBoZWFkZXJMaW5lU2VwICsgcztcbiAgICB9XG4gICAgcyArPSBoZWFkZXJMaW5lU2VwO1xuXG4gICAgLy8gYWRkIGhlYWRlcnNcbiAgICBfLmVhY2goaGVhZGVycywgKHgsIGkpID0+IHtcbiAgICAgIHMgKz0gY2VsbFZlcnRpY2FsTGluZSArIHNlbGYuYWxpZ24odmFsdWVMZWZ0UGFkZGluZyArIHgsIGNvbHNMZW5ndGhbaV0sIGhlYWRlcnNBbGlnbm1lbnQpO1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIGxhc3QgdmVydGljYWwgc2luZ2xlTGluZVNlcGFyYXRvclxuICAgIHMgKz0gY2VsbFZlcnRpY2FsTGluZSArIFJOO1xuXG4gICAgLy8gYWRkIGhlYWRlciBzZXBhcmF0b3JcbiAgICBzICs9IGhlYWRlckxpbmVTZXA7XG5cbiAgICAvLyBidWlsZCBsaW5lIHNlcGFyYXRvclxuICAgIHZhciBsaW5lU2VwID0gXCJcIiwgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgaGVhZGVyc0xlbmd0aDsgaSsrKVxuICAgICAgbGluZVNlcCArPSBjb3JuZXJDaGFyICsgY2VsbHNTZXBzW2ldO1xuICAgIGxpbmVTZXAgKz0gY29ybmVyQ2hhcjtcblxuICAgIC8vIGJ1aWxkIHJvd3NcbiAgICB2YXIgcm93c0xlbmd0aCA9IHJvd3MubGVuZ3RoLCBqLCByb3csIHZhbHVlO1xuICAgIGZvciAoaSA9IDA7IGkgPCByb3dzTGVuZ3RoOyBpKyspIHtcbiAgICAgIHJvdyA9IHJvd3NbaV07XG4gICAgICBmb3IgKGogPSAwOyBqIDwgaGVhZGVyc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhbHVlID0gcm93W2pdO1xuICAgICAgICBzICs9IGNlbGxWZXJ0aWNhbExpbmUgKyBzZWxmLmFsaWduKHZhbHVlTGVmdFBhZGRpbmcgKyB2YWx1ZSwgY29sc0xlbmd0aFtqXSwgcm93c0FsaWdubWVudCk7XG4gICAgICB9XG4gICAgICBzICs9IGNlbGxWZXJ0aWNhbExpbmUgKyBSTjtcbiAgICAgIHMgKz0gbGluZVNlcCArIFJOO1xuICAgIH1cbiAgICByZXR1cm4gcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBsaWVzIGFuIGFsaWdubWVudCB0byB0aGUgZ2l2ZW4gdGV4dCwgdXNpbmcgdGhlIGdpdmVuIGxlbmd0aCBhbmQgZmlsbGVyLCBieSBhbGlnbm1lbnQgY29kZS5cbiAgICovXG4gIGFsaWduKHRleHQsIGxlbmd0aCwgYWxpZ25tZW50LCBmaWxsZXIpIHtcbiAgICBpZiAoIWZpbGxlcikgZmlsbGVyID0gU1BBQ0U7XG4gICAgaWYgKCFhbGlnbm1lbnQpXG4gICAgICBBcmd1bWVudE51bGxFeGNlcHRpb24oXCJhbGlnbm1lbnRcIik7XG4gICAgc3dpdGNoIChhbGlnbm1lbnQpIHtcbiAgICAgIGNhc2UgXCJjXCI6XG4gICAgICBjYXNlIFwiY2VudGVyXCI6XG4gICAgICAgIHJldHVybiBTLmNlbnRlcih0ZXh0LCBsZW5ndGgsIGZpbGxlcik7XG4gICAgICBjYXNlIFwibFwiOlxuICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgcmV0dXJuIFMubGp1c3QodGV4dCwgbGVuZ3RoLCBmaWxsZXIpO1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiclwiOlxuICAgICAgY2FzZSBcInJpZ2h0XCI6XG4gICAgICAgIHJldHVybiBTLnJqdXN0KHRleHQsIGxlbmd0aCwgZmlsbGVyKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIEFyZ3VtZW50RXhjZXB0aW9uKFwiYWxpZ25tZW50OiBcIiArIGFsaWdubWVudCk7XG4gICAgfVxuICB9XG59XG4iLCIvKipcbiAqIEdlbmVyaWMgdXRpbGl0aWVzIHRvIHdvcmsgd2l0aCBvYmplY3RzIGFuZCBmdW5jdGlvbnMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5jb25zdCBPQkpFQ1QgPSBcIm9iamVjdFwiLFxuICBTVFJJTkcgPSBcInN0cmluZ1wiLFxuICBOVU1CRVIgPSBcIm51bWJlclwiLFxuICBGVU5DVElPTiA9IFwiZnVuY3Rpb25cIixcbiAgTEVOID0gXCJsZW5ndGhcIixcbiAgUkVQID0gXCJyZXBsYWNlXCI7XG5pbXBvcnQge1xuICBBcmd1bWVudEV4Y2VwdGlvbixcbiAgQXJndW1lbnROdWxsRXhjZXB0aW9uXG59IGZyb20gXCIuLi9zY3JpcHRzL2V4Y2VwdGlvbnNcIlxuZnVuY3Rpb24gbWFwKGEsIGZuKSB7XG4gIGlmICghYSB8fCAhYVtMRU5dKSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICAgIHZhciB4LCBiID0gW107XG4gICAgICBmb3IgKHggaW4gYSkge1xuICAgICAgICBiLnB1c2goZm4oeCwgYVt4XSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGI7XG4gICAgfVxuICB9O1xuICB2YXIgYiA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGFbTEVOXTsgaSA8IGw7IGkrKylcbiAgICBiLnB1c2goZm4oYVtpXSkpO1xuICByZXR1cm4gYjtcbn1cbmZ1bmN0aW9uIGVhY2goYSwgZm4pIHtcbiAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICBmb3IgKHZhciB4IGluIGEpXG4gICAgICBmbihhW3hdLCB4KTtcbiAgICByZXR1cm4gYTtcbiAgfVxuICBpZiAoIWEgfHwgIWFbTEVOXSkgcmV0dXJuIGE7XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKVxuICAgIGZuKGFbaV0sIGkpO1xufVxuZnVuY3Rpb24gZXhlYyhmbiwgaikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGo7IGkrKylcbiAgICBmbihpKTtcbn1cbmZ1bmN0aW9uIGlzU3RyaW5nKHMpIHtcbiAgcmV0dXJuIHR5cGVvZiBzID09IFNUUklORztcbn1cbmZ1bmN0aW9uIGlzTnVtYmVyKG8pIHtcbiAgLy8gaW4gSmF2YVNjcmlwdCBOYU4gKE5vdCBhIE51bWJlcikgaWYgb2YgdHlwZSBcIm51bWJlclwiIChjdXJpb3VzLi4pXG4gIC8vIEhvd2V2ZXIsIHdoZW4gY2hlY2tpbmcgaWYgc29tZXRoaW5nIGlzIGEgbnVtYmVyIGl0J3MgZGVzaXJhYmxlIHRvIHJldHVyblxuICAvLyBmYWxzZSBpZiBpdCBpcyBOYU4hXG4gIGlmIChpc05hTihvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHlwZW9mIG8gPT0gTlVNQkVSO1xufVxuZnVuY3Rpb24gaXNGdW5jdGlvbihvKSB7XG4gIHJldHVybiB0eXBlb2YgbyA9PSBGVU5DVElPTjtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KG8pIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09IE9CSkVDVDtcbn1cbmZ1bmN0aW9uIGlzQXJyYXkobykge1xuICByZXR1cm4gbyBpbnN0YW5jZW9mIEFycmF5O1xufVxuZnVuY3Rpb24gaXNEYXRlKG8pIHtcbiAgcmV0dXJuIG8gaW5zdGFuY2VvZiBEYXRlO1xufVxuZnVuY3Rpb24gaXNSZWdFeHAobykge1xuICByZXR1cm4gbyBpbnN0YW5jZW9mIFJlZ0V4cDtcbn1cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT0gT0JKRUNUICYmIG8gIT09IG51bGwgJiYgby5jb25zdHJ1Y3RvciA9PSBPYmplY3Q7XG59XG5mdW5jdGlvbiBpc0VtcHR5KG8pIHtcbiAgaWYgKCFvKSByZXR1cm4gdHJ1ZTtcbiAgaWYgKGlzQXJyYXkobykpIHtcbiAgICByZXR1cm4gby5sZW5ndGggPT0gMDtcbiAgfVxuICBpZiAoaXNQbGFpbk9iamVjdChvKSkge1xuICAgIHZhciB4O1xuICAgIGZvciAoeCBpbiBvKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChpc1N0cmluZyhvKSkge1xuICAgIHJldHVybiBvID09PSBcIlwiO1xuICB9XG4gIGlmIChpc051bWJlcihvKSkge1xuICAgIHJldHVybiBvID09PSAwO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgYXJndW1lbnRcIik7XG59XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvLCBuKSB7XG4gIHJldHVybiBvICYmIG8uaGFzT3duUHJvcGVydHkobik7XG59XG5mdW5jdGlvbiB1cHBlcihzKSB7XG4gIHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBsb3dlcihzKSB7XG4gIHJldHVybiBzLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBmaXJzdChhLCBmbikge1xuICBpZiAoIWZuKSB7XG4gICAgcmV0dXJuIGEgPyBhWzBdIDogdW5kZWZpbmVkO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGZuKGFbaV0pKSByZXR1cm4gYVtpXTtcbiAgfVxufVxuZnVuY3Rpb24gdG9BcnJheShhKSB7XG4gIGlmIChpc0FycmF5KGEpKSByZXR1cm4gYTtcbiAgaWYgKHR5cGVvZiBhID09IE9CSkVDVCAmJiBhW0xFTl0pXG4gICAgcmV0dXJuIG1hcChhLCBmdW5jdGlvbiAobykgeyByZXR1cm4gbzsgfSk7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xufVxuZnVuY3Rpb24gZmxhdHRlbihhKSB7XG4gIGlmIChpc0FycmF5KGEpKVxuICAgIHJldHVybiBbXS5jb25jYXQuYXBwbHkoW10sIG1hcChhLCBmbGF0dGVuKSk7XG4gIHJldHVybiBhO1xufVxudmFyIF9pZCA9IC0xO1xuZnVuY3Rpb24gdW5pcXVlSWQobmFtZSkge1xuICBfaWQrKztcbiAgcmV0dXJuIChuYW1lIHx8IFwiaWRcIikgKyBfaWQ7XG59XG5mdW5jdGlvbiByZXNldFNlZWQoKSB7XG4gIF9pZCA9IC0xO1xufVxuZnVuY3Rpb24ga2V5cyhvKSB7XG4gIGlmICghbykgcmV0dXJuIFtdO1xuICB2YXIgeCwgYSA9IFtdO1xuICBmb3IgKHggaW4gbykge1xuICAgIGEucHVzaCh4KTtcbiAgfVxuICByZXR1cm4gYTtcbn1cbmZ1bmN0aW9uIHZhbHVlcyhvKSB7XG4gIGlmICghbykgcmV0dXJuIFtdO1xuICB2YXIgeCwgYSA9IFtdO1xuICBmb3IgKHggaW4gbykge1xuICAgIGEucHVzaChvW3hdKTtcbiAgfVxuICByZXR1cm4gYTtcbn1cbmZ1bmN0aW9uIG1pbnVzKG8sIHByb3BzKSB7XG4gIGlmICghbykgcmV0dXJuIG87XG4gIGlmICghcHJvcHMpIHByb3BzID0gW107XG4gIHZhciBhID0ge30sIHg7XG4gIGZvciAoeCBpbiBvKSB7XG4gICAgaWYgKHByb3BzLmluZGV4T2YoeCkgPT0gLTEpIHtcbiAgICAgIGFbeF0gPSBvW3hdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYTtcbn1cbmZ1bmN0aW9uIGlzVW5kKHgpIHtcbiAgcmV0dXJuIHR5cGVvZiB4ID09PSBcInVuZGVmaW5lZFwiO1xufVxuLyoqXG4gKiBEZWVwIGNsb25lcyBhbiBpdGVtIChleGNlcHQgZnVuY3Rpb24gdHlwZXMpLlxuICovXG5mdW5jdGlvbiBjbG9uZShvKSB7XG4gIHZhciB4LCBhO1xuICBpZiAobyA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gIGlmIChvID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQ7XG4gIGlmIChpc09iamVjdChvKSkge1xuICAgIGlmIChpc0FycmF5KG8pKSB7XG4gICAgICBhID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG8ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGFbaV0gPSBjbG9uZShvW2ldKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYSA9IHt9O1xuICAgICAgdmFyIHY7XG4gICAgICBmb3IgKHggaW4gbykge1xuICAgICAgICB2ID0gb1t4XTtcbiAgICAgICAgaWYgKHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYVt4XSA9IHY7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzT2JqZWN0KHYpKSB7XG4gICAgICAgICAgaWYgKGlzRGF0ZSh2KSkge1xuICAgICAgICAgICAgYVt4XSA9IG5ldyBEYXRlKHYuZ2V0VGltZSgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGlzUmVnRXhwKHYpKSB7XG4gICAgICAgICAgICBhW3hdID0gbmV3IFJlZ0V4cCh2LnNvdXJjZSwgdi5mbGFncyk7XG4gICAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KHYpKSB7XG4gICAgICAgICAgICBhW3hdID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgIGFbeF1baV0gPSBjbG9uZSh2W2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYVt4XSA9IGNsb25lKHYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhW3hdID0gdjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBhID0gbztcbiAgfVxuICByZXR1cm4gYTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBleHRlbmQoKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgaWYgKCFhcmdzW0xFTl0pIHJldHVybjtcbiAgICBpZiAoYXJnc1tMRU5dID09IDEpIHJldHVybiBhcmdzWzBdO1xuICAgIHZhciBhID0gYXJnc1swXSwgYiwgeDtcbiAgICBmb3IgKHZhciBpID0gMSwgbCA9IGFyZ3NbTEVOXTsgaSA8IGw7IGkrKykge1xuICAgICAgYiA9IGFyZ3NbaV07XG4gICAgICBpZiAoIWIpIGNvbnRpbnVlO1xuICAgICAgZm9yICh4IGluIGIpIHtcbiAgICAgICAgYVt4XSA9IGJbeF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIHN0cmluZ0FyZ3MoYSkge1xuICAgIGlmICghYSB8fCBpc1VuZChhLmxlbmd0aCkpIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIGFycmF5IGFyZ3VtZW50XCIpO1xuICAgIGlmICghYS5sZW5ndGgpIHJldHVybiBbXTtcbiAgICB2YXIgbCA9IGEubGVuZ3RoO1xuICAgIGlmIChsID09PSAxKSB7XG4gICAgICB2YXIgZmlyc3QgPSBhWzBdO1xuICAgICAgaWYgKGlzU3RyaW5nKGZpcnN0KSAmJiBmaXJzdC5pbmRleE9mKFwiIFwiKSA+IC0xKSB7XG4gICAgICAgIHJldHVybiBmaXJzdC5zcGxpdCgvXFxzKy9nKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGE7XG4gIH0sXG5cbiAgdW5pcXVlSWQsXG5cbiAgcmVzZXRTZWVkLFxuXG4gIGZsYXR0ZW4sXG5cbiAgZWFjaCxcblxuICBleGVjLFxuXG4gIGtleXMsXG5cbiAgdmFsdWVzLFxuXG4gIG1pbnVzLFxuXG4gIG1hcCxcblxuICBmaXJzdCxcblxuICB0b0FycmF5LFxuXG4gIGlzQXJyYXksXG5cbiAgaXNEYXRlLFxuXG4gIGlzU3RyaW5nLFxuXG4gIGlzTnVtYmVyLFxuXG4gIGlzT2JqZWN0LFxuXG4gIGlzUGxhaW5PYmplY3QsXG5cbiAgaXNFbXB0eSxcblxuICBpc0Z1bmN0aW9uLFxuXG4gIGhhczogaGFzT3duUHJvcGVydHksXG5cbiAgaXNOdWxsT3JFbXB0eVN0cmluZyh2KSB7XG4gICAgcmV0dXJuIHYgPT09IG51bGwgfHwgdiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IFwiXCI7XG4gIH0sXG5cbiAgbG93ZXIsXG5cbiAgdXBwZXIsXG5cbiAgY2xvbmUsXG5cbiAgLyoqXG4gICAqIER1Y2sgdHlwaW5nOiBjaGVja3MgaWYgYW4gb2JqZWN0IFwiUXVhY2tzIGxpa2UgYSBQcm9taXNlXCJcbiAgICpcbiAgICogQHBhcmFtIHtQcm9taXNlfSBvO1xuICAgKi9cbiAgcXVhY2tzTGlrZVByb21pc2Uobykge1xuICAgIGlmIChvICYmIHR5cGVvZiBvLnRoZW4gPT0gRlVOQ1RJT04pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB2YWx1ZXMgaW5zaWRlIGFuIGFycmF5LCBldmVudHVhbGx5IGJ5IHByZWRpY2F0ZS5cbiAgICovXG4gIHN1bShhLCBmbikge1xuICAgIGlmICghYSkgcmV0dXJuO1xuICAgIHZhciBiLCBsID0gYVtMRU5dO1xuICAgIGlmICghbCkgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xuICAgICAgaWYgKGlzVW5kKGIpKSB7XG4gICAgICAgIGIgPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYiArPSB2O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cbiAgICovXG4gIG1heChhLCBmbikge1xuICAgIHZhciBvID0gLUluZmluaXR5O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xuICAgICAgaWYgKHYgPiBvKVxuICAgICAgICBvID0gdjtcbiAgICB9XG4gICAgcmV0dXJuIG87XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG1pbmltdW0gdmFsdWUgaW5zaWRlIGFuIGFycmF5LCBieSBwcmVkaWNhdGUuXG4gICAqL1xuICBtaW4oYSwgZm4pIHtcbiAgICB2YXIgbyA9IEluZmluaXR5O1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2YXIgdiA9IGZuID8gZm4oYVtpXSkgOiBhW2ldO1xuICAgICAgaWYgKHYgPCBvKVxuICAgICAgICBvID0gdjtcbiAgICB9XG4gICAgcmV0dXJuIG87XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGl0ZW0gd2l0aCB0aGUgbWF4aW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cbiAgICovXG4gIHdpdGhNYXgoYSwgZm4pIHtcbiAgICB2YXIgbztcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFbTEVOXTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFvKSB7XG4gICAgICAgIG8gPSBhW2ldO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciB2ID0gZm4oYVtpXSk7XG4gICAgICBpZiAodiA+IGZuKG8pKVxuICAgICAgICBvID0gYVtpXTtcbiAgICB9XG4gICAgcmV0dXJuIG87XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGl0ZW0gd2l0aCB0aGUgbWluaW11bSB2YWx1ZSBpbnNpZGUgYW4gYXJyYXksIGJ5IHByZWRpY2F0ZS5cbiAgICovXG4gIHdpdGhNaW4oYSwgZm4pIHtcbiAgICB2YXIgbztcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFbTEVOXTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFvKSB7XG4gICAgICAgIG8gPSBhW2ldO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciB2ID0gZm4oYVtpXSk7XG4gICAgICBpZiAodiA8IGZuKG8pKVxuICAgICAgICBvID0gYVtpXTtcbiAgICB9XG4gICAgcmV0dXJuIG87XG4gIH0sXG5cbiAgaW5kZXhPZihhLCBvKSB7XG4gICAgcmV0dXJuIGEuaW5kZXhPZihvKTtcbiAgfSxcblxuICBjb250YWlucyhhLCBvKSB7XG4gICAgcmV0dXJuIGEuaW5kZXhPZihvKSA+IC0xO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGFueSBvYmplY3QgaW5zaWRlIGFuIGFycmF5LCBvciBhbnlcbiAgICoga2V5LXZhbHVlIHBhaXIgaW5zaWRlIGFuIG9iamVjdCwgcmVzcGVjdCBhIGdpdmVuIHByZWRpY2F0ZS5cbiAgICpcbiAgICogQHBhcmFtIGE6IGlucHV0IGFycmF5IG9yIG9iamVjdFxuICAgKiBAcGFyYW0gZm46IHByZWRpY2F0ZSB0byB0ZXN0IGl0ZW1zIG9yIGtleS12YWx1ZSBwYWlyc1xuICAgKi9cbiAgYW55KGEsIGZuKSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICAgIHZhciB4O1xuICAgICAgZm9yICh4IGluIGEpIHtcbiAgICAgICAgaWYgKGZuKHgsIGFbeF0pKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFbTEVOXTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKGZuKGFbaV0pKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIGFsbCBvYmplY3QgaW5zaWRlIGFuIGFycmF5LCBvciBhbnlcbiAgICoga2V5LXZhbHVlIHBhaXIgaW5zaWRlIGFuIG9iamVjdCwgcmVzcGVjdCBhIGdpdmVuIHByZWRpY2F0ZS5cbiAgICpcbiAgICogQHBhcmFtIGE6IGlucHV0IGFycmF5IG9yIG9iamVjdFxuICAgKiBAcGFyYW0gZm46IHByZWRpY2F0ZSB0byB0ZXN0IGl0ZW1zIG9yIGtleS12YWx1ZSBwYWlyc1xuICAgKi9cbiAgYWxsKGEsIGZuKSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICAgIHZhciB4O1xuICAgICAgZm9yICh4IGluIGEpIHtcbiAgICAgICAgaWYgKCFmbih4LCBhW3hdKSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhW0xFTl07IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZm4oYVtpXSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBmaXJzdCBpdGVtIG9yIHByb3BlcnR5IHRoYXQgcmVzcGVjdHMgYSBnaXZlbiBwcmVkaWNhdGUuXG4gICAqL1xuICBmaW5kKGEsIGZuKSB7XG4gICAgaWYgKCFhKSByZXR1cm4gbnVsbDtcbiAgICBpZiAoaXNBcnJheShhKSkge1xuICAgICAgaWYgKCFhIHx8ICFhW0xFTl0pIHJldHVybjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChmbihhW2ldKSlcbiAgICAgICAgICByZXR1cm4gYVtpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYSkpIHtcbiAgICAgIHZhciB4O1xuICAgICAgZm9yICh4IGluIGEpIHtcbiAgICAgICAgaWYgKGZuKGFbeF0sIHgpKVxuICAgICAgICAgIHJldHVybiBhW3hdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgd2hlcmUoYSwgZm4pIHtcbiAgICBpZiAoIWEgfHwgIWFbTEVOXSkgcmV0dXJuIFtdO1xuICAgIHZhciBiID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhW0xFTl07IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChmbihhW2ldKSlcbiAgICAgICAgYi5wdXNoKGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfSxcblxuICByZW1vdmVJdGVtKGEsIG8pIHtcbiAgICB2YXIgeCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYVtMRU5dOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoYVtpXSA9PT0gbykge1xuICAgICAgICB4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGEuc3BsaWNlKHgsIDEpO1xuICB9LFxuXG4gIHJlamVjdChhLCBmbikge1xuICAgIGlmICghYSB8fCAhYVtMRU5dKSByZXR1cm4gW107XG4gICAgdmFyIGIgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFbTEVOXTsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKCFmbihhW2ldKSlcbiAgICAgICAgYi5wdXNoKGFbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfSxcblxuICBwaWNrKG8sIGFyciwgZXhjbHVkZSkge1xuICAgIHZhciBhID0ge307XG4gICAgaWYgKGV4Y2x1ZGUpIHtcbiAgICAgIGZvciAodmFyIHggaW4gbykge1xuICAgICAgICBpZiAoYXJyLmluZGV4T2YoeCkgPT0gLTEpXG4gICAgICAgICAgYVt4XSA9IG9beF07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyW0xFTl07IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdmFyIHAgPSBhcnJbaV07XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eShvLCBwKSlcbiAgICAgICAgICBhW3BdID0gb1twXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGE7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlcXVpcmVzIGFuIG9iamVjdCB0byBiZSBkZWZpbmVkIGFuZCB0byBoYXZlIHRoZSBnaXZlbiBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gbzogb2JqZWN0IHRvIHZhbGlkYXRlXG4gICAqIEBwYXJhbSB7U3RyaW5nW119IHByb3BzOiBsaXN0IG9mIHByb3BlcnRpZXMgdG8gcmVxdWlyZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9b3B0aW9uc106XG4gICAqL1xuICByZXF1aXJlKG8sIHByb3BzLCBuYW1lKSB7XG4gICAgaWYgKCFuYW1lKSBuYW1lID0gXCJvcHRpb25zXCI7XG4gICAgdmFyIGVycm9yID0gXCJcIjtcbiAgICBpZiAobykge1xuICAgICAgdGhpcy5lYWNoKHByb3BzLCB4ID0+IHtcbiAgICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvLCB4KSkge1xuICAgICAgICAgIGVycm9yICs9IFwibWlzc2luZyAnXCIgKyB4ICsgXCInIGluIFwiICsgbmFtZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yID0gXCJtaXNzaW5nIFwiICsgbmFtZTtcbiAgICB9XG4gICAgaWYgKGVycm9yKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yKTtcbiAgfSxcblxuICB3cmFwKGZuLCBjYWxsYmFjaywgY29udGV4dCkge1xuICAgIHZhciB3cmFwcGVyID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIFtmbl0uY29uY2F0KHRvQXJyYXkoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gICAgd3JhcHBlci5iaW5kKGNvbnRleHQgfHwgdGhpcyk7XG4gICAgcmV0dXJuIHdyYXBwZXI7XG4gIH0sXG5cbiAgdW53cmFwKG8pIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbihvKSA/IHVud3JhcChvKCkpIDogbztcbiAgfSxcblxuICBkZWZlcihmbikge1xuICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgYXQgbW9zdCBuIHRpbWVzLlxuICAgKi9cbiAgYXRNb3N0KG4sIGZuLCBjb250ZXh0KSB7XG4gICAgdmFyIG0gPSBuLCByZXN1bHQ7XG4gICAgZnVuY3Rpb24gYSgpIHtcbiAgICAgIGlmIChuID4gMCkge1xuICAgICAgICBuLS07XG4gICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KGNvbnRleHQgfHwgdGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIGlzVW5kLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGludm9rZWQgYXQgbW9zdCBvbmNlLlxuICAgKi9cbiAgb25jZShmbiwgY29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLmF0TW9zdCgxLCBmbiwgY29udGV4dCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBpcyBleGVjdXRlZCBhbHdheXMgcGFzc2luZyB0aGUgZ2l2ZW4gYXJndW1lbnRzIHRvIGl0LlxuICAgKiBQeXRob24tZmFzaGlvbi5cbiAgKi9cbiAgcGFydGlhbChmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xuICAgIGFyZ3Muc2hpZnQoKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gcGFydGlhbCgpIHtcbiAgICAgIHZhciBiYXJncyA9IHNlbGYudG9BcnJheShhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHt9LCBhcmdzLmNvbmNhdChiYXJncykpO1xuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFF1YXNpIFB5dGhvbmljIG9iamVjdCBjb21wYXJlclxuICAgKi9cbiAgZXF1YWwoYSwgYikge1xuICAgIHZhciBOT05FID0gbnVsbCwgdW5kLCB0ID0gdHJ1ZSwgZiA9IGZhbHNlLCBzID0gXCJcIjtcbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIHQ7XG4gICAgaWYgKGEgPT09IHVuZCB8fCBiID09PSB1bmQgfHwgYSA9PT0gTk9ORSB8fCBiID09PSBOT05FIHx8IGEgPT09IHQgfHwgYiA9PT0gdCB8fCBhID09PSBmIHx8IGIgPT09IGYgfHwgYSA9PT0gcyB8fCBiID09PSBzKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChpc0FycmF5KGEpKSB7XG4gICAgICBpZiAoaXNBcnJheShiKSAmJiBhW0xFTl0gPT0gYltMRU5dKSB7XG4gICAgICAgIC8vIGxpa2UgaW4gUHl0aG9uOiByZXR1cm4gdHJ1ZSBpZiBhbGwgb2JqZWN0c1xuICAgICAgICAvLyBpbnNpZGUgYXJlIGVxdWFsLCBpbiB0aGUgc2FtZSBvcmRlclxuICAgICAgICB2YXIgaSwgbCA9IGFbTEVOXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICghdGhpcy5lcXVhbChhW2ldLCBiW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc051bWJlcihhKSB8fCBpc1N0cmluZyhhKSlcbiAgICAgIHJldHVybiBhID09IGI7XG4gICAgaWYgKGEgPT09IE5PTkUgJiYgYiA9PT0gTk9ORSlcbiAgICAgIHJldHVybiB0O1xuICAgIGlmIChhID09PSB1bmQgJiYgYiA9PT0gdW5kKVxuICAgICAgcmV0dXJuIHQ7XG4gICAgdmFyIHgsIHEgPSAwLCB3ID0gMDtcbiAgICBmb3IgKHggaW4gYSkge1xuICAgICAgaWYgKGFbeF0gIT09IHVuZClcbiAgICAgICAgcSArPSAxO1xuICAgICAgaWYgKCF0aGlzLmVxdWFsKGFbeF0sIGJbeF0pKVxuICAgICAgICByZXR1cm4gZjtcbiAgICB9XG4gICAgZm9yICh4IGluIGIpIHtcbiAgICAgIGlmIChiW3hdICE9PSB1bmQpXG4gICAgICAgIHcgKz0gMTtcbiAgICB9XG4gICAgdmFyIGRpZmYgPSBxID09IHc7XG4gICAgcmV0dXJuIGRpZmY7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbGlzdCBvZiBhcnJheXMsIHJldHVybnMgYSBuZXcgbGlzdCBvZiBjb2x1bW5zIG9idGFpbmVkIGZyb20gdGhlbS5cbiAgICovXG4gIGNvbHMoYSkge1xuICAgIGlmICghYSB8fCAhYS5sZW5ndGgpIHJldHVybiBbXTtcbiAgICB2YXIgbWF4TGVuZ3RoID0gdGhpcy5tYXgoYSwgeCA9PiB7IHJldHVybiB4Lmxlbmd0aDsgfSk7XG4gICAgdmFyIGIgPSBbXSwgaSwgaiwgbCA9IGEubGVuZ3RoO1xuICAgIGZvciAoaiA9IDA7IGogPCBtYXhMZW5ndGg7IGorKykge1xuICAgICAgdmFyIGNvbCA9IFtdO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICBjb2wucHVzaChhW2ldW2pdKTtcbiAgICAgIH1cbiAgICAgIGIucHVzaChjb2wpO1xuICAgIH1cbiAgICByZXR1cm4gYjtcbiAgfSxcblxuICAvKipcbiAgICogU29ydHMgYW4gYXJyYXkgb2YgbnVtYmVycyBpbiBhc2NlbmRpbmcgb3JkZXIuXG4gICAqL1xuICBzb3J0TnVtcyhhKSB7XG4gICAgcmV0dXJuIGEuc29ydCgoaSwgaikgPT4geyBpZiAoaSA+IGopIHJldHVybiAxOyBpZiAoaSA8IGopIHJldHVybiAtMTsgcmV0dXJuIDA7fSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgZnVuY3Rpb24gdGhhdCBjYW4gYmUgZmlyZWQgb25seSBvbmNlIGV2ZXJ5IG4gbWlsbGlzZWNvbmRzLlxuICAgKiBUaGUgZnVuY3Rpb24gaXMgZmlyZWQgYWZ0ZXIgdGhlIHRpbWVvdXQsIGFuZCBhcyBsYXRlIGFzIHBvc3NpYmxlLlxuICAgKlxuICAgKiBAcGFyYW0gZm46IGZ1bmN0aW9uXG4gICAqIEBwYXJhbSBtczogbWlsbGlzZWNvbmRzXG4gICAqIEBwYXJhbSB7YW55fSBjb250ZXh0OiBmdW5jdGlvbiBjb250ZXh0LlxuICAgKi9cbiAgZGVib3VuY2UoZm4sIG1zLCBjb250ZXh0KSB7XG4gICAgdmFyIGl0O1xuICAgIGZ1bmN0aW9uIGQoKSB7XG4gICAgICBpZiAoaXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KGl0KTtcbiAgICAgIH1cbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLmxlbmd0aCA/IHRvQXJyYXkoYXJndW1lbnRzKSA6IHVuZGVmaW5lZDtcbiAgICAgIGl0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGl0ID0gbnVsbDtcbiAgICAgICAgZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICB9LCBtcyk7XG4gICAgfVxuICAgIHJldHVybiBkO1xuICB9LFxuXG4gIC8qKlxuICAgKiBFZGl0cyB0aGUgaXRlbXMgb2YgYW4gYXJyYXkgYnkgdXNpbmcgYSBnaXZlbiBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHthcnJheX0gYTogYXJyYXkgb2YgaXRlbXMuXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuOiBlZGl0aW5nIGZ1bmN0aW9uLlxuICAgKi9cbiAgcmVhY2goYSwgZm4pIHtcbiAgICBpZiAoIWlzQXJyYXkoYSkpIHRocm93IG5ldyBFcnJvcihcImV4cGVjdGVkIGFycmF5XCIpO1xuICAgIHZhciBpdGVtO1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGl0ZW0gPSBhW2ldO1xuICAgICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgdGhpcy5yZWFjaChpdGVtLCBmbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhW2ldID0gZm4oaXRlbSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBnaXZlbiBvYmplY3QgaW1wbGVtZW50cyBhbGwgZ2l2ZW4gbWV0aG9kcy5cbiAgICovXG4gIHF1YWNrcyhvLCBtZXRob2RzKSB7XG4gICAgaWYgKCFvKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKCFtZXRob2RzKSB0aHJvdyBcIm1pc3NpbmcgbWV0aG9kcyBsaXN0XCI7XG4gICAgaWYgKGlzU3RyaW5nKG1ldGhvZHMpKSB7XG4gICAgICBtZXRob2RzID0gdG9BcnJheShhcmd1bWVudHMpLnNsaWNlKDEsIGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IG1ldGhvZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoIWlzRnVuY3Rpb24ob1ttZXRob2RzW2ldXSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogUmVwbGFjZXMgdmFsdWVzIGluIHN0cmluZ3MsIHVzaW5nIG11c3RhY2hlcy5cbiAgICovXG4gIGZvcm1hdChzLCBvKSB7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvXFx7XFx7KC4rPylcXH1cXH0vZywgZnVuY3Rpb24gKHMsIGEpIHtcbiAgICAgIGlmICghby5oYXNPd25Qcm9wZXJ0eShhKSlcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICByZXR1cm4gb1thXTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUHJveHkgZnVuY3Rpb24gdG8gZm4gYmluZC5cbiAgICovXG4gIGJpbmQoZm4sIG8pIHtcbiAgICByZXR1cm4gZm4uYmluZChvKTtcbiAgfSxcblxuICBpZmNhbGwoZm4sIGN0eCwgYXJncykge1xuICAgIGlmICghZm4pIHJldHVybjtcbiAgICBpZiAoIWFyZ3MpIHtcbiAgICAgIGZuLmNhbGwoY3R4KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOiBmbi5jYWxsKGN0eCk7IHJldHVybjtcbiAgICAgIGNhc2UgMTogZm4uY2FsbChjdHgsIGFyZ3NbMF0pOyByZXR1cm47XG4gICAgICBjYXNlIDI6IGZuLmNhbGwoY3R4LCBhcmdzWzBdLCBhcmdzWzFdKTsgcmV0dXJuO1xuICAgICAgY2FzZSAzOiBmbi5jYWxsKGN0eCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7IHJldHVybjtcbiAgICAgIGRlZmF1bHQ6IGZuLmFwcGx5KGN0eCwgYXJncyk7XG4gICAgfVxuICB9XG59O1xuIl19
