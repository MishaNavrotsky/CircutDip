document.addEventListener("DOMContentLoaded", function () {
  LogicalFigure = logical;
  VariableFigure = variable;

  function getUsername() {
    $.ajax({
      url: "/username"
    }).done(function showUsername(data) {
      userName.innerHTML = data;
    })
  }
  getUsername();

  function getScheme() {
    if (location.pathname != "/") {
      $.ajax({
        url: "/scheme" + location.pathname
      }).done(function showScheme(data) {
        var reader = new draw2d.io.json.Reader();
        reader.unmarshal(canvas, JSON.parse(data));
        canvas.figures.data.forEach(function(el){
          el.portInitialize();
        })
      });
    }
  }
  getScheme();

  $('#elements').on("click", function () {
    $('#logical').toggle();
    if ($('#logical').css("display") == "none") {
      $('#gfx_holder').css('left', '0px');
    } else {
      $('#gfx_holder').css('left', '100px');
    }
  });

  function toogleRightMenu() {
    $('.rightMenu').toggle();
    if ($('.rightMenu').css("display") == "none") {
      $('#gfx_holder').css('right', '0px');
    } else {
      $('#gfx_holder').css('right', '700px');
    }
  }


  function createPre(str) {
    return $("<pre class='table'>" + str + "</pre>");
  }


  function sendSchemeJSON() {
    var url = window.location.pathname;
    var writer = new draw2d.io.json.Writer();
    writer.marshal(canvas, function (json) {
      $.post({
        url: "scheme" + url,
        type: "POST",
        data: {
          data: JSON.stringify(json)
        }
      })
    });
  }

  $('#btnSave').on("click", function checkUrl() {
    if (window.location.pathname == "/") {
      $.ajax({
        url: "/url"
      }).done(function (data) {
        window.history.pushState("object or string", "Title", data);
        sendSchemeJSON();
      })
    } else {
      sendSchemeJSON();
    }
  });

  $('#btnMenu').on("click", function () {
    toogleRightMenu();
  });

  $("#btnFunCreate").on("click", function () {
    var output = prompt("Output name");
    output += "_OUT";
    alert(createFunction(buildMap(buildTree(buildRelations(canvas), output))));
  });

  $("#btnBuildTable").on("click", function () {
    var func = inputFunction.value;
    var map = buildMapFromFunc(func);
    var table = buildTable(map);
    $("#tables").append(createPre(truthTableToStr(table)));
  })

  $("#btnBuildTableScheme").on("click", function createTruthTables() {
    var outputs = getAllOutputs();
    var relations = buildRelations(canvas);
    var tables = [];
    for (var i = 0; i < outputs.length; i++) {
      var tree = buildTree(relations, outputs[i]);
      var map = buildMap(tree);
      tables.push(buildTable(map));
    }
    if (tables.length > 0) {
      if ($(".rightMenu").css("display") == "none") {
        toogleRightMenu();
      }
      for (var i = 0; i < tables.length; i++) {
        $("#tables").append(createPre(truthTableToStr(tables[i])));
      }
    }
  })

  $("#btnClearTables").on("click", function () {
    $("#tables").html("");
  });

  $('#btnBuildScheme').on("click", function () {
    var func = inputFunction.value;
    var map = buildMapFromFunc(func);
    canvas.clear();
    var elements = createElementsFromMap(map);
    drawElementsMap(elements, map);
  });

  function truthTableToStr(table) {
    var str = "";
    for (var i = 0; i < table.inputs.length; i++) {
      str += varName(table.inputs[i]) + " ";
    }
    // str = str.substring(0,str.length-1);
    str += "| " + varName(table.output);
    str += "\n";
    for (var i = 0; i < table.numbers.length; i++) {
      str += "\t";
      str += table.numbers[i] + ":" + table.results[i] + "\n";
    }
    return str;
  }

  //   $(".draggable").on("mousedown", function (e,b) {
  //     var inner = $("<div/>", {class:"draggable"}).draggable().appendTo(".draggable");
  //     inner.css("position", "absolute");
  //     e.type = "mousedown.draggable";
  //     e.target = inner[0];
  //     inner.css("left", e.pageX);
  //     inner.css("top", e.pageY);
  //     inner.trigger(e);
  //     console.log(2);
  //     return false;
  // });

  // $(".draggable").on("mousedown", function (e, b) {
  //   if(e.button!=0) return;
  //   var newEl = $(e.currentTarget).clone().draggable({
  //     helper: 'clone',
  //     appendTo: 'body',
  //     stop: function () {
  //       newEl.remove();
  //     }
  //   }).appendTo(e.currentTarget);
  //   e.type = "mousedown.draggable";
  //   e.target = newEl[0];
  //   newEl.trigger(e);
  //   return false;
  // });



  canvas = new(draw2d.Canvas.extend({

    init: function (id) {
      this._super(id);
      this.setScrollArea("#" + id);
    }

  }))("gfx_holder");
  //bug fix
  $("#gfx_holder").css({
    "width": "auto",
    "height": "auto"
  })

  router = //new draw2d.layout.connection.CircuitConnectionRouter();
    new draw2d.layout.connection.InteractiveManhattanConnectionRouter();
  canvas.installEditPolicy(new draw2d.policy.connection.ComposedConnectionCreatePolicy(
    [

      new draw2d.policy.connection.DragConnectionCreatePolicy({
        createConnection: function () {
          return new draw2d.Connection({
            outlineColor: "#ffffff",
            outlineStroke: 1,
            color: "#000000",
            stroke: 1,
            radius: 2,
            router: router
          });
        }
      }),

      // new draw2d.policy.connection.OrthogonalConnectionCreatePolicy({
      //   createConnection: function () {
      //     return new draw2d.Connection({
      //       outlineColor: "#ffffff",
      //       outlineStroke: 1,
      //       color: "#000000",
      //       stroke: 1,
      //       radius: 2,
      //       router: router
      //     });
      //   }
      // })
    ]));
  // canvas.installEditPolicy(new draw2d.policy.canvas.ShowGridEditPolicy());
  canvas.installEditPolicy(new draw2d.policy.canvas.SnapToGeometryEditPolicy());
  canvas.installEditPolicy(new draw2d.policy.canvas.SnapToInBetweenEditPolicy());
  canvas.installEditPolicy(new draw2d.policy.canvas.SnapToCenterEditPolicy());

  $(".draggable").draggable({
    helper: 'clone',
    appendTo: 'body',
    stop: function (a, b) {
      if (a.clientY < 64 || a.clientX < 100) return;
      var type = a.target.getAttribute("type");
      var name = logicalNameSelector(a.target);
      var element = classTypeSelector(type, {
        text: name ? name : "undefined",
        x: a.pageX - 100 - a.offsetX + $("#gfx_holder").scrollLeft(),
        y: a.pageY - 64 - a.offsetY + $("#gfx_holder").scrollTop()
      });
      canvas.add(element);
    }
  })
  // and = new logical({
  //   text: "AND",
  //   x: 100,
  //   y: 100
  // });
  // canvas.add(and);
  // canvas.add(new logical({
  //   text: "OR",
  //   x: 200,
  //   y: 100
  // }));

});

