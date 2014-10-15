angular.module('starter.controllers', [])

//controllers are instantiated by the ng-controller directive in angular...

// CardsCtrl -> templates/cards.html
// SettingsCtrl -> templates/settings.html
// MatchCtrl -> templates/matchlist.html
// ChatCtrl -> templates/chat.html
// LoginCtrl -> templates/login.html
// MenuCtrl -> templates/menu.html  this menu is available on all views
// ChoosePhotosCtrl -> templates/choose_photos.html -> also opens up the photos_modal
// ChooseAnswersCtrl -> templates/choose_answers.html

  .controller('CardsCtrl', function($scope,principal,$http,$ionicNavBarDelegate,$timeout,$ionicSlideBoxDelegate) {
    
    //disable back button on Cards Control
    $timeout(function(){
      $ionicNavBarDelegate.showBackButton(false);
    });

    // instantiate these as blank. the id field is being watched in an ng-show, setting to "" hides the element.
    // we use only 5 cards because it is more efficient on mobile to only load what is currently visible on screen. 
    // In our case, since it is a tinder like interface, I load 5 cards even if they are not on screen because some people swipe quite fast...

    $scope.cards =[{id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",answer3:"",answer4:"",answer5:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",answer3:"",answer4:"",answer5:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",answer3:"",answer4:"",answer5:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",answer3:"",answer4:"",answer5:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",answer3:"",answer4:"",answer5:""}];



    $scope.cardPosition = [0]; // need to use non primitive type
    $scope.remainingCards= [[]]; 
    $scope.skip_ids = [];
    
    // call server for people we haven't swiped on yet. we add 5 cards to $scope.cards and all remaining to remainingCards array. 
    // This second array is never loaded so it doesn't slow down the app. However on a swipe, the details of the swiped scope.Card is replaced with
    // details of one of the remainingCards. This means all cards eventually are viewed, with only 5 being loaded at a given time. 
    // (This is much more efficient than loading them all at once).
    // Also add every id to the array skip_ids. These will be ids we skip when we are requesting more data from the server.

    $http.get(AppSettings.baseApiUrl + 'profiles',{params:{facebook_id:principal.facebook_id}})
      .success(function(data,status,headers,config){
        console.log("on cards page successfully got profiles");
        if (data.length){
          for(i=0;i<data.length;i++){
            $scope.skip_ids.push(data[i].id);
            if (i<5){
              //Only push 5 cards for performance reasons
              $scope.cards[i].id = data[i].id;
              $scope.cards[i].first_name = data[i].first_name;
              $scope.cards[i].picture1 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/1.jpg";
              $scope.cards[i].picture2 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/2.jpg";
              $scope.cards[i].picture3 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/3.jpg";
              $scope.cards[i].picture4 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/4.jpg";
              $scope.cards[i].picture5 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/5.jpg";
              $scope.cards[i].answer1 = data[i].answer1;
              $scope.cards[i].answer2 = data[i].answer2;
              $scope.cards[i].answer3 = data[i].answer3;
              $scope.cards[i].answer4 = data[i].answer4;
              $scope.cards[i].answer5 = data[i].answer5;
              $ionicSlideBoxDelegate.update();
            } else {
              // all other cards can be pushed elsewhere
              $scope.remainingCards[0].push({
                id:data[i].id, 
                first_name:data[i].first_name,
                picture1:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/1.jpg",
                picture2:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/2.jpg",
                picture3:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/3.jpg",
                picture4:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/4.jpg",
                picture5:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/5.jpg",
                answer1: data[i].answer1,
                answer2: data[i].answer2,
                answer3: data[i].answer3,
                answer4: data[i].answer4,
                answer5: data[i].answer5
              });
            }
          }
        }
      })
      .error(function(data,status,headers,config){
        //TODO errors
      });

})

// this directive allows for swiping, on a swipe we change the cards array by replacing what was swiped with details from a remaining Card

.directive("swipeable",['$ionicGesture','principal','$http',function($ionicGesture,principal,$http){
  return {
    restrict:"A",
    scope:true,
    link: function(scope,element,attrs){
        var startx = 0;
        var distx = 0;
        var starty = 0;
        var disty = 0;

      $ionicGesture.on('dragstart',function(e){
        startx = parseInt(e.gesture.touches[0].clientX);
        starty = parseInt(e.gesture.touches[0].clientY);
        distx = 0;
        disty = 0;
      },element);

      $ionicGesture.on('drag',function(e){
        var distx = parseInt(e.gesture.touches[0].clientX) - startx
        var disty = parseInt(e.gesture.touches[0].clientY) - starty
        element[0].parentNode.parentNode.children[0].style.left = (distx) + "px"
        element[0].parentNode.parentNode.children[0].style.top = (disty) + "px"
        
      },element);

      $ionicGesture.on('dragend',function(e){
        
        var distx = parseInt(e.gesture.touches[0].clientX) - startx
        var disty = parseInt(e.gesture.touches[0].clientY) - starty
        if (e.gesture.touches[0].clientX > 0.8*window.innerWidth && distx >0.3*window.innerWidth) { // disty >0.4*window.innerHeight
                
              //LIKED
              
              manageRemainingCards(element,scope,$http,true,principal)
              
            } else if (e.gesture.touches[0].clientX < 0.2*window.innerWidth && distx < -0.3 * window.innerWidth){// disty < -0.4 * window.innerHeight
              // DISLIKED
              manageRemainingCards(element,scope,$http,false,principal);
              
            } else {
              // did not swipe far enough, return back to original position
                element[0].parentNode.parentNode.children[0].style.left = "0";
                element[0].parentNode.parentNode.children[0].style.top = "0";
            }

      },element);
    }
  }
}])


.controller('SettingsCtrl', function($scope,$state,principal,$ionicLoading,$http){

  //prepopulate the params with what user's current preferences are
  
  $scope.preferred_min_age = principal.preferred_min_age;
  $scope.preferred_max_age = principal.preferred_max_age;
  $scope.preferred_distance = principal.preferred_distance/1000;
  $scope.today_before_five = principal.today_before_five || false;
  $scope.today_after_five = principal.today_after_five || false;
  $scope.tomorrow_before_five = principal.tomorrow_before_five || false;
  $scope.tomorrow_after_five = principal.tomorrow_after_five || false;
  $scope.coffee = principal.coffee || false;
  $scope.lunch = principal.lunch || false;
  $scope.dinner = principal.dinner || false;
  $scope.drinks = principal.drinks || false;

    $http.get(AppSettings.baseApiUrl + 'profiles/' +principal.facebook_id)
    .success(function(data,status,headers,config){

      $scope.coffee = data.coffee || false;
      $scope.lunch = data.lunch || false; 
      $scope.drinks = data.drinks || false;
      $scope.dinner = data.dinner || false;

      var updated_at = new Date(data.updated_availability);
      var currentDate = new Date();

      if (updated_at.toDateString() == currentDate.toDateString()){ // updated availability is the same date as today
        $scope.today_before_five = data.today_before_five || false;
        $scope.today_after_five = data.today_after_five || false;
        $scope.tomorrow_before_five = data.tomorrow_before_five || false;
        $scope.tomorrow_after_five = data.tomorrow_after_five || false; 
      } else { 
        //need to check when it was last updated
        var yesterday = new Date(currentDate.getTime() - 60*60*24*1000);

        //updated yesterday, that means 'tomorrow dates are already determined'...
        if (updated_at.toDateString() == yesterday.toDateString()){
          $scope.today_before_five =  data.tomorrow_before_five;
          $scope.today_after_five =   data.tomorrow_after_five;
          //TODO: set a 'not yet updated' for the days not yet entered
        }
        //last updated before yesterday, keep availability as false;
        //TODO: set a 'not yet updated' for all days
      }
    })
    .error(function(data,status,headers,config){
    }) 

  
  //save to server
  $scope.saveSettings = function(){
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
    var pd = $scope.preferred_distance*1000;

    var currentDate = new Date();
    var timezone = currentDate.getTimezoneOffset();
    
    $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,
      {
        profile:{
          preferred_min_age: $scope.preferred_min_age,
          preferred_max_age: $scope.preferred_max_age,
          preferred_distance: pd,
          today_before_five: $scope.today_before_five,
          today_after_five: $scope.today_after_five,
          tomorrow_before_five: $scope.tomorrow_before_five,
          tomorrow_after_five: $scope.tomorrow_after_five,
          coffee: $scope.coffee,
          lunch: $scope.lunch,
          drinks: $scope.drinks,
          dinner: $scope.dinner,
          updated_availability: currentDate,
          timezone: timezone
        }
      })
    .success(function(data,status,headers,config){
      
      principal.preferred_min_age = $scope.preferred_min_age;
      principal.preferred_max_age = $scope.preferred_max_age;
      principal.preferred_distance = pd; 
      principal.today_before_five = $scope.today_before_five;
      principal.today_after_five = $scope.today_after_five;
      principal.tomorrow_before_five = $scope.tomorrow_before_five;
      principal.tomorrow_after_five = $scope.tomorrow_after_five;
      principal.coffee = $scope.coffee;
      principal.lunch = $scope.lunch;
      principal.dinner = $scope.dinner;
      principal.drinks = $scope.drinks;

      $state.go('app.cards');
      $ionicLoading.hide();
    })
    .error(function(data,status,headers,config){
      
      $ionicLoading.hide();
    })
  }

  $scope.select_coffee = function(){
    $scope.coffee = !$scope.coffee;
  }
  $scope.select_drinks = function(){
    $scope.drinks = !$scope.drinks;
  }
  $scope.select_lunch = function(){
    $scope.lunch = !$scope.lunch;
  }
  $scope.select_dinner = function(){
    $scope.dinner = !$scope.dinner;
  }
  $scope.select_today_before_five = function(){
    $scope.today_before_five = !$scope.today_before_five; 
  }
  $scope.select_today_after_five = function(){
    $scope.today_after_five = !$scope.today_after_five;
  }
  $scope.select_tomorrow_before_five = function(){
    $scope.tomorrow_before_five = !$scope.tomorrow_before_five;
  }
  $scope.select_tomorrow_after_five = function(){
    $scope.tomorrow_after_five = !$scope.tomorrow_after_five;
  }
  
})

// show matches
.controller('MatchCtrl',function($scope,principal,$http,PushService){
  
  $scope.matches = PushService.matches = [];
  PushService.getMatches(principal.facebook_id);

})


// show chat messages
.controller('ChatCtrl',function($scope,$stateParams,$ionicScrollDelegate,$q,principal,$http,$timeout,PushService){
  
  $scope.messages = PushService.messages = [];
  $scope.getMoreMessages = PushService.getMoreMessages;
  $scope.timerData = PushService.timerData = {hours:"--",minutes:"--",seconds:"--",endTime:"",difference:""};
  
  PushService.getInitialMessages($stateParams.user_id);
  $scope.message = "";
  
  $scope.send_message = function(){

    if ($scope.message){
      var msg = $scope.message;
      // replace the message input box as blank
      $scope.message = ""; 
      //add the message to the array so it appear that it was sent right away, 
      //TODO: add some 'sending' notification somewhere in case of failures that you can replace that to 'failed'
      PushService.addMessagesToChat(principal.first_name, msg,principal.facebook_id);
      $ionicScrollDelegate.scrollBottom(true);
        
      // post message to server
      $http.post(AppSettings.baseApiUrl + 'messages',
        {message:
          {content:msg,
            profile_id:principal.id,
            recipient_id:$stateParams.user_id,
            sender_name:principal.first_name,
            sender_facebook_id:principal.facebook_id
          }
        })
      .success(function(data,status,headers,config){
        //successfully sent message
        
      })
      .error(function(data,status,headers,config){
        
        // TODO: set sending notification to 'failed to send and remove message from msgs'
        // TODO: also find the message you tried to send and remove it so user doesn't think the message was sent
        // Also replace add $scope.message = msg so that user can try resending the exact same message.
      })
    } 
  }
})

//login ctrl
.controller('LoginCtrl',function($scope,$state,$q,principal,$ionicLoading,$ionicPopup,$http,PushService){

    $scope.login= function(){
        $ionicLoading.show({
            templateUrl: "templates/loading.html"
          });
        facebookConnectPlugin.login(['public_profile','user_photos','user_birthday'],
        function(res){
          if (res.status === 'connected'){
            principal.isFBLoggedIn = true;
            console.log("logged into facebook successfully");
            postLoginPromises($q,principal,res,$state,$ionicLoading,$ionicPopup,$http,PushService);  
          } else {
            console.log("problem logging into facebook but successful attempt. Response: " + res.status);
            principal.isFBLoggedIn = false;
            //TODO: try logging out or sending a toast that there was an error
            $ionicLoading.hide();
          }
        }, 
        function(res){
          console.log("failed to login to facebook");
          //TODO: try logging out or sending a toast that there was an error
          console.error(res);
          $ionicLoading.hide();
      });
    }

    $scope.showLogin = false;

    $scope.slideHasChanged = function(i){
      if (i ==2){
        $scope.showLogin = true;
      } else {
        $scope.showLogin = false;
      }
    }
})

.controller('MenuCtrl',function($scope,$state,principal){
  

  $scope.logout= function(){

    facebookConnectPlugin.logout(
      function(){
        console.log("successfully logged out");
        principal.isFBLoggedIn = false;
        $state.go('app.login');
    },function(){
      console.log("failed to logout");
    });
  }
})


// resize each image in the crop modal to fit the page. This is necessary because there is no one css style that would work for
// different image sizes (portrait vs landscape)
// On image load, this directive determining whether to show 100% of height and partly crop width or 100% of width and crop height
// Also sets the crop square size
.directive("imageResizer",function(){
  return {
    restrict: "A",
    scope:true,
    link:function(scope,element,attrs){
      var phoneHeight = window.innerHeight;
      var phoneWidth = window.innerWidth;
      containerWidth = element[0].parentElement.clientWidth;
      containerHeight = element[0].parentElement.clientHeight;

      //need to bind on image load because otherwise the element has no height or width
      element.bind('load',function(){
        //get height and width
        imageHeight = element[0].offsetHeight; 
        imageWidth = element[0].offsetWidth;
        
        //determine if height is more important or less important in the image. 
        if (imageHeight / phoneHeight >= imageWidth / phoneWidth){
          //height more important, set image height to 100% and width to auto
          element[0].style.height = "100%";
          element[0].style.width = "auto";

          //recalculate new image dimensions to set cropping square dimensions
          imageHeight = element[0].offsetHeight; 
          imageWidth = element[0].offsetWidth;

          //since width is 338px vs height of 305px, the below is necessary to ensure we don't have too big a crop square
          if (imageWidth >= phoneWidth){
            originalCropHeight = imageHeight*0.9;
            originalCropWidth = originalCropHeight*338/305;
          } else {
            originalCropWidth = imageWidth*0.9;
            originalCropHeight = originalCropWidth*305/338;
          }
          
        } else {
          //width more important, set image width to 100% and height to auto
          element[0].style.width = "100%";
          element[0].style.height = "auto";

          //recalculate new image dimensions to set cropping square dimensions
          imageHeight = element[0].offsetHeight; 
          imageWidth = element[0].offsetWidth;
          
          //since width is 338px vs height of 305px, the below is necessary to ensure we don't have too big a crop square
          if (imageWidth <= imageHeight){
            originalCropWidth = imageWidth*0.9;
            originalCropHeight = originalCropWidth*305/338;
          } else {
            originalCropHeight = imageHeight*0.9;
            originalCropWidth = originalCropHeight*338/305;
          }
        }

        //set size and position of cropping square
        element[0].nextElementSibling.style.width = (originalCropWidth) + "px";
        element[0].nextElementSibling.style.height = (originalCropHeight) + "px";
        element[0].nextElementSibling.style.left = ((containerWidth - originalCropWidth)/2) +"px";
        element[0].nextElementSibling.style.top = ((containerHeight - originalCropHeight)/2) +"px";
      });

    }
  }
})

//cropper container for the image as well as the crop square
.directive("cropper",['$ionicGesture',function($ionicGesture){
  return {
    restrict:"A",
    scope:false,
    link: function(scope,element,attrs){
      startx = 0;
      starty = 0;
      leftPos = 0;
      topPos = 0;
      var phoneHeight = window.innerHeight;
      var phoneWidth = window.innerWidth;
      var mostLeft;
      var mostTop;
      var centerX;
      var centerY;
      var scale = 1;
      var lastScale = 1;

      
      $ionicGesture.on('transformstart',function(e){
        //track container dimensions
        containerHeight = element[0].clientHeight;
        containerWidth = element[0].clientWidth;

        //track original image dimensions
        originalImageHeight = element[0].children[0].offsetHeight; 
        originalImageWidth = element[0].children[0].offsetWidth;

        //each pinch has a different starting crop dimensions, we need to track this starting crop dimensions
        startingCropHeight = element[0].children[1].offsetHeight;
        startingCropWidth = element[0].children[1].offsetWidth;

        //track original left and original top
        originalLeft = element[0].children[1].offsetLeft;
        originalTop = element[0].children[1].offsetTop;

        //track original center of image
        imageCenterX = (element[0].children[0].offsetLeft + element[0].children[0].offsetWidth)/2
        imageCenterY = (element[0].children[0].offsetTop + element[0].children[0].offsetHeight)/2
        
        //track original crop square dimensions 
        if (element[0].children[0].style.height =="100%"){
          if (imageWidth >= phoneWidth){
            originalCropHeight = imageHeight*0.9;
            originalCropWidth = originalCropHeight*338/305;
          } else {
            originalCropWidth = imageWidth*0.9;
            originalCropHeight = originalCropWidth*305/338;
          }
        } else {
          if (imageWidth <= imageHeight){
            originalCropWidth = imageWidth*0.9;
            originalCropHeight = originalCropWidth*305/338;
          } else {
            originalCropHeight = imageHeight*0.9;
            originalCropWidth = originalCropHeight*338/305;
          }
        }


      },element)

      $ionicGesture.on('transform',function(e){ 
        // track scale because on 'transformend' e.gesture.scale equals 1 so we need the last scale that wasn't 1
        scale = e.gesture.scale;
        newHeight = startingCropHeight*scale
        newWidth = startingCropWidth*scale
        deltaHeight = newHeight - startingCropHeight;
        deltaWidth = newWidth - startingCropWidth;
        newLeft = originalLeft - deltaWidth/2;
        newTop = originalTop - deltaHeight/2;

        if (newHeight <= originalImageHeight && newWidth <= originalImageWidth && newHeight >= 100 && newWidth >= 111){
          element[0].children[1].style.height = (newHeight) + "px";
          element[0].children[1].style.width =  (newWidth) + "px";
          element[0].children[1].style.left = (newLeft) + "px";
          element[0].children[1].style.top = (newTop) + "px";
          leftPos = element[0].children[1].offsetLeft;
          topPos = element[0].children[1].offsetTop;
        } 

      },element)

      $ionicGesture.on('transformend',function(e){
          // // shiftX = -centerX*(1-1/scale)
          // // shiftY = -centerY*(1-1/scale)

          centerX = element[0].children[1].offsetWidth/2 + element[0].children[1].offsetLeft;
          centerY = element[0].children[1].offsetHeight/2 + element[0].children[1].offsetTop;

          toScale = Math.min(newHeight / startingCropHeight,newWidth / startingCropWidth)

          centerDifferenceX = imageCenterX / centerX;
          centerDifferenceY = imageCenterY / centerY;
          scalePercent = min(centerDifferenceY,centerDifferenceX);
          
          shiftX = (centerX - imageCenterX)*(scalePercent-1)*-1;
          shiftY = (centerY - imageCenterY)*(scalePercent-1)*-1;

          // if (toScale<=0.7){
            //transform image
            element[0].children[0].style.transform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
            element[0].children[0].style.webkitTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
            element[0].children[0].style.MozTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
            element[0].children[0].style.msTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
            element[0].children[0].style.OTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'  
            element[0].children[1].style.width = (element[0].children[1].offsetWidth * scalePercent) + "px";
            element[0].children[1].style.height = (element[0].children[1].offsetHeight * scalePercent) + "px";
            element[0].children[1].style.left = (element[0].children[1].offsetLeft - (centerX-imageCenterX)/2) + "px";
            element[0].children[1].style.top = (element[0].children[1].offsetTop - (centerX-imageCenterY)/2) + "px";
          // } else if (toScale >=1.3){
          //   element[0].children[0].style.transform = 'scale3d(1,1,1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
          //   element[0].children[0].style.webkitTransform = 'scale3d(1,1,1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
          //   element[0].children[0].style.MozTransform = 'scale3d(1,1,1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
          //   element[0].children[0].style.msTransform = 'scale3d(1,1,1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'
          //   element[0].children[0].style.OTransform = 'scale3d(1,1,1) translate3d(' + shiftX + 'px,' + shiftY + 'px,0)'  
          //   element[0].children[1].style.width = (element[0].children[1].offsetWidth * scalePercent) + "px";
          //   element[0].children[1].style.height = (element[0].children[1].offsetHeight * scalePercent) + "px";
          //   element[0].children[1].style.left = (element[0].children[1].offsetLeft - (centerX-imageCenterX)/2) + "px";
          //   element[0].children[1].style.top = (element[0].children[1].offsetTop - (centerX-imageCenterY)/2) + "px";
          // }

      },element)
      
      $ionicGesture.on('dragstart',function(e){
        startx = parseInt(e.gesture.touches[0].clientX);
        starty = parseInt(e.gesture.touches[0].clientY);
        widthDuringDrag = element[0].children[1].offsetWidth;
        heightDuringDrag = element[0].children[1].offsetHeight;
        imageWidth = element[0].children[0].offsetWidth;
        imageHeight = element[0].children[0].offsetHeight;
      
        if (imageHeight / phoneHeight >= imageWidth / phoneWidth){
          mostLeft = Math.max(0,Math.floor((containerWidth-imageWidth)/2));
          mostTop = 0;
        } else {
          mostLeft = 0;
          mostTop = Math.max(0,Math.floor((containerHeight - imageHeight)/2));
        }

        if ( imageHeight >=containerHeight){
          heightToCheck = containerHeight;
        } else {
          heightToCheck = Math.max(imageHeight,containerHeight - mostTop);
        }

        if (imageWidth >= containerWidth ){
          widthToCheck = containerWidth;
        } else {
          widthToCheck = Math.max(imageWidth,containerWidth - mostLeft);  
        }
        
        if (scope.newImage.newImage){
          leftPos = element[0].children[1].offsetLeft;
          topPos = element[0].children[1].offsetTop;
          scope.newImage.newImage = false;
        }

        // console.log("imageHeight " + imageHeight + " imageWidth " + imageWidth + " heightDuringDrag " + heightDuringDrag + " widthDuringDrag " + widthDuringDrag);
        console.log("mostLeft =" + mostLeft + " mostTop =" + mostTop);
      },element);

      $ionicGesture.on('drag',function(e){
        var distx = parseInt(e.gesture.touches[0].clientX) - startx
        var disty = parseInt(e.gesture.touches[0].clientY) - starty
        // console.log("leftPos: " + leftPos + " distx " + distx + " topPos " + topPos + " disty " + disty);


        if (leftPos + distx >= mostLeft && topPos + disty >= mostTop && leftPos+widthDuringDrag+distx <=widthToCheck && topPos + disty + heightDuringDrag <=heightToCheck){
          // if drag has not touched sides allow drag anywhere
          element[0].children[1].style.left = (leftPos + distx) + "px";
          element[0].children[1].style.top = (topPos + disty) + "px";   
        } else if (leftPos +distx < mostLeft){
          //if drag has touched left side...
          if (topPos + disty + heightDuringDrag > heightToCheck){
            // and drag has also touched bottom, keep the drag at bottom left
            element[0].children[1].style.left = (mostLeft) + "px";
            element[0].children[1].style.top = (heightToCheck - heightDuringDrag) + "px";  
          } else if (topPos + disty>= mostTop) {
            //drag touched left side but not bottom, allow it to move up and down on left side 
            element[0].children[1].style.left = (mostLeft) + "px";
            element[0].children[1].style.top = (topPos + disty) + "px";
          } else if (leftPos +distx < mostLeft && topPos + disty< mostTop) {
            //drag touched left side and top, do not allow it to move any higher
            element[0].children[1].style.left = (mostLeft) + "px";
            element[0].children[1].style.top = (mostTop) + "px";
          }
        } else if (topPos + disty< mostTop){
          //drag touched top 
          if (leftPos + distx >=mostLeft && leftPos+widthDuringDrag+distx <=widthToCheck){
            //and being dragging between top left and top right, allow movement left and right along top
            element[0].children[1].style.top = (mostTop) + "px";
            element[0].children[1].style.left = (leftPos + distx) + "px";
          } else if (leftPos +distx <mostLeft){
            //drag touched top and left, keep at top left
            element[0].children[1].style.left = (mostLeft) + "px";
            element[0].children[1].style.top = (mostTop) + "px";
          } else if (leftPos+widthDuringDrag+distx >widthToCheck){
            //drag touched top and right, keep at top right
            element[0].children[1].style.top = (mostTop) + "px";  
            element[0].children[1].style.left = (widthToCheck - widthDuringDrag) + "px";
          } 
        } else if (leftPos+widthDuringDrag+distx >widthToCheck){
          //drag touching right side
          if (topPos + disty + heightDuringDrag > heightToCheck){
            //and also touching bottom, keep at bottom
            element[0].children[1].style.top = (heightToCheck - heightDuringDrag) + "px";  
            element[0].children[1].style.left = (widthToCheck - widthDuringDrag) + "px";
          } else {
            //allow movement
            element[0].children[1].style.top = (topPos + disty) + "px";
            element[0].children[1].style.left = (widthToCheck - widthDuringDrag) + "px";
          }
        } else if (topPos + disty + heightDuringDrag > heightToCheck){
          //allow dragging along bottom
          element[0].children[1].style.left = (leftPos + distx) + "px";
          element[0].children[1].style.top = (heightToCheck - heightDuringDrag) + "px";
        }
      

      },element);

      $ionicGesture.on('dragend',function(e){
        leftPos = element[0].children[1].offsetLeft;
        topPos = element[0].children[1].offsetTop;
        

      },element);
    }

  }
}])


.controller('ChoosePhotosCtrl',function($scope,$ionicModal,$timeout,principal,$http,$state,$q,$ionicLoading,$ionicNavBarDelegate){
  

  $scope.number_selected = 0;
  $scope.showChangeImage = false;
  $scope.showSwapImage = false;
  $scope.second_selected = null;
  $scope.cropShown = false;
  $scope.newImage = { newImage: true};
  $scope.selected_photo = null;
  $scope.croppedImageDetails = [{top:0,left:0,height:305,width:338},{top:0,left:0,height:305,width:338},{top:0,left:0,height:305,width:338},{top:0,left:0,height:305,width:338},{top:0,left:0,height:305,width:338}]

  // we add currentTime to the image so that if the image is cached on the users phone, 
  // then looking for image.jpg?someothertimehere will trigger the phone to look for another image
  var currentTime = new Date().getTime();

  // variable firstClick is true when you first enter this controller. on clicking an image (ie selectImageToEdit method) this becomes false
  // if it's the first time an image is clicked we want to load more facebook images. that's why this needs to be true the first time entering this controller
  $scope.firstClick = true;

  // the stateParameters isFirstTime comes only when the user is a first time user. In that case hide the navigation buttons  
  if ($state.fromState.name == 'app.choose_answers' && $state.toStateParams.firstTime == 'isFirstTime'){
    $timeout(function(){
      $scope.hideBack = true;
      $ionicNavBarDelegate.showBackButton(false);
    });
  } 
  
  //the view uses the url parameter
  $scope.image_infos = [{ url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/1.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(0);},selected_image:false },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/2.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(1);},selected_image:false },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/3.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(2);},selected_image:false },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/4.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(3);},selected_image:false },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/5.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(4);},selected_image:false }]
    
  //photourls loaded for fb
  $scope.photoUrls = [];
  $scope.next_page = "";
  $scope.firstload=true; 
  $scope.currently_selected = null;

  //define the photos_modal: this modal shows all the images from facebook
  $ionicModal.fromTemplateUrl('templates/photos_modal.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal,t){
    $scope.modal = modal;
  });

  //define crop picture modal: this modal shows 1 image which the user can crop
  $ionicModal.fromTemplateUrl('templates/crop_modal.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(crop,t){
    $scope.crop = crop;
  });

  // this button in the photos modal, clicking back hides the modal
  $scope.goBack = function(){
    $scope.modal.hide();
    $scope.currently_selected = null; 
  }

  //this button in crop modal, clicking back hides the crop modal
  $scope.goBackCropPage = function(){
    $scope.crop.hide();
    $scope.cropShown=false;
    
  }
  
  //monitor which profile image the user wants to change
  function selectImageToEdit(n){
    if ($scope.number_selected == 0){
      //nothing selected yet, select image
      $scope.currently_selected = n;
      $scope.image_infos[n].selected_image = !$scope.image_infos[n].selected_image;
      $scope.number_selected = 1;
      $scope.showChangeImage = true;
    } else if ($scope.number_selected == 1){
      // 1 image already selected, see if clicked image is that image
      if ($scope.currently_selected == n) {
        //deselect image cause image is already selected
        $scope.image_infos[n].selected_image = !$scope.image_infos[n].selected_image;
        $scope.currently_selected = null;
        $scope.number_selected = 0;
        $scope.showChangeImage = false;
      } else {
        //select a second image since clicked image is not already selected
        $scope.second_selected = n;
        $scope.image_infos[n].selected_image = !$scope.image_infos[n].selected_image;
        $scope.number_selected = 2;
        $scope.showChangeImage = false;
        $scope.showSwapImage = true;
      }
    } else {
      //number selected is 2
      if ($scope.second_selected == n){
        //deselect
        $scope.second_selected = null;
        $scope.image_infos[n].selected_image = !$scope.image_infos[n].selected_image;
        $scope.number_selected = 1;
        $scope.showChangeImage = true;
        $scope.showSwapImage = false;
      } else if ($scope.currently_selected == n) {
        $scope.currently_selected = $scope.second_selected;
        $scope.second_selected = null;
        console.log("currently selected is " +$scope.currently_selected);
        $scope.image_infos[n].selected_image = !$scope.image_infos[n].selected_image;
        $scope.number_selected = 1;
        $scope.showChangeImage = true;
        $scope.showSwapImage = false;
      }
    } 
    
  }

  //allows user to remove image
  $scope.removeImage = function(){
    $scope.number_selected = 0;
    $scope.showChangeImage = false;
    $scope.image_infos[$scope.currently_selected].selected_image = !$scope.image_infos[$scope.currently_selected].selected_image;
    
    if ($scope.currently_selected == 0) {
      $scope.image_infos[$scope.currently_selected].url = AppSettings.amazonBaseUrl + "app/public/iconlight.jpg";
    } else {
      $scope.image_infos[$scope.currently_selected].url = AppSettings.amazonBaseUrl + "app/public/icondark.jpg";
    }
    $scope.currently_selected = null;
  }

  //selecting this brings up the facebook pictures modal
  $scope.changeImage = function(){
    $scope.modal.show();
    if ($scope.firstClick){
      $scope.loadMore();
      $scope.firstClick = false;
    } 
    $scope.image_infos[$scope.currently_selected].selected_image = !$scope.image_infos[$scope.currently_selected].selected_image;
    $scope.number_selected = 0;
    $scope.showChangeImage = false;
  }

  //swap 2 images to change orientation
  $scope.swapImage = function(){
    tempurl = $scope.image_infos[$scope.currently_selected].url
    $scope.image_infos[$scope.currently_selected].url = $scope.image_infos[$scope.second_selected].url;
    $scope.image_infos[$scope.second_selected].url = tempurl;
    $scope.image_infos[$scope.currently_selected].selected_image = !$scope.image_infos[$scope.currently_selected].selected_image;
    $scope.image_infos[$scope.second_selected].selected_image = !$scope.image_infos[$scope.second_selected].selected_image;
    $scope.number_selected = 0;
    $scope.showSwapImage = false;
    $scope.currently_selected = null;
    $scope.second_selected = null;
  }

  //user has saved cropped image
  $scope.saveCroppedImage = function(){
    $scope.image_infos[$scope.currently_selected].url = $scope.selected_photo;  
    $scope.crop.hide();

    //save location and size details of cropped immage
    $scope.croppedImageDetails[$scope.currently_selected].height = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetHeight;
    $scope.croppedImageDetails[$scope.currently_selected].width = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetWidth;
    $scope.croppedImageDetails[$scope.currently_selected].top = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetTop;
    $scope.croppedImageDetails[$scope.currently_selected].left = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetLeft;

    $scope.cropShown=false;
    
  }

  //user has just selected picture to edit / crop
  $scope.selectPictureForProfile = function(t){
    
    if (typeof($scope.currently_selected)!="null"){
      $scope.selected_photo = t.photo;  
    }
    $scope.modal.hide();
    $scope.cropShown = true;
    $scope.newImage.newImage = true;
    $scope.crop.show();
  }
  
  // send data to server
  $scope.save_photos = function(){
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
      console.log("save photos clicked");
      if($state.toStateParams.firstTime == 'isFirstTime'){
        $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,{profile:{
          picture1_url: $scope.image_infos[0].url,
          picture2_url: $scope.image_infos[1].url,
          picture3_url: $scope.image_infos[2].url,
          picture4_url: $scope.image_infos[3].url,
          picture5_url: $scope.image_infos[4].url,
          today_before_five: false,
          today_after_five: false,
          tomorrow_before_five: false,
          tomorrow_after_five: false,
          coffee: false,
          lunch: false,
          dinner: false,
          drinks: false
        }})
        .success(function(data, status, headers, config){
          $ionicLoading.hide();
            $state.go('app.availability');
        }).error(function(data, status, headers, config){
          $ionicLoading.hide();
        });
      } else {
        $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,{profile:{
          picture1_url: $scope.image_infos[0].url,
          picture2_url: $scope.image_infos[1].url,
          picture3_url: $scope.image_infos[2].url,
          picture4_url: $scope.image_infos[3].url,
          picture5_url: $scope.image_infos[4].url
        }})
        .success(function(data, status, headers, config){
          $ionicLoading.hide();
            $state.go('app.cards');
        }).error(function(data, status, headers, config){
          $ionicLoading.hide();
        });
      }
      
  }


  // this function is executed when the user hits the bottom of the infinite scroll or the first time the user selects an image to edit (selectImageToEdit)
  $scope.loadMore = function(){
    
    if ($scope.next_page){
      $http.get($scope.next_page).success(function(res){
        for (i = 0; i < res.data.length; i++){
          $scope.photoUrls.push(res.data[i].images[3].source);//res.data[i].images.length-2
         }
         if (typeof(res.paging)!='undefined'){
          $scope.next_page = res.paging.next; 
         } else {
          $scope.next_page = "";
         }
         $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    } else if ($scope.firstload) {
      
      facebookConnectPlugin.api('/me/photos?limit=9',['public_profile','user_photos','user_birthday'],
        function(res){
          for (i = 0; i < res.data.length; i++){
            $scope.photoUrls.push(res.data[i].images[3].source); //res.data[i].images.length-2
           }
           if (typeof(res.paging)!='undefined'){
            $scope.next_page = res.paging.next; 
           } else {
            $scope.next_page = "";
           }
           $scope.firstload = false;
           $scope.$broadcast('scroll.infiniteScrollComplete');
        },
        function(fail){
          // TODO: show no photos if failed to get photos.
          console.log(fail);
        });
    }
  }

})

