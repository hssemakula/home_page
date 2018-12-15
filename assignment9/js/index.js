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

  /*++++++++++++++++ Dialogs ++++++++++++ */
  /* All dialogs use similar settings
    autoOpen: set to fale to prevent dialog from automatically showing.
    modal: true: makes the dialog override all game activity: nothing can be done until user clicks button on it.
    show and hide: blind are animations for when the dialog pops up or closes.
    width: where the width is defined, it's because the content was shown in a narrow window so width was to make it wider.
  */
  $("#blank-tile-dialog").dialog({
    autoOpen: false,
    modal: true,
    show: "blind",
    hide: "blind",
  });

  $("#invalid-word-submit-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 350,
    show: "blind",
    hide: "blind",
  });

  $("#blank-tile-return-dialog, #cant-swap-tile-dialog, #no-tiles-dialog").dialog({
    autoOpen: false,
    modal: false,
    width: 400,
    show: "blind",
    hide: "blind",
  });

  $("#help-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 900,
    show: "blind",
    hide: "blind"
  });

  $("#winner-dialog, #end-dialog").dialog({
    autoOpen: false,
    modal: true,
    width: 350,
    show: "blind",
    hide: "blind"
  });

  $(".ui-dialog-titlebar").hide(); //hide dialog title(The thing is ugly).

  $("#word-not-found").hide(); //at first hide the indicator that word is inavlid, it pops up when word becomes invalid.
  $("#give-up2").hide(); //hide second give up button at first, only shows up after 5 invalid attempted submission.

  $("#swap").click(function() {
    swapTiles(json); //call swapTiles() function when the SWAP button is clicked.
  });

  $("#next-word").click(function() {
    nextWord(); //call nextWord() function when the NEXT WORD button is clicked.
  });

  /* all image icons that are displayed for user to choose from when they place a blank tile
     on the board have the class blank-tile: These are the images of the letters that have zero score.
     They are displayed in a panel, when user clicks on one, an iteration happens that looks for the
     blank tile that has just been placed on the board. Then the src attribute of that tile is changed
     to the link of the zero letter image. The scores and the letters displayed to the user are updated.

     When user clicks on one of those little icons diplayed run this function...
  */
  $(".blank-tile").click(function() {
    var currentImg = 1; //variable to be used in loop.
    for (currentImg = 1; currentImg <= 7; currentImg++) {
      img = $("#" + currentImg); //extract tile image using id
      //if img indicates blank tile and tile's onSlot value is not -1(i.e tile is on a slot on the board) then change img letter to
      //the one that the user clicked on.(the zero score letter the user clicked on)
      if (img.attr("src").substring(15, 20) == "0.png" && img.data("onSlot") != -1) {
        img.attr("src", $(this).attr("src")); //This is where the image switch happens.
        $("#blank-tile-dialog").dialog("close"); //close the choose letter dialog.
        var slotWhereTileIs = img.data("onSlot"); //now we have to update the word. even though the score is zero. can only be effeciently done here
        updateWord(img.attr("src").charAt(16), slotWhereTileIs); //update the word and include "zero letter chosen"
        showCurrentScore(); //update score
        break; //only one blank tile is updated, break because loop becomes pointless at this point.
      }
    }
  });

  /* There are two buttons with the class "give-up": whenever they are clicked...
      Close the dialog on which they are.
      update the results string by showing the user's total score.
      Send the result string to the div with id results in the html.
      open the end-dialog that displays those results.
  */
  $(".give-up").click(function() {
    //if button clicked was on a dialog, first close that dialog. One of the buttons with this class is a container div and not a dialog box
    //so that condition has to be tested for .
    if ($(this).attr("id") != "give-up2") $(this).parent().parent().dialog("close");
    resultsString = resultsString + "<br> <div class=\"col-md row text-success h4\"> TOTAL SCORE:   " + totalScore + "</div>";
    $("#results").html(resultsString); //update html
    $("#end-dialog").dialog("open"); //open dialog.
  });

  $("#help").click(function() { //whenever the help button is clicked, open help dialog
    $("#help-dialog").dialog("open");
  });

  //whenever an ok button is clicked, close the dialog associated with it.
  //The dialog is it's parent's parent because the button itself is enclosed within a div
  $(".ok").click(function() {
    $(this).parent().parent().dialog("close");
  });

  //whenever a reset button is clicked reload page. This button is only displayed at the end of the game.
  $(".reset").click(function() {
    location.reload();
  });

  //whenever an exit button is clicked go to end dialog. This button is shown when a player
  //actually wins: it is displayed along the congratulating dialog and right after the results are shown.
  $(".exit").click(function() {
    $(this).parent().parent().dialog("close"); //close congratulating dialog.
    $("#end-dialog").dialog("open"); //open reults summary
  });





  /**************************************************************************END OF LOADING FUNCTION ***********************************************************/
});