function varName(str) {
  return str.substring(0, str.indexOf("_"))
}

function getAllOutputs() {
  var figures = canvas.figures.data;
  var out = [];
  for (var i = 0; i < figures.length; i++) {
    if (figures[i].NAME == "VariableFigure" && figures[i].inputPorts.data.length == 1) {
      out.push(figures[i].label.text + "_OUT");
    }
  }
  return out;
}

function logicalNameSelector(DOMelement) {
  switch (DOMelement.id) {
    case "logicalOR":
      return "OR";
    case "logicalAND":
      return "AND";
    case "logicalNOT":
      return "NOT";
    case "logicalORNOT":
      return "ORNOT";
    case "logicalANDNOT":
      return "ANDNOT";
  }
}

function classTypeSelector(type, obj) {
  switch (type) {
    case "logical":
      return new logical(obj);
    case "variable":
      return new variable(obj);
  }
}

function nameAllElements(canvas) {
  var figures = canvas.figures.data;
  for (var i = 0; i < figures.length; i++) {
    if (figures[i].NAME == "LogicalFigure") {
      figures[i].idName = figures[i].label.text + "_" + figures[i].inputPorts.data.length + "_" + i;
    } else {
      if (figures[i].inputPorts.data.length >= 1) {
        figures[i].idName = figures[i].label.text + "_OUT";
      } else {
        figures[i].idName = figures[i].label.text + "_IN";
      }
    }
  }
}
//for output

