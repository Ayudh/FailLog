$('.sidenav').sidenav();
$('.modal').modal();
$('.chips-placeholder').chips({
  placeholder: 'Enter a tag',
  secondaryPlaceholder: '+Tag',
});
$('.timepicker').timepicker();
$('.datepicker').datepicker({
  selectMonths: true, // Creates a dropdown to control month
  selectYears: 15, // Creates a dropdown of 15 years to control year
  format: 'dd-mm-yyyy'
});

$('#add_button').on('click', () => {
  $('#date_picker').val(GetFormattedDate());
  $('#time_picker').val(JSClock());
});

function GetFormattedDate() {
  var todayTime = new Date();
  var month = (todayTime .getMonth() + 1);
  var day = (todayTime .getDate());
  var year = (todayTime .getFullYear());
  return day + "-" + month + "-" + year;
}

function JSClock() {
  var time = new Date();
  var hour = time.getHours();
  var minute = time.getMinutes();
  var temp = '' + ((hour > 12) ? hour - 12 : hour);
  if (hour == 0)
    temp = '12';
  temp += ((minute < 10) ? ':0' : ':') + minute;
  temp += (hour >= 12) ? ' PM' : ' AM';
  return temp;
}

var logCreateButtonElement = $('#log_create_button');
var signInButtonElement = $('#signin');
var signOutButtonElement = $('#signout');
var userNameElement = $('#username');
var userPicElement = $('#profile-image');
var datePickerElement = $('#date_picker');
var timePickerElement = $('#time_picker');
var logContentElement = $('#log_content');
var chipContentElement = $('#tag_input');
var logContainer = $('#log_container');

signInButtonElement.on('click', signIn);
signOutButtonElement.on('click', signOut);
logCreateButtonElement.on('click', addLog);

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
function getUserId() {
  return firebase.auth().currentUser.uid;
}

function getUserEmail() {
  return firebase.auth().currentUser.email;
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
    displayAllLogs();
  } else {
    // user is signed out
    signInButtonElement.show();
    signOutButtonElement.hide();
    userNameElement.hide();
    userPicElement.hide();
  }
}

function clearModal() {
  logContentElement.val('');
}

function addLog() {
  console.log("add log function");
  var date = datePickerElement.val();
  var time = timePickerElement.val();
  var log_content = logContentElement.val();

  var tags = [];
  var chips = M.Chips.getInstance(chipContentElement).chipsData;
  for (let i = 0; i < chips.length; i++) {
    const element = chips[i];
    tags.push(element['tag']);
  }

  // create a object to write to firebase
  var logEntry = {
    date: date,
    time: time,
    log_content: log_content,
    tags: tags
  };
  console.log(logEntry);
  firebase.database().ref('/logs/'+getUserId()+'/').push(logEntry).then(() => {
    console.log('added to firebase database');
    clearModal();
  }).catch((error) => {
    console.log('error in writing to database'+ error);
  });
}

function displayAllLogs() {
  var callback = function(snap) {
    var data = snap.val();
    displayLog(snap.key, data.date, data.log_content, data.time, data.tags);
  };

  firebase.database().ref('/logs/'+getUserId()+'/').limitToLast(12).on('child_added', callback);
  firebase.database().ref('/logs/'+getUserId()+'/').limitToLast(12).on('child_changed', callback);
}

function displayLog(key, date, content, time, tags) {
  console.log(date+time);
  var MESSAGE_TEMPLATE = `
  <div class="row" id="%key%">
  <div class="card blue-grey darken-1 z-depth-5 white-text">
    <div class="card-panel blue-grey">
      <span class="right" id="time_stamp">%time% %date%</span><label for="time_stamp" class="right"><i class="material-icons">access_time</i></label>
      <p>%content%</p>
      <div id="tags">
      </div>
    </div>
  </div>
</div>
  `;

  var replacements = {
    "%key%": key,
    "%date%": date,
    "%time%": time,
    "%content%": content
  };
  MESSAGE_TEMPLATE = MESSAGE_TEMPLATE.replace(/%\w+%/g, (all) => {
    return replacements[all] || all;
  });
  console.log(MESSAGE_TEMPLATE);
  logContainer.append(MESSAGE_TEMPLATE);
  for (let i = 0; i < tags.length; i++) {
    const element = tags[i];
    logContainer.find('#'+key).find('#tags').append(
      '<div class="chip">'+element+'</div>'
    );
  }
}