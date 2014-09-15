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

  .controller('CardsCtrl', function($scope,principal,$http,$ionicNavBarDelegate,$timeout) {
    
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
        element[0].style.left = (distx) + "px"
        element[0].style.top = (disty) + "px"
        
      },element);

      $ionicGesture.on('dragend',function(e){
        
        var distx = parseInt(e.gesture.touches[0].clientX) - startx
        if (e.gesture.touches[0].clientX > 0.8*window.innerWidth && distx >0.3*window.innerWidth) {
                //LIKED
              
              manageRemainingCards(element,scope,$http,true,principal)
              
            } else if (e.gesture.touches[0].clientX < 0.2*window.innerWidth && distx < -0.3 * window.innerWidth){
                // DISLIKED
              manageRemainingCards(element,scope,$http,false,principal);
              

            } else {
              // did not swipe far enough, return back to original position
                element[0].style.left = "0";
                element[0].style.top = "0";
            }

      },element);
    }
  }
}])


.controller('SettingsCtrl', function($scope,$state,principal,$ionicLoading,$http){

  //prepopulate the params with what user's current preferences are
  $scope.params ={
    preferred_min_age: principal.preferred_min_age,
    preferred_max_age: principal.preferred_max_age,
    preferred_distance: principal.preferred_distance/1000
  }
  
  //save to server
  $scope.saveSettings = function(){
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
    var pd = $scope.params.preferred_distance*1000;
    
    $http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,
      {
        profile:{
          preferred_min_age: $scope.params.preferred_min_age,
          preferred_max_age: $scope.params.preferred_max_age,
          preferred_distance: pd
        }
      })
    .success(function(data,status,headers,config){
      
      principal.preferred_min_age = $scope.params.preferred_min_age;
      principal.preferred_max_age = $scope.params.preferred_max_age;
      principal.preferred_distance = pd; 
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
            postLoginPromises($q,principal,res,$state,$ionicLoading,$ionicPopup,$http,PushService);  
          } else {
            principal.isFBLoggedIn = false;
            //TODO: try logging out or sending a toast that there was an error
            console.log(res);
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

//range filter needed for photos modal in choosePhotos controller. Basically this allows me to 2 columns of facebook images
.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; i++) {
            input.push(i);
        }
        return input;
    };
})

.controller('ChoosePhotosCtrl',function($scope,$ionicModal,$timeout,principal,$http,$state,$q,$ionicLoading,$ionicNavBarDelegate){
  
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
  
  $scope.image_infos = [{ url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/1.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(0);} },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/2.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(1);} },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/3.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(2);} },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/4.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(3);} },
  { url:AppSettings.amazonBaseUrl + "app/public/pictures/"+principal.facebook_id+"/medium/5.jpg?"+currentTime, onClickFunction: function(){selectImageToEdit(4);} }]
    
  //photourls loaded for fb
  $scope.photoUrls = [];
  $scope.next_page = "";
  $scope.firstload=true; 
  $scope.currently_selected = null;

  //define the photos_modal
  $ionicModal.fromTemplateUrl('templates/photos_modal.html',{
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal,t){
    $scope.modal = modal;
  });

  // this button in the photos modal, clicking back hides the modal
  $scope.goBack = function(){
    $scope.modal.hide();
  }
  
  //monitor which profile image the user wants to change
  function selectImageToEdit(n){
    $scope.modal.show();
    $scope.currently_selected = n;
    if ($scope.firstClick){
      $scope.loadMore();
      $scope.firstClick = false;
    } 
  }

  // within the photos modal the user has chosen an image for their profile. Replace the url of the image with this new url
  $scope.selectPictureForProfile = function(t){
    $scope.image_infos[$scope.currently_selected].url = t.photo;
    $scope.modal.hide();
  }
  
  // send data to server
  $scope.save_photos = function(){
    $ionicLoading.show({
      templateUrl: "templates/loading.html"
    });
      console.log("save photos clicked");

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


  // this function is executed when the user hits the bottom of the infinite scroll or the first time the user selects an image to edit (selectImageToEdit)
  $scope.loadMore = function(){
    
    if ($scope.next_page){
      $http.get($scope.next_page).success(function(res){
        for (i = 0; i < res.data.length; i++){
          $scope.photoUrls.push(res.data[i].images[res.data[i].images.length-1].source);
         }
         if (typeof(res.paging)!='undefined'){
          $scope.next_page = res.paging.next; 
         } else {
          $scope.next_page = "";
         }
         $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    } else if ($scope.firstload) {
      
      facebookConnectPlugin.api('/me/photos?limit=10',['public_profile','user_photos','user_birthday'],
        function(res){
          for (i = 0; i < res.data.length; i++){
            $scope.photoUrls.push(res.data[i].images[res.data[i].images.length-1].source);
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

  $http.get(AppSettings.baseApiUrl + 'profiles/' +principal.facebook_id)
  .success(function(data,status,headers,config){
    console.log(data);
    var updated_at = new Date(data.updated_availability);
    var currentDate = new Date();
    console.log(updated_at);


    if (updated_at.toDateString() == currentDate.toDateString()){ // updated availability is the same date as today
      $scope.today_before_five = data.today_before_five;
      $scope.today_after_five = data.today_after_five;
      $scope.tomorrow_before_five = data.tomorrow_before_five;
      $scope.tomorrow_after_five = data.tomorrow_after_five; 
      
    } else { 
      //need to check when it was last updated
      var yesterday = new Date(currentDate.getTime() - 60*60*24*1000);

      //updated yesterday, that means 'tomorrow dates are already determined'...
      if (updated_at.toDateString() == yesterday.toDateString()){
        $scope.today_before_five =  data.tomorrow_before_five;
        $scope.today_after_five =   data.tomorrow_after_five;
      }
      //last updated before yesterday, keep availability as false;
    }
  })
  .error(function(data,status,headers,config){
  }) 

  $scope.save = function(){
    var currentDate = new Date();
    console.log($scope.today_before_five);
    console.log($scope.today_after_five);
    $http.put(AppSettings.baseApiUrl + 'profiles/' + principal.facebook_id,
    {
      profile:{
        today_before_five: $scope.today_before_five,
        today_after_five: $scope.today_after_five,
        tomorrow_before_five: $scope.tomorrow_before_five,
        tomorrow_after_five: $scope.tomorrow_after_five,
        updated_availability: currentDate
      }
    })
    .success(function(data,status,headers,config){
      //Go to somewhere else
      $state.go('app.cards');
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
    element[0].style.left = (window.innerWidth) + "px" 
  } else {
    // move left off screen
    element[0].style.right = "0" 
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
      element[0].style.left = "0" ;  
      element[0].style.top = "0";
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