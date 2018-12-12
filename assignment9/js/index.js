/*
File: https://hssemakula.github.io/home_page/assignment8/js/index.js
  Hillary Ssemakula
  hillary_ssemakula@student.uml.edu
  Student in COMP 4610 GUI PROGRAMMING I at UMass Lowell
  Created on 11/29/2018 for assignment No. 9 of the course.
  This is a JavaScript script that enables the dynamic functionality
  of the Row Scrabble defined by the file https://hssemakula.github.io/home_page/assignment9/index.html.
*/
var json; //object to store json object that will be extracted from data.json
var tilesRemaining = 100; //variable to keep count of the tiles remaining
var currentWordArray = ["", "", "", "", "", "", ""]; //array of single character Strings: keeps track of the word spelled on the scrabble board
var isVacant = [true, true, true, true, true, true, true]; //array of boolean values:keeps track of which slot the scrabble board has a tile or not.
var currentScore = [0, 0, 0, 0, 0, 0, 0]; //array of integers: keeps track of the values of the tiles in each slot on the scrabble board.
var totalScore = 0; //keeps track of the total score

//getJSON method, used here because XMLHttpRequest() was denied access to the json file through https://hssemakula.github.io/home_page/assignment9/data/data.json
$.getJSON("./data/data.json", function(userData) {
  json = userData;
});

//function is run when the page has loaded.
$(function() {
  $(".draggable").data("onSlot", -1); //initialize all tiles to indicate that they are not on the board at any slot(-1)

  attachDraggableAbility();


  $(".draggable").attr("src", ""); //clear all src attributes of img elements with class draggable
  $("#tileCount").html(tilesRemaining); //update label that shows number of tiles remaining
  $("#currentWord").html(""); //clear the current word.
  getTiles(json); //draw the first 7 tiles by calling the getTiles function with the json object




  $(".droppable").droppable({ //make all slots on the scrabble board droppable.
    /*  Accept function: recieves a draggable tile and checks if the slot associated with it
    is empty. if it is the draggble can be accepted */
    accept: function(tile) {
      var slot_index = parseInt($(this).attr("id")) - 10;
      if (isVacant[slot_index]) return true;
      else return false;
    },
    /* drop function: when a draggable is dropped, the index of this slot is calculated
     the weight of this slot is calculated i.e. some slots carry double the amount of the letter
     The letter that has been dropped is extracted.
          the dropped tile's onSlot index is changed to the current slot's index.
          The word on the board is updated using the extracted letter and the score is updated likewise.
          */
    drop: function(event, ui) {
      var slot_index = parseInt($(this).attr("id")) - 10; //this slot's index
      var slot_weight = $(this).find("img").attr("src").charAt(13) == "r" ? 1 : 2;
      var tile = ui.draggable;
      var imgLetter = tile.attr("src").charAt(15)
      var previous_slot_index = tile.data("onSlot");

      if (!(previous_slot_index == -1)) {
        isVacant[previous_slot_index] = true;
        removeSlotScore(previous_slot_index);
        updateWord("", previous_slot_index);
      }

      tile.data("onSlot", slot_index); //update tile position
      isVacant[slot_index] = false; //indicate current slot is now full
      updateWord(imgLetter, slot_index); //update word displayed
      updateSlotScore(imgLetter, json, slot_weight, slot_index); //update score for slot.
      showCurrentScore(); //show current score for letters on board.

      //In order for the tile to snap onto the board beautifully, the position function is used.
      tile.position({
        my: "center", //put draggable to droppable's center
        at: "center",
        of: $(this),
        using: function(pos) {
          $(this).animate(pos, "fast", "linear"); //animate the repostioning.
        }

      });
    }


  });


  $("#tile-rack").droppable({
    drop: function(event, ui) {
      var tile = ui.draggable;
      var previous_slot_index = tile.data("onSlot");

      if (!(previous_slot_index == -1)) {
        isVacant[previous_slot_index] = true;
        removeSlotScore(previous_slot_index);
        updateWord("", previous_slot_index);
      }

      tile.data("onSlot", -1);
      showCurrentScore(); //show current score for letters on board.


    }
  });

  $("#swap").click(function() {
    swapTiles(json);
  });

  $("#next-word").click(function() {
    nextWord();
  });



});

