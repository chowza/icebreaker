// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

//Stateprovider configuration routes

      .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
          .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            resolve:{
              initialize: ['principal',function(principal){
                return principal.initialization();
              }]
            },
            controller: 'MenuCtrl'
          })

    .state('app.settings', {
      url: "/settings?firstTime",
      views: {
        'menuContent' :{
          templateUrl: "templates/settings.html",
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('app.matches',{
      url:"/matches",
      views: {
        'menuContent':{
          templateUrl: "templates/matchlist.html",
          controller: 'MatchCtrl'
        }
      }
    })
    .state('app.chats',{
      url:"/chats/{user_id}",
      views:{
        'menuContent':{
          templateUrl:'templates/chat.html',
          controller:'ChatCtrl'
        }
      }
    })
    .state('app.cards', {
      url: "/cards",
      views: {
        'menuContent' :{
          templateUrl: "templates/cards.html",
          controller: 'CardsCtrl'
        }
      }
    })
    .state('app.login',{
      url:'/login',
      views:{
        'menuContent':{
          templateUrl:'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.choose_answers',{
      url:'/choose_answers',
      views:{
        'menuContent':{
          templateUrl:'templates/choose_answers.html',
          controller: 'ChooseAnswersCtrl'
        }
      }
    })
    .state('app.rate',{
      url:'/rate/{user_id}',
      views:{
        'menuContent':{
          templateUrl:'templates/rate.html',
          controller: 'RateCtrl'
        }
      }
    })
    .state('app.choose_photos',{
      url:'/choose_photos?firstTime',
      views:{
        'menuContent':{
          templateUrl:'templates/choose_photos.html',
          controller: 'ChoosePhotosCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
  
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

  });
})


.run(['$rootScope','$state','$stateParams','$timeout','principal','$q',function($rootScope,$state,$stateParams,$timeout,principal,$q){

      // create routes to listen on state changes

      $rootScope.$on('$stateChangeStart',function(event,toState,toParams,fromState,fromParams){
        $state.toState = toState;
        $state.toStateParams = toParams;
        $state.fromState = fromState;
        $state.fromStateParams = fromParams;

        if (principal.firstTimeUser && toState.name != 'app.choose_answers' && principal.isFBLoggedIn){
          //first time users need to go to choose_answers page
          event.preventDefault();
          $state.go('app.choose_answers');

        } else if (principal.isFBLoggedIn && toState.name === 'app.login'){
          //if logged in and going to login page, you need to be in the cards page since logged in users shouldn't be shown a login page
          event.preventDefault();
          $state.go('app.cards');

        } else if (!principal.isFBLoggedIn && toState.name != 'app.login') {
          // not logged in you belong in the login page
          event.preventDefault();
          $state.go('app.login');

        } // no else statement needed since all other routes should be correct automatically
      });

}])

// all services run after configurations and providers, factories run only when it is passed into a controller or service. 
// principal has been configured to run each time the app starts. see the State Provider .app state above
// principal is responsible for ensuring that the FB Connect Plugin is defined. When it is defined, it checks the login state of the user
// When logged in, principal saves some useful user variables that can be used in controllers, etc without making calls to my server.
// Also, when logged in, we check the location of the user and upload that to our server so that we are aware where the user is.

.factory('principal',['$q','$timeout','$state','$ionicLoading','$ionicPlatform','$ionicPopup','$http','PushService',function($q,$timeout,$state,$ionicLoading,$ionicPlatform,$ionicPopup,$http,PushService){
  return {
    id:undefined,
    firstTimeUser: undefined,
    latitude: undefined,
    longitude: undefined,
    isFBLoggedIn: undefined,
    facebook_id:undefined,
    gender: undefined,
    age: undefined,
    first_name: undefined,
    token: undefined,
    preferred_min_age: undefined,
    preferred_max_age: undefined,
    preferred_distance: undefined,
    preferred_gender: undefined,
    preferred_min_feet: undefined,
    preferred_max_feet: undefined,
    preferred_min_inches: undefined,
    preferred_max_inches: undefined,
    preferred_intentions: undefined,
    preferred_body_type: undefined,
    answer1:undefined,
    answer2:undefined,
    blurb:undefined,
    feet:undefined,
    inches:undefined,
    order:undefined,
    photos_uploaded:undefined,
    initialization: function(){

      var principal = this;

      // show the loading page
      $ionicLoading.show({
        templateUrl: "templates/loading.html"
      });
      // make sure facebook connect is working or that FB is defined because calls to FB can't happen before
      waitForFBDefinedOrFBConnectPlugin($q,$timeout).then(function(){
        // FB or facebookconnect are now defined, call facebook to determine if already logged into facebook, 
        getFBLoginStatus($q,principal).then(function(login_status){
          if (login_status.status ==="connected"){
            //setting this flag to true automatically routes the user to the Cards page. (See above routes)
            principal.isFBLoggedIn = true;
            
            // since already logged in, perform post login actions (i.e. save basic user details and upload the current geo location data to our surveys)
            postLoginPromises($q,principal,login_status,$state,$ionicLoading,$ionicPopup,$http,PushService);
          } else {
            console.log(login_status.status);
            if (login_status.status ==="not_authorized"){
              logout(principal,$state);
            } else {
              // not already logged in, go to the login page and close the loading page.
              principal.isFBLoggedIn = false;
              $state.go('app.login')
            }

            $ionicLoading.hide();  
          }
        });
      });
    }
    
  }
}])


// factory needed to set up push notifications

.factory('PushService',['$q','$http','$ionicScrollDelegate','$timeout','$state','$ionicPopup',function($q,$http,$ionicScrollDelegate,$timeout,$state,$ionicPopup){

  // the views/controllers that display messages and matches both watch the messages and matches array in this factory. 
  // The controllers invoke the functions here to populate these arrays. 
  // Other functions in this factory come from the push plugin

  return {
    appVersion:0.35,
    deferred:undefined,
    push_type:undefined,
    client_identification_sequence:undefined,
    matches: [],
    messages: [],
    timerData: {hours:"--",minutes:"--",seconds:"--",endTime:"",difference:""},

    // register for push notifications
    registerForPush: function(){
      deferred = $q.defer();
      // Whenever the appVersion changes you must reregister a push notification. Therefore we check if the appVersion stored is different
      if (window.localStorage.getItem("hasRegisteredForPush") =="true" && window.localStorage.getItem("appVersion") == this.appVersion){
        console.log('previously registered for push');
        deferred.resolve('previously registered for push');
      } else {
        // have not yet registered for push notifications. save the type of push ('gcm','apns',etc) so we can use it later.
        // then run the device dependent register function for the push notification
        //TODO: possibly need to unregister if they had a previous app version
        try{
          pushNotification = window.plugins.pushNotification;
          if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
            if(device.platform == 'amazon-fireos'){
              this.push_type = 'adm';
            } else {
              this.push_type = 'gcm';  
            }
            pushNotification.register(this.successHandler, this.errorHandler, {"senderID":AppSettings.GCM_project_number,"ecb":"onNotification"});    // required!
          } else if (device.platform == "Win32NT"){
            this.push_type = 'mpns'
            pushNotification.register(this.channelHandler,this.errorHandler,{"channelName": channelName, "ecb": "onNotification", "uccb": "channelHandler", "errcb": "jsonErrorHandler"});
          } else {
            this.push_type = 'apns'
            pushNotification.register(this.tokenHandler, this.errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotification"});  // required!
          }
        } catch(err) { 
            console.log(err);
            $q.reject("Error description: " + err.message); 
        } 
      }
      return deferred.promise;
    },

    //this redirects onNotification based on the device being used 
    onNotification : function (event) {
      console.log("redirecting on notification");
      console.log(device.platform);
      if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos'){
        this.onNotificationGCM(event);
      } else if (device.platform =='Win32NT'){
        this.onNotificationWP8(event);
      } else {
        this.onNotificationAPN(event); 
      }
    },

    // Android and Amazon
    onNotificationGCM: function(e) {
      switch( e.event )  {
        case 'registered':
          if ( e.regid.length > 0 ) {
            // Notification indicates that the phone has been successfully registered, 
            // send the registration details to our server and save the details locally so that we know not to register the phone next time
            this.client_identification_sequence = e.regid;
            window.localStorage.setItem("hasRegisteredForPush","true");
            deferred.resolve("received GCM!");
            console.log("starting send client identification to server...");
            this.sendClientIdentificationToServer();
          }
          break;
        case 'message':
          // Notification indicates it was a message type
          if (e.foreground){
            //play a sound because in foreground
            var soundfile = "beep.wav";
            var my_media = new Media("/android_asset/www/"+ soundfile);
            my_media.play();

            // if the title is a match, this is a match notification
            if (e.payload.title == "You have a new match"){
              if ($state.toState.name == 'app.matches'){
                // we are already in the matches page, update the matches array which will update the view for the user
                var order = parseInt(e.payload.order);
                this.addMatch(e.payload.swipee_id,e.payload.swipee_name,e.payload.recipient_facebook_id,order);
                
              } else if ($state.toState.name == 'app.cards') {
                // the user is on the cards page, show a dialog that a new match was made and offer the option to keep swyping or go to matches
                $ionicPopup.show({
                  title: "You have a new match!",
                  buttons: [{text: 'Continue Swyping'},
                    { text: 'Go to Matches',
                      type: 'button',
                      onTap: function(e){
                        $state.go('app.matches');
                        return;
                      }
                    }]
                });

              } else {
                console.log("on a settings or chat page");
                // on a settings page or a chat page, no need to do anything because a sound already notified the user that a match has been made
              }
            } else if ($state.toState.name == 'app.chats' && $state.toStateParams.user_id == e.payload.notId){
                // since it is not a Match notification, it is a Message notification
                // since  we area already in chat page, add this new message to the array which will update the view
                var picture = parseInt(e.payload.sender_picture1);
                this.addMessagesToChat(e.payload.sender_name,e.payload.message_content,e.payload.sender_facebook_id,picture);
            } else {
              // chat notification but not in chat
              // We've already played a sound notification so nothing else to do (Optional: play a different sound for messages vs matches)
            }  
            
          } else {
            //app is closed or in the background, the notification shows up in the notification tray
            if (e.payload.title =='You have a new match'){
              //on click of notification go to matches page.
              $state.go('app.matches');
            } else {
              //on a click of notification go to chat page
              $state.go('app.chats',{user_id:e.payload.notId});
            }
          }
          
          break;
        case 'error':
          console.log("error with notifications!")
          console.log(e.msg);
          break;
        
        default:
          console.log('Unknown, an event was received and we do not know what it is');
          break;
      }
    },

    //iOS

    onNotificationAPN:  function (e) {
      
      if (e.alert) {
           
           // showing an alert also requires the org.apache.cordova.dialogs plugin
           navigator.notification.alert(e.alert);
      }
          
      if (e.sound) {
          // playing a sound also requires the org.apache.cordova.media plugin
          var snd = new Media(e.sound);
          snd.play();
      }
      
      if (e.badge) {
          pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
      }
    },

    //WP8

    onNotificationWP8:  function(e) {

        if (e.type == "toast" && e.jsonContent) {
            pushNotification.showToastNotification(successHandler, errorHandler,
            {
                "Title": e.jsonContent["wp:Text1"], "Subtitle": e.jsonContent["wp:Text2"], "NavigationUri": e.jsonContent["wp:Param"]
            });
            }

        if (e.type == "raw" && e.jsonContent) {
            alert(e.jsonContent.Body);
        }
    },

    // success handler for Android and amazon
    successHandler:  function(result) { 
      deferred.resolve(result);
    },

    //token handler for iOS
    tokenHandler : function(result) {
      this.client_identification_sequence = result.token, //<--NOT TESTED yet, not sure what the variable name is
      window.localStorage.setItem("hasRegisteredForPush","true"); 
      deferred.resolve(result);
      this.sendClientIdentificationToServer();
    },

    // channel handler for WP8
    channelHandler: function(result){
      this.client_identification_sequence = result.channel // <--NOT TESTED yet, not sure what variable name is
      window.localStorage.setItem("hasRegisteredForPush","true");
      deferred.resolve(result);
    },

    // error handler for all push services

    errorHandler:  function(error) {
      console.log(JSON.stringify(error));
      console.log("Failed to register phone!");
      deferred.reject(error);
    },

    //uploading identification to server
    sendClientIdentificationToServer : function (){
      window.localStorage.setItem("appVersion",this.appVersion);
      console.log("saved appVersion to local " + window.localStorage.getItem("appVersion"));
      console.log("current appVersion is " + this.appVersion);
      $http.put(AppSettings.baseApiUrl + 'profiles/'+this.facebook_id,{profile:{client_identification_sequence:this.client_identification_sequence, push_type:this.push_type}})
      .success(function(data,status,headers,config){
        //on successful registration and successfully sending details to server save on the phone the local app version
        console.log("sent client identification to server");
        
      })
      .error(function(data,status,headers,config){})
    },
    // timer is needed for the chat countdown
    timer: function(){
      timerData = this.timerData;
      var d = new Date();
      timerData.difference =  timerData.endTime-d;
      timer = this.timer;
      if(timerData.difference>0){
        timerData.hours = Math.floor(timerData.difference/1000/60/60);
        timerData.minutes = Math.floor(timerData.difference/1000/60) - timerData.hours*60;
        timerData.seconds = Math.floor(timerData.difference/1000) - timerData.hours*60*60 -timerData.minutes*60;
        $timeout(timer,1000);
      } else {
        timerData.hours = "00"
        timerData.minutes = "00"
        timerData.seconds = "00"
      }
    },
    // this function called from the chat controller ('ChatCtrl'). It populates the array of messages which populates the view
    // it also populates the timer data
    getInitialMessages:function(user_id){
      messages = this.messages;
      timerData = this.timerData;
      timer = this.timer;
      facebook_id = this.facebook_id;
      $http.get(AppSettings.baseApiUrl + 'messages/'+this.facebook_id,{params:{recipient_id:user_id}})
      .success(function(data, status, headers, config){
          
          if (data['messages']){
              // since at least one message exists, get the start time of that message, figure out end time and start the timer
              start = new Date(data['match_time']); 
              timerData.endTime = new Date(start.getTime() + 60*60*24*1000);
              $timeout(timer,1000);
              for(i=0;i<data['messages'].length;i++){
                if (facebook_id == data['messages'][i].sender_facebook_id){
                  messages.push({first_name:data['messages'][i].sender_name,content:data['messages'][i].content,picture1: AppSettings.amazonBaseUrl + "app/public/pictures/"+data['messages'][i].sender_facebook_id+"/thumb/" + (data['current_user']+1) + ".jpg"})  
                } else {
                  messages.push({first_name:data['messages'][i].sender_name,content:data['messages'][i].content,picture1: AppSettings.amazonBaseUrl + "app/public/pictures/"+data['messages'][i].sender_facebook_id+"/thumb/" + (data['other_user']+1) + ".jpg"})
                }
              }
              $ionicScrollDelegate.scrollBottom(true);
          } else {
              //no messages exist, only the time exists, display the timer countdown
              start = new Date(data['match_time']); 
              timerData.endTime = new Date(start.getTime() + 60*60*24*1000);
              $timeout(timer,1000);
              // TODO show a message when 2 people haven't started talking yet.
          }
      })
      .error(function(data, status, headers, config){
      });
    },

    // adding messages to an array called on push notifications
    addMessagesToChat: function(sender_name,content,sender_facebook_id,sender_picture1){
      var messages = this.messages;
      messages.push({first_name:sender_name,content:content,picture1: AppSettings.amazonBaseUrl + "app/public/pictures/"+sender_facebook_id+"/thumb/" + (sender_picture1+1) +".jpg"}); 
      $timeout(function(){
        $ionicScrollDelegate.scrollBottom(true);  
      });
    },

    // this function called from the matches controller ('MatchCtrl'). It populates the array of matches which propagate to the view
    // also sets which matches are 'out of time'
    getMatches: function(id){
      var matches = this.matches;
      $http.get(AppSettings.baseApiUrl + 'matches/' + id)
      .success(function(data,status,headers,config){
        console.log(data)
        if (data.length){
          for(i=0;i<data.length;i++){
            start = new Date(data[i].match_time);
            end = new Date(start.getTime() + 60*60*24*1000);
            if (end > new Date()){
              matches.push({swipee_id:data[i].swipee_id,first_name:data[i].swipee_name,picture1:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].recipient_facebook_id+"/thumb/" +(data[i].order[0]+1)+".jpg",too_late:false,already_rated:data[i].answer1_rating})
            } else {
              matches.push({swipee_id:data[i].swipee_id,first_name:data[i].swipee_name,picture1:AppSettings.amazonBaseUrl + "app/public/pictures/"+data[i].recipient_facebook_id+"/thumb/" + (data[i].order[0]+1) +".jpg",too_late:true,already_rated:data[i].answer1_rating})
            }
          }          
        } else {
          //TODO show something for no matches
        }
        console.log(matches);
      })
      .error(function(data,status,headers,config){
      });
    },
    // adding matches to an array called on push notifications
    addMatch: function(swipee_id,swipee_name,recipient_facebook_id,order){
      var matches = this.matches;
      $timeout(function(){
        matches.unshift({swipee_id:swipee_id,first_name:swipee_name,picture1:AppSettings.amazonBaseUrl + "app/public/pictures/"+recipient_facebook_id+"/thumb/" + (order+1)+ ".jpg",too_late:false,already_rated:null})
      });
    }
    
  }
}])

// this is called when notification occurs and redirects to the PushService.onNotification method
function onNotification(event) {
    var injector = angular.element(document.body).injector();
    injector.invoke(function (PushService) {
        PushService.onNotification(event);
    });
}

// function to determine geolocation, this is executed in the function postLoginPromises
function GEOLocation(q,principal){
  var deferred = q.defer();
  navigator.geolocation.getCurrentPosition(
    function(position){
      deferred.resolve(position);
    },
    function(err){
      deferred.reject(err)
      console.log(JSON.stringify(err));
    });
  return deferred.promise;
}
// function to ensure that FB is defined or FBConnectPlugin is defined. 
// Due to the asynchronous nature of downloading FB from the web, we need to make sure FB is defined before using it's functions. 
// Also FBConnectPlugin is sometimes undefined before the other methods are executed. Therefore we have to make sure that is defined as well 
// this function simply calls a timeout of 50 ms until those functions are defined or 10 timeouts have occured. 
// Generally speaking if 10 timeouts have occured, there is an issue with the user's internet and the app can't proceed.

function waitForFBDefinedOrFBConnectPlugin(q,timeout){
  var deferred = q.defer();
  if (!window.cordova){
    //only run FB check if in browser
    checkFBDefinedRecursive(0,timeout,deferred);  
  } else {
    //only run FBConnectPlugin check if using a mobile device
    checkFBConnectPluginLoadedRecursive(0,timeout,deferred);
  }
  return deferred.promise;
}

//recursively run 10 times or until FB is defined
function checkFBDefinedRecursive(attempts,timeout,deferred){
  var i = attempts + 1;
  if (typeof(FB) !='undefined' && FB!=null){
    console.log("resolved FB Defined");
    facebookConnectPlugin.browserInit(543388419124166,"v2.0");
    deferred.resolve("FB Defined!");
  } else if (i <=10){
      timeout(function() {checkFBDefinedRecursive(i,timeout,deferred);},50);
  } else {
    console.log("max attempts reached...FB is not defined");
    deferred.reject("max attempts reached...FB is not defined");
  }
}

//recursively run 10 times or until FBConnectPlugin is defined
function checkFBConnectPluginLoadedRecursive(attempts,timeout,deferred){
  var i = attempts + 1;
  if (typeof(facebookConnectPlugin) !='undefined' && facebookConnectPlugin!=null){
    console.log("resolved FB Connect Plugin defined");
    console.log(facebookConnectPlugin);
    console.log(JSON.stringify(facebookConnectPlugin));
    deferred.resolve("FBConnectPlugin is now defined");
  } else if (i <=10){
      timeout(function() {checkFBConnectPluginLoadedRecursive(i,timeout,deferred);},50);
  } else {
      console.log("max attempts reached...FB Connect Plugin is not defined");
      deferred.reject("max attempts reached...FB Connect Plugin is not defined");
  } 
}

// this function is called on opening an app. It checks login status by making a call to the FB api. 
function getFBLoginStatus(q,principal){
  var deferred = q.defer();
  facebookConnectPlugin.getLoginStatus(
    function(res){
      if (typeof(res) != 'undefined' && res.status === 'connected'){
        deferred.resolve(res);
      } else {
        console.log("Not connected to facebook: status is: " + res.status+" + try logging out and logging back in");
        deferred.resolve(res);
      }
    },
    function(err){
      console.log('getLoginStatus Error: ' + err);
      deferred.reject(err);
    }
  );
  return deferred.promise;
}

function logout(principal,state){
  facebookConnectPlugin.logout(
    function(){
        console.log("successfully logged out");
        principal.isFBLoggedIn = false;
        state.go('app.login');
    },function(){
      console.log("failed to logout");
  });
}

// this function checks if the user's facebook id is saved on our server. If not, then it's the first time the user has used this app.
function checkIfFirstTimeUser(q,principal,http){
  var deferred = q.defer();
  http.get(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id).success(function(data,status,headers,config){
        console.log("successful HTTP Call to check if first time user");
        deferred.resolve(data);
      }).error(function(data,status,headers,config){
        deferred.reject("failed to make HTTP Call to check if first time user");
      });
  return deferred.promise;    
}

// get facebook data
function getFacebookData(q,principal){
  var deferred = q.defer();
  facebookConnectPlugin.api('/me?fields=gender,first_name,birthday',['public_profile','user_photos','user_birthday'],
    function(response){
      deferred.resolve(response);
    },function(errors){
      console.log(errors);
      deferred.reject(errors);
    });
  return deferred.promise;
}

// send geo location data to our servers 
function updateGeoCoordinates(q,principal,http){
  var deferred = q.defer();
    http.put(AppSettings.baseApiUrl + 'profiles/'+principal.facebook_id,{profile:{latitude:principal.latitude, longitude:principal.longitude, age:principal.age}})
    .success(function(data, status, headers, config){
      deferred.resolve(data);
    }).error(function(data, status, headers, config){
      deferred.reject(data);
    });
  // }
  return deferred.promise;
}

// once logged in, make call to fb to get the facebook_id, simultaneously get age and gender in case this is a first time user and we will need that info.
// simultaneously get geo location and then update the geolocation, route the user based on if it's their first time or not
function postLoginPromises(q,principal,login_status,state,ionicLoading,ionicPopup,http,PushService){

  q.all([getFacebookData(q,principal),GEOLocation(q,principal)]).then(function(response){
      console.log("done geting facebook data and geolocation");
      currentYear = new Date().getFullYear()
      principal.facebook_id = response[0].id;
      PushService.facebook_id = response[0].id;
      principal.age = currentYear - parseInt(response[0].birthday.substring(6,10));
      principal.first_name = response[0].first_name;
      principal.gender = response[0].gender;
      principal.latitude = response[1].coords.latitude;
      principal.longitude = response[1].coords.longitude;

    // check first time user
    checkIfFirstTimeUser(q,principal,http).then(function(data){
      if(data){
        console.log("done checking first time user");
        principal.firstTimeUser = false;
        // save details locally
        principal.answer1 = data.answer1;
        principal.answer2 = data.answer2;
        principal.blurb = data.blurb;
        principal.feet = data.feet;
        principal.inches = data.inches;
        principal.order = data.order;
        principal.photos_uploaded = data.photos_uploaded;
        principal.preferred_min_age = data.preferred_min_age;
        principal.preferred_max_age = data.preferred_max_age;
        principal.preferred_distance = data.preferred_distance;
        principal.preferred_min_feet = data.preferred_min_feet;
        principal.preferred_min_inches = data.preferred_min_inches;
        principal.preferred_max_feet = data.preferred_max_feet;
        principal.preferred_max_inches = data.preferred_max_inches;
        principal.preferred_intentions = data.preferred_intentions;
        principal.preferred_body_type = data.preferred_body_type;

        principal.id = data.id;
        
        //not a first time user, then update the geo coordinates since we need update location details.

        updateGeoCoordinates(q,principal,http).then(function(){
          console.log("done updating geo coordinates ")
          // once done updating location, send to cards page or whichever page you came from
          // also hide loading page

            if (state.toState.name ==='app.login'){
              ionicLoading.hide();
              state.go('app.cards'); 
            } else {
              ionicLoading.hide();
              state.go(state.toState.name);
            }
        });

        //not a first time user, check if the app version has changed. changed app versions need to reregister for push.
        if (window.localStorage.getItem("hasRegisteredForPush") == "true" && window.localStorage.getItem("appVersion") == PushService.appVersion){
          //all good, already registered and app versions are same, nothing to do
          console.log("same app version nothing to do... local version:" + window.localStorage.getItem("appVersion") + " current version: " + PushService.appVersion)
        } else {
          console.log("new app version registering for push...")
          PushService.registerForPush();
        }

      } else {
        // first time user, therefore we don't need to update database yet since we've saved it in the factory and will update it on the choose_answers page
        // this prevents multiple HTTP calls and should generally make things faster.
        principal.firstTimeUser = true;
        ionicLoading.hide();
        state.go('app.choose_answers');
        
      }

    });
  });
}