function buildRelations(canvas) {
  function buildOutputRelation(canvas) {
    var obj = {};
    var figures = canvas.figures.data;
    for (var i = 0; i < figures.length; i++) {
      var outputPort = canvas.figures.data[i].outputPorts.data[0];
      var idName = canvas.figures.data[i].idName;
      if (outputPort) {
        var connections = outputPort.connections.data;
        // console.log(connections);
        var arr = [];
        for (var j = 0; j < connections.length; j++) {
          arr.push(connections[j].targetPort.parent.idName);
        }
        obj[idName] = arr;
      }
    }
    return obj;
  }


  function buildInputRelation(canvas) {
    var obj = {};
    var figures = canvas.figures.data;
    for (var i = 0; i < figures.length; i++) {
      var inputPorts = canvas.figures.data[i].inputPorts.data;
      var idName = canvas.figures.data[i].idName;
      if (inputPorts.length > 0) {
        var arr = [];
        for (var j = 0; j < inputPorts.length; j++) {
          var connections = inputPorts[j].connections.data;
          for (var k = 0; k < connections.length; k++) {
            arr.push(connections[k].sourcePort.parent.idName);
          }
        }
        // console.log(connections);
        obj[idName] = arr;
      }
    }
    return obj;
  }

  var obj = {};
  nameAllElements(canvas);
  obj["outputRelation"] = buildOutputRelation(canvas);
  obj["inputRelation"] = buildInputRelation(canvas);
  return obj;
}

function isLogical(str) {
  if (str.split("_").length == 3) {
    return true;
  }
  return false;
}

function IOTest(obj) {
  var outputRelation = obj["outputRelation"];
  var inputRelation = obj["inputRelation"];
  var ERRORS = [];


  //output input test for variables
  for (var i in outputRelation) {
    if (outputRelation[i].length == 0) {
      ERRORS.push(i + " OUTPUT ERROR");
    }
  }
  for (var i in inputRelation) {
    if (inputRelation[i].length == 0) {
      ERRORS.push(i + " INPUT ERROR");
      continue;
    }
    var inputData = i.split("_");
    if (isLogical(i) && inputRelation[i].length != parseInt(inputData[1])) {
      ERRORS.push(i + " INPUT ERROR");
    }
  }

  return ERRORS;
}

//buildTree(buildRelations(canvas),"Y1_OUT")

function buildTree(obj, outputName) {
  var ERRORS = IOTest(obj);
  if (ERRORS.length > 0) {
    console.error(ERRORS);
    throw new Error();
  }
  var b = [];

  function recursion(obj, fobj) {
    var arr = obj.inputRelation[fobj];
    b.push(fobj);
    if (arr) {
      b.push("[")
      for (var i = 0; i < arr.length; i++) {
        recursion(obj, arr[i]);
      }
      b.push("]")
    }
  }

  function parseRecursion(b) {
    var str = "[";
    for (var i = 0; i < b.length; i++) {
      if (b[i] == "[" || b[i] == "]") {
        str += b[i];
        continue;
      }
      if (b[i - 1] == "]" && i > 1) {
        str += "," + "\"" + b[i] + "\",";
        continue;
      }
      str += "\"" + b[i] + "\","
    }
    return (str + "]").replace(/\,\]/g, "]");
  }

  recursion(obj, outputName);
  return b;
  // var str = parseRecursion(b);
  // var arr = [];
  // console.log(str);
  // console.log(b);
  // eval("arr="+str);
  // return arr;
}