//these directives used to control the size of photos in choose_photos page

.directive("vwTwenty",function(){
  return {
    restrict:"A",
    link: function(scope,element,attrs){
      var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      element[0].style.fontSize = w/5+"px";
      element[0].style.height = w/5+"px";
    }
  }
})
.directive("vhFifty",function(){
  return {
    restrict:"A",
    link: function(scope,element,attrs){
      var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      element[0].style.fontSize = h/2+"px";
      element[0].style.height = h/2+"px";
    }
  }
})



.controller('ChooseAnswersCtrl',function($scope,$state,principal,$http,$ionicLoading,PushService,$q,$ionicNavBarDelegate,$timeout){

  $scope.answers = {};

  if (!principal.firstTimeUser){
    //populate answers if not the users first time
    $scope.answers.answer1 = principal.answer1;
    $scope.answers.answer2 = principal.answer2;
    $scope.answers.answer3 = principal.answer3;
    $scope.answers.answer4 = principal.answer4;
    $scope.answers.answer5 = principal.answer5;
    //scope.firstTime is used in an ngHide to hide navigation buttons. Since it's not first time, no need to hide
    $scope.firstTime = false;
  } else {
    //scope.firstTime is used in an ngHide to hide navigation buttons. Since first time, need to hide navigation buttons
    $scope.firstTime = true;
    //timeout need to active $apply and to propagate change to the view. 
    $timeout(function(){
      $ionicNavBarDelegate.showBackButton(false);
    });
  }

  //possible answers to the questions
  $scope.question_1_answers = [{value:'Hooking up?'},{value:'Casual dating but not necessarily hookups?'},{value:'Something more serious?'}];
  $scope.question_2_answers = [{value:'Really Short'},{value:'Kinda Short'},{value:'Average'},{value:'Above Average'},{value:'Really Tall'}];
  $scope.question_3_answers = [{value:'Skinny'},{value:'Athletic'},{value:"There's more important things than body type"}];
  $scope.question_4_answers = [{value:'answer 1'},{value:'answer 2'}];
  $scope.question_5_answers = [{value:'answer 1'},{value:'answer 2'}];

  //ng hide information (setting to true causes the information to hide with an animation that slides it up)
  $scope.hide1 = false;
  $scope.hide2 = false;
  $scope.hide3 = false;
  $scope.hide4 = false;
  $scope.hide5 = false;
  
  // on clicking an answer we want to hide the answer so we set the below attributes to true. (They are watched by ng-hide)
  $scope.hide_q1 = function(){
    $scope.hide1 = true;
  }
  $scope.hide_q2 = function(){
    $scope.hide2 = true;
  }
  $scope.hide_q3 = function(){
    $scope.hide3 = true;
  }
  $scope.hide_q4 = function(){
    $scope.hide4 = true;
  }
  $scope.hide_q5 = function(){
    $scope.hide5 = true;
  }
  $scope.show_q1 = function(){
    $scope.hide1 = false;
  }
  $scope.show_q2 = function(){
    $scope.hide2 = false;
  }
  $scope.show_q3 = function(){
    $scope.hide3 = false;
  }
  $scope.show_q4 = function(){
    $scope.hide4 = false;
  }
  $scope.show_q5 = function(){
    $scope.hide5 = false;
  }

  //on clicking answer questions...
  $scope.answerQuestions = function(){

    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });

    if (principal.firstTimeUser){
      //first time users we need to send the 5 answers to the server and all the details that we saved on logging in and making calls to FB.
      // see the postLoginPromises function for more details
      $scope.answers.facebook_id = principal.facebook_id;    
      $scope.answers.age = principal.age;
      $scope.answers.first_name = principal.first_name;
      $scope.answers.latitude = principal.latitude;
      $scope.answers.longitude = principal.longitude;
      var preferred_min_age = Math.round(principal.age/2)+7;
      var preferred_max_age = (principal.age-7)*2;
      $scope.answers.preferred_min_age = Math.max(preferred_min_age,18);
      $scope.answers.preferred_max_age = Math.max(preferred_max_age,18);
      $scope.answers.preferred_gender = (principal.gender == 'male')? 'female' : 'male'; 
      $scope.answers.preferred_sound = true;
      $scope.answers.preferred_distance = 25000;
      $scope.answers.gender = principal.gender; 
      principal.answer1 = $scope.answers.answer1;
      principal.answer2 = $scope.answers.answer2;
      principal.answer3 = $scope.answers.answer3;
      principal.answer4 = $scope.answers.answer4;
      principal.answer5 = $scope.answers.answer5;
      principal.preferred_min_age = $scope.answers.preferred_min_age;
      principal.preferred_max_age = $scope.answers.preferred_max_age;
      principal.preferred_distance = $scope.answers.preferred_distance;

      // send the details to server. 
      $http.post(AppSettings.baseApiUrl + 'profiles',{profile:$scope.answers})
      .success(function(data,status,headers,config){
        //on success, register for push notifications and route the user to the photos page with the parameter that it is a first time user
        //hide the loading page
        $ionicLoading.hide();
        principal.firstTimeUser = false;
        $state.go('app.choose_photos',{firstTime:'isFirstTime'});
        PushService.registerForPush();
      })
      .error(function(data,status,headers,config){
        console.log(data);
        console.log(config);
        //put toast to say error sending answers
        $ionicLoading.hide();
      });
    } else {
      principal.answer1 = $scope.answers.answer1;
      principal.answer2 = $scope.answers.answer2;
      principal.answer3 = $scope.answers.answer3;
      principal.answer4 = $scope.answers.answer4;
      principal.answer5 = $scope.answers.answer5;
      // send 5 answers to servers
      
      $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,{profile:$scope.answers})
      .success(function(data,status,headers,config){
        console.log(data);
        $ionicLoading.hide();
        $state.go('app.cards');
      })
      .error(function(data,status,headers,config){
        console.log(data);
        console.log(config);
        //put toast to say error sending answers
        $ionicLoading.hide();
      });
    }
  }
})

