console.log("intializing sidenav");
$('.sidenav').sidenav();

var signInButtonElement = $('#signin')
var signOutButtonElement = $('#signout')
var userNameElement = $('#username')
var userPicElement = $('#profile-image')

signInButtonElement.on('click', signIn);
signOutButtonElement.on('click', signOut);

initFirebaseAuth();

function signIn() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signOut() {
  firebase.auth().signOut();
}

function initFirebaseAuth() {
  firebase.auth().onAuthStateChanged(authStateObserver);
}

function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '../images/profile_placeholder.png';
}

function getUserName() {
  return firebase.auth().currentUser.displayName;
}

function authStateObserver(user) {
  if (user) {
    // user is signed in
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    userPicElement.attr('src', profilePicUrl);
    userNameElement.text(userName);

    signInButtonElement.hide();
    signOutButtonElement.show();
    userNameElement.show();
    userPicElement.show();
  } else {
    // user is signed out
    signInButtonElement.show();
    signOutButtonElement.hide();
    userNameElement.hide();
    userPicElement.hide();
  }
}