//buildMap(buildTree(buildRelations(canvas),"Y1_OUT"));
function buildMap(arr) {
  var nArr = arr.slice(0);
  var stack = [];
  for (var i = 1; i < nArr.length; i++) {
    if (nArr[i] == undefined) continue;
    if (nArr[i] == "]") {
      stack.push("[");
      nArr[i] = undefined;
      for (var j = i - 1; j > 0; j--) {
        if (nArr[j] == undefined) continue;
        if (nArr[j] == "[") {
          stack.push(nArr[j - 1])
          nArr[j] = undefined
          stack.push("],");
          break;
        }
        stack.push(nArr[j])
        nArr[j] = undefined
      }
    }
  }

  for (var i = 0; i < stack.length - 1; i++) {
    if (stack[i + 1] != "]," && stack[i] != "[" && stack[i] != "],") {
      stack[i] += ",";
    }
  }

  stack[stack.length - 1] = "]";

  var arr = [];
  var str = "[";
  for (var i = 0; i < stack.length; i++) {
    if (stack[i] != "[" && stack[i] != "]," && stack[i] != "]") {
      if (stack[i].indexOf(",") != -1) {
        str += "'" + stack[i].replace(",", "") + "'" + ",";
      } else {
        str += "'" + stack[i] + "'";
      }
      continue;
    }
    str += stack[i];
  }
  str += "]";
  eval("arr=" + str);

  return arr;
}

function operationSelect(str) {
  var op = str.slice(0, str.indexOf("_"));
  if (op == "ORNOT") {
    return "!+"
  } else if (op == "ANDNOT") {
    return "!*"
  } else if (op == "NOT") {
    return "!"
  } else if (op == "AND") {
    return "*"
  } else if (op == "OR") {
    return "+"
  } else {
    return "="
  }
}
//createFunction(buildMap(buildTree(buildRelations(canvas),"Y2_OUT")));
function createFunction(arr) {
  var out = arr[arr.length - 1][arr[arr.length - 1].length - 1];
  var str = "";
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    var operation = arr[i][arr[i].length - 1];
    var sel = operationSelect(operation);
    var op;
    if (sel[0] == "!") {
      obj[operation] = "!(";
      op = sel[1];
    } else {
      obj[operation] = "(";
      op = sel[0];
    }
    for (var j = 0; j < arr[i].length - 1; j++) {
      if (j == arr[i].length - 2) {
        obj[operation] += arr[i][j];
      } else {
        obj[operation] += arr[i][j] + op;
      }
    }
    obj[operation] += ")";
  }

  for (var i in obj) {
    for (var j in obj) {
      obj[i] = obj[i].replace(j, obj[j])
    }
  }
  str += out + " = " + obj[out];
  str = str.replace(/\_IN/g, "");
  str = str.replace(/\_OUT/g, "");
  str = str.replace(/\+/g, " + ");
  str = str.replace(/\*/g, " * ");
  str = str.replace("(", "");
  str = str.substring(0, str.length - 1);

  return str;
}

function intToBin(number, len) {
  var num = number.toString(2);
  var str = "";
  if (num.length < len) {
    for (var i = 0; i < len - num.length; i++) {
      str += "0"
    }
  }
  return str + num;
}

