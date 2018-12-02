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

  //This function attaches multiple keyboard events to every input element on the page. i.e.
  //when the value of the input textbox is changed by anything otherthan the slider, the current input's parent is found
  //the parent searches for it's slider, and the slider's value is changed to that of the textbox
  $("input").on("change paste cut paste keyup keydown", function() {
    $(this).parent().prev().slider('value', $(this).val()); //two way binding completed here
    if ($("#form").valid()) drawTable(); //table drawn if current form validation is successful
  });

  $("#tableTab").tabs(); //the tabs function for creating tabs in the future is invoked on the empty div with id tableTab
  $("#tableTab").hide(); //The div is hidden here because there is no content as of now.

  //a click event is attached to the div with id buttons. but it is specifically
  //set to listen for clicks on the element with id delete within the div.
  //This is because at first such an element does not exist. So an error would occur if we tried to attach the listener directly.
  $("#buttons").on("click", "#delete", function() {
    removeAllTabs(); //function removeAllTabs called.
    $("#delete").remove(); //delete button(i.e itself is removed.)
  });


  /*The on method attaches a click event to every element that has class closeTab.
  Basically, I create all tabs with a button with such a class. The handler function.
  gets the the href attribute of it's parent. Remember the parent is the li element and each specific li
  href points to a specific div that has the content that is displayed as a tab. Since the href is in the form
  #id it can easily be queried to find what div it points to
  */
  $("#tableTab").on("click", ".closeTab", function() {
    var tabIdToRemove = $(this).parent().attr('href');

    //if div has no neihgbours then it is the last tad, delete everything by calling removeAllTabs();
    //this if works because for all direct children of tableTabs, only content divs(i.e used for tabs) have IDS, the ul doesn't have one.
    if (typeof($(tabIdToRemove).next().attr('id')) == "undefined" && typeof($(tabIdToRemove).prev().attr('id')) == "undefined") {
      removeAllTabs();
      $("#delete").remove(); //remove the Deletealltabs button
    } else if (typeof($(tabIdToRemove).next().attr('id')) == "undefined") {
      //if div has neighbor to the left, then make that neighbor active before you delete current div
      savedTableCounter -= 1; //decrement number of saved tabs
      if (savedTableCounter == 1) $("#delete").remove(); //if only one tab left remove Deletealltabs button


      //get current active tab index and decrement (i.e becomes left neighbor index)
      var prevID = parseInt($("#tableTab").tabs("option", "active") - 1);
      $("#tableTab").tabs("option", "active", prevID); //make neighbor active
    } else {
      //All code below is opposite of code above(i.e make right neighbor active)
      savedTableCounter -= 1;
      if (savedTableCounter == 1) $("#delete").remove();


      var nextID = parseInt($("#tableTab").tabs("option", "active") + 1);
      $("#tableTab").tabs("option", "active", nextID);


    }

    $(tabIdToRemove).remove(); //using content div id obtained, remove the content for the tab.
    $(this).parent().parent().remove(); //remove the tab header, itself i.e the parent to the parent of the clicked button i.e remove <li> <a> <button></button></a></li>
    $("#tableTab").tabs("refresh"); //this refresh helps the tabs to be redrawn properly and updates number of elements after remove otherwise random null errors occur
  });


  /* PREVIOUS VALIDATION CODE */
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

    //The SAVE button is the submit button. once this is clicked and the form is valid, the saveTable() method is called
    submitHandler: function() {
      if (($("#table").html()).trim() != "") saveTable(); //calls the sa
    }
  });


});

/*This the Function that constructs the html for the table  and send it to an empty div*/
function drawTable() {
  //The current value of the text boxes are extracted and converted into integers
  //This avoids errors like when a user doesn't enter anything into the textbox
  var hstart = parseInt($("#hstart").val()); //extract horizotal start value
  var hend = parseInt($("#hend").val()); //extract horizotal end value
  var vstart = parseInt($("#vstart").val()); //extract vertical start value
  var vend = parseInt($("#vend").val()); //extract vertical end value
  var table_str; //string variable to be used to build up table.

  /*The table starts to be built. it is built as a div with class table. A table that is also dark, small, hovers and striped.
  All of these are classes in bootstrap, so it is assumed that the html has a link to bootstrap */
  table_str = "<div class= \"table-responsive-md\"><table class=\"table  table-dark table-bordered table-hover table-striped table-sm\">";

  var column; //To keep track of current column being defined in table
  var row; //To keep track of current column being defined in table
  var header = 1; //flag to tell whether current row is top row OR if current column is left-most column

  //if sliders/textboxes are all at 0 draw nothing
  if (hstart == 0 && hend == 0 && vstart == 0 && vend == 0) {
    $("#table").html(""); //erase table
    return;
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

/* This is the Function that saves the table */
function saveTable() {
  if (savedTableCounter == 0) $("#tableTab").show(); //start by unhiding the div that will hold the tabs. This is only done if no saved tables exist.
  var table_str = $("#table")[0].outerHTML; //get the html in the div with id table. when all sliders/textboxes are not zero, there is always a table, since it's drawn dynamically
  table_str = table_str.replace("id=\"table\"", ""); //remove previous table id, so as not to confuse the script because original table still has that id
  //remove previous bootstrap formatting and add formatting suitable for content in a tab
  table_str = table_str.replace("container-fluid text-white text-center col-lg-4 pb-2", "text-white text-center col-md-8 mx-auto");

  //place table html in a div with an id equal to the value of savedTableID. this is later used when setting up tabs.
  //This is the content div that the li tabs will reference using an id.
  $("#tableTab").append("<div id=\"" + savedTableID + "\">" + table_str + "</div>");

  //In the html a UL element already exists within the tableTab div. append an li element
  //that points to the above div that was created. within the li there is an anchor tag.
  //this bears the href to the above div. the a tag also has a bootstrap styled button with class closeTab
  //used later to close the specific tab it is a child of.
  $("#tableTab ul").append("<li> <a href = \"#" + savedTableID + "\"> H(" +
    $("#hstart").val() + "," + $("#hend").val() + ") " + "V(" +
    $("#vstart").val() + "," + $("#vend").val() + ") <button type=\"button\" class=\"btn btn-sm text-muted ml-5 closeTab\">x</button></a></li>");

  $("#tableTab").tabs("refresh"); //as usual refresh tab so css can be drawn well.
  $("#tableTab").tabs("option", "active", savedTableCounter); //make the just-created tab active i.e open it
  savedTableID += 1; //increment ID
  savedTableCounter += 1; //increment counter. difference between these two is savedTableID is only reset/decremented when all tabs are deleted

  //when there are two saved tables(or more). A button to delete multiple tables is provided. it has id "delete"
  if (savedTableCounter == 2)
    $("#buttons").append("<button type=\"button\" class=\"btn btn-danger form-control-lg ml-3\" id=\"delete\">DELETE ALL TABS</button>");
}

/*This function deletes all tabs */
function removeAllTabs() {
  $('div#tableTab ul li').remove(); //remove all li elements within a ul element within a div whose id is "tableTab"
  $('div#tableTab div').remove(); //remove all content divs
  $("#tableTab").tabs("refresh"); //redraw the tabs widget.
  $("#tableTab").hide(); //hide it so that it doesn't just leave an empty div on the screen
  savedTableID = 0; //reset all ids and counters
  savedTableCounter = 0;
}
