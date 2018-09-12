$( document ).ready(function() {
  var $ads = $(".ads");

  //Check if there is a slideshow on the page. If so activate it.
  if($ads.length){
    $ads.each(function(){
      activateSlideshow($(this));
    });
  }

  //Initialize slideshow
  function activateSlideshow($ads){
    var $slideshow = $ads.find(".slideshow");
    var $slidesContainer = $ads.find(".slides-container");
    var $slides = $slideshow.find(".slides");
    var $controls;
    var $button;
    var curSlideNum = 0;
    var numSlides = $slides.children().length;
    var maxSlides = 4;
    var slideDirection = "left";
    var decayAm = 12;
    var opacityDecayPerc = 0.25;
    var spacing = 12;
    var baseWidth = parseInt($slides.width());
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

    //init slide controls
    initSlideControls();

    //init slides rollover
    initSlidesRollover();

    //init slide drag
    initSlideDrag();

    //put images in their initial spot and set opacity and width
    function moveImages(time = 0.45){
      TweenMax.killTweensOf($slides);
      TweenMax.killChildTweensOf($slides);

      $slides.find(".slide").each(function(index){
        var newWidth;
        var newOpacity;

        newWidth = baseWidth - (decayAm * index);
        newOpacity = 1 - (opacityDecayPerc * index);

        TweenMax.to($(this),time,{
          width: newWidth,
          x: baseWidth - newWidth + (spacing * index),
          ease: Power3.easeOut
        });

        TweenMax.to($(this).find("img"),time,{opacity: newOpacity});
      });

      //make the slides conatiner larger to accommodate all images in their new positions
      var newSlidesWidth = baseWidth + (baseWidth-(baseWidth - (decayAm * (numSlides-1))));
      if($slides.width() != newSlidesWidth){
        TweenMax.to($slides,time,{width: newSlidesWidth, ease: Power3.easeOut});
      }
    }

    //fan images out
    function spreadImages(time = 0.5){
      TweenMax.killTweensOf($slides);
      TweenMax.killChildTweensOf($slides);
      var newSlidesWidth = $slides.parent().width() * 0.92;
      var addedSlidesWidth = 0;

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

    function createSlideControls(){
      //numSlides = $slides.children().length;
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


      //Animate current slide off screen

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
        initSlidesRollover();
        initSlideDrag();
        slideDragged = false;
        slideDirection = "left";
      }
    }

    function initSlidesRollover(){
      $slides.hover(over,out);

      function over(){
        spreadImages();
      }

      function out(){
        moveImages();
      }
    }

    function killSlidesRollover(){
      $slides.off();
    }

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

        function checkAmountMoved(isDragging,event){
          var $curSlide;

          if(!$(event.target).hasClass("slide")){
            $curSlide = $(event.target).parents(".slide");
          }
          var limit = 200;
          if($(window).width() < 768){
            limit = 100;
          }

          if(isDragging){
            if(amountMoved > limit || amountMoved < -limit){
              $curSlide.off();
              dragSwitchImage($curSlide)
              /*if(amountMoved > limit){
                slideDirection = "right";
                dragSwitchImage($curSlide);
              }
              else{
                slideDirection = "left";
                dragSwitchImage($curSlide);
              }*/
            }
          }
          else{
            TweenMax.to($slide,0.2,{x:0, ease: Power3.easeOut, onComplete: clearProps});
          }

          function clearProps(){
            TweenMax.set($slide,{clearProps: "transform"});
          }

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
