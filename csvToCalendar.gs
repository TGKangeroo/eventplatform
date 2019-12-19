function autoCalendar(){
addToCalendar('TU');
addToCalendar('Technikum');
addToCalendar('UW');
addToCalendar('BOKU');
addToCalendar('BFI');  
addToCalendar('WKW');
}

function addToCalendar(section) {
 
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = ss.getSheetByName('Overview');
  
  var events = getEventObjects();
  for (var i = 0; i < events.length; ++i) {
    
    var event = events[i];
    
    if(event.section.indexOf(section)>-1){ 
    var calendar= CalendarApp.getCalendarById(getCalendar(section).toString());
    
     
    var duplicate = calendar.getEventById(event.calendarId);
      
    if(duplicate == null)  {
      
      var title= event.title;
      var calendarEvent = calendar.createEvent(title,
                                               new Date(event.fullStart),
                                               new Date(event.fullEnd),
                                               {location: event.locationStreet, sendInvites: false, description : calendarDescription(event.description)});
      calendarEvent.addGuest(vienna_calendar);
     
        var array1 = event.section.split(",");
      for(var y=0;y<array1.length;++y){
        Logger.log(array1[y]);
        if(array1[y] != section){
      calendarEvent.addGuest(getCalendar(array1[y]));
        } 
      }
      
      
      sheet.getRange(i+2, 1).setValue(calendarEvent.getId());
    }else{
    calendarEvent= calendar.getEventById(duplicate.getId());
      calendarEvent.setTitle(event.title);
      calendarEvent.setTime(event.fullStart, event.fullEnd);
      calendarEvent.setLocation(event.locationStreet);
      calendarEvent.setDescription(calendarDescription(event.description));
     


  var array1 = event.section.split(",");
      for(var y=0;y<array1.length;++y){
        Logger.log(array1[y]);
        if(array1[y] != section){
      calendarEvent.addGuest(getCalendar(array1[y]));
        } 
      }
    }
  }
  }
  
  
  
}

function deleteFromCalendar(event){
var calendar= CalendarApp.getCalendarById(getCalendar(event.section).toString());
var duplicate = calendar.getEventById(event.calendarId);
  duplicate.deleteEvent();
}

function calendarDescription(description){
                          return description.replace(/<\/br>/g, "<br>");
                           }


function getCalendar(section){
  if(section=="TU"){
  return TU_CALENDAR;
  }
  
  if(section=="BOKU"){
  return BOKU_CALENDAR;
  }
  if(section=="WKW"){
  return WKW_CALENDAR;
  }
  
  if(section=="BFI"){
  return BFI_CALENDAR;
  }
  
  if(section=="Technikum"){
  return TECHNIKUM_CALENDAR;
  }
  
  if(section=="UW"){
  return UW_CALENDAR;
  }
  
  return VIENNA_CALENDAR;

}
