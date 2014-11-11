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
// RateCtrl -> templates/rate.html


  .controller('CardsCtrl', function($scope,principal,$http,$ionicNavBarDelegate,$timeout,$ionicSlideBoxDelegate) {
    
    //disable back button on Cards Control
    $timeout(function(){
      $ionicNavBarDelegate.showBackButton(false);
    });

    // instantiate these as blank. the id field is being watched in an ng-show, setting to "" hides the element.
    // we use only 5 cards because it is more efficient on mobile to only load what is currently visible on screen. 
    // In our case, since it is a tinder like interface, I load 5 cards even if they are not on screen because some people swipe quite fast...

    $scope.cards =[{id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",feet:"",inches:"",blurb:"",looks_last_5_average_rating:"",answer1_last_5_average_rating:"",answer2_last_5_average_rating:"",answer3_last_5_average_rating:"",pronoun:"",pronoun_two:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",feet:"",inches:"",blurb:"",looks_last_5_average_rating:"",answer1_last_5_average_rating:"",answer2_last_5_average_rating:"",answer3_last_5_average_rating:"",pronoun:"",pronoun_two:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",feet:"",inches:"",blurb:"",looks_last_5_average_rating:"",answer1_last_5_average_rating:"",answer2_last_5_average_rating:"",answer3_last_5_average_rating:"",pronoun:"",pronoun_two:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",feet:"",inches:"",blurb:"",looks_last_5_average_rating:"",answer1_last_5_average_rating:"",answer2_last_5_average_rating:"",answer3_last_5_average_rating:"",pronoun:"",pronoun_two:""},
    {id:"", first_name:"",picture1:"",picture2:"",picture3:"",picture4:"",picture5:"",answer1:"",answer2:"",feet:"",inches:"",blurb:"",looks_last_5_average_rating:"",answer1_last_5_average_rating:"",answer2_last_5_average_rating:"",answer3_last_5_average_rating:"",pronoun:"",pronoun_two:""}];



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
        console.log(data);
        if (data.length){
          for(i=0;i<data.length;i++){
            $scope.skip_ids.push(data[i].id);
            if (i<5){
              //Only push 5 cards for performance reasons
              $scope.cards[i].id = data[i].id;
              $scope.cards[i].first_name = data[i].first_name;
              $scope.cards[i].answer1 = ['Hook up','Date','Relationship'][data[i].answer1];
              $scope.cards[i].answer2 = ['Skinny','Athletic','Chubby','Overweight'][data[i].answer2];
              $scope.cards[i].feet = data[i].feet;
              $scope.cards[i].inches = data[i].inches;
              $scope.cards[i].blurb = data[i].blurb;
              $scope.cards[i].looks_last_5_average_rating = data[i].looks_last_5_average_rating;
              $scope.cards[i].answer1_last_5_average_rating = data[i].answer1_last_5_average_rating;
              $scope.cards[i].answer2_last_5_average_rating = data[i].answer2_last_5_average_rating;
              $scope.cards[i].answer3_last_5_average_rating = data[i].answer3_last_5_average_rating;
              if (data[i].gender =='female'){
                $scope.cards[i].pronoun = 'She';
                $scope.cards[i].pronoun_two = 'Her';
              } else {
                $scope.cards[i].pronoun = 'He';
                $scope.cards[i].pronoun_two = 'His';
              }

              // determine if photos have been uploaded...
              if (data[i].photos_uploaded){
                //photos have been uploaded, display user's photos
                $scope.cards[i].picture1 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[0]+1)+".jpg";
                $scope.cards[i].picture2 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[1]+1)+".jpg";
                $scope.cards[i].picture3 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[2]+1)+".jpg";
                $scope.cards[i].picture4 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[3]+1)+".jpg";
                $scope.cards[i].picture5 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[4]+1)+".jpg";
              } else {
                //photos not uploaded, use generic photo
                $scope.cards[i].picture1 = "./img/iconlight.jpg";
                $scope.cards[i].picture2 = "./img/icondark.jpg";
                $scope.cards[i].picture3 = "./img/icondark.jpg";
                $scope.cards[i].picture4 = "./img/icondark.jpg";
                $scope.cards[i].picture5 = "./img/icondark.jpg";
              }
              $ionicSlideBoxDelegate.update();
            } else {
              // all other cards can be pushed elsewhere

              // determine if photos have been uploaded...
              if (data[i].photos_uploaded){
                //photos have been uploaded, display user's photos
                picture1_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[0]+1)+".jpg";
                picture2_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[1]+1)+".jpg";
                picture3_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[2]+1)+".jpg";
                picture4_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[3]+1)+".jpg";
                picture5_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[4]+1)+".jpg";
              } else {
                //photos not uploaded, use generic photo
                picture1_url = "./img/iconlight.jpg";
                picture2_url = "./img/icondark.jpg";
                picture3_url = "./img/icondark.jpg";
                picture4_url = "./img/icondark.jpg";
                picture5_url = "./img/icondark.jpg";
              }

              if (data[i].gender =='female'){
                pronoun = 'She';
                pronoun_two = 'Her';
              } else {
                pronoun = 'He';
                pronoun_two = 'His';
              }

              $scope.remainingCards[0].push({
                id:data[i].id, 
                first_name:data[i].first_name,
                picture1:picture1_url,
                picture2:picture2_url,
                picture3:picture3_url,
                picture4:picture4_url,
                picture5:picture5_url,
                answer1: ['Hook up','Date','Relationship'][data[i].answer1],
                answer2: ['Skinny','Athletic','Chubby','Overweight'][data[i].answer2],
                feet: data[i].feet,
                inches: data[i].inches,
                blurb: data[i].blurb,
                looks_last_5_average_rating: data[i].looks_last_5_average_rating,
                answer1_last_5_average_rating: data[i].answer1_last_5_average_rating,
                answer2_last_5_average_rating: data[i].answer2_last_5_average_rating,
                answer3_last_5_average_rating: data[i].answer3_last_5_average_rating,
                pronoun: pronoun,
                pronoun_two: pronoun_two
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
  console.log(principal);

  //prepopulate the params with what user's current preferences are
  $scope.preferences = {
    preferred_min_age: principal.preferred_min_age, 
    preferred_max_age: principal.preferred_max_age,
    preferred_distance: principal.preferred_distance/1000,
    preferred_min_feet: principal.preferred_min_feet,
    preferred_max_feet: principal.preferred_max_feet,
    preferred_min_inches: principal.preferred_min_inches,
    preferred_max_inches: principal.preferred_max_inches,
  }


  // convert principal.preferred_intentions & principal.preferred_body_type from array of integers to array of booleans
  var preferred_intentions = [false,false,false]
  var preferred_body_type = [false,false,false,false]

  for (i =0; i<3; i++){
    if (principal.preferred_intentions.indexOf(i)>-1){
      preferred_intentions[i] = true;
    } 
  }
  
  for (i =0; i<4; i++){
    if (principal.preferred_body_type.indexOf(i)>-1){
      preferred_body_type[i] = true;
    } 
  }

  $scope.preferences.preferred_intentions = preferred_intentions;
  $scope.preferences.preferred_body_type = preferred_body_type;
  
  //possible answers to the questions
  $scope.question_1_answers = [{value:'Hooking up'},{value:'Dating'},{value:'Serious Things'}];
  $scope.question_2_answers = [{value:'Skinny'},{value:'Athletic'},{value:"Chubby"},{value:"Overweight"}];
    
  $scope.saveSettings = function(){
    var preferred_intentions = [];
    var preferred_body_type = [];
   
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });

    var pd = $scope.preferences.preferred_distance*1000;
    $scope.preferences.preferred_distance = pd;
    $scope.preferences.preferred_min_height = $scope.preferences.preferred_min_feet + $scope.preferences.preferred_min_inches/12;
    $scope.preferences.preferred_max_height = $scope.preferences.preferred_max_feet + $scope.preferences.preferred_max_inches/12;

    //convert array of booleans to array of ints

    for (i =0; i<3; i++){
      if ($scope.preferences.preferred_intentions[i]){
        preferred_intentions.push(i);
      }
    }
    
    for (i =0; i<4; i++){
      if ($scope.preferences.preferred_body_type[i]){
        preferred_body_type.push(i); 
      }
    }
    //deep copy preferences so that for user he doesn't see checkboxes moving
    var preferences = JSON.parse(JSON.stringify($scope.preferences));
    preferences.preferred_intentions = preferred_intentions;
    preferences.preferred_body_type = preferred_body_type;
    console.log(preferences);
  
    $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,
      {
        profile:preferences
      })
    .success(function(data,status,headers,config){
      
      principal.preferred_min_age = $scope.preferences.preferred_min_age;
      principal.preferred_max_age = $scope.preferences.preferred_max_age;
      principal.preferred_distance = pd; 
      principal.preferred_min_feet = $scope.preferences.preferred_min_feet;
      principal.preferred_max_feet = $scope.preferences.preferred_max_feet;
      principal.preferred_min_inches = $scope.preferences.preferred_min_inches;
      principal.preferred_max_inches = $scope.preferences.preferred_max_inches;
      principal.preferred_intentions = preferences.preferred_intentions;
      principal.preferred_body_type = preferences.preferred_body_type;

      $state.go('app.cards');
      $ionicLoading.hide();
    })
    .error(function(data,status,headers,config){
      
      $ionicLoading.hide();
    })
  }

})

