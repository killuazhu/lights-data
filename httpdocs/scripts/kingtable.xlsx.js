(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /**
                                                                                                                                                                                                                                                                               * KingTable plugin for Excel client side export using SheetJS/js-xlsx library
                                                                                                                                                                                                                                                                               * https://github.com/RobertoPrevato/KingTable
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Copyright 2017, Roberto Prevato
                                                                                                                                                                                                                                                                               * https://robertoprevato.github.io
                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                               * Licensed under the MIT license:
                                                                                                                                                                                                                                                                               * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                               */


var _raise = require("../../scripts/raise");

var _raise2 = _interopRequireDefault(_raise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var und = "undefined";

// KingTable is immediately necessary
if ((typeof KingTable === "undefined" ? "undefined" : _typeof(KingTable)) == und) (0, _raise2.default)(39, "KingTable is not defined in global namespace");

var _ = KingTable.Utils;
var dateValue = KingTable.DateUtils.toExcelDateValue;

function sheetFromArrayOfArrays(data, opts) {
  var ws = {};
  var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var value = data[R][C];
      var cell = { v: value };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

      if (typeof value == "number") {
        cell.t = "n";
        // TODO: support desired precision of numbers
        //cell.z = ...
      } else if (typeof value == "boolean") cell.t = "b";else if (value instanceof Date) {
        cell.t = "n";cell.z = XLSX.SSF._table[14];
        cell.v = dateValue(cell.v);
      } else cell.t = "s";

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) {
    view[i] = s.charCodeAt(i) & 0xFF;
  }return buf;
}

function handler(itemsToDisplay) {
  // at this point, dependencies are required
  if ((typeof XLSX === "undefined" ? "undefined" : _typeof(XLSX)) == und) (0, _raise2.default)(2, "Missing dependency: js-xlsx");
  if ((typeof Blob === "undefined" ? "undefined" : _typeof(Blob)) == und) (0, _raise2.default)(2, "Missing dependency: Blob");

  var self = this,
      o = self.options;
  var data = self.optimizeCollection(itemsToDisplay, null, {
    format: o.excelAllStrings
  });
  var wb = new Workbook(),
      ws = sheetFromArrayOfArrays(data);

  // add worksheet to workbook
  var wsName = o.excelWorkbookName;
  wb.SheetNames.push(wsName);
  wb.Sheets[wsName] = ws;

  // columns auto width
  // for each column, get the cell width
  var padding = o.excelCellPadding,
      minCellWidth = o.excelCellMinWidth;
  var cols = _.cols(data),
      wscols = _.map(cols, function (x) {
    return { wch: Math.max(_.max(x, function (y) {
        return y.length;
      }), minCellWidth) + padding };
  });
  ws["!cols"] = wscols;

  var wbout = XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "binary" });
  return new Blob([s2ab(wbout)], { type: "application/octet-stream" });
}

// regional settings
KingTable.regional.en.exportFormats.xlsx = "Excel (.xlsx)";

// extend options
KingTable.defaults.excelWorkbookName = "data";
KingTable.defaults.excelCellPadding = 0;
KingTable.defaults.excelCellMinWidth = 0;
KingTable.defaults.excelAllStrings = false;

