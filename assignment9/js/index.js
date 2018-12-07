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

var tilesRemaining = 100;
var json_data;

//function is run when the page has loaded.
$(function() {

      $.getJSON("./data/data.json", function(userData) {
          $(".draggable").attr('src', "");
          var tilesDrawn = 0;
          var currentImgToReplace = 1;
          while (tilesDrawn < 7 && tilesRemaining > 0) {
            var dataSize = parseInt(userData.length); //number of elements in json object
            var randomIndex = Math.floor(Math.random() * dataSize);



            if (parseInt(userData[randomIndex].value) > 0 && $("#" + currentImgToReplace).attr('src') === "") {
              $("#" + currentImgToReplace).attr('src', userData[randomIndex].src);
              userData[randomIndex].amount = parseInt(userData[randomIndex].amount) - 1;
              tilesDrawn += 1;
              tilesRemaining -= 1;
            }
          }
          }
        });

        $(".draggable").draggable();




      });

    function getTiles(tilesRemaining, json_data) {
      var tilesDrawn = 0;
      var currentImgToReplace = 1;
      while (tilesDrawn < 7 && tilesRemaining > 0) {
        var dataSize = parseInt(json_data.length); //number of elements in json object
        var randomIndex = Math.floor(Math.random() * dataSize);



        if (parseInt(json_data[randomIndex].value) > 0 && $("#" + currentImgToReplace).attr('src') === "") {
          $("#" + currentImgToReplace).attr('src', json_data[randomIndex].src);
          json_data[randomIndex].amount = parseInt(json_data[randomIndex].amount) - 1;
          tilesDrawn += 1;
          tilesRemaining -= 1;
        }




      }

    }