function attachDraggableAbility() {
  //make all elements with class draggable, draggable.(i.e. tiles.)
  $(".draggable").draggable({

    //VERY IMPORTANT REVERT FUNCTION: enables tile to stick only to rack or board
    revert: function(droppableReceiver) {

      if (droppableReceiver === false) { //if false then no droppable object was available to receive draggable
        //revert the postion of the draggable back
        return true;
      } else {
        //some droppable object received the draggable
        //Check if the droppable object that received draggable is either tile-rack or a slot on the board
        if (droppableReceiver.attr('id') == "tile-rack" || droppableReceiver.hasClass("droppable")) return false; //return false so that draggable tile doesn't revert back to original position
        else return true; //else droppable that received draggable is undesired, revert back to original position.
      }
    }, //this ensures that if tile is not dropped at droppable object, it reverts back to its original position
    stack: ".draggable", //ensures that tile being dragged is always on top
    scroll: "false",
    containment: "#body-div" //keep draggable from scrolling off screen.
  }); //make all images with class "draggable", draggable.
}
/* This function gets 7 tiles from the tile rack. */
function getTiles(json_data) {
  $(".draggable").data("onSlot", -1); //initialize all tiles to indicate that they are not on the board at any slot(-1)

  var tilesDrawn = 0; //number of tiles currently drawn from rack
  var currentImgToReplace = 1; //id number of image to replace on page
  var dataSize = parseInt(json_data.length); //number of elements in json object

  /* This is a while loop that keeps relacing the src of the img tag of an image on the page whose
  ID is  "currentImgToReplace" with the src field of a randomly chosen object in the json object passed.
  This loop has only terminates if 7 src attributes have been cahnged(7 tiles drawn) or if there are no
  more tiles(tilesRemaining == 0). OR if both condition sfail.

  */
  while (tilesDrawn < 7 && tilesRemaining > 0) {

    //This line of code returns a random number between 0 and 1 - size of the json object passed.
    //this acts as a random index to choose a random letter and is regenerated on every loop iteration.
    var randomIndex = Math.floor(Math.random() * dataSize);

    /*This If statement takes care of updating values. i.e it updates the number of tiles drawn,
    the number of times Remaining, the amount of a certain letter left and the next IMG tag to be cahnged.
    it is only executed if the current letter chosen randomly doesn't have an amount of 0 and the current IMG tag to be replaced
    has not already been replaced
    */
    if (parseInt(json_data[randomIndex].amount) > 0 && $("#" + currentImgToReplace).attr('src') === "") {
      $("#" + currentImgToReplace).attr('src', json_data[randomIndex].src);
      json_data[randomIndex].amount = parseInt(json_data[randomIndex].amount) - 1;
      tilesDrawn = tilesDrawn + 1;
      tilesRemaining = tilesRemaining - 1;
      currentImgToReplace = currentImgToReplace + 1;
      $("#tileCount").html(tilesRemaining); //update label showing number of tiles remaining
    } else if (!($("#" + currentImgToReplace).attr('src') === "")) {
      tilesDrawn = tilesDrawn + 1; //if src attribute is not empty then count a tile(i.e the rack has a tile)
      currentImgToReplace = currentImgToReplace + 1;
    }
  }

}

/* This function swaps the tiles on the rack for others. */
function swapTiles(json_data) {
  var dataSize = parseInt(json_data.length); //number of elements in json object
  var currentImgToReplace = 1; //id number of image to replace on page
  for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
    alert($("#" + currentImgToReplace).data("onSlot"));
    if (!($("#" + currentImgToReplace).data("onSlot") === -1)) {
      continue;
    }

    var letterToSwap = $("#" + currentImgToReplace).attr('src').charAt(15);

    json_data.forEach(function(element) {
      if (element.letter === letterToSwap) {
        element.amount = element.amount + 1;
      }
    });

    var randomIndex = Math.floor(Math.random() * dataSize);
    while (parseInt(json_data[randomIndex].value) <= 0) {
      randomIndex = Math.floor(Math.random() * dataSize);
    }

    json_data[randomIndex].amount = json_data[randomIndex].amount - 1;
    $("#" + currentImgToReplace).attr('src', json_data[randomIndex].src);
  }
}

//This function clears the rack and board, updates total score.
function nextWord() {
  currentScore.forEach(function(element) {
    totalScore = totalScore + element;
  });

  var currentImgToReplace = 1;
  for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
    var image = $("#" + currentImgToReplace);
    if (!(image.data("onSlot") === -1)) {
      var previous_slot_index = image.data("onSlot");
      isVacant[previous_slot_index] = true;
      removeSlotScore(previous_slot_index);
      updateWord("", previous_slot_index);

      var oldimgID = image.attr('id');
      image.remove();
      var newImg = "<img id=" + oldimgID + " class=\"m-2 draggable\" src=\"\" height=\"100\" />"
      $(newImg).appendTo("#tile-rack");
      tilesRemaining = tilesRemaining - 1;
      $("#tileCount").html(tilesRemaining);
      //  $("#tile-rack").load(location.href + " #tile-rack");
    }
  }

  showCurrentScore();
  getTiles(json);
  $("title-rack").html($("#tile-rack").html());
  attachDraggableAbility();


}


function updateWord(letter, slot_index) {

  currentWordArray[slot_index] = letter;
  var word = "";
  var i;
  for (i = 0; i < currentWordArray.length; i++) {
    word = word + "" + currentWordArray[i];
  }
  $("#currentWord").html(word);

  if (letter === "b") {}
}

function updateSlotScore(letter, json_data, slot_weight, slot_index) {
  var i;
  for (i = 0; i < json_data.length; i++) {
    if (json_data[i].letter === letter) {
      currentScore[slot_index] = (parseInt(json_data[i].value) * slot_weight);
      break;
    }
  }
}

function removeSlotScore(slot_index) {
  currentScore[slot_index] = 0;

}

function showCurrentScore() {
  var i;
  var scoreToShow = 0;
  for (i = 0; i < currentScore.length; i++) {
    scoreToShow = scoreToShow + currentScore[i];
  }
  $("#total-score").html(totalScore + scoreToShow);
  $("#current-score").html(scoreToShow);
}
