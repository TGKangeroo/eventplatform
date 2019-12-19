function Event ()   {
  this.calendarId="";
  this.picture = "";
  this.title = "";
  this.facebookLink = "";
  this.startTime = "";
  this.startDate = "";
  this.endTime = "";
  this.endDate = "";
  this.locationStreet = "Universitatsring 1";
  this.locationName = "";
  this.locationCity = "Wien";
  this.locationCountry="Austria";
  this.locationZip="1010";
  this.description="";
  this.section="ESN Vienna";
  this.type="";
  this.fullStart="";
  this.fullEnd="";
  this.id="";
  
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
function getLastDataRow(sheet) {
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange("B" + lastRow);
  if (range.getValue() !== "") {
    return lastRow;
  } else {
    return range.getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
  }              
}

//value = facebook url
function getEventRow(value){

  var ss = SpreadsheetApp.getActiveSpreadsheet();
   var sheet = ss.getSheetByName('Overview');
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();

  for (var i = 0; i < values.length; i++) {
    var row = "";
    for (var j = 0; j < values[i].length; j++) {     
      if (values[i][j] == value) {
        row = values[i][j+1];
        return i+1;
      }
    }    
  }  


}

function retrieveEvent(array){
  var event = new Event();
  event.title = array[1];
  event.description = array[2];
  event.fullStart=array[3];
  event.fullEnd=array[4];
  event.picture = array[5];
  event.locationName = getTextFromHtml(array[7]);
  event.locationStreet = getTextFromHtml(array[16]);
  event.section= array[20];
  event.facebookLink = array[21];
  event.startDate = Utilities.formatDate(new Date(array[22]), "Europe/Vienna", "dd/MM/yyyy");
  event.startTime= Utilities.formatDate(new Date(array[23]), "Europe/Vienna", "HH:mm");
  event.endDate = Utilities.formatDate(new Date(array[24]), "Europe/Vienna", "dd/MM/yyyy");
  event.endTime = Utilities.formatDate(new Date(array[25]), "Europe/Vienna", "HH:mm");
  event.id = array[26];
  event.type= findType(event.description);
  event.calendarId=array[0];
  return event;
  
}
function getEvents(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = ss.getSheetByName('Overview');
  var rows = sheet.getDataRange();
  var events = rows.getValues();
  
  return events;
}
function getEventObjects(){
  var events = getEvents();
  var convertedArray=[];
  for (var i = 1; i < events.length; ++i) {
    convertedArray.push(retrieveEvent(events[i]));
    
  }
  
  return convertedArray;
}
function getTextFromHtml(html) {
  return getTextFromNode(Xml.parse(html, true).getElement());
}

function getTextFromNode(x) {
  switch(x.toString()) {
    case 'XmlText': return x.toXmlString();
    case 'XmlElement': return x.getNodes().map(getTextFromNode).join('');
    default: return '';
  }
}

function findType(description){
  var type=""
  if(description.indexOf('#party') >= 0){
    type="party";
  }
  if(description.indexOf('#cultural') >= 0){
    type="cultural";
  }
  if(description.indexOf('#trip') > -1){
    type="trip";
  }
  if(description.indexOf('#chill') > -1){
    type="chill";
  }
  if(description.indexOf('#sport') > -1){
    type="sport";
  }
  
  
  return type;
}

function findSection(description){
  var section=""
  if(description.indexOf('#tu') >= 0){
    section="TU";
  }
  if(description.indexOf('#uw') >= 0){
    section="UW";
  }
  if(description.indexOf('#technikum') > -1){
    section="technikum";
  }
  if(description.indexOf('#boku') > -1){
    section="BOKU";
  }
  if(description.indexOf('#bfi') > -1){
    section="BFI";
  }
  if(description.indexOf('#esnvienna') >-1){
    section="esnvienna";
  }
  
  
  return section;
}

function getFullName(section){
  var name=""
  if(section=="TU"){
    name="ESN Buddynetwork TU Wien";
  }
  if(section=="UW"){
    name="ESN Uni Wien";
  }
  if(section=="technikum"){
    name="ESN Technikum Wien";
  }
  if(section=="BOKU"){
    name="ESN BOKU Wien";
  }
  if(section=="BFI"){
    name="ESN BFI Wien";
  }
  if(section=="esnvienna"){
    name="ESN Vienna";
  }
  
  
  return name;
  
}

function cleanOutdatedEvents(){
  
  var events = getEventObjects();
  for (var i = 1; i < events.length; i++) {
    var event = events[i];

    if(event.endDate!=null && event.endDate < Utilities.formatDate(new Date(), "Europe/Vienna", "dd/MM/yyyy") ){
  
  var row = getEventRow("https://www.facebook.com/events/" + event.id);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
   var sheet = ss.getSheetByName('Overview');
      Logger.log(row);
      sheet.deleteRow(row);
    
    }
    
    
}
}