/*************************************************************FUNCTIONS *********************************************************************/

/* This function iterates through all html elements with the class draggable and innitializes them as draggable */
function attachDraggableAbility() {
  //make all elements with class draggable, draggable.(i.e. tiles.)
  $(".draggable").draggable({

    //VERY IMPORTANT REVERT FUNCTION: enables tile to stick only to rack or board
    revert: function(droppableReceiver) {
      //if passed object is false then no droppable object was available to receive draggable
      if (droppableReceiver === false) {
        //revert the postion of the draggable back
        return true;
      } else {
        //else some droppable object received the draggable
        //Check if the droppable object that received draggable is either tile-rack or a slot on the board
        if (droppableReceiver.attr('id') == "tile-rack" || droppableReceiver.hasClass("droppable")) return false; //return false so that draggable tile doesn't revert back to original position
        else return true; //else draggable was dropped at an inavlid location, revert back to original position.
      }
    },
    stack: ".draggable", //ensures that tile being dragged is always on top
    containment: "#body-div" //keep draggable from scrolling off screen. keep it within the body div.
  }); //make all images with class "draggable", draggable.
}


/* This function attempts to get 7 tiles from the bag and places them on the tile rack */
function getTiles(json_data) {
  //Since this function aims to put 7 tiles on the rack, clear all onSlot values of all
  //draggable elements to indicate that they are on the tile rack and not on the board.
  $(".draggable").data("onSlot", -1);

  var currentImgToReplace = 1; //variable to be used for iteration and as image index and ID for images of the tiles
  var dataSize = parseInt(json_data.length); //number of elements in json object: useful for picking a letter at random.

  //Run loop 7 times to...
  for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
    //if the gameOver function returns true and there are no tiles remaining then game has been won.
    if (gameOver() && tilesRemaining == 0) {
      //append the user's total score to the results string.
      resultsString = resultsString + "<br> <div class=\"col-md row text-success h4\"> TOTAL SCORE:   " + totalScore + "</div>";
      $("#results").html(resultsString); //update the html results div
      $("#winner-dialog").dialog("open"); //open the congratulating dialog to show user that they best the game.
      break; //stop the game.
    }

    //if there are no more tiles, break out of loop but game is still not over.
    if (tilesRemaining == 0) {
      break;
    }
    var imgObj = $("#" + currentImgToReplace); //extract the first tile image.
    var randomIndex = Math.floor(Math.random() * dataSize); //calculate a random number between 0 and the the length of the json data object - 1

    /* The object at the index of the random number is checked to see if the amount key returns 0.
    basically, if all tiles of a certain letter have been used up, this will return 0.
    This loop runs so long as that test returns 0. This ensures that the program doesn't go past This
    point without a random number whose corresponding object has an amount that is greater than 0*/
    while (parseInt(json_data[randomIndex].amount) <= 0) {
      randomIndex = Math.floor(Math.random() * dataSize);
    }

    /*Next a check is made to ensure that the current tile image is actually empty, if it is not,
      the loop proceeds to the next index.
      If it is empty, it's src value is changed to that of the json object at the randomIndex.
      the json object's amount is then decremented by 1
    */
    if (imgObj.attr('src') === "") {
      imgObj.attr('src', json_data[randomIndex].src);
      json_data[randomIndex].amount = parseInt(json_data[randomIndex].amount) - 1; //decrement amount by 1.
      tilesRemaining = tilesRemaining - 1; //indicate that a tile was been drawn. decrement amount
      $("#tileCount").html(tilesRemaining); //update label showing number of tiles remaining

    }
  }
}


