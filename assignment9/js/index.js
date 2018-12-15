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
var dictionary; // object to store dictionary data that is parsed from dict.json.
var tilesRemaining = 100; //variable to keep count of the tiles remaining
var currentWordArray = ["", "", "", "", "", "", ""]; //array of single character Strings: keeps track of the word spelled on the scrabble board
var isVacant = [true, true, true, true, true, true, true]; //array of boolean values:keeps track of which slot the scrabble board has a tile or not.
var currentScore = [0, 0, 0, 0, 0, 0, 0]; //array of integers: keeps track of the values of the tiles in each slot on the scrabble board.
var totalScore = 0; //keeps track of the total score
var isValidWord = false; //keeps track of whether the current word is a valid word or not

/***************dialog flags*************/
var showBlankTileWarning = false; //flag used to show blank-tile-dialog only once.
var invalidSubmitAttempts = 0; //counter for every time user clicks next word and submission is invalid word.
var swapCount = 0; //counter for how many times user swaps out tiles.
var resultsString = "<h5 class=\"mt-2 text-center pt-2\"> RESULTS </h5><br>"; //string variable to show results at the end.
var wordToSubmitt = ""; //var to store the word submitted.

/*getJSON method, used here because XMLHttpRequest() was denied access to the json file through https://hssemakula.github.io/home_page/assignment9/data/data.json
  The following AJAX functions do the same thing for different files.
  The first parses the letters, their amounts, value and images as a json object in JavaScript
  The second parses all of the words in dict.json as a dictionary of words: with keys as letters and an array
  of all possible words beginning with that letter as the value.
*/
$.getJSON("./data/data.json", function(userData) {
  json = userData;
});
$.getJSON("./data/dict.json", function(data) {
  dictionary = data;
});


