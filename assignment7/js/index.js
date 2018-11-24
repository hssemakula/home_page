/*
File: https://hssemakula.github.io/home_page/assignment7/js/index.js
  Hillary Ssemakula
  hillary_ssemakula@student.uml.edu
  Student in COMP 4610 GUI PROGRAMMING I at UMass Lowell
  Created on 11/20/2018 for assignment No. 7 of the course.
  This is a JavaScript script that enables the dynamic creation
  of a multiplication table by the file https://hssemakula.github.io/home_page/assignment6/index.html.
  The function in this file is used by index.html for that purpose
*/



$(function() {

  //highlight erroneous textbox with red
  $.validator.setDefaults({
    errorClass: "text-danger", //sets error text to red
    highlight: function(element) { //when validation function is called on element, add bootstrap calss "alert-danger", colors it red
      $(element)
        .addClass('alert-danger');
    },
    unhighlight: function(element) {
      $(element)
        .removeClass('alert-danger');
    }
  });

  //custom validation method to test whether the value of an element is greater than that of a passed parameter
  $.validator.addMethod("greaterThanEqual", function(value, element, param) {
    var target = $(param);
    return parseInt(value) >= parseInt(target.val());
  }, "Please enter a greater value.");

  //custom validation method to test whether the value of an element is less than that of a passed parameter
  $.validator.addMethod("lessThanEqual", function(value, element, param) {
    var target = $(param);

    return parseInt(value) <= parseInt(target.val());
  }, "Please enter a lesser value.");

  $("#form").validate({

    //rules object: provides rules for validation
    rules: {
      hstart: {
        required: true,
        min: 1, //minimum number alllowed is 1, i.e no zeroes or negatives
        max: 1500, //maximum number alllowed is 1500
        lessThanEqual: "#hend" //custom validation called

      },
      hend: {
        required: true,
        min: 1,
        max: 1500,
        greaterThanEqual: "#hstart"

      },
      vstart: {
        required: true,
        min: 1,
        max: 1500,
        lessThanEqual: "#vend"

      },
      vend: {
        required: true,
        min: 1,
        max: 1500,
        greaterThanEqual: "#vstart"

      },
    },
    //messeges object: provides custom error messages for specific elements
    messages: {
      hstart: {
        required: "A starting value is required for the Horizontal axis",
        lessThanEqual: "This value <b> MUST </b> be less than or equal to the <b> Horizontal End Value </b>"

      },
      hend: {
        required: "An ending value is required for the Horizontal axis",
        greaterThanEqual: "This value <b> MUST </b> be greater than or equal to the <b> Horizontal Start Value</b>"

      },
      vstart: {
        required: "A starting value is required for the Vertical axis",
        lessThanEqual: "This value <b> MUST </b> be less than or equal to the <b> Verical End Value </b>"

      },
      vend: {
        required: "An end value is required for the Vertical axis",
        greaterThanEqual: "This value <b> MUST </b> be greater than or equal to the <b> Verical Start Value </b>"
      }

    },
    //when an invalid form (i.e a form with errors) is submitted, the code below erases the table div
    invalidHandler: function(event, validator) {
      $("#table").html("");
    },

    //Function that handles a valid form submitted: it constructs the table dynamically
    submitHandler: function() {

      var hstart = parseInt($("#hstart").val()); //The current value of the text boxes are extracted and converted into integers
      var hend = parseInt($("#hend").val()); //This avoids errors like when a user doesn't enter anything into the textbox
      var vstart = parseInt($("#vstart").val());
      var vend = parseInt($("#vend").val());
      var table_str; //string variable to be used to build up table.

      /*The table starts to be built. it is built as a div with class table. A table that is also dark, small, hovers and striped.
      All of these are classes in bootstrap, so it is assumed that the html has a link to bootstrap */
      table_str = "<div class= \"table-responsive-md\"><table class=\"table  table-dark table-bordered table-hover table-striped table-sm\">";

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


      $("#table").html(table_str); //set table div to bootstrap table that was constructed as string.

    }
  });


});
