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
    //var $buttonContainer = $controls.find("li");
    var curSlideNum = 0;
    var numSlides;
    var maxSlides = 4;
    var slideDirection = "left";

    //set up slide controls
    createSlideControls();

    //init slide controls
    initSlideControls();

    function createSlideControls(){
      numSlides = $slides.children().length;
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

      //Store the currently selected slide and the next slide
      $slide.each(function(index){
        $thisSlide = $(this);
        var imgSrc = $thisSlide.find("img").attr("src");

        //New slide
        if (imgSrc == newSlideSrc){
          $newSlide = $thisSlide;
        }

        //Get current slide
        $button.each(function(index){
          if(index == curSlideNum){
            if($(this).val() == imgSrc){
              $curSlide = $thisSlide;
            }
          }
        });

        //unbind any drag events
        //$(this).off("mousedown mouseup touchstart touchend mousemove touchmove");
      });

      //Animate current slide off screen
      //calculate distance from edge of slide to left side of screen
      var curSlidePos = $curSlide.offset().left - $curSlide.position().left;
      //move the slide
      var finalPos = -(curSlidePos + $curSlide.find("img").width());

      if(slideDirection == "right"){
        finalPos = $(window).width()-curSlidePos;
      }

      //css transition will not work on the slide that is being appened. Need to animate with JS
      var $curSlideImg = $curSlide.find("img");
      var curSlideWidth = $curSlideImg.width();
      var curSlideNewWidth = $slides.children().eq(numSlides-1).find("img").width();
      var marginOffset = parseInt($slides.children().eq(numSlides-1).css("marginLeft"));
      $curSlide.addClass("animating");

      //move the slide
      TweenMax.to($curSlide,0.4,{x: finalPos, ease:Power2.easeOut, onComplete: completeAnimation, onCompleteParams: [$curSlide]});
      //TweenMax.set($curSlide.find("img"),{opacity: 1, width: curSlideWidth});
      $curSlide.appendTo($slides);


      //Animation complete, move old slide to back, animate new slide, reset props
      function completeAnimation($slideToPutBack){
        $slideToPutBack.removeClass("animating");
        TweenMax.set($slideToPutBack,{clearProps:"all"});
        TweenMax.set($slideToPutBack.find("img"),{clearProps:"all"});
      }
    }
  }
});