//function run when page is loaded.
$(function() {

  /*-----------------------------------DRAGGABLE CODE---------------------------------------------*/
  $(".draggable").data("onSlot", -1); //initialize all tiles to indicate that they are not on the board at any slot i..e all of them are on slot -1
  attachDraggableAbility(); //This function initializes all elements with the class draggable as draggable objects.
  $(".draggable").attr("src", ""); //initialize all draggable images to be used as tile images by clearing their src attributes.
  $("#tileCount").html(tilesRemaining); //update label that shows number of tiles remaining
  $("#currentWord").html(""); //clear the current word.
  getTiles(json); //draw the first 7 tiles by calling the getTiles function with the json object



  /*----------------------------------------------DROPPABLE CODE--------------------------------------*/
  $(".droppable").droppable({ //all html images that represent the scrabble board have the class droppable so innitialize them as droppable

    /*  Accept function: droppable recieves a draggable tile and checks if its slot(i.e in the isVacant array)
    is empty. if it is, the draggable is accepted otherwise it is rejected. */
    accept: function(tile) {
      var slot_index = parseInt($(this).attr("id")) - 10; //calculate this slot's index
      if (tile.attr("src").charAt(16) != "." && showBlankTileWarning == false) //if user attempts to move originally blank tile, warn that it can't be returned to rack(only once.)
      {
        $("#blank-tile-return-dialog").dialog("open");
        showBlankTileWarning = true;
      }
      if (isVacant[slot_index]) return true; //reject if not vacant
      else return false;
    },
    /* drop function: when a draggable is dropped, the index of this slot is calculated
     the weight of this slot is calculated i.e. some slots carry double for the score of the letter's value
     The string value of the letter that has been dropped is extracted.
          the dropped tile's onSlot index is changed to the current slot's index(to indicate that letter is now on this droppable)
          The word on the board is updated using the extracted letter string and the score is updated likewise.
          */
    drop: function(event, ui) {
      var slot_index = parseInt($(this).attr("id")) - 10; //this this slot's index
      var slot_weight = $(this).find("img").attr("src").charAt(13) == "r" ? 1 : 2; //to dertermine whether slot is bonus slot
      var tile = ui.draggable; //this is the object representing the tile that was dropped here.
      var imgLetter = tile.attr("src").charAt(15); //this is the extracted string value of the letter that was dropped here
      var previous_slot_index = tile.data("onSlot"); //this is the slot that the tile was dragged from(-1 if from rack)

      //In order for the tile to snap onto the board beautifully, the position function is used.
      tile.position({
        my: "center", //put draggable to droppable's center
        at: "center",
        of: $(this),
        using: function(pos) {
          $(this).animate(pos, "fast", "linear"); //animate the repostioning.
        }
      });


      /*TEST IF BLANK TILE WAS DROPPED HERE
        test for 0.png so that when blank is assigned letter, this test becomes false and user cant change letter.
        if blank tile was dropped add class to show this tile wont be swapped at rack. and make user choose letter.
        blank tile is identified by it's source image which is a number i.e 0.png
      */
      if (tile.attr("src").substring(15, 20) == "0.png") {
        tile.addClass("blank");
        $("#blank-tile-dialog").dialog("open"); //open dialog to choose letter
      }

      /* UPDATE THE TILE'S DATA IF TILE HAS BEEN DRAGGED FROM ANOTHER SLOT ON BOARD.
        Every tile that was on rack displays an onSlot value of -1. if this test fails
        then tile came from another slot on the board.
      */
      if (!(previous_slot_index == -1)) {
        isVacant[previous_slot_index] = true; //clear the the slot where this draggable came from.
        removeSlotScore(previous_slot_index); //remove the score for the previous slot.
        updateWord("", previous_slot_index); //display changes on the game be clearing the string at previos slot
      }

      /* UPDATE CURRENT SLOT AND DROPPABLE DATA */
      tile.data("onSlot", slot_index); //indicate that draggable is on this droppable by changing it's onSlot value to this droppable's index
      isVacant[slot_index] = false; //indicate current droppable slot is now full and can't accept any other draggables.
      //If tile dropped was blank The letter that user chooses has to be calculated.
      //blank tiles have names like 0L.png so to extract the letter choses we take charAT(16) instead of 15 as usual
      if (tile.hasClass("blank"))
        updateWord(tile.attr("src").charAt(16), slot_index);
      else //else update word displayed using character that was extracted at index 15
        updateWord(imgLetter, slot_index);
      updateSlotScore(imgLetter, json, slot_weight, slot_index); //update individual score for slot.
      showCurrentScore(); //show current score for letters on board to user.
    }


  });

  /* TILE RACK DROPPABLE */
  $("#tile-rack").droppable({
    /* Accept function: checks if the incoming tile is blank(i.e. has class blank added to it)
      Rejects if it is the case otherwise accepts other draggables.
    */
    accept: function(tile) {
      if (tile.hasClass("blank")) { //if tile is a blank tile then it can't be dropped here again.
        return false;
      } else return true;
    },
    /* Tile rack drop function: updates the dropped draggable's onSlot value to -1
        to show that tile is now not on any slot on the board.
    */
    drop: function(event, ui) {
      var tile = ui.draggable; //get the tile as a jquery object
      //extract the slot index of the slot it was on
      //this works because at this point it hasn't been updated and draggable still thinks it's on the board.
      var previous_slot_index = tile.data("onSlot");

      /* If onSlot returns -1, then draggable was merely displaced on the rack but didn't came from a slot on the
      board. Otherwise clear the index of the slot the draggable came from to mark it a empty for any other draggables.
      update the word being displayed and the current score.
      */
      if (!(previous_slot_index == -1)) {
        isVacant[previous_slot_index] = true;
        removeSlotScore(previous_slot_index);
        updateWord("", previous_slot_index);
      }

      tile.data("onSlot", -1); //lastly make the onSlot value of the draggable -1 to show that it is on rack now.
      showCurrentScore(); //show current score for letters on board.
    }
  });

  /*-------------------------------------------CLICK LISTENERS AND UI DIALOGS ---------------------*/
  $("#swap").click(function() {
    swapTiles(json); //call swapTiles() function when the SWAP button is clicked.
  });

  $("#next-word").click(function() {
    nextWord(); //call nextWord() function when the NEXT WORD button is clicked.
  });

  // this initializes the dialog (and uses some common options that I do)
  $("#blank-tile-dialog").dialog({
    autoOpen: false,
    modal: true,
    show: "blind",
    hide: "blind",
  });

  $(".ui-dialog-titlebar").hide(); //hide dialog title(The thing is ugly).

  $(".blank-tile").click(function() {
    var currentImgToReplace = 1;
    for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
      img = $("#" + currentImgToReplace);
      if (img.attr("src").substring(15, 20) == "0.png" && img.data("onSlot") != -1) { //if blank symbol and not on tile rack change letter to one with 0 score.
        img.attr("src", $(this).attr("src"));
        $("#blank-tile-dialog").dialog("close"); //close dialog to choose letter
        var slotWhereTileIs = img.data("onSlot"); //now we have to update the word. even though the score is zero. can only be effeciently done here
        updateWord(img.attr("src").charAt(16), slotWhereTileIs);
        showCurrentScore();
        break;

      }
    }
  });

  $("#word-not-found").hide(); //at first hide the indicator that word is inavlid.
  $("#give-up2").hide(); //hide give up button at first

  $("#invalid-word-submit-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 350,
    show: "blind",
    hide: "blind",
  });




  $("#blank-tile-return-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 400,
    show: "blind",
    hide: "blind",
  });



  $("#cant-swap-tile-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 400,
    show: "blind",
    hide: "blind",
  });



  $("#no-tiles-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 400,
    show: "blind",
    hide: "blind"
  });



  $("#help-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 900,
    show: "blind",
    hide: "blind"
  });



  $("#winner-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 350,
    show: "blind",
    hide: "blind"
  });

  $("#end-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 350,
    show: "blind",
    hide: "blind"
  });

  $(".ui-dialog-titlebar").hide(); //hide dialog title(The thing is ugly).

  $(".give-up").click(function() { //whenever a button with class give-up is clicked.
    if ($(this).attr("id") != "give-up2") $(this).parent().parent().dialog("close"); //if button clicked was on a dialog, first close that dialog
    resultsString = resultsString + "<br> <div class=\"col-md row text-success h4\"> TOTAL SCORE:   " + totalScore + "</div>";
    $("#results").html(resultsString);
    $("#end-dialog").dialog("open");
  });

  $("#help").click(function() { //whenever the help button is clicked, show help dialog
    $("#help-dialog").dialog("open");
  });

  $(".ok").click(function() { //whenever an ok button is clicked, close the dialog associated with it.
    $(this).parent().parent().dialog("close");
  });

  $(".reset").click(function() { //whenever a reset button is clicked reload page.
    location.reload();
  });

  $(".exit").click(function() { //whenever an exit button is clicked go to end dialog
    $(this).parent().parent().dialog("close");
    $("#end-dialog").dialog("open");
  });





  /***********************END OF LOADING FUNCTION ************************/
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


  var currentImgToReplace = 1; //id number of image to replace on page
  var dataSize = parseInt(json_data.length); //number of elements in json object

  for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {

    if (gameOver() && tilesRemaining == 0) { //if try to get a tile and there no tiles and all images have been wiped then game is over
      resultsString = resultsString + "<br> <div class=\"col-md row text-success h4\"> TOTAL SCORE:   " + totalScore + "</div>";
      $("#results").html(resultsString);
      $("#winner-dialog").dialog("open");
      break;
    }

    if (tilesRemaining == 0) {
      break;
    }
    var imgObj = $("#" + currentImgToReplace);
    var randomIndex = Math.floor(Math.random() * dataSize);
    while (parseInt(json_data[randomIndex].amount) <= 0) {
      randomIndex = Math.floor(Math.random() * dataSize);
    }

    if (imgObj.attr('src') === "") {
      imgObj.attr('src', json_data[randomIndex].src);
      json_data[randomIndex].amount = parseInt(json_data[randomIndex].amount) - 1;
      tilesRemaining = tilesRemaining - 1;
      $("#tileCount").html(tilesRemaining); //update label showing number of tiles remaining

    }
  }
}