// show matches
.controller('MatchCtrl',function($scope,principal,$http,PushService){
  
  $scope.matches = PushService.matches = [];
  PushService.getMatches(principal.id);

})

// rate a user
.controller('RateCtrl',function($scope,principal,$http,$stateParams,$ionicLoading,$state){


  $http.get(AppSettings.baseApiUrl + 'profiles/individual/' + $stateParams.user_id)
  .success(function(data,status,headers,config){
    $scope.answer1 = ['Hookup','Date','Relationship'][data.answer1];
    $scope.answer2 = ['Skinny','Athletic','Chubby','Overweight'][data.answer2];
    $scope.feet = data.feet;
    $scope.inches = data.inches;
    $scope.picture1 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data.facebook_id+"/medium/" + (data.order[0]+1)+".jpg";
    $scope.picture2 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data.facebook_id+"/medium/" + (data.order[1]+1)+".jpg";
    $scope.picture3 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data.facebook_id+"/medium/" + (data.order[2]+1)+".jpg";
    $scope.picture4 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data.facebook_id+"/medium/" + (data.order[3]+1)+".jpg";
    $scope.picture5 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data.facebook_id+"/medium/" + (data.order[4]+1)+".jpg";
    $scope.first_name = data.first_name;
    if (data.gender =='female'){
      $scope.pronoun = 'She';
      $scope.pronoun_two = 'Her';
    } else {
      $scope.pronoun = 'He';
      $scope.pronoun_two = 'His';
    }
  })
  .error(function(data,status,headers,config){

  })


  $scope.ratings = {
    swipee_id: $stateParams.user_id,
    looks_rating: 3,
    answer1_rating: 3,
    answer2_rating: 2,
    answer3_rating: 2
  }

  $scope.rate = function(){
  
    // $ionicLoading.show({
    //   templateUrl: "templates/loading.html"
    // });
    var params = {match:$scope.ratings}
    alert(JSON.stringify(params));

    // $http.put(AppSettings.baseApiUrl + 'matches/'+principal.id,params)
    // .success(function(data,status,headers,config){
    //   $ionicLoading.hide();
    //   $state.go('app.matches');
    // })
    // .error(function(data,status,headers,config){
    //   $ionicLoading.hide();
    // })
  }
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
      PushService.addMessagesToChat(principal.first_name, msg,principal.facebook_id,principal.order[0]);
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
    scope:false,
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

          //ratio needed for cropping
          scope.croppedImageDetails[scope.currently_selected].ratio = imageHeight/element[0].offsetHeight;

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

          //ratio needed for cropping
          scope.croppedImageDetails[scope.currently_selected].ratio = imageHeight/element[0].offsetHeight;

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
      
        //track original image width  
        imageWidth = element[0].children[0].offsetWidth;
        imageHeight = element[0].children[0].offsetHeight;
      
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

        //track center of crop square

        centerX = element[0].children[1].offsetWidth/2 + element[0].children[1].offsetLeft;
        centerY = element[0].children[1].offsetHeight/2 + element[0].children[1].offsetTop;

      },element)

      $ionicGesture.on('transform',function(e){ 
        
        
        newHeight = startingCropHeight*e.gesture.scale;
        newWidth = startingCropWidth*e.gesture.scale;
        deltaHeight = newHeight - startingCropHeight;
        deltaWidth = newWidth - startingCropWidth;
        newLeft = originalLeft - deltaWidth/2;
        newTop = originalTop - deltaHeight/2;

        if (newHeight <= originalImageHeight && newWidth <= originalImageWidth && newHeight >= 100 && newWidth >= 111){
          scale = e.gesture.scale;
          newHeight = startingCropHeight*scale;
          newWidth = startingCropWidth*scale;
          element[0].children[1].style.height = (newHeight) + "px";
          element[0].children[1].style.width =  (newWidth) + "px";
          element[0].children[1].style.left = (newLeft) + "px";
          element[0].children[1].style.top = (newTop) + "px";
          leftPos = element[0].children[1].offsetLeft;
          topPos = element[0].children[1].offsetTop;
        } 

      },element)

      $ionicGesture.on('transformend',function(e){

          // scalePercent = scale*lastScale;

          // shiftX = centerX*(imageWidth*scalePercent - imageWidth)/(imageWidth*scalePercent);
          // shiftY = centerY*(imageHeight*scalePercent - imageHeight)/(imageHeight*scalePercent);

          // element[0].children[0].style.transform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(-' + shiftX + 'px,-' + shiftY + 'px,0)'
          // element[0].children[0].style.webkitTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(-' + shiftX + 'px,-' + shiftY + 'px,0)'
          // element[0].children[0].style.MozTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(-' + shiftX + 'px,-' + shiftY + 'px,0)'
          // element[0].children[0].style.msTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(-' + shiftX + 'px,-' + shiftY + 'px,0)'
          // element[0].children[0].style.OTransform = 'scale3d('+scalePercent+','+scalePercent+',1) translate3d(-' + shiftX + 'px,-' + shiftY + 'px,0)'  
          // element[0].children[1].style.width = (element[0].children[1].offsetWidth * scalePercent) + "px";
          // element[0].children[1].style.height = (element[0].children[1].offsetHeight * scalePercent) + "px";
          // element[0].children[1].style.left = (element[0].children[1].offsetLeft - (centerX-imageCenterX)/2) + "px";
          // element[0].children[1].style.top = (element[0].children[1].offsetTop - (centerX-imageCenterY)/2) + "px";

          // lastScale = scale*lastScale;

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

      },element);

      $ionicGesture.on('drag',function(e){
        var distx = parseInt(e.gesture.touches[0].clientX) - startx
        var disty = parseInt(e.gesture.touches[0].clientY) - starty

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


.controller('ChoosePhotosCtrl',function($scope,$ionicModal,$timeout,principal,$http,$state,$q,$ionicLoading,$ionicNavBarDelegate,$ionicPopup){
  
  $scope.number_selected = 0;
  $scope.showChangeImage = false;
  $scope.showSwapImage = false;
  $scope.second_selected = null;
  $scope.cropShown = false;
  $scope.newImage = { newImage: true};
  $scope.selected_photo = null;
  $scope.croppedImageDetails = [{crop_x:0,crop_y:0,crop_w:338,crop_h:305,ratio:1},{crop_x:0,crop_y:0,crop_w:338,crop_h:305,ratio:1},{crop_x:0,crop_y:0,crop_w:338,crop_h:305,ratio:1},{crop_x:0,crop_y:0,crop_w:338,crop_h:305,ratio:1},{crop_x:0,crop_y:0,crop_w:338,crop_h:305,ratio:1}]

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

    $http.get(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id).success(function(data,status,headers,config){
      console.log(principal)  
      principal.id = data.id    
    }).error(function(data,status,headers,config){
      //TODO: show no internet error
    });
  }

  if (principal.photos_uploaded){
    //the view uses the url parameter
    $scope.image_infos = [{ url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[0]+1) + ".jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(0);},selected_image:false },
    { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[1]+1) + ".jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(1);},selected_image:false },
    { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[2]+1) + ".jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(2);},selected_image:false },
    { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[3]+1) + ".jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(3);},selected_image:false },
    { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[4]+1) + ".jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(4);},selected_image:false }]

  } else {
    //the view uses the url parameter, different images when it's your first time.
    $scope.image_infos = [{ url:"./img/iconlight.jpg", onClickFunction: function(){selectImageToEdit(0);},selected_image:false },
    { url: "./img/icondark.jpg", onClickFunction: function(){selectImageToEdit(1);},selected_image:false },
    { url: "./img/icondark.jpg", onClickFunction: function(){selectImageToEdit(2);},selected_image:false },
    { url: "./img/icondark.jpg", onClickFunction: function(){selectImageToEdit(3);},selected_image:false },
    { url: "./img/icondark.jpg", onClickFunction: function(){selectImageToEdit(4);},selected_image:false }]
      
  }
  
    
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
    console.log($scope.currently_selected + " " + $scope.second_selected)
    
  }

  // //allows user to remove image
  // $scope.removeImage = function(){
  //   $scope.number_selected = 0;
  //   $scope.showChangeImage = false;
  //   $scope.image_infos[$scope.currently_selected].selected_image = !$scope.image_infos[$scope.currently_selected].selected_image;
    
  //   if ($scope.currently_selected == 0) {
  //     $scope.image_infos[$scope.currently_selected].url = "./img/iconlight.jpg";
  //   } else {
  //     $scope.image_infos[$scope.currently_selected].url = "./img/icondark.jpg";
  //   }
  //   $scope.currently_selected = null;
  //   //TODO: send to server to save
  // }

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
    
    //send to server to save swap

    //show loading screen
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
    //set parameters
    var params = {
      profile:{
        order: principal.order
      }
    }

    for(i = 0; i < 5; i++){
      if ($scope.currently_selected === i){
        for (j=0;j<5;j++){
          if ($scope.second_selected === j){
            var temp = params.profile.order[i];
            params.profile.order[i] = params.profile.order[j];
            params.profile.order[j] = temp;
          }
        }
      }
    }

    $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,params)
    .success(function(data, status, headers, config){
      //swap images locally
      var tempurl = $scope.image_infos[$scope.currently_selected].url
      $scope.image_infos[$scope.currently_selected].url = $scope.image_infos[$scope.second_selected].url;
      $scope.image_infos[$scope.second_selected].url = tempurl;

      //unselect images 
      $scope.image_infos[$scope.currently_selected].selected_image = !$scope.image_infos[$scope.currently_selected].selected_image;
      $scope.image_infos[$scope.second_selected].selected_image = !$scope.image_infos[$scope.second_selected].selected_image;
      $scope.number_selected = 0;
      $scope.showSwapImage = false;
      $scope.currently_selected = null;
      $scope.second_selected = null;

      //save new order locally
      principal.order = params.profile.order;
      $ionicLoading.hide();
    }).error(function(data, status, headers, config){
      $ionicLoading.hide();
    });



  }

  //user has saved cropped image
  $scope.saveCroppedImage = function(){
    console.log(principal.order);
    //save location and size details of cropped immage
    $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_h = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetHeight * $scope.croppedImageDetails[$scope.currently_selected].ratio;
    $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_w = $scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetWidth * $scope.croppedImageDetails[$scope.currently_selected].ratio;
    $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_y = ($scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetTop-$scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[0].offsetTop)* $scope.croppedImageDetails[$scope.currently_selected].ratio;
    $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_x = ($scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[1].offsetLeft-$scope.crop.el.children[0].children[0].children[1].children[0].children[0].children[0].offsetLeft)* $scope.croppedImageDetails[$scope.currently_selected].ratio;
    params = {profile:{
                crop_x: $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_x,
                crop_y: $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_y,
                crop_w: $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_w,
                crop_h: $scope.croppedImageDetails[principal.order[$scope.currently_selected]].crop_h
                }
              }
    switch (principal.order[$scope.currently_selected]){
      case 0:
        params.profile.picture1_url = $scope.selected_photo;
        break;
      case 1:
        params.profile.picture2_url = $scope.selected_photo;
        break;
      case 2:
        params.profile.picture3_url = $scope.selected_photo;
        break;
      case 3:
        params.profile.picture4_url = $scope.selected_photo;
        break;
      case 4:
        params.profile.picture5_url = $scope.selected_photo;
        break;
      default:
        break;
    }

    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
    
    $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id+'/crop',params)
    .success(function(data, status, headers, config){
      $ionicLoading.hide();
      var currentTime = new Date().getTime();      
      $scope.image_infos[$scope.currently_selected].url = AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/" + (principal.order[$scope.currently_selected]+1)+".jpg?" + currentTime;
      $scope.crop.hide();  
      $scope.cropShown=false;
    }).error(function(data, status, headers, config){
      $ionicLoading.hide();
      $scope.crop.hide();  
      $scope.cropShown=false;
    });
  }

  //user has just selected picture to edit / crop
  $scope.selectPictureForProfile = function(t){
    console.log(t);
    if (typeof($scope.currently_selected)!="null"){
      $scope.selected_photo = t.photo[1];  
    }
    $scope.modal.hide();
    $scope.cropShown = true;
    $scope.newImage.newImage = true;
    $scope.crop.show();
  }
  
  // send data to server
  $scope.continue = function(){
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });

    var pat = /icon/i
    for (i=0;i<5;i++){
      
      var res = $scope.image_infos[i].url.search(pat)
      if (res!==-1){
        $ionicLoading.hide();
        // put an alert that you must have 5 pictures loaded
        $scope.showAlert();
        break;
      }
      if(i===4){
        // 5 images uploaded
        if (principal.photos_uploaded){
          $ionicLoading.hide();
          $state.go('app.cards');  
        } else {
          $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,{profile:{
              photos_uploaded:true
          }})
          .success(function(data,status,headers,config){
            principal.photos_uploaded = true;
            $ionicLoading.hide();
            $state.go('app.cards');  
          }).error(function(data, status, headers, config){
            $ionicLoading.hide();
          })
        }
      }
    }
      
  }

  $scope.showAlert = function(){
    var alertPopup = $ionicPopup.alert({
      title: 'Please use 5 photos!'
      // template: 'It might taste good'
    });
      alertPopup.then(function(res) {
    });
  }

  // this function is executed when the user hits the bottom of the infinite scroll or the first time the user selects an image to edit (selectImageToEdit)
  $scope.loadMore = function(){
    
    if ($scope.next_page){
      $http.get($scope.next_page).success(function(res){
        for (i = 0; i < res.data.length; i++){
          $scope.photoUrls.push([res.data[i].images[res.data[i].images.length-1].source,res.data[i].images[2].source]);//res.data[i].images.length-2
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
            $scope.photoUrls.push([res.data[i].images[res.data[i].images.length-1].source,res.data[i].images[2].source]); //res.data[i].images.length-2
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
      element[0].style.fontSize = w/5+10+"px";
      element[0].style.height = w/5+10+"px";
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



.controller('ChooseAnswersCtrl',function($scope,$state,principal,$http,$ionicLoading,PushService,$q,$ionicNavBarDelegate,$timeout,$ionicPopup){

  $scope.answers = {};

  if (!principal.firstTimeUser){
    //populate answers if not the users first time
    $scope.answers.answer1 = principal.answer1;
    $scope.answers.answer2 = principal.answer2;
    $scope.answers.blurb = principal.blurb;
    $scope.answers.feet = principal.feet;
    $scope.answers.inches = principal.inches;
    
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
  $scope.question_1_answers = [{value:'Hooking up'},{value:'Dating'},{value:'Serious Things'}];
  $scope.question_2_answers = [{value:'Skinny'},{value:'Athletic'},{value:"Chubby"},{value:"Overweight"}];
  
  //ng hide information (setting to true causes the information to hide with an animation that slides it up)
  $scope.hide1 = false; 
  $scope.hide2 = false;
  
  // on clicking an answer we want to hide the answer so we set the below attributes to true. (They are watched by ng-hide)
  $scope.hide_q1 = function(){
    $scope.hide1 = true;
  }
  $scope.hide_q2 = function(){
    $scope.hide2 = true;
  }
  $scope.show_q1 = function(){
    $scope.hide1 = false;
  }
  $scope.show_q2 = function(){
    $scope.hide2 = false;
  }

  $scope.showAlert = function(){
    var alertPopup = $ionicPopup.alert({
      title: 'Oops, there was a problem!'
    });
      alertPopup.then(function(res) {
    });
  }
  
  //on clicking answer questions...
  $scope.answerQuestions = function(){

    //make sure all fields were answered before proceeding 
    if ((principal.answer1||$scope.answers.answer1 + 1) && (principal.answer2||$scope.answers.answer2 + 1) && $scope.answers.blurb && $scope.answers.feet && $scope.answers.inches){

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
        $scope.answers.order = [0,1,2,3,4];
        $scope.answers.height = $scope.answers.feet + $scope.answers.inches/12;

        //Set a default min and max preferred heights, based on +/- 4 inches from your height
        if ($scope.answers.inches <= 3) {
          $scope.answers.preferred_min_feet = $scope.answers.feet - 1;  
          $scope.answers.preferred_min_inches = 12 + $scope.answers.inches - 4;
        } else {
          $scope.answers.preferred_min_feet = $scope.answers.feet;  
          $scope.answers.preferred_min_inches = $scope.answers.inches - 4;
        }
        if ($scope.answers.inches >= 8) {
          $scope.answers.preferred_max_feet = $scope.answers.feet+1;  
          $scope.answers.preferred_max_inches = 4 - (12 - $scope.answers.inches);
        } else {
          $scope.answers.preferred_max_feet = $scope.answers.feet;  
          $scope.answers.preferred_max_inches = $scope.answers.inches + 4;
        }
        $scope.answers.preferred_min_height = $scope.answers.preferred_min_feet + $scope.answers.preferred_min_inches/12;
        $scope.answers.preferred_max_height = $scope.answers.preferred_max_feet + $scope.answers.preferred_max_inches/12;

        // set a default preferred intentions and default preferred body type
        if ($scope.answers.answer1==0){
          $scope.answers.preferred_intentions = [0];
          principal.preferred_intentions = [0];
        } else if ($scope.answers.answer1==1) {
          $scope.answers.preferred_intentions = [1];
          principal.preferred_intentions = [1];
        } else {
          $scope.answers.preferred_intentions = [2];
          principal.preferred_intentions = [2];
        }

        if ($scope.answers.answer2 == 0 || $scope.answers.answer2 == 1){
          $scope.answers.preferred_body_type = [0,1];
          principal.preferred_body_type = [0,1];
        } else {
          $scope.answers.preferred_body_type = [2,3];
          principal.preferred_body_type = [2,3];
        }
        
        // save details of current user to principal variable for use elsewhere in app
        principal.answer1 = $scope.answers.answer1;
        principal.answer2 = $scope.answers.answer2;
        principal.blurb = $scope.answers.blurb;
        principal.feet = $scope.answers.feet;
        principal.inches = $scope.answers.inches;
        principal.preferred_min_age = $scope.answers.preferred_min_age;
        principal.preferred_max_age = $scope.answers.preferred_max_age;
        principal.preferred_distance = $scope.answers.preferred_distance;
        principal.preferred_min_feet = $scope.answers.preferred_min_feet;
        principal.preferred_min_inches = $scope.answers.preferred_min_inches;
        principal.preferred_max_feet = $scope.answers.preferred_max_feet;
        principal.preferred_max_inches = $scope.answers.preferred_max_inches;
        principal.order = [0,1,2,3,4];

        console.log(principal);
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
        principal.blurb = $scope.answers.blurb;
        principal.feet = $scope.answers.feet;
        principal.inches = $scope.answers.inches;
        $scope.answers.height = $scope.answers.feet + $scope.answers.inches/12;
        
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
    } else {
      console.log("problem: ")
      console.log(principal.answer1 + " " + $scope.answers.answer1 + " " + principal.answer2 + " " + $scope.answers.answer2+ " " + $scope.answers.blurb+ " " +  $scope.answers.feet+ " " +  $scope.answers.inches)
      //show an alert to fill everything out 
      $scope.showAlert();
    } 
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
      scope.cards[scope.cardPosition[0]%5].feet = scope.remainingCards[0][scope.cardPosition[0]].feet;  
      scope.cards[scope.cardPosition[0]%5].inches = scope.remainingCards[0][scope.cardPosition[0]].inches;  
      scope.cards[scope.cardPosition[0]%5].blurb = scope.remainingCards[0][scope.cardPosition[0]].blurb;  
      scope.cards[scope.cardPosition[0]%5].looks_last_5_average_rating = scope.remainingCards[0][scope.cardPosition[0]].looks_last_5_average_rating;  
      scope.cards[scope.cardPosition[0]%5].answer1_last_5_average_rating = scope.remainingCards[0][scope.cardPosition[0]].answer1_last_5_average_rating;  
      scope.cards[scope.cardPosition[0]%5].answer2_last_5_average_rating = scope.remainingCards[0][scope.cardPosition[0]].answer2_last_5_average_rating;  
      scope.cards[scope.cardPosition[0]%5].answer3_last_5_average_rating = scope.remainingCards[0][scope.cardPosition[0]].answer3_last_5_average_rating;  
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

          //push to current cards array
          scope.cards[n].id = data[i].id;
          scope.cards[n].first_name = data[i].first_name;
          scope.cards[n].answer1 = data[i].answer1;
          scope.cards[n].answer2 = data[i].answer2;
          scope.cards[n].feet = data[i].feet;
          scope.cards[n].inches = data[i].inches;
          scope.cards[n].blurb = data[i].blurb;
          scope.cards[n].looks_last_5_average_rating = data[i].looks_last_5_average_rating;
          scope.cards[n].answer1_last_5_average_rating = data[i].answer1_last_5_average_rating;
          scope.cards[n].answer2_last_5_average_rating = data[i].answer2_last_5_average_rating;
          scope.cards[n].answer3_last_5_average_rating = data[i].answer3_last_5_average_rating;

          // determine if photos have been uploaded...
          if (data[i].photos_uploaded){
            //photos have been uploaded, display user's photos
            scope.cards[n].picture1 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[0]+1)+".jpg";
            scope.cards[n].picture2 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[1]+1)+".jpg";
            scope.cards[n].picture3 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[2]+1)+".jpg";
            scope.cards[n].picture4 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[3]+1)+".jpg";
            scope.cards[n].picture5 = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[4]+1)+".jpg";
          } else {
            //photos not uploaded, use generic photo
            scope.cards[n].picture1 = "./img/iconlight.jpg";
            scope.cards[n].picture2 = "./img/icondark.jpg";
            scope.cards[n].picture3 = "./img/icondark.jpg";
            scope.cards[n].picture4 = "./img/icondark.jpg";
            scope.cards[n].picture5 = "./img/icondark.jpg";
          }
          if (data[i].gender =='female'){
            $scope.cards[n].pronoun = 'She';
            $scope.cards[n].pronoun_two = 'Her';
          } else {
            $scope.cards[n].pronoun = 'He';
            $scope.cards[n].pronoun_two = 'His';
          }
          n +=1;
        } else {
          console.log("adding..." + data[i].first_name + "to remaining cards");
          // determine if photos have been uploaded...
          if (data[i].photos_uploaded){
            //photos have been uploaded, display user's photos
            picture1_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[0]+1)+".jpg";
            picture2_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[1]+1)+".jpg";
            picture3_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[2]+1)+".jpg";
            picture4_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[3]+1)+".jpg";
            picture5_url = AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].facebook_id+"/medium/" + (data[i].order[4]+1)+".jpg";
          } else {
            //photos not uploaded, use generic photo
            picture1_url = "./img/iconlight.jpg";
            picture2_url = "./img/icondark.jpg";
            picture3_url = "./img/icondark.jpg";
            picture4_url = "./img/icondark.jpg";
            picture5_url = "./img/icondark.jpg";
          }
          
          //set pronoun based on gender
          if (data[i].gender =='female'){
            pronoun = 'She';
            pronoun_two = 'Her';
          } else {
            pronoun = 'He';
            pronoun_two = 'His';
          }

          //Push details to remaining cards array
          scope.remainingCards[0].push({
            id:data[i].id, 
            first_name:data[i].first_name,
            picture1: picture1_url,
            picture2: picture2_url,
            picture3: picture3_url,
            picture4: picture4_url,
            picture5: picture5_url,
            answer1: data[i].answer1,
            answer2: data[i].answer2,
            feet: data[i].feet,
            inches: data[i].inches,
            blurb: data[i].blurb,
            looks_last_5_average_rating: data[i].looks_last_5_average_rating,
            answer1_last_5_average_rating: data[i].answer1_last_5_average_rating,
            answer2_last_5_average_rating: data[i].answer2_last_5_average_rating,
            answer3_last_5_average_rating: data[i].answer3_last_5_average_rating,
            pronoun: pronoun,
            pronoun_two: pronoun_two
          });  
        }
      }
    } else {
      // TODO No more data! show a 'no more data toast'
    }
  })
  .error(function(data,status,headers,config){
    //TODO errors
  });
}