var token = TELEGRAM_TOKEN;
var telegramUrl ='https://api.telegram.org/bot' + token;
function doPost(e) {
  // Make sure to only reply to json requests
  if(e.postData.type == "application/json") {
    
    // Parse the update sent from Telegram
    var update = JSON.parse(e.postData.contents);
    
    // Instantiate our bot passing the update 
    var bot = new Bot(token, update);
    
    // Building commands
    var bus = new CommandBus();
    bus.on(/\/start/, function () {
      this.replyToSender("Congratulations! It works!");
    });
    
    bus.on(/next\s*([\s\S]*)?event/,  botSearchTypeEvents);
    
    bus.on(/next\s*([\s\S]*)?happening/, botSearchEvent);
    
    bus.on(/joke\s*([A-Za-z0-9_]+)?\s*([A-Za-z0-9_]+)?/, randomJoke);
    
    bus.on(/week/,botSendWeekEvents);
    
    bus.on(/today/,botSendTodayEvents);
    
    bus.on(/ask/,whatCanYouAskMe);
    
    // Register the command bus
    bot.register(bus);
    
    // If the update is valid, process it
    if (update) {
      bot.process();
    }   
  }      
}

function setWebhook() {
  var bot = new Bot(token, {});
  var result = bot.request('setWebhook', {
    url: ScriptApp.getService().getUrl()
  });
  
  Logger.log(result);
}

function randomJoke(name, surname) {
  var firstName = name || null;
  var lastName = surname || null;
  
  var url = 'http://api.icndb.com/jokes/random?escape=javascript';
  
  if (firstName) url += '&firstName=' + firstName;
  if (lastName) url += '&lastName=' + lastName;
  
  var data = JSON.parse(UrlFetchApp.fetch(url).getContentText());
  
  this.replyToSender(data.value.joke);
}

function sendText(text) {
  
  var payload = {
    'method': 'sendMessage',
    'chat_id': TELEGRAM_CHAT_ID,
    'text': text,
    'parse_mode': 'HTML'
  }
  
  var data = {
    "method": "post",
    "payload": payload
  }
  var response = UrlFetchApp.fetch(telegramUrl + "/",data );
  Logger.log(response.getContentText());
}

function Bot (token, update) {
  this.token = token;
  this.update = update;
  this.handlers = [];
}

Bot.prototype.register = function ( handler) {
  this.handlers.push(handler);
}

Bot.prototype.process = function () {  
  for (var i in this.handlers) {
    var event = this.handlers[i];
    var result = event.condition(this);
    if (result) {
      return event.handle(this);
    }
  }
}

Bot.prototype.request = function (method, data) {
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  
  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + this.token + '/' + method, options);
  
  if (response.getResponseCode() == 200) {
    return JSON.parse(response.getContentText());
  }
  
  return false;
}

Bot.prototype.replyToSender = function (text) {
  return this.request('sendMessage', {
    'chat_id': this.update.message.from.id,
    'text': text,
    'parse_mode': 'HTML'
  });
}

function CommandBus() {
  this.commands = [];
}

CommandBus.prototype.on = function (regexp, callback) {
  this.commands.push({'regexp': regexp, 'callback': callback});
}

CommandBus.prototype.condition = function (bot) {
  return bot.update.message.text.charAt(0) === '/';
}

CommandBus.prototype.handle = function (bot) {  
  for (var i in this.commands) {
    var cmd = this.commands[i];
    var tokens = cmd.regexp.exec(bot.update.message.text);
    if (tokens != null) {
      return cmd.callback.apply(bot, tokens.splice(1));
    }
  }
  return bot.replyToSender("Invalid command");
}


/*-------------------------------------------------*/
function botSendWeekEvents(){
  var text=eventsThisWeek();
  this.replyToSender(text);
}

function botSendTodayEvents(){
  var text=eventsToday();
  if(text==""){
    text="Unfortunately there are no events today, to check out when our next event will be, please check out our website: https://esnvienna.com/events";
  }
  
  this.replyToSender(text);
}

function whatCanYouAskMe(){
  var full_text="You can ask me the following questions: \n";
  full_text+="Are there any events this week? \n";
  full_text+="Are there any events today? \n";
  full_text+="When is the next *event name* happening? \n";
  full_text+="When is the next *party/chill/cultural/trip/sport* event? \n";
  full_text+="\n Don't forget to always put a / before asking any question!";
  
  this.replyToSender(full_text);
  
}

function botSearchEvent(para) {
  var para = para || null;
  var full_text="";
  var events=getEventObjects();
  
  for (var i = 0; i < events.length; ++i) {
    var event= events[i];
    if(event.title.toLowerCase().indexOf(para.toLowerCase()) >=0){
      full_text+=generalEventMessage(event) + "\n";
    }
    
  }
  
  if(full_text =="" || para == null){
    full_text="Unfortunately I couldn't find any similar events, to keep yourself up to date, please check out our website: https://esnvienna.com/events";
    
  }else{
    
    full_text="I found the following: \n \n" + full_text;
  }
  
  this.replyToSender(full_text);
}

function botSearchTypeEvents(para){
  var para = para || null;
  var full_text="";
  var events=getEventObjects();
  
  for (var i = 0; i < events.length; ++i) {
    var event= events[i];
    if(para.toLowerCase().indexOf(event.type.toLowerCase()) >-1){
      full_text+=generalEventMessage(event) + "\n";
    }
    
  }
  
  if(full_text =="" || para == null){
    full_text="Unfortunately I couldn't find any similar events, to keep yourself up to date, please check out our website: https://esnvienna.com/events";
    
  }else{
    
    full_text="I found the following: \n \n" + full_text;
  }
  
  
  
  this.replyToSender(full_text);
}