/* This function swaps the tiles on the rack for others. */
function swapTiles(json_data) {

  if (swapCount >= 3) {
    $("#cant-swap-tile-dialog").dialog("open"); //if user has swapped tiles more than 3 times. dont execute function, show dialog.
  } else {
    $(".ui-dialog-titlebar").hide(); //hide dialog title(The thing is ugly).}
    var dataSize = parseInt(json_data.length); //number of elements in json object
    var currentImgToReplace = 1; //id number of image to replace on page

    for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
      if (tilesRemaining == 0) {
        $("#no-tiles-dialog").dialog("open"); //if there are no tiles to be swapped with, tell user
        break;
      }
      var imgObj = $("#" + currentImgToReplace);
      if (!(imgObj.data("onSlot") === -1)) {
        continue;
      }

      var letterToSwap = imgObj.attr('src').charAt(15);

      json_data.forEach(function(element) {

        if (element.letter === letterToSwap) {
          element.amount = element.amount + 1;
        }
      });

      var randomIndex = Math.floor(Math.random() * dataSize);
      while (parseInt(json_data[randomIndex].amount) <= 0) {
        randomIndex = Math.floor(Math.random() * dataSize);
      }
      json_data[randomIndex].amount = json_data[randomIndex].amount - 1;
      imgObj.attr('src', json_data[randomIndex].src);
    }
    swapCount = swapCount + 1;
  }
}

