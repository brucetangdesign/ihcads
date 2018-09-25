$( document ).ready(function() {
  var $ads = $(".ihc-ads");

  //Check if there is a slideshow on the page. If so activate it.
  if($ads.length){
    $ads.each(function(){
      activateSlideshow($(this));
    });
  }

  //Activate the slideshow
  function activateSlideshow($ads){
    var $slideshow = $ads.find(".slideshow");
    var $slidesContainer = $ads.find(".slides-container");
    var $slides = $slideshow.find(".slides");
    var $controls;
    var $button;
    var curSlideNum = 0; //track which slide is on top
    var numSlides = $slides.children().length;
    var maxSlides = 4;
    var baseWidth = parseInt($slides.width());

    //direction the slide will animate - can be left or right
    var slideDirection = "left";

    //each image after the top will have a transparency that will increase in opacity by 25% as you go back in th estack
    var opacityDecayPerc = 0.25;

    //each slide will be 12 pixels shorter in width as you go back from the top
    var decayAm = 12;

    var spacing = 12;
    var slideDragged = false;

    //Slide click
    $slides.find(".slide").each(function(index){
      var imgSrc = $(this).find("img").attr("src");

      $(this).find("a").click(function(e){
        //shuffle images if clicked slide is not on top
        if($(this).parent().index() != 0){
          //disable links for any images not on top
          e.preventDefault();

          //find the corresponding button and click it
          $button.each(function(){
            if($(this).val() == imgSrc){
              $(this).trigger("click");
            }
          });
        }
      });
    });

    //Move Images
    moveImages(1);

    //set up slide controls
    createSlideControls();

    //initialize slide controls
    initSlideControls();

    //initialize slides rollover
    initSlidesRollover();

    //initialize slide drag
    initSlideDrag();

    //put images in their spot and set opacity and width
    function moveImages(time = 0.45){
      //stop any tweens
      TweenMax.killTweensOf($slides);
      TweenMax.killChildTweensOf($slides);

      $slides.find(".slide").each(function(index){
        var newWidth;
        var newOpacity;
        var completeFunc = null;

        //get the new slide width and image opacity (determined by position in the stack)
        newWidth = baseWidth - (decayAm * index);
        newOpacity = 1 - (opacityDecayPerc * index);

        //if this is th elast slide then turn the rollover actions back on
        if(index == numSlides-1){
          completeFunc = initSlidesRollover;
        }

        //animate the slide to it's new position
        TweenMax.to($(this),time,{
          width: newWidth,
          x: baseWidth - newWidth + (spacing * index),
          ease: Power3.easeOut,
          onComplete: completeFunc
        });

        //animate th eimage opacity
        TweenMax.to($(this).find("img"),time,{opacity: newOpacity});
      });


      //make the slides conatiner larger to accommodate all images in their new positions
      var newSlidesWidth = baseWidth + (baseWidth-(baseWidth - (decayAm * (numSlides-1))));
      if($slides.width() != newSlidesWidth){
        TweenMax.to($slides,time,{width: newSlidesWidth, ease: Power3.easeOut});
      }
    }

    //spread images out (when stack is rolled over)
    function spreadImages(time = 0.5){
      //stop any running tweens
      TweenMax.killTweensOf($slides);
      TweenMax.killChildTweensOf($slides);

      var newSlidesWidth = $slides.parent().width() * 0.92;
      var addedSlidesWidth = 0;

      //animate each slide
      $slides.find(".slide").each(function(index){
        addedSlidesWidth = $(this).width() * numSlides;

        var offset = (addedSlidesWidth - newSlidesWidth)/(numSlides-1);

        var newX = ($(this).width() * index) - (offset * index);

        TweenMax.to($(this),time,{
          x: newX,
          ease: Power3.easeInOut
        });
      });

      //make the slides conatiner larger to accommodate all images in their new positions
      if($slides.width() != newSlidesWidth){
        TweenMax.to($slides,time,{width: newSlidesWidth, ease: Power3.easeInOut});
      }
    }

    //Creates the circle button controls at th ebottom of the slideshow
    function createSlideControls(){
      var $slidesFooter = '<div class="slides-footer">' +
                            '<div class="slideshow-control">' +
                              '<div class="slideshow-arrow prev"></div>' +
                                '<ul class="control-button-container horizontal-menu">';

      for(i=0; i < numSlides; i++){
        var checked = "";
        if(i == 0){
          checked = "checked";
        }
        var $li = '<li>' +
                    '<label class="slide-button-container">' +
                      '<input type="radio" name="slide-button-ad" value="' +
                      $slides.children().eq(i).find("img").attr("src") +
                       '"'+ checked +'></input>' +
                       '<span class="radio"></span>' +
                    '</label>' +
                  '</li>';
        $slidesFooter += $li;
      }

      $slidesFooter +=    '</ul>' +
                          '<div class="slideshow-arrow next"></div>' +
                         '</div>' +
                       '</div>';

      $slideshow.append($slidesFooter);
    }

    //Turn on the slide controls
    function initSlideControls(){
      $controls = $slideshow.find(".slideshow-control");
      $button = $controls.find(".slide-button-container input");

      $button.each(function(index){
        var nextSlide;
        var firstDisplayedButton = 0;
        var lastDisplayedButton = maxSlides-1;

        $(this).click(function(){
          //stop rollover of slides
          killSlidesRollover();

          //Move the Slides
          animateSlides($(this).val());

          //update current slide number
          curSlideNum = index;
        });
      });
    }

    //Move the stack - put the new slide on top and move others back
    function animateSlides(newSlideSrc){
      var $newSlide;
      var $curSlide;
      var $slide = $slides.find(".slide");
      var slidesToMove = [];

      //get the new slide
      $newSlide = $slides.find("[src='"+ newSlideSrc +"']").parents(".slide");

      //Store the slides that have to be moved (anything above the new slide)
      $slide.each(function(index){
        $thisSlide = $(this);
        var imgSrc = $thisSlide.find("img").attr("src");

        if(index < $newSlide.index()){
          slidesToMove.push($(this));
        }

        //unbind any drag events
        $(this).off("touchstart touchend mouseleave touchmove");
      });

      //Move any slides above the new slide (only animate if user is not rolled over slides)
      if(!slideDragged){
        for(var i = 0; i< slidesToMove.length; i++){
          var completeFunc = null;

          if(i == slidesToMove.length-1){
            completeFunc = completeAnimation;
          }

          TweenMax.to(slidesToMove[i],0.4,{
            x: -slidesToMove[i].width(),
            delay: 0.03 * i,
            ease:Power2.easeInOut,
            onComplete: completeFunc
            });
        }
      }
      else{
        completeAnimation();
      }

      //Animation complete, move old slide to back
      function completeAnimation(){
        for(var i = 0; i< slidesToMove.length; i++){
          slidesToMove[i].appendTo($slides);
        }

        moveImages();
        initSlideDrag();
        slideDragged = false;
        slideDirection = "left";
      }
    }

    //Turn on the rollover actions for the slides
    function initSlidesRollover(){
      $slides.hover(over,out);

      function over(){
        spreadImages();
      }

      function out(){
        moveImages();
      }
    }

    //Turn off the rollover actions
    function killSlidesRollover(){
      $slides.off();
    }

    //Turn on the dragging for the slides (for mobile)
    function initSlideDrag(){
      setHandlers($slides.find(".slide:eq(0)"));

      function setHandlers($slide){
        var baseX = $slide.offset().left;
        var baseClickX;
        var amountMoved;

        $slide.on("touchstart", function(event){
          var clientX = event.touches[0].clientX;
          baseClickX = clientX - baseX;

          $(this).on("touchmove",function(event){
            var shiftX;
            shiftX = event.touches[0].clientX - baseX;
            amountMoved = -(baseClickX - shiftX);
            TweenMax.set($(this),{x:amountMoved});

            checkAmountMoved(true,event);
          });


          $(this).on("touchend mouseleave",function(event){
            $(this).off("touchmove mouseleave touchend");
            checkAmountMoved(false,event);
          });
        });

        //Check ghow much the slide has moved when th euser lets go of it. If it moves more than set amount (200px for large screens, 100px for small screens) left or right then user is trying to go to the next slide
        function checkAmountMoved(isDragging,event){
          var $curSlide;

          if(!$(event.target).hasClass("slide")){
            $curSlide = $(event.target).parents(".slide");
          }

          var limit = 200;
          if($(window).width() < 768){
            limit = 100;
          }

          //Determine how much the slide has been dragged
          if(isDragging){
            if(amountMoved > limit || amountMoved < -limit){
              $curSlide.off();
              dragSwitchImage($curSlide)
            }
          }
          //User is not trying to go  to the next slide. Put the slide back.
          else{
            TweenMax.to($slide,0.2,{x:0, ease: Power3.easeOut, onComplete: clearProps});
          }

          //Reset the slide transforms
          function clearProps(){
            TweenMax.set($slide,{clearProps: "transform"});
          }

          //Switch images
          function dragSwitchImage($curSlide){
            var $nextSlideLink = $slides.find(".slide:eq("+($curSlide.index()+1)+")");
            $nextSlideLink = $nextSlideLink.find("a");

            slideDragged = true;
            $nextSlideLink.trigger("click");
          }
        }
      }
    }
  }
});
