

var UserId = -1;
var UserName = "";
var sessionID = "";
var loggedIn = false;

//set up lister events.
$(document).on("");
$(document).on("");


//this ensures that a name was entered i.e. no digits hyphens and ' allowed
//because they exist in some names
function validateFirst(first){
    var firstCheck = new RegExp(/^[a-zA-Z]+((-?|'?)[a-zA-Z]*)*$/);
    console.log(firstCheck.test(first.value));
    if(!firstCheck.test(first.value)){
        $("#flabel").css("color","red");
        return false;
    }
    return true;
}

//this ensures that a name was entered i.e. no digits hyphens and ' allowed
//because they exist in some names
function validateLast(last){
    var lastCheck = new RegExp(/^[a-zA-Z]+((-?|'?)[a-zA-Z]*)*$/);
    console.log(lastCheck.test(last.value));
    if(!lastCheck.test(last.value)){
        $("#llabel").css("color","red");
        return false;
    }
    return true;
}

//this makes sure an email address was entered i.e. blah@blah.blah
function validateEmail(email,msgLoc){
    var emailCheck = new RegExp(/[^@\s]+@(\w|\d)+(.(\w|\d)+)+/);
    console.log("email check:"+emailCheck.test(email.value));
    if(!emailCheck.test(email.value)){
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
    console.log(passwdCheckIllegalChar.test("has illegal chars: " +passwd.value) ||
                !(passwdCheckUpChar.test(passwd.value) &&
                  passwdCheckLowChar.test(passwd.value) &&
                  passwdCheckDigit.test(passwd.value) &&
                  passwdCheckSpecChar.test(passwd.value)));
    if(passwdCheckIllegalChar.test(passwd.value) ||
       !(passwdCheckUpChar.test(passwd.value) &&
         passwdCheckLowChar.test(passwd.value) &&
         passwdCheckDigit.test(passwd.value) &&
         passwdCheckSpecChar.test(passwd.value))){
           $("#plabel").css("color","red");
           verify=false;
       }
    if(passwd.value != passwdcheck.value){
        $("#pclabel").css("color","red");
        verify=false;
    }
    return verify;
}

function createAccount(form){
    //uses a variable in order that all fields be evaluated before stoping
    //allows the client to see all mistakes at first input, rather than one
    //at each submit
    var valid=true;
    if(!validateFirst(form.first)) valid=false;
    else $("#flabel").css("color","black");
    if(!validateLast(form.last)) valid=false;
    else $("#llabel").css("color","black");
    if(!validateEmail(form.email, "elabel")) valid=false;
    else $("#elabel").css("color","black");
    if(!validatePass(form.passwd,"plabel")) valid=false;
    else $("#plabel").css("color","black");
    if(!compPasswd(form.passwd,form.passwdconf)) valid=false;
    else $("#pclabel").css("color","black");
    console.log("valid: "+valid);
    if(!valid){
        $("#caMsg").html("error: enter all fields correctly, incorrect fields" +
                         " highlighted red");
        return false;
    }
    
    $.post("", {},
           function(jsonData) {
           var rspData = $.parseJSON(jsonData);
           //$("#caMsg").html(rspData.MsgNo +" - "+ resData.msg);
           //login the new account
           //update session ID and other variables
           UserId = rspData.UserId;
           UserName = rspData.UserName;
           sessionID = rspData.sessionID;
           loggedIn = true;
           }
           )
    return true;
    
}
function createAccount(form){
    //uses a variable in order that all fields be evaluated before stoping
    //allows the client to see all mistakes at first input, rather than one
    //at each submit
    var valid=true;
    if(!validateFirst(form.first)) valid=false;
    else $("#flabel").css("color","black");
    if(!validateLast(form.last)) valid=false;
    else $("#llabel").css("color","black");
    if(!validateEmail(form.email, "elabel")) valid=false;
    else $("#elabel").css("color","black");
    if(!validatePass(form.passwd,"plabel")) valid=false;
    else $("#plabel").css("color","black");
    if(!compPasswd(form.passwd,form.passwdconf)) valid=false;
    else $("#pclabel").css("color","black");
    console.log("valid: "+valid);
    if(!valid){
        $("#caMsg").html("error: enter all fields correctly, incorrect fields" +
                         " highlighted red");
        return false;
    }
    
    //hash the password
    
    
    $.post("", {}, //fill out the JSON info
           function(jsonData) {
           var rspData = $.parseJSON(jsonData);
           //$("#caMsg").html(rspData.MsgNo +" - "+ resData.msg);
           //login the new account
           //update session ID and other variables
           UserId = rspData.UserId;
           UserName = rspData.UserName;
           sessionID = rspData.sessionID;
           loggedIn = true;
           }
           )
    return true;
    
}

//Destination specifies what page is being loaded
//msgBool specifies whether or not to display a pop-up message
//Function validates the existing session before users can access protected data
function validateSession(destination, msgBool){
    $.getJSON("",function(data){
              //check how this php was functioning and set up an ASP.net version with connor.
              if(sessionID == data.session_id){
              //change page successfuly
              //otherwise return to login page
              return true;
              }
              else{
              //return users to login page
              //clear any session variables
              //logout
              return false;
              }
              
              
              }
              )
}

function login(){
    
}


function logout(){
    $(document).off("beforeunload");
    $.get("");//whatever we make our logout function
    //change to loginPage
}