function arrayCopy(currentArray) {
  var newArray = [];

  for (var i = 0; i < currentArray.length; i++)
    newArray[i] = currentArray[i].slice();
  return newArray;
}
//buildTable(buildMap)
function buildTable(obj) {
  var inputsObj = {};
  for (var i in obj) {
    for (var j = 0; j < obj[i].length; j++) {
      if (!isLogical(obj[i][j]))
        inputsObj[obj[i][j]] = 0;
    }
  }
  var numberOfInputs = 0;
  var inputs = [];
  var output = "";
  for (var i in inputsObj) {
    if (i.indexOf("_IN") != -1) {
      inputs.push(i);
    } else {
      output = i;
    }
  }
  inputs.sort(function (a, b) {
    var matchA = a.match(/\d+/g);
    var matchB = b.match(/\d+/g);
    if (matchA && matchB)
      if (parseInt(matchA[0]) > parseInt(matchB[0])) {
        return 1
      }
    return -1;
  });
  var maxInt = Math.pow(2, inputs.length);
  var numbers = [];
  for (var i = 0; i < maxInt; i++) {
    numbers.push(intToBin(i, inputs.length));
  }

  //inputs[0]=numbers[x][0]
  function assign(input, number) {
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i] == input) {
        return number[i]
      }
    }
  }

  var objArray = [];
  for (var n = 0; n < numbers.length; n++) {
    var number = numbers[n];
    var newObj = arrayCopy(obj);
    for (var i = 0; i < obj.length - 1; i++) {
      var operation = obj[i][obj[i].length - 1];
      for (var j = 0; j < obj[i].length - 1; j++) {
        if (!isLogical(obj[i][j]))
          newObj[i][j] = assign(obj[i][j], number);
      }
    }
    objArray.push(newObj);
  }

  function process(operation, data) {
    var op = operation.slice(0, operation.indexOf("_"));
    var out = parseInt(data[0]);
    var parseData = [];
    for (var i = 0; i < data.length; i++) {
      parseData.push(parseInt(data[i]));
    }
    if (op == "ORNOT") {
      for (var i = 1; i < data.length; i++) {
        out = out | parseData[i];
      }
      out = !out;
      if (out) {
        out = 1;
      } else {
        out = 0;
      }
    } else if (op == "ANDNOT") {
      for (var i = 1; i < data.length; i++) {
        out = out & parseData[i];
      }
      out = !out;
      if (out) {
        out = 1;
      } else {
        out = 0;
      }
    } else if (op == "NOT") {
      out = !out;
      if (out) {
        out = 1;
      } else {
        out = 0;
      }
    } else if (op == "AND") {
      for (var i = 1; i < data.length; i++) {
        out = out & parseData[i];
      }
    } else if (op == "OR") {
      for (var i = 1; i < data.length; i++) {
        out = out | parseData[i];
      }
    }
    return out;
  }

  function findData(obj, op) {
    for (var i = 0; i < obj.length - 1; i++) {
      var operation = obj[i][obj[i].length - 1];
      if (op == operation) {
        return obj[i][0];
      }
    }
  }
  var results = [];
  for (var n = 0; n < objArray.length; n++) {
    var obj = objArray[n];
    for (var i = 0; i < obj.length; i++) {
      var operation = obj[i][obj[i].length - 1];
      var lastSt = obj[i];
      var data = [];
      for (var j = 0; j < lastSt.length - 1; j++) {
        if (!isNaN(parseInt(lastSt[j]))) {
          data.push(lastSt[j])
        } else {
          data.push(findData(obj, lastSt[j]));
        }
      }
      process(operation, data);
      lastSt.unshift(process(operation, data));
      if (i == obj.length - 1) {
        results.push(lastSt[0]);
      }
    }
  }
  return {
    inputs: inputs,
    output: output,
    numbers: numbers,
    results: results
  };
}

//Y1 = !(((X3 + X5) * !(X4 * X2)) * !(!(!(X4 * X2) + !(X3 * X1 * X6 * X7))))

function isOp(op) {
  if (op == "*" || op == "+" || op == "!")
    return true;
  return false;
}

