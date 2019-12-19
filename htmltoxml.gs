function manualImport(){
  
  checkOut('TU');
  checkOut('UW');
  checkOut('BOKU');  
  checkOut('BFI');  
  checkOut('Technikum');
  checkOut('WKW');
}

function testImport(){
  
  checkOut('WKW');
}

function importJSON(section){
  var access_token=FB_ACCESS_TOKEN;
  var url="https://graph.facebook.com/v4.0/" + getSectionID(section) + "/events?fields=id%2Ccover%2Cdescription%2Ccategory%2Cstart_time%2Cend_time%2Cplace%2Cname%2Ctype%2Cowner%2Cadmins%7Bname%7D&access_token=" + access_token + "&since=-1%20month";
  var result = JSON.parse(UrlFetchApp.fetch(url).getContentText('UTF-8'));
  
  //Logger.log(result);
  
  var data = result.data;
  
  return data;
}


function processEvents(events){
  var processedEvents=[];
  for(var i = 0 ; i < events.length ; i++){
    
    processedEvents.push(processEvent(events[i]));
    
  }
  
  return processedEvents;
}
function processEvent(event){
  var processedEvent= new Event();
  processedEvent.picture = "";
  processedEvent.title = event.name;
  processedEvent.facebookLink = "";
  processedEvent.startTime = event.start_time;
  processedEvent.startDate = event.start_date;
  processedEvent.endTime = event.end_time;
  processedEvent.endDate = event.end_date;
  processedEvent.locationStreet = "";
  if (processedEvent.locationStreet !=""){
    processedEvent.locationStreet = "";
  }
  
  if(event.place.name != null){
    processedEvent.locationName =event.place.name;
  }
  
  
  
  processedEvent.description = makeFBDescription(event.description);
  
  return processedEvent;
}


function checkOut(section){
  var events = importJSON(section);
  
  for(var i = 0 ; i < events.length ; i++){
    var start_time=events[i].start_time.substring(0,19);
    
    if ( new Date(events[i].start_time) > new Date()){
      
      if(checkDuplicates(events[i])==1){
        updateEvent(events[i],section);
      }else{
        appendEvent(events[i],section);
      }
    }
  }
  var existingEvents=getEventObjects();
  
  for(var i = 0 ; i < existingEvents.length ; i++){
    
    var existingEvent=existingEvents[i];
    if(checkRemovedEvents(events,existingEvent)==1){
      
      
    }else{
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Overview');
      if(existingEvent.endDate < new Date()){
        
        
        sheet.deleteRow(getEventRow(existingEvent.facebookLink)); 
      }else{
        //deleteFromCalendar(existingEvent);
        // sheet.deleteRow(getEventRow(existingEvent.facebookLink)); 
      }
      
    }
    
    
  }
}
function updateEvent(event,section){
  var row = getEventRow("https://www.facebook.com/events/" + event.id);
  makeEventRow(row,event,section)
  
}

function appendEvent(event,section){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Overview');
  
  var lastRow = getLastDataRow(sheet);
  var nextRow = lastRow + 1;
  
  makeEventRow(nextRow,event,section);
  
  
}

function makeEventRow(nextRow,event,section){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Overview');
  var start_time=event.start_time.substring(0,19);
  if(event.end_time!=null){
    var end_time=event.end_time.substring(0,19)
    }else{
      var end_time=start_time.substring(0,10) + "T23:59:59";
    }
  
  Logger.log(event.description);
  
  sheet.getRange('B' + nextRow).setValue(event.name);
  sheet.getRange('C' + nextRow).setValue(makeFBDescription(event.description));
  
  
  sheet.getRange('D'+ nextRow).setValue(start_time.replace('T',' '));
  
  sheet.getRange('E' + nextRow).setValue(end_time.replace('T',' '));
  sheet.getRange('F' + nextRow).setValue(event.cover.source);
  sheet.getRange('G' + nextRow).setValue('/');
  if (event.place != null){
  sheet.getRange('H' + nextRow).setValue(event.place.name);
     if (event.place.location !=null){
    sheet.getRange('K' + nextRow).setValue(event.place.location.city);
    sheet.getRange('L' + nextRow).setValue(event.place.location.country);
    sheet.getRange('M' + nextRow).setValue(event.place.location.latitude);
    sheet.getRange('N' + nextRow).setValue('166793820034304');
    sheet.getRange('O' + nextRow).setValue(event.place.location.longitude);
    sheet.getRange('P' + nextRow).setValue('Vienna');
    sheet.getRange('Q' + nextRow).setValue(event.place.location.street);
    sheet.getRange('R' + nextRow).setValue(event.place.location.zip);
  }
  }
  
  sheet.getRange('I' + nextRow).setValue('113634312122520');
  sheet.getRange('J' + nextRow).setValue('/');
 
  sheet.getRange('S' + nextRow).setValue('AT');
  sheet.getRange('T' + nextRow).setValue('Europe/Berlin');
  // sheet.getRange('U' + nextRow).setValue(findSection(event.description));
  var existingSection=sheet.getRange('U' + nextRow).getValue();
  if(existingSection !="" && existingSection.indexOf(section) <0){
  sheet.getRange('U' + nextRow).setValue(sheet.getRange('U' + nextRow).getValue() + "," + section);
  }
  if(existingSection == ""){
  sheet.getRange('U' + nextRow).setValue(section);
  }
  sheet.getRange('V' + nextRow).setValue("https://www.facebook.com/events/" + event.id);
  sheet.getRange('W' + nextRow).setValue(start_time.substring(0,10));
  sheet.getRange('X' + nextRow).setValue(start_time.substring(11,19));
  sheet.getRange('Y' + nextRow).setValue(end_time.substring(0,10));
  sheet.getRange('Z' + nextRow).setValue(end_time.substring(11,19));
  sheet.getRange('AA' + nextRow).setValue(event.id);
  
  
}
function makeFBDescription(description)
{
  var finalDescription="";
  
  
  
  
  //return finalDescription;
  return description.toString().replace(/\n/g, "</br>").replace(/(["])/g, "").replace(/\s/g, " ") ;
  
}

function namesSimple(values) {
  return values.toString().split("\n").map(function (r) {
    return r;
  }).filter(String);
}

function checkDuplicates(importedEvent){
  
  var events = getEventObjects();
  
  for (var i = 0; i < events.length; ++i) {
    var event = events[i];
    var fblink='https://www.facebook.com/events/' + importedEvent.id;
    
    if(event.facebookLink ==fblink){
      return 1;
    }
  }
  
  return 0;
}


function checkRemovedEvents(importedEvents,event){
  
  for (var i = 0; i < importedEvents.length; ++i) {
    var importedEvent = importedEvents[i];
    
    var fblink="https://www.facebook.com/events/" + importedEvent.id;
    if(event.facebookLink == fblink){
      return 1;
    }
  }
  return 0;
  
}


function getSectionID(section){
  var name=""
  if(section=="TU"){
    return 'buddynetworktuwien';
  }
  
  if(section=="UW"){
    return 'esn.uniwien';
  }
  
  if(section=='BOKU'){
    return 'esnbokuwien';
  }
  
  if(section=='BFI'){
  return 'ESNBFIVienna';
  }
  
  if(section=='Technikum'){
  return 'esntechnikumwien';
  }
  if(section=="WKW"){
  return 'esn.fhwien';
  }
  return '';
  
  
}