// add export format for client side Xlsx
KingTable.defaults.exportFormats.unshift({
  name: "Xlsx",
  format: "xlsx",
  type: "application/octet-stream",
  cs: true, // client side
  handler: handler
});

},{"../../scripts/raise":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb2RlL3NjcmlwdHMvcmFpc2UuanMiLCJjb2RlL3NjcmlwdHMvdGFibGVzL2tpbmd0YWJsZS54bHN4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7a0JDZ0J3QixLO0FBaEJ4Qjs7Ozs7Ozs7Ozs7OztBQWFBOzs7QUFHZSxTQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLE1BQXBCLEVBQTRCO0FBQ3pDLE1BQUksVUFBVSxDQUFDLFNBQVMsTUFBVCxHQUFrQixPQUFuQixJQUE4QixpRkFBOUIsR0FBa0gsR0FBaEk7QUFDQSxNQUFJLE9BQU8sT0FBUCxJQUFrQixXQUF0QixFQUFtQztBQUNqQyxZQUFRLEtBQVIsQ0FBYyxPQUFkO0FBQ0Q7QUFDRCxRQUFNLElBQUksS0FBSixDQUFVLE9BQVYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4UUN4QkE7Ozs7Ozs7Ozs7OztBQVVBOzs7Ozs7QUFDQSxJQUFJLE1BQU0sV0FBVjs7QUFFQTtBQUNBLElBQUksUUFBTyxTQUFQLHlDQUFPLFNBQVAsTUFBb0IsR0FBeEIsRUFBNkIscUJBQU0sRUFBTixFQUFVLDhDQUFWOztBQUU3QixJQUFJLElBQUksVUFBVSxLQUFsQjtBQUNBLElBQUksWUFBWSxVQUFVLFNBQVYsQ0FBb0IsZ0JBQXBDOztBQUVBLFNBQVMsc0JBQVQsQ0FBZ0MsSUFBaEMsRUFBc0MsSUFBdEMsRUFBNEM7QUFDMUMsTUFBSSxLQUFLLEVBQVQ7QUFDQSxNQUFJLFFBQVEsRUFBQyxHQUFHLEVBQUMsR0FBRSxRQUFILEVBQWEsR0FBRSxRQUFmLEVBQUosRUFBOEIsR0FBRyxFQUFDLEdBQUUsQ0FBSCxFQUFNLEdBQUUsQ0FBUixFQUFqQyxFQUFaO0FBQ0EsT0FBSSxJQUFJLElBQUksQ0FBWixFQUFlLEtBQUssS0FBSyxNQUF6QixFQUFpQyxFQUFF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QUFtQixlQUFuQixHQUFxQyxLQUFyQzs7QUFFQTtBQUNBLFVBQVUsUUFBVixDQUFtQixhQUFuQixDQUFpQyxPQUFqQyxDQUF5QztBQUN2QyxRQUFNLE1BRGlDO0FBRXZDLFVBQVEsTUFGK0I7QUFHdkMsUUFBTSwwQkFIaUM7QUFJdkMsTUFBSSxJQUptQyxFQUk1QjtBQUNYLFdBQVM7QUFMOEIsQ0FBekMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBLaW5nVGFibGUgcmFpc2UgZnVuY3Rpb24uXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmFpc2UgZXhjZXB0aW9ucyB0aGF0IGluY2x1ZGUgYSBsaW5rIHRvIHRoZSBHaXRIdWIgd2lraSxcbiAqIHByb3ZpZGluZyBmdXJ0aGVyIGluZm9ybWF0aW9uIGFuZCBkZXRhaWxzLlxuICogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZVxuICpcbiAqIENvcHlyaWdodCAyMDE3LCBSb2JlcnRvIFByZXZhdG9cbiAqIGh0dHBzOi8vcm9iZXJ0b3ByZXZhdG8uZ2l0aHViLmlvXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlOlxuICogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKipcbiAqIFJhaXNlcyBhbiBleGNlcHRpb24sIG9mZmVyaW5nIGEgbGluayB0byB0aGUgR2l0SHViIHdpa2kuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhaXNlKGVyciwgZGV0YWlsKSB7XG4gIHZhciBtZXNzYWdlID0gKGRldGFpbCA/IGRldGFpbCA6IFwiRXJyb3JcIikgKyBcIi4gRm9yIGZ1cnRoZXIgZGV0YWlsczogaHR0cHM6Ly9naXRodWIuY29tL1JvYmVydG9QcmV2YXRvL0tpbmdUYWJsZS93aWtpL0Vycm9ycyNcIiArIGVycjtcbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxuLypcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkVycm9yc1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuMS4gTWlzc2luZyBQcm9taXNlIGltcGxlbWVudGF0aW9uLlxuMi4gTWlzc2luZyBkZXBlbmRlbmN5LlxuMy4gS2luZ1RhYmxlIGluaXRpYWxpemF0aW9uOiBEYXRhIGlzIG5vdCBhbiBhcnJheS5cbjQuIEtpbmdUYWJsZTogY2Fubm90IGRldGVybWluZSBpZCBwcm9wZXJ0eSBvZiBkaXNwbGF5ZWQgb2JqZWN0cy5cbjUuIEtpbmdUYWJsZTogYW4gQUpBWCByZXF1ZXN0IGlzIHJlcXVpcmVkLCBidXQgdXJsIGlzIG5vdCBjb25maWd1cmVkLlxuNi4gS2luZ1RhYmxlOiB0aGUgcmV0dXJuZWQgb2JqZWN0IGlzIG5vdCBhIGNhdGFsb2cuXG43LiBLaW5nVGFibGU6IG1pc3NpbmcgdG90YWwgaXRlbXMgY291bnQgaW4gcmVzcG9uc2Ugb2JqZWN0LlxuOC4gS2luZ1RhYmxlOiBtaXNzaW5nIHZpZXcgY29uZmlndXJhdGlvbi5cbjkuIEtpbmdUYWJsZTogbWlzc2luZyB2aWV3cyBjb25maWd1cmF0aW9uLlxuMTAuIEtpbmdUYWJsZTogbWlzc2luZyBoYW5kbGVyIGZvciB2aWV3LlxuMTEuIEZpbHRlcnNNYW5hZ2VyOiBtaXNzaW5nIHNlYXJjaCBwcm9wZXJ0aWVzLlxuMTIuIEZlYXR1cmUgbm90IGltcGxlbWVudGVkLlxuMTMuIGdldFRhYmxlRGF0YSBpcyBub3QgcmV0dXJuaW5nIGEgcHJvbWlzZSBvYmplY3QuXG4xNC4gZ2V0RmV0Y2hQcm9taXNlIGRpZCBub3QgcmV0dXJuIGEgdmFsdWUgd2hlbiByZXNvbHZpbmcuXG4xNS4gTWlzc2luZyByZWdpb25hbC5cbjE2LiBJbnZhbGlkIGNvbHVtbnMgb3B0aW9uLlxuMTcuIE1pc3NpbmcgcHJvcGVydHkgbmFtZSBpbiBjb2x1bW4gb3B0aW9uLlxuMTguIENvbHVtbiBuYW1lIGRlZmluZWQgaW4gb3B0aW9ucywgbm90IGZvdW5kIGluc2lkZSBkYXRhIGl0ZW1zLlxuMTkuIENvbHVtbiBkb2VzIG5vdCBleGlzdC5cbjIwLiBNaXNzaW5nIGNvbHVtbnMgaW5mb3JtYXRpb24gKHByb3BlcnRpZXMgbm90IGluaXRpYWxpemVkKS5cbjIxLiBNaXNzaW5nIHZpZXcgY29uZmlndXJhdGlvbiBmb3IgUmljaCBIVE1MIGJ1aWxkZXIuXG4yMi4gTWlzc2luZyB2aWV3IHJlc29sdmVyIGZvciBSaWNoIEhUTUwgYnVpbGRlci5cbjIzLiBJbnZhbGlkIHJlc29sdmVyIGZvciBSaWNoIEhUTUwgYnVpbGRlciB2aWV3LlxuMjQuIEludmFsaWQgYGh0bWxgIG9wdGlvbiBmb3IgY29sdW1uIChwcm9wZXJ0eSkuXG4yNS4gQ2Fubm90IGRpc3BsYXkgYSBidWlsdCB0YWJsZSwgYmVjYXVzZSB0aGUgdGFibGUgaXMgbm90IGJvdW5kIHRvIGFuIGVsZW1lbnQuXG4yNi4gQ2Fubm90IHVwZGF0ZSB3aXRob3V0IHJvb3QgZWxlbWVudC5cbjI3LiBJbnZhbGlkIG1ldGhvZCBkZWZpbml0aW9uIChtdXN0IGJlIHN0cmluZyBvciBmdW5jdGlvbikuXG4yOC4gSW52YWxpZCBzb3J0IG1vZGUgZm9yIFJIVE1MIGJ1aWxkZXIuXG4yOS4gTWlzc2luZyBmb3JtYXQgaW4gZXhwb3J0IGVsZW1lbnQuXG4zMC4gTWlzc2luZyBmb3JtYXQgaW5mb3JtYXRpb24uXG4zMS4gSW52YWxpZCBnZXRJdGVtVGVtcGxhdGUgZnVuY3Rpb24gaW4gZXh0cmEgdmlldy5cbjMyLiBNaXNzaW5nIHByb3BlcnR5IGZvciB0ZW1wbGF0ZS5cbjMzLiBNaXNzaW5nIHJlc29sdmVyIGluIHZpZXcgY29uZmlndXJhdGlvbi5cbjM0LiBJbnZhbGlkIGV4dHJhIHZpZXdzIGNvbmZpZ3VyYXRpb24gKG51bGwgb3IgZmFsc3kgdmFsdWUpLlxuMzUuIE1pc3NpbmcgJ25hbWUnIHByb3BlcnR5IGluIGV4dHJhIHZpZXcgY29uZmlndXJhdGlvbi5cbjM2LiBDYW5ub3QgcmV0cmlldmUgYW4gaXRlbSBieSBldmVudCBkYXRhLiBNYWtlIHN1cmUgdGhhdCBIVE1MIGVsZW1lbnRzIGdlbmVyYXRlZCBmb3IgdGFibGUgaXRlbXMgaGF2ZSAna3QtaXRlbScgY2xhc3MuXG4zNy4gQ2Fubm90IHJldHJpZXZlIGFuIGl0ZW0gYnkgZWxlbWVudCBkYXRhLiBNYWtlIHN1cmUgdGhhdCBIVE1MIGVsZW1lbnRzIGdlbmVyYXRlZCBmb3IgdGFibGUgaXRlbXMgaGF2ZSAnZGF0YS1peCcgYXR0cmlidXRlLlxuMzguIENhbm5vdCBvYnRhaW4gSFRNTCBmcm9tIHBhcmFtZXRlci5cbjM5LiBLaW5nVGFibGUgaXMgbm90IGRlZmluZWQgaW4gZ2xvYmFsIG5hbWVzcGFjZS5cbjQwLiBUb29scyBpcyBub3QgYW4gYXJyYXkgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgYW4gYXJyYXkuXG40MS4gSW52YWxpZCBIVFRQIE1ldGhvZCBjb25maWd1cmF0aW9uLlxuKi9cbiIsIi8qKlxuICogS2luZ1RhYmxlIHBsdWdpbiBmb3IgRXhjZWwgY2xpZW50IHNpZGUgZXhwb3J0IHVzaW5nIFNoZWV0SlMvanMteGxzeCBsaWJyYXJ5XG4gKiBodHRwczovL2dpdGh1Yi5jb20vUm9iZXJ0b1ByZXZhdG8vS2luZ1RhYmxlXG4gKlxuICogQ29weXJpZ2h0IDIwMTcsIFJvYmVydG8gUHJldmF0b1xuICogaHR0cHM6Ly9yb2JlcnRvcHJldmF0by5naXRodWIuaW9cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2U6XG4gKiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5pbXBvcnQgcmFpc2UgZnJvbSBcIi4uLy4uL3NjcmlwdHMvcmFpc2VcIlxudmFyIHVuZCA9IFwidW5kZWZpbmVkXCI7XG5cbi8vIEtpbmdUYWJsZSBpcyBpbW1lZGlhdGVseSBuZWNlc3NhcnlcbmlmICh0eXBlb2YgS2luZ1RhYmxlID09IHVuZCkgcmFpc2UoMzksIFwiS2luZ1RhYmxlIGlzIG5vdCBkZWZpbmVkIGluIGdsb2JhbCBuYW1lc3BhY2VcIik7XG5cbnZhciBfID0gS2luZ1RhYmxlLlV0aWxzO1xudmFyIGRhdGVWYWx1ZSA9IEtpbmdUYWJsZS5EYXRlVXRpbHMudG9FeGNlbERhdGVWYWx1ZTtcblxuZnVuY3Rpb24gc2hlZXRGcm9tQXJyYXlPZkFycmF5cyhkYXRhLCBvcHRzKSB7XG4gIHZhciB3cyA9IHt9O1xuICB2YXIgcmFuZ2UgPSB7czoge2M6MTAwMDAwMDAsIHI6MTAwMDAwMDB9LCBlOiB7YzowLCByOjAgfX07XG4gIGZvcih2YXIgUiA9IDA7IFIgIT0gZGF0YS5sZW5ndGg7ICsrUikge1xuICAgIGZvcih2YXIgQyA9IDA7IEMgIT0gZGF0YVtSXS5sZW5ndGg7ICsrQykge1xuICAgICAgaWYocmFuZ2Uucy5yID4gUikgcmFuZ2Uucy5yID0gUjtcbiAgICAgIGlmKHJhbmdlLnMuYyA+IEMpIHJhbmdlLnMuYyA9IEM7XG4gICAgICBpZihyYW5nZS5lLnIgPCBSKSByYW5nZS5lLnIgPSBSO1xuICAgICAgaWYocmFuZ2UuZS5jIDwgQykgcmFuZ2UuZS5jID0gQztcbiAgICAgIHZhciB2YWx1ZSA9IGRhdGFbUl1bQ107XG4gICAgICB2YXIgY2VsbCA9IHt2OiB2YWx1ZSB9O1xuICAgICAgaWYoY2VsbC52ID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgdmFyIGNlbGxfcmVmID0gWExTWC51dGlscy5lbmNvZGVfY2VsbCh7YzpDLHI6Un0pO1xuICAgICAgXG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCIpIHsgXG4gICAgICAgIGNlbGwudCA9IFwiblwiO1xuICAgICAgICAvLyBUT0RPOiBzdXBwb3J0IGRlc2lyZWQgcHJlY2lzaW9uIG9mIG51bWJlcnNcbiAgICAgICAgLy9jZWxsLnogPSAuLi5cbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PSBcImJvb2xlYW5cIikgY2VsbC50ID0gXCJiXCI7XG4gICAgICBlbHNlIGlmICh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcbiAgICAgICAgY2VsbC50ID0gXCJuXCI7IGNlbGwueiA9IFhMU1guU1NGLl90YWJsZVsxNF07XG4gICAgICAgIGNlbGwudiA9IGRhdGVWYWx1ZShjZWxsLnYpO1xuICAgICAgfVxuICAgICAgZWxzZSBjZWxsLnQgPSBcInNcIjtcbiAgICAgIFxuICAgICAgd3NbY2VsbF9yZWZdID0gY2VsbDtcbiAgICB9XG4gIH1cbiAgaWYocmFuZ2Uucy5jIDwgMTAwMDAwMDApIHdzW1wiIXJlZlwiXSA9IFhMU1gudXRpbHMuZW5jb2RlX3JhbmdlKHJhbmdlKTtcbiAgcmV0dXJuIHdzO1xufVxuXG5mdW5jdGlvbiBXb3JrYm9vaygpIHtcbiAgaWYoISh0aGlzIGluc3RhbmNlb2YgV29ya2Jvb2spKSByZXR1cm4gbmV3IFdvcmtib29rKCk7XG4gIHRoaXMuU2hlZXROYW1lcyA9IFtdO1xuICB0aGlzLlNoZWV0cyA9IHt9O1xufVxuIFxuZnVuY3Rpb24gczJhYihzKSB7XG4gIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIocy5sZW5ndGgpO1xuICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG4gIGZvciAodmFyIGk9MDsgaSE9cy5sZW5ndGg7ICsraSkgdmlld1tpXSA9IHMuY2hhckNvZGVBdChpKSAmIDB4RkY7XG4gIHJldHVybiBidWY7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZXIoaXRlbXNUb0Rpc3BsYXkpIHtcbiAgLy8gYXQgdGhpcyBwb2ludCwgZGVwZW5kZW5jaWVzIGFyZSByZXF1aXJlZFxuICBpZiAodHlwZW9mIFhMU1ggPT0gdW5kKSByYWlzZSgyLCBcIk1pc3NpbmcgZGVwZW5kZW5jeToganMteGxzeFwiKTtcbiAgaWYgKHR5cGVvZiBCbG9iID09IHVuZCkgcmFpc2UoMiwgXCJNaXNzaW5nIGRlcGVuZGVuY3k6IEJsb2JcIik7XG5cbiAgdmFyIHNlbGYgPSB0aGlzLCBvID0gc2VsZi5vcHRpb25zO1xuICB2YXIgZGF0YSA9IHNlbGYub3B0aW1pemVDb2xsZWN0aW9uKGl0ZW1zVG9EaXNwbGF5LCBudWxsLCB7XG4gICAgZm9ybWF0OiBvLmV4Y2VsQWxsU3RyaW5nc1xuICB9KTtcbiAgdmFyIHdiID0gbmV3IFdvcmtib29rKCksIHdzID0gc2hlZXRGcm9tQXJyYXlPZkFycmF5cyhkYXRhKTtcbiAgXG4gIC8vIGFkZCB3b3Jrc2hlZXQgdG8gd29ya2Jvb2tcbiAgdmFyIHdzTmFtZSA9IG8uZXhjZWxXb3JrYm9va05hbWU7XG4gIHdiLlNoZWV0TmFtZXMucHVzaCh3c05hbWUpO1xuICB3Yi5TaGVldHNbd3NOYW1lXSA9IHdzO1xuXG4gIC8vIGNvbHVtbnMgYXV0byB3aWR0aFxuICAvLyBmb3IgZWFjaCBjb2x1bW4sIGdldCB0aGUgY2VsbCB3aWR0aFxuICB2YXIgcGFkZGluZyA9IG8uZXhjZWxDZWxsUGFkZGluZywgbWluQ2VsbFdpZHRoID0gby5leGNlbENlbGxNaW5XaWR0aDtcbiAgdmFyIGNvbHMgPSBfLmNvbHMoZGF0YSksXG4gICAgd3Njb2xzID0gXy5tYXAoY29scywgeCA9PiB7XG4gICAgICByZXR1cm4ge3djaDpNYXRoLm1heChfLm1heCh4LCB5ID0+IHsgcmV0dXJuIHkubGVuZ3RoOyB9KSwgbWluQ2VsbFdpZHRoKSArIHBhZGRpbmd9O1xuICAgIH0pO1xuICB3c1tcIiFjb2xzXCJdID0gd3Njb2xzO1xuXG4gIHZhciB3Ym91dCA9IFhMU1gud3JpdGUod2IsIHtib29rVHlwZTpcInhsc3hcIiwgYm9va1NTVDp0cnVlLCB0eXBlOiBcImJpbmFyeVwifSk7XG4gIHJldHVybiBuZXcgQmxvYihbczJhYih3Ym91dCldLCB7dHlwZTpcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwifSk7XG59XG5cbi8vIHJlZ2lvbmFsIHNldHRpbmdzXG5LaW5nVGFibGUucmVnaW9uYWwuZW4uZXhwb3J0Rm9ybWF0cy54bHN4ID0gXCJFeGNlbCAoLnhsc3gpXCI7XG5cbi8vIGV4dGVuZCBvcHRpb25zXG5LaW5nVGFibGUuZGVmYXVsdHMuZXhjZWxXb3JrYm9va05hbWUgPSBcImRhdGFcIjtcbktpbmdUYWJsZS5kZWZhdWx0cy5leGNlbENlbGxQYWRkaW5nID0gMDtcbktpbmdUYWJsZS5kZWZhdWx0cy5leGNlbENlbGxNaW5XaWR0aCA9IDA7XG5LaW5nVGFibGUuZGVmYXVsdHMuZXhjZWxBbGxTdHJpbmdzID0gZmFsc2U7XG5cbi8vIGFkZCBleHBvcnQgZm9ybWF0IGZvciBjbGllbnQgc2lkZSBYbHN4XG5LaW5nVGFibGUuZGVmYXVsdHMuZXhwb3J0Rm9ybWF0cy51bnNoaWZ0KHtcbiAgbmFtZTogXCJYbHN4XCIsXG4gIGZvcm1hdDogXCJ4bHN4XCIsXG4gIHR5cGU6IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCIsXG4gIGNzOiB0cnVlLCAgLy8gY2xpZW50IHNpZGVcbiAgaGFuZGxlcjogaGFuZGxlclxufSk7XG5cbiJdfQ==