function elementSelect(op) {
  if (op == "!+") {
    return "ORNOT"
  } else if (op == "!*") {
    return "ANDNOT"
  } else if (op == "!") {
    return "NOT"
  } else if (op == "*") {
    return "AND"
  } else if (op == "+") {
    return "OR"
  } else {
    return "EQUALS"
  }
}
//Y1 = !(!(((X3 + X5) * !(X4 * X2))) * X5 * !(!(!(X4 * X2) + !(X3 * X1))))
function buildMapFromFunc(func) {
  var arr = [];
  func = func.replace(/ /g, "");
  var n = 0;
  for (var i = 0; i < func.length; i++) {
    if (func[i] == "!" && func[i + 1] == "(") {
      arr.push("!(");
      i++;
      n = 0;
    } else if (func[i] == "(") {
      arr.push("(");
      n = 0;
    } else if (func[i] == ")") {
      arr.push(")");
      n = 0;
    } else if (isOp(func[i])) {
      arr.push(func[i]);
      n = 0;
    } else {
      if (n == 0) {
        arr.push(func[i]);
        n++;
      } else {
        arr[arr.length - 1] += func[i];
      }
    }
  }

  var inVar = arr[0].slice(0, arr[0].indexOf("="));

  var obj = {};
  var nArr = arr.slice(1);
  for (var i = 0; i < nArr.length; i++) {
    if (nArr[i] == undefined) continue;
    if (nArr[i] == ")") {
      obj["AAA" + i] = [];
      nArr[i] = undefined;
      for (var j = i - 1; j >= 0; j--) {
        if (nArr[j] == undefined) continue;
        if (nArr[j] == "(") {
          nArr[j] = "AAA" + i;
          break;
        }
        if (nArr[j] == "!(") {
          obj["AAA" + i].push("!");
          nArr[j] = "AAA" + i;
          break;
        }
        // if(nArr[j]==")") {
        //   nArr[j]=undefined;
        //   continue;
        // }
        obj["AAA" + i].push(nArr[j]);
        nArr[j] = undefined;
      }
    }
  }


  function process(op) {
    var data = "";
    var plus = false;
    var not = false;
    var mult = false;
    for (var i = 0; i < op.length; i++) {
      if (op[i] == "+") plus = true;
      if (op[i] == "*") mult = true;
      if (op[i] == "!") not = true;
    }

    if (not) data += "!";
    if (plus) data += "+";
    if (mult) data += "*";
    return data;
  }
  var n = 0;
  var map = [];
  for (var i in obj) {
    var arr = [];
    var op = "";
    for (var j = 0; j < obj[i].length; j++) {
      if (isOp(obj[i][j])) {
        op += obj[i][j]
      } else {
        arr.push(obj[i][j]);
      }
    }
    var length = arr.length;
    arr.push(i);

    arr.push(elementSelect(process(op)) + "_" + length + "_" + n++);
    map.push(arr);
  }

  for (var i = 0; i < map.length; i++) {
    var toChange = map[i][map[i].length - 1];
    if (toChange.indexOf("EQUALS") != -1) {
      toChange = map[i][0];
    }
    var whatChange = map[i][map[i].length - 2];
    for (var j = i + 1; j < map.length; j++) {
      var lastStr = map[j];
      for (var k = 0; k < lastStr.length; k++) {
        if (lastStr[k] == whatChange) {
          lastStr[k] = toChange;
        }
      }
    }
    map[i].splice(map[i].length - 2, 1);
  }

  for (var i = 0; i < map.length; i++) {
    if (map[i][map[i].length - 1].indexOf("EQUALS") != -1) {
      map.splice(i, 1);
      i--;
    }
  }

  for (var i = 0; i < map.length; i++) {
    var last = map[i];
    for (var j = 0; j < last.length; j++) {
      if (!isLogical(last[j])) {
        last[j] += "_IN";
      }
    }
  }

  map.push([map[map.length - 1][map[map.length - 1].length - 1], inVar + "_OUT"])
  return map;
}

function changeValueInMap(map, oldValue, newValue) {
  for (var i = 0; i < map.length; i++) {
    var lastStr = map[i];
    for (var j = 0; j < lastStr.length; j++) {
      if (lastStr[j] == oldValue) lastStr[j] = newValue;
    }
  }
}

