var $ = window.$
var console = window.console
var pangea = window.pangea
var WebSocket = window.WebSocket

pangea.API = new Object()

pangea.API.seats = function(seatArray){
  for (var i=0; i < pangea.seats.length; i++) {
      var originalSeat = pangea.seats[i]
      var originalSeatNumber = originalSeat['seat']
      var originalCards = originalSeat['playercards']
      var originalBet = originalSeat['bet']

      var matched = false
      for (var j=0; j < seatArray.length; j++) {
          var newSeat = seatArray[j]
          var newCards = newSeat['playercards']
          var newBet = newSeat['bet']

          if (newSeat && newSeat['seat'] == originalSeatNumber) {
            if ((originalCards != null && originalCards.length > 0) && (newCards == null || newCards.length == 0)) {
              originalSeat.returnCards()
            }

            //if ( (originalBet != null && originalBet > 0) && (newBet == null || newBet == 0)) {
            //  originalSeat.chipsToPot()
            //}

            originalSeat.update(newSeat)
            matched = true
            break;
          }
      }

      // If the seat is not in the list, assume that person has left the table
      if (!matched) {
          originalSeat.action = ""
          originalSeat.empty = 1
          originalSeat.returnCards()
      }
  }

  pangea.update()
}

pangea.API.player = function(playerArray){
  for (var param in playerArray){
    if (pangea.player.hasOwnProperty(param)){
      pangea.player[param] = playerArray[param]
    } else {
      console.log("Property not found ", param)
    }
  }
  pangea.update()
}

pangea.API.game = function(gameArray){
  for (var param in gameArray){
    if (pangea.game.hasOwnProperty(param)){
      pangea.game[param] = gameArray[param]
    } else {
      console.log("Property not found ", param)
    }
  }
  pangea.update()
}

pangea.API.error = function(error_data) {
    console.log("Error: " + error_data)
    if (error_data.hasOwnProperty("error_message"))
        window.alert("Error: " + error_data.error_message)
}

pangea.API.deal = function(message){
  function dealer(new_dealer){
    pangea.dealer = new_dealer
    pangea.update()
  }

  function holecards(new_cards){
    for (var seat in pangea.seats){
      // pangea.seats[seat].playercards = null
      pangea.player.holecards = new_cards
      if (seat == pangea.player.seat){
        pangea.seats[seat].playercards = pangea.player.holecards
      }
    }
    is_holecards = true
  }

  function boardcards(new_card){
    for (var i=0; i < 5; i++) {
      var existingCard = pangea.boardcards[i]
      var newData = new_card[i]

      if (existingCard.card == null && newData != null) {
        existingCard.card = newData
        updatedBoard = true
      } else if (existingCard.card != null && newData == null) {
        //existingCard.card = null
        existingCard.returnCard()
        updatedBoard = true
      }
    }
  }

  var is_holecards = false
  var newholecards = []
  var updatedBoard = false
  var handlers = {'holecards':holecards, 'dealer':dealer, 'board':boardcards}

  for (var key in message){
    console.log("key: " + key)
    if (message.hasOwnProperty(key)){
      var handler = handlers[key]
      handler(message[key])
    }
  }
  if (is_holecards) {
      pangea.gui.dealcards()
  }

  pangea.update()
}

pangea.API.action = function(actionArray){
  var handlers = {'chipsToPot':pangea.gui.chipsToPot, 'chipsToPlayer':pangea.gui.chipsToPlayer}
  // var single_player = [pangea.gui.chipsToPlayer]
  // ** Refactor: Don't think I should use 'in' here... is actionArray an array or object?
  // Since `in` seems to work, I think it is actually an object
  // Right, so using `in` is fine, but the parameter shouldn't have 'array' in it's name that is
  // stupid
  for (var action in actionArray){
    console.log(action)
    if (actionArray.hasOwnProperty(action)){
      if (action == 'chipsToPot'){(pangea.gui.chipsToPot())}
      if (action == 'chipsToPlayer'){
        pangea.gui.chipsToPlayer(actionArray[action][0])
      }
      if (action == 'returnPlayerCards'){
        var thisseat = parseInt(actionArray[action][0])
        console.log(thisseat)
        pangea.seats[thisseat].returnCards()
      }
      if (action == 'returnCards'){
        pangea.gui.returnCards()
      }
    }
  }
  return true
}

pangea.API.checkAutoControls = function(){
  if (pangea.game.myturn == 1){
    var foldClicked = $('#checkbox1').prop('checked')
    if (foldClicked){
      pangea.sendMessage({'action':{'fold':'1'}})
    }
  }
}

pangea.API.chat = function(messages){
  var chatbox = $('#chatbox')
  for (var i=0; i< messages.length; i++) {
    chatbox.append(messages[i])
    chatbox.append('<br>')
  }
}