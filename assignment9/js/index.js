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

//function is run when the page has loaded.
$(function() {

  var xhr = new XMLHttpRequest(); // comment here

  xhr.onload = function() { // comment here
    // The following conditional check will not work locally - only on a server
    if (xhr.status === 200) { // comment here
      responseObject = JSON.parse(xhr.responseText); // comment here

      // comment here
      alert(responseObject[0].url);
      // comment here
      document.getElementById('content').innerHTML = newContent;

    }
  };

  xhr.open('GET', './assignment9/data/pieces.json', true); // comment here
  xhr.send(null);



  $(".draggable").draggable();

});