function createElementsFromMap(map) {
  function createConnection(outputPort, inputPort) {
    var connection = new draw2d.Connection({
      outlineColor: "#ffffff",
      outlineStroke: 1,
      color: "#000000",
      stroke: 1,
      radius: 2,
      router: router
    });
    connection.setSource(outputPort);
    connection.setTarget(inputPort);
    return connection;
  }


  var cpyMap = arrayCopy(map);
  for (var i = 0; i < cpyMap.length; i++) {
    var lastStr = cpyMap[i];
    for (var j = 0; j < lastStr.length; j++) {
      if (typeof lastStr[j] == "string") {
        var typeSelector = "";
        if (isLogical(lastStr[j])) {
          typeSelector = "logical"
        } else {
          typeSelector = "variable";
        }
        var element = classTypeSelector(typeSelector, {
          text: varName(lastStr[j])
        })

        element.idName = lastStr[j];
        if (typeSelector == "logical") {
          changeValueInMap(cpyMap, lastStr[j], element);
        }
        lastStr[j] = element;
      }
    }
  }
  cpyMap[cpyMap.length - 1][cpyMap[cpyMap.length - 1].length - 1].setInput();

  for (var i = 0; i < cpyMap.length; i++) {
    var lastStr = cpyMap[i];
    var lastElement = lastStr[lastStr.length - 1];
    if (lastStr.length - 1 > 2) {
      var n = lastStr.length - 1 - 2;
      for (var k = 0; k < n; k++) {
        lastElement.addInput();
      }
    }
    for (var j = 0; j < lastStr.length - 1; j++) {
      var outputPort = lastStr[j].getOutputPorts().data[0]
      var inputPort = lastElement.getFreeInputPort();
      createConnection(outputPort, inputPort);
    }
  }

  return cpyMap;
}

Array.prototype.last = function () {
  return this[this.length - 1]
}

function buildLevelsOfSchemeFromMap(map) {
  var cpyMap = arrayCopy(map);
  var obj = {};

  function checkForFirstLevel(currentStr) {
    var isFirst = true;
    for (var i = 0; i < currentStr.length - 1; i++) {
      if (isLogical(currentStr[i]))
        return !isFirst;
    }
    return isFirst;
  }

  function checkForNextLevel(element, currentStr) {
    for (var i = 0; i < currentStr.length - 1; i++) {
      if (currentStr[i] == element)
        return true;
    }
    return false;
  }

  obj[0] = [];
  for (var i = 0; i < cpyMap.length; i++) {
    var currentStr = cpyMap[i];
    if (checkForFirstLevel(currentStr)) {
      obj[0].push(currentStr);
    }
  }

  for (var k = 1; k < cpyMap.length - 1; k++) {
    obj[k] = [];
    for (var g = 0; g < obj[k - 1].length; g++) {
      for (var i = 1; i < cpyMap.length - 1; i++) {
        var currentStr = cpyMap[i];
        if (checkForNextLevel(obj[k - 1][g].last(), currentStr)) {
          obj[k].push(currentStr);
        }
      }
    }
  }

  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  function normalize(obj) {
    function findArrayInArrays(array, arrays) {
      var n = 0;
      for (var i = 0; i < arrays.length; i++) {
        if (arraysEqual(arrays[i], array)) {
          n++;
        }
      }
      if (n > 1)
        return true;
      return false
    }

    var objLength = 0;


    for (var i in obj) {
      objLength++;
    }

    for (var i = 0; i < objLength; i++) {
      for (var j = 0; j < obj[i].length; j++) {
        if (findArrayInArrays(obj[i][j], obj[i])) {
          obj[i].splice(j, 1)
          j--;
        }
      }
    }
  }

  function findArrayInArrays(array, arrays) {
    for (var i = 0; i < arrays.length; i++) {
      if (arraysEqual(arrays[i], array)) {
        return true
      }
    }
    return false
  }

  function deleteCopies(obj) {
    var objLength = 0;

    for (var i in obj) {
      objLength++;
    }

    for (var i = 1; i < objLength; i++) {
      for (var j = 0; j < obj[i].length; j++) {
        for (var k = i + 1; k < objLength; k++) {
          if (findArrayInArrays(obj[i][j], obj[k])) {
            obj[i].splice(j, 1);
            j--;
            break;
          }
        }
      }
    }
  }

  function deleteUseless(obj) {
    var objLength = 0;

    for (var i in obj) {
      objLength++;
    }

    for (var i = 1; i < objLength; i++) {
      for (var j = 0; j < obj[i].length; j++) {
        for (var k = 0; k < obj[i][j].length - 1; k++) {
          if (isLogical(obj[i][j][k])) {
            obj[i][j].splice(k, 1);
            k--;
          }
        }
      }
    }
  }
  normalize(obj);
  deleteCopies(obj);
  deleteUseless(obj);
  return obj;
}



