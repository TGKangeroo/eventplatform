function sendTelegramMessage(){
  var events = getEvents();
  // generalEventMessage(events[1]);
  var text=eventsThisWeek();
  sendText(text);
}

function generalEventMessage(eventArray) {
  if(eventArray.title==null){
    var event = retrieveEvent(eventArray);
  }else{
    var event = eventArray
    }
  var eventName =event.title;
  
  
  if(event.startDate != event.endDate){
    var when = "Happening from " + event.startDate + " " + event.startTime + " - " + event.endDate + " " + event.endTime;
  }else{
    var time=event.startTime + " - " + event.endTime;
    var when = "Happening on " + event.startDate + " from " + time + "\n";
  }
  
  var link =event.facebookLink;
  
  if(event.locationName!=""){
  var location =event.locationName + "\n" + event.locationStreet;
  }else{
  var location = event.locationStreet;
  }
  var title ="<strong>" + eventName + "</strong> \n";
  
  var where = location + " is the place to be! \n";
  var link = "Check out the event on this link: " + link + " \n";
  
  return title + when + where + link;
}

function eventsToday(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var events = getEventObjects();
  var full_message="";
  for (var i = 0; i < events.length; ++i) {
    var event = new Event();
    event=events[i];
    if( event.startDate== Utilities.formatDate(new Date(), "Europe/Vienna", "dd/MM/yyyy")){
      full_message+= "\n " + generalEventMessage(event);
    }
  }
  
  if(full_message!=""){
    
    full_message="<b>These are our events today:</b> \n" + full_message;
    full_message+="\n We hope to see you there!";
    
  }
  return full_message;
  
}
function eventsThisWeek(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var events = getEventObjects();
  
  
  
  
  var message_Text="This week we have a bunch of events ready for you! \n\n";
  
  for (var i = 0; i < events.length; ++i) {
    var event = new Event();
    event=events[i];
    var title= "<strong>" + event.title + "</strong> \n";
    
    var start_time= event.startTime;
    var end_time=event.endTime;
    if(event.startDate != event.endDate){
      var date = "Happening from " + event.startDate + " " + event.startTime + " - " + event.endDate + " " + event.endTime;
    }else{
      var time=event.startTime + " - " + event.endTime;
      var date = "Happening on " + event.startDate + " from " + time + "\n";
    }
    
    var section ="Organised by " + event.section + "\n";
    
    message_Text+= title + date + section + "\n\n";
  }
  message_Text +="For more information, check out https://esnvienna.com/events";
  return message_Text;
  
  
}


function sectionEventsThisWeek(section){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = ss.getSheetByName('Overview');
  var events = [];
  var dataRange = sheet.getRange(1, 1, sheet.getLastRow() , sheet.getLastColumn()); // let it read more columns than are being used, it might mess up otherwise
  // Fetch values for each row in the Range.
  var data = dataRange.getValues();
  for (var i = 1; i < data.length; ++i) {
    
    var row = data[i];
    var now = new Date();
    var event_date= new Date( row[3].substring(0,row[3].length-5));
    
    if(event_date >= now && event_date <= addDays(now,7) && row[21] == section){
      events.push(row);
    }
    
    
  }
  
  
  var message_Text="This week we have a bunch of events ready for you! \n\n";
  
  for (var i = 0; i < events.length; ++i) {
    
    var title= "<strong>" + events[i][1] + "</strong> \n";
    
    var start_time=new Date( events[i][3].substring(0,events[i][3].length-5));
    var end_time=new Date( events[i][4].substring(0,events[i][4].length-5));
    var date= Utilities.formatDate(start_time, "GMT+2", "MM/dd/yyyy-HH:mm") + " - " + Utilities.formatDate(end_time, "GMT+2", "HH:mm")
    + "\n";
    var section ="Organised by " + events[i][21] + "\n";
    
    message_Text+= title + date + section + "\n\n";
  }
  message_Text +="For more information, check out https://esnvienna.com/events";
  
  sendText(message_Text);
}