.controller('TypeCtrl',function($scope,$state,$ionicNavBarDelegate,$timeout,$http,principal){
  if (($state.fromState.name == 'app.availability') || $state.fromState.name == 'app.login'){
    $timeout(function(){
      $ionicNavBarDelegate.showBackButton(false);
    });
  }  
  $scope.coffee = false;
  $scope.lunch = false;
  $scope.drinks = false;
  $scope.dinner = false;

  $http.get(AppSettings.baseApiUrl + 'profiles/' +principal.facebook_id)
  .success(function(data,status,headers,config){
    $scope.coffee = data.coffee || false;
    $scope.lunch = data.lunch || false; 
    $scope.drinks = data.drinks || false;
    $scope.dinner = data.dinner || false;

  })
  .error(function(data,status,headers,config){
  })

  $scope.save = function(){
      principal.coffee = $scope.coffee;
      principal.lunch = $scope.lunch;
      principal.dinner = $scope.dinner;
      principal.drinks = $scope.drinks;
      $http.put(AppSettings.baseApiUrl + 'profiles/' + principal.facebook_id,
      {
        profile:{
          coffee: $scope.coffee,
          lunch: $scope.lunch,
          drinks: $scope.drinks,
          dinner: $scope.dinner,
        }
      })
      .success(function(data,status,headers,config){
        $state.go('app.cards');
      })
      .error(function(data,status,headers,config){
      }) 
  }

  $scope.select_coffee = function(){
    $scope.coffee = !$scope.coffee;
  }
  $scope.select_drinks = function(){
    $scope.drinks = !$scope.drinks;
  }
  $scope.select_lunch = function(){
    $scope.lunch = !$scope.lunch;
  }
  $scope.select_dinner = function(){
    $scope.dinner = !$scope.dinner;
  }

})

