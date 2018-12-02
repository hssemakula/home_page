/*
File: https://hssemakula.github.io/home_page/assignment8/js/index.js
  Hillary Ssemakula
  hillary_ssemakula@student.uml.edu
  Student in COMP 4610 GUI PROGRAMMING I at UMass Lowell
  Created on 11/29/2018 for assignment No. 8 of the course.
  This is a JavaScript script that enables the dynamic creation
  of a multiplication table by the file https://hssemakula.github.io/home_page/assignment8/index.html.
  The function in this file is used by index.html for that purpose
*/

var savedTableID = 0; //to provide id's for table tabs.
var savedTableCounter = 0; //to store number of tables saved.

//function is run when the page has loaded.
$(function() {

  //This function creates a slider for every div with a class "slider". animate makes the slider slide smoothly
  $(".slider").slider({
    max: 20,
    min: 0,
    animate: true,
    slide: function(event, ui) {
      //This listener attached to the slide attribute makes slider find it's parent
      //The parent has 3 elements, a label, a slider and a div with an input.
      //find is executed on parent to find the input and the value of the input is changed to the slider's value.
      $(this).parent().find("input").val(ui.value); //one-way binding achived here
      if ($("#form").valid()) drawTable(); //table drawn if current form validation is successful
    }
  });

  //This function attaches the keyup listener to every input element on the page. i.e.
  //when a key is pressed while in an input textbox, the current input's parent is found
  //the parent searches for it's slider, and the slider's value is changed to that of the textbox
  $("input").keyup(function() {
    $(this).parent().prev().slider('value', $(this).val()); //two way binding completed here
    if ($("#form").valid()) drawTable(); //table drawn if current form validation is successful
  });

  $("#tableTab").tabs(); //the tabs function for creating tabs in the future is invoked on the empty div with id tableTab
  $("#tableTab").hide(); //The div is hidden here because there is no content as of now.

  //a click listener is attached to the div with id buttons. but it is specifically
  //set to listen for clicks on the element with id delete within the div.
  //This is because at first such an element does not exist. So an error would occur if we tried to attach the listener directly.
  $("#buttons").on("click", "#delete", function() {
    removeAllTabs(); //function removeAllTabs called.
    $("#delete").remove(); //delete button(i.e itself is removed.)
  });


  $("#tableTab").on("click", ".closeTab", function() {
    var tabIdToRemove = $(this).parent().attr('href');

    if (typeof($(tabIdToRemove).next().attr('id')) == "undefined" && typeof($(tabIdToRemove).prev().attr('id')) == "undefined") {
      removeAllTabs();
      $("#delete").remove();
    } else if (typeof($(tabIdToRemove).next().attr('id')) == "undefined") {
      savedTableCounter -= 1;
      if (savedTableCounter == 1) $("#delete").remove();
      //alert("PREVIOUS ==> "+$(tabIdToRemove).prev().html());

      var prevID = parseInt($("#tableTab").tabs("option", "active") - 1);
      $("#tableTab").tabs("option", "active", prevID);
    } else {
      savedTableCounter -= 1;
      if (savedTableCounter == 1) $("#delete").remove();
      //  alert("NEXT ==> "+$(tabIdToRemove).next().html());

      var nextID = parseInt($("#tableTab").tabs("option", "active") + 1);
      alert(nextID);
      $("#tableTab").tabs("option", "active", nextID);


    }

    $(tabIdToRemove).remove();
    $("#tableTab").tabs("refresh");
    //alert($(this).parent().parent().html());
    $(this).parent().parent().remove();
  });



  //highlight erroneous textbox with red
  $.validator.setDefaults({
    errorClass: "pl-3 text-danger", //sets error text to red
    highlight: function(element) { //when validation function is called on element, add bootstrap calss "alert-danger", colors it red
      $(element)
        .addClass('alert-danger');
    },
    unhighlight: function(element) {
      $(element)
        .removeClass('alert-danger');
    },
    errorPlacement: function(error, element) { //because text input is smaller now put errow within form element div but outside text input  div
      error.insertAfter(element.parent());
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
        min: 0, //minimum number alllowed is 0, i.e no negatives
        max: 20, //maximum number alllowed is 1500
        lessThanEqual: "#hend" //custom validation called

      },
      hend: {
        required: true,
        min: 0,
        max: 20,
        greaterThanEqual: "#hstart"

      },
      vstart: {
        required: true,
        min: 0,
        max: 20,
        lessThanEqual: "#vend"

      },
      vend: {
        required: true,
        min: 0,
        max: 20,
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
      if (($("#table").html()).trim() != "") saveTable();
    }
  });


});

function drawTable() {
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

  if (hstart == 0 && hend == 0 && vstart == 0 && vend == 0) {
    $("#table").html(""); //erase table
    return; //if sliders are all at 0 draw nothing
  }

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

function saveTable() {
  $("#tableTab").show();
  var table_str = $("#table")[0].outerHTML;
  table_str = table_str.replace("id=\"table\"", "");
  table_str = table_str.replace("container-fluid text-white text-center col-lg-4 pb-2", "text-white text-center col-md-8 mx-auto");


  $("#tableTab").append("<div id=\"" + savedTableID + "\">" + table_str + "</div>");

  $("#tableTab ul").append("<li> <a href = \"#" + savedTableID + "\"> H(" +
    $("#hstart").val() + "," + $("#hend").val() + ") " + "V(" +
    $("#vstart").val() + "," + $("#vend").val() + ") <button type=\"button\" class=\"btn btn-sm text-muted ml-5 closeTab\">x</button></a></li>");

  $("#tableTab").tabs("refresh");
  $("#tableTab").tabs("option", "active", savedTableCounter);
  //("#tableTab").tabs("option", "active")
  savedTableID += 1;
  savedTableCounter += 1;
  if (savedTableCounter == 2)
    $("#buttons").append("<button type=\"button\" class=\"btn btn-danger form-control-lg ml-3\" id=\"delete\">DELETE ALL TABS</button>");
}

function removeAllTabs() {
  $('div#tableTab ul li').remove();
  $('div#tableTab div').remove();
  $("#tableTab").tabs("refresh");
  $("#tableTab").hide();
  savedTableID = 0;
  savedTableCounter = 0;
}