function stringLevelsToElementLevels(strMap, elMap) {
  var levels = buildLevelsOfSchemeFromMap(strMap);
  var cpyElMap = arrayCopy(elMap);

  var levelsLength = 0;
  for (var i in levels) {
    levelsLength++;
  }

  function findElInElMap(idName, elMap) {
    for (var i = 0; i < elMap.length; i++) {
      for (var j = 0; j < elMap[i].length; j++) {
        if (elMap[i][j].idName == idName) {
          return elMap[i][j];
        }
      }
    }
  }

  function findElInElMapArrAndReplace(idName, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i])
        if (arr[i].idName == idName) {
          var a = arr[i];
          arr[i] = undefined;
          return a;
        }
    }
  }

  function findArrOfElNameInElMap(idName, elMap) {
    for (var i = 0; i < elMap.length; i++) {
      if (elMap[i].last().idName == idName) {
        return elMap[i];
      }
    }
  }

  for (var i = 0; i < levelsLength; i++) {
    for (var j = 0; j < levels[i].length; j++) {
      levels[i][j][levels[i][j].length - 1] = findElInElMap(levels[i][j][levels[i][j].length - 1], cpyElMap);
    }
  }

  for (var i = 0; i < levelsLength; i++) {
    for (var j = 0; j < levels[i].length; j++) {
      var arr = findArrOfElNameInElMap(levels[i][j].last().idName, cpyElMap);
      for (var k = 0; k < levels[i][j].length - 1; k++) {
        levels[i][j][k] = findElInElMapArrAndReplace(levels[i][j][k], arr);
      }
    }
  }

  return levels;
}

function drawElementsMap(map, strMap) {

  function checkFigure(figure) {
    for (var i = 0; i < canvas.figures.data.length; i++) {
      if (figure.idName == canvas.figures.data[i].idName && isLogical(figure.idName)) {
        return true;
      }
    }
    return false;
  }

  var levels = stringLevelsToElementLevels(strMap, map);

  var startX = 150;
  var startY = 50;
  // for (var i = 0; i < map.length; i++) {
  //   var lastStr = map[i];
  //   lastStr[lastStr.length - 1].setPosition(startX, startY + 100);
  //   var addY = 0;
  //   for (var j = 0; j < lastStr.length - 1; j++) {
  //     lastStr[j].setPosition(startX, startY + addY);
  //     addY += 50;
  //   }
  //   startX += 100;

  // }
  var levelsLength = 0;
  for (var i in levels) {
    levelsLength++;
  }

  for (var i = 0; i < levelsLength; i++) {
    levels[i].reverse();
  }

  var x = startX;
  for (var i = 0; i < levelsLength; i++) {
    //level
    var y = startY;
    for (var j = 0; j < levels[i].length; j++) {
      //logic+var
      var nvar = 0;
      for (var k = 0; k < levels[i][j].length; k++) {
        if (levels[i][j][k].NAME == "LogicalFigure") {
          nvar = 0;
          canvas.add(levels[i][j][k], x, y);
        } else {
          canvas.add(levels[i][j][k], x - 90, y + nvar);
          nvar += 45;
        }
      }
      y += 100;
    }
    if (levels[i].length > 0)
      x += 150;
  }

  canvas.add(map[map.length - 1].last(), x, startY);

  var figures = canvas.figures.data;
  for (var i = 0; i < figures.length; i++) {
    figures[i].drawConnections();
  }
}