.controller('AvailabilityCtrl', function($scope,$state,principal,$http,$ionicNavBarDelegate,$timeout) {

  if (($state.fromState.name == 'app.choose_photos' && $state.toStateParams.firstTime == 'isFirstTime') || $state.fromState.name == 'app.login'){
    $timeout(function(){
      $ionicNavBarDelegate.showBackButton(false);
    });
  }
  
  $scope.today_before_five = false;
  $scope.today_after_five = false;
  $scope.tomorrow_before_five = false;
  $scope.tomorrow_after_five = false;
  $scope.remember_availability = false;

  $http.get(AppSettings.baseApiUrl + 'profiles/' +principal.facebook_id)
  .success(function(data,status,headers,config){
    console.log(data);
    var updated_at = new Date(data.updated_availability);
    var currentDate = new Date();
    if (data.remember_availability){
      $scope.today_before_five = data.today_before_five || false;
      $scope.today_after_five = data.today_after_five || false;
      $scope.tomorrow_before_five = data.tomorrow_before_five || false;
      $scope.tomorrow_after_five = data.tomorrow_after_five || false; 
      $scope.remember_availability = true;

    } else if (updated_at.toDateString() == currentDate.toDateString()){ // updated availability is the same date as today
      $scope.today_before_five = data.today_before_five || false;
      $scope.today_after_five = data.today_after_five || false;
      $scope.tomorrow_before_five = data.tomorrow_before_five || false;
      $scope.tomorrow_after_five = data.tomorrow_after_five || false; 
    } else { 
      //need to check when it was last updated
      var yesterday = new Date(currentDate.getTime() - 60*60*24*1000);

      //updated yesterday, that means 'tomorrow dates are already determined'...
      if (updated_at.toDateString() == yesterday.toDateString()){
        $scope.today_before_five =  data.tomorrow_before_five;
        $scope.today_after_five =   data.tomorrow_after_five;
        //TODO: set a 'not yet updated' for the days not yet entered
      }
      //last updated before yesterday, keep availability as false;
      //TODO: set a 'not yet updated' for all days
    }
  })
  .error(function(data,status,headers,config){
  }) 

  $scope.save = function(){
    var currentDate = new Date();
    var timezone = currentDate.getTimezoneOffset();
    principal.today_before_five = $scope.today_before_five,
    principal.today_after_five = $scope.today_after_five,
    principal.tomorrow_before_five = $scope.tomorrow_before_five,
    principal.tomorrow_after_five = $scope.tomorrow_after_five,

    $http.put(AppSettings.baseApiUrl + 'profiles/' + principal.facebook_id,
    {
      profile:{
        today_before_five: $scope.today_before_five,
        today_after_five: $scope.today_after_five,
        tomorrow_before_five: $scope.tomorrow_before_five,
        tomorrow_after_five: $scope.tomorrow_after_five,
        updated_availability: currentDate,
        remember_availability: $scope.remember_availability,
        timezone: timezone
      }
    })
    .success(function(data,status,headers,config){
      console.log(data)
      //Go to somewhere else
      $state.go('app.type_of_date');
    })
    .error(function(data,status,headers,config){
      
    }) 
  }

  $scope.select_today_before_five = function(){
    $scope.today_before_five = !$scope.today_before_five; 
  }
  $scope.select_today_after_five = function(){
    $scope.today_after_five = !$scope.today_after_five;
  }
  $scope.select_tomorrow_before_five = function(){
    $scope.tomorrow_before_five = !$scope.tomorrow_before_five;
  }
  $scope.select_tomorrow_after_five = function(){
    $scope.tomorrow_after_five = !$scope.tomorrow_after_five;
  }
})