/* This function swaps the tiles on the rack for others in the bag(i.e json elements whose amounts > 0) */
function swapTiles(json_data) {
  //if user has swapped tiles more than 3 times and not submited a valid word. dont execute function, show dialog.
  if (swapCount > 2) {
    $("#cant-swap-tile-dialog").dialog("open");
  } else {
    var dataSize = parseInt(json_data.length); //number of elements in json object: useful for picking a letter at random.
    var currentImgToReplace = 1; //variable to be used for iteration and as image index and ID for images of the tiles

    for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
      //if tilesRemaining is equal to zero then there are no more tiles to be swapped with(i.e. all amounts of the json objects are 0), tell user
      if (tilesRemaining == 0) {
        $("#no-tiles-dialog").dialog("open"); //popup dialog to inform user
        break; //break out of loop.
      }
      var imgObj = $("#" + currentImgToReplace); //extract tile image that is going to replaced.
      //if the image object's onSlot value is ont -1, then the image(hence tile) is on the board and shouldn't be swapped.
      if (!(imgObj.data("onSlot") === -1)) {
        continue; //skip this number in the iteration.
      }

      //-----------IF all the tests above are passed proceed with swap

      var letterToSwap = imgObj.attr('src').charAt(15); //extract letter of tile to be swapped.

      //iterate through all of the json objects and when the letter matches, increase the inventory of that letter
      //(i.e. it's amount to show that it has been returned to bag.)
      json_data.forEach(function(element) {
        if (element.letter === letterToSwap) {
          element.amount = element.amount + 1;
        }
      });

      var randomIndex = Math.floor(Math.random() * dataSize); //obtain random number (between 0 and json object length - 1)
      //run loop to ensure that object at random index has amount greater than zero as in function getTiles.
      while (parseInt(json_data[randomIndex].amount) <= 0) {
        randomIndex = Math.floor(Math.random() * dataSize);
      }
      //if json object amount was greater than zero, decrement that amount by 1 to indicate that a tile of such a letter has been taken out.
      json_data[randomIndex].amount = json_data[randomIndex].amount - 1;
      //change the current image tiles's src value to that of the random json object.
      imgObj.attr('src', json_data[randomIndex].src);
    }
    swapCount = swapCount + 1; //indicate that the user has made a swap by increasing swap count.
  }
}

