function exportSheetForAllSectionsToJson(){
  exportSheetAsJSON('TU');
  
  
}

function scheduledExportsToJson(){
  exportSheetAsJSON('UW');
  exportSheetAsJSON('TU');
  exportSheetAsJSON('BOKU');
    exportSheetAsJSON('BFI');
    exportSheetAsJSON('Technikum');
  exportSheetAsJSON(null);
  
}

function exportSheetAsJSON(section) 
{
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = ss.getSheetByName('Overview');
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var numCols = rows.getNumColumns();
  var values = rows.getValues();
  var output = "";
  output += "{\"data\" : [\n";
  var header = values[0];
  var made_it=1;
  for (var i = 1; i < numRows; i++) 
  {
    var row = values[i];
    if(row[20].indexOf(section)>-1 || section == null){
      
      if (made_it > 1) output += " , \n";
      
      
      output += " {";
      
      for (var a = 0;a<numCols;a++)
      {
        if (a > 0 && a!=7 && a!= 10) output += " , ";
        if(a!=6 && a!= 9 && a!=5) output += "\""+header[a]+"\" : \""+row[a]+"\"";
        
        if(a==6 || a==9 ) output +="\""+header[a]+"\" : ";
        
        if(a==6) output +="{";
        if(a==5) output +="\""+header[a]+"\" : {\"source\" : \""+row[a]+"\"}";
        
        if(a==9) output +="{";
        
        if(a==18) output +="}}";
      }
      
      output += "}";
      made_it++;
    }
    //Logger.log(row);
  }
  output += "\n]}";
  
  var sheet2 = ss.getSheetByName('Json');
  if (section == null){
    var jsonurl=sheet2.getRange('A77').getValue();
  }
  
  if (section =="UW"){
    var jsonurl=sheet2.getRange('A79').getValue();
  }
  
  if (section =="TU"){
    var jsonurl=sheet2.getRange('A78').getValue();
  }
  
  if (section=='BOKU'){
    var jsonurl=sheet2.getRange('A80').getValue();
  }
    if(section=='WKW'){
  var jsonurl=sheet2.getRange('A83').getValue();
  }
  
  if(section=='BFI'){
    var jsonurl=sheet2.getRange('A81').getValue();
  }
  if(section=='Technikum'){
  var jsonurl=sheet2.getRange('A82').getValue();
  }
  
  
  Logger.log(jsonurl);
  if(jsonurl!='')
  {
    updateJSON(output,jsonurl); 
  }else
  {
    createJSON(output,section)
    
  }
  
  
};


function getId(){
  
  Logger.log(SpreadsheetApp.getActiveSpreadsheet().getId());
  
}


function createJSON(output,section){
  
  
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sheet = ss.getSheetByName('Json');
  var encode =  Utilities.base64Encode('username:password', Utilities.Charset.UTF_8);
  
  
  var option = {
    'payload' : output,
    'method' : 'post',
    'contentType' : 'application/json; charset=utf-8'
  }
  
  var url = "https://api.myjson.com/bins";
  
  var response=UrlFetchApp.fetch(url, option);
  
  
  var url= JSON.parse(response.getContentText());
  
  if (section == null){
    sheet.getRange('A77').setValue(url['uri']);
  }
  if (section == "UW"){
    sheet.getRange('A79').setValue(url['uri']);
  }
  
  if (section == "TU"){
    sheet.getRange('A78').setValue(url['uri']);
  }
  
  if(section=='BOKU'){
    sheet.getRange('A80').setValue(url['uri']);
  }
  
  if(section=='BFI'){
    sheet.getRange('A81').setValue(url['uri']);
  }
  
  if(section=='Technikum'){
    sheet.getRange('A82').setValue(url['uri']);
  }
     if(section=='WKW'){
    sheet.getRange('A83').setValue(url['uri']);
  }
  
}



function updateJSON(output,jsonurl){
  
  var encode =  Utilities.base64Encode('username:password', Utilities.Charset.UTF_8);
  Logger.log(encode);
  
  var option = {
    'payload' : output,
    'method' : 'put',
    'contentType' : 'application/json; charset=utf-8'
  }
  
  //  var url = "https://api.myjson.com/bins/14kcsc";
  Logger.log(output);
  
  Logger.log(   UrlFetchApp.fetch(jsonurl, option));
  
  
  
  
}



function cleanList(){
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Overview');
  
  var start, end;
  start = 2;
  end = sheet.getLastRow();//Number of last row with content
  //blank rows after last row with content will not be deleted
  if (end > 1){
    sheet.deleteRows(start, end);
  }
}