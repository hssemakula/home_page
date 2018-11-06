var hstart;
var hend;
var vstart;
var vend;
var table_str;
var table;


function getTable() {
  var warningFlag = 1;
  table = document.getElementById("table");
  warning = document.getElementById("warning");
  hstart = parseInt(document.getElementById("hstart").value);
  hend = parseInt(document.getElementById("hend").value);
  vstart = parseInt(document.getElementById("vstart").value);
  vend = parseInt(document.getElementById("vend").value);
  table_str = "<div class= \"table-responsive-md\"><table class=\"table  table-dark table-bordered table-hover table-striped table-sm\">";


  if (isNaN(hstart) || isNaN(vstart) || isNaN(hend) || isNaN(vend)) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "None of the text boxes can be empty: Try Again! </div></div>";
  } else if (hstart > hend) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number is <b>NOT</b> bigger than the ending number for the <b> HORIZONTAL AXIS </b> </div></div>";

  } else if (hstart < 1) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (hend < 1) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (hstart > 1500) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  } else if (hend > 1500) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  } else if (vstart > vend) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number is <b>NOT</b> bigger than the ending number for the <b> VERTICAL AXIS </b> </div></div>";

  } else if (vstart < 1) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> VERTICAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (vend < 1) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> VERTICAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (vend > 1500) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> VERTICAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  } else if (vstart > 1500) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> VERTICAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  } else {
    var column;
    var header = 1;
    var row;

    for (row = vstart - 1; row <= vend; row++) {
      if (header == 1) table_str += "<tr><td class=\"no-line  bg-transparent \">X</td>";
      else table_str += "<tr><td class=\"bg-success\">" + row + "</td>";

      for (column = hstart; column <= hend; column++) {
        if (header == 1) table_str += "<th class = \"bg-primary\">" + column + "</th>";
        else table_str += "<td>" + column * row + "</td>";
      }
      header = 0;
      table_str += "</tr>";
    }

    table_str += "</table></div>";
    warningFlag = 0;
  }

  if (warningFlag == 0) {
    warning.innerHTML = "";
    table.innerHTML = table_str;
  } else {
    warning.innerHTML = table_str;
    table.innerHTML = "";
  }
}
