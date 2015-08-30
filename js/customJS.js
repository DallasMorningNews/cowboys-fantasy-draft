$(document).ready(function() {
	
	// salary counters
	var salRemaining = 18;
	var salTotal = 0;

	// position slot counters
	var qbSlot = 0,
		rbSlot = 0,
		wrSlot = 0,
		dSlot = 0,
		kSlot = 0;


	//storing path to the default image for player removal from
	var defaultImage = "images/defaultImage.jpg";


	//jquery pointers

	var $posSlot = $('.posSlot'),
		$rosterSlot = $('.rosterSlot');

	var $qb = $('.quarterback'),
		$rb = $('.runningback'),
		$wr = $('.widereceiver'),
		$def = $('.defense'),
		$k = $('.kicker');

	var $totalSal = $('.totalSal'),
		$availSal = $('.availableSal'),
		$clearButton = $('.clearRoster'),
		$game = $('#cowboysGame'),
		$roster = $('#roster');



	/*
	--------------------------------------------
	KEEPS COUNT OF HOW MANY SLOTS HAVE BEEN FILLED BY POSITON
	--------------------------------------------
	*/

	// checks how many slots have been filled on the roster
	// if all slots for a particular position are filled, mark all players in that position as "filled", making them inactive

	function checkPosSlots() {
		qbSlot >= 1 ? $qb.addClass('filled') : $qb.removeClass('filled');
		rbSlot >= 2 ? $rb.addClass('filled') : $rb.removeClass('filled');
		wrSlot >= 2 ? $wr.addClass('filled') : $wr.removeClass('filled');
		dSlot >= 1 ? $def.addClass('filled') : $def.removeClass('filled');
		kSlot >= 1 ? $k.addClass('filled') : $k.removeClass('filled');
	} 


	/*
	--------------------------------------------
	CHECKS TO SEE WHO THE USER CAN AFFORD
	--------------------------------------------
	*/

	// checks if user has enough money remaining to pick a player
	// if not, adds class unaffordable to that posSlot
	// if they do, removes class unaffordable

	function affordables() {
		$posSlot.each(function(){
			var slotCost = parseInt($(this).data('cost'));

			if (slotCost > salRemaining) {
				$(this).addClass('unaffordable');
			} else {
				$(this).removeClass('unaffordable');
			}
		})
	}


	/*
	--------------------------------------------
	ADDING AND REMOVING PLAYERS FROM THE ROSTER
	--------------------------------------------
	*/

	function modifyRoster(action, position, name, cost, image) {
		if (action === "buy") {
			$rosterSlot.each(function(k,v) {

				// when a player is bought, search for a slot that matches that players position. if that slot is unfilled ...
				if ( $(this).data('position') === position && $(this).hasClass('filledSlot') === false ) {
					// update the name, salary, and image in the slot
					$(this).find('.slotName').text(name);
					$(this).find('.salary').text("$" + cost);
					$(this).find('img').attr('src', image);

					//mark the slot as filled and update that slot's data-cost attribute
					$(this).addClass('filledSlot');
					$(this).attr('data-cost', cost);

					// swapping the plus button for the minus button
					$(this).children('.fa-plus-circle').toggleClass('fa-plus-circle').toggleClass('fa-minus-circle');

					return false;

				}
			})
		} else if (action === "sell") {
			$rosterSlot.each(function(k,v) {

				var playerName = $(this).find('.slotName').html();
				var slotPosition = $(this).attr('data-position');

				// when a player is removed, search for a slot that matches that player's position and is filled ...
				if ( slotPosition ===  position && $(this).hasClass('filledSlot') && playerName === name ) {

					// replace the player's name with "Choose a player", zero out the salary, and return the image to the default
					$(this).find('.slotName').text('Choose a player');
					$(this).find('.salary').text("");
					$(this).find('img').attr('src', defaultImage);

					// unmark that slot as filled, and reset the data-cost to 0
					$(this).removeClass('filledSlot');
					$(this).attr('data-cost', "0");

					$(this).children('.fa-minus-circle').toggleClass('fa-plus-circle').toggleClass('fa-minus-circle');
				}
			})
		}

		// check our position slots to see what's still available
		checkPosSlots();
	}


	/*
	--------------------------------------------
	ADJUSTING THE TOTAL AND REMAINING SALARY FIGURES
	--------------------------------------------
	*/

	function adjustSalary(action, cost) {
		if (action === "buy") {
			salRemaining -= cost;
			salTotal += cost;	
		} else if (action === "sell") {
			salRemaining += cost;
			salTotal -= cost;
		}


		$availSal.text(salRemaining);
		$totalSal.text(salTotal);

		// runs the function "affordables" to see if user an afford players
		affordables();
	}

	/*
	--------------------------------------------
	CLEARING THE ROSTER AND STARTING OVER
	--------------------------------------------
	*/


	function clearRoster() {

		//restore all the roster slots to their defaults
		$rosterSlot.each(function(k,v) {
			$(this).find('.slotName').text('Choose a player');
			$(this).find('.salary').text("");
			$(this).find('img').attr('src', defaultImage);
			$(this).removeClass('filledSlot');
			$(this).attr('data-cost', "0");

			// toggle the minus button to plus only if it has a minus button
			if ( $(this).children('.fa').hasClass('fa-minus-circle') ) {
				$(this).children('.fa-minus-circle').toggleClass('fa-plus-circle').toggleClass('fa-minus-circle');
			}	
		})

		//restore all the position slots to defaults
		$posSlot.each(function(k,v) {
			$(this).removeClass('selected filled unaffordable');
			$(this).children('button').html('Select');
		})

		//restore the salary trackers to defaults
		salRemaining = 18;
		salTotal = 0;

		$availSal.text(salRemaining);
		$totalSal.text(salTotal);

		// PLACEHOLDER FOR REMOVING SUBMIT BUTTON

	}


	/*
	--------------------------------------------
	ADDING A PLAYER FROM THE POSITIONS LIST
	--------------------------------------------
	*/

	$('.posSlot button').click(function() {

		// saving the cost and position of the player picked
		var cost = $(this).parent('.posSlot').data('cost');
		var position = $(this).parent('.posSlot').data('position');
		var name = $(this).siblings('h4').html().replace("<br>", " ");
		var image = $(this).siblings('img').attr('src');



		// if this player was already selected, then we're going to remove them from the roster
		if ($(this).parent('.posSlot').hasClass('selected')) {

			//switch the button back to it's default
			$(this).parent('.posSlot').removeClass('selected');
			$(this).html('Select');

			//update our position slot counters
			position === "qb" ? qbSlot-- : position === "rb" ? rbSlot-- : position === "wr" ? wrSlot-- : position === "def" ? dSlot-- : kSlot--;

			//update the user's roster with the player selected
			modifyRoster("sell", position, name, cost, image);

			//run the adjustSalary function with the sell action
			adjustSalary("sell", cost);

		} else {
			//mark this player as selected
			$(this).parent('.posSlot').addClass('selected')
			$(this).html('Remove');

			//update our position slot counters
			position === "qb" ? qbSlot++ : position === "rb" ? rbSlot++ : position === "wr" ? wrSlot++ : position === "def" ? dSlot++ : kSlot++;

			//update the user's roster with the player selected
			modifyRoster("buy", position, name, cost, image);

			//run the adjustSalary function with the buy option
			adjustSalary("buy", cost);
		}

	})

	/*
	--------------------------------------------
	REMOVING A PLAYER VIA THE ROSTER MINUS BUTTON
	--------------------------------------------
	*/


	$rosterSlot.on('click', '.fa-minus-circle', function() {

		// saving variables to pass to other functions
		var cost = parseInt($(this).parent('.rosterSlot').attr('data-cost'));
		var name = $(this).siblings('.playerInfo').children('h5:first-of-type').html();
		var position = $(this).parent('.rosterSlot').data('position');
		var currentImage = $(this).siblings('.playerImg').attr('src');
		var image = defaultImage;

		//update our position slot counters
		position === "qb" ? qbSlot-- : position === "rb" ? rbSlot-- : position === "wr" ? wrSlot-- : position === "def" ? dSlot-- : kSlot--;

		//update the user's roster with the player selected
		modifyRoster("sell", position, name, cost, image);

		//run the adjustSalary function with the sell action
		adjustSalary("sell", cost);

		// check all the posSlots for one that has a matching image path as the player removed, and unmark that slot as "selected"
		$posSlot.each(function(k,v) {
			if ($(this).children('img').attr('src') === currentImage ) {
				$(this).removeClass('selected');
				$(this).children('button').text('Select');
			}
		});

	});


	$('.fa-plus-circle').click(function() {

		// PLACEHOLDER FOR SCROLLING TO POSITIONS

	})


	$clearButton.click(function() {
		clearRoster();
	})


	affordables(salRemaining);


	$(window).scroll(function() {

		var y = $(window).scrollTop(),
			windowHeight = $(window).height(),
			cowTop = $game.offset().top,
			cowHeight =$game.height(),
			rosterHeight = $roster.height();

		// on wide displays, we're pinning the roster with a fixed position as we scroll through the game
		if (y + 100 >= cowTop) {
			$roster.addClass('fixedRoster');
		} else {
			$roster.removeClass('fixedRoster');
		}

		if (y + 130 + rosterHeight >= cowTop + cowHeight) {
			$roster.addClass('bottomRoster');
		} else {
			$roster.removeClass('bottomRoster');
		}

	})







	//custom scripting goes here


	/*
	------------------------------------------------------------------------------------------
	CODE FOR SLIDESHOWS, UN-COMMENT THE TWO LINES ABOVE AND BELOW THE CODE AS INSTRUCTED TO USE
	------------------------------------------------------------------------------------------
	*/

	/* DELETE THIS ENTIRE LINE

	//setting up variables for the slideshow

	var slideCounter = 0,
		$nextButton = $('.nextButton'),
		$previousButton = $('.previousButton'),
		$slideButton = $('.slideButton');
		$slideCutline = $('.slide .cutline'),
		totalSlides = $('.slide').length,
		$slideshow = $('.slideshow'),
		slideHeight = $('.slide img').height();

	// checks which image we're on in the slideshow
	// if it's the first, hide the previous button
	// if it's the last, hide the next button
	// else show the previous and last buttons 

	function slidePosition() {
		if (slideCounter === 0) {
			$previousButton.hide();
		} else if ( slideCounter === (totalSlides - 1) ) {
			$nextButton.hide();
		} else {
			$previousButton.show();
			$nextButton.show();
		}
	}

	// advancing the slideshow by moving the current slide to the right
	// then moving the next slide in from the left
	// afterward, grab the file path and assign it to the next image's src attribute
	// then check where we are in the slideshow

	function advanceSlide() {
		slideCounter ++;
		$(this).siblings('.current').addClass('postSlide').removeClass('current');
		$(this).siblings('.slide').eq(slideCounter).addClass('current').removeClass('preSlide');
		var defaultImage = $(this).siblings('.slide').eq(slideCounter + 1).data('default');
		var srcset = $(this).siblings('.slide').eq(slideCounter + 1).data('srcset');
		$(this).siblings('.slide').eq(slideCounter + 1).children('img').attr('src', defaultImage).attr('srcset', srcset);;
		slidePosition();
	}

	function swipeAdvance() {

		if (slideCounter < totalSlides -1 ) {
			slideCounter ++;
			$(this).children('.current').addClass('postSlide').removeClass('current');
			$(this).children('.slide').eq(slideCounter).addClass('current').removeClass('preSlide');
			var defaultImage = $(this).children('.slide').eq(slideCounter + 1).data('default');
			var srcset = $(this).children('.slide').eq(slideCounter + 1).data('srcset');
			$(this).children('.slide').eq(slideCounter + 1).children('img').attr('src', defaultImage).attr('srcset', srcset);;
			slidePosition();
		}

	}

	// rewind the slideshow by moving the current slide to the left
	// then move the previous slide back into view from the left
	// then check where we are in the slideshow 

	function rewindSlide() {
		slideCounter --;
		$(this).siblings('.current').addClass('preSlide').removeClass('current');
		$(this).siblings('.slide').eq(slideCounter).addClass('current').removeClass('postSlide');
		slidePosition();
	}

	function swipeRewind() {
		if (slideCounter > 0 ) {
			slideCounter --;
			$(this).children('.current').addClass('preSlide').removeClass('current');
			$(this).children('.slide').eq(slideCounter).addClass('current').removeClass('postSlide');
			slidePosition();
		}
	}

	// append a number and total length of slideshow to each cutline 

	$slideCutline.each(function(k,v) {
		var cutlinePrefix = "<strong> Slideshow — " + (k + 1) + " of " + totalSlides + ":</strong> ";
		$(this).prepend(cutlinePrefix);
	})

	//running the slidePosition initially to hide previous button
	slidePosition();

	//setting the slideshow button position to be halfway down the slideshow
	console.log (slideHeight);
	$slideButton.css('top', ( (slideHeight / 2) - ($slideButton.height() / 2) ) )

	//binding click and swipe events to the next and previous button

	$nextButton.on('click', advanceSlide);
	$previousButton.on('click', rewindSlide);

	// if you want to be able to swipe the slideshow on touch devices, un-note the following two lines
	// and make sure you call jquery.swipe.min.js in the index file

	$slideshow.on("swipeleft", swipeAdvance);
	$slideshow.on("swiperight", swipeRewind);

	DELETE THIS ENTIRE LINE */






	/*
	------------------------------------------------------------------------------------------
	CODE FOR DROP BULLETS, UN-COMMENT THE TWO LINES ABOVE AND BELOW THE CODE AS INSTRUCTED TO USE
	------------------------------------------------------------------------------------------
	*/

	/* DELETE THIS ENTIRE LINE	

	var $dropHead = $('.dropList .dropHed'),
		$dropTweet = $('.dropList .fa-twitter');

	$dropHead.on('click', function(){
		$(this).next(".dropText").slideToggle(200); 
		$(this).find(".fa").toggleClass('fa-plus').toggleClass('fa-minus');
	});

	$dropTweet.on("click", function(){
		var shareID = $(this).closest(".dropList").attr("id"),
			shareURL = "&url="+encodeURIComponent(window.location.href + "#" + shareID),
			shareText = encodeURIComponent($(this).closest(".dropList").find("h4").text()),
			shareLink = "https://twitter.com/intent/tweet?text="+ shareText + shareURL + "&via=dallasnews";
		window.open(shareLink, '_blank');
	});

	DELETE THIS ENTIRE LINE */




	/*
	------------------------------------------------------------------------------------------
	CODE FOR SYNOPSIS BLOCK, UN-COMMENT THE TWO LINES ABOVE AND BELOW THE CODE AS INSTRUCTED TO USE
	------------------------------------------------------------------------------------------
	*/

	/* DELETE THIS ENTIRE LINE	

	$(".synopsis p").on("click", function() {
		var shareURL = "&url=" + encodeURIComponent(window.location.href),
			shareText = $(this).text(),
			twitterTag = "dallasnews";
			
		var maxLength = 97 // maximum number of characters to extract

		var trimmedText = shareText.substr(0, maxLength);

		trimmedText = trimmedText.substr(0, Math.min(trimmedText.length, trimmedText.lastIndexOf(" ")))

		trimmedText = trimmedText.slice(1);

		trimmedText += " ... "

		trimmedText = encodeURIComponent(trimmedText); 
		
		var shareLink = "http://twitter.com/intent/tweet?text=" + trimmedText + shareURL + "&via=" + twitterTag;
		window.open(shareLink, "_blank");
	})

	DELETE THIS ENTIRE LINE */




	/*
	------------------------------------------------------------------------------------------
	NDN VIDEO ASPECT RESIZER, UN-COMMENT THE TWO LINES ABOVE AND BELOW THE CODE AS INSTRUCTED TO USE
	------------------------------------------------------------------------------------------
	*/

	/* DELETE THIS ENTIRE LINE	  

	//caching a pointer to the jquery element

	var $videoWrapper = ''

	if ($('.ndn_embed')) {
		$videoWrapper = $('.ndn_embed');
		scaleVideo();
	}

		function scaleVideo() {

			videoWidth = $videoWrapper.width(); //grabs the width of the video player
			videoHeight = videoWidth * .5625; //sets a variable equal to 56.25% of the width (the correct aspect ratio for the videos)

			$videoWrapper.css('height', videoHeight); //assings that height variable as the player's height in the css
		}


	$(window).resize(function() {
		scaleVideo(); //runs the video aspect resizer when the width of the browser is changed
	})

	DELETE THIS ENTIRE LINE */


});

