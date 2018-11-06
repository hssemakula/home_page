/*
File: https://hssemakula.github.io/home_page/assignment6/js/index.js
  Hillary Ssemakula
  hillary_ssemakula@student.uml.edu
  Student in COMP 4610 GUI PROGRAMMING I at UMass Lowell
  Created on 11/5/2018 for assignment No. 6 of the course.
  This an index page that shows a dynamically created multplication table
  and provides links to previous assignments
*/
/* Initialize variables */
var hstart; //to store horizontal axis start
var hend; //to store horizontal axis end
var vstart; //to store vertical axis start
var vend; //to store vertical axis end
var table_str; //string variable to be used to build up table.
var table; //variable to store div element extracted from markup to later contain table


//Function that constructs the table dynamically
function getTable() {
  var warningFlag = 1; //flag variable used to toggle display warnings or display table.

  //All elements are extracted from html
  table = document.getElementById("table"); //extracts div where table shall be placed
  warning = document.getElementById("warning"); //extracts div where warnings shall be placed.
  hstart = parseInt(document.getElementById("hstart").value); //The current value of the text boxes are extracted and converted into integers
  hend = parseInt(document.getElementById("hend").value); //This avoids errors like when a user doesn't enter anything into the textbox
  vstart = parseInt(document.getElementById("vstart").value);
  vend = parseInt(document.getElementById("vend").value);

  /*The table starts to be built. it is built as a div with class table. A table that is also dark, small, hovers and striped.
  All of these are classes in bootstrap, so it is assumed that the html has a link to bootstrap */
  table_str = "<div class= \"table-responsive-md\"><table class=\"table  table-dark table-bordered table-hover table-striped table-sm\">";


  /*The code below checks for erroneous input. It is an if else if structure which checks
      for all possible errors before executing the construction of the table last if no errors are found
      In all if cases, if an error is found, table_str is replaced with a string that has a warning instead of
      an HTML table definition.
  */
  //If any textbox is empty on submit, it returns NaN, therefore all textbox variables are checked for that
  if (isNaN(hstart) || isNaN(vstart) || isNaN(hend) || isNaN(vend)) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "None of the text boxes can be empty: Try Again! </div></div>";
  } else if (hstart > hend) { //start number shouldn't be bigger than end number
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number is <b>NOT</b> bigger than the ending number for the <b> HORIZONTAL AXIS </b> </div></div>";

  } else if (hstart < 1) { //0 and negative numbers are not allowed as input
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (hend < 1) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> less than 1 </div></div>";
  } else if (hstart > 1500) { //The maximum number one can input is 1500, after that computations get ridiculously long
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the starting number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  } else if (hend > 1500) {
    table_str = "<div class=\"pt-2 \"><div class=\"alert alert-warning \" role=\"alert\">" +
      "Please make sure that the ending number for the <b> HORIZONTAL AXIS </b> is <b>NOT</b> greater than 1500 </div></div>";
  }
  //Apart from the else statement, the rest of the code below just tests the same conditions for the vertical axis as tested
  //above for the horizontalaxis.
  else if (vstart > vend) {
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
  }
  /* If the program gets here, then the user didnot input anything erroneous. Carry on with table_str( string) construction */
  else {
    var column; //To keep track of current column being defined in table
    var row; //To keep track of current column being defined in table
    var header = 1; //flag to tell whether current row is top row OR if current column is left-most column

    /* The gist of this double loop is:
        for all rows plus one, if current row is the first, make an empty cell and
          make a the rest of the cells blue while inserting in them the current column.
        If current row is not first row, then if first cell in row color it green and
          insert current row number, then fill the rest of the cells with column * row
          for the rest of the columns in that row. Very twisted, ey?
    */
    for (row = vstart - 1; row <= vend; row++) {
      if (header == 1) table_str += "<tr><td class=\"no-line  bg-transparent \">X</td>";
      else table_str += "<tr><td class=\"bg-success\">" + row + "</td>";

      for (column = hstart; column <= hend; column++) {
        if (header == 1) table_str += "<th class = \"bg-primary\">" + column + "</th>";
        else table_str += "<td>" + column * row + "</td>"; //every entry is enclosed with in <td> elements this creates a table cell
      }
      header = 0; //After first column and row set flag to 0, so that the rest of the cells are not colored.
      table_str += "</tr>"; //at the end of every row close the string with a <tr> tag because we are bulding a string that has html elements
    }

    table_str += "</table></div>"; //after double for-loop is done, table is built so close <table> and outer div elements
    warningFlag = 0; //set flag to indicate that we shall be displaying a table instead of warnings
  }

  //If no warnings, erase the warnings div because it might have previous warnings and fill div that holds table
  if (warningFlag == 0) {
    warning.innerHTML = "";
    table.innerHTML = table_str;
  }
  //else fill div that holds warnings and erase div that contains table, incase previous table had been drawn
  else {
    warning.innerHTML = table_str;
    table.innerHTML = "";
  }
}
