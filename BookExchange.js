
var UserId = "";
var sessionID = ""; //Authentication token
var loggedIn = false;
var encodedBase = "";

//set up listener events.
//for any page
//redirect for pages that require to be logged in
//do before unload? to prevent reloading the page when 
//attempting to access a page you cannot access
//without being logged in (as well as on ready)
$(document).ready(validateSession(window.location.pathname));
$(document).ready(function(){
$("#loginForm").submit(function(e){
   e.preventDefault();
   login($("#loginForm"));
});

$("#registerForm").submit(function(e){
   e.preventDefault();
   createAccount($("#registerForm"));
});

$("#listingForm").submit(function(e){
   e.preventDefault
   addListing($("#listingForm"));
});

});

//this ensures that a name was entered i.e. no digits hyphens and ' allowed
//because they exist in some names
function validateFirst(first){
    var firstCheck = new RegExp(/^[a-zA-Z]+((-?|'?)[a-zA-Z]*)*$/);
    console.log(firstCheck.test(first));
    if(!firstCheck.test(first)){
        $("#flabel").css("color","red");
        return false;
    }
    return true;
}

//this ensures that a name was entered i.e. no digits hyphens and ' allowed
//because they exist in some names
function validateLast(last){
    var lastCheck = new RegExp(/^[a-zA-Z]+((-?|'?)[a-zA-Z]*)*$/);
    console.log(lastCheck.test(last));
    if(!lastCheck.test(last)){
        $("#llabel").css("color","red");
        return false;
    }
    return true;
}

//this makes sure an email address was entered i.e. blah@blah.blah
function validateEmail(email,msgLoc){
    var emailCheck = new RegExp(/[^@\s]+@(\w|\d)+(.(\w|\d)+)+/);
    console.log("email check:"+emailCheck.test(email));
    if(!emailCheck.test(email)){
        $("#"+msgLoc).css("color","red");
        return false;
    }
    return true;
}

function validatePhone(phone,msgLoc){
   var phoneCheck = new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/);
   console.log("phone check: " + phoneCheck.test(phone));
   if(!phoneCheck.test(phone)){
      $("#"+msgLoc).css("color","red");
      return false;
   }
   return true;
}

//this function checks the password for correctness then checks if it matches
//the verification of the password
function compPasswd(passwd, passwdcheck){
    var verify = true;
    var passwdCheckUpChar =  new RegExp(/[A-Z]/);
    var passwdCheckLowChar = new RegExp(/[a-z]/);
    var passwdCheckDigit = new RegExp(/\d/);
    var passwdCheckSpecChar = new RegExp(/[.,?!@#$%^&*+=]/);
    var passwdCheckIllegalChar = new RegExp(/\s?[;:'"<>\/\\\|\[\{\}\]-_`~]/);
    console.log("Pass verification issue: " + passwdCheckIllegalChar.test(passwd) ||
                !(passwdCheckUpChar.test(passwd) &&
                  passwdCheckLowChar.test(passwd) &&
                  passwdCheckDigit.test(passwd) &&
                  passwdCheckSpecChar.test(passwd)));
    if(passwdCheckIllegalChar.test(passwd) ||
       !(passwdCheckUpChar.test(passwd) &&
         passwdCheckLowChar.test(passwd) &&
         passwdCheckDigit.test(passwd) &&
         passwdCheckSpecChar.test(passwd))){
           $("#plabel").css("color","red");
           verify=false;
          console.log("Password: " +passwd+ " is valid: " + verify);
       }
    if(passwd != passwdcheck){
        $("#pclabel").css("color","red");
        verify=false;
    }
    return verify;
}

//needs to be synchronous
function createAccount(form){
    //uses a variable in order that all fields be evaluated before stoping
    //allows the client to see all mistakes at first input, rather than one
    //at each submit
    //if(!validateFirst(form.first)) valid=false;
    //else $("#flabel").css("color","black");
    //if(!validateLast(form.last)) valid=false;
    //else $("#llabel").css("color","black");

    var valid=true;

    if(!validateEmail($("#registerEmail").val(), "elabel")) valid=false;
    else $("#elabel").css("color","black");
    if(!compPasswd($("#registerPassword").val(),$("#registerPasswordConfirm").val())) valid=false;
    else {$("#pclabel").css("color","black"); $("#plabel").css("color","black");}
    if(!validatePhone($("#registerPhone").val(),"phlabel")) valid=false;
    else $("#rphlabel").css("color","black");
    console.log("valid: "+valid);
    //add phone number field

    if(!valid){
        $("#caMsg").html("error: enter all fields correctly, incorrect fields" +
                         " highlighted red");
        return false;
    }
    
    //hash the password
    var PHash = CryptoJS.MD5($("#registerPassword").val()).toString();
    var rusrname = $("#registerUsername").val();
    var rphone = $("#registerPhone").val();
    var remail = $("#registerEmail").val();


    var cadata = JSON.stringify({"UserName":rusrname,
                   "PasswordHash":PHash,
                   "PhoneNumber":rphone,
                   "EmailAddress":remail
                 });

    console.log(cadata);
    
    //synchronous $.ajax for simpler async use $.post or $.get
    $.ajax({
          url: "http://boutinvm.eastus.cloudapp.azure.com/Distribute.svc/NewUser", 
          type: "POST",
          dataType: 'json',          
          async: true,
          crossDomain: true,
          contentType: "application/json; charset=UTF-8",
          headers: {
                     "Content-Type": "application/json"
                   },
          processData: false,
          data:  cadata,
          success: function(jsonData) {
             var rspData = $.parseJSON(jsonData);
             //$("#caMsg").html(rspData.MsgNo +" - "+ resData.msg);
             //login the new account
             //update session ID and other variables
             //need to check success (i.e. if the username wasnt already taken)
             UserId = rspData.Data.UserId;
             var UserName = rspData.Data.UserName;
             loggedIn = true;
             //create cookie
             console.log(rspData);
             console.log(UserId);
             console.log(UserName);
             createCookie(UserId, UserName);
             changepage("homepage.html");
           },
           error: function(xhr,ajaxOptions,thrownError){
              alert("ERROR:" + xhr.responseText+" - "+thrownError);
           }
           });
    return true;
    
}

//Destination specifies what page is being loaded
//Function validates the existing session before users can access protected data
//synchronous?
function validateSession(dest){
   var pathArr = dest.split('/');
   var page = pathArr[pathArr.length - 1]; //this works to get the page name
   page = page.split('.'); 
   if(page.length > 1){
      var params = window.location.search.split('?');
      params = params[params.length-1];
      params = params.split('&');
      for(var i = 0; i < params.length; i++){
         //alert(params);
         if(params[i].split('=')[0] == "id"){
            UserId = params[i].split('=')[1];
         }
      }
      //alert(UserId);
   }
   page = page[0];
   
   //alert(page + " " + UserId);

   if(page != "login" && (UserId == "0"||UserId==""||UserId==null)){
      changepage("login.html");
   }
   
   else if (page == "login" && UserId!="0" && UserId!="" && UserId!=null)
      changepage("homepage.html");


   /*
   var decodedCookie = decodeURIComponent(document.cookie);
   var ca = decodedCookie.split(';');
   console.log(ca[0]);
   for(var i = 0; i < ca.length; i++){
      var cookie = ca[i];
      while(cookie.charAt(0) == ' '){
         cookie = cookie.substring(1);
      }
      if (cookie.indexOf("id=" == 0)){
         //cookie = cookie.substring(3);
         break;
      }
   }

   alert(page + "  " + cookie);
   alert(document.cookie);
   //investigate how this works (maybe alert to dialogue some of this stuff
   if((cookie == "id="|| cookie == "") && page != "login"){
      window.location.href = "login.html";
   }
   else if(page == "login" && (cookie != "id=" && cookie!= "")) {
      UserId = cookie.substr(3);
      console.log(UserId);
      // and get the User ID
      loggedIn = true;
      window.location.href = "homepage.html";
   }
   else if(page!="login"){
      UserId = cookie.substr(3); 
      console.log(UserId);
      alert(UserId);
      loggedIn = true;
      //createCookie(UserId);
      //alert(document.cookie);
   }
   */
   
    

                                            
    //if not logged in redirect to login (if not already there)
    //window.location.href = "login.html";
    //if logged in redirect to homepage if at login page
    //window.location.href = "homepage.html";
}

//synchronous
function login(form){

   var lusr = $("#loginEmail").val();
   var Phash = CryptoJS.MD5($("#loginPassword").val()).toString();
   var Data = JSON.stringify({
           "UserName" : lusr,
           "PasswordHash" : Phash
        });
   //synchronous login so the users can not change page while attempting to login   

   $.ajax({
        url: "http://boutinvm.eastus.cloudapp.azure.com/Distribute.svc/Authenticate",
        method: "POST",
        async: false,
        contentType:"application/json",
        dataType:'json',
        data: Data,
        success: function(jsonData){
           //parse
           var rspData = $.parseJSON(jsonData);
           if(rspData.Status == 0){
              //any other error handling
              alert("Username and Password do not match");
              return;
           } 
           UserId = rspData.UserId;
           loggedIn = true;
           //create the cookie
           createCookie(UserId);
           //change page?
           changepage("homepage.html");
        },
        error: function(){
           alert("AJAX error");
        }
     });
}


function imagePreview(input){
   if(input.files && input.files[0]){
      var img = new Image();
      img.src = URL.createObjectURL(input.files[0]);
      $("#imgDiv").append(img);
      img.onload = function(){
      var can = document.createElement('canvas');
      can.width = img.width;
      can.height = img.height;
      var ctx =  can.getContext("2d");
      ctx.drawImage(img,0,0);
      encodedBase = can.toDataURL("image/jpg");
      }
   }
}

function AddAListing(){
   var nlURL = "boutinvm.eastus.cloudapp.azure.com/Distribute.svc/NewListing";

   var nldata = JSON.stringify({"Name":$("#sellTitle").val(),
                   "ISBN":$("#sellISBN").val(),
                   "Images":[encodedBase],
                   "Author":$("#sellAuthor").val(),
                   "Publisher":$("#sellPublisher").val(),
                   "Edition":$("#sellEdition").val(),
                   "ListPrice":$("#sellPrice").val(),
                   "Negotiable":$("#sellNegotiable").prop("checked"),
                   "Description":$("#sellDesc").val(),
                   "Condition":$("#sellCon").val()
              });  
   console.log(nldata);
   /*
   $.post(url, data,function(jsonData){
      var rspData = $.parseJSON(jsonData);
      //update listing table
      //how we do this depends on the order of the listing table
      console.log(rspData);
      //getListings();
   }
   );*/

   $.ajax({
        url: nlURL,
        method: "POST",
        async: true,
        contentType:"application/json",
        dataType:'json',
        data: nldata,
        success: function(jsonData){
           //parse
           var rspData = $.parseJSON(jsonData);
           if(rspData.Status == 0){
              //any other error handling
              alert("Failed to add listing, please report error");
              return;
           }
           console.log(rspData);
        },
        error: function(xhr,ajaxOptions,thrownError){
           alert("ERROR:" + xhr.responseText+" - "+thrownError);
        }
     });

}


//should get an array of the users listings and the populate the table
function getListings(){
   /*
   var url = "";
   
   $.get(url, {}, function(jsonData){
      var rspData = $.parseJSON(jsonData);
      //check rspdata for any errors then if none cal populateTable (for cleaner code)
      populateListingTable(rspData);
      
   });
*/
}
/*
//create a popup window or some other way to preserve data of search that shows the details of selected listing
function getDetails(listingID){


}

//get user profile information
//for the edit profile page?
function getProfile(){

   $.get(url,data,function(rspData){
      $.parseJSON(rspData);
   });

}
 
*/
//Get rid of the token/cookie
function logout(){
    $(document).off("beforeunload");
    //change to loginPage
    document.cookie = "id=;usrName=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
}


function createCookie(userId){
   var d = new Date();
   d.setTime(d.getTime() + (14*24*60*60*1000));
   var expires = "expires="+d.toUTCString();
   document.cookie = "id="+userId+";"+expires+";path=/";
   console.log(document.cookie);
   console.log(document.cookie);
}

function changepage(dest){
   if (UserId != null)
      dest += "?id=" +UserId;
   window.location.href = dest;

}