//This function clears the rack and board, updates total score.
function nextWord() {
  var currScore_temp = 0;
  if (isValidWord) { //only executed when the word on the board is valid.
    currentScore.forEach(function(element) {
      totalScore = totalScore + element;
      currScore_temp = currScore_temp + element;
    });

    if (wordToSubmitt != "" && wordToSubmitt != ".") {
      resultsString = resultsString + "<div class=\"col-md row mt-1 pt-1 mb-1 pb-1 text-muted\"><p >" + wordToSubmitt.toUpperCase() + "</p> <p class=\"ml-4\">+" + currScore_temp + "</p></div>";
    }

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
      }
    }

    showCurrentScore();
    getTiles(json);
    $("title-rack").html($("#tile-rack").html());
    attachDraggableAbility();
    swapCount = 0;
    invalidSubmitAttempts = 0;
    $("#give-up2").hide();
  } else {
    $("#invalid-word-submit-dialog").dialog("open"); //tell user that word is invalid.
    invalidSubmitAttempts = invalidSubmitAttempts + 1;
    if (invalidSubmitAttempts == 5) $("#give-up2").show(); //after user tries to submit wrong word 5 times, show give up button
  }
}


function updateWord(letter, slot_index) {

  currentWordArray[slot_index] = letter;
  var word = "";
  var i;
  for (i = 0; i < currentWordArray.length; i++) {
    word = word + "" + currentWordArray[i];
  }
  if (setIsValidWord(word)) isValidWord = true;
  else isValidWord = false;
  $("#currentWord").html(word);
  if (isValidWord) {
    $("#currentWord").removeClass("text-danger");
    $("#currentWord").addClass("text-success");
    $("#word-not-found").hide();
  } else {
    $("#currentWord").removeClass("text-success");
    $("#currentWord").addClass("text-danger");
    $("#word-not-found").show();
  }
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
  if (isValidWord) {
    for (i = 0; i < currentScore.length; i++) {
      scoreToShow = scoreToShow + currentScore[i];
    }
    $("#current-score").removeClass("text-danger");
  } else $("#current-score").addClass("text-danger");

  $("#total-score").html(totalScore + scoreToShow);
  $("#current-score").html(scoreToShow);
}

function setIsValidWord(word) {
  var first_letter = word.charAt(0).toLowerCase();
  wordToSubmitt = word.toLowerCase();
  if (word == "") return true; //this is for when the board is cleared: basically it shouldn't be checked.
  if (first_letter == ".") return true; //when a blank tile is being changed, this method is run. at that point the first letter "." this method should ignore that
  else if (word.length == 1) return false; //no single letter words
  else return dictionary[first_letter].indexOf(word.toLowerCase()) != -1;
}

function gameOver() {
  removedTileCount = 0
  for (var currentImage = 1; currentImage <= 7; currentImage++) {
    img = $("#" + currentImage);
    if (img.attr('src') == "") removedTileCount = removedTileCount + 1;
  }

  return removedTileCount == 7;
}