//This function clears the rack and board, updates total score. AND submits the word on the board.
function nextWord() {
  var currScore_temp = 0; //variable to log the score of the word that user is about to submit
  //This big chunk if statement is only executed if a word is valid
  if (isValidWord) {
    //  calculates the score for the word on the board and adds it to the total score
    currentScore.forEach(function(element) { //iterate through scores on the slots.
      totalScore = totalScore + element;
      currScore_temp = currScore_temp + element; //as value is added to total score, current slot values are tallied too.
    });

    //if the current word that has been received for submission is valid, concatenate it to the results string along with its on-board score.
    if (wordToSubmitt != "" && wordToSubmitt != ".") {
      resultsString = resultsString + "<div class=\"col-md row mt-1 pt-1 mb-1 pb-1 text-muted\"><p >" + wordToSubmitt.toUpperCase() + "</p> <p class=\"ml-4\">+" + currScore_temp + "</p></div>";
    }

    var currentImgToReplace = 1; //variable to be used for iteration and as image index and ID for images of the tiles
    //This loop is run 7 times, a tile for each tile image.
    for (currentImgToReplace = 1; currentImgToReplace <= 7; currentImgToReplace++) {
      var image = $("#" + currentImgToReplace); //extract tile image jquery object.

      //if the tile image is not on rack(i.e. not on slot -1)
      if (!(image.data("onSlot") === -1)) {
        var previous_slot_index = image.data("onSlot"); //estract the slot index of the slot that it is on.
        isVacant[previous_slot_index] = true; //mark that slot as vacant
        removeSlotScore(previous_slot_index); //remove the slot's score.
        updateWord("", previous_slot_index); //remove the letter and update that on the display that the user is looking at.

        var oldimgID = image.attr('id'); //extract the id of the current tile image.
        image.remove(); //discard the tile image.
        //using the image id extracted. construct a new image that is identical to the one that was discarded.
        //but give it an src attribute of ""
        var newImg = "<img id=" + oldimgID + " class=\"m-2 draggable\" src=\"\" height=\"100\" />"
        $(newImg).appendTo("#tile-rack"); //append new constructed image to tile rack.
      }
    }

    showCurrentScore(); //always update the score after an operation.
    getTiles(json); //call the getTiles() method, which fills all tile images that have no src attribute with an src attribute from the json object.
    $("title-rack").html($("#tile-rack").html()); //refresh the tile rack's html: still doesn't work well. When user moves tiles alot images are drawn in weird places.
    attachDraggableAbility(); //make the new images on the tile rack draggable.
    swapCount = 0; //reset the swap count so that user gets 3 new swap chances.
    invalidSubmitAttempts = 0; //reset counter for showing give up button.
    $("#give-up2").hide(); //hide "give up" button  once user submits valid word.
  } else //else if word is not valid.
  {
    $("#invalid-word-submit-dialog").dialog("open"); //open dialog that tells the user that the word they are tring to submit is invalid.
    invalidSubmitAttempts = invalidSubmitAttempts + 1; //increment the number of inavlid attempts(5 of them show the give up button)
    if (invalidSubmitAttempts == 5) $("#give-up2").show(); //after user tries to submit wrong word 5 times, show give up button
  }
}

/* This function updates the current word displayed.
    It takes the letter to be inserted into the word and the slot on the board as parameters
  */
function updateWord(letter, slot_index) {

  currentWordArray[slot_index] = letter; //insert letter into current word array at slot index: this is the array used to build the string.
  var word = ""; //string variable to store built word.

  //iterate through current word array and concatenate each letter at each position to the word variable.
  var i;
  for (i = 0; i < currentWordArray.length; i++) {
    if (currentWordArray[i] == "") word = word + " "; //if index has an empty string concatenate a space.
    else word = word + "" + currentWordArray[i];
  }

  /* Now to check if the built word is valid.
    First if the character at first slot of the board is a space and the string is a word(i.e greater than 1) then that's an invalid word.
    else it is passed to the setIsValidWord method to do some more in depth ananalysis. but it is trimmed to get rid of all spaces.
    The isValidWord flag is set to indicate whether word is valid or not
  */
  if (currentWordArray[0] == "" && word.length > 1) isValidWord = false;
  else if (setIsValidWord(word.trim())) isValidWord = true;
  else isValidWord = false;

  $("#currentWord").html(word); //word is displayed to the user.
  if (isValidWord) {
    //when word is valid, the text is made green by adding the bootstrap class text-success and removing the
    //the class bootstrap class text-danger, if word was previously invalid.
    $("#currentWord").removeClass("text-danger");
    $("#currentWord").addClass("text-success");
    $("#word-not-found").hide();
  } else {
    $("#currentWord").removeClass("text-success");
    $("#currentWord").addClass("text-danger");
    $("#word-not-found").show(); //if word invalid show the red text that states that it was not found in the dictionary
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