// determine what cards are displayed by replacing the element that was swiped in scope.cards with an element from scope.remainingCards
function manageRemainingCards(element,scope,http,liked,principal){
    
  if (liked){
    //move to the right off screen
    element[0].parentNode.parentNode.children[0].style.left = (window.innerWidth) + "px" 
  } else {
    // move left off screen
    element[0].parentNode.parentNode.children[0].style.right = "0" 
  }
    
    
    var scopeNames = []
    var remainingNames= []
    for (k=0;k<scope.cards.length;k++){
      scopeNames.push(scope.cards[k].first_name);
    }

    for(r=0;r<scope.remainingCards[0].length;r++){
      remainingNames.push(scope.remainingCards[0][r].first_name);
    }
    console.log(scopeNames);
    console.log(remainingNames);
    console.log(scope.cardPosition[0]);
    // upload swipe details asynchronously
    uploadSwipeDetails(http,liked,scope.cards[scope.cardPosition[0]%5],principal)

    // replace this card with new data and move it back into position
 
    console.log(scope.remainingCards[0].length);

    if (scope.cardPosition[0] < scope.remainingCards[0].length){
      scope.cards[scope.cardPosition[0]%5].id = scope.remainingCards[0][scope.cardPosition[0]].id;
      scope.cards[scope.cardPosition[0]%5].first_name = scope.remainingCards[0][scope.cardPosition[0]].first_name;
      scope.cards[scope.cardPosition[0]%5].picture1 = scope.remainingCards[0][scope.cardPosition[0]].picture1;  
      scope.cards[scope.cardPosition[0]%5].picture2 = scope.remainingCards[0][scope.cardPosition[0]].picture2;  
      scope.cards[scope.cardPosition[0]%5].picture3 = scope.remainingCards[0][scope.cardPosition[0]].picture3;  
      scope.cards[scope.cardPosition[0]%5].picture4 = scope.remainingCards[0][scope.cardPosition[0]].picture4;  
      scope.cards[scope.cardPosition[0]%5].picture5 = scope.remainingCards[0][scope.cardPosition[0]].picture5;  
      scope.cards[scope.cardPosition[0]%5].answer1 = scope.remainingCards[0][scope.cardPosition[0]].answer1;  
      scope.cards[scope.cardPosition[0]%5].answer2 = scope.remainingCards[0][scope.cardPosition[0]].answer2;  
      scope.cards[scope.cardPosition[0]%5].answer3 = scope.remainingCards[0][scope.cardPosition[0]].answer3;  
      scope.cards[scope.cardPosition[0]%5].answer4 = scope.remainingCards[0][scope.cardPosition[0]].answer4;  
      scope.cards[scope.cardPosition[0]%5].answer5 = scope.remainingCards[0][scope.cardPosition[0]].answer5;  
      element[0].style.left = "0" 
      element[0].style.top = "0";
      // set z index back 5
      element[0].style.zIndex -= 5;
    } else {
      // Since card position > remainingCards we no longer need to replace cards with remaining cards. 
      // However we do need to hide the element and set it back to its original place. This is done by changing id = "" which is watch by ng-hide
      scope.cards[scope.cardPosition[0]%5].id = "";
      
      //TODO set a timeout on this because the ng-hide is taking a few seconds and it doesn't look good.
      element[0].parentNode.parentNode.children[0].style.left = "0" ;  
      element[0].parentNode.parentNode.children[0].style.top = "0";
    }

    //increment card position
    scope.cardPosition[0] = scope.cardPosition[0]+1;

    if (scope.cardPosition[0] == scope.remainingCards[0].length+5 || 
    (scope.cards[0].id=="" && scope.cards[1].id=="" && scope.cards[2].id=="" && scope.cards[3].id=="" && scope.cards[4].id=="")) {
      // 5 makes up for first 5 in cards array 
      // pull only on last remaining card
      //show a loading screen and hide it when getMoreProfiles completes
      getMoreProfiles(http,scope,principal);
      //since last remaining card, we can clear remainingCards and scope cards and start from scratch.
    }

}


