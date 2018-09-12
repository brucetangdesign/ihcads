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
    //var $prevArrow = $controls.find(".slideshow-arrow.prev");
    //var $nextArrow = $controls.find(".slideshow-arrow.next");
    var curSlideNum = 0;
    var numSlides = $slides.children().length;
    var maxSlides = 4;
    var slideDirection = "left";
    var decayAm = 12;
    var opacityDecayPerc = 0.25;
    var spacing = 12;
    var baseWidth = parseInt($slides.width());


    //disable links for any images not on top
    $slides.find(".slide").each(function(index){
      $(this).find("a").click(function(e){
        if($(this).parent().index() != 0){
          e.preventDefault();
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

    function disableLinks(){

    }

    //put images in their initial spot and set opacity and width
    function moveImages(time = 0.6){
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
          ease: Power3.easeInOut
        });

        TweenMax.to($(this).find("img"),time,{opacity: newOpacity});
      });

      //make the slides conatiner larger to accommodate all images in their new positions
      var newSlidesWidth = baseWidth + (baseWidth-(baseWidth - (decayAm * (numSlides-1))));
      if($slides.width() != newSlidesWidth){
        TweenMax.to($slides,time,{width: newSlidesWidth, ease: Power3.easeInOut});
      }
    }

    //fan images out
    function spreadImages(time = 0.5){
      TweenMax.killTweensOf($slides);
      TweenMax.killChildTweensOf($slides);
      var newSlidesWidth = $slides.parent().width() * 0.92;

      $slides.find(".slide").each(function(index){
        var newX = (newSlidesWidth/numSlides) * index;

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
      $slide.each(function(index){
        $thisSlide = $(this);
        var imgSrc = $thisSlide.find("img").attr("src");

        //New slide
        if (imgSrc == newSlideSrc){
          $newSlide = $thisSlide;
        }
      });

      //Store the slides that have to be moved (anything above the new slide)
      $slide.each(function(index){
        $thisSlide = $(this);
        var imgSrc = $thisSlide.find("img").attr("src");

        if(index < $newSlide.index()){
          slidesToMove.push($(this));
        }

        //unbind any drag events
        //$(this).off("mousedown mouseup touchstart touchend mousemove touchmove");
      });


      //Animate current slide off screen
      //calculate distance from edge of slide to left side of screen
      //var curSlidePos = $curSlide.offset().left - $curSlide.position().left;
      //move the slide
      //var finalPos = -(curSlidePos + $curSlide.find("img").width());

      /*if(slideDirection == "right"){
        finalPos = $(window).width()-curSlidePos;
      }*/

      //Move any slides above the new slide
      for(var i = 0; i< slidesToMove.length; i++){
        var completeFunc = null;

        if(i == slidesToMove.length-1){
          completeFunc = completeAnimation;
        }

        TweenMax.to(slidesToMove[i],0.35,{
          x: slidesToMove[i].position().left-slidesToMove[i].width(),
          delay: 0.05 * i,
          ease:Power3.easeInOut,
          onComplete: completeFunc
          });
      }

      //Animation complete, move old slide to back
      function completeAnimation(){
        for(var i = 0; i< slidesToMove.length; i++){
          slidesToMove[i].appendTo($slides);
          disableLinks();
        }

        moveImages();
        initSlidesRollover();
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
  }
});