function uploadSwipeDetails(http,likes,card,principal){
  console.log("uploaded"+card.first_name);
  http.post(AppSettings.baseApiUrl + 'matches',{match:{likes:likes,swipee_name:card.first_name,swipee_id:card.id,profile_id:principal.id}})
  .success(function(data,status,headers,config){
    console.log(data);
    console.log(config);
  })
  .error(function(data,status,headers,config){
    console.log(config);
    console.log("failed swipe");
  }) 
}

function getMoreProfiles(http,scope,principal){
  console.log("getting more profiles");
  console.log(scope.skip_ids);
  http.get(AppSettings.baseApiUrl + 'profiles',{params:{facebook_id:principal.facebook_id,skip_ids:JSON.stringify(scope.skip_ids)}})
  .success(function(data,status,headers,config){
    // if the data.length > 0 call to server found more profiles
    if (data.length){
      //reset remaining cards and cardPosition
      scope.remainingCards[0] = [];
      scope.cardPosition[0] = 0;
      var n = 0;
      for (i=0;i<data.length;i++){
        scope.skip_ids.push(data[i].id);
        if (n <5){
          console.log("adding..." + data[i].first_name + "to scope cards");
          scope.cards[n].id = data[i].id;
          scope.cards[n].first_name = data[i].first_name;
          scope.cards[n].picture1 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/1.jpg";
          scope.cards[n].picture2 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/2.jpg";
          scope.cards[n].picture3 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/3.jpg";
          scope.cards[n].picture4 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/4.jpg";
          scope.cards[n].picture5 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/5.jpg";
          scope.cards[n].answer1 = data[i].answer1;
          scope.cards[n].answer2 = data[i].answer2;
          scope.cards[n].answer3 = data[i].answer3;
          scope.cards[n].answer4 = data[i].answer4;
          scope.cards[n].answer5 = data[i].answer5;
          n +=1;
        } else {
          console.log("adding..." + data[i].first_name + "to remaining cards");
          scope.remainingCards[0].push({
            id:data[i].id, 
            first_name:data[i].first_name,
            picture1:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/1.jpg",
            picture2:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/2.jpg",
            picture3:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/3.jpg",
            picture4:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/4.jpg",
            picture5:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/5.jpg",
            answer1: data[i].answer1,
            answer2: data[i].answer2,
            answer3: data[i].answer3,
            answer4: data[i].answer4,
            answer5: data[i].answer5
          });  
        }
      }
    } else {
      // TODO No more data! show a 'no more data page where you can pull down to try again.'
    }
  })
  .error(function(data,status,headers,config){
    //TODO errors